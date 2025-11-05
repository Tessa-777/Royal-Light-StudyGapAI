from typing import Any, Dict, List, Optional


class Repository:
	"""Abstract repository interface used by services and routes.

	Provides a thin layer over persistence so we can swap Supabase and in-memory easily.
	"""

	# Users
	def upsert_user(self, user: Dict[str, Any]) -> Dict[str, Any]:
		raise NotImplementedError

	def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
		raise NotImplementedError

	def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
		raise NotImplementedError

	def update_user_target_score(self, user_id: str, target_score: int) -> Dict[str, Any]:
		raise NotImplementedError

	# Questions / Quizzes
	def get_diagnostic_questions(self, total: int = 30) -> List[Dict[str, Any]]:
		raise NotImplementedError

	def create_quiz(self, quiz: Dict[str, Any]) -> Dict[str, Any]:
		raise NotImplementedError

	def save_quiz_responses(self, quiz_id: str, responses: List[Dict[str, Any]]) -> None:
		raise NotImplementedError

	def get_quiz_results(self, quiz_id: str) -> Dict[str, Any]:
		raise NotImplementedError

	# AI Diagnostics / Study Plans
	def save_ai_diagnostic(self, diagnostic: Dict[str, Any]) -> Dict[str, Any]:
		raise NotImplementedError

	def create_study_plan(self, plan: Dict[str, Any]) -> Dict[str, Any]:
		raise NotImplementedError

	def update_study_plan(self, plan_id: str, plan_data: Dict[str, Any]) -> Dict[str, Any]:
		raise NotImplementedError

	def get_study_plan(self, plan_id: str) -> Optional[Dict[str, Any]]:
		raise NotImplementedError

	# Progress
	def get_user_progress(self, user_id: str) -> List[Dict[str, Any]]:
		raise NotImplementedError

	def mark_progress_complete(self, progress: Dict[str, Any]) -> Dict[str, Any]:
		raise NotImplementedError

	# Analytics
	def get_analytics_dashboard(self) -> Dict[str, Any]:
		raise NotImplementedError


