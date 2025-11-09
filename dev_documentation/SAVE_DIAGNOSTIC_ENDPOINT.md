# Save Diagnostic Endpoint - Implementation Complete

## ✅ Overview

The `/api/ai/save-diagnostic` endpoint allows guest users to save their diagnostic results to the database after creating an account.

---

## 🔧 Endpoint Details

### **POST `/api/ai/save-diagnostic`**

**Authentication:** Required (user must be signed up)

**Purpose:** Save a guest diagnostic to the database after user signs up

**Flow:**
1. Guest user takes quiz → gets diagnostic (stored in localStorage)
2. Guest user signs up
3. Guest user calls this endpoint to save their diagnostic
4. Backend creates quiz, saves responses, and saves diagnostic
5. Returns `quiz_id` for frontend to update localStorage

---

## 📋 Request Body

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
      "confidence": 2,
      "explanation": "I thought it was A",
      "time_spent_seconds": 30
    },
    // ... more questions
  ],
  "diagnostic": {
    "id": "guest-diagnostic-id-123",
    "quiz_id": null,
    "generated_at": "2025-01-09T12:00:00Z",
    "overall_performance": {...},
    "topic_breakdown": [...],
    "root_cause_analysis": {...},
    "predicted_jamb_score": {...},
    "study_plan": {...},
    "recommendations": [...]
  }
}
```

### Required Fields:

- `subject`: Subject name (e.g., "Mathematics")
- `total_questions`: Total number of questions (integer > 0)
- `time_taken`: Total time taken in minutes (float > 0)
- `questions_list`: List of question responses (array, min length 1)
- `diagnostic`: Complete diagnostic result from guest submission (object)

---

## 📤 Response

### Success (200 OK)

```json
{
  "quiz_id": "quiz-uuid-here",
  "diagnostic_id": "diagnostic-uuid-here",
  "message": "Diagnostic saved successfully"
}
```

### Error Responses

#### 401 Unauthorized
```json
{
  "error": "unauthorized",
  "message": "Authentication required"
}
```

#### 400 Bad Request
```json
{
  "error": "missing_fields",
  "fields": ["subject", "total_questions"]
}
```

#### 500 Internal Server Error
```json
{
  "error": "internal_error",
  "message": "Failed to create quiz: ..."
}
```

---

## 🔄 Backend Process

1. **Validate Request:**
   - Check authentication (user must be signed up)
   - Validate required fields
   - Validate request body structure

2. **Ensure User Exists:**
   - Check if user exists in `users` table
   - Auto-create user if needed (extract from JWT token)

3. **Create Quiz:**
   - Create new quiz in `diagnostic_quizzes` table
   - Link quiz to user's ID
   - Set quiz completion timestamp

4. **Save Quiz Responses:**
   - Save all quiz responses to `quiz_responses` table
   - Link responses to the quiz ID

5. **Save Diagnostic:**
   - Save diagnostic to `ai_diagnostics` table
   - Link diagnostic to the quiz ID
   - Store complete diagnostic data in `analysis_result` field
   - Store denormalized fields for easy querying

6. **Return Response:**
   - Return `quiz_id` and `diagnostic_id`
   - Frontend updates localStorage with `quiz_id`

---

## 🧪 Testing

### Test Script

Run the test script to verify the endpoint:

```bash
python test_save_diagnostic.py
```

### Manual Testing

**Using curl:**
```bash
curl -X POST http://localhost:5000/api/ai/save-diagnostic \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "subject": "Mathematics",
    "total_questions": 5,
    "time_taken": 10.0,
    "questions_list": [...],
    "diagnostic": {...}
  }'
