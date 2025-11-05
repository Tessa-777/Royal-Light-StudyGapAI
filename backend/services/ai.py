import os
import hashlib
import json
from typing import Any, Dict, List
from flask import current_app

try:
	import google.generativeai as genai  # type: ignore
except Exception:  # pragma: no cover
	genai = None


class AIService:
	def __init__(self, api_key: str | None, model_name: str, mock: bool) -> None:
		self.mock = mock or not api_key or genai is None
		self.model_name = model_name
		self.client = None
		if not self.mock and api_key and genai is not None:
			genai.configure(api_key=api_key)
			self.client = genai.GenerativeModel(model_name)

	def _mock_analysis(self, responses: List[Dict[str, Any]]) -> Dict[str, Any]:
		incorrect = [r for r in responses if not r.get("isCorrect")]
		projected = 165
		return {
			"weakTopics": [{"topicId": r.get("questionId"), "topicName": "Algebra", "severity": "medium", "rootCause": "factoring"} for r in incorrect[:3]],
			"strongTopics": [{"topicId": r.get("questionId"), "topicName": "Geometry", "score": 90} for r in responses[:3]],
			"analysisSummary": "Baseline mock analysis for testing.",
			"projectedScore": projected,
			"foundationalGaps": [{"gapDescription": "Weak arithmetic fluency", "affectedTopics": ["Algebra"]}],
		}

	def analyze_diagnostic(self, responses: List[Dict[str, Any]]) -> Dict[str, Any]:
		if self.mock:
			return self._mock_analysis(responses)

		# Caching by hash of responses
		cache = current_app.extensions.get("cache") if current_app else None
		cache_key = None
		if cache:
			cache_key = f"ai:analyze:{hashlib.sha256(json.dumps(responses, sort_keys=True).encode()).hexdigest()}"
			cached = cache.get(cache_key)
			if cached:
				return cached

		prompt = (
			"You are an expert JAMB Mathematics tutor in Nigeria.\n\n"
			"A student just completed a 30-question diagnostic quiz. Analyze their performance and identify:\n"
			"1. Weak topics (topics where they scored <60%)\n"
			"2. Strong topics (topics where they scored >80%)\n"
			"3. ROOT CAUSES of weaknesses (e.g., 'struggles with quadratics because doesn't understand factoring')\n"
			"4. Foundational gaps (basic concepts they're missing)\n\n"
			f"Student data:\n{responses}\n\n"
			"Return a JSON object with this structure:\n"
			"{\n  'weakTopics': [{'topicId': '...', 'topicName': '...', 'severity': '...', 'rootCause': '...'}],\n"
			"  'strongTopics': [{'topicId': '...', 'topicName': '...', 'score': 85}],\n"
			"  'analysisSummary': '...',\n  'projectedScore': 165,\n  'foundationalGaps': [{'gapDescription': '...', 'affectedTopics': ['...']}]\n}"
		)
		result = self.client.generate_content(prompt)
		# Expect model to return JSON text
		text = result.text if hasattr(result, "text") else str(result)
		result_json = json.loads(text)
		if cache and cache_key:
			cache.set(cache_key, result_json, timeout=300)
		return result_json

	def generate_study_plan(self, weak_topics: List[Dict[str, Any]], target_score: int, current_score: int, weeks_available: int = 6) -> Dict[str, Any]:
		if self.mock:
			weeks = []
			for i in range(weeks_available):
				weeks.append({
					"weekNumber": i + 1,
					"focus": "Foundations first" if i == 0 else "Progressive mastery",
					"topics": [
						{"topicId": "algebra", "topicName": "Algebra", "dailyGoals": "Practice 10 problems", "estimatedTime": "40 mins/day",
						 "resources": [{"type": "video", "title": "Algebra Basics", "url": "https://example.com", "duration": 15}]},
					],
					"milestones": "Complete 50 practice problems" if i == 0 else "Take mini-quiz",
					"daily": [{"day": d + 1, "minutes": 40} for d in range(7)],
				})
			return {"weeks": weeks}

		# Cache by weak topics + params
		cache = current_app.extensions.get("cache") if current_app else None
		cache_key = None
		if cache:
			cache_key = f"ai:plan:{hashlib.sha256(json.dumps({"w": weak_topics, "t": target_score, "c": current_score, "n": weeks_available}, sort_keys=True).encode()).hexdigest()}"
			cached = cache.get(cache_key)
			if cached:
				return cached

		prompt = (
			"You are a JAMB prep expert. Create a 6-week study plan for a student with these weak topics: "
			f"{weak_topics}\n\nTarget score: {target_score}\nCurrent projected score: {current_score}\nWeeks available: {weeks_available}\n\n"
			"Rules:\n- Start with foundational gaps FIRST\n- Build progressively (don't jump to advanced topics)\n- Each week should have 3-4 topics max\n- Include daily time estimates (30-45 mins/day)\n- Prioritize topics with highest JAMB weight\n\n"
			"Return JSON structured as N weeks of daily study goals with fields weekNumber, focus, topics[{topicId, topicName, dailyGoals, estimatedTime, resources[{type, title, url, duration}]}], milestones, daily[{day, minutes}]."
		)
		result = self.client.generate_content(prompt)
		text = result.text if hasattr(result, "text") else str(result)
		result_json = json.loads(text)
		if cache and cache_key:
			cache.set(cache_key, result_json, timeout=300)
		return result_json

	def explain_answer(self, payload: Dict[str, Any]) -> Dict[str, Any]:
		if self.mock:
			return {
				"explanation": "Review the concept and try similar problems.",
				"correctReasoning": "Compare options, compute directly.",
				"commonMistake": "Mis-reading the question.",
				"relatedTopics": ["Algebra"],
			}

		prompt = (
			"Provide a concise explanation and correction for the following question/answer pair in JSON with keys explanation, correctReasoning, commonMistake, relatedTopics.\n"
			f"Data: {payload}"
		)
		result = self.client.generate_content(prompt)
		text = result.text if hasattr(result, "text") else str(result)
		import json

		return json.loads(text)


