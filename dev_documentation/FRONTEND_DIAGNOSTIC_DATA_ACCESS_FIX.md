# Frontend Diagnostic Data Access Fix

## 🚨 Problem

Frontend console shows:
- `[DIAGNOSTIC RESULTS] Topic breakdown: undefined`
- `[DIAGNOSTIC RESULTS] Root cause analysis: undefined`
- `[DIAGNOSTIC RESULTS] Overall performance: undefined`

But the console also shows the data IS present in the response:
```javascript
diagnostic: {
  topic_breakdown: Array [ {...} ],
  overall_performance: Object { ... },
  root_cause_analysis: Object { ... },
  ...
}
```

## 🔍 Root Cause

**The API response structure is:**
```json
{
  "diagnostic": {
    "topic_breakdown": [...],
    "overall_performance": {...},
    "root_cause_analysis": {...},
    ...
  },
  "quiz": {...},
  "responses": [...]
}
```

**The frontend is trying to access fields directly from the response object, but they're nested inside `response.diagnostic`.**

## ✅ Solution

### Fix 1: Update useDiagnostic Hook

**Current (WRONG):**
```typescript
// ❌ WRONG - accessing fields directly
const topicBreakdown = response.topic_breakdown;
const overallPerformance = response.overall_performance;
```

**Fixed (CORRECT):**
```typescript
// ✅ CORRECT - accessing from diagnostic object
const topicBreakdown = response.diagnostic?.topic_breakdown;
const overallPerformance = response.diagnostic?.overall_performance;
const rootCauseAnalysis = response.diagnostic?.root_cause_analysis;
```

### Fix 2: Update DiagnosticResultsPage Component

**The component should extract diagnostic data from the response:**

```typescript
// In DiagnosticResultsPage.tsx or useDiagnostic hook
const { data, isLoading, error } = useDiagnostic(quizId);

// Extract diagnostic from response
const diagnostic = data?.diagnostic;

// Then use diagnostic fields
const topicBreakdown = diagnostic?.topic_breakdown || [];
const overallPerformance = diagnostic?.overall_performance;
const rootCauseAnalysis = diagnostic?.root_cause_analysis;
```

### Fix 3: Complete Example

```typescript
// useDiagnostic.ts or similar hook
export function useDiagnostic(quizId: string) {
  return useQuery({
    queryKey: ['diagnostic', quizId],
    queryFn: async () => {
      const response = await api.get(`/api/quiz/${quizId}/results`);
      
      // ✅ CORRECT: Extract diagnostic from response
      return {
        diagnostic: response.data.diagnostic,
        quiz: response.data.quiz,
        responses: response.data.responses
      };
    }
  });
}

// DiagnosticResultsPage.tsx
const DiagnosticResultsPage = () => {
  const { quizId } = useParams();
  const { data, isLoading, error } = useDiagnostic(quizId);
  
  // ✅ CORRECT: Access diagnostic from data
  const diagnostic = data?.diagnostic;
  
  // ✅ CORRECT: Access fields from diagnostic
  const topicBreakdown = diagnostic?.topic_breakdown || [];
  const overallPerformance = diagnostic?.overall_performance;
  const rootCauseAnalysis = diagnostic?.root_cause_analysis;
  const predictedJambScore = diagnostic?.predicted_jamb_score;
  const studyPlan = diagnostic?.study_plan;
  const recommendations = diagnostic?.recommendations || [];
  
  // Validate diagnostic data
  if (!diagnostic || !Array.isArray(topicBreakdown)) {
    console.error('Invalid diagnostic data:', diagnostic);
    return <div>Failed to load diagnostic data</div>;
  }
  
  // Use the data
  return (
    <div>
      <h1>Overall Performance: {overallPerformance?.accuracy}%</h1>
      <TopicBreakdownTable topics={topicBreakdown} />
      {/* ... rest of component */}
    </div>
  );
};
```

## 📋 Complete Fix Checklist

### Step 1: Find the useDiagnostic Hook

Look for a file like:
- `src/hooks/useDiagnostic.ts`
- `src/hooks/useDiagnostic.tsx`
- `src/api/useDiagnostic.ts`

### Step 2: Update the Hook

**Before:**
```typescript
const response = await api.get(`/api/quiz/${quizId}/results`);
return response.data; // ❌ Returns { diagnostic, quiz, responses }
```

**After:**
```typescript
const response = await api.get(`/api/quiz/${quizId}/results`);
// ✅ Return the full response structure
return {
  diagnostic: response.data.diagnostic,
  quiz: response.data.quiz,
  responses: response.data.responses
};
```

