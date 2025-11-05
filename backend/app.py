import os
from flask import Flask, jsonify

from .config import AppConfig
from .routes.users import users_bp
from .routes.quiz import quiz_bp
from .routes.ai import ai_bp
from .routes.progress import progress_bp
from .routes.analytics import analytics_bp
from flask_cors import CORS


def create_app() -> Flask:
	app = Flask(__name__)
	app.config.from_object(AppConfig)
	CORS(app, resources={r"/api/*": {"origins": os.getenv("CORS_ORIGINS", "*")}})

	# Cache setup (simple in-memory)
	from flask_caching import Cache
	cache = Cache(config={"CACHE_TYPE": "SimpleCache", "CACHE_DEFAULT_TIMEOUT": 60})
	cache.init_app(app)
	app.extensions["cache"] = cache

	# Initialize repository singleton for in-memory mode
	# Store it on app instance so it persists across requests
	if app.config.get("USE_IN_MEMORY_DB") or not (app.config.get("SUPABASE_URL") and app.config.get("SUPABASE_ANON_KEY")):
		from .repositories.memory_repository import InMemoryRepository
		app.extensions["repository"] = InMemoryRepository()
	else:
		from .repositories.supabase_repository import SupabaseRepository
		app.extensions["repository"] = SupabaseRepository(
			app.config["SUPABASE_URL"],
			app.config["SUPABASE_ANON_KEY"]
		)

	# Health endpoint
	@app.get("/health")
	def health() -> tuple:
		return jsonify({"status": "ok", "version": os.getenv("APP_VERSION", "0.1.0")}), 200

	# Register blueprints
	app.register_blueprint(users_bp, url_prefix="/api/users")
	app.register_blueprint(quiz_bp, url_prefix="/api")
	app.register_blueprint(ai_bp, url_prefix="/api/ai")
	app.register_blueprint(progress_bp, url_prefix="/api")
	app.register_blueprint(analytics_bp, url_prefix="/api")

	# Error handlers
	@app.errorhandler(400)
	def bad_request(error):
		return jsonify({"error": "bad_request", "message": str(error)}), 400

	@app.errorhandler(404)
	def not_found(error):
		return jsonify({"error": "not_found", "message": "Resource not found"}), 404

	@app.errorhandler(500)
	def server_error(error):
		return jsonify({"error": "server_error", "message": "An unexpected error occurred"}), 500

	return app


app = create_app()


