# Backend Diagnostic Analysis Issues - Documentation

## Overview

This document outlines the backend issues identified in the diagnostic analysis functionality that need to be fixed on the backend side. The frontend is correctly displaying the data it receives, but the backend is providing incorrect or incomplete data.

---

## Issue 1: Only 1 Topic in Topic Breakdown for 5 Questions

### Problem
The diagnostic analysis is only returning 1 topic ("Algebra") in the `topic_breakdown` array, even though 5 questions were answered. For a comprehensive diagnostic quiz, multiple topics should typically be identified and analyzed.

### Root Cause
The backend's AI analysis logic in `/api/ai/analyze-diagnostic` is not correctly identifying and categorizing all distinct topics covered by the quiz questions.

### Expected Behavior
- The `topic_breakdown` array should contain an entry for each distinct topic covered by the quiz questions.
- If 5 questions cover multiple topics (e.g., Algebra, Geometry, Trigonometry), all should be identified and included.
- Each topic should have accurate metrics (accuracy, fluency_index, questions_attempted, status).

### Backend Action Required
1. Review the AI analysis logic that identifies topics from quiz questions.
2. Ensure the analysis correctly extracts and categorizes all topics from the question content.
3. If using question metadata (e.g., `topic` field from questions table), ensure all topics are represented.
4. If using AI to infer topics from question text, improve the prompt or analysis to identify all relevant topics.
5. Ensure the `topic_breakdown` array contains all distinct topics, not just the most common one.

### Expected Response Format
```json
{
  "topic_breakdown": [
    {
      "topic": "Algebra",
      "accuracy": 60,
      "fluency_index": 45,
      "status": "weak",
      "questions_attempted": 3
    },
    {
      "topic": "Geometry",
      "accuracy": 50,
      "fluency_index": 40,
      "status": "weak",
      "questions_attempted": 2
    }
  ]
}
```

---

## Issue 2: Incorrect Overall Performance Accuracy

### Problem
The `overall_performance.accuracy` is showing 0% or 1% when the actual correct answers are 3 out of 5 (which should be 60% accuracy).

### Root Cause
The backend's calculation of `overall_performance.accuracy` is incorrect. The calculation is not properly computing the percentage of correct answers.

### Expected Behavior
- If 3 out of 5 questions are correct, `overall_performance.accuracy` should be 60 (or 60.0).
- `overall_performance.correct_answers` should be 3.
- `overall_performance.total_questions` should be 5.
- The accuracy should be consistent with the topic-level accuracies.

### Backend Action Required
1. Fix the calculation of `overall_performance.accuracy`:
   ```python
   accuracy = (correct_answers / total_questions) * 100
   ```
2. Ensure `correct_answers` is correctly counted from the quiz responses.
3. Ensure `total_questions` matches the actual number of questions in the quiz.
4. Validate that the accuracy calculation is consistent across all diagnostic responses.

### Expected Response Format
```json
{
  "overall_performance": {
    "accuracy": 60.0,  // (3/5) * 100 = 60%
    "total_questions": 5,
    "correct_answers": 3,
    "avg_confidence": 2.8,
    "time_per_question": 1.545
  }
}
```

### Current vs Expected
- **Current:** `{ accuracy: 0, correct_answers: 0, total_questions: 5 }`
- **Expected:** `{ accuracy: 60.0, correct_answers: 3, total_questions: 5 }`

---

## Issue 3: Incorrect JAMB Score Projection

### Problem
The `predicted_jamb_score.score` is showing 2 (or 0) instead of a meaningful score out of 400. The `confidence_interval` is showing "N/A".

### Root Cause
The backend's AI analysis is not correctly calculating the JAMB score projection, or the calculation logic is broken/missing.

### Expected Behavior
- `predicted_jamb_score.score` should be a numerical value between 0 and 400.
- The score should be based on the diagnostic performance (accuracy, topic breakdown, error distribution).
- `confidence_interval` should be a meaningful string (e.g., "280-300", "±25 points", "High Confidence: 285-315").

### Backend Action Required
1. Implement or fix the JAMB score projection calculation:
   - Base the projection on diagnostic accuracy and performance metrics.
   - Use a formula that maps diagnostic performance to JAMB scores (0-400 range).
   - Consider factors like:
     - Overall accuracy percentage
     - Topic-level performance
     - Error distribution patterns
     - Confidence levels
   
2. Calculate confidence interval:
   - Provide a range (e.g., "280-300") or margin of error (e.g., "±25 points").
   - Consider the sample size (number of questions) and performance variance.

