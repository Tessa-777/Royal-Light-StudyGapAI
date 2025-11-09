# Questions Setup Summary

## ✅ What Was Created

### 1. Question Generator Script
**File:** `scripts/generate_dummy_questions.py`

- Generates realistic JAMB-style Mathematics questions
- Supports JSON and SQL output formats
- Includes questions for all major topics
- Distributes questions across difficulty levels (easy, medium, hard)

### 2. Question Importer Script
**File:** `scripts/import_questions.py`

- Imports questions from JSON into Supabase database
- Validates questions before importing
- Fetches topic IDs automatically
- Supports dry-run mode for validation
- Imports in batches for performance

### 3. Documentation
**Files:**
- `dev_documentation/QUESTION_DATA_FORMAT.md` - Complete format specification
- `scripts/README_QUESTIONS.md` - Quick start guide

---

## 🚀 Quick Start

### Step 1: Generate Dummy Questions

```bash
# Generate 100 dummy questions
python scripts/generate_dummy_questions.py -n 100 --format json
```

This creates `dummy_questions.json` with 100 questions.

### Step 2: Import Questions

```bash
# Import questions into database
python scripts/import_questions.py dummy_questions.json
```

### Step 3: Verify

```bash
# Test API endpoint
curl http://localhost:5000/api/quiz/questions?total=10
```

---

## 📋 Question Format

### Required Fields

- **topic** - Topic name (e.g., "Algebra")
- **subject** - Subject name (e.g., "Mathematics")
- **question_text** - The question text
- **option_a, option_b, option_c, option_d** - Answer options
- **correct_answer** - Correct answer (A, B, C, or D)

### Optional Fields

- **difficulty** - Difficulty level (easy, medium, hard)
- **subtopic** - Subtopic within the main topic

### Example

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

## 📊 Database Schema

### Questions Table

```sql
CREATE TABLE questions (
  id UUID PRIMARY KEY,
  topic_id UUID REFERENCES topics(id),
  topic VARCHAR(100) NOT NULL,
  subject VARCHAR(50) NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer VARCHAR(1) NOT NULL,
  difficulty VARCHAR(20),
  subtopic VARCHAR(100)
);
```

---

## 🔧 Prerequisites

### 1. Install Dependencies

```bash
pip install supabase python-dotenv
```

### 2. Set Environment Variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Ensure Topics Exist

Topics must exist in the database before importing questions:

```sql
SELECT * FROM topics;
```

If no topics exist, create them first (see `backend/repositories/memory_repository.py` for example topics).

---

## 📝 When You Get Real Questions

### Format Your Questions

When you get real questions, format them as JSON:

```json
[
  {
    "topic": "Algebra",
    "subject": "Mathematics",
    "question_text": "Your question here",
    "option_a": "Option A",
    "option_b": "Option B",
    "option_c": "Option C",
    "option_d": "Option D",
    "correct_answer": "B",
    "difficulty": "medium",
    "subtopic": "Linear Equations"
  }
]
```

### Import Process

1. **Save questions to JSON file:**
   ```bash
   # Save your questions to questions.json
   ```

2. **Validate (dry run):**
   ```bash
   python scripts/import_questions.py questions.json --dry-run
   ```

3. **Import:**
   ```bash
   python scripts/import_questions.py questions.json
   ```

4. **Verify:**
   ```bash
   curl http://localhost:5000/api/quiz/questions?total=10
   ```

---

## 🎯 Supported Topics

The generator includes questions for:

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

## 📚 Documentation Files

1. **`dev_documentation/QUESTION_DATA_FORMAT.md`**
   - Complete field specification
   - Validation rules
   - Example questions
   - Bulk import methods

2. **`scripts/README_QUESTIONS.md`**
   - Quick start guide
   - Step-by-step instructions
   - Troubleshooting guide

3. **`dev_documentation/QUESTIONS_SETUP_SUMMARY.md`**
   - This file
   - Overview and quick reference

---

## ✅ Checklist

### Before Importing Questions:

- [ ] Topics exist in database
- [ ] Environment variables set (.env file)
- [ ] Dependencies installed (supabase, python-dotenv)
- [ ] Questions formatted correctly (JSON)

### Import Process:

- [ ] Generate or prepare questions
- [ ] Validate questions (dry run)
- [ ] Import questions
- [ ] Verify questions in database
- [ ] Test API endpoint

### After Importing:

- [ ] Questions appear in API
- [ ] Questions are properly categorized
- [ ] Difficulty levels are correct
- [ ] Topics are linked correctly

---

## 🆘 Troubleshooting

### Common Issues

1. **Topic not found**
   - Ensure topics exist in database
   - Check topic names match exactly (case-sensitive)

2. **Invalid correct_answer**
   - Must be A, B, C, or D (case-insensitive)

3. **Connection error**
   - Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env

4. **Missing fields**
   - Use --dry-run to validate before importing

---

## 🚀 Next Steps

1. ✅ Generate dummy questions for testing
2. ✅ Import questions into database
3. ✅ Test quiz functionality
4. ✅ Get real questions and format them
5. ✅ Import real questions when ready

---

**You're all set to populate your question database!** 🎉

For detailed information, see:
- `dev_documentation/QUESTION_DATA_FORMAT.md` - Complete format specification
- `scripts/README_QUESTIONS.md` - Detailed usage guide

