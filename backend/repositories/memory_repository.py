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
		self.topics: Dict[str, Dict[str, Any]] = {}
		self.resources: Dict[str, Dict[str, Any]] = {}

		# Seed topics for JAMB Mathematics
		math_topics = [
			{"name": "Algebra", "description": "Linear equations, quadratic equations, polynomials", "jamb_weight": 0.15},
			{"name": "Geometry", "description": "Shapes, angles, area, perimeter, volume", "jamb_weight": 0.12},
			{"name": "Trigonometry", "description": "Sine, cosine, tangent, identities", "jamb_weight": 0.10},
			{"name": "Calculus", "description": "Differentiation, integration, limits", "jamb_weight": 0.08},
			{"name": "Statistics", "description": "Mean, median, mode, probability", "jamb_weight": 0.10},
			{"name": "Number System", "description": "Real numbers, integers, fractions, decimals", "jamb_weight": 0.15},
			{"name": "Sets", "description": "Union, intersection, Venn diagrams", "jamb_weight": 0.08},
			{"name": "Sequences & Series", "description": "Arithmetic, geometric progressions", "jamb_weight": 0.07},
			{"name": "Coordinate Geometry", "description": "Distance, midpoint, slope, equations", "jamb_weight": 0.10},
			{"name": "Probability", "description": "Events, outcomes, conditional probability", "jamb_weight": 0.05},
		]
		algebra_topic_id = None
		geometry_topic_id = None
		for topic in math_topics:
			tid = _uuid()
			self.topics[tid] = {
				"id": tid,
				"name": topic["name"],
				"description": topic["description"],
				"prerequisite_topic_ids": [],
				"jamb_weight": topic["jamb_weight"],
			}
			# Track IDs for resources
			if topic["name"] == "Algebra":
				algebra_topic_id = tid
			elif topic["name"] == "Geometry":
				geometry_topic_id = tid

		# Seed sample resources for some topics
		
		sample_resources = [
			{
				"topic_id": algebra_topic_id,
				"type": "video",
				"title": "Algebra Basics - Introduction to Linear Equations",
				"url": "https://www.khanacademy.org/math/algebra/linear-equations",
				"source": "Khan Academy",
				"duration_minutes": 20,
				"difficulty": "easy",
				"upvotes": 0,
			},
			{
				"topic_id": algebra_topic_id,
				"type": "practice_set",
				"title": "Algebra Practice Problems - JAMB Style",
				"url": "https://www.example.com/practice/algebra",
				"source": "StudyGapAI",
				"duration_minutes": 45,
				"difficulty": "medium",
				"upvotes": 0,
			},
			{
				"topic_id": geometry_topic_id,
				"type": "video",
				"title": "Geometry Fundamentals - Triangles and Circles",
				"url": "https://www.khanacademy.org/math/geometry",
				"source": "Khan Academy",
				"duration_minutes": 30,
				"difficulty": "medium",
				"upvotes": 0,
			},
		]
		for resource in sample_resources:
			rid = _uuid()
			self.resources[rid] = {"id": rid, **resource}

		# Seed a minimal question bank per schema for local testing
		# Create questions with diverse topics to test topic distribution
		sample_topics = ["Algebra", "Geometry", "Trigonometry", "Calculus", "Statistics", "Number Theory"]
		for i in range(50):
			qid = _uuid()
			# Distribute questions across topics
			topic = sample_topics[i % len(sample_topics)]
			self.questions[qid] = {
				"id": qid,
				"topic_id": _uuid(),
				"topic": topic,  # Add topic field for topic diversity logic
				"question_text": f"{topic} Question {i+1}: What is {i}+{i}?",
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
	def get_diagnostic_questions(
		self, 
		total: int = 30, 
		subject: str = "Mathematics",
		ensure_topic_diversity: bool = True
	) -> List[Dict[str, Any]]:
		"""
		Get diagnostic questions with topic diversity and randomization.
		"""
		import random
		
		all_q = list(self.questions.values())
		
		if not all_q:
			return []
		
		# If topic diversity is not required, just randomize and return
		if not ensure_topic_diversity:
			random.shuffle(all_q)
			return all_q[:total]
		
		# Group questions by topic
		questions_by_topic = {}
		for q in all_q:
			topic = q.get("topic", "Unknown")
			if topic not in questions_by_topic:
				questions_by_topic[topic] = []
			questions_by_topic[topic].append(q)
		
		# Get list of all topics
		topics = list(questions_by_topic.keys())
		
		if not topics:
			# No topics found, return random selection
			random.shuffle(all_q)
			return all_q[:total]
		
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
			available_questions = [q for q in all_q if q.get("id") not in selected_ids]
			
			if available_questions:
				random.shuffle(available_questions)
				selected_questions.extend(available_questions[:remaining_needed])
		
		# Step 4: Shuffle final result to randomize order
		random.shuffle(selected_questions)
		
		# Ensure we don't return more than requested
		return selected_questions[:total]

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
		
		# Get diagnostic data if it exists
		diagnostic = None
		for diag_id, diag_data in self.ai_diagnostics.items():
			if diag_data.get("quiz_id") == quiz_id:
				diagnostic_raw = diag_data
				
				# Initialize diagnostic with basic fields
				diagnostic = {
					"id": diagnostic_raw.get("id"),
					"quiz_id": diagnostic_raw.get("quiz_id"),
					"generated_at": diagnostic_raw.get("generated_at"),
				}
				
				# Extract fields from analysis_result first (primary source)
				analysis_result = diagnostic_raw.get("analysis_result")
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
					diagnostic["overall_performance"] = diagnostic_raw.get("overall_performance")
				if "topic_breakdown" not in diagnostic or diagnostic.get("topic_breakdown") is None:
					diagnostic["topic_breakdown"] = diagnostic_raw.get("topic_breakdown")
				if "root_cause_analysis" not in diagnostic or diagnostic.get("root_cause_analysis") is None:
					diagnostic["root_cause_analysis"] = diagnostic_raw.get("root_cause_analysis")
				if "predicted_jamb_score" not in diagnostic or diagnostic.get("predicted_jamb_score") is None:
					diagnostic["predicted_jamb_score"] = diagnostic_raw.get("predicted_jamb_score")
				if "study_plan" not in diagnostic or diagnostic.get("study_plan") is None:
					diagnostic["study_plan"] = diagnostic_raw.get("study_plan")
				if "recommendations" not in diagnostic or diagnostic.get("recommendations") is None:
					diagnostic["recommendations"] = diagnostic_raw.get("recommendations")
				
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
				
				break
		
		return {
			"quiz": self.quizzes[quiz_id],
			"responses": self.quiz_responses.get(quiz_id, []),
			"diagnostic": diagnostic  # Include diagnostic data if available
		}

	# AI Diagnostics / Study Plans
	def save_ai_diagnostic(self, diagnostic: Dict[str, Any]) -> Dict[str, Any]:
		"""
		Save AI diagnostic with comprehensive format.
		Decision 10: Option B - Store both analysis_result and denormalized fields
		"""
		did = _uuid()
		
		# Extract analysis_result if provided, otherwise use diagnostic as analysis_result
		analysis_result = diagnostic.get("analysis_result")
		if not analysis_result:
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
			"id": did,
			"quiz_id": diagnostic.get("quiz_id"),
			"analysis_result": analysis_result,
			"overall_performance": diagnostic.get("overall_performance") or analysis_result.get("overall_performance"),
			"topic_breakdown": diagnostic.get("topic_breakdown") or analysis_result.get("topic_breakdown", []),
			"root_cause_analysis": diagnostic.get("root_cause_analysis") or analysis_result.get("root_cause_analysis"),
			"predicted_jamb_score": diagnostic.get("predicted_jamb_score") or analysis_result.get("predicted_jamb_score"),
			"study_plan": diagnostic.get("study_plan") or analysis_result.get("study_plan"),
			"recommendations": diagnostic.get("recommendations") or analysis_result.get("recommendations", []),
		}
		
		# Extract legacy fields for backward compatibility
		topic_breakdown = payload.get("topic_breakdown", [])
		payload["weak_topics"] = [
			{"topic": t.get("topic"), "accuracy": t.get("accuracy"), "severity": t.get("severity")}
			for t in topic_breakdown if t.get("status") == "weak"
		]
		payload["strong_topics"] = [
			{"topic": t.get("topic"), "accuracy": t.get("accuracy")}
			for t in topic_breakdown if t.get("status") == "strong"
		]
		payload["analysis_summary"] = diagnostic.get("analysis_summary") or f"Diagnostic analysis for {payload.get('overall_performance', {}).get('accuracy', 0):.1f}% accuracy"
		payload["projected_score"] = (payload.get("predicted_jamb_score") or {}).get("score", 0)
		payload["foundational_gaps"] = [
			{"gapDescription": r.get("action"), "affectedTopics": [r.get("category")]}
			for r in payload.get("recommendations", []) if r.get("category") == "weakness"
		]
		
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

	# User Latest Quiz/Diagnostic
	def get_user_latest_quiz(self, user_id: str) -> Optional[Dict[str, Any]]:
		"""
		Get user's latest quiz and diagnostic information.
		
		Returns:
			Dict with keys: quiz_id, diagnostic_id, has_diagnostic, created_at
			None if user has no quizzes
		"""
		# Get all quizzes for this user, sorted by created_at (most recent first)
		user_quizzes = [
			q for q in self.quizzes.values()
			if q.get("user_id") == user_id
		]
		
		if not user_quizzes:
			return None
		
		# Sort by started_at (most recent first)
		# Use started_at if available, otherwise fall back to created_at or empty string
		user_quizzes.sort(
			key=lambda x: x.get("started_at") or x.get("created_at", ""),
			reverse=True
		)
		
		latest_quiz = user_quizzes[0]
		quiz_id = latest_quiz.get("id")
		
		# Check if this quiz has a diagnostic
		diagnostic_id = None
		has_diagnostic = False
		for diag in self.ai_diagnostics.values():
			if diag.get("quiz_id") == quiz_id:
				diagnostic_id = diag.get("id")
				has_diagnostic = True
				break
		
		# Use started_at as the creation timestamp (diagnostic_quizzes table uses started_at, not created_at)
		created_at = latest_quiz.get("started_at") or latest_quiz.get("created_at")
		
		return {
			"quiz_id": quiz_id,
			"diagnostic_id": diagnostic_id,
			"has_diagnostic": has_diagnostic,
			"created_at": created_at
		}

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

	# Topics
	def get_topics(self, subject: Optional[str] = None) -> List[Dict[str, Any]]:
		"""Get all topics, optionally filtered by subject."""
		# In-memory implementation doesn't filter by subject for now
		# Subject filtering would require adding a subject field to topics
		return list(self.topics.values())

	# Resources
	def get_resources(self, topic_id: Optional[str] = None, topic_name: Optional[str] = None) -> List[Dict[str, Any]]:
		"""Get resources, optionally filtered by topic_id or topic_name."""
		resources = list(self.resources.values())
		
		if topic_id:
			resources = [r for r in resources if r.get("topic_id") == topic_id]
		
		if topic_name:
			# Find topic by name first
			topic = next((t for t in self.topics.values() if t.get("name") == topic_name), None)
			if topic:
				resources = [r for r in resources if r.get("topic_id") == topic.get("id")]
			else:
				# No topic found with that name, return empty
				return []
		
		return resources


