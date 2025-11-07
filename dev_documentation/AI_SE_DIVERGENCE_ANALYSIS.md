# AI/SE Prompt Divergence Analysis

## Purpose
This document analyzes how much the AI/SE's prompt implementation diverged from the technical brief requirements, even though it exceeds basic requirements.

---

## Technical Brief Requirements (From README.md)

### Expected AI Diagnostic Output (Basic Requirements)
According to `README.md` lines 130-135:

```
1. Analyze Diagnostic:
   Gemini processes quiz responses and returns:
   * Topic strengths & weaknesses
   * Projected score
   * Recommended improvement areas
```

**Key Points:**
- ✅ Basic topic identification (weak/strong)
- ✅ Score projection
- ✅ Improvement recommendations
- ❌ **No specific output format specified**
- ❌ **No calculation formulas specified**
- ❌ **No root cause analysis depth specified**

### Database Schema Requirements (From `0001_schema.sql`)

**`ai_diagnostics` Table Structure:**
```sql
weak_topics jsonb,
strong_topics jsonb,
analysis_summary text,
projected_score int,
foundational_gaps jsonb
```

**Key Points:**
- ✅ Stores `weak_topics` (JSONB)
- ✅ Stores `strong_topics` (JSONB)
- ✅ Stores `analysis_summary` (TEXT)
- ✅ Stores `projected_score` (INT)
- ✅ Stores `foundational_gaps` (JSONB)
- ❌ **No fields for**: `overall_performance`, `topic_breakdown`, `root_cause_analysis`, `predicted_jamb_score`, `recommendations`

---

## Current Backend Implementation

### Diagnostic Analysis Prompt (Current)
**Location:** `backend/services/ai.py` lines 55-68

**Prompt:**
```
"You are an expert JAMB Mathematics tutor in Nigeria.

A student just completed a 30-question diagnostic quiz. Analyze their performance and identify:
1. Weak topics (topics where they scored <60%)
2. Strong topics (topics where they scored >80%)
3. ROOT CAUSES of weaknesses (e.g., 'struggles with quadratics because doesn't understand factoring')
4. Foundational gaps (basic concepts they're missing)

Student data: {responses}

CRITICAL: Return ONLY valid JSON, no explanations, no markdown, no code blocks.
Return a JSON object with this EXACT structure:
{
  "weakTopics": [{"topicId": "...", "topicName": "...", "severity": "...", "rootCause": "..."}],
  "strongTopics": [{"topicId": "...", "topicName": "...", "score": 85}],
  "analysisSummary": "...",
  "projectedScore": 165,
  "foundationalGaps": [{"gapDescription": "...", "affectedTopics": ["..."]}]
}"
```

**Output Format:**
```json
{
  "weakTopics": [...],
  "strongTopics": [...],
  "analysisSummary": "...",
  "projectedScore": 165,
  "foundationalGaps": [...]
}
```

**Compliance Status:**
- ✅ Matches database schema
- ✅ Meets basic brief requirements
- ⚠️ No JSON schema enforcement
- ⚠️ No calculation formulas
- ⚠️ Basic root cause analysis

---

## AI/SE's Implementation

### Diagnostic Analysis Prompt (AI/SE)

**System Instruction:**
```
You are an expert Educational AI Diagnostician for Nigerian JAMB preparation. 
Analyze student quiz data and generate a precise diagnostic report with a personalized 6-week study plan.

CORE RULES:
- Output Format: You MUST output a valid JSON object that strictly follows the provided schema
- Calculations: Perform all calculations as defined (Accuracy, Fluency Index, JAMB Score Projection)
- Categorization: Categorize topics as "weak", "developing", or "strong" based on thresholds
- Root Cause Analysis: Analyze every incorrect answer's explanation to classify the error type
- Data Integrity: Do not invent data. Be specific and actionable.

TOPIC CATEGORIZATION LOGIC:
1. Calculate Fluency Index (FI): FI = (Topic Accuracy) * (Average Topic Confidence / 5)
2. Assign Status:
   - WEAK: FI < 50 OR Accuracy < 60%
   - DEVELOPING: FI 50-70 OR Accuracy 60-75%
   - STRONG: FI > 70 AND Accuracy > 75%

JAMB SCORE PROJECTION:
- Base Score: (Quiz Accuracy) * 400
- Final Score: min(max(Base + Adjustment + Bonus, 0), 400)
```

