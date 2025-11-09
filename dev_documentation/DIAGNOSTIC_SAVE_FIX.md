# Diagnostic Save & Retrieval Fix

## Issues Fixed

### Issue 1: Quizzes Not Being Saved to Database
**Problem**: Users taking quizzes for 2+ hours but quizzes not appearing in database.

**Root Causes**:
1. Frontend might not be sending auth token with `/api/ai/analyze-diagnostic` request
2. Quiz creation might be failing silently
3. Diagnostic save might be failing silently

**Solution**:
- Added comprehensive logging to track quiz creation, response saving, and diagnostic saving
- Added error checking to ensure quiz_id and diagnostic_id are returned
- Enhanced error messages to identify exact failure points

### Issue 2: Frontend Not Loading Existing Diagnostics
**Problem**: Frontend treats every user as new, forcing them to retake quiz even if they have existing diagnostics.

**Root Causes**:
1. Frontend checks `has_diagnostic` from user profile but doesn't fetch the actual diagnostic
2. No endpoint to directly fetch user's latest diagnostic
3. Dashboard doesn't check for existing diagnostics on load

**Solution**:
- Added new endpoint: `GET /api/users/me/diagnostics/latest`
- Enhanced user profile endpoint to include `latest_quiz_id`, `latest_diagnostic_id`, and `has_diagnostic`
- Added comprehensive logging to track diagnostic retrieval

## New Endpoints

### 1. GET /api/users/me/diagnostics/latest
**Purpose**: Get user's latest diagnostic results

**Authentication**: Required

**Response**:
```json
{
  "id": "diagnostic-id",
  "quiz_id": "quiz-id",
  "diagnostic_id": "diagnostic-id",
  "overall_performance": {
    "accuracy": 66.67,
    "total_questions": 30,
    "correct_answers": 20,
    "avg_confidence": 3.5,
    "time_per_question": 120
  },
  "topic_breakdown": [...],
  "root_cause_analysis": {...},
  "predicted_jamb_score": {...},
  "study_plan": {...},
  "recommendations": [...]
}
```

**Error Responses**:
- `404`: No diagnostic found for this user
- `403`: Access denied
- `500`: Server error

