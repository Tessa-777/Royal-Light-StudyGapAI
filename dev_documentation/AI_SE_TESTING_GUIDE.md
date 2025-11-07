# AI/SE Integration Testing Guide

## Overview
This guide provides comprehensive testing instructions for the AI/SE enhanced diagnostic analysis system.

## Test Data

### Sample Quiz Data (From Documentation)
Use this sample data to test the `/api/ai/analyze-diagnostic` endpoint:

```json
{
  "subject": "Mathematics",
  "total_questions": 3,
  "time_taken": 8.5,
  "questions_list": [
    {
      "id": 1,
      "topic": "Algebra",
      "student_answer": "A",
      "correct_answer": "B",
      "is_correct": false,
      "confidence": 2,
      "explanation": "I thought x squared meant multiply by 2 instead of raising to power",
      "time_spent_seconds": 60
    },
    {
      "id": 2,
      "topic": "Algebra",
      "student_answer": "C",
      "correct_answer": "C",
      "is_correct": true,
      "confidence": 4,
      "explanation": "I used the quadratic formula correctly to solve this equation",
      "time_spent_seconds": 45
    },
    {
      "id": 3,
      "topic": "Geometry",
      "student_answer": "A",
      "correct_answer": "A",
      "is_correct": true,
      "confidence": 5,
      "explanation": "The area of a triangle is definitely base times height divided by 2",
      "time_spent_seconds": 30
    }
  ]
}
```

## Testing Scenarios

### Test 1: Basic Functionality (3 Questions)
**Purpose**: Verify basic diagnostic analysis works

**Request**:
```bash
curl -X POST http://localhost:5000/api/ai/analyze-diagnostic \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d @sample_quiz.json
```

**Expected Response**:
- Status: 200 OK
- Contains: `overall_performance`, `topic_breakdown`, `root_cause_analysis`, `predicted_jamb_score`, `study_plan`, `recommendations`
- `overall_performance.accuracy` ≈ 66.67% (2/3 correct)
- `study_plan.weekly_schedule` has exactly 6 weeks

### Test 2: All Wrong Answers
**Purpose**: Test edge case with 0% accuracy

**Request Data**:
```json
{
  "subject": "Mathematics",
  "total_questions": 2,
  "time_taken": 5.0,
  "questions_list": [
    {
      "id": 1,
      "topic": "Algebra",
      "student_answer": "A",
      "correct_answer": "B",
      "is_correct": false,
      "confidence": 1,
      "explanation": "I had no idea how to solve this",
      "time_spent_seconds": 30
    },
    {
      "id": 2,
      "topic": "Algebra",
      "student_answer": "A",
      "correct_answer": "C",
      "is_correct": false,
      "confidence": 2,
      "explanation": "I guessed randomly",
      "time_spent_seconds": 20
    }
  ]
}
```

**Expected Response**:
- `overall_performance.accuracy` = 0.0
- `overall_performance.correct_answers` = 0
- `predicted_jamb_score.score` = 0
- All topics should have status "weak"

### Test 3: Perfect Score
**Purpose**: Test edge case with 100% accuracy

**Request Data**:
```json
{
  "subject": "Mathematics",
  "total_questions": 1,
  "time_taken": 1.0,
  "questions_list": [
    {
      "id": 1,
      "topic": "Algebra",
      "student_answer": "B",
      "correct_answer": "B",
      "is_correct": true,
      "confidence": 5,
      "explanation": "I understood the concept completely",
      "time_spent_seconds": 60
    }
  ]
}
```

**Expected Response**:
- `overall_performance.accuracy` = 100.0
- `overall_performance.correct_answers` = 1
- `predicted_jamb_score.score` = 400
- All topics should have status "strong"

### Test 4: Missing Confidence Scores
**Purpose**: Test confidence inference (Decision 2: Option C)

**Request Data**:
```json
{
  "subject": "Mathematics",
  "total_questions": 2,
  "time_taken": 5.0,
  "questions_list": [
    {
      "id": 1,
      "topic": "Algebra",
      "student_answer": "A",
      "correct_answer": "B",
      "is_correct": false,
      "explanation": "I guessed",
      "time_spent_seconds": 30
    }
  ]
}
```

**Expected Response**:
- Analysis should complete successfully
- Confidence scores should be inferred automatically
- Check that `overall_performance.avg_confidence` is present

### Test 5: Validation Errors
**Purpose**: Test strict validation (Decision 15: Option C)

**Invalid Request** (missing required fields):
```json
{
  "subject": "Mathematics"
}
```

**Expected Response**:
- Status: 400 Bad Request
- Error message indicates missing fields

## Unit Tests

