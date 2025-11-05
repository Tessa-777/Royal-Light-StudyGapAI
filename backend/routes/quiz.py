from flask import Blueprint, current_app, jsonify, request

from ..utils.validation import require_fields
from ..utils.validate import validate_json
from ..utils.schemas import StartQuizRequest, SubmitQuizRequest


quiz_bp = Blueprint("quiz", __name__)


def _repo():
	"""Get the repository instance from app context"""
	return current_app.extensions.get("repository")


@quiz_bp.get("/questions")
def get_questions():
	cache = current_app.extensions.get("cache")
	key = f"questions:{int(request.args.get('total', 30))}"
	if cache:
		cached = cache.get(key)
		if cached:
			return jsonify(cached), 200
	questions = _repo().get_diagnostic_questions(total=int(request.args.get("total", 30)))
	if cache:
		cache.set(key, questions, timeout=120)
	return jsonify(questions), 200


@quiz_bp.post("/quiz/start")
@validate_json(StartQuizRequest)
def start_quiz():
	data = request.get_json(force=True) or {}
	ok, missing = require_fields(data, ["userId"])
	if not ok:
		return jsonify({"error": "missing_fields", "fields": missing}), 400
	quiz = _repo().create_quiz({"user_id": data["userId"], "total_questions": int(data.get("totalQuestions", 30))})
	return jsonify(quiz), 201


@quiz_bp.post("/quiz/<quiz_id>/submit")
@validate_json(SubmitQuizRequest)
def submit_quiz(quiz_id: str):
	data = request.get_json(force=True) or {}
	ok, missing = require_fields(data, ["responses"])
	if not ok:
		return jsonify({"error": "missing_fields", "fields": missing}), 400
	repo = _repo()
	try:
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


@quiz_bp.get("/quiz/<quiz_id>/results")
def quiz_results(quiz_id: str):
	repo = _repo()
	cache = current_app.extensions.get("cache")
	key = f"quiz_results:{quiz_id}"
	if cache:
		cached = cache.get(key)
		if cached:
			return jsonify(cached), 200
	try:
		results = repo.get_quiz_results(quiz_id)
		if cache:
			cache.set(key, results, timeout=120)
		return jsonify(results), 200
	except KeyError:
		return jsonify({"error": "not_found", "message": "Quiz not found"}), 404
	except Exception as e:
		return jsonify({"error": "server_error", "message": str(e)}), 500


