from flask import Blueprint, current_app, jsonify, request

from ..utils.validation import require_fields
from ..utils.validate import validate_json
from ..utils.schemas import RegisterRequest, LoginRequest, UpdateTargetScoreRequest
from ..utils.auth import require_auth, get_current_user_id, optional_auth


users_bp = Blueprint("users", __name__)


def _repo():
	"""Get the repository instance from app context"""
	return current_app.extensions.get("repository")


@users_bp.post("/register")
@validate_json(RegisterRequest)
def register():
	"""
	User registration endpoint
	Note: With Supabase Auth, registration happens on frontend via Auth SDK
	This endpoint can sync user data to our users table after Auth registration
	"""
	data = request.get_json(force=True) or {}
	ok, missing = require_fields(data, ["email", "name"])
	if not ok:
		return jsonify({"error": "missing_fields", "fields": missing}), 400
	
	# Get user_id from JWT if authenticated, otherwise from request
	user_id = get_current_user_id() or data.get("userId")
	
	if user_id:
		# User is authenticated - sync to users table
		user = _repo().upsert_user({
			"id": user_id,
			"email": data["email"],
			"name": data["name"],
			"phone": data.get("phone")
		})
	else:
		# Fallback: create user without auth (for backward compatibility)
		user = _repo().upsert_user({
			"email": data["email"],
			"name": data["name"],
			"phone": data.get("phone")
		})
	return jsonify(user), 201


@users_bp.post("/login")
@optional_auth
def login(current_user_id=None):
	"""
	Login endpoint
	Note: With Supabase Auth, login happens on frontend via Auth SDK
	This endpoint returns user info if authenticated, or allows email-based lookup
	"""
	if current_user_id:
		# User is authenticated via JWT - return their info
		user = _repo().get_user(current_user_id)
		if user:
			return jsonify({"user": user, "authenticated": True}), 200
	
	# Fallback: email-based lookup (for backward compatibility)
	data = request.get_json(force=True) or {}
	ok, missing = require_fields(data, ["email"])
	if not ok:
		return jsonify({"error": "missing_fields", "fields": missing}), 400
	
	user = _repo().get_user_by_email(data["email"]) or _repo().upsert_user({
		"email": data["email"],
		"name": data.get("name", "Student")
	})
	return jsonify({"user": user, "authenticated": False, "message": "Use Supabase Auth for full authentication"}), 200


@users_bp.get("/me")
@require_auth
def get_current_user(current_user_id):
	"""
	Get current authenticated user's profile with latest quiz/diagnostic info
	
	Includes:
	- User profile data
	- latest_quiz_id: ID of user's most recent quiz (if exists)
	- latest_diagnostic_id: ID of user's most recent diagnostic (if exists)
	- has_diagnostic: Boolean indicating if user has any diagnostics
	"""
	repo = _repo()
	user = repo.get_user(current_user_id)
	if not user:
		# User authenticated via JWT but doesn't exist in users table yet
		# Auto-create a basic user record
		user = repo.upsert_user({
			"id": current_user_id,
			"email": f"user_{current_user_id[:8]}@example.com",  # Placeholder email
			"name": "Student"
		})
	
	# Get user's latest quiz and diagnostic
	try:
		current_app.logger.info(f"Getting latest quiz for user {current_user_id}")
		latest_quiz = repo.get_user_latest_quiz(current_user_id)
		if latest_quiz:
			quiz_id = latest_quiz.get("quiz_id")
			diagnostic_id = latest_quiz.get("diagnostic_id")
			has_diagnostic = latest_quiz.get("has_diagnostic", False)
			current_app.logger.info(f"User {current_user_id} latest quiz: quiz_id={quiz_id}, diagnostic_id={diagnostic_id}, has_diagnostic={has_diagnostic}")
			user["latest_quiz_id"] = quiz_id
			user["latest_diagnostic_id"] = diagnostic_id
			user["has_diagnostic"] = has_diagnostic
		else:
			current_app.logger.info(f"User {current_user_id} has no quizzes")
			user["latest_quiz_id"] = None
			user["latest_diagnostic_id"] = None
			user["has_diagnostic"] = False
	except Exception as e:
		# If there's an error getting latest quiz, just set defaults
		current_app.logger.error(f"Error getting latest quiz for user {current_user_id}: {str(e)}", exc_info=True)
		user["latest_quiz_id"] = None
		user["latest_diagnostic_id"] = None
		user["has_diagnostic"] = False
	
	return jsonify(user), 200