**JSON Schema (Enforced):**
```json
{
  "overall_performance": {
    "accuracy": number,
    "total_questions": integer,
    "correct_answers": integer,
    "avg_confidence": number,
    "time_per_question": number
  },
  "topic_breakdown": [{
    "topic": string,
    "accuracy": number,
    "fluency_index": number,
    "status": "weak" | "developing" | "strong",
    "questions_attempted": integer,
    "severity": "critical" | "moderate" | "mild" | null,
    "dominant_error_type": string | null
  }],
  "root_cause_analysis": {
    "primary_weakness": "conceptual_gap" | "procedural_error" | "careless_mistake" | "knowledge_gap" | "misinterpretation",
    "error_distribution": {
      "conceptual_gap": integer,
      "procedural_error": integer,
      "careless_mistake": integer,
      "knowledge_gap": integer,
      "misinterpretation": integer
    }
  },
  "predicted_jamb_score": {
    "score": integer (0-400),
    "confidence_interval": string
  },
  "study_plan": {
    "weekly_schedule": [{
      "week": integer,
      "focus": string,
      "study_hours": integer,
      "key_activities": [string]
    }]
  },
  "recommendations": [{
    "priority": integer,
    "category": string,
    "action": string,
    "rationale": string
  }]
}
```

**Output Format:**
```json
{
  "overall_performance": {...},
  "topic_breakdown": [...],
  "root_cause_analysis": {...},
  "predicted_jamb_score": {...},
  "study_plan": {...},
  "recommendations": [...]
}
```

---

## Divergence Analysis

### 1. Output Format Divergence

| Aspect | Technical Brief | Current Backend | AI/SE | Divergence Level |
|--------|----------------|-----------------|-------|------------------|
| **Output Structure** | Not specified | `{weakTopics, strongTopics, analysisSummary, projectedScore, foundationalGaps}` | `{overall_performance, topic_breakdown, root_cause_analysis, predicted_jamb_score, study_plan, recommendations}` | 🔴 **HIGH** |
| **Field Names** | Not specified | camelCase | snake_case | 🟡 **MEDIUM** |
| **Overall Performance** | ❌ Not required | ❌ Not included | ✅ Included | 🟢 **Enhancement** |
| **Topic Breakdown** | ✅ Required (basic) | ✅ Included (basic) | ✅ Included (detailed) | 🟢 **Enhancement** |
| **Root Cause Analysis** | ⚠️ Mentioned | ⚠️ Basic | ✅ Detailed (5 error types) | 🟢 **Enhancement** |
| **Study Plan in Diagnostic** | ❌ Not required | ❌ Not included | ✅ Included | 🔴 **HIGH** |
| **Recommendations** | ✅ Required (basic) | ✅ Included (in summary) | ✅ Included (structured) | 🟢 **Enhancement** |

**Divergence Summary:**
- 🔴 **HIGH**: Output structure completely different
- 🔴 **HIGH**: Includes study plan in diagnostic (should be separate endpoint)
- 🟡 **MEDIUM**: Field naming convention (camelCase vs snake_case)
- 🟢 **Enhancement**: Adds valuable fields not in brief

### 2. Calculation Methods Divergence

| Calculation | Technical Brief | Current Backend | AI/SE | Divergence Level |
|-------------|----------------|-----------------|-------|------------------|
| **Fluency Index** | ❌ Not specified | ❌ Not calculated | ✅ Calculated: `FI = (Topic Accuracy) * (Avg Confidence / 5)` | 🟢 **Enhancement** |
| **Topic Categorization** | ⚠️ Basic (weak/strong) | ⚠️ Basic (weak/strong) | ✅ Advanced (weak/developing/strong with thresholds) | 🟢 **Enhancement** |
| **JAMB Score Projection** | ✅ Required | ✅ Basic: Simple projection | ✅ Detailed: `(Accuracy * 400) + Adjustment + Bonus` | 🟢 **Enhancement** |
| **Confidence Score** | ❌ Not required | ❌ Not collected | ✅ Required (1-5 scale) | 🔴 **HIGH** |

**Divergence Summary:**
- 🔴 **HIGH**: Requires confidence scores (not in current system)
- 🟢 **Enhancement**: Adds sophisticated calculations not in brief

### 3. Root Cause Analysis Divergence

| Aspect | Technical Brief | Current Backend | AI/SE | Divergence Level |
|--------|----------------|-----------------|-------|------------------|
| **Error Types** | ⚠️ Not specified | ⚠️ Basic (mentioned in rootCause) | ✅ 5 types: conceptual_gap, procedural_error, careless_mistake, knowledge_gap, misinterpretation | 🟢 **Enhancement** |
| **Error Distribution** | ❌ Not required | ❌ Not included | ✅ Counted per error type | 🟢 **Enhancement** |
| **Primary Weakness** | ⚠️ Mentioned | ⚠️ In rootCause | ✅ Explicitly identified | 🟢 **Enhancement** |

**Divergence Summary:**
- 🟢 **Enhancement**: Significantly more detailed than brief requires

### 4. Input Format Divergence

| Aspect | Technical Brief | Current Backend | AI/SE | Divergence Level |
|--------|----------------|-----------------|-------|------------------|
| **Input Structure** | Not specified | `{quizId, responses[]}` | `{subject, total_questions, time_taken, questions_list[]}` | 🔴 **HIGH** |
| **Confidence Field** | ❌ Not required | ❌ Not collected | ✅ Required | 🔴 **HIGH** |
| **Topic Field** | ⚠️ Implied | ⚠️ From question data | ✅ Required per question | 🟡 **MEDIUM** |
| **Time Tracking** | ⚠️ Available | ✅ Collected | ✅ Required | ✅ **Compatible** |

