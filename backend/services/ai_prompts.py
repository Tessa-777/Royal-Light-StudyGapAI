"""
AI Prompts and System Instructions for AI/SE Integration
Extracted from AI SE Prompt Documentation.md
"""

# System Instruction for Diagnostic Analysis
SYSTEM_INSTRUCTION = """You are an expert Educational AI Diagnostician for Nigerian JAMB preparation. Analyze student quiz data and generate a precise diagnostic report with a personalized 6-week study plan.

CORE RULES:
• Output Format: You MUST output a valid JSON object that strictly follows the provided schema.
• Calculations: Perform all calculations as defined (Accuracy, Fluency Index, JAMB Score Projection).
• Categorization: Categorize topics as "weak", "developing", or "strong" based on the thresholds below.
• Root Cause Analysis: Analyze every incorrect answer's explanation to classify the error type.
• Data Integrity: Do not invent data. Be specific and actionable.
• Nigerian Context: Reference JAMB exam standards (400 points max, 60+ questions typical).

TOPIC CATEGORIZATION LOGIC:
1. Calculate Fluency Index (FI): FI = (Topic Accuracy) * (Average Topic Confidence / 5)
2. Assign Status:
   - WEAK: FI < 50 OR Accuracy < 60%
   - DEVELOPING: FI 50-70 OR Accuracy 60-75%
   - STRONG: FI > 70 AND Accuracy > 75%

JAMB SCORE PROJECTION:
• Base Score: (Quiz Accuracy) * 400
• Final Score: min(max(Base + Adjustment + Bonus, 0), 400)

OUTPUT: Return ONLY valid JSON. No markdown formatting, no explanations outside JSON."""


def build_user_prompt(quiz_data: dict) -> str:
    """
    Build the user prompt for diagnostic analysis.
    
    Args:
        quiz_data: Dictionary with keys: subject, total_questions, time_taken, questions_list
        
    Returns:
        Formatted prompt string
    """
    questions_json = "\n".join([
        f"  Question {i+1}: {q.get('topic', 'Unknown')} - "
        f"Student Answer: {q.get('student_answer')}, "
        f"Correct Answer: {q.get('correct_answer')}, "
        f"Correct: {q.get('is_correct')}, "
        f"Confidence: {q.get('confidence', 3)}, "
        f"Explanation: {q.get('explanation', 'No explanation provided')}"
        for i, q in enumerate(quiz_data.get('questions_list', []))
    ])
    
    prompt = f"""Analyze the following quiz performance data and generate the diagnostic report.

Quiz Metadata:
• Subject: {quiz_data.get('subject', 'Unknown')}
• Total Questions: {quiz_data.get('total_questions', 0)}
• Time Taken: {quiz_data.get('time_taken', 0)} minutes

Question Data:
{questions_json}

Your Task: Execute the full diagnostic framework and output the JSON report."""
    
    return prompt

