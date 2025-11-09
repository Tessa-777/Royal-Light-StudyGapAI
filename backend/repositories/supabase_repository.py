from typing import Any, Dict, List, Optional

from supabase import create_client, Client

from .interface import Repository


class SupabaseRepository(Repository):
	def __init__(self, url: str, key: str) -> None:
		self.client: Client = create_client(url, key)

	# Users
	def upsert_user(self, user: Dict[str, Any]) -> Dict[str, Any]:
		# Upsert operation - Supabase returns data automatically
		try:
			response = self.client.table("users").upsert(user).execute()
			# If data is returned, use it
			if response.data and len(response.data) > 0:
				return response.data[0]
		except Exception:
			pass  # Fall through to query by email
		
		# Fallback: query the user by email to get full data
		email = user.get("email")
		if email:
			user_data = self.get_user_by_email(email)
			if user_data:
				return user_data
		
		# Last resort: return user dict (will have generated ID from database)
		# Generate a UUID if not present
		if "id" not in user:
			import uuid
			user["id"] = str(uuid.uuid4())
		return user

	def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
		try:
			response = self.client.table("users").select("*").eq("id", user_id).maybe_single().execute()
			if response and hasattr(response, 'data'):
				return response.data
			return None
		except Exception:
			return None

	def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
		try:
			response = (
				self.client.table("users").select("*").eq("email", email).maybe_single().execute()
			)
			if response and hasattr(response, 'data'):
				return response.data
			return None
		except Exception:
			return None

	def update_user_target_score(self, user_id: str, target_score: int) -> Dict[str, Any]:
		response = (
			self.client.table("users")
			.update({"target_score": target_score})
			.eq("id", user_id)
			.execute()
		)
		if response.data and len(response.data) > 0:
			return response.data[0]
		# Fallback: query the user
		user = self.get_user(user_id)
		if user:
			return user
		raise KeyError(f"User {user_id} not found")

	# Questions / Quizzes
	def get_diagnostic_questions(self, total: int = 30) -> List[Dict[str, Any]]:
		try:
			response = (
				self.client.table("questions")
				.select("*")
				.limit(total)
				.execute()
			)
			if response and hasattr(response, 'data'):
				return response.data
			return []
		except Exception:
			return []

	def create_quiz(self, quiz: Dict[str, Any]) -> Dict[str, Any]:
		"""
		Create diagnostic quiz with enhanced schema.
		Supports subject and time_taken_minutes fields.
		"""
		# Ensure required fields are present
		quiz_payload = {
			"user_id": quiz.get("user_id"),
			"subject": quiz.get("subject", "Mathematics"),
			"total_questions": quiz.get("total_questions", 30),
			"time_taken_minutes": quiz.get("time_taken_minutes") or quiz.get("time_taken"),
		}
		
		# Only add started_at and completed_at if they are provided and valid
		if quiz.get("started_at"):
			quiz_payload["started_at"] = quiz.get("started_at")
		if quiz.get("completed_at"):
			quiz_payload["completed_at"] = quiz.get("completed_at")
		
		try:
			response = self.client.table("diagnostic_quizzes").insert(quiz_payload).execute()
			if response.data and len(response.data) > 0:
				return response.data[0]
			# Fallback: return quiz dict with generated ID
			return quiz_payload
		except Exception as e:
			# Log error and re-raise with more context
			import logging
			logging.error(f"Error creating quiz: {str(e)}, payload: {quiz_payload}")
			raise

	def save_quiz_responses(self, quiz_id: str, responses: List[Dict[str, Any]]) -> None:
		"""
		Save quiz responses with enhanced schema.
		Supports topic and confidence fields.
		"""
		# Transform responses to match new schema
		transformed_responses = []
		for resp in responses:
			question_id = resp.get("question_id") or resp.get("questionId")
			# question_id must be a valid UUID or None (database constraint)
			# If it's not a valid UUID format, set it to None
			if question_id:
				try:
					import uuid
					# Try to validate as UUID
					uuid.UUID(str(question_id))
				except (ValueError, TypeError):
					# Not a valid UUID, set to None
					question_id = None
			
			transformed = {
				"quiz_id": quiz_id,
				"topic": resp.get("topic", "Unknown"),
				"student_answer": resp.get("student_answer") or resp.get("studentAnswer"),
				"correct_answer": resp.get("correct_answer") or resp.get("correctAnswer"),
				"is_correct": resp.get("is_correct") if "is_correct" in resp else resp.get("isCorrect", False),
				"confidence": resp.get("confidence"),
				"explanation": resp.get("explanation") or resp.get("explanationText", ""),
				"time_spent_seconds": resp.get("time_spent_seconds") or resp.get("timeSpentSeconds"),
			}
			# Only add question_id if it's a valid UUID
			if question_id:
				transformed["question_id"] = question_id
			transformed_responses.append(transformed)
		
		self.client.table("quiz_responses").insert(transformed_responses).execute()

		# Compute quiz summary
		res = (
			self.client.table("quiz_responses")
			.select("is_correct")
			.eq("quiz_id", quiz_id)
			.execute()
		)
		res_data = res.data if res and hasattr(res, 'data') else []
		correct = sum(1 for r in res_data if r.get("is_correct"))
		total = len(res_data)
		score = (correct / max(1, total)) * 100.0
		
		# Update quiz with summary
		update_data = {
			"correct_answers": correct,
			"score_percentage": score,
		}
		
		# Add completed_at if not already set (check quiz, not responses)
		# We'll check if the quiz already has completed_at set
		quiz_check = (
			self.client.table("diagnostic_quizzes")
			.select("completed_at")
			.eq("id", quiz_id)
			.single()
			.execute()
		)
		quiz_data = quiz_check.data if quiz_check and hasattr(quiz_check, 'data') else {}
		if not quiz_data.get("completed_at"):
			from datetime import datetime, timezone
			update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
		
		self.client.table("diagnostic_quizzes").update(update_data).eq("id", quiz_id).execute()

	def get_quiz_results(self, quiz_id: str) -> Dict[str, Any]:
		try:
			quiz_response = self.client.table("diagnostic_quizzes").select("*").eq("id", quiz_id).single().execute()
			quiz = quiz_response.data if quiz_response and hasattr(quiz_response, 'data') else None
			
			responses_response = self.client.table("quiz_responses").select("*").eq("quiz_id", quiz_id).execute()
			responses = responses_response.data if responses_response and hasattr(responses_response, 'data') else []
			
			if not quiz:
				raise KeyError(f"Quiz {quiz_id} not found")
			
			# Get diagnostic data if it exists
			diagnostic = None
			try:
				diagnostic_response = self.client.table("ai_diagnostics").select("*").eq("quiz_id", quiz_id).maybe_single().execute()
				if diagnostic_response and hasattr(diagnostic_response, 'data') and diagnostic_response.data:
					diagnostic_raw = diagnostic_response.data
					
					# Format diagnostic to match analyze-diagnostic response format
					# Handle analysis_result (JSONB field from Supabase)
					import json
					analysis_result = diagnostic_raw.get("analysis_result")
					
					# Parse analysis_result if it's a string (Supabase sometimes returns JSONB as string)
					if isinstance(analysis_result, str):
						try:
							analysis_result = json.loads(analysis_result)
						except (json.JSONDecodeError, TypeError):
							analysis_result = None
					
					# Helper function to parse JSONB fields (might be dict, string, or None)
					def parse_jsonb_field(field_value):
						if field_value is None:
							return None
						if isinstance(field_value, str):
							try:
								return json.loads(field_value)
							except (json.JSONDecodeError, TypeError):
								return field_value
						# If it's already a dict/list, return as-is
						return field_value
					
					# Initialize diagnostic with basic fields
					diagnostic = {
						"id": diagnostic_raw.get("id"),
						"quiz_id": diagnostic_raw.get("quiz_id"),
						"generated_at": diagnostic_raw.get("generated_at"),
					}
					
					# Extract fields from analysis_result first (primary source)
					if analysis_result and isinstance(analysis_result, dict):
						# Extract from analysis_result - this is the primary source of truth
						diagnostic["overall_performance"] = analysis_result.get("overall_performance")
						diagnostic["topic_breakdown"] = analysis_result.get("topic_breakdown")
						diagnostic["root_cause_analysis"] = analysis_result.get("root_cause_analysis")
						diagnostic["predicted_jamb_score"] = analysis_result.get("predicted_jamb_score")
						diagnostic["study_plan"] = analysis_result.get("study_plan")
						diagnostic["recommendations"] = analysis_result.get("recommendations")
					
					# Fallback to denormalized fields if field is None or missing (check for None, not falsy)
					if "overall_performance" not in diagnostic or diagnostic.get("overall_performance") is None:
						diagnostic["overall_performance"] = parse_jsonb_field(diagnostic_raw.get("overall_performance"))
					if "topic_breakdown" not in diagnostic or diagnostic.get("topic_breakdown") is None:
						diagnostic["topic_breakdown"] = parse_jsonb_field(diagnostic_raw.get("topic_breakdown"))
					if "root_cause_analysis" not in diagnostic or diagnostic.get("root_cause_analysis") is None:
						diagnostic["root_cause_analysis"] = parse_jsonb_field(diagnostic_raw.get("root_cause_analysis"))
					if "predicted_jamb_score" not in diagnostic or diagnostic.get("predicted_jamb_score") is None:
						diagnostic["predicted_jamb_score"] = parse_jsonb_field(diagnostic_raw.get("predicted_jamb_score"))
					if "study_plan" not in diagnostic or diagnostic.get("study_plan") is None:
						diagnostic["study_plan"] = parse_jsonb_field(diagnostic_raw.get("study_plan"))
					if "recommendations" not in diagnostic or diagnostic.get("recommendations") is None:
						diagnostic["recommendations"] = parse_jsonb_field(diagnostic_raw.get("recommendations"))
					
					# Ensure all required fields have default values (never return None/undefined)
					# Use is None check (not falsy check) to preserve empty dicts/lists
					if diagnostic.get("overall_performance") is None:
						diagnostic["overall_performance"] = {}
					if diagnostic.get("topic_breakdown") is None:
						diagnostic["topic_breakdown"] = []
					if diagnostic.get("root_cause_analysis") is None:
						diagnostic["root_cause_analysis"] = {}
					if diagnostic.get("predicted_jamb_score") is None:
						diagnostic["predicted_jamb_score"] = {}
					if diagnostic.get("study_plan") is None:
						diagnostic["study_plan"] = {}
					if diagnostic.get("recommendations") is None:
						diagnostic["recommendations"] = []
			except Exception as e:
				# Log error for debugging
				import logging
				logging.error(f"Error fetching diagnostic for quiz {quiz_id}: {str(e)}", exc_info=True)
				# Diagnostic doesn't exist or error fetching - that's okay
				diagnostic = None
			
			return {
				"quiz": quiz,
				"responses": responses,
				"diagnostic": diagnostic  # Include diagnostic data if available
			}
		except Exception as e:
			raise KeyError(f"Quiz {quiz_id} not found") from e

	# AI Diagnostics / Study Plans
	def save_ai_diagnostic(self, diagnostic: Dict[str, Any]) -> Dict[str, Any]:
		"""
		Save AI diagnostic with comprehensive format.
		Decision 10: Option B - Store both analysis_result and denormalized fields
		"""
		from datetime import datetime, timezone
		
		# Extract analysis_result if provided, otherwise use diagnostic as analysis_result
		analysis_result = diagnostic.get("analysis_result")
		if not analysis_result:
			# If analysis_result not provided, assume diagnostic contains the full analysis
			analysis_result = {
				"overall_performance": diagnostic.get("overall_performance"),
				"topic_breakdown": diagnostic.get("topic_breakdown", []),
				"root_cause_analysis": diagnostic.get("root_cause_analysis"),
				"predicted_jamb_score": diagnostic.get("predicted_jamb_score"),
				"study_plan": diagnostic.get("study_plan"),
				"recommendations": diagnostic.get("recommendations", [])
			}
		
		# Build payload with both analysis_result and denormalized fields
		payload = {
			"quiz_id": diagnostic.get("quiz_id"),
			"analysis_result": analysis_result,  # Complete analysis result
			"overall_performance": diagnostic.get("overall_performance") or analysis_result.get("overall_performance"),
			"topic_breakdown": diagnostic.get("topic_breakdown") or analysis_result.get("topic_breakdown", []),
			"root_cause_analysis": diagnostic.get("root_cause_analysis") or analysis_result.get("root_cause_analysis"),
			"predicted_jamb_score": diagnostic.get("predicted_jamb_score") or analysis_result.get("predicted_jamb_score"),
			"study_plan": diagnostic.get("study_plan") or analysis_result.get("study_plan"),
			"recommendations": diagnostic.get("recommendations") or analysis_result.get("recommendations", []),
		}
		
		# Extract legacy fields for backward compatibility
		topic_breakdown = payload.get("topic_breakdown", [])
		weak_topics = [
			{"topic": t.get("topic"), "accuracy": t.get("accuracy"), "severity": t.get("severity")}
			for t in topic_breakdown if t.get("status") == "weak"
		]
		strong_topics = [
			{"topic": t.get("topic"), "accuracy": t.get("accuracy")}
			for t in topic_breakdown if t.get("status") == "strong"
		]
		
		payload["weak_topics"] = weak_topics
		payload["strong_topics"] = strong_topics
		payload["analysis_summary"] = diagnostic.get("analysis_summary") or f"Diagnostic analysis for {payload.get('overall_performance', {}).get('accuracy', 0):.1f}% accuracy"
		payload["projected_score"] = (payload.get("predicted_jamb_score") or {}).get("score", 0)
		payload["foundational_gaps"] = [
			{"gapDescription": r.get("action"), "affectedTopics": [r.get("category")]}
			for r in payload.get("recommendations", []) if r.get("category") == "weakness"
		]
		
		# Set generated_at if not provided
		if "generated_at" not in payload:
			payload["generated_at"] = datetime.now(timezone.utc).isoformat()
		
		response = self.client.table("ai_diagnostics").insert(payload).execute()
		if response.data and len(response.data) > 0:
			return response.data[0]
		return payload

	def create_study_plan(self, plan: Dict[str, Any]) -> Dict[str, Any]:
		from datetime import datetime, timezone
		now = datetime.now(timezone.utc).isoformat()
		payload = {**plan}
		payload.setdefault("created_at", now)
		payload.setdefault("updated_at", now)
		response = self.client.table("study_plans").insert(payload).execute()
		if response.data and len(response.data) > 0:
			return response.data[0]
		return payload

	def update_study_plan(self, plan_id: str, plan_data: Dict[str, Any]) -> Dict[str, Any]:
		from datetime import datetime, timezone
		response = (
			self.client.table("study_plans")
			.update({"plan_data": plan_data, "updated_at": datetime.now(timezone.utc).isoformat()})
			.eq("id", plan_id)
			.execute()
		)
		if response.data and len(response.data) > 0:
			return response.data[0]
		# Fallback: return updated plan data
		plan = self.get_study_plan(plan_id)
		if plan:
			return plan
		return {"id": plan_id, "plan_data": plan_data}

	def get_study_plan(self, plan_id: str) -> Optional[Dict[str, Any]]:
		try:
			response = self.client.table("study_plans").select("*").eq("id", plan_id).maybe_single().execute()
			if response and hasattr(response, 'data'):
				return response.data
			return None
		except Exception:
			return None

	# Progress
	def get_user_progress(self, user_id: str) -> List[Dict[str, Any]]:
		try:
			response = (
				self.client.table("progress_tracking").select("*").eq("user_id", user_id).execute()
			)
			if response and hasattr(response, 'data'):
				return response.data
			return []
		except Exception:
			return []

	def mark_progress_complete(self, progress: Dict[str, Any]) -> Dict[str, Any]:
		response = self.client.table("progress_tracking").insert(progress).execute()
		if response.data and len(response.data) > 0:
			return response.data[0]
		return progress

	# Analytics
	def get_analytics_dashboard(self) -> Dict[str, Any]:
		# This can be optimized via SQL views; simple version here
		users = self.client.table("users").select("id").execute().data
		quizzes = self.client.table("diagnostic_quizzes").select("score_percentage").execute().data
		avg_score = (
			sum(q.get("score_percentage", 0.0) for q in quizzes) / max(1, len(quizzes))
		)
		return {
			"total_users": len(users),
			"total_quizzes": len(quizzes),
			"avg_score": avg_score,
		}

	# Topics
	def get_topics(self, subject: Optional[str] = None) -> List[Dict[str, Any]]:
		"""Get all topics, optionally filtered by subject."""
		try:
			# Note: Subject filtering requires a subject field on topics table
			# For now, return all topics
			response = self.client.table("topics").select("*").execute()
			if response and hasattr(response, 'data'):
				return response.data
			return []
		except Exception:
			return []

	# Resources
	def get_resources(self, topic_id: Optional[str] = None, topic_name: Optional[str] = None) -> List[Dict[str, Any]]:
		"""Get resources, optionally filtered by topic_id or topic_name."""
		try:
			query = self.client.table("resources").select("*")
			
			if topic_id:
				query = query.eq("topic_id", topic_id)
			elif topic_name:
				# First, find the topic by name
				topic_response = self.client.table("topics").select("id").eq("name", topic_name).maybe_single().execute()
				if topic_response and hasattr(topic_response, 'data') and topic_response.data:
					topic_id = topic_response.data.get("id")
					query = query.eq("topic_id", topic_id)
				else:
					# No topic found, return empty
					return []
			
			response = query.execute()
			if response and hasattr(response, 'data'):
				return response.data
			return []
		except Exception:
			return []


