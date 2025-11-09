import time
import logging
from typing import Any, Dict, List, Optional

from supabase import create_client, Client
import httpx
from supabase.client import ClientOptions

from .interface import Repository

logger = logging.getLogger(__name__)


class SupabaseRepository(Repository):
	def __init__(self, url: str, key: str) -> None:
		# Create Supabase client with timeout configuration
		# Note: The Supabase Python client uses httpx internally with HTTP/2 enabled by default
		# HTTP/2 has a max of 100 concurrent streams, which can cause connection pool exhaustion
		# under heavy load. We handle this by:
		# 1. Setting reasonable timeouts
		# 2. Reducing retry attempts and detecting pool errors (in _execute_with_retry)
		# 3. Failing fast on connection pool exhaustion
		options = ClientOptions(
			postgrest_client_timeout=20.0,  # Reduced timeout
			storage_client_timeout=20.0,
			schema="public",
			headers={}
		)
		
		self.client: Client = create_client(url, key, options=options)

	# Users
	def upsert_user(self, user: Dict[str, Any]) -> Dict[str, Any]:
		"""
		Upsert user to database.
		Supports all user fields including: id, email, name, phone, target_score
		"""
		# Prepare user data - ensure all fields are properly formatted
		user_data = {
			"email": user.get("email"),
			"name": user.get("name"),
		}
		
		# Add optional fields if provided
		if "phone" in user:
			user_data["phone"] = user.get("phone")
		
		# Add target_score if provided (convert to int if needed)
		if "target_score" in user:
			target_score = user.get("target_score")
			if target_score is not None:
				try:
					user_data["target_score"] = int(target_score)
				except (ValueError, TypeError):
					logger.warning(f"Invalid target_score value: {target_score}, skipping")
		
		# Add user_id if provided
		if "id" in user and user.get("id"):
			user_data["id"] = user.get("id")
		
		def _upsert_user():
			# Upsert operation - Supabase returns data automatically
			response = self.client.table("users").upsert(user_data).execute()
			# If data is returned, use it
			if response.data and len(response.data) > 0:
				logger.info(f"User upserted: {response.data[0].get('id')}, target_score: {response.data[0].get('target_score')}")
				return response.data[0]
			# If no data returned, return user_data as fallback
			return user_data
		
		# Use retry logic for database operations
		try:
			result = self._execute_with_retry(_upsert_user)
			if result:
				return result
		except Exception as e:
			logger.error(f"Error upserting user: {str(e)}", exc_info=True)
			# Fall through to query by email
		
		# Fallback: query the user by email to get full data
		email = user_data.get("email")
		if email:
			try:
				user_data_from_db = self.get_user_by_email(email)
				if user_data_from_db:
					# If we have target_score in request but not in DB, update it
					if "target_score" in user_data and user_data["target_score"] is not None:
						if user_data_from_db.get("target_score") != user_data["target_score"]:
							# Update target_score
							updated_user = self.update_user_target_score(user_data_from_db["id"], user_data["target_score"])
							return updated_user
					return user_data_from_db
			except Exception as e:
				logger.warning(f"Error querying user by email: {str(e)}")
		
		# Last resort: return user dict (will have generated ID from database)
		# Generate a UUID if not present
		if "id" not in user_data:
			import uuid
			user_data["id"] = str(uuid.uuid4())
		return user_data

	def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
		def _get_user():
			response = self.client.table("users").select("*").eq("id", user_id).maybe_single().execute()
			if response and hasattr(response, 'data'):
				return response.data
			return None
		
		try:
			return self._execute_with_retry(_get_user)
		except Exception as e:
			logger.error(f"Error getting user {user_id}: {str(e)}", exc_info=True)
			return None

	def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
		def _get_user_by_email():
			response = (
				self.client.table("users").select("*").eq("email", email).maybe_single().execute()
			)
			if response and hasattr(response, 'data'):
				return response.data
			return None
		
		try:
			return self._execute_with_retry(_get_user_by_email)
		except Exception as e:
			logger.error(f"Error getting user by email {email}: {str(e)}", exc_info=True)
			return None

	def update_user_target_score(self, user_id: str, target_score: int) -> Dict[str, Any]:
		def _update_target_score():
			response = (
				self.client.table("users")
				.update({"target_score": int(target_score)})
				.eq("id", user_id)
				.execute()
			)
			if response.data and len(response.data) > 0:
				logger.info(f"Updated target_score for user {user_id}: {target_score}")
				return response.data[0]
			# Fallback: query the user
			user = self.get_user(user_id)
			if user:
				return user
			raise KeyError(f"User {user_id} not found")
		
		try:
			return self._execute_with_retry(_update_target_score)
		except KeyError:
			raise
		except Exception as e:
			logger.error(f"Error updating target_score for user {user_id}: {str(e)}", exc_info=True)
			# Fallback: query the user
			user = self.get_user(user_id)
			if user:
				return user
			raise KeyError(f"User {user_id} not found") from e

	# Questions / Quizzes
	def get_diagnostic_questions(
		self, 
		total: int = 30, 
		subject: str = "Mathematics",
		ensure_topic_diversity: bool = True
	) -> List[Dict[str, Any]]:
		"""
		Get diagnostic questions with topic diversity and randomization.
		
		Strategy:
		1. Get all available topics
		2. Ensure at least 1 question per topic (if possible)
		3. Fill remaining slots with random questions
		4. Shuffle final result
		"""
		import random
		
		try:
			# Get all questions (filter by subject if questions table has subject field)
			# For now, we'll get all questions and filter by topic names
			all_questions_response = (
				self.client.table("questions")
				.select("*")
				.execute()
			)
			
			if not all_questions_response or not hasattr(all_questions_response, 'data'):
				return []
			
			all_questions = all_questions_response.data
			
			# Filter by subject if needed (check if questions have subject field)
			# For now, we'll work with all questions since topic is the main filter
			
			if not all_questions:
				return []
			
			# If topic diversity is not required, just randomize and return
			if not ensure_topic_diversity:
				random.shuffle(all_questions)
				return all_questions[:total]
			
			# Group questions by topic
			questions_by_topic = {}
			for q in all_questions:
				topic = q.get("topic", "Unknown")
				if topic not in questions_by_topic:
					questions_by_topic[topic] = []
				questions_by_topic[topic].append(q)
			
			# Get list of all topics
			topics = list(questions_by_topic.keys())
			
			if not topics:
				# No topics found, return random selection
				random.shuffle(all_questions)
				return all_questions[:total]
			
			# Strategy: Ensure topic diversity while randomizing questions
			selected_questions = []
			selected_ids = set()
			
			# Step 1: Ensure at least 1 question from each topic (if we have enough questions)
			# If we have more topics than total questions, we can't cover all topics
			# So we'll prioritize covering as many topics as possible
			if len(topics) <= total:
				# We have enough slots to include all topics
				# Shuffle topics to randomize which topics get more questions
				shuffled_topics = list(topics)
				random.shuffle(shuffled_topics)
				
				# First pass: Ensure 1 question from each topic
				for topic in shuffled_topics:
					if len(selected_questions) >= total:
						break
					topic_questions = questions_by_topic[topic]
					if topic_questions:
						random.shuffle(topic_questions)
						# Pick a question we haven't selected yet
						for q in topic_questions:
							if q.get("id") not in selected_ids:
								selected_questions.append(q)
								selected_ids.add(q.get("id"))
								break
				
				# Second pass: Distribute remaining slots across topics
				remaining_slots = total - len(selected_questions)
				if remaining_slots > 0:
					# Calculate how many questions per topic for remaining slots
					questions_per_topic = max(1, remaining_slots // len(topics))
					
					for topic in shuffled_topics:
						if len(selected_questions) >= total:
							break
						topic_questions = questions_by_topic[topic]
						# Get questions we haven't selected yet
						available_from_topic = [q for q in topic_questions if q.get("id") not in selected_ids]
						if available_from_topic:
							random.shuffle(available_from_topic)
							num_to_take = min(questions_per_topic, len(available_from_topic), total - len(selected_questions))
							selected_questions.extend(available_from_topic[:num_to_take])
							selected_ids.update(q.get("id") for q in available_from_topic[:num_to_take])
			else:
				# More topics than total questions - select diverse topics randomly
				# Shuffle topics and select questions from different topics
				shuffled_topics = list(topics)
				random.shuffle(shuffled_topics)
				
				for topic in shuffled_topics:
					if len(selected_questions) >= total:
						break
					topic_questions = questions_by_topic[topic]
					if topic_questions:
						random.shuffle(topic_questions)
						# Take 1 question from this topic
						q = topic_questions[0]
						if q.get("id") not in selected_ids:
							selected_questions.append(q)
							selected_ids.add(q.get("id"))
			
			# Step 2: Fill any remaining slots with random questions from all topics
			if len(selected_questions) < total:
				remaining_needed = total - len(selected_questions)
				available_questions = [q for q in all_questions if q.get("id") not in selected_ids]
				
				if available_questions:
					random.shuffle(available_questions)
					selected_questions.extend(available_questions[:remaining_needed])
			
			# Step 4: Shuffle final result to randomize order
			random.shuffle(selected_questions)
			
			# Ensure we don't return more than requested
			return selected_questions[:total]
			
		except Exception as e:
			import logging
			logging.error(f"Error getting diagnostic questions: {str(e)}", exc_info=True)
			return []

	def _is_network_error(self, exception: Exception) -> bool:
		"""
		Check if an exception is a network-related error that should be retried.
		
		Args:
			exception: The exception to check
		
		Returns:
			True if the exception is a network error, False otherwise
		"""
		# Check exception type
		if isinstance(exception, (httpx.WriteError, httpx.ReadError, httpx.ConnectError, httpx.TimeoutException)):
			return True
		
		# Check exception name (for wrapped exceptions)
		error_name = type(exception).__name__.lower()
		error_str = str(exception).lower()
		
		network_keywords = [
			"writeerror", "readerror", "connecterror", "timeout",
			"connection", "network", "ssl", "tls", "eof", "protocol",
			"broken pipe", "connection reset", "connection aborted"
		]
		
		return any(keyword in error_name or keyword in error_str for keyword in network_keywords)
	
	def _is_connection_pool_error(self, exception: Exception) -> bool:
		"""
		Check if an exception is due to connection pool exhaustion.
		These errors should NOT be retried immediately as it will make things worse.
		
		Args:
			exception: The exception to check
		
		Returns:
			True if the exception is a connection pool error, False otherwise
		"""
		error_str = str(exception).lower()
		error_name = type(exception).__name__.lower()
		
		pool_error_keywords = [
			"max outbound streams",
			"localprotocolerror",
			"connection pool",
			"too many connections",
			"pool exhausted"
		]
		
		return any(keyword in error_name or keyword in error_str for keyword in pool_error_keywords)
	
	def _execute_with_retry(self, operation, max_retries=2, initial_delay=0.5):
		"""
		Execute a Supabase operation with retry logic for network errors.
		Reduced retries and delays to prevent connection pool exhaustion.
		
		Args:
			operation: Callable that performs the Supabase operation
			max_retries: Maximum number of retry attempts (reduced to 2)
			initial_delay: Initial delay in seconds (reduced to 0.5s)
		
		Returns:
			Result of the operation
		"""
		last_exception = None
		
		for attempt in range(max_retries):
			try:
				return operation()
			except Exception as e:
				# Check if this is a connection pool error - don't retry these, fail immediately
				if self._is_connection_pool_error(e):
					logger.error(
						f"Connection pool error detected: {type(e).__name__}: {str(e)[:200]}. "
						"Failing immediately to avoid making the problem worse."
					)
					# Raise with a clear message that indicates pool exhaustion
					raise ConnectionError(
						"Connection pool exhausted - max outbound streams reached. Server is overloaded."
					) from e
				
				# Check if this is a network error that should be retried
				if self._is_network_error(e):
					last_exception = e
					error_type = type(e).__name__
					
					if attempt < max_retries - 1:
						# Shorter delays to avoid compounding the problem
						delay = initial_delay * (1.5 ** attempt)  # Reduced exponential backoff
						logger.warning(
							f"Network error ({error_type}) on attempt {attempt + 1}/{max_retries}. "
							f"Retrying in {delay:.2f}s... Error: {str(e)[:200]}"
						)
						time.sleep(delay)
					else:
						logger.error(
							f"Network error ({error_type}) after {max_retries} attempts. "
							f"Error: {str(e)[:200]}"
						)
				else:
					# For non-network errors, don't retry, just re-raise
					logger.error(f"Non-retryable error: {type(e).__name__}: {str(e)[:200]}")
					raise
		
		# If we exhausted all retries, raise the last exception
		if last_exception:
			raise Exception(
				f"Failed to execute operation after {max_retries} attempts due to network error: "
				f"{str(last_exception)[:200]}"
			) from last_exception
	
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
		
		def _insert_quiz():
			response = self.client.table("diagnostic_quizzes").insert(quiz_payload).execute()
			if response.data and len(response.data) > 0:
				return response.data[0]
			# Fallback: return quiz dict with generated ID
			return quiz_payload
		
		try:
			return self._execute_with_retry(_insert_quiz)
		except Exception as e:
			# Log error and re-raise with more context
			logger.error(f"Error creating quiz: {str(e)}, payload: {quiz_payload}", exc_info=True)
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
		
		def _insert_responses():
			self.client.table("quiz_responses").insert(transformed_responses).execute()
		
		self._execute_with_retry(_insert_responses)

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
		def _get_quiz():
			quiz_response = self.client.table("diagnostic_quizzes").select("*").eq("id", quiz_id).single().execute()
			return quiz_response.data if quiz_response and hasattr(quiz_response, 'data') else None
		
		def _get_responses():
			responses_response = self.client.table("quiz_responses").select("*").eq("quiz_id", quiz_id).execute()
			return responses_response.data if responses_response and hasattr(responses_response, 'data') else []
		
		def _get_diagnostic():
			diagnostic_response = self.client.table("ai_diagnostics").select("*").eq("quiz_id", quiz_id).maybe_single().execute()
			if diagnostic_response and hasattr(diagnostic_response, 'data') and diagnostic_response.data:
				return diagnostic_response.data
			return None
		
		try:
			# Use retry logic for all database queries
			quiz = self._execute_with_retry(_get_quiz)
			if not quiz:
				raise KeyError(f"Quiz {quiz_id} not found")
			
			# Get responses and diagnostic (can fail gracefully)
			try:
				responses = self._execute_with_retry(_get_responses)
			except Exception as e:
				logger.warning(f"Error fetching responses for quiz {quiz_id}: {str(e)}")
				responses = []
			
			# Get diagnostic data if it exists
			diagnostic = None
			try:
				diagnostic_raw = self._execute_with_retry(_get_diagnostic)
				if diagnostic_raw:
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
				logger.warning(f"Error fetching diagnostic for quiz {quiz_id}: {str(e)}")
				# Diagnostic doesn't exist or error fetching - that's okay
				diagnostic = None
			
			return {
				"quiz": quiz,
				"responses": responses,
				"diagnostic": diagnostic  # Include diagnostic data if available
			}
		except Exception as e:
			# Re-raise with more context
			if isinstance(e, KeyError):
				raise
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
	def get_user_latest_quiz(self, user_id: str) -> Optional[Dict[str, Any]]:
		"""
		Get user's latest quiz and diagnostic information.
		
		Returns:
			Dict with keys: quiz_id, diagnostic_id, has_diagnostic, created_at
			None if user has no quizzes
		"""
		def _get_latest_quiz():
			# Get user's latest quiz (most recent by started_at)
			# Note: diagnostic_quizzes table has started_at, not created_at
			# Use started_at to order by most recent quiz
			quiz_response = (
				self.client.table("diagnostic_quizzes")
				.select("id, started_at")
				.eq("user_id", user_id)
				.order("started_at", desc=True)
				.limit(1)
				.execute()
			)
			
			if not quiz_response or not hasattr(quiz_response, 'data') or not quiz_response.data:
				return None
			
			latest_quiz = quiz_response.data[0]
			quiz_id = latest_quiz.get("id")
			started_at = latest_quiz.get("started_at")
			
			# Check if this quiz has a diagnostic
			def _get_diagnostic():
				diagnostic_response = (
					self.client.table("ai_diagnostics")
					.select("id")
					.eq("quiz_id", quiz_id)
					.maybe_single()
					.execute()
				)
				
				diagnostic_id = None
				has_diagnostic = False
				if diagnostic_response and hasattr(diagnostic_response, 'data') and diagnostic_response.data:
					diagnostic_id = diagnostic_response.data.get("id")
					has_diagnostic = True
				
				return {
					"quiz_id": quiz_id,
					"diagnostic_id": diagnostic_id,
					"has_diagnostic": has_diagnostic,
					"created_at": started_at  # Use started_at as the creation timestamp
				}
			
			# Use retry logic for diagnostic lookup
			try:
				return self._execute_with_retry(_get_diagnostic)
			except Exception as e:
				# If diagnostic lookup fails, return quiz info without diagnostic
				logger.warning(f"Error getting diagnostic for quiz {quiz_id}: {str(e)}")
				return {
					"quiz_id": quiz_id,
					"diagnostic_id": None,
					"has_diagnostic": False,
					"created_at": started_at
				}
		
		try:
			return self._execute_with_retry(_get_latest_quiz)
		except Exception as e:
			logger.error(f"Error getting latest quiz for user {user_id}: {str(e)}", exc_info=True)
			return None
	
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


