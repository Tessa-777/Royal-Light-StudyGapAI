from flask import Blueprint, current_app, jsonify, request

from ..utils.validation import require_fields
from ..utils.validate import validate_json
from ..utils.schemas import RegisterRequest, LoginRequest, UpdateTargetScoreRequest


users_bp = Blueprint("users", __name__)


def _repo():
	"""Get the repository instance from app context"""
	return current_app.extensions.get("repository")


@users_bp.post("/register")
@validate_json(RegisterRequest)
def register():
	data = request.get_json(force=True) or {}
	ok, missing = require_fields(data, ["email", "name"])
	if not ok:
		return jsonify({"error": "missing_fields", "fields": missing}), 400
	user = _repo().upsert_user({"email": data["email"], "name": data["name"], "phone": data.get("phone")})
	return jsonify(user), 201


@users_bp.post("/login")
@validate_json(LoginRequest)
def login():
	data = request.get_json(force=True) or {}
	ok, missing = require_fields(data, ["email"])
	if not ok:
		return jsonify({"error": "missing_fields", "fields": missing}), 400
	user = _repo().get_user_by_email(data["email"]) or _repo().upsert_user({"email": data["email"], "name": data.get("name", "Student")})
	# Simple session token stub; in real deployment use JWT provider
	return jsonify({"user": user, "token": "dev-token"}), 200


@users_bp.get("/<user_id>")
def get_user(user_id: str):
	user = _repo().get_user(user_id)
	if not user:
		return jsonify({"error": "not_found"}), 404
	return jsonify(user), 200


@users_bp.put("/<user_id>/target-score")
@validate_json(UpdateTargetScoreRequest)
def update_target(user_id: str):
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