@users_bp.get("/me/diagnostics/latest")
@require_auth
def get_latest_diagnostic(current_user_id):
	"""
	Get user's latest diagnostic results.
	
	Returns the complete diagnostic data including:
	- Overall performance
	- Topic breakdown
	- Root cause analysis
	- Predicted JAMB score
	- Study plan
	- Recommendations
	"""
	repo = _repo()
	
	# Get user's latest quiz and diagnostic
	try:
		latest_quiz_info = repo.get_user_latest_quiz(current_user_id)
		if not latest_quiz_info or not latest_quiz_info.get("has_diagnostic"):
			return jsonify({
				"error": "not_found",
				"message": "No diagnostic found for this user"
			}), 404
		
		quiz_id = latest_quiz_info.get("quiz_id")
		if not quiz_id:
			return jsonify({
				"error": "not_found",
				"message": "No quiz found for this user"
			}), 404
		
		# Get quiz results (includes diagnostic)
		results = repo.get_quiz_results(quiz_id)
		if not results:
			return jsonify({
				"error": "not_found",
				"message": "Quiz results not found"
			}), 404
		
		# Verify ownership
		quiz_user_id = results.get("quiz", {}).get("user_id")
		if quiz_user_id != current_user_id:
			return jsonify({
				"error": "forbidden",
				"message": "Access denied"
			}), 403
		
		# Return diagnostic data
		diagnostic = results.get("diagnostic")
		if not diagnostic:
			return jsonify({
				"error": "not_found",
				"message": "Diagnostic not found for this quiz"
			}), 404
		
		# Ensure all required fields exist
		if "overall_performance" not in diagnostic or diagnostic.get("overall_performance") is None:
			diagnostic["overall_performance"] = {}
		if "topic_breakdown" not in diagnostic or diagnostic.get("topic_breakdown") is None:
			diagnostic["topic_breakdown"] = []
		if "root_cause_analysis" not in diagnostic or diagnostic.get("root_cause_analysis") is None:
			diagnostic["root_cause_analysis"] = {}
		if "predicted_jamb_score" not in diagnostic or diagnostic.get("predicted_jamb_score") is None:
			diagnostic["predicted_jamb_score"] = {}
		if "study_plan" not in diagnostic or diagnostic.get("study_plan") is None:
			diagnostic["study_plan"] = {}
		if "recommendations" not in diagnostic or diagnostic.get("recommendations") is None:
			diagnostic["recommendations"] = []
		
		# Add quiz_id to response for frontend convenience
		response_data = {
			**diagnostic,
			"quiz_id": quiz_id,
			"diagnostic_id": latest_quiz_info.get("diagnostic_id")
		}
		
		return jsonify(response_data), 200
	except Exception as e:
		current_app.logger.error(f"Error getting latest diagnostic for user {current_user_id}: {str(e)}", exc_info=True)
		return jsonify({
			"error": "server_error",
			"message": f"Failed to get diagnostic: {str(e)}"
		}), 500


@users_bp.get("/<user_id>")
@optional_auth
def get_user(user_id: str, current_user_id=None):
	"""Get user by ID - requires auth if accessing other users"""
	# Allow users to read their own profile, or if no auth provided (backward compat)
	if current_user_id and user_id != current_user_id:
		return jsonify({"error": "forbidden", "message": "Cannot access other users' profiles"}), 403
	
	user = _repo().get_user(user_id)
	if not user:
		return jsonify({"error": "not_found"}), 404
	return jsonify(user), 200


@users_bp.put("/target-score")
@require_auth
def update_target(current_user_id):
	"""Update current user's target score"""
	data = request.get_json(force=True) or {}
	ok, missing = require_fields(data, ["targetScore"])
	if not ok:
		return jsonify({"error": "missing_fields", "fields": missing}), 400
	
	repo = _repo()
	try:
		user = repo.update_user_target_score(current_user_id, int(data["targetScore"]))
		return jsonify(user), 200
	except KeyError:
		return jsonify({"error": "not_found", "message": "User not found"}), 404
	except Exception as e:
		return jsonify({"error": "server_error", "message": str(e)}), 500


# Legacy endpoint for backward compatibility
@users_bp.put("/<user_id>/target-score")
@optional_auth
def update_target_legacy(user_id: str, current_user_id=None):
	"""Legacy endpoint - use /target-score instead"""
	# Validate ownership if authenticated
	if current_user_id and user_id != current_user_id:
		return jsonify({"error": "forbidden", "message": "Cannot update other users' target score"}), 403
	
	data = request.get_json(force=True) or {}
	ok, missing = require_fields(data, ["targetScore"])
	if not ok:
		return jsonify({"error": "missing_fields", "fields": missing}), 400
	
	repo = _repo()
	try:
		user = repo.update_user_target_score(user_id, int(data["targetScore"]))
		return jsonify(user), 200
	except KeyError:
		return jsonify({"error": "not_found", "message": "User not found"}), 404
	except Exception as e:
		return jsonify({"error": "server_error", "message": str(e)}), 500


