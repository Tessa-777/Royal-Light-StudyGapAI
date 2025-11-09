# Dashboard Diagnostic Detection Issue

## Problem

The dashboard is not correctly detecting when an authenticated user (e.g., "Front10") has completed a diagnostic quiz. The dashboard shows "Not Started" even though the user has a diagnostic and study plan in the backend.

## Root Cause

The dashboard currently relies solely on `localStorage.getItem('latest_quiz_id')` to detect if a user has a diagnostic. This approach has limitations:

1. **localStorage is session-specific**: If a user takes a quiz in one session and returns later, the `latest_quiz_id` might not be in localStorage
2. **No API endpoint to fetch user's latest quiz**: There's no backend endpoint to get the user's latest diagnostic/quiz ID
3. **localStorage can be cleared**: If the user clears their browser data, the quiz_id is lost

## Current Implementation

```typescript
// DashboardPage.tsx
const latestQuizId = localStorage.getItem('latest_quiz_id');
const { data: diagnostic } = useDiagnostic(latestQuizId || undefined);
```

This only works if:
- The user took the quiz in the current browser session
- localStorage hasn't been cleared
- The quiz_id was properly saved to localStorage after quiz submission

## Backend Solution Required

**Option 1: Add endpoint to get user's latest diagnostic**
```
GET /api/users/me/diagnostics/latest
Response: { quiz_id: string, diagnostic_id: string, created_at: string }
```

**Option 2: Include latest diagnostic info in user profile**
```
GET /api/users/me
Response: {
  ...user_profile,
  latest_quiz_id: string | null,
  latest_diagnostic_id: string | null,
  has_diagnostic: boolean
}
```

**Option 3: Add endpoint to list user's diagnostics**
```
GET /api/users/me/diagnostics
Response: [{ quiz_id: string, diagnostic_id: string, created_at: string, ... }]
```

## Frontend Workaround (Temporary)

For now, the frontend should:
1. Check localStorage for `latest_quiz_id`
2. If not found and user is authenticated, try to fetch from backend (if endpoint exists)
3. Fall back to showing "Not Started" if no diagnostic is found

## Recommendation

**Backend team should implement Option 2** (include latest diagnostic info in user profile) as it:
- Requires only one API call (already being made on dashboard load)
- Provides all necessary information in one response
- Is the most efficient approach

## Implementation Notes

1. When a user completes a quiz, ensure `latest_quiz_id` is saved to localStorage
2. When user logs in, fetch their profile which should include latest diagnostic info
3. Update dashboard to use profile data instead of just localStorage
4. Handle cases where user has diagnostic in backend but not in localStorage