```

**Using PowerShell:**
```powershell
$token = "your-token-here"
$payload = @{
    subject = "Mathematics"
    total_questions = 5
    time_taken = 10.0
    questions_list = @(...)
    diagnostic = @{...}
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:5000/api/ai/save-diagnostic" `
    -Method POST `
    -Headers @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $token"
    } `
    -Body $payload
```

---

## 📱 Frontend Integration

### Frontend Flow

1. **Guest User Takes Quiz:**
   ```typescript
   // Guest user submits quiz
   const response = await api.post('/api/ai/analyze-diagnostic', quizData);
   
   // Store diagnostic in localStorage
   localStorage.setItem('guest_diagnostic', JSON.stringify(response.data));
   localStorage.setItem('guest_quiz_data', JSON.stringify(quizData));
   ```

2. **Guest User Signs Up:**
   ```typescript
   // User creates account
   await supabase.auth.signUp({ email, password });
   
   // After successful signup, save diagnostic
   await saveGuestDiagnostic();
   ```

3. **Save Guest Diagnostic:**
   ```typescript
   async function saveGuestDiagnostic() {
     const diagnostic = JSON.parse(localStorage.getItem('guest_diagnostic'));
     const quizData = JSON.parse(localStorage.getItem('guest_quiz_data'));
     
     if (!diagnostic || !quizData) {
       return; // No guest diagnostic to save
     }
     
     try {
       const response = await api.post('/api/ai/save-diagnostic', {
         ...quizData,
         diagnostic: diagnostic
       });
       
       // Update localStorage with quiz_id
       localStorage.setItem('latest_quiz_id', response.data.quiz_id);
       
       // Clear guest diagnostic from localStorage
       localStorage.removeItem('guest_diagnostic');
       localStorage.removeItem('guest_quiz_data');
       
       console.log('Diagnostic saved successfully!');
     } catch (error) {
       console.error('Failed to save diagnostic:', error);
     }
   }
   ```

4. **Access Saved Diagnostic:**
   ```typescript
   // After saving, user can access diagnostic from database
   const quizId = localStorage.getItem('latest_quiz_id');
   const diagnostic = await api.get(`/api/quiz/${quizId}/results`);
   ```

### Frontend Code Example

```typescript
// After user signs up
useEffect(() => {
  const saveGuestDiagnostic = async () => {
    const guestDiagnostic = localStorage.getItem('guest_diagnostic');
    const guestQuizData = localStorage.getItem('guest_quiz_data');
    
    if (guestDiagnostic && guestQuizData && isAuthenticated) {
      try {
        const response = await api.post('/api/ai/save-diagnostic', {
          ...JSON.parse(guestQuizData),
          diagnostic: JSON.parse(guestDiagnostic)
        });
        
        // Update localStorage
        localStorage.setItem('latest_quiz_id', response.data.quiz_id);
        
        // Clear guest data
        localStorage.removeItem('guest_diagnostic');
        localStorage.removeItem('guest_quiz_data');
        
        // Show success message
        toast.success('Your diagnostic has been saved!');
      } catch (error) {
        console.error('Failed to save diagnostic:', error);
        toast.error('Failed to save diagnostic. Please try again.');
      }
    }
  };
  
  if (isAuthenticated) {
    saveGuestDiagnostic();
  }
}, [isAuthenticated]);
```

---

## 🔍 Database Schema

### Tables Used

1. **`users`** - User information
2. **`diagnostic_quizzes`** - Quiz records
3. **`quiz_responses`** - Individual question responses
4. **`ai_diagnostics`** - Diagnostic analysis results

### Data Flow

```
Guest Diagnostic (localStorage)
    ↓
User Signs Up
    ↓
POST /api/ai/save-diagnostic
    ↓
Create Quiz (diagnostic_quizzes)
    ↓
Save Responses (quiz_responses)
    ↓
Save Diagnostic (ai_diagnostics)
    ↓
Return quiz_id
    ↓
Frontend Updates localStorage
```

---

## ✅ Verification Checklist

- [x] Endpoint requires authentication
- [x] Endpoint accepts quiz data and diagnostic data
- [x] Endpoint creates quiz in database
- [x] Endpoint saves quiz responses
- [x] Endpoint saves diagnostic linked to quiz
- [x] Endpoint returns quiz_id and diagnostic_id
- [x] Endpoint handles user auto-creation
- [x] Endpoint validates required fields
- [x] Endpoint handles errors gracefully
- [x] Endpoint logs operations for debugging

---

## 📝 Summary

### Changes Made:

1. ✅ Created `SaveDiagnosticRequest` schema in `backend/utils/schemas.py`
2. ✅ Created `/api/ai/save-diagnostic` endpoint in `backend/routes/ai.py`
3. ✅ Endpoint requires authentication (`@require_auth`)
4. ✅ Endpoint creates quiz, saves responses, and saves diagnostic
5. ✅ Endpoint returns `quiz_id` for frontend to update localStorage

### Result:

- ✅ Guest users can now save their diagnostic after signing up
- ✅ Diagnostic is properly linked to user's account
- ✅ Quiz and responses are saved to database
- ✅ Frontend can update localStorage with `quiz_id`
- ✅ User can access their diagnostic from database

---

## 🚀 Next Steps

1. **Frontend Integration:**
   - Call `/api/ai/save-diagnostic` after user signs up
   - Update localStorage with `quiz_id`
   - Clear guest diagnostic from localStorage

2. **Testing:**
   - Test with real guest diagnostic data
   - Verify diagnostic is saved correctly
   - Verify user can access diagnostic after saving

3. **Error Handling:**
   - Handle cases where save fails
   - Provide user feedback
   - Allow retry if save fails

---

**Status:** ✅ **COMPLETE**

**Endpoint:** `POST /api/ai/save-diagnostic`

**Authentication:** Required

**Purpose:** Save guest diagnostic to database after user signs up