### Step 3: Update DiagnosticResultsPage

**Before:**
```typescript
const { data } = useDiagnostic(quizId);
const topicBreakdown = data?.topic_breakdown; // ❌ WRONG
```

**After:**
```typescript
const { data } = useDiagnostic(quizId);
const diagnostic = data?.diagnostic; // ✅ CORRECT
const topicBreakdown = diagnostic?.topic_breakdown; // ✅ CORRECT
```

### Step 4: Add Validation

```typescript
// Validate diagnostic data exists
if (!diagnostic) {
  return <div>Loading diagnostic...</div>;
}

// Validate required fields
if (!Array.isArray(diagnostic.topic_breakdown)) {
  console.error('Invalid topic_breakdown:', diagnostic.topic_breakdown);
  return <div>Invalid diagnostic data</div>;
}
```

## 🧪 Testing

After fixing, test with:

```typescript
// In DiagnosticResultsPage component
console.log('Diagnostic data:', diagnostic);
console.log('Topic breakdown:', diagnostic?.topic_breakdown);
console.log('Overall performance:', diagnostic?.overall_performance);
console.log('Root cause analysis:', diagnostic?.root_cause_analysis);
```

**Expected output:**
```
Diagnostic data: { topic_breakdown: [...], overall_performance: {...}, ... }
Topic breakdown: Array [ {...} ]
Overall performance: Object { accuracy: 0, ... }
Root cause analysis: Object { primary_weakness: "knowledge_gap", ... }
```

## 📝 API Response Structure Reference

### GET /api/quiz/{quizId}/results

**Response:**
```json
{
  "diagnostic": {
    "id": "diagnostic-id",
    "quiz_id": "quiz-id",
    "overall_performance": {
      "accuracy": 0,
      "total_questions": 5,
      "correct_answers": 0,
      "avg_confidence": 1,
      "time_per_question": 0.1491
    },
    "topic_breakdown": [
      {
        "topic": "Algebra",
        "accuracy": 0,
        "fluency_index": 0,
        "status": "weak",
        "questions_attempted": 5,
        "severity": "critical",
        "dominant_error_type": "knowledge_gap"
      }
    ],
    "root_cause_analysis": {
      "primary_weakness": "knowledge_gap",
      "error_distribution": {
        "knowledge_gap": 5,
        "conceptual_gap": 0,
        "procedural_error": 0,
        "careless_mistake": 0,
        "misinterpretation": 0
      }
    },
    "predicted_jamb_score": {
      "score": 0,
      "base_score": 0,
      "confidence_interval": "0-50"
    },
    "study_plan": {
      "weekly_schedule": [...]
    },
    "recommendations": [
      {
        "priority": 1,
        "category": "Conceptual Understanding",
        "action": "Revisit fundamental algebra concepts.",
        "rationale": "..."
      }
    ],
    "generated_at": "2025-11-09T00:21:32.025427+00:00"
  },
  "quiz": {
    "id": "quiz-id",
    "user_id": "user-id",
    "subject": "Mathematics",
    "total_questions": 5,
    "correct_answers": 0,
    "score_percentage": 0,
    "time_taken_minutes": 0.745666666666667,
    "started_at": "2025-11-09T00:21:31.554117+00:00",
    "completed_at": "2025-11-09T00:21:30.736549+00:00"
  },
  "responses": [
    {
      "confidence": 1,
      "correct_answer": "B",
      "explanation": "d",
      "is_correct": false,
      "student_answer": "A",
      "time_spent_seconds": 30,
      "topic": "Algebra"
    }
  ]
}
```

## 🎯 Key Points

1. **API returns nested structure:** `{ diagnostic: {...}, quiz: {...}, responses: [...] }`
2. **Access diagnostic fields from `response.diagnostic`**, not from `response` directly
3. **Always validate:** Check if `diagnostic` exists before accessing its fields
4. **Use optional chaining:** `diagnostic?.topic_breakdown` to avoid errors
5. **Provide defaults:** `diagnostic?.topic_breakdown || []` for arrays

## ✅ Expected Result

After fixing:
- ✅ `diagnostic.topic_breakdown` will be an array
- ✅ `diagnostic.overall_performance` will be an object
- ✅ `diagnostic.root_cause_analysis` will be an object
- ✅ All fields will be accessible and display correctly

---

**Status:** 🔧 **FRONTEND FIX REQUIRED**

**Priority:** 🔴 **HIGH** - Blocks diagnostic display

**Files to Update:**
1. `src/hooks/useDiagnostic.ts` (or similar)
2. `src/pages/DiagnosticResultsPage.tsx`

