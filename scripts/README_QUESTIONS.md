# Question Data Generation and Import Guide

## Quick Start

### 1. Generate Dummy Questions

```bash
# Generate 100 dummy questions in JSON format
python scripts/generate_dummy_questions.py -n 100 --format json

# Generate 100 dummy questions in SQL format
python scripts/generate_dummy_questions.py -n 100 --format sql

# Generate both JSON and SQL
python scripts/generate_dummy_questions.py -n 100 --format both
```

### 2. Import Questions into Database

```bash
# Import questions from JSON file
python scripts/import_questions.py dummy_questions.json

# Dry run (validate without importing)
python scripts/import_questions.py dummy_questions.json --dry-run

# Import with custom batch size
python scripts/import_questions.py dummy_questions.json --batch-size 100
```

---

## Prerequisites

### 1. Install Dependencies

```bash
pip install supabase python-dotenv
```

### 2. Set Environment Variables

Create or update `.env` file:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Ensure Topics Exist

Before importing questions, make sure topics exist in the database:

```sql
-- Check existing topics
SELECT id, name, subject FROM topics;

-- If no topics exist, create them first
INSERT INTO topics (name, subject, description, jamb_weight)
VALUES 
  ('Algebra', 'Mathematics', 'Linear equations, quadratic equations, polynomials', 0.15),
  ('Geometry', 'Mathematics', 'Shapes, angles, area, perimeter, volume', 0.12),
  ('Trigonometry', 'Mathematics', 'Sine, cosine, tangent, identities', 0.10);
```

---

## Step-by-Step Guide

### Step 1: Generate Dummy Questions

```bash
# Generate 100 questions
python scripts/generate_dummy_questions.py -n 100 --format json
```

This creates `dummy_questions.json` with 100 questions.

### Step 2: Validate Questions (Dry Run)

```bash
# Validate without importing
python scripts/import_questions.py dummy_questions.json --dry-run
```

This will:
- ✅ Check if all required fields are present
- ✅ Verify topics exist in database
- ✅ Validate correct_answer format
- ✅ Check difficulty values

### Step 3: Import Questions

```bash
# Import questions
python scripts/import_questions.py dummy_questions.json
```

This will:
- ✅ Fetch topics from database
- ✅ Validate all questions
- ✅ Import questions in batches
- ✅ Show progress and results

### Step 4: Verify Import

```bash
# Check questions in database
curl http://localhost:5000/api/quiz/questions?total=10
```

Or in Supabase SQL Editor:

```sql
-- Count questions
SELECT COUNT(*) FROM questions;

-- Count by topic
SELECT topic, COUNT(*) as count
FROM questions
GROUP BY topic
ORDER BY count DESC;

-- Count by difficulty
SELECT difficulty, COUNT(*) as count
FROM questions
GROUP BY difficulty
ORDER BY count DESC;
```

---

## Question Format

### Required Fields

- `topic` - Topic name (must match topics table)
- `subject` - Subject name (e.g., "Mathematics")
- `question_text` - The question text
- `option_a` - Option A
- `option_b` - Option B
- `option_c` - Option C
- `option_d` - Option D
- `correct_answer` - Correct answer (A, B, C, or D)

### Optional Fields

- `topic_id` - Topic UUID (will be fetched automatically if not provided)
- `difficulty` - Difficulty level (easy, medium, hard)
- `subtopic` - Subtopic within the main topic

### Example Question

```json
{
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

## Troubleshooting

### Error: Topic not found

**Problem:** Questions reference topics that don't exist in database.

**Solution:**
1. Check existing topics: `SELECT * FROM topics;`
2. Create missing topics in database
3. Or update questions to use existing topic names

### Error: Invalid correct_answer

**Problem:** `correct_answer` is not A, B, C, or D.

**Solution:**
- Ensure `correct_answer` is exactly "A", "B", "C", or "D" (case-insensitive)

### Error: Missing required fields

**Problem:** Questions are missing required fields.

**Solution:**
- Check that all required fields are present
- Use `--dry-run` to validate before importing

### Error: Connection to Supabase failed

**Problem:** Cannot connect to Supabase.

**Solution:**
1. Check `.env` file has correct `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
2. Verify Supabase project is accessible
3. Check network connection

---

## Advanced Usage

### Generate Questions for Specific Topics

Edit `scripts/generate_dummy_questions.py` to customize topics and question templates.

### Import Questions via SQL

If you prefer SQL:

```bash
# Generate SQL file
python scripts/generate_dummy_questions.py -n 100 --format sql

# Then run in Supabase SQL Editor
# (Update topic_id values first!)
```

### Bulk Import via API

```python
import requests
import json

# Load questions
with open('dummy_questions.json', 'r') as f:
    questions = json.load(f)

# Import via Supabase API
url = "https://your-project.supabase.co/rest/v1/questions"
headers = {
    "apikey": "your-service-role-key",
    "Authorization": "Bearer your-service-role-key",
    "Content-Type": "application/json"
}

# Import in batches
batch_size = 50
for i in range(0, len(questions), batch_size):
    batch = questions[i:i + batch_size]
    response = requests.post(url, json=batch, headers=headers)
    print(f"Imported batch {i // batch_size + 1}")
```

---

## Files

- **Question Generator:** `scripts/generate_dummy_questions.py`
- **Question Importer:** `scripts/import_questions.py`
- **Format Documentation:** `dev_documentation/QUESTION_DATA_FORMAT.md`
- **This Guide:** `scripts/README_QUESTIONS.md`

---

## Next Steps

1. ✅ Generate dummy questions
2. ✅ Validate questions (dry run)
3. ✅ Import questions into database
4. ✅ Verify questions in API
5. ✅ Test quiz functionality

---

**Ready to populate your question database!** 🚀

