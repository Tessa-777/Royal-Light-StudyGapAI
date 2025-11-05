import random
import time
import uuid
from typing import Any, Dict, List, Optional

from .interface import Repository


def _uuid() -> str:
	return str(uuid.uuid4())


class InMemoryRepository(Repository):
	def __init__(self) -> None:
		self.users: Dict[str, Dict[str, Any]] = {}
		self.users_by_email: Dict[str, str] = {}
		self.questions: Dict[str, Dict[str, Any]] = {}
		self.quizzes: Dict[str, Dict[str, Any]] = {}
		self.quiz_responses: Dict[str, List[Dict[str, Any]]] = {}
		self.ai_diagnostics: Dict[str, Dict[str, Any]] = {}
		self.study_plans: Dict[str, Dict[str, Any]] = {}
		self.progress: List[Dict[str, Any]] = []

		# Seed a minimal question bank per schema for local testing
		for i in range(50):
			qid = _uuid()
			self.questions[qid] = {
				"id": qid,
				"topic_id": _uuid(),
				"question_text": f"What is {i}+{i}?",
				"option_a": "1",
				"option_b": "2",
				"option_c": str(i + i),
				"option_d": "4",
				"correct_answer": "C",
				"difficulty": random.choice(["easy", "medium", "hard"]),
				"subtopic": "addition",
			}

	# Users
	def upsert_user(self, user: Dict[str, Any]) -> Dict[str, Any]:
		user_id = user.get("id") or _uuid()
		stored = {
			"id": user_id,
			"email": user.get("email"),
			"name": user.get("name"),
			"phone": user.get("phone"),
			"target_score": user.get("target_score"),
			"created_at": user.get("created_at") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
			"last_active": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
		}
		self.users[user_id] = stored
		if stored.get("email"):
			self.users_by_email[stored["email"].lower()] = user_id
		return stored

	def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
		return self.users.get(user_id)

	def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
		uid = self.users_by_email.get(email.lower())
		return self.users.get(uid) if uid else None

	def update_user_target_score(self, user_id: str, target_score: int) -> Dict[str, Any]:
		if user_id not in self.users:
			raise KeyError(f"User {user_id} not found")
		user = self.users[user_id]
		user["target_score"] = target_score
		user["last_active"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
		return user

	# Questions / Quizzes
	def get_diagnostic_questions(self, total: int = 30) -> List[Dict[str, Any]]:
		all_q = list(self.questions.values())
		return all_q[: total if total <= len(all_q) else len(all_q)]

	def create_quiz(self, quiz: Dict[str, Any]) -> Dict[str, Any]:
		quiz_id = _uuid()
		stored = {
			"id": quiz_id,
			"user_id": quiz["user_id"],
			"started_at": quiz.get("started_at") or time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
			"completed_at": None,
			"total_questions": quiz.get("total_questions", 30),
			"correct_answers": 0,
			"score_percentage": 0.0,
		}
		self.quizzes[quiz_id] = stored
		self.quiz_responses[quiz_id] = []
		return stored

	def save_quiz_responses(self, quiz_id: str, responses: List[Dict[str, Any]]) -> None:
		if quiz_id not in self.quizzes:
			raise KeyError(f"Quiz {quiz_id} not found")
		# Ensure each response has an id per schema
		normalized: List[Dict[str, Any]] = []
		for r in responses:
			resp = {**r}
			if not resp.get("id"):
				resp["id"] = _uuid()
			normalized.append(resp)
		self.quiz_responses[quiz_id] = normalized
		correct = sum(1 for r in responses if r.get("is_correct"))
		q = self.quizzes[quiz_id]
		q["correct_answers"] = correct
		q["completed_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
		q["score_percentage"] = (correct / max(1, q.get("total_questions", 30))) * 100.0

	def get_quiz_results(self, quiz_id: str) -> Dict[str, Any]:
		if quiz_id not in self.quizzes:
			raise KeyError(f"Quiz {quiz_id} not found")
		return {
			"quiz": self.quizzes[quiz_id],
			"responses": self.quiz_responses.get(quiz_id, []),
		}

	# AI Diagnostics / Study Plans
	def save_ai_diagnostic(self, diagnostic: Dict[str, Any]) -> Dict[str, Any]:
		did = _uuid()
		payload = {**diagnostic, "id": did}
		if not payload.get("generated_at"):
			payload["generated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
		self.ai_diagnostics[did] = payload
		return payload

	def create_study_plan(self, plan: Dict[str, Any]) -> Dict[str, Any]:
		pid = _uuid()
		payload = {**plan, "id": pid}
		now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
		payload.setdefault("created_at", now)
		payload.setdefault("updated_at", now)
		self.study_plans[pid] = payload
		return payload

	def update_study_plan(self, plan_id: str, plan_data: Dict[str, Any]) -> Dict[str, Any]:
		self.study_plans[plan_id]["plan_data"] = plan_data
		self.study_plans[plan_id]["updated_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
		return self.study_plans[plan_id]

	# Progress
	def get_user_progress(self, user_id: str) -> List[Dict[str, Any]]:
		return [p for p in self.progress if p.get("user_id") == user_id]

	def mark_progress_complete(self, progress: Dict[str, Any]) -> Dict[str, Any]:
		entry = {
			"id": _uuid(),
			**progress,
			"last_updated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
		}
		self.progress.append(entry)
		return entry

	# Analytics
	def get_analytics_dashboard(self) -> Dict[str, Any]:
		return {
			"total_users": len(self.users),
			"total_quizzes": len(self.quizzes),
			"avg_score": (
				(sum(q.get("score_percentage", 0.0) for q in self.quizzes.values()) / max(1, len(self.quizzes)))
			),
		}


