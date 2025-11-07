"""
Comprehensive tests for AI/SE Integration
Tests the enhanced diagnostic analysis with structured output
"""

import pytest
import json
from datetime import datetime, timezone
from backend.services.ai_enhanced import EnhancedAIService, AIAPIError
from backend.services.confidence_inference import infer_confidence, add_confidence_scores
from backend.utils.calculations import (
	calculate_fluency_index,
	validate_and_correct_fluency_index,
	validate_and_correct_jamb_score,
	validate_topic_status,
	validate_error_type
)


class TestConfidenceInference:
	"""Test confidence score inference (Decision 2: Option C)"""
	
	def test_infer_confidence_correct_answer(self):
		"""Test confidence inference for correct answers"""
		question = {
			"is_correct": True,
			"time_spent_seconds": 45,
			"explanation": "I understood the concept and applied the formula correctly"
		}
		confidence = infer_confidence(question)
		assert 3 <= confidence <= 5, "Correct answers should have higher confidence"
	
	def test_infer_confidence_incorrect_answer(self):
		"""Test confidence inference for incorrect answers"""
		question = {
			"is_correct": False,
			"time_spent_seconds": 120,
			"explanation": "I guessed"
		}
		confidence = infer_confidence(question)
		assert 1 <= confidence <= 3, "Incorrect answers should have lower confidence"
	
	def test_infer_confidence_with_provided_value(self):
		"""Test that provided confidence is used"""
		question = {
			"confidence": 5,
			"is_correct": False
		}
		confidence = infer_confidence(question)
		assert confidence == 5
	
	def test_add_confidence_scores(self):
		"""Test adding confidence scores to question list"""
		questions = [
			{"is_correct": True, "time_spent_seconds": 30, "explanation": "Correct"},
			{"is_correct": False, "time_spent_seconds": 60, "explanation": "Wrong"}
		]
		result = add_confidence_scores(questions)
		assert len(result) == 2
		assert "confidence" in result[0]
		assert result[0]["confidence"] >= result[1]["confidence"]


class TestCalculations:
	"""Test calculation validation and correction (Decision 7: Option B, Decision 8: Option B)"""
	
	def test_calculate_fluency_index(self):
		"""Test Fluency Index calculation"""
		fi = calculate_fluency_index(75.0, 4.0)
		expected = (75.0 / 100.0) * (4.0 / 5.0) * 100.0
		assert abs(fi - expected) < 0.01
	
	def test_validate_topic_status_weak(self):
		"""Test topic status validation for weak topics"""
		topic = {
			"fluency_index": 30.0,
			"accuracy": 50.0
		}
		status = validate_topic_status(topic)
		assert status == "weak"
	
	def test_validate_topic_status_developing(self):
		"""Test topic status validation for developing topics"""
		topic = {
			"fluency_index": 65.0,
			"accuracy": 70.0
		}
		status = validate_topic_status(topic)
		assert status == "developing"
	
	def test_validate_topic_status_strong(self):
		"""Test topic status validation for strong topics"""
		topic = {
			"fluency_index": 80.0,
			"accuracy": 85.0
		}
		status = validate_topic_status(topic)
		assert status == "strong"
	
	def test_validate_error_type_strict(self):
		"""Test strict error type validation (Decision 6: Option A)"""
		assert validate_error_type("conceptual_gap") == "conceptual_gap"
		assert validate_error_type("knowledge_gap") == "knowledge_gap"
		
		# Test that invalid types raise error
		with pytest.raises(ValueError):
			validate_error_type("invalid_error_type")
	
	def test_validate_jamb_score_range(self):
		"""Test JAMB score validation (Decision 8: Option B)"""
		predicted = {
			"score": 450,  # Out of range
			"confidence_interval": "± 25 points"
		}
		result = validate_and_correct_jamb_score(predicted, 75.0)
		assert 0 <= result["score"] <= 400
	
	def test_validate_jamb_score_reasonable(self):
		"""Test JAMB score validation for reasonable scores"""
		predicted = {
			"score": 250,
			"confidence_interval": "± 25 points"
		}
		result = validate_and_correct_jamb_score(predicted, 62.5)
		# Base score would be 250, so AI score of 250 is reasonable
		assert result["score"] == 250


