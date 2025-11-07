"""
Enhanced AI Service for AI/SE Integration
Implements structured output, validation, and comprehensive diagnostic analysis
"""

import os
import hashlib
import json
from typing import Any, Dict, List
from datetime import datetime, timezone
from flask import current_app
import requests

from .ai_prompts import SYSTEM_INSTRUCTION, build_user_prompt
from .ai_schemas import RESPONSE_SCHEMA, VALID_ERROR_TYPES, VALID_TOPIC_STATUSES
from .confidence_inference import add_confidence_scores
from ..utils.calculations import (
	validate_and_correct_fluency_index,
	validate_and_correct_jamb_score,
	validate_topic_status,
	validate_error_type,
	calculate_jamb_base_score
)


class AIAPIError(Exception):
	"""Custom exception for AI API errors with HTTP status code"""
	def __init__(self, message: str, status_code: int = 503):
		self.message = message
		self.status_code = status_code
		super().__init__(message)


class EnhancedAIService:
	"""
	Enhanced AI Service with structured output and validation.
	Implements AI/SE diagnostic analysis with comprehensive validation.
	"""
	
	def __init__(self, api_key: str | None, model_name: str, mock: bool) -> None:
		"""
		Initialize Enhanced AI Service.
		
		Args:
			api_key: Gemini API key
			model_name: Model name (e.g., 'gemini-2.0-flash')
			mock: Whether to use mock mode
		"""
		self.mock = mock or not api_key
		self.model_name = model_name
		self.api_key = api_key
		self.base_url = "https://generativelanguage.googleapis.com/v1beta"

	def _mock_analysis(self, quiz_data: Dict[str, Any]) -> Dict[str, Any]:
		"""
		Generate realistic mock analysis data matching new format.
		Decision 12: Option A - Realistic mock data
		
		Args:
			quiz_data: Quiz data dictionary
			
		Returns:
			Mock analysis result matching RESPONSE_SCHEMA
		"""
		questions_list = quiz_data.get("questions_list", [])
		total_questions = len(questions_list)
		correct_answers = sum(1 for q in questions_list if q.get("is_correct", False))
		accuracy = (correct_answers / total_questions * 100.0) if total_questions > 0 else 0.0
		time_taken = quiz_data.get("time_taken", 0)
		
		# Calculate average confidence
		confidences = [q.get("confidence", 3) for q in questions_list]
		avg_confidence = sum(confidences) / len(confidences) if confidences else 3.0
		
		# Group by topic
		topic_stats = {}
		for q in questions_list:
			topic = q.get("topic", "Unknown")
			if topic not in topic_stats:
				topic_stats[topic] = {"total": 0, "correct": 0, "confidences": []}
			topic_stats[topic]["total"] += 1
			if q.get("is_correct", False):
				topic_stats[topic]["correct"] += 1
			topic_stats[topic]["confidences"].append(q.get("confidence", 3))
		
		# Build topic breakdown
		topic_breakdown = []
		for topic, stats in topic_stats.items():
			topic_accuracy = (stats["correct"] / stats["total"] * 100.0) if stats["total"] > 0 else 0.0
			topic_avg_confidence = sum(stats["confidences"]) / len(stats["confidences"]) if stats["confidences"] else 3.0
			fluency_index = (topic_accuracy / 100.0) * (topic_avg_confidence / 5.0) * 100.0
			
			# Determine status
			if fluency_index < 50 or topic_accuracy < 60:
				status = "weak"
				severity = "critical" if topic_accuracy < 40 else "moderate"
			elif fluency_index <= 70 or topic_accuracy <= 75:
				status = "developing"
				severity = "moderate"
			else:
				status = "strong"
				severity = None
			
			topic_breakdown.append({
				"topic": f"{quiz_data.get('subject', 'Mathematics')}: {topic}",
				"accuracy": round(topic_accuracy, 2),
				"fluency_index": round(fluency_index, 2),
				"status": status,
				"questions_attempted": stats["total"],
				"severity": severity,
				"dominant_error_type": "conceptual_gap" if status == "weak" else "knowledge_gap"
			})
		
		# Calculate JAMB score
		base_score = (accuracy / 100.0) * 400.0
		projected_score = max(0, min(400, round(base_score)))
		
		# Build error distribution
		error_distribution = {
			"conceptual_gap": sum(1 for q in questions_list if not q.get("is_correct", False) and "concept" in q.get("explanation", "").lower()),
			"procedural_error": 0,
			"careless_mistake": sum(1 for q in questions_list if not q.get("is_correct", False) and q.get("confidence", 3) >= 4),
			"knowledge_gap": sum(1 for q in questions_list if not q.get("is_correct", False) and len(q.get("explanation", "")) < 20),
			"misinterpretation": 0
		}
		
		# Find primary weakness
		primary_weakness = max(error_distribution.items(), key=lambda x: x[1])[0] if any(error_distribution.values()) else "knowledge_gap"
		
		# Generate 6-week study plan
		weekly_schedule = []
		weak_topics = [t["topic"] for t in topic_breakdown if t["status"] == "weak"]
		
		for week in range(1, 7):
			if week <= len(weak_topics):
				focus_topic = weak_topics[week - 1]
				focus = f"{focus_topic}: Core Concepts & Practice"
			elif week == 6:
				focus = "Full Exam Simulation & Review"
			else:
				focus = "Review & Advanced Topics"
			
			weekly_schedule.append({
				"week": week,
				"focus": focus,
				"study_hours": 8 if week <= 3 else 6,
				"key_activities": [
					f"Review {focus_topic if week <= len(weak_topics) else 'all topics'}",
					"Complete practice problems",
					"Take mini-quiz" if week % 2 == 0 else "Review notes"
				]
			})
		
		# Build recommendations
		recommendations = []
		if weak_topics:
			recommendations.append({
				"priority": 1,
				"category": "weakness",
				"action": f"Focus on {weak_topics[0]} for the next 2 weeks",
				"rationale": f"Your lowest performing topic needs immediate attention"
			})
		
		return {
			"overall_performance": {
				"accuracy": round(accuracy, 2),
				"total_questions": total_questions,
				"correct_answers": correct_answers,
				"avg_confidence": round(avg_confidence, 2),
				"time_per_question": round((time_taken * 60) / total_questions, 2) if total_questions > 0 else 0.0
			},
			"topic_breakdown": topic_breakdown,
			"root_cause_analysis": {
				"primary_weakness": primary_weakness,
				"error_distribution": error_distribution
			},
			"predicted_jamb_score": {
				"score": projected_score,
				"confidence_interval": "± 25 points"
			},
			"study_plan": {
				"weekly_schedule": weekly_schedule
			},
			"recommendations": recommendations
		}

	def analyze_diagnostic(self, quiz_data: Dict[str, Any]) -> Dict[str, Any]:
		"""
		Analyze diagnostic quiz data using Gemini structured output.
		
		Args:
			quiz_data: Dictionary with keys: subject, total_questions, time_taken, questions_list
			
		Returns:
			Complete diagnostic analysis matching RESPONSE_SCHEMA
			
		Raises:
			AIAPIError: If AI analysis fails
			ValueError: If response validation fails
		"""
		# Note: Confidence scores should be added before calling this method (in the route)
		# But we add it here as a safety measure if not already done
		questions_list = quiz_data.get("questions_list", [])
		if any(q.get("confidence") is None for q in questions_list):
			quiz_data = quiz_data.copy()
			quiz_data["questions_list"] = add_confidence_scores(questions_list)
		
		if self.mock:
			return self._mock_analysis(quiz_data)
		
		# Check cache (Decision 13: Option A - Cache by input hash)
		cache = None
		try:
			if current_app:
				cache = current_app.extensions.get("cache_instance")
		except (RuntimeError, AttributeError):
			pass
		
		cache_key = None
		if cache:
			cache_key = f"ai:analyze:{hashlib.sha256(json.dumps(quiz_data, sort_keys=True).encode()).hexdigest()}"
			cached = cache.get(cache_key)
			if cached:
				return cached
		
		# Build prompt with system instruction
		user_prompt = build_user_prompt(quiz_data)
		
		# Combine system instruction and user prompt
		full_prompt = f"{SYSTEM_INSTRUCTION}\n\n{user_prompt}\n\nRemember: Return ONLY valid JSON matching the required schema. No markdown, no code blocks, no explanations outside JSON."
		
		# Call Gemini API via REST with structured output
		text = self._call_gemini_api_structured(full_prompt)
		
		if not text:
			raise AIAPIError("Empty response from Gemini API", 503)
		
		# Parse JSON
		try:
			result = json.loads(text)
		except json.JSONDecodeError as e:
			raise ValueError(f"Failed to parse JSON from Gemini response: {str(e)}")
		
		# Validate and correct response (Decision 7: Option B, Decision 8: Option B)
		result = self._validate_and_correct_response(result, quiz_data)
		
		# Cache result
		if cache and cache_key:
			cache.set(cache_key, result, timeout=300)
		
		return result

	def _call_gemini_api_structured(self, prompt: str) -> str:
		"""
		Call Gemini API via REST with structured output support.
		
		Note: Gemini REST API v1beta supports responseSchema for structured output.
		
		Args:
			prompt: Complete prompt including system instruction
			
		Returns:
			Response text (JSON string)
			
		Raises:
			AIAPIError: If API call fails
		"""
		url = f"{self.base_url}/models/{self.model_name}:generateContent"
		headers = {
			"Content-Type": "application/json",
		}
		params = {"key": self.api_key}
		
		# Build payload with structured output configuration
		payload = {
			"contents": [{
				"parts": [{"text": prompt}]
			}],
			"generationConfig": {
				"responseMimeType": "application/json",
				"responseSchema": RESPONSE_SCHEMA
			}
		}
		
		try:
			response = requests.post(url, json=payload, headers=headers, params=params, timeout=60)
			
			# Check status before raising
			if response.status_code != 200:
				# Get detailed error message
				try:
					error_data = response.json()
					error_msg = error_data.get("error", {}).get("message", str(error_data))
					error_code = error_data.get("error", {}).get("code", response.status_code)
					
					# Log full error for debugging
					if current_app:
						current_app.logger.error(f"Gemini API error (Status {response.status_code}): {error_msg}")
						current_app.logger.error(f"Full error response: {error_data}")
						current_app.logger.error(f"Request URL: {url}")
						current_app.logger.error(f"Model: {self.model_name}")
					
					# Raise with detailed error
					raise AIAPIError(
						f"Gemini API error (Status {response.status_code}): {error_msg}", 
						response.status_code
					)
				except (ValueError, KeyError):
					# If can't parse error, raise with response text
					error_msg = response.text[:500]
					if current_app:
						current_app.logger.error(f"Gemini API error (Status {response.status_code}): {error_msg}")
					raise AIAPIError(
						f"Gemini API error (Status {response.status_code}): {error_msg}",
						response.status_code
					)
			
			response.raise_for_status()  # This should not raise if status is 200
			data = response.json()
			
			# Extract text from response
			if "candidates" in data and len(data["candidates"]) > 0:
				candidate = data["candidates"][0]
				if "content" in candidate and "parts" in candidate["content"]:
					if len(candidate["content"]["parts"]) > 0:
						text = candidate["content"]["parts"][0].get("text", "")
						# Clean text - remove markdown code blocks if present
						text = text.strip()
						if text.startswith('```json'):
							text = text[7:]
						if text.startswith('```'):
							text = text[3:]
						if text.endswith('```'):
							text = text[:-3]
						return text.strip()
			
			raise ValueError(f"Unexpected response format: {data}")
			
		except requests.exceptions.HTTPError as e:
			error_code = None
			error_message = ""
			if e.response:
				error_code = e.response.status_code
				try:
					error_data = e.response.json()
					# Extract detailed error message
					if isinstance(error_data, dict):
						error_message = error_data.get("error", {}).get("message", str(error_data))
						if not error_message:
							error_message = str(error_data)
					else:
						error_message = str(error_data)
				except:
					error_message = e.response.text or str(e)
			else:
				error_message = str(e)
			
			# Log detailed error for debugging
			if current_app:
				current_app.logger.error(f"Gemini API error: Status {error_code}, Model: {self.model_name}, URL: {url}, Error: {error_message}")
			
			# Decision 14: Option A - Return errors, no retry
			if error_code == 429 or '429' in error_message or 'RESOURCE_EXHAUSTED' in error_message.upper():
				raise AIAPIError("AI service rate limit exceeded. Please try again later.", 429)
			elif error_code == 503 or '503' in error_message or 'UNAVAILABLE' in error_message.upper():
				raise AIAPIError("AI service temporarily unavailable. Please try again later.", 503)
			else:
				# Include more details in error message
				detailed_error = f"AI service error (Status {error_code}): {error_message}"
				raise AIAPIError(detailed_error, error_code or 503)
		except Exception as e:
			error_message = str(e)
			if '429' in error_message or 'RESOURCE_EXHAUSTED' in error_message.upper():
				raise AIAPIError("AI service rate limit exceeded. Please try again later.", 429)
			elif '503' in error_message or 'UNAVAILABLE' in error_message.upper():
				raise AIAPIError("AI service temporarily unavailable. Please try again later.", 503)
			else:
				raise AIAPIError(f"AI service error: {error_message}", 503)

	def _validate_and_correct_response(self, result: Dict[str, Any], quiz_data: Dict[str, Any]) -> Dict[str, Any]:
		"""
		Validate and correct AI response.
		
		Decision 7: Option B - Validate Fluency Index calculations
		Decision 8: Option B - Recalculate JAMB score
		Decision 6: Option A - Strict error type validation
		Decision 15: Option C - Strict validation with helpful error messages
		
		Args:
			result: AI response dictionary
			quiz_data: Original quiz data for validation
			
		Returns:
			Validated and corrected response
		"""
		questions_list = quiz_data.get("questions_list", [])
		
		# Validate overall_performance
		if "overall_performance" not in result:
			raise ValueError("Missing 'overall_performance' in AI response")
		
		overall_perf = result["overall_performance"]
		overall_accuracy = overall_perf.get("accuracy", 0)
		
		# Validate and correct topic_breakdown
		if "topic_breakdown" not in result:
			raise ValueError("Missing 'topic_breakdown' in AI response")
		
		corrected_breakdown = []
		for topic in result["topic_breakdown"]:
			# Validate and correct Fluency Index
			corrected_topic = validate_and_correct_fluency_index(topic, questions_list)
			
			# Validate and correct status
			corrected_topic["status"] = validate_topic_status(corrected_topic)
			
			# Validate error types (field is optional, so remove if invalid)
			if corrected_topic.get("dominant_error_type"):
				try:
					corrected_topic["dominant_error_type"] = validate_error_type(corrected_topic["dominant_error_type"])
				except ValueError:
					# Remove field if invalid (field is optional in schema)
					corrected_topic.pop("dominant_error_type", None)
			
			# Validate severity (field is optional)
			if corrected_topic.get("severity") and corrected_topic["severity"] not in ["critical", "moderate", "mild"]:
				# Remove field if invalid (field is optional in schema)
				corrected_topic.pop("severity", None)
			
			corrected_breakdown.append(corrected_topic)
		
		result["topic_breakdown"] = corrected_breakdown
		
		# Validate and correct root_cause_analysis
		if "root_cause_analysis" not in result:
			raise ValueError("Missing 'root_cause_analysis' in AI response")
		
		rca = result["root_cause_analysis"]
		try:
			rca["primary_weakness"] = validate_error_type(rca.get("primary_weakness", "knowledge_gap"))
		except ValueError as e:
			rca["primary_weakness"] = "knowledge_gap"  # Default fallback
		
		# Validate error_distribution
		error_dist = rca.get("error_distribution", {})
		validated_dist = {}
		for error_type in VALID_ERROR_TYPES:
			count = error_dist.get(error_type, 0)
			if not isinstance(count, int) or count < 0:
				count = 0
			validated_dist[error_type] = count
		rca["error_distribution"] = validated_dist
		
		# Validate and correct predicted_jamb_score
		if "predicted_jamb_score" not in result:
			raise ValueError("Missing 'predicted_jamb_score' in AI response")
		
		result["predicted_jamb_score"] = validate_and_correct_jamb_score(
			result["predicted_jamb_score"],
			overall_accuracy
		)
		
		# Validate study_plan
		if "study_plan" not in result:
			raise ValueError("Missing 'study_plan' in AI response")
		
		study_plan = result["study_plan"]
		if "weekly_schedule" not in study_plan:
			raise ValueError("Missing 'weekly_schedule' in study_plan")
		
		weekly_schedule = study_plan["weekly_schedule"]
		if len(weekly_schedule) != 6:
			raise ValueError(f"Study plan must have exactly 6 weeks, got {len(weekly_schedule)}")
		
		# Validate recommendations
		if "recommendations" not in result:
			result["recommendations"] = []
		
		return result

