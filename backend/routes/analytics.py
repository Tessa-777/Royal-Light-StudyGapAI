from flask import Blueprint, current_app, jsonify


analytics_bp = Blueprint("analytics", __name__)


def _repo():
	"""Get the repository instance from app context"""
	return current_app.extensions.get("repository")


@analytics_bp.get("/analytics/dashboard")
def dashboard():
	data = _repo().get_analytics_dashboard()
	return jsonify(data), 200


