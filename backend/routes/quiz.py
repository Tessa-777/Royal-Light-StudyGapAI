from flask import Blueprint, current_app, jsonify, request

from ..utils.validation import require_fields
from ..utils.validate import validate_json
from ..utils.schemas import StartQuizRequest, SubmitQuizRequest
from ..utils.auth import require_auth, get_current_user_id


quiz_bp = Blueprint("quiz", __name__)


def _repo():
	"""Get the repository instance from app context"""
	return current_app.extensions.get("repository")


def _cache():
	"""Get cache instance safely"""
	try:
		return current_app.extensions.get("cache_instance")
	except (RuntimeError, AttributeError):
		return None


@quiz_bp.get("/questions")
def get_questions():
	"""Public endpoint - no auth required for questions"""
	cache = _cache()
	key = f"questions:{int(request.args.get('total', 30))}"
	if cache:
		cached = cache.get(key)
		if cached:
			return jsonify(cached), 200
	questions = _repo().get_diagnostic_questions(total=int(request.args.get("total", 30)))
	if cache:
		cache.set(key, questions, timeout=120)
	return jsonify(questions), 200


@quiz_bp.post("/start")
@require_auth
@validate_json(StartQuizRequest)
def start_quiz(current_user_id):
	"""Start a new quiz - requires authentication"""
	data = request.get_json(force=True) or {}
	
	# Ensure user exists in users table (auto-create if needed)
	try:
		# Try to get user from JWT payload
		from ..utils.auth import get_auth
		auth = get_auth()
		if auth:
			auth_header = request.headers.get("Authorization", "")
			user_info = auth.verify_token(auth_header)
			if user_info:
				email = user_info.get("email")
				name = user_info.get("payload", {}).get("user_metadata", {}).get("name", "User")
				
				# Check if user exists, if not create it
				try:
					_repo().get_user(current_user_id)
				except (KeyError, AttributeError):
					# User doesn't exist, create it
					_repo().upsert_user({
						"id": current_user_id,
						"email": email or f"user_{current_user_id}@example.com",
						"name": name
					})
					current_app.logger.info(f"Auto-created user in users table: {current_user_id}")
	except Exception as e:
		current_app.logger.warning(f"Could not auto-create user: {str(e)}")
		# Continue anyway - quiz creation will fail with a clearer error if user doesn't exist
	
	# Use authenticated user_id from JWT, not from request body
	try:
		quiz = _repo().create_quiz({
			"user_id": current_user_id,
			"total_questions": int(data.get("totalQuestions", 30))
		})
		return jsonify(quiz), 201
	except Exception as e:
		current_app.logger.error(f"Error creating quiz: {str(e)}", exc_info=True)
		error_str = str(e)
		if "user_id" in error_str and "not present in table" in error_str:
			return jsonify({
				"error": "user_not_found", 
				"message": "User does not exist in database. Please register first."
			}), 400
		return jsonify({"error": "server_error", "message": f"Failed to create quiz: {str(e)}"}), 500


@quiz_bp.post("/<quiz_id>/submit")
@require_auth
@validate_json(SubmitQuizRequest)
def submit_quiz(quiz_id: str, current_user_id):
	"""Submit quiz responses - requires authentication and validates ownership"""
	data = request.get_json(force=True) or {}
	ok, missing = require_fields(data, ["responses"])
	if not ok:
		return jsonify({"error": "missing_fields", "fields": missing}), 400
	
	repo = _repo()
	try:
		# Verify quiz belongs to current user
		quiz = repo.get_quiz_results(quiz_id)
		if not quiz or quiz.get("quiz", {}).get("user_id") != current_user_id:
			return jsonify({"error": "forbidden", "message": "Quiz not found or access denied"}), 403
		
		responses = []
		for r in data["responses"]:
			responses.append({
				"quiz_id": quiz_id,
				"question_id": r.get("questionId"),
				"student_answer": r.get("studentAnswer"),
				"correct_answer": r.get("correctAnswer"),
				"is_correct": bool(r.get("isCorrect")),
				"explanation_text": r.get("explanationText"),
				"time_spent_seconds": int(r.get("timeSpentSeconds", 0)),
			})
		repo.save_quiz_responses(quiz_id, responses)
		return jsonify({"status": "submitted"}), 200
	except KeyError:
		return jsonify({"error": "not_found", "message": "Quiz not found"}), 404
	except Exception as e:
		return jsonify({"error": "server_error", "message": str(e)}), 500


@quiz_bp.get("/<quiz_id>/results")
@require_auth
def quiz_results(quiz_id: str, current_user_id):
	"""Get quiz results - requires authentication and validates ownership"""
	repo = _repo()
	cache = _cache()
	key = f"quiz_results:{quiz_id}"
	if cache:
		cached = cache.get(key)
		if cached:
			# Verify ownership even for cached results
			if cached.get("quiz", {}).get("user_id") != current_user_id:
				return jsonify({"error": "forbidden", "message": "Access denied"}), 403
			return jsonify(cached), 200
	try:
		results = repo.get_quiz_results(quiz_id)
		# Verify ownership
		if not results or results.get("quiz", {}).get("user_id") != current_user_id:
			return jsonify({"error": "forbidden", "message": "Quiz not found or access denied"}), 403
		
		# Ensure diagnostic has all required fields with proper defaults
		# This is a safety check - the repository should already handle this
		if results.get("diagnostic"):
			diagnostic = results["diagnostic"]
			# Ensure all fields exist, even if empty (check for key existence and None)
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
		
		if cache:
			cache.set(key, results, timeout=120)
		return jsonify(results), 200
	except KeyError:
		return jsonify({"error": "not_found", "message": "Quiz not found"}), 404
	except Exception as e:
		current_app.logger.error(f"Error in quiz_results: {str(e)}", exc_info=True)
		return jsonify({"error": "server_error", "message": str(e)}), 500