class TestEnhancedAIService:
	"""Test Enhanced AI Service"""
	
	@pytest.fixture
	def mock_ai_service(self):
		"""Create mock AI service"""
		return EnhancedAIService(api_key=None, model_name="test", mock=True)
	
	def test_mock_analysis_format(self, mock_ai_service):
		"""Test that mock analysis returns correct format"""
		quiz_data = {
			"subject": "Mathematics",
			"total_questions": 3,
			"time_taken": 8.5,
			"questions_list": [
				{
					"id": 1,
					"topic": "Algebra",
					"student_answer": "A",
					"correct_answer": "B",
					"is_correct": False,
					"confidence": 2,
					"explanation": "I thought x squared meant multiply by 2",
					"time_spent_seconds": 60
				},
				{
					"id": 2,
					"topic": "Algebra",
					"student_answer": "C",
					"correct_answer": "C",
					"is_correct": True,
					"confidence": 4,
					"explanation": "I used the quadratic formula correctly",
					"time_spent_seconds": 45
				},
				{
					"id": 3,
					"topic": "Geometry",
					"student_answer": "A",
					"correct_answer": "A",
					"is_correct": True,
					"confidence": 5,
					"explanation": "The area of a triangle is base times height divided by 2",
					"time_spent_seconds": 30
				}
			]
		}
		
		result = mock_ai_service.analyze_diagnostic(quiz_data)
		
		# Validate structure
		assert "overall_performance" in result
		assert "topic_breakdown" in result
		assert "root_cause_analysis" in result
		assert "predicted_jamb_score" in result
		assert "study_plan" in result
		assert "recommendations" in result
		
		# Validate overall_performance
		overall = result["overall_performance"]
		assert "accuracy" in overall
		assert "total_questions" in overall
		assert "correct_answers" in overall
		assert "avg_confidence" in overall
		assert "time_per_question" in overall
		assert overall["total_questions"] == 3
		assert overall["correct_answers"] == 2
		
		# Validate topic_breakdown
		topics = result["topic_breakdown"]
		assert len(topics) > 0
		for topic in topics:
			assert "topic" in topic
			assert "accuracy" in topic
			assert "fluency_index" in topic
			assert "status" in topic
			assert topic["status"] in ["weak", "developing", "strong"]
		
		# Validate study_plan has 6 weeks (Decision 9: Option A)
		study_plan = result["study_plan"]
		assert "weekly_schedule" in study_plan
		assert len(study_plan["weekly_schedule"]) == 6
	
	def test_mock_analysis_all_wrong(self, mock_ai_service):
		"""Test mock analysis with all wrong answers"""
		quiz_data = {
			"subject": "Mathematics",
			"total_questions": 2,
			"time_taken": 5.0,
			"questions_list": [
				{
					"id": 1,
					"topic": "Algebra",
					"student_answer": "A",
					"correct_answer": "B",
					"is_correct": False,
					"confidence": 1,
					"explanation": "I had no idea",
					"time_spent_seconds": 30
				},
				{
					"id": 2,
					"topic": "Algebra",
					"student_answer": "A",
					"correct_answer": "C",
					"is_correct": False,
					"confidence": 2,
					"explanation": "I guessed",
					"time_spent_seconds": 20
				}
			]
		}
		
		result = mock_ai_service.analyze_diagnostic(quiz_data)
		
		assert result["overall_performance"]["accuracy"] == 0.0
		assert result["overall_performance"]["correct_answers"] == 0
		assert result["predicted_jamb_score"]["score"] == 0
	
	def test_mock_analysis_perfect_score(self, mock_ai_service):
		"""Test mock analysis with perfect score"""
		quiz_data = {
			"subject": "Mathematics",
			"total_questions": 1,
			"time_taken": 1.0,
			"questions_list": [
				{
					"id": 1,
					"topic": "Algebra",
					"student_answer": "B",
					"correct_answer": "B",
					"is_correct": True,
					"confidence": 5,
					"explanation": "I understood the concept completely",
					"time_spent_seconds": 60
				}
			]
		}
		
		result = mock_ai_service.analyze_diagnostic(quiz_data)
		
		assert result["overall_performance"]["accuracy"] == 100.0
		assert result["overall_performance"]["correct_answers"] == 1
		assert result["predicted_jamb_score"]["score"] == 400


