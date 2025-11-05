from flask import Blueprint, current_app, jsonify


analytics_bp = Blueprint("analytics", __name__)


def _repo():
	"""Get the repository instance from app context"""
	return current_app.extensions.get("repository")


@analytics_bp.get("/analytics/dashboard")
def dashboard():
	cache = current_app.extensions.get("cache")
	if cache:
		cached = cache.get("analytics:dashboard")
		if cached:
			return jsonify(cached), 200
	data = _repo().get_analytics_dashboard()
	if cache:
		cache.set("analytics:dashboard", data, timeout=60)
	return jsonify(data), 200