**Divergence Summary:**
- 🔴 **HIGH**: Different input structure
- 🔴 **HIGH**: Requires confidence scores
- 🟡 **MEDIUM**: Requires topic per question

### 5. Study Plan Integration Divergence

| Aspect | Technical Brief | Current Backend | AI/SE | Divergence Level |
|--------|----------------|-----------------|-------|------------------|
| **Study Plan Location** | ✅ Separate endpoint | ✅ Separate endpoint (`/generate-study-plan`) | ❌ Included in diagnostic output | 🔴 **HIGH** |
| **Study Plan Structure** | Not specified | `{weeks: [{weekNumber, focus, topics[], milestones, daily[]}]}` | `{weekly_schedule: [{week, focus, study_hours, key_activities[]}]}` | 🟡 **MEDIUM** |

**Divergence Summary:**
- 🔴 **HIGH**: Includes study plan in diagnostic (should be separate)
- 🟡 **MEDIUM**: Different structure (but both valid)

---

## Overall Divergence Assessment

### Divergence Categories

#### 🔴 **HIGH DIVERGENCE** (Requires Significant Changes)
1. **Output Format**: Completely different structure
2. **Input Format**: Different expected input structure
3. **Confidence Scores**: Required but not collected
4. **Study Plan Location**: Included in diagnostic instead of separate endpoint

#### 🟡 **MEDIUM DIVERGENCE** (Requires Moderate Changes)
1. **Field Naming**: snake_case vs camelCase
2. **Topic Information**: Needs to be fetched per question
3. **Study Plan Structure**: Different but compatible

#### 🟢 **ENHANCEMENTS** (Exceeds Requirements - Positive)
1. **Fluency Index Calculation**: Not required but valuable
2. **Detailed Root Cause Analysis**: Exceeds basic requirements
3. **Overall Performance Metrics**: Adds valuable insights
4. **Structured Recommendations**: More actionable than basic summary
5. **JSON Schema Enforcement**: Better reliability

---

## Questions to Ask AI/SE

### 1. Design Decisions
- **Q**: Why did you include the study plan in the diagnostic output instead of keeping it separate?
- **Q**: Why did you choose snake_case for field names when the backend uses camelCase?
- **Q**: Why did you require confidence scores (1-5) when the current system doesn't collect them?

### 2. Technical Choices
- **Q**: Why did you use a JSON schema instead of just prompt instructions?
- **Q**: Why did you add Fluency Index calculation when it wasn't in the brief?
- **Q**: Why did you create 5 error types instead of the basic root cause mentioned?

### 3. Integration Considerations
- **Q**: Did you consider the current database schema when designing the output format?
- **Q**: How should we handle the input format mismatch (responses[] vs questions_list[])?
- **Q**: Should we transform your output to match the current schema, or update the schema?

---

## Recommendations

### Option 1: Transform AI/SE Output (Quick Integration)
**Pros:**
- ✅ No database changes needed
- ✅ Faster integration (4-6 hours)
- ✅ Backward compatible

**Cons:**
- ❌ Loses some AI/SE enhancements
- ❌ Requires transformation layer
- ❌ May need to store full response separately

### Option 2: Update Schema to Match AI/SE (Full Integration)
**Pros:**
- ✅ Preserves all AI/SE enhancements
- ✅ Better data structure
- ✅ More queryable fields

**Cons:**
- ❌ Requires database migration
- ❌ Longer integration (8-12 hours)
- ❌ May break existing code

### Option 3: Hybrid Approach (Recommended)
**Pros:**
- ✅ Store AI/SE full response in `analysis_summary` (JSONB)
- ✅ Transform to current format for compatibility
- ✅ Gradually migrate frontend to use new fields

**Cons:**
- ⚠️ Temporary complexity
- ⚠️ Need to maintain transformation logic

---

## Conclusion

### Divergence Level: **MODERATE TO HIGH**

The AI/SE's implementation:
- ✅ **Exceeds requirements** in quality and depth
- 🔴 **Diverges significantly** in output format
- 🔴 **Diverges** in input requirements (confidence scores)
- 🟢 **Adds valuable enhancements** not in brief

### Key Divergences:
1. **Output structure** completely different (HIGH)
2. **Input format** different (HIGH)
3. **Confidence scores** required but not collected (HIGH)
4. **Study plan** included in diagnostic (HIGH)
5. **Field naming** convention different (MEDIUM)

### Overall Assessment:
The AI/SE's work is **excellent quality** but requires **significant integration effort** due to format mismatches. The enhancements are valuable, but the divergence means you'll need to either:
- Transform the output to match current schema
- Update the schema to match AI/SE output
- Use a hybrid approach

**Recommendation**: Discuss with AI/SE about the design decisions, then choose integration approach based on project timeline and priorities.

