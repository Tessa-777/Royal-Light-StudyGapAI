import json
import os

os.environ["USE_IN_MEMORY_DB"] = "true"
os.environ["AI_MOCK"] = "true"

from backend.app import create_app


def make_client():
	app = create_app()
	app.config.update(TESTING=True)
	return app.test_client()


def test_health():
	client = make_client()
	rv = client.get("/health")
	assert rv.status_code == 200
	assert rv.get_json()["status"] == "ok"


def test_user_register_and_login():
	client = make_client()
	reg = client.post("/api/users/register", json={"email": "s@example.com", "name": "Sam"})
	assert reg.status_code == 201
	user = reg.get_json()
	assert user["email"] == "s@example.com"
	login = client.post("/api/users/login", json={"email": "s@example.com"})
	assert login.status_code == 200
	data = login.get_json()
	assert data["user"]["email"] == "s@example.com"


def test_questions_and_quiz_flow():
	client = make_client()
	# get questions
	q = client.get("/api/questions?total=5")
	assert q.status_code == 200
	questions = q.get_json()
	assert len(questions) == 5
	# start quiz
	s_quiz = client.post("/api/quiz/start", json={"userId": "user-1", "totalQuestions": 5})
	assert s_quiz.status_code == 201
	quiz = s_quiz.get_json()
	quiz_id = quiz["id"]
	# submit quiz
	responses = []
	for i, item in enumerate(questions):
		responses.append({
			"questionId": item["id"],
			"studentAnswer": "C",
			"correctAnswer": "C",
			"isCorrect": True,
			"explanationText": "",
			"timeSpentSeconds": 5,
		})
	sub = client.post(f"/api/quiz/{quiz_id}/submit", json={"responses": responses})
	assert sub.status_code == 200
	res = client.get(f"/api/quiz/{quiz_id}/results")
	assert res.status_code == 200
	data = res.get_json()
	assert data["quiz"]["correct_answers"] == 5
	# responses should include id field per schema
	assert all("id" in r for r in data["responses"])


def test_ai_endpoints():
	client = make_client()
	responses = [{"questionId": "q1", "studentAnswer": "B", "correctAnswer": "C", "isCorrect": False, "explanationText": ""}]
	an = client.post("/api/ai/analyze-diagnostic", json={"userId": "u1", "quizId": "qz1", "responses": responses})
	assert an.status_code == 200
	analysis = an.get_json()
	assert "weakTopics" in analysis
	plan = client.post("/api/ai/generate-study-plan", json={"userId": "u1", "diagnosticId": "diag-1", "weakTopics": analysis["weakTopics"], "targetScore": 250, "weeksAvailable": 4})
	assert plan.status_code == 201
	study_plan = plan.get_json()
	assert "plan_data" in study_plan
	assert len(study_plan["plan_data"]["weeks"]) == 4
	# explain answer
	exp = client.post("/api/ai/explain-answer", json={"questionId": "q1", "studentAnswer": "B", "correctAnswer": "C", "studentReasoning": "I thought..."})
	assert exp.status_code == 200


def test_progress_and_analytics():
	client = make_client()
	mark = client.post("/api/progress/mark-complete", json={"userId": "u1", "topicId": "t1", "status": "completed"})
	assert mark.status_code == 201
	getp = client.get("/api/users/u1/progress")
	assert getp.status_code == 200
	assert len(getp.get_json()) >= 1
	ana = client.get("/api/analytics/dashboard")
	assert ana.status_code == 200


