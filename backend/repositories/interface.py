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
	def get_diagnostic_questions(
		self, 
		total: int = 30, 
		subject: str = "Mathematics",
		ensure_topic_diversity: bool = True
	) -> List[Dict[str, Any]]:
		"""
		Get diagnostic questions for quiz with topic diversity.
		
		Args:
			total: Total number of questions to return
			subject: Subject to filter questions (optional)
			ensure_topic_diversity: If True, ensure all topics are represented
			
		Returns:
			List of question dictionaries, randomized and topic-diverse
		"""
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

	# User Latest Quiz/Diagnostic
	def get_user_latest_quiz(self, user_id: str) -> Optional[Dict[str, Any]]:
		"""
		Get user's latest quiz and diagnostic information.
		
		Returns:
			Dict with keys: quiz_id, diagnostic_id, has_diagnostic, created_at
			None if user has no quizzes
		"""
		raise NotImplementedError

	# Topics
	def get_topics(self, subject: Optional[str] = None) -> List[Dict[str, Any]]:
		"""Get all topics, optionally filtered by subject."""
		raise NotImplementedError

	# Resources
	def get_resources(self, topic_id: Optional[str] = None, topic_name: Optional[str] = None) -> List[Dict[str, Any]]:
		"""Get resources, optionally filtered by topic_id or topic_name."""
		raise NotImplementedError