3. Example calculation logic (adjust based on your algorithm):
   ```python
   # Example: Map accuracy to JAMB score (0-400)
   base_score = (accuracy / 100) * 400
   # Adjust based on topic performance, error types, etc.
   predicted_score = adjust_score(base_score, topic_performance, error_distribution)
   confidence_range = calculate_confidence_range(predicted_score, sample_size)
   ```

### Expected Response Format
```json
{
  "predicted_jamb_score": {
    "score": 285,  // Out of 400
    "confidence_interval": "270-300"  // Or "±15 points" or "High Confidence: 275-295"
  }
}
```

### Current vs Expected
- **Current:** `{ score: 0, confidence_interval: "N/A" }`
- **Expected:** `{ score: 285, confidence_interval: "270-300" }`

---

## Issue 4: Missing or Null Fluency Index

### Problem
The `fluency_index` in the `topic_breakdown` may be `null`, `undefined`, or `0`, causing the progress bar to appear empty or not display correctly.

### Root Cause
The backend is not calculating or returning a valid `fluency_index` for each topic, or it's returning `null`/`undefined` instead of a numerical value.

### Expected Behavior
- `fluency_index` should always be a numerical value between 0 and 100.
- It should represent the student's fluency/mastery level in that topic.
- Even if fluency is 0, it should be returned as `0`, not `null` or `undefined`.

### Backend Action Required
1. Ensure `fluency_index` is calculated for each topic in the `topic_breakdown`.
2. Return a numerical value (0-100) for `fluency_index`, never `null` or `undefined`.
3. Calculate fluency based on:
   - Accuracy in that topic
   - Response time
   - Confidence levels
   - Error patterns
   - Question difficulty

4. Example calculation (adjust based on your algorithm):
   ```python
   fluency_index = calculate_fluency(
     accuracy=topic_accuracy,
     avg_time=avg_time_per_question,
     confidence=avg_confidence,
     error_types=error_distribution
   )
   # Ensure it's always a number between 0 and 100
   fluency_index = max(0, min(100, fluency_index))
   ```

### Expected Response Format
```json
{
  "topic_breakdown": [
    {
      "topic": "Algebra",
      "accuracy": 60,
      "fluency_index": 45,  // Always a number, never null
      "status": "weak",
      "questions_attempted": 3
    }
  ]
}
```

### Current vs Expected
- **Current:** `{ fluency_index: null }` or `{ fluency_index: undefined }` or `{ fluency_index: 0 }` (if not calculated)
- **Expected:** `{ fluency_index: 45 }` (always a number 0-100)

---

## Summary of Backend Fixes Required

### Priority 1: Critical Data Issues
1. ✅ **Fix overall_performance.accuracy calculation** - Must correctly calculate (correct_answers / total_questions) * 100
2. ✅ **Fix predicted_jamb_score calculation** - Must return a value between 0-400 with meaningful confidence interval
3. ✅ **Ensure fluency_index is always a number** - Never return null/undefined, always return 0-100

### Priority 2: Data Completeness
4. ✅ **Fix topic_breakdown to include all topics** - Identify and include all distinct topics from quiz questions
5. ✅ **Ensure data consistency** - Overall performance should match topic-level aggregations

### Testing Recommendations
1. Test with a quiz that covers multiple topics (e.g., Algebra, Geometry, Trigonometry).
2. Verify accuracy calculation: 3/5 correct = 60% accuracy.
3. Verify JAMB score projection: Should be 0-400, not 0 or 2.
4. Verify fluency_index: Should always be a number 0-100.
5. Verify topic_breakdown: Should include all topics covered by questions.

---

## Frontend Status

The frontend has been updated to:
- ✅ Hide "Home" link for authenticated users (show only for guests)
- ✅ Display numerical fluency index value alongside progress bar
- ✅ Handle null/undefined fluency_index gracefully (display "N/A")
- ✅ Fix PieChart text cutoff by adjusting labels and container styling
- ✅ Improve error distribution chart layout and tooltip wrapping

The frontend is ready to display correct data once the backend fixes are implemented.

---

## API Endpoints Affected

- **`POST /api/ai/analyze-diagnostic`**: Main endpoint that generates diagnostic analysis
- **`GET /api/quiz/{quizId}/results`**: Endpoint that returns diagnostic results (should return data from analyze-diagnostic)

---

**Last Updated:** 2025-11-09
**Status:** Backend fixes required

