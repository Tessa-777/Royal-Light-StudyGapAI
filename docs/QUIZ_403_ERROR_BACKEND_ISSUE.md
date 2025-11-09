# Quiz 403 Error - Backend Issue

## Problem

When trying to access quiz results, the frontend receives a 403 (Forbidden) error:

```
GET /api/quiz/8d31291c-5b6e-4ebc-9b1c-e7e57b1a4550/results HTTP/1.1" 403
```

## Root Cause Analysis

### Issue 1: Quiz ID Ownership
The 403 error indicates that the quiz with ID `8d31291c-5b6e-4ebc-9b1c-e7e57b1a4550` either:
1. Doesn't exist in the database
2. Belongs to a different user (guest quiz that was never saved to an account)
3. The backend is incorrectly checking ownership/permissions

### Issue 2: localStorage Quiz ID Persistence
The frontend stores `latest_quiz_id` in localStorage. When a user:
1. Takes a quiz as a guest
2. Registers/logs in
3. The `latest_quiz_id` might still point to a guest quiz that doesn't belong to the authenticated user

### Current Flow Problem
1. User takes quiz as guest → `latest_quiz_id` stored in localStorage
2. User registers/logs in → `latest_quiz_id` still in localStorage (pointing to guest quiz)
3. Dashboard tries to fetch diagnostic using `latest_quiz_id` → 403 error (quiz doesn't belong to user)

## Frontend Fix Applied

The frontend now clears `latest_quiz_id` on:
1. **Registration**: Clears all guest data including `latest_quiz_id`
2. **Login**: Clears guest diagnostic data (but keeps `latest_quiz_id` in case it's valid)

However, this doesn't fully solve the issue if:
- The `latest_quiz_id` belongs to a different user
- The quiz was created as a guest and never saved to an account

## Backend Solution Required

### Option 1: Return User's Latest Quiz in Profile
Include the user's latest quiz/diagnostic ID in the user profile response:

```json
{
  "id": "user-id",
  "email": "user@example.com",
  "name": "User Name",
  "target_score": 300,
  "latest_quiz_id": "quiz-id-if-exists",
  "latest_diagnostic_id": "diagnostic-id-if-exists",
  "has_diagnostic": true
}
```

### Option 2: Add Endpoint to Get User's Latest Diagnostic
```
GET /api/users/me/diagnostics/latest
Response: {
  "quiz_id": "quiz-id",
  "diagnostic_id": "diagnostic-id",
  "created_at": "timestamp"
}
```

### Option 3: Validate Quiz Ownership Before Returning 403
The backend should:
1. Check if the quiz belongs to the authenticated user
2. If not, return 404 (Not Found) instead of 403 (Forbidden)
3. This allows the frontend to handle it as a "quiz doesn't exist" case

## Frontend Workaround

The frontend now:
1. Clears `latest_quiz_id` on registration (fresh start)
2. On login, if diagnostic fetch fails with 403, falls back to checking localStorage for guest diagnostic
3. Shows "Not Started" if no valid diagnostic is found

## Recommended Backend Fix

**Implement Option 1** (include latest diagnostic in user profile) because:
- Requires only one API call (already being made)
- Provides all necessary information
- Most efficient approach
- Frontend can immediately know if user has a diagnostic

## Testing

To test the fix:
1. Register a new user → `latest_quiz_id` should be cleared
2. Take a quiz as authenticated user → `latest_quiz_id` should be set
3. Log out and log in → Dashboard should show diagnostic if it exists
4. Try to access a quiz that doesn't belong to user → Should return 404 or handle gracefully

## Current Status

- ✅ Frontend clears guest data on registration/login
- ✅ Frontend handles 403 errors gracefully
- ⚠️ Backend needs to provide user's latest diagnostic info
- ⚠️ Backend needs to validate quiz ownership correctly

