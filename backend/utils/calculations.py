"""
Calculation validation and recalculation utilities
Decision 7: Option B - Validate Fluency Index calculations
Decision 8: Option B - Recalculate JAMB score base, validate range
"""

from typing import Dict, Any, List, Tuple
import math


def calculate_fluency_index(topic_accuracy: float, avg_confidence: float) -> float:
    """
    Calculate Fluency Index: FI = (Topic Accuracy) * (Average Topic Confidence / 5)
    
    Args:
        topic_accuracy: Accuracy percentage (0-100)
        avg_confidence: Average confidence score (1-5)
        
    Returns:
        Fluency Index value
    """
    return (topic_accuracy / 100.0) * (avg_confidence / 5.0) * 100.0


def validate_and_correct_fluency_index(topic_breakdown: Dict[str, Any], questions_list: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Validate and correct Fluency Index calculation for a topic.
    
    Args:
        topic_breakdown: Topic breakdown from AI response
        questions_list: List of all questions to recalculate from
        
    Returns:
        Corrected topic_breakdown dictionary
    """
    topic_name = topic_breakdown.get("topic", "")
    
    # Extract topic name if it's in "Subject: Topic" format
    # e.g., "Mathematics: Algebra" -> "Algebra"
    topic_parts = topic_name.split(":")
    topic_base = topic_parts[-1].strip() if len(topic_parts) > 1 else topic_name.strip()
    topic_name_lower = topic_name.lower()
    topic_base_lower = topic_base.lower()
    
    # Filter questions for this topic
    # Match if:
    # 1. Exact match (either direction)
    # 2. Quiz topic is contained in AI topic name (e.g., "Algebra" in "Mathematics: Algebra")
    # 3. AI topic base is contained in quiz topic
    # 4. AI topic name is contained in quiz topic
    topic_questions = []
    for q in questions_list:
        quiz_topic = q.get("topic", "").lower()
        quiz_topic_stripped = quiz_topic.strip()
        
        # Check various matching conditions
        if (quiz_topic_stripped == topic_name_lower or  # Exact match
            quiz_topic_stripped == topic_base_lower or  # Base topic match
            quiz_topic_stripped in topic_name_lower or  # Quiz topic in AI topic
            topic_base_lower in quiz_topic_stripped or  # AI base in quiz topic
            topic_name_lower in quiz_topic_stripped):   # AI topic in quiz topic
            topic_questions.append(q)
    
    if not topic_questions:
        return topic_breakdown  # Can't validate without questions
    
    # Recalculate accuracy
    total_questions = len(topic_questions)
    correct_answers = sum(1 for q in topic_questions if q.get("is_correct", False))
    calculated_accuracy = (correct_answers / total_questions * 100.0) if total_questions > 0 else 0.0
    
    # Recalculate average confidence
    confidences = [q.get("confidence", 3) for q in topic_questions]
    calculated_avg_confidence = sum(confidences) / len(confidences) if confidences else 3.0
    
    # Recalculate Fluency Index
    calculated_fi = calculate_fluency_index(calculated_accuracy, calculated_avg_confidence)
    
    # Update topic breakdown with calculated values
    corrected = topic_breakdown.copy()
    corrected["accuracy"] = round(calculated_accuracy, 2)
    corrected["avg_confidence"] = round(calculated_avg_confidence, 2)
    corrected["fluency_index"] = round(calculated_fi, 2)
    corrected["questions_attempted"] = total_questions
    corrected["correct_answers"] = correct_answers
    
    return corrected


def calculate_jamb_base_score(overall_accuracy: float) -> float:
    """
    Calculate JAMB base score: Base Score = (Quiz Accuracy) * 400
    
    Args:
        overall_accuracy: Overall quiz accuracy (0-100)
        
    Returns:
        Base JAMB score (0-400)
    """
    return (overall_accuracy / 100.0) * 400.0


def validate_and_correct_jamb_score(
    predicted_score: Dict[str, Any],
    overall_accuracy: float
) -> Dict[str, Any]:
    """
    Validate and correct JAMB score projection.
    
    Decision 8: Option B - Recalculate base score, validate range
    
    Args:
        predicted_score: Predicted JAMB score from AI response
        overall_accuracy: Overall quiz accuracy (0-100)
        
    Returns:
        Corrected predicted_score dictionary
    """
    ai_score = predicted_score.get("score", 0)
    base_score = calculate_jamb_base_score(overall_accuracy)
    
    # Validate that AI score is in valid range
    if not (0 <= ai_score <= 400):
        # Clamp to valid range
        ai_score = max(0, min(400, ai_score))
    
    # Use AI's score but ensure it's reasonable relative to base score
    # Allow AI's adjustments/bonuses (could be ±50 points from base)
    # But if it's way off, use base score
    if abs(ai_score - base_score) > 100:
        # AI score is too far from base, use base score
        corrected_score = round(base_score)
    else:
        # AI score is reasonable, use it (it may have adjustments)
        corrected_score = round(ai_score)
    
    # Ensure final score is in valid range
    corrected_score = max(0, min(400, corrected_score))
    
    corrected = predicted_score.copy()
    corrected["score"] = corrected_score
    corrected["base_score"] = round(base_score, 2)  # Add base score for reference
    
    return corrected


def validate_topic_status(topic_breakdown: Dict[str, Any]) -> str:
    """
    Validate and correct topic status based on Fluency Index and Accuracy.
    
    Logic:
    - WEAK: FI < 50 OR Accuracy < 60%
    - DEVELOPING: FI 50-70 OR Accuracy 60-75%
    - STRONG: FI > 70 AND Accuracy > 75%
    
    Args:
        topic_breakdown: Topic breakdown dictionary
        
    Returns:
        Corrected status string
    """
    fluency_index = topic_breakdown.get("fluency_index", 0)
    accuracy = topic_breakdown.get("accuracy", 0)
    
    # Determine status
    if fluency_index < 50 or accuracy < 60:
        return "weak"
    elif (50 <= fluency_index <= 70) or (60 <= accuracy <= 75):
        return "developing"
    elif fluency_index > 70 and accuracy > 75:
        return "strong"
    else:
        # Fallback based on accuracy
        if accuracy < 60:
            return "weak"
        elif accuracy < 75:
            return "developing"
        else:
            return "strong"


def validate_error_type(error_type: Any) -> str:
    """
    Validate error type against allowed values.
    
    Decision 6: Option A - Strict validation
    
    Args:
        error_type: Error type to validate
        
    Returns:
        Validated error type string
        
    Raises:
        ValueError: If error type is not valid
    """
    from backend.services.ai_schemas import VALID_ERROR_TYPES
    
    error_str = str(error_type).lower() if error_type else None
    
    if error_str not in VALID_ERROR_TYPES:
        # Try to find closest match
        if "conceptual" in error_str or "concept" in error_str:
            return "conceptual_gap"
        elif "procedural" in error_str or "procedure" in error_str:
            return "procedural_error"
        elif "careless" in error_str:
            return "careless_mistake"
        elif "knowledge" in error_str:
            return "knowledge_gap"
        elif "misinterpret" in error_str or "misunderstand" in error_str:
            return "misinterpretation"
        else:
            raise ValueError(
                f"Invalid error type: {error_type}. "
                f"Must be one of: {', '.join(VALID_ERROR_TYPES)}"
            )
    
    return error_str

