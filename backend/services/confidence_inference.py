"""
Confidence Score Inference Module
Decision 2: Option C - Infer confidence from time spent and explanation quality
"""

from typing import Dict, Any, Optional


def infer_confidence(question_data: Dict[str, Any]) -> int:
    """
    Infer confidence score (1-5) from available data.
    
    Logic:
    - Time spent: Faster = higher confidence (assuming correct understanding)
    - Explanation quality: Detailed explanations = higher confidence
    - Correctness: Correct answers generally indicate higher confidence
    
    Args:
        question_data: Dictionary with keys:
            - is_correct: bool
            - time_spent_seconds: Optional[int]
            - explanation: Optional[str]
            - confidence: Optional[int] (if already provided)
    
    Returns:
        Confidence score between 1 and 5
    """
    # If confidence is already provided, use it
    if question_data.get("confidence") is not None:
        conf = int(question_data["confidence"])
        return max(1, min(5, conf))  # Clamp to 1-5 range
    
    is_correct = question_data.get("is_correct", False)
    time_spent = question_data.get("time_spent_seconds") or question_data.get("timeSpentSeconds")
    explanation = question_data.get("explanation") or question_data.get("explanationText", "")
    
    # Base confidence on correctness
    if is_correct:
        base_confidence = 4  # Correct answers indicate good understanding
    else:
        base_confidence = 2  # Incorrect answers indicate lower confidence
    
    # Adjust based on time spent
    if time_spent is not None:
        # Very fast (< 30 seconds) might indicate guessing or strong knowledge
        if time_spent < 30:
            if is_correct:
                time_adjustment = 1  # Very confident (answered quickly and correctly)
            else:
                time_adjustment = -1  # Guessed (answered quickly but incorrectly)
        # Moderate time (30-120 seconds) is normal
        elif 30 <= time_spent <= 120:
            time_adjustment = 0
        # Slow (> 120 seconds) might indicate uncertainty
        else:
            time_adjustment = -1 if not is_correct else 0
    else:
        time_adjustment = 0
    
    # Adjust based on explanation quality
    explanation_quality = _analyze_explanation_quality(explanation)
    explanation_adjustment = explanation_quality
    
    # Calculate final confidence
    confidence = base_confidence + time_adjustment + explanation_adjustment
    
    # Clamp to 1-5 range
    return max(1, min(5, confidence))


def _analyze_explanation_quality(explanation: str) -> int:
    """
    Analyze explanation quality and return adjustment factor.
    
    Returns:
        -1 to +1 adjustment based on explanation quality
    """
    if not explanation or len(explanation.strip()) == 0:
        return -1  # No explanation suggests uncertainty
    
    explanation_lower = explanation.lower()
    explanation_length = len(explanation.strip())
    
    # Detailed explanations (> 50 chars) indicate understanding
    if explanation_length > 50:
        # Check for thoughtful indicators
        thoughtful_words = ["because", "since", "therefore", "however", "when", "if", "formula", "method"]
        if any(word in explanation_lower for word in thoughtful_words):
            return 1  # Thoughtful explanation
        return 0
    
    # Short explanations might indicate uncertainty
    elif explanation_length < 20:
        # Check for uncertainty indicators
        uncertain_words = ["guess", "think", "maybe", "probably", "not sure", "don't know"]
        if any(word in explanation_lower for word in uncertain_words):
            return -1  # Explicit uncertainty
        return 0
    
    # Medium-length explanations
    else:
        return 0


def add_confidence_scores(questions_list: list) -> list:
    """
    Add inferred confidence scores to a list of questions.
    
    Args:
        questions_list: List of question dictionaries
        
    Returns:
        List of questions with confidence scores added
    """
    result = []
    for question in questions_list:
        question_copy = question.copy()
        
        # Convert time_spent_seconds if it's in camelCase
        if "timeSpentSeconds" in question_copy and "time_spent_seconds" not in question_copy:
            question_copy["time_spent_seconds"] = question_copy.pop("timeSpentSeconds")
        
        # Infer confidence if not provided
        question_copy["confidence"] = infer_confidence(question_copy)
        result.append(question_copy)
    
    return result

