# Guest Diagnostic Save Flow - Implementation Guide

## Problem

When a user takes a quiz as a guest and then logs in, the guest diagnostic is **not automatically saved** to their account. The user must manually save it or take the quiz again.

## Expected Flow

1. **User takes quiz as guest** → Diagnostic stored in `localStorage` as `guest_diagnostic`
2. **User logs in/registers** → Frontend should automatically save the guest diagnostic
3. **Frontend calls `/api/ai/save-diagnostic`** → Backend saves quiz and diagnostic to database
4. **Frontend clears `guest_diagnostic` from localStorage** → Diagnostic is now in database
5. **Dashboard shows diagnostic** → User can see their results

## Current Issue

The frontend is **not calling `/api/ai/save-diagnostic`** after login/registration when a guest diagnostic exists.

## Backend Endpoint

### `POST /api/ai/save-diagnostic`

**Authentication**: Required (user must be logged in)

**Request Body**:
```json
{
  "subject": "Mathematics",
  "total_questions": 30,
  "time_taken": 45.5,
  "questions_list": [
    {
      "id": 1,
      "topic": "Algebra",
      "student_answer": "A",
      "correct_answer": "B",
      "is_correct": false,
      "confidence": 3,
      "explanation": "I thought...",
      "time_spent_seconds": 120
    }
    // ... more questions
  ],
  "diagnostic": {
    // Optional: Complete diagnostic data from guest quiz
    // If not provided, will be regenerated from questions_list
    "overall_performance": {...},
    "topic_breakdown": [...],
    "root_cause_analysis": {...},
    "predicted_jamb_score": {...},
    "study_plan": {...},
    "recommendations": [...]
  }
}
```

**Response**:
```json
{
  "quiz_id": "quiz-id",
  "diagnostic_id": "diagnostic-id",
  "message": "Diagnostic saved successfully",
  "diagnostic_regenerated": false
}
```

## Frontend Implementation

### Step 1: Check for Guest Diagnostic on Login

In your login/registration success handler:

```typescript
// After successful login/registration
const handleLoginSuccess = async (user: User) => {
  // Check if user has unsaved guest diagnostic
  const guestDiagnostic = localStorage.getItem('guest_diagnostic');
  const guestQuiz = localStorage.getItem('guest_quiz');
  
  if (guestDiagnostic && guestQuiz) {
    try {
      // Parse guest diagnostic data
      const diagnosticData = JSON.parse(guestDiagnostic);
      const quizData = JSON.parse(guestQuiz);
      
      // Prepare request body
      const saveRequest = {
        subject: quizData.subject || 'Mathematics',
        total_questions: quizData.total_questions || quizData.questions?.length || 30,
        time_taken: quizData.time_taken || quizData.totalTime / 60, // Convert to minutes
        questions_list: quizData.questions_list || quizData.responses || [],
        diagnostic: diagnosticData.diagnostic || diagnosticData // Include diagnostic if available
      };
      
      // Call save-diagnostic endpoint
      const response = await api.post('/api/ai/save-diagnostic', saveRequest, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      // Clear guest data from localStorage
      localStorage.removeItem('guest_diagnostic');
      localStorage.removeItem('guest_quiz');
      localStorage.removeItem('latest_quiz_id');
      
      console.log('✅ Guest diagnostic saved successfully:', response.data);
      
      // Update localStorage with new quiz_id
      if (response.data.quiz_id) {
        localStorage.setItem('latest_quiz_id', response.data.quiz_id);
      }
      
    } catch (error) {
      console.error('❌ Failed to save guest diagnostic:', error);
      // Don't block login - user can save later
    }
  }
  
  // Continue with normal login flow
  navigate('/dashboard');
};
```

### Step 2: Check for Guest Diagnostic on Dashboard Load

In your dashboard component:

```typescript
useEffect(() => {
  const checkAndSaveGuestDiagnostic = async () => {
    // Only check if user is authenticated
    if (!user || !user.id) return;
    
    // Check for unsaved guest diagnostic
    const guestDiagnostic = localStorage.getItem('guest_diagnostic');
    const guestQuiz = localStorage.getItem('guest_quiz');
    
    if (guestDiagnostic && guestQuiz) {
      // Show prompt to user
      setShowSavePrompt(true);
      
      // Or automatically save (recommended)
      try {
        await saveGuestDiagnostic();
      } catch (error) {
        console.error('Failed to save guest diagnostic:', error);
      }
    }
  };
  
  if (user) {
    checkAndSaveGuestDiagnostic();
  }
}, [user]);
```

