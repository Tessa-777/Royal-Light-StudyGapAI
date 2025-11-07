# AI/SE Full Integration Plan - Clean Implementation

## Overview
This document outlines the plan for implementing a **complete, clean integration** of the AI/SE diagnostic analysis system from `AI SE Prompt Documentation.md`. This is a **greenfield implementation** in a separate branch with a new Supabase project - no backward compatibility required.

## Implementation Strategy

### Branch & Database Strategy
- **Branch**: New feature branch (e.g., `feature/ai-se-full-integration`)
- **Database**: New Supabase project (completely separate from production)
- **Approach**: Clean implementation from scratch, matching documentation exactly
- **No Backward Compatibility**: This is a new API that will replace the old one when ready

## Target Implementation (From Documentation)

### API Input Format
```json
{
  "subject": "Mathematics",
  "total_questions": 30,
  "time_taken": 15.5,
  "questions_list": [
    {
      "id": 1,
      "topic": "Algebra",
      "student_answer": "A",
      "correct_answer": "B",
      "is_correct": false,
      "confidence": 2,
      "explanation": "I thought x squared meant multiply by 2"
    }
  ]
}
```

### API Output Format (Complete Structure)
```json
{
  "id": "diagnostic-uuid",
  "overall_performance": {
    "accuracy": 66.67,
    "total_questions": 3,
    "correct_answers": 2,
    "avg_confidence": 3.0,
    "time_per_question": 2.5
  },
  "topic_breakdown": [
    {
      "topic": "Mathematics: Algebra",
      "accuracy": 50.0,
      "fluency_index": 30.0,
      "status": "weak",
      "questions_attempted": 2,
      "severity": "critical",
      "dominant_error_type": "conceptual_gap"
    }
  ],
  "root_cause_analysis": {
    "primary_weakness": "conceptual_gap",
    "error_distribution": {
      "conceptual_gap": 1,
      "procedural_error": 0,
      "careless_mistake": 0,
      "knowledge_gap": 0,
      "misinterpretation": 0
    }
  },
  "predicted_jamb_score": {
    "score": 257,
    "confidence_interval": "± 25 points"
  },
  "study_plan": {
    "weekly_schedule": [
      {
        "week": 1,
        "focus": "Algebra: Fundamental Laws (Indices & Exponents)",
        "study_hours": 8,
        "key_activities": [
          "Re-read and take notes on the laws of indices",
          "Solve 50 practice questions",
          "Create a 'Formula Sheet'"
        ]
      }
    ]
  },
  "recommendations": [
    {
      "priority": 1,
      "category": "weakness",
      "action": "Focus on Algebra concepts for 2 weeks",
      "rationale": "You have critical gaps in algebraic understanding"
    }
  ],
  "generated_at": "2025-01-27T10:30:00Z"
}
```

## Implementation Plan

### Phase 1: Database Schema Design

#### 1.1 Create New Database Schema
**File**: `supabase/migrations/0001_ai_se_schema.sql` (NEW - for new Supabase project)

**Tables to Create**:

1. **Users Table** (if not exists)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  target_score INT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

2. **Questions Table** (if not exists)
```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id),
  topic VARCHAR(100) NOT NULL,  -- Direct topic field for easier access
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer VARCHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  subject VARCHAR(50) NOT NULL
);
```

3. **Topics Table** (if not exists)
```sql
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  subject VARCHAR(50) NOT NULL,
  description TEXT,
  jamb_weight FLOAT
);
```

4. **Diagnostic Quizzes Table**
```sql
CREATE TABLE diagnostic_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  total_questions INT NOT NULL,
  time_taken_minutes FLOAT,
  correct_answers INT DEFAULT 0,
  score_percentage FLOAT DEFAULT 0.0
);
```