### 2. Enhanced GET /api/users/me
**New Fields Added**:
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "latest_quiz_id": "quiz-id-or-null",
  "latest_diagnostic_id": "diagnostic-id-or-null",
  "has_diagnostic": true/false
}
```

## Enhanced Logging

### Quiz Creation Logging
- `Creating quiz for user {user_id}: subject={subject}, total_questions={total}, time_taken={time}`
- `✅ Created quiz for authenticated user: {quiz_id} (user_id: {user_id})`
- `❌ Error creating quiz for user {user_id}: {error}`

### Quiz Responses Logging
- `Saving {count} quiz responses for quiz {quiz_id}`
- `✅ Saved {count} quiz responses for quiz {quiz_id}`
- `❌ Error saving quiz responses for quiz {quiz_id}: {error}`

### Diagnostic Save Logging
- `Saving diagnostic for quiz {quiz_id} (user: {user_id})`
- `✅ Saved diagnostic to database: {diagnostic_id} (quiz_id: {quiz_id}, user: {user_id})`
- `❌ Error saving diagnostic for quiz {quiz_id}: {error}`

### Diagnostic Retrieval Logging
- `Getting latest quiz for user {user_id}`
- `User {user_id} latest quiz: quiz_id={quiz_id}, diagnostic_id={diagnostic_id}, has_diagnostic={has_diagnostic}`
- `User {user_id} has no quizzes`

## Frontend Integration Guide

### Step 1: Check for Existing Diagnostic on Dashboard Load

```typescript
// In Dashboard component
useEffect(() => {
  const fetchDiagnostic = async () => {
    try {
      // First, get user profile to check if diagnostic exists
      const profile = await api.get('/api/users/me');
      
      if (profile.has_diagnostic && profile.latest_diagnostic_id) {
        // Fetch the actual diagnostic
        const diagnostic = await api.get('/api/users/me/diagnostics/latest');
        setDiagnostic(diagnostic);
        setHasDiagnostic(true);
      } else {
        setHasDiagnostic(false);
      }
    } catch (error) {
      console.error('Error fetching diagnostic:', error);
      setHasDiagnostic(false);
    }
  };
  
  if (user) {
    fetchDiagnostic();
  }
}, [user]);
```

### Step 2: Display Diagnostic if Exists

```typescript
// In Dashboard component
if (hasDiagnostic && diagnostic) {
  return <DiagnosticResults diagnostic={diagnostic} />;
} else {
  return <StartQuizPrompt />;
}
```

### Step 3: Ensure Auth Token is Sent with Quiz Submission

```typescript
// In Quiz submission
const submitQuiz = async (questionsList) => {
  try {
    const response = await api.post('/api/ai/analyze-diagnostic', {
      subject: 'Mathematics',
      total_questions: questionsList.length,
      time_taken: timeTakenMinutes,
      questions_list: questionsList
    }, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
    
    // Diagnostic is automatically saved for authenticated users
    // Navigate to results page
    navigate(`/diagnostic/${response.quiz_id}`);
  } catch (error) {
    console.error('Error submitting quiz:', error);
  }
};
```

## Testing Checklist

### Test 1: Quiz Creation and Save
- [ ] User logs in
- [ ] User takes quiz
- [ ] Check backend logs for "✅ Created quiz" message
- [ ] Check backend logs for "✅ Saved quiz responses" message
- [ ] Check backend logs for "✅ Saved diagnostic" message
- [ ] Verify quiz exists in database with correct user_id
- [ ] Verify diagnostic exists in database with correct quiz_id

### Test 2: Diagnostic Retrieval
- [ ] User logs in
- [ ] Call `GET /api/users/me` - verify `has_diagnostic: true`
- [ ] Call `GET /api/users/me/diagnostics/latest` - verify diagnostic data is returned
- [ ] Verify all diagnostic fields are present (overall_performance, topic_breakdown, etc.)

### Test 3: Frontend Dashboard
- [ ] User logs in with existing diagnostic
- [ ] Dashboard should display diagnostic results (not "Start Quiz" prompt)
- [ ] User can view their diagnostic without retaking quiz

### Test 4: Error Handling
- [ ] Test with user who has no quizzes - should return `has_diagnostic: false`
- [ ] Test with user who has quiz but no diagnostic - should return `has_diagnostic: false`
- [ ] Test with invalid quiz_id - should return 404
- [ ] Test with quiz from different user - should return 403/404

## Debugging

### Check Backend Logs
Look for these log messages to track the flow:

1. **Quiz Creation**:
   ```
   Creating quiz for user {user_id}: subject=Mathematics, total_questions=30, time_taken=45.5
   ✅ Created quiz for authenticated user: {quiz_id} (user_id: {user_id})
   ```

2. **Quiz Responses**:
   ```
   Saving 30 quiz responses for quiz {quiz_id}
   ✅ Saved 30 quiz responses for quiz {quiz_id}
   ```

3. **Diagnostic Save**:
   ```
   Saving diagnostic for quiz {quiz_id} (user: {user_id})
   ✅ Saved diagnostic to database: {diagnostic_id} (quiz_id: {quiz_id}, user: {user_id})
   ```

4. **Diagnostic Retrieval**:
   ```
   Getting latest quiz for user {user_id}
   User {user_id} latest quiz: quiz_id={quiz_id}, diagnostic_id={diagnostic_id}, has_diagnostic=True
   ```

### Common Issues

#### Issue: Quiz created but no diagnostic saved
**Symptoms**: `has_diagnostic: false` even after taking quiz
**Check**:
- Look for "❌ Error saving diagnostic" in logs
- Verify diagnostic table has correct schema
- Check if `analysis_result` field is being saved correctly

#### Issue: Diagnostic exists but not retrieved
**Symptoms**: Diagnostic in database but `has_diagnostic: false`
**Check**:
- Verify `quiz_id` matches between quiz and diagnostic
- Verify `user_id` matches between user and quiz
- Check `get_user_latest_quiz` query is correct

#### Issue: Frontend not sending auth token
**Symptoms**: Quiz created but not linked to user
**Check**:
- Verify Authorization header is sent with request
- Check if token is valid and not expired
- Verify `current_user_id` is extracted correctly from JWT

## Next Steps

1. **Frontend**: Update dashboard to fetch and display existing diagnostics
2. **Frontend**: Ensure auth token is sent with all quiz submission requests
3. **Testing**: Test complete flow from quiz submission to diagnostic display
4. **Monitoring**: Set up error alerts for quiz/diagnostic save failures

