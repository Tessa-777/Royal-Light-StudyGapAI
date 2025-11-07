from flask import Blueprint, current_app, jsonify, request

from ..utils.auth import require_auth


resources_bp = Blueprint("resources", __name__)


def _repo():
	"""Get the repository instance from app context"""
	return current_app.extensions.get("repository")


def _cache():
	"""Get cache instance safely"""
	try:
		return current_app.extensions.get("cache_instance")
	except (RuntimeError, AttributeError):
		return None


@resources_bp.get("/topics")
def get_topics():
	"""
	Get all topics.
	Public endpoint - no auth required.
	
	Query params:
	- subject (optional): Filter by subject (not implemented yet)
	
	Returns:
	- List of topics with id, name, description, jamb_weight, prerequisite_topic_ids
	"""
	cache = _cache()
	cache_key = "topics:all"
	
	if cache:
		cached = cache.get(cache_key)
		if cached:
			return jsonify(cached), 200
	
	subject = request.args.get("subject")
	topics = _repo().get_topics(subject=subject)
	
	if cache:
		# Cache topics for 1 hour (they don't change often)
		cache.set(cache_key, topics, timeout=3600)
	
	return jsonify(topics), 200


@resources_bp.get("/resources")
def get_resources():
	"""
	Get resources, optionally filtered by topic.
	Public endpoint - no auth required.
	
	Query params:
	- topic_id (optional): Filter by topic UUID
	- topic_name (optional): Filter by topic name (e.g., "Algebra")
	
	Returns:
	- List of resources with id, topic_id, type, title, url, source, 
	  duration_minutes, difficulty, upvotes
	"""
	cache = _cache()
	topic_id = request.args.get("topic_id")
	topic_name = request.args.get("topic_name")
	
	# Build cache key
	if topic_id:
		cache_key = f"resources:topic_id:{topic_id}"
	elif topic_name:
		cache_key = f"resources:topic_name:{topic_name}"
	else:
		cache_key = "resources:all"
	
	if cache:
		cached = cache.get(cache_key)
		if cached:
			return jsonify(cached), 200
	
	resources = _repo().get_resources(topic_id=topic_id, topic_name=topic_name)
	
	if cache:
		# Cache resources for 30 minutes
		cache.set(cache_key, resources, timeout=1800)
	
	return jsonify(resources), 200