5. **Quiz Responses Table**
```sql
CREATE TABLE quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES diagnostic_quizzes(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
  topic VARCHAR(100) NOT NULL,
  student_answer VARCHAR(1) CHECK (student_answer IN ('A', 'B', 'C', 'D')),
  correct_answer VARCHAR(1) NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  confidence INT CHECK (confidence >= 1 AND confidence <= 5),
  explanation TEXT,
  time_spent_seconds INT
);
```

6. **AI Diagnostics Table** (NEW - Comprehensive Schema)
```sql
CREATE TABLE ai_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES diagnostic_quizzes(id) ON DELETE CASCADE,
  
  -- Comprehensive analysis result (stores full JSON response from AI)
  analysis_result JSONB NOT NULL,
  
  -- Extracted fields for easy querying (denormalized for performance)
  overall_performance JSONB,
  topic_breakdown JSONB,
  root_cause_analysis JSONB,
  predicted_jamb_score JSONB,
  study_plan JSONB,
  recommendations JSONB,
  
  -- Metadata
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for performance
  CONSTRAINT fk_quiz FOREIGN KEY (quiz_id) REFERENCES diagnostic_quizzes(id) ON DELETE CASCADE
);

CREATE INDEX idx_ai_diagnostics_quiz_id ON ai_diagnostics(quiz_id);
CREATE INDEX idx_ai_diagnostics_generated_at ON ai_diagnostics(generated_at);
CREATE INDEX idx_ai_diagnostics_predicted_score ON ai_diagnostics((predicted_jamb_score->>'score'));
```

7. **Study Plans Table** (Enhanced)
```sql
CREATE TABLE study_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  diagnostic_id UUID REFERENCES ai_diagnostics(id) ON DELETE CASCADE,
  plan_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 1.2 Row Level Security (RLS) Policies
**File**: `supabase/migrations/0002_ai_se_rls_policies.sql` (NEW)

**Policies**:
- Users can only access their own quizzes and diagnostics
- Users can only create diagnostics for their own quizzes
- All policies follow the same pattern as existing implementation

### Phase 2: Request/Response Schemas

#### 2.1 Update Pydantic Schemas
**File**: `backend/utils/schemas.py`

**New Schemas**:

```python
class QuestionResponse(BaseModel):
    id: int
    topic: str
    student_answer: str
    correct_answer: str
    is_correct: bool
    confidence: int = Field(ge=1, le=5, default=3)
    explanation: str

class AnalyzeDiagnosticRequest(BaseModel):
    quiz_id: Optional[str] = None  # Optional if creating new quiz
    subject: str
    total_questions: int = Field(gt=0)
    time_taken: float = Field(gt=0)  # in minutes
    questions_list: List[QuestionResponse]

class OverallPerformance(BaseModel):
    accuracy: float
    total_questions: int
    correct_answers: int
    avg_confidence: float
    time_per_question: float

class TopicBreakdown(BaseModel):
    topic: str
    accuracy: float
    fluency_index: float
    status: str = Field(pattern="^(weak|developing|strong)$")
    questions_attempted: int
    severity: Optional[str] = Field(None, pattern="^(critical|moderate|mild)$")
    dominant_error_type: Optional[str] = None

class RootCauseAnalysis(BaseModel):
    primary_weakness: str = Field(pattern="^(conceptual_gap|procedural_error|careless_mistake|knowledge_gap|misinterpretation)$")
    error_distribution: Dict[str, int]

class PredictedJambScore(BaseModel):
    score: int = Field(ge=0, le=400)
    confidence_interval: str

class WeeklySchedule(BaseModel):
    week: int = Field(ge=1, le=6)
    focus: str
    study_hours: int
    key_activities: List[str]

class StudyPlan(BaseModel):
    weekly_schedule: List[WeeklySchedule]

class Recommendation(BaseModel):
    priority: int
    category: str
    action: str
    rationale: str

class AnalyzeDiagnosticResponse(BaseModel):
    id: str
    overall_performance: OverallPerformance
    topic_breakdown: List[TopicBreakdown]
    root_cause_analysis: RootCauseAnalysis
    predicted_jamb_score: PredictedJambScore
    study_plan: StudyPlan
    recommendations: List[Recommendation]
    generated_at: str