### Step 3: Save Guest Diagnostic Function

```typescript
const saveGuestDiagnostic = async () => {
  const guestDiagnostic = localStorage.getItem('guest_diagnostic');
  const guestQuiz = localStorage.getItem('guest_quiz');
  
  if (!guestDiagnostic || !guestQuiz) {
    return;
  }
  
  try {
    const diagnosticData = JSON.parse(guestDiagnostic);
    const quizData = JSON.parse(guestQuiz);
    
    // Prepare request
    const saveRequest = {
      subject: quizData.subject || 'Mathematics',
      total_questions: quizData.total_questions || quizData.questions?.length || 30,
      time_taken: quizData.time_taken || (quizData.totalTime / 60), // minutes
      questions_list: quizData.questions_list || quizData.responses || [],
      diagnostic: diagnosticData.diagnostic || diagnosticData
    };
    
    // Call API
    const response = await api.post('/api/ai/save-diagnostic', saveRequest);
    
    // Clear guest data
    localStorage.removeItem('guest_diagnostic');
    localStorage.removeItem('guest_quiz');
    
    // Update latest_quiz_id
    if (response.data.quiz_id) {
      localStorage.setItem('latest_quiz_id', response.data.quiz_id);
    }
    
    // Refresh user profile to get updated diagnostic info
    await refreshUserProfile();
    
    console.log('✅ Guest diagnostic saved successfully');
    
  } catch (error) {
    console.error('❌ Failed to save guest diagnostic:', error);
    throw error;
  }
};
```

## Backend Logging

The backend now logs detailed information when saving guest diagnostics:

```
============================================================
💾 SAVE-DIAGNOSTIC REQUEST RECEIVED
   - User ID: {user_id}
   - Has diagnostic data: true/false
   - Has questions_list: true/false
   - Subject: Mathematics
   - Total questions: 30
============================================================
✅ Created quiz from guest diagnostic: {quiz_id}
✅ Saved {count} quiz responses for quiz {quiz_id}
✅ Using provided diagnostic data from guest quiz
✅✅✅ GUEST DIAGNOSTIC SAVED SUCCESSFULLY ✅✅✅
   - Diagnostic ID: {diagnostic_id}
   - Quiz ID: {quiz_id}
   - User ID: {user_id}
============================================================
```

## Testing

### Test Case 1: Guest Quiz → Login → Auto-Save
1. Take quiz as guest
2. Complete quiz and get diagnostic
3. Log in with existing account
4. **Expected**: Guest diagnostic is automatically saved
5. **Check**: Dashboard shows diagnostic

### Test Case 2: Guest Quiz → Register → Auto-Save
1. Take quiz as guest
2. Complete quiz and get diagnostic
3. Register new account
4. **Expected**: Guest diagnostic is automatically saved
5. **Check**: Dashboard shows diagnostic

### Test Case 3: Guest Quiz → Login → Manual Save
1. Take quiz as guest
2. Log in (if auto-save fails)
3. Manually trigger save from dashboard
4. **Expected**: Guest diagnostic is saved
5. **Check**: Dashboard shows diagnostic

## Troubleshooting

### Issue: Guest diagnostic not saved after login
**Check**:
1. Is `guest_diagnostic` in localStorage?
2. Is frontend calling `/api/ai/save-diagnostic`?
3. Are there any errors in frontend console?
4. Are there any errors in backend logs?

### Issue: Diagnostic regenerated instead of using guest data
**Cause**: Frontend not sending `diagnostic` field in request
**Fix**: Include `diagnostic` field from `localStorage.getItem('guest_diagnostic')`

### Issue: Quiz saved but diagnostic not saved
**Check backend logs for**:
- `✅ Created quiz from guest diagnostic`
- `✅ Saved quiz responses`
- `✅✅✅ GUEST DIAGNOSTIC SAVED SUCCESSFULLY`

If you see the first two but not the third, there's an error saving the diagnostic.

## Next Steps

1. **Frontend**: Implement auto-save on login/registration
2. **Frontend**: Add manual save button as fallback
3. **Testing**: Test complete flow from guest quiz to saved diagnostic
4. **Monitoring**: Check backend logs to verify saves are happening