class TestResponseValidation:
	"""Test response validation (Decision 15: Option C)"""
	
	def test_validate_response_structure(self):
		"""Test that response validation catches missing fields"""
		service = EnhancedAIService(api_key=None, model_name="test", mock=True)
		
		# Missing required fields
		invalid_response = {
			"overall_performance": {},
			# Missing other required fields
		}
		
		quiz_data = {
			"questions_list": []
		}
		
		with pytest.raises((ValueError, KeyError)):
			service._validate_and_correct_response(invalid_response, quiz_data)
	
	def test_validate_response_corrections(self):
		"""Test that response validation corrects calculations"""
		service = EnhancedAIService(api_key=None, model_name="test", mock=True)
		
		# Create a response with incorrect calculations
		response = {
			"overall_performance": {
				"accuracy": 66.67,
				"total_questions": 3,
				"correct_answers": 2,
				"avg_confidence": 3.0,
				"time_per_question": 2.5
			},
			"topic_breakdown": [
				{
					"topic": "Mathematics: Algebra",
					"accuracy": 50.0,
					"fluency_index": 100.0,  # Incorrect - should be 30.0
					"status": "weak",
					"questions_attempted": 2,
					"severity": "critical",
					"dominant_error_type": "conceptual_gap"
				}
			],
			"root_cause_analysis": {
				"primary_weakness": "conceptual_gap",
				"error_distribution": {
					"conceptual_gap": 1,
					"procedural_error": 0,
					"careless_mistake": 0,
					"knowledge_gap": 0,
					"misinterpretation": 0
				}
			},
			"predicted_jamb_score": {
				"score": 500,  # Out of range
				"confidence_interval": "± 25 points"
			},
			"study_plan": {
				"weekly_schedule": [
					{"week": i+1, "focus": f"Week {i+1}", "study_hours": 8, "key_activities": ["Study"]}
					for i in range(6)
				]
			},
			"recommendations": []
		}
		
		quiz_data = {
			"questions_list": [
				{"id": 1, "topic": "Algebra", "is_correct": False, "confidence": 2},
				{"id": 2, "topic": "Algebra", "is_correct": True, "confidence": 4}
			]
		}
		
		# Validation should correct the calculations
		corrected = service._validate_and_correct_response(response, quiz_data)
		
		# Check that Fluency Index was corrected
		algebra_topic = next(t for t in corrected["topic_breakdown"] if "Algebra" in t["topic"])
		assert algebra_topic["fluency_index"] < 50.0  # Should be corrected to ~30.0
		
		# Check that JAMB score was corrected to valid range
		assert 0 <= corrected["predicted_jamb_score"]["score"] <= 400


# Integration test fixtures
@pytest.fixture
def sample_quiz_data():
	"""Sample quiz data for testing"""
	return {
		"subject": "Mathematics",
		"total_questions": 3,
		"time_taken": 8.5,
		"questions_list": [
			{
				"id": 1,
				"topic": "Algebra",
				"student_answer": "A",
				"correct_answer": "B",
				"is_correct": False,
				"explanation": "I thought x squared meant multiply by 2 instead of raising to power",
				"time_spent_seconds": 60
			},
			{
				"id": 2,
				"topic": "Algebra",
				"student_answer": "C",
				"correct_answer": "C",
				"is_correct": True,
				"explanation": "I used the quadratic formula correctly to solve this equation",
				"time_spent_seconds": 45
			},
			{
				"id": 3,
				"topic": "Geometry",
				"student_answer": "A",
				"correct_answer": "A",
				"is_correct": True,
				"explanation": "The area of a triangle is definitely base times height divided by 2",
				"time_spent_seconds": 30
			}
		]
	}


class TestEndToEnd:
	"""End-to-end integration tests"""
	
	def test_full_analysis_flow(self, sample_quiz_data):
		"""Test complete analysis flow"""
		service = EnhancedAIService(api_key=None, model_name="test", mock=True)
		
		# Add confidence scores
		quiz_data = sample_quiz_data.copy()
		quiz_data["questions_list"] = add_confidence_scores(quiz_data["questions_list"])
		
		# Run analysis
		result = service.analyze_diagnostic(quiz_data)
		
		# Validate complete response
		assert "overall_performance" in result
		assert "topic_breakdown" in result
		assert "root_cause_analysis" in result
		assert "predicted_jamb_score" in result
		assert "study_plan" in result
		assert "recommendations" in result
		
		# Validate calculations
		overall = result["overall_performance"]
		expected_accuracy = (2 / 3) * 100.0
		assert abs(overall["accuracy"] - expected_accuracy) < 1.0
		
		# Validate study plan has 6 weeks
		assert len(result["study_plan"]["weekly_schedule"]) == 6