```

### Phase 3: AI Service Implementation

#### 3.1 System Instruction
**File**: `backend/services/ai_prompts.py` (NEW)

**Content**: Extract exact system instruction from documentation:

```python
SYSTEM_INSTRUCTION = """
You are an expert Educational AI Diagnostician for Nigerian JAMB preparation. 
Analyze student quiz data and generate a precise diagnostic report with a personalized 6-week study plan.

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

OUTPUT: Return ONLY valid JSON. No markdown formatting, no explanations outside JSON.
"""
```

#### 3.2 JSON Response Schema
**File**: `backend/services/ai_schemas.py` (NEW)

**Content**: Define the complete JSON schema for Gemini structured output:

```python
RESPONSE_SCHEMA = {
    "type": "object",
    "required": [
        "overall_performance",
        "topic_breakdown",
        "root_cause_analysis",
        "predicted_jamb_score",
        "study_plan",
        "recommendations"
    ],
    "properties": {
        "overall_performance": {
            "type": "object",
            "required": ["accuracy", "total_questions", "correct_answers", "avg_confidence", "time_per_question"],
            "properties": {
                "accuracy": {"type": "number"},
                "total_questions": {"type": "integer"},
                "correct_answers": {"type": "integer"},
                "avg_confidence": {"type": "number"},
                "time_per_question": {"type": "number"}
            }
        },
        "topic_breakdown": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["topic", "accuracy", "fluency_index", "status", "questions_attempted", "severity", "dominant_error_type"],
                "properties": {
                    "topic": {"type": "string"},
                    "accuracy": {"type": "number"},
                    "fluency_index": {"type": "number"},
                    "status": {"type": "string", "enum": ["weak", "developing", "strong"]},
                    "questions_attempted": {"type": "integer"},
                    "severity": {"type": ["string", "null"], "enum": ["critical", "moderate", "mild", None]},
                    "dominant_error_type": {"type": ["string", "null"]}
                }
            }
        },
        "root_cause_analysis": {
            "type": "object",
            "required": ["primary_weakness", "error_distribution"],
            "properties": {
                "primary_weakness": {
                    "type": "string",
                    "enum": ["conceptual_gap", "procedural_error", "careless_mistake", "knowledge_gap", "misinterpretation"]
                },
                "error_distribution": {
                    "type": "object",
                    "properties": {
                        "conceptual_gap": {"type": "integer"},
                        "procedural_error": {"type": "integer"},
                        "careless_mistake": {"type": "integer"},
                        "knowledge_gap": {"type": "integer"},
                        "misinterpretation": {"type": "integer"}
                    }
                }
            }
        },
        "predicted_jamb_score": {
            "type": "object",
            "required": ["score", "confidence_interval"],
            "properties": {
                "score": {"type": "integer", "minimum": 0, "maximum": 400},
                "confidence_interval": {"type": "string"}
            }
        },
        "study_plan": {
            "type": "object",
            "required": ["weekly_schedule"],
            "properties": {
                "weekly_schedule": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["week", "focus", "study_hours", "key_activities"],
                        "properties": {
                            "week": {"type": "integer"},
                            "focus": {"type": "string"},
                            "study_hours": {"type": "integer"},
                            "key_activities": {
                                "type": "array",
                                "items": {"type": "string"}
                            }
                        }
                    }
                }
            }
        },
        "recommendations": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["priority", "category", "action", "rationale"],
                "properties": {
                    "priority": {"type": "integer"},
                    "category": {"type": "string"},
                    "action": {"type": "string"},
                    "rationale": {"type": "string"}
                }
            }
        }
    }
}
```

#### 3.3 Enhanced AIService
**File**: `backend/services/ai.py` (REWRITE)

**Key Changes**:
1. Implement structured output using Gemini API
2. Use system instruction and JSON schema
3. Update `analyze_diagnostic()` to accept new input format
4. Return new comprehensive output format
5. Update mock implementation to match new format

**Implementation**:
```python
def analyze_diagnostic(self, quiz_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze diagnostic quiz data using Gemini structured output.
    
    Args:
        quiz_data: Dict with keys: subject, total_questions, time_taken, questions_list
        
    Returns:
        Complete diagnostic analysis matching RESPONSE_SCHEMA
    """
    if self.mock:
        return self._mock_analysis(quiz_data)
    
    # Build user prompt
    user_prompt = self._build_user_prompt(quiz_data)
    
    # Call Gemini with structured output
    try:
        response = self.client.models.generate_content(
            model=self.model_name,
            contents=[{"role": "user", "parts": [{"text": user_prompt}]}],
            config={
                "system_instruction": SYSTEM_INSTRUCTION,
                "response_mime_type": "application/json",
                "response_schema": RESPONSE_SCHEMA
            }
        )
        
        # Parse and validate response
        result = json.loads(response.text)
        return self._validate_response(result)
        
    except Exception as e:
        # Error handling...
        raise AIAPIError(f"AI analysis failed: {str(e)}", 503)
```

### Phase 4: Repository Implementation

#### 4.1 Update Repository Interface
**File**: `backend/repositories/interface.py`

**Changes**:
- Update `save_ai_diagnostic()` to accept new comprehensive format
- Add methods for querying diagnostics by user/quiz

#### 4.2 Update Supabase Repository
**File**: `backend/repositories/supabase_repository.py`

**Changes**:
- Update `save_ai_diagnostic()` to store complete analysis_result
- Extract and store denormalized fields for querying
- Implement proper JSONB storage

### Phase 5: API Routes

#### 5.1 Update Analyze Diagnostic Endpoint
**File**: `backend/routes/ai.py`

**New Implementation**:
```python
@ai_bp.post("/analyze-diagnostic")
@require_auth
@validate_json(AnalyzeDiagnosticRequest)
def analyze_diagnostic(current_user_id):
    """Analyze diagnostic quiz - new comprehensive format"""
    data = request.get_json(force=True)
    
    # Validate input
    # Create/update quiz if quiz_id provided
    # Call AI service
    # Save to database
    # Return comprehensive response
    
    analysis = _ai().analyze_diagnostic(data)
    
    diagnostic = _repo().save_ai_diagnostic({
        "quiz_id": quiz_id,
        "analysis_result": analysis,  # Store full result
        "overall_performance": analysis.get("overall_performance"),
        "topic_breakdown": analysis.get("topic_breakdown"),
        "root_cause_analysis": analysis.get("root_cause_analysis"),
        "predicted_jamb_score": analysis.get("predicted_jamb_score"),
        "study_plan": analysis.get("study_plan"),
        "recommendations": analysis.get("recommendations"),
    })
    
    return jsonify({**analysis, "id": diagnostic["id"]}), 200
```

#### 5.2 Study Plan Endpoint (Optional)
**Decision**: Since study plan is included in diagnostic, we can:
- **Option A**: Keep separate endpoint for regenerating/updating study plans
- **Option B**: Remove separate endpoint (study plan always comes with diagnostic)
- **Option C**: Keep endpoint but it extracts study plan from diagnostic

**Recommendation**: Option C - Keep endpoint for flexibility, but it works with diagnostics.

### Phase 6: Testing

#### 6.1 Unit Tests
**File**: `tests/test_ai_service.py`

**Test Cases**:
1. Mock analysis returns correct format
2. Input validation
3. Response schema validation
4. Error handling
5. Edge cases (all wrong, all correct, etc.)

#### 6.2 Integration Tests
**File**: `tests/test_ai_endpoints.py`

**Test Cases**:
1. End-to-end diagnostic analysis
2. Database storage verification
3. Response format validation
4. Authentication and authorization
5. Error scenarios

#### 6.3 Test Data
**File**: `tests/fixtures/ai_se_test_data.py`

**Content**: Sample data matching documentation examples

### Phase 7: Configuration & Documentation

#### 7.1 Environment Variables
**File**: `env.example`

**Required**:
```
GEMINI_API_KEY=your-api-key-here
AI_MODEL_NAME=gemini-2.0-flash
AI_MOCK=false
SUPABASE_URL=https://new-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

#### 7.2 API Documentation
**File**: `dev_documentation/API_DOCUMENTATION_V2.md`

**Content**:
- Complete API specification
- Request/response examples
- Error handling
- Authentication requirements

## Implementation Checklist

### Pre-Implementation
- [ ] Create new Supabase project
- [ ] Set up new branch
- [ ] Review and approve all decisions (see Decisions Summary)
- [ ] Set up development environment
- [ ] Get Gemini API key

### Phase 1: Database
- [ ] Create migration scripts
- [ ] Run migrations on new Supabase project
- [ ] Set up RLS policies
- [ ] Test database structure
- [ ] Seed sample data (if needed)

### Phase 2: Schemas
- [ ] Update Pydantic schemas
- [ ] Add validation rules
- [ ] Write schema tests
- [ ] Document schemas

### Phase 3: AI Service
- [ ] Extract system instruction
- [ ] Define JSON schema
- [ ] Implement structured output
- [ ] Update mock implementation
- [ ] Add response validation
- [ ] Test with Gemini API
- [ ] Handle errors properly

### Phase 4: Repository
- [ ] Update interface
- [ ] Implement Supabase repository
- [ ] Implement memory repository (for tests)
- [ ] Test database operations

### Phase 5: API Routes
- [ ] Update analyze-diagnostic endpoint
- [ ] Implement study plan endpoint (if needed)
- [ ] Add authentication
- [ ] Add error handling
- [ ] Test endpoints

### Phase 6: Testing
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Create test fixtures
- [ ] Test with documentation examples
- [ ] Test edge cases
- [ ] Performance testing

### Phase 7: Documentation
- [ ] Update environment variables
- [ ] Write API documentation
- [ ] Add code comments
- [ ] Create README for new branch
- [ ] Document deployment steps

## Success Criteria

1. ✅ API accepts new input format exactly as documented
2. ✅ API returns new output format exactly as documented
3. ✅ All calculations (Fluency Index, JAMB Score) are correct
4. ✅ Topic categorization works correctly
5. ✅ Root cause analysis identifies error types accurately
6. ✅ Study plan is generated with 6-week schedule
7. ✅ Database stores complete analysis result
8. ✅ All tests pass
9. ✅ Performance is acceptable (< 30 seconds)
10. ✅ Error handling works correctly

## Timeline Estimate

- **Phase 1**: 1-2 days (Database schema)
- **Phase 2**: 1 day (Schemas)
- **Phase 3**: 3-4 days (AI Service)
- **Phase 4**: 1-2 days (Repository)
- **Phase 5**: 2 days (API Routes)
- **Phase 6**: 2-3 days (Testing)
- **Phase 7**: 1 day (Documentation)

**Total Estimate**: 11-15 days (approximately 2-3 weeks)

## Risk Assessment

### Risk 1: Gemini API Compatibility
**Impact**: High
**Mitigation**: Test API calls early, verify package version

### Risk 2: Schema Validation Issues
**Impact**: Medium
**Mitigation**: Thorough testing, clear error messages

### Risk 3: Performance Issues
**Impact**: Medium
**Mitigation**: Implement caching, monitor response times

## Next Steps

1. Review and approve decisions (see separate document)
2. Create new Supabase project
3. Create new branch
4. Begin Phase 1 implementation
5. Schedule regular check-ins

---

**Document Version**: 2.0  
**Created**: 2025-01-27  
**Last Updated**: 2025-01-27  
**Status**: Pending Decisions Approval