### Prerequisites
Before running tests, make sure you have installed all dependencies:
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt  # If you have dev requirements
```

### Run All Tests

**Option 1: Using pytest directly (if installed)**
```bash
python -m pytest tests/test_ai_se_integration.py -v
```

**Option 2: Using Python module (recommended)**
```bash
python -m python -m pytest tests/test_ai_se_integration.py -v
```

**Option 3: Using the test runner script**
```bash
python run_tests.py tests/test_ai_se_integration.py -v
```

**Note**: Never run test files directly with `python tests/test_ai_se_integration.py` as it won't set up the Python path correctly. Always use `pytest` or the test runner script.

### Run Specific Test Classes
```bash
# Test confidence inference
python -m pytest tests/test_ai_se_integration.py::TestConfidenceInference -v

# Test calculations
python -m pytest tests/test_ai_se_integration.py::TestCalculations -v

# Test AI service
python -m pytest tests/test_ai_se_integration.py::TestEnhancedAIService -v
```

### Run with Coverage
```bash
python -m pytest tests/test_ai_se_integration.py --cov=backend.services.ai_enhanced --cov=backend.utils.calculations -v
```

## Integration Tests

### Test API Endpoint
```bash
# Set environment variables
export FLASK_APP=backend.app:app
export AI_MOCK=true

# Run Flask in test mode
python -m pytest tests/test_ai_se_integration.py::TestEndToEnd -v
```

### Manual API Testing
1. **Start Flask server**:
   ```bash
   python -m flask run
   ```

2. **Get JWT Token** (if using authentication):
   ```bash
   # Use your authentication endpoint
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "name": "Test User"}'
   ```

3. **Test Diagnostic Analysis**:
   ```bash
   curl -X POST http://localhost:5000/api/ai/analyze-diagnostic \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -d @test_data/sample_quiz.json
   ```

## Validation Checklist

After running tests, verify:

- [ ] Mock mode returns correct format
- [ ] All calculations are correct (Fluency Index, JAMB Score)
- [ ] Topic categorization works (weak/developing/strong)
- [ ] Study plan has exactly 6 weeks
- [ ] Error types are validated strictly
- [ ] Confidence scores are inferred when missing
- [ ] Database storage works correctly
- [ ] Response validation catches errors
- [ ] Edge cases handled (0%, 100%, missing data)

## Performance Testing

### Response Time
- Mock mode: < 1 second
- Real API: 10-30 seconds (depends on Gemini API)

### Load Testing
```bash
# Install Apache Bench
sudo apt-get install apache2-utils  # Ubuntu/Debian
brew install httpd  # macOS

# Run load test
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_JWT_TOKEN" \
   -p test_data/sample_quiz.json \
   -T application/json \
   http://localhost:5000/api/ai/analyze-diagnostic
```

## Error Testing

### Test Error Handling
1. **Invalid API Key**:
   - Set invalid `GEMINI_API_KEY`
   - Should return 503 error

2. **Rate Limit**:
   - Make many rapid requests
   - Should return 429 error

3. **Invalid Data**:
   - Send malformed JSON
   - Should return 400 error

4. **Missing Fields**:
   - Send incomplete request
   - Should return 400 with field names

## Database Testing

### Verify Data Storage
```sql
-- Check diagnostic was saved
SELECT id, quiz_id, generated_at 
FROM ai_diagnostics 
ORDER BY generated_at DESC 
LIMIT 10;

-- Check analysis_result structure
SELECT 
  id,
  analysis_result->>'overall_performance' as overall_perf,
  predicted_jamb_score->>'score' as jamb_score
FROM ai_diagnostics
ORDER BY generated_at DESC
LIMIT 1;
```

### Verify Calculations
```sql
-- Compare stored values with expected calculations
SELECT 
  id,
  (analysis_result->'overall_performance'->>'accuracy')::float as stored_accuracy,
  (analysis_result->'predicted_jamb_score'->>'score')::int as stored_score
FROM ai_diagnostics
ORDER BY generated_at DESC
LIMIT 1;
```

## Continuous Testing

### Pre-commit Hooks
Add to `.git/hooks/pre-commit`:
```bash
#!/bin/bash
python -m pytest tests/test_ai_se_integration.py -v
```

### CI/CD Integration
Add to your CI pipeline:
```yaml
test:
  script:
    - pip install -r requirements.txt
    - python -m pytest tests/test_ai_se_integration.py -v --cov
```

## Troubleshooting Tests

### Tests Failing
1. Check environment variables are set
2. Verify database connection
3. Check mock mode is enabled for unit tests
4. Review error messages for specific issues

### Mock vs Real API
- **Unit tests**: Use mock mode (`AI_MOCK=true`)
- **Integration tests**: Can use real API if key is set
- **Development**: Start with mock mode, test real API separately

## Next Steps

1. Run all tests and verify they pass
2. Test with real Gemini API (set `AI_MOCK=false`)
3. Test with frontend integration
4. Set up monitoring and logging

