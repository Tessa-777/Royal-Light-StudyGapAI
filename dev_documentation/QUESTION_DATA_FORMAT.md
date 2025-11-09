# Question Data Format Specification

## Overview

This document details the format and fields required for questions in the StudyGapAI database.

---

## Database Schema

### Questions Table

```sql
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  topic VARCHAR(100) NOT NULL,           -- Topic name (e.g., "Algebra")
  subject VARCHAR(50) NOT NULL,          -- Subject (e.g., "Mathematics")
  question_text TEXT NOT NULL,           -- The question itself
  option_a TEXT NOT NULL,                -- Option A
  option_b TEXT NOT NULL,                -- Option B
  option_c TEXT NOT NULL,                -- Option C
  option_d TEXT NOT NULL,                -- Option D
  correct_answer VARCHAR(1) NOT NULL,    -- Correct answer (A, B, C, or D)
  difficulty VARCHAR(20),                -- Difficulty level (easy, medium, hard)
  subtopic VARCHAR(100)                  -- Subtopic (optional)
);
```

---

## Required Fields

### 1. **topic_id** (UUID)
- **Type:** UUID
- **Required:** Yes (but can be NULL if topic doesn't exist yet)
- **Description:** Foreign key to the `topics` table
- **Example:** `"123e4567-e89b-12d3-a456-426614174000"`

### 2. **topic** (String)
- **Type:** VARCHAR(100)
- **Required:** Yes
- **Description:** Topic name (must match topic name in topics table)
- **Examples:** `"Algebra"`, `"Geometry"`, `"Trigonometry"`
- **Note:** This is stored directly in the questions table for performance

### 3. **subject** (String)
- **Type:** VARCHAR(50)
- **Required:** Yes
- **Description:** Subject name
- **Examples:** `"Mathematics"`, `"Physics"`, `"Chemistry"`
- **Note:** Currently only "Mathematics" is supported

### 4. **question_text** (Text)
- **Type:** TEXT
- **Required:** Yes
- **Description:** The question text
- **Example:** `"Solve for x: 2x + 5 = 15"`
- **Note:** Can include LaTeX, HTML, or plain text

### 5. **option_a** (Text)
- **Type:** TEXT
- **Required:** Yes
- **Description:** Option A text
- **Example:** `"x = 3"`

### 6. **option_b** (Text)
- **Type:** TEXT
- **Required:** Yes
- **Description:** Option B text
- **Example:** `"x = 5"`

### 7. **option_c** (Text)
- **Type:** TEXT
- **Required:** Yes
- **Description:** Option C text
- **Example:** `"x = 10"`

### 8. **option_d** (Text)
- **Type:** TEXT
- **Required:** Yes
- **Description:** Option D text
- **Example:** `"x = 20"`

### 9. **correct_answer** (String)
- **Type:** VARCHAR(1)
- **Required:** Yes
- **Description:** Correct answer (must be A, B, C, or D)
- **Valid Values:** `"A"`, `"B"`, `"C"`, `"D"`
- **Example:** `"B"`

---

## Optional Fields

### 10. **difficulty** (String)
- **Type:** VARCHAR(20)
- **Required:** No
- **Description:** Difficulty level
- **Valid Values:** `"easy"`, `"medium"`, `"hard"`
- **Example:** `"medium"`
- **Default:** None (can be NULL)

### 11. **subtopic** (String)
- **Type:** VARCHAR(100)
- **Required:** No
- **Description:** Subtopic within the main topic
- **Examples:** `"Linear Equations"`, `"Quadratic Equations"`, `"Triangles"`
- **Default:** None (can be NULL)

---

## Data Formats

### JSON Format

```json
{
  "topic_id": "123e4567-e89b-12d3-a456-426614174000",
  "topic": "Algebra",
  "subject": "Mathematics",
  "question_text": "Solve for x: 2x + 5 = 15",
  "option_a": "x = 3",
  "option_b": "x = 5",
  "option_c": "x = 10",
  "option_d": "x = 20",
  "correct_answer": "B",
  "difficulty": "easy",
  "subtopic": "Linear Equations"
}
```

### SQL INSERT Format

```sql
INSERT INTO questions (topic_id, topic, subject, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, subtopic)
VALUES (
    '123e4567-e89b-12d3-a456-426614174000'::uuid,
    'Algebra',
    'Mathematics',
    'Solve for x: 2x + 5 = 15',
    'x = 3',
    'x = 5',
    'x = 10',
    'x = 20',
    'B',
    'easy',
    'Linear Equations'
);
```

### Python Dictionary Format

```python
{
    "topic_id": "123e4567-e89b-12d3-a456-426614174000",
    "topic": "Algebra",
    "subject": "Mathematics",
    "question_text": "Solve for x: 2x + 5 = 15",
    "option_a": "x = 3",
    "option_b": "x = 5",
    "option_c": "x = 10",
    "option_d": "x = 20",
    "correct_answer": "B",
    "difficulty": "easy",
    "subtopic": "Linear Equations"
}
```

---

## Validation Rules

### 1. **correct_answer**
- Must be exactly one of: `"A"`, `"B"`, `"C"`, `"D"`
- Case-insensitive (will be converted to uppercase)
- Cannot be NULL

### 2. **difficulty**
- Must be one of: `"easy"`, `"medium"`, `"hard"`
- Case-sensitive
- Can be NULL (optional)

### 3. **topic**
- Must match an existing topic name in the `topics` table
- Case-sensitive
- Cannot be NULL

### 4. **subject**
- Currently only `"Mathematics"` is supported
- Case-sensitive
- Cannot be NULL

### 5. **Text Fields**
- `question_text`, `option_a`, `option_b`, `option_c`, `option_d` cannot be empty
- Maximum length: TEXT (unlimited in PostgreSQL)
- Special characters must be properly escaped in SQL

---

## Topic Requirements

### Before Inserting Questions

1. **Topics must exist in the `topics` table:**
   ```sql
   SELECT id, name FROM topics WHERE name = 'Algebra';
   ```

2. **Get topic_id for your questions:**
   ```sql
   -- Get all topics
   SELECT id, name, subject FROM topics;
   ```

3. **Common JAMB Mathematics Topics:**
   - Algebra
   - Geometry
   - Trigonometry
   - Calculus
   - Statistics
   - Number System
   - Sets
   - Sequences & Series
   - Coordinate Geometry
   - Probability

---

## Bulk Import Methods

### Method 1: Using Python Script

```bash
# Generate dummy questions
python scripts/generate_dummy_questions.py -n 100 --format json

# This creates dummy_questions.json
```

### Method 2: Using SQL Script

```bash
# Generate SQL INSERT statements
python scripts/generate_dummy_questions.py -n 100 --format sql

# This creates dummy_questions.sql
# Then run in Supabase SQL Editor:
```

### Method 3: Using Supabase API

```python
import requests
import json

# Load questions from JSON
with open('dummy_questions.json', 'r') as f:
    questions = json.load(f)

# Insert via Supabase API
url = "https://your-project.supabase.co/rest/v1/questions"
headers = {
    "apikey": "your-service-role-key",
    "Authorization": "Bearer your-service-role-key",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

response = requests.post(url, json=questions, headers=headers)
```

### Method 4: Using Supabase Client (Python)

```python
from supabase import create_client

supabase = create_client(url, key)

# Insert questions
questions = [...]  # Your questions list
for question in questions:
    supabase.table("questions").insert(question).execute()
```

---

## Example Questions

### Easy Question

```json
{
  "topic_id": "uuid-here",
  "topic": "Algebra",
  "subject": "Mathematics",
  "question_text": "Solve for x: 2x + 5 = 15",
  "option_a": "x = 3",
  "option_b": "x = 5",
  "option_c": "x = 10",
  "option_d": "x = 20",
  "correct_answer": "B",
  "difficulty": "easy",
  "subtopic": "Linear Equations"
}
```

### Medium Question

```json
{
  "topic_id": "uuid-here",
  "topic": "Geometry",
  "subject": "Mathematics",
  "question_text": "What is the area of a circle with radius 7cm? (Use π = 22/7)",
  "option_a": "44 cm²",
  "option_b": "154 cm²",
  "option_c": "308 cm²",
  "option_d": "616 cm²",
  "correct_answer": "B",
  "difficulty": "medium",
  "subtopic": "Circles"
}
```

### Hard Question

```json
{
  "topic_id": "uuid-here",
  "topic": "Algebra",
  "subject": "Mathematics",
  "question_text": "If the roots of x² - px + q = 0 are 2 and 3, what is the value of p + q?",
  "option_a": "11",
  "option_b": "7",
  "option_c": "5",
  "option_d": "13",
  "correct_answer": "A",
  "difficulty": "hard",
  "subtopic": "Quadratic Equations"
}
```

---

## Testing Questions

### Verify Questions Were Inserted

```sql
-- Count questions by topic
SELECT topic, COUNT(*) as count
FROM questions
GROUP BY topic
ORDER BY count DESC;

-- Count questions by difficulty
SELECT difficulty, COUNT(*) as count
FROM questions
GROUP BY difficulty
ORDER BY count DESC;

-- Get sample questions
SELECT topic, question_text, correct_answer, difficulty
FROM questions
LIMIT 10;
```

### Test API Endpoint

```bash
# Get questions via API
curl http://localhost:5000/api/quiz/questions?total=30
```

---

## Best Practices

### 1. **Topic Consistency**
- Use consistent topic names (match topics table exactly)
- Use consistent subject names

### 2. **Difficulty Distribution**
- Recommended: 50% easy, 30% medium, 20% hard
- Adjust based on your target audience

### 3. **Question Quality**
- Clear and unambiguous questions
- All options should be plausible
- Correct answer should be clearly correct
- Avoid trick questions in diagnostic quizzes

### 4. **Subtopic Usage**
- Use subtopics for better organization
- Helps with AI analysis and recommendations

### 5. **Bulk Import**
- Import in batches of 100-500 questions
- Verify data before bulk import
- Test with a small sample first

---

## Troubleshooting

### Common Issues

1. **Topic Not Found**
   - Error: Foreign key constraint violation
   - Solution: Ensure topics exist before inserting questions

2. **Invalid correct_answer**
   - Error: Check constraint violation
   - Solution: Use only A, B, C, or D

3. **Empty Text Fields**
   - Error: NOT NULL constraint violation
   - Solution: Ensure all required text fields are filled

4. **Topic Name Mismatch**
   - Error: Questions don't appear in API
   - Solution: Verify topic names match exactly (case-sensitive)

---

## Next Steps

1. ✅ **Generate Dummy Questions:**
   ```bash
   python scripts/generate_dummy_questions.py -n 100
   ```

2. ✅ **Verify Topics Exist:**
   ```sql
   SELECT * FROM topics;
   ```

3. ✅ **Import Questions:**
   - Use SQL script in Supabase SQL Editor
   - Or use Python script with Supabase client
   - Or use bulk import via API

4. ✅ **Test Questions:**
   ```bash
   curl http://localhost:5000/api/quiz/questions?total=30
   ```

5. ✅ **Verify in Database:**
   ```sql
   SELECT COUNT(*) FROM questions;
   ```

---

## Files Reference

- **Question Generator Script:** `scripts/generate_dummy_questions.py`
- **Database Schema:** `supabase/migrations/0001_ai_se_enhanced_schema.sql`
- **Repository Implementation:** `backend/repositories/supabase_repository.py`
- **API Endpoint:** `backend/routes/quiz.py`

---

**Ready to generate and import questions!** 🚀

