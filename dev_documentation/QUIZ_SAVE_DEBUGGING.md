# Quiz Save Debugging Guide

## Current Status

Based on frontend console logs, **diagnostics ARE being saved and retrieved successfully**:

✅ User profile shows:
- `has_diagnostic: true`
- `latest_quiz_id: "1cc8c509-8e9a-4d4e-9a4a-69ce850c722c"`
- `latest_diagnostic_id: "1c2acd35-5c1c-486f-b21b-099d8e223323"`

✅ Dashboard successfully fetches diagnostic:
- `GET /api/users/me/diagnostics/latest: 200`
- Diagnostic data returned with all fields

## If NEW Quizzes Aren't Being Saved

### Step 1: Check Backend Logs

When you submit a NEW quiz, look for these log messages in order:

1. **Quiz Submission Received**:
   ```
   📋 Quiz submission received: is_guest=False, has_auth_header=True, current_user_id={user_id}
   👤 Authenticated user submitting quiz: {user_id}
   ```

2. **Quiz Creation**:
   ```
   Creating quiz for user {user_id}: subject=Mathematics, total_questions=30, time_taken=45.5
   ✅ Created quiz for authenticated user: {quiz_id} (user_id: {user_id})
   ```

3. **Quiz Responses Saved**:
   ```
   Saving 30 quiz responses for quiz {quiz_id}
   ✅ Saved 30 quiz responses for quiz {quiz_id}
   ```

4. **Diagnostic Saved**:
   ```
   Saving diagnostic for quiz {quiz_id} (user: {user_id})
   ✅ Saved diagnostic to database: {diagnostic_id} (quiz_id: {quiz_id}, user: {user_id})
   ```

5. **Success Response**:
   ```
   ✅✅✅ SUCCESS: Authenticated diagnostic generated and saved ✅✅✅
      - Diagnostic ID: {diagnostic_id}
      - Quiz ID: {quiz_id}
      - User ID: {user_id}
   ```

### Step 2: Check Frontend Quiz Submission

Verify the frontend is:
1. **Sending Authorization header** with quiz submission
2. **Calling `/api/ai/analyze-diagnostic`** (not `/api/quiz/start` or other endpoints)
3. **Including all required fields**: `subject`, `total_questions`, `time_taken`, `questions_list`

### Step 3: Common Issues

#### Issue: "Guest user" in logs but user is authenticated
**Cause**: Auth token not being sent or token is invalid/expired
**Fix**: 
- Check if `Authorization: Bearer {token}` header is included
- Verify token is valid and not expired
- Check `optional_auth` decorator is extracting user_id correctly

#### Issue: Quiz created but no diagnostic saved
**Cause**: Error during diagnostic save (check for "❌ Error saving diagnostic" in logs)
**Fix**: Check database connection and diagnostic table schema

#### Issue: No quiz creation logs at all
**Cause**: Request not reaching backend or failing validation
**Fix**: 
- Check if request is reaching `/api/ai/analyze-diagnostic`
- Verify request body has all required fields
- Check for validation errors in logs

## Testing New Quiz Submission

1. **Take a new quiz** as an authenticated user
2. **Watch backend logs** for the sequence above
3. **Check frontend console** for any errors
4. **After submission**, call `GET /api/users/me` and verify:
   - `has_diagnostic: true`
   - `latest_quiz_id` is updated
   - `latest_diagnostic_id` is updated

## Frontend Checklist

When submitting a quiz, ensure:

```typescript
// ✅ CORRECT: Send auth token
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

// ❌ WRONG: Missing auth token
const response = await api.post('/api/ai/analyze-diagnostic', {
  // ... data
});
```

## Backend Verification

After quiz submission, verify in database:

```sql
-- Check if quiz exists
SELECT * FROM diagnostic_quizzes 
WHERE user_id = '{user_id}' 
ORDER BY started_at DESC 
LIMIT 1;

-- Check if diagnostic exists
SELECT * FROM ai_diagnostics 
WHERE quiz_id = '{quiz_id}';

-- Check if responses exist
SELECT COUNT(*) FROM quiz_responses 
WHERE quiz_id = '{quiz_id}';
```

## Next Steps

1. **Take a NEW quiz** and watch backend logs
2. **Share the backend logs** from the quiz submission
3. **Check if auth token is being sent** in the frontend request
4. **Verify the request reaches** `/api/ai/analyze-diagnostic` endpoint

