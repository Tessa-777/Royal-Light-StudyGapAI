from flask import Blueprint, current_app, jsonify, request

from ..utils.validation import require_fields


progress_bp = Blueprint("progress", __name__)


def _repo():
	"""Get the repository instance from app context"""
	return current_app.extensions.get("repository")


@progress_bp.get("/users/<user_id>/progress")
def get_progress(user_id: str):
	items = _repo().get_user_progress(user_id)
	return jsonify(items), 200


@progress_bp.post("/progress/mark-complete")
def mark_complete():
	data = request.get_json(force=True) or {}
	ok, missing = require_fields(data, ["userId", "topicId", "status"])
	if not ok:
		return jsonify({"error": "missing_fields", "fields": missing}), 400
	entry = _repo().mark_progress_complete({
		"user_id": data["userId"],
		"topic_id": data["topicId"],
		"status": data.get("status", "completed"),
		"resources_viewed": int(data.get("resourcesViewed", 0)),
		"practice_problems_completed": int(data.get("practiceProblemsCompleted", 0)),
	})
	return jsonify(entry), 201


