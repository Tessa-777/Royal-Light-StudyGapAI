from flask import Blueprint, current_app, jsonify, request

from ..services.ai import AIService
from ..services.study_plan import build_adjusted_plan
from ..utils.validation import require_fields


ai_bp = Blueprint("ai", __name__)


def _repo():
	"""Get the repository instance from app context"""
	return current_app.extensions.get("repository")


def _ai():
	cfg = current_app.config
	return AIService(cfg.get("GOOGLE_API_KEY"), cfg.get("AI_MODEL_NAME", "gemini-2.0-flash-exp"), cfg.get("AI_MOCK", True))


@ai_bp.post("/analyze-diagnostic")
def analyze_diagnostic():
	data = request.get_json(force=True) or {}
	ok, missing = require_fields(data, ["userId", "quizId", "responses"])
	if not ok:
		return jsonify({"error": "missing_fields", "fields": missing}), 400
	analysis = _ai().analyze_diagnostic(data["responses"])
	stored = _repo().save_ai_diagnostic({
		"quiz_id": data["quizId"],
		"weak_topics": analysis.get("weakTopics"),
		"strong_topics": analysis.get("strongTopics"),
		"analysis_summary": analysis.get("analysisSummary"),
		"projected_score": analysis.get("projectedScore"),
		"foundational_gaps": analysis.get("foundationalGaps"),
	})
	return jsonify(stored | {"analysis": analysis}), 200


@ai_bp.post("/generate-study-plan")
def generate_study_plan():
	data = request.get_json(force=True) or {}
	ok, missing = require_fields(data, ["userId", "diagnosticId", "weakTopics", "targetScore"])
	if not ok:
		return jsonify({"error": "missing_fields", "fields": missing}), 400
	plan = _ai().generate_study_plan(data["weakTopics"], int(data["targetScore"]), int(data.get("currentScore", 150)))
	stored = _repo().create_study_plan({
		"user_id": data["userId"],
		"diagnostic_id": data["diagnosticId"],
		"plan_data": plan,
	})
	return jsonify(stored), 201


@ai_bp.post("/explain-answer")
def explain_answer():
	data = request.get_json(force=True) or {}
	ok, missing = require_fields(data, ["questionId", "studentAnswer", "correctAnswer", "studentReasoning"])
	if not ok:
		return jsonify({"error": "missing_fields", "fields": missing}), 400
	explanation = _ai().explain_answer({
		"questionId": data["questionId"],
		"studentAnswer": data["studentAnswer"],
		"correctAnswer": data["correctAnswer"],
		"studentReasoning": data["studentReasoning"],
	})
	return jsonify(explanation), 200


@ai_bp.post("/adjust-plan")
def adjust_plan():
	data = request.get_json(force=True) or {}
	ok, missing = require_fields(data, ["userId", "studyPlanId", "completedTopics", "newWeakTopics"])
	if not ok:
		return jsonify({"error": "missing_fields", "fields": missing}), 400
	repo = _repo()
	# For in-memory repo, check if plan exists
	if hasattr(repo, "study_plans"):
		existing = repo.study_plans.get(data["studyPlanId"])
		if not existing:
			return jsonify({"error": "not_found", "message": "Study plan not found"}), 404
		updated_data = build_adjusted_plan(existing.get("plan_data", {}), data["completedTopics"], data["newWeakTopics"])
		updated = repo.update_study_plan(data["studyPlanId"], updated_data)
		return jsonify({"updatedPlan": updated}), 200
	else:
		# For Supabase, we'd need to fetch first - simplified for now
		return jsonify({"error": "not_implemented", "message": "Adjust plan requires fetching existing plan first"}), 501


