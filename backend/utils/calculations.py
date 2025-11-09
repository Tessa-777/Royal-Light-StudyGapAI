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
        Corrected topic_breakdown dictionary with guaranteed numeric fluency_index
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
    
    # If no questions matched, try to use the original topic breakdown but ensure fluency_index is a number
    if not topic_questions:
        corrected = topic_breakdown.copy()
        # Ensure fluency_index is always a number (never null/undefined)
        if corrected.get("fluency_index") is None:
            corrected["fluency_index"] = 0.0
        else:
            try:
                corrected["fluency_index"] = float(corrected["fluency_index"])
            except (ValueError, TypeError):
                corrected["fluency_index"] = 0.0
        # Ensure it's between 0 and 100
        corrected["fluency_index"] = max(0.0, min(100.0, corrected["fluency_index"]))
        return corrected
    
    # Recalculate accuracy
    total_questions = len(topic_questions)
    correct_answers = sum(1 for q in topic_questions if q.get("is_correct", False))
    calculated_accuracy = (correct_answers / total_questions * 100.0) if total_questions > 0 else 0.0
    
    # Recalculate average confidence
    confidences = [q.get("confidence", 3) for q in topic_questions]
    calculated_avg_confidence = sum(confidences) / len(confidences) if confidences else 3.0
    
    # Recalculate Fluency Index - always ensure it's a number
    calculated_fi = calculate_fluency_index(calculated_accuracy, calculated_avg_confidence)
    calculated_fi = max(0.0, min(100.0, calculated_fi))  # Clamp to 0-100
    
    # Update topic breakdown with calculated values
    corrected = topic_breakdown.copy()
    corrected["accuracy"] = round(calculated_accuracy, 2)
    corrected["avg_confidence"] = round(calculated_avg_confidence, 2)
    corrected["fluency_index"] = round(calculated_fi, 2)  # Always a number, never null
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
        Corrected predicted_score dictionary with valid score (0-400) and confidence_interval
    """
    ai_score = predicted_score.get("score", 0)
    
    # Ensure ai_score is a number
    try:
        ai_score = float(ai_score)
    except (ValueError, TypeError):
        ai_score = 0
    
    base_score = calculate_jamb_base_score(overall_accuracy)
    
    # Validate that AI score is in valid range
    if not (0 <= ai_score <= 400) or ai_score == 0:
        # If score is invalid or 0, use base score
        corrected_score = round(base_score)
    elif abs(ai_score - base_score) > 100:
        # AI score is too far from base, use base score
        corrected_score = round(base_score)
    else:
        # AI score is reasonable, use it (it may have adjustments)
        corrected_score = round(ai_score)
    
    # Ensure final score is in valid range
    corrected_score = max(0, min(400, corrected_score))
    
    # Calculate confidence interval based on sample size and performance
    # For smaller samples, use wider intervals
    if overall_accuracy < 50:
        confidence_range = "± 30 points"
    elif overall_accuracy < 70:
        confidence_range = "± 25 points"
    else:
        confidence_range = "± 20 points"
    
    # Get confidence_interval from AI response, or use calculated one
    confidence_interval = predicted_score.get("confidence_interval", confidence_range)
    
    # Ensure confidence_interval is not "N/A" or empty
    if not confidence_interval or confidence_interval.upper() in ["N/A", "NA", "NULL", "NONE", ""]:
        confidence_interval = confidence_range
    
    corrected = predicted_score.copy()
    corrected["score"] = corrected_score
    corrected["confidence_interval"] = confidence_interval
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


def validate_and_correct_overall_performance(
    overall_performance: Dict[str, Any],
    questions_list: List[Dict[str, Any]],
    time_taken_minutes: float = 0
) -> Dict[str, Any]:
    """
    Validate and recalculate overall_performance from actual quiz data.
    
    This ensures accuracy, correct_answers, and total_questions are correct.
    
    Args:
        overall_performance: Overall performance from AI response
        questions_list: List of all questions to recalculate from
        time_taken_minutes: Total time taken in minutes
        
    Returns:
        Corrected overall_performance dictionary
    """
    total_questions = len(questions_list)
    correct_answers = sum(1 for q in questions_list if q.get("is_correct", False))
    accuracy = (correct_answers / total_questions * 100.0) if total_questions > 0 else 0.0
    
    # Calculate average confidence
    confidences = [q.get("confidence", 3) for q in questions_list]
    avg_confidence = sum(confidences) / len(confidences) if confidences else 3.0
    
    # Calculate time per question (in seconds)
    time_per_question = 0.0
    if total_questions > 0:
        if time_taken_minutes > 0:
            time_per_question = (time_taken_minutes * 60.0) / total_questions
        else:
            # Fallback: calculate from time_spent_seconds if available
            time_spent_list = [q.get("time_spent_seconds", 0) for q in questions_list]
            total_time_spent = sum(time_spent_list)
            if total_time_spent > 0:
                time_per_question = total_time_spent / total_questions
    
    corrected = overall_performance.copy()
    corrected["accuracy"] = round(accuracy, 2)
    corrected["total_questions"] = total_questions
    corrected["correct_answers"] = correct_answers
    corrected["avg_confidence"] = round(avg_confidence, 2)
    corrected["time_per_question"] = round(time_per_question, 2)
    
    return corrected


def ensure_all_topics_in_breakdown(
    topic_breakdown: List[Dict[str, Any]],
    questions_list: List[Dict[str, Any]],
    subject: str = "Mathematics"
) -> List[Dict[str, Any]]:
    """
    Ensure all distinct topics from questions are included in topic_breakdown.
    
    This fixes Issue 1: If AI only returns 1 topic but questions cover multiple topics,
    we ensure all topics are included.
    
    Args:
        topic_breakdown: Topic breakdown from AI response
        questions_list: List of all questions
        subject: Subject name (e.g., "Mathematics")
        
    Returns:
        Complete topic_breakdown with all topics included
    """
    # Get all distinct topics from questions
    topics_from_questions = set()
    for q in questions_list:
        topic = q.get("topic", "Unknown")
        if topic and topic.strip():
            topics_from_questions.add(topic.strip())
    
    # Create a map of existing topics in breakdown (by base name)
    existing_topics_map = {}
    for topic_item in topic_breakdown:
        topic_name = topic_item.get("topic", "")
        # Extract base topic name
        if ":" in topic_name:
            base_topic = topic_name.split(":")[-1].strip()
        else:
            base_topic = topic_name.strip()
        existing_topics_map[base_topic.lower()] = topic_item
    
    # Find missing topics
    missing_topics = []
    for topic in topics_from_questions:
        topic_lower = topic.lower()
        if topic_lower not in existing_topics_map:
            missing_topics.append(topic)
    
    # Add missing topics to breakdown
    for topic in missing_topics:
        # Find questions for this topic
        topic_questions = [q for q in questions_list if q.get("topic", "").strip().lower() == topic.lower()]
        
        if topic_questions:
            total = len(topic_questions)
            correct = sum(1 for q in topic_questions if q.get("is_correct", False))
            accuracy = (correct / total * 100.0) if total > 0 else 0.0
            
            confidences = [q.get("confidence", 3) for q in topic_questions]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 3.0
            
            fluency_index = calculate_fluency_index(accuracy, avg_confidence)
            fluency_index = max(0.0, min(100.0, fluency_index))
            
            # Determine status
            status = validate_topic_status({
                "fluency_index": fluency_index,
                "accuracy": accuracy
            })
            
            # Determine severity
            severity = None
            if status == "weak":
                severity = "critical" if accuracy < 40 else "moderate"
            elif status == "developing":
                severity = "moderate"
            
            # Add new topic to breakdown
            new_topic = {
                "topic": f"{subject}: {topic}",
                "accuracy": round(accuracy, 2),
                "fluency_index": round(fluency_index, 2),
                "status": status,
                "questions_attempted": total,
                "severity": severity,
                "dominant_error_type": "knowledge_gap" if status == "weak" else None
            }
            topic_breakdown.append(new_topic)
    
    return topic_breakdown


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

