# Questions Database Setup

## 🚨 Issue: Empty Questions Database

The quiz page is not loading because the **questions database is empty**. The backend is successfully returning a 200 response, but with an empty array `[]`.

## ✅ Solution: Add Questions to Database

You need to populate the `questions` table in your Supabase database with quiz questions.

## 📋 Step 1: Check Database Structure

### Questions Table Schema

The questions table should have the following columns:

- `id` - UUID (primary key)
- `topic` - String (e.g., "Mathematics", "Physics", "Chemistry")
- `question_text` - Text (the question)
- `option_a` - String
- `option_b` - String
- `option_c` - String
- `option_d` - String
- `correct_answer` - String ('A', 'B', 'C', or 'D')
- `difficulty` - String (e.g., "Easy", "Medium", "Hard")
- `subtopic` - String (optional)
- `created_at` - Timestamp
- `updated_at` - Timestamp

## 📋 Step 2: Add Questions to Database

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
2. **Navigate to Table Editor**
3. **Select `questions` table**
4. **Click "Insert" → "Insert row"**
5. **Fill in the question data:**
   ```
   topic: "Mathematics"
   question_text: "What is 2 + 2?"
   option_a: "3"
   option_b: "4"
   option_c: "5"
   option_d: "6"
   correct_answer: "B"
   difficulty: "Easy"
   subtopic: "Arithmetic" (optional)
   ```
6. **Click "Save"**
7. **Repeat for more questions**

### Option 2: Using SQL Editor

1. **Go to Supabase Dashboard**
2. **Navigate to SQL Editor**
3. **Run this SQL to insert sample questions:**

```sql
-- Insert sample Mathematics questions
INSERT INTO questions (topic, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, subtopic)
VALUES
  ('Mathematics', 'What is 2 + 2?', '3', '4', '5', '6', 'B', 'Easy', 'Arithmetic'),
  ('Mathematics', 'What is 5 × 3?', '10', '15', '20', '25', 'B', 'Easy', 'Multiplication'),
  ('Mathematics', 'What is the square root of 16?', '2', '4', '6', '8', 'B', 'Easy', 'Square Roots'),
  ('Mathematics', 'What is 10 - 3?', '5', '6', '7', '8', 'C', 'Easy', 'Subtraction'),
  ('Mathematics', 'What is 8 ÷ 2?', '2', '3', '4', '5', 'C', 'Easy', 'Division'),
  ('Mathematics', 'What is 3²?', '6', '9', '12', '15', 'B', 'Easy', 'Exponents'),
  ('Mathematics', 'What is the value of π (pi) approximately?', '2.14', '3.14', '4.14', '5.14', 'B', 'Easy', 'Constants'),
  ('Mathematics', 'What is 20% of 100?', '10', '20', '30', '40', 'B', 'Easy', 'Percentages'),
  ('Mathematics', 'What is the area of a rectangle with length 5 and width 3?', '8', '15', '16', '20', 'B', 'Easy', 'Geometry'),
  ('Mathematics', 'What is 1/2 + 1/2?', '1/4', '1/2', '1', '2', 'C', 'Easy', 'Fractions');

-- Insert sample Physics questions
INSERT INTO questions (topic, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, subtopic)
VALUES
  ('Physics', 'What is the unit of force?', 'Joule', 'Newton', 'Watt', 'Pascal', 'B', 'Easy', 'Mechanics'),
  ('Physics', 'What is the speed of light in vacuum?', '3 × 10⁶ m/s', '3 × 10⁸ m/s', '3 × 10¹⁰ m/s', '3 × 10¹² m/s', 'B', 'Easy', 'Optics'),
  ('Physics', 'What is acceleration due to gravity on Earth?', '8.9 m/s²', '9.8 m/s²', '10.8 m/s²', '11.8 m/s²', 'B', 'Easy', 'Gravitation'),
  ('Physics', 'What is the unit of energy?', 'Newton', 'Joule', 'Watt', 'Pascal', 'B', 'Easy', 'Energy'),
  ('Physics', 'What is the formula for kinetic energy?', 'mgh', '½mv²', 'mv', 'mgh/2', 'B', 'Medium', 'Energy'),
  ('Physics', 'What is Ohm''s law?', 'V = IR', 'V = I/R', 'V = R/I', 'V = I²R', 'A', 'Medium', 'Electricity'),
  ('Physics', 'What is the unit of electric current?', 'Volt', 'Ampere', 'Ohm', 'Watt', 'B', 'Easy', 'Electricity'),
  ('Physics', 'What is the unit of power?', 'Joule', 'Newton', 'Watt', 'Pascal', 'C', 'Easy', 'Energy'),
  ('Physics', 'What is the formula for momentum?', 'mv', 'ma', 'mgh', '½mv²', 'A', 'Easy', 'Mechanics'),
  ('Physics', 'What is the unit of frequency?', 'Hertz', 'Newton', 'Joule', 'Watt', 'A', 'Easy', 'Waves');

-- Insert sample Chemistry questions
INSERT INTO questions (topic, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, subtopic)
VALUES
  ('Chemistry', 'What is the chemical symbol for water?', 'H2O', 'CO2', 'NaCl', 'O2', 'A', 'Easy', 'Compounds'),
  ('Chemistry', 'What is the atomic number of hydrogen?', '0', '1', '2', '3', 'B', 'Easy', 'Atomic Structure'),
  ('Chemistry', 'What is the pH of pure water?', '5', '6', '7', '8', 'C', 'Easy', 'Acids and Bases'),
  ('Chemistry', 'What is the chemical symbol for oxygen?', 'O', 'Ox', 'Og', 'Oy', 'A', 'Easy', 'Elements'),
  ('Chemistry', 'What is the formula for carbon dioxide?', 'CO', 'CO2', 'C2O', 'C2O2', 'B', 'Easy', 'Compounds'),
  ('Chemistry', 'What is the atomic number of carbon?', '4', '5', '6', '7', 'C', 'Easy', 'Atomic Structure'),
  ('Chemistry', 'What is the most abundant gas in Earth''s atmosphere?', 'Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Argon', 'B', 'Easy', 'Atmosphere'),
  ('Chemistry', 'What is the chemical symbol for sodium?', 'So', 'Na', 'Sd', 'Sa', 'B', 'Easy', 'Elements'),
  ('Chemistry', 'What is the formula for table salt?', 'NaCl', 'Na2Cl', 'NaCl2', 'Na2Cl2', 'A', 'Easy', 'Compounds'),
  ('Chemistry', 'What is the pH of a strong acid?', '0-2', '3-5', '6-7', '8-14', 'A', 'Medium', 'Acids and Bases');
```

### Option 3: Using Backend API (If Available)

If your backend has an endpoint to add questions, you can use it:

```bash
curl -X POST http://localhost:5000/api/questions \
  -H "Content-Type: application/json" \
  -d '{
    "topic": "Mathematics",
    "question_text": "What is 2 + 2?",
    "option_a": "3",
    "option_b": "4",
    "option_c": "5",
    "option_d": "6",
    "correct_answer": "B",
    "difficulty": "Easy",
    "subtopic": "Arithmetic"
  }'
```

## 📋 Step 3: Verify Questions Are Added

### Check in Supabase Dashboard

1. **Go to Table Editor**
2. **Select `questions` table**
3. **Check row count** - Should show the number of questions you added
4. **View a few questions** - Verify the data is correct

### Test API Endpoint

```bash
# Test the questions endpoint
curl http://localhost:5000/api/quiz/questions?total=30
```

Should return a JSON array with questions.

### Test in Frontend

1. **Refresh the quiz page**
2. **Check console logs** - Should show questions count > 0
3. **Quiz should load** - Questions should be displayed

## 📋 Step 4: Recommended Number of Questions

For a diagnostic quiz:
- **Minimum:** 10-15 questions per topic
- **Recommended:** 30+ questions total (mix of topics)
- **Optimal:** 50+ questions for better diagnostics

### Topic Distribution (Recommended)

- **Mathematics:** 10-15 questions
- **Physics:** 10-15 questions
- **Chemistry:** 10-15 questions
- **Biology:** 10-15 questions (if applicable)
- **English:** 10-15 questions (if applicable)

## 🧪 Testing

### After Adding Questions

1. **Refresh quiz page**
2. **Check console logs:**
   ```
   [QUIZ] Questions received: X questions
   ```
3. **Quiz should load** - Questions should be displayed
4. **Take quiz** - Should work correctly

## 📝 Notes

### Question Format

- `correct_answer` must be exactly 'A', 'B', 'C', or 'D' (case-sensitive)
- `topic` should match topics in your system
- `difficulty` is optional but recommended
- `subtopic` is optional

### Database Constraints

- Make sure `questions` table exists
- Make sure all required columns exist
- Make sure `correct_answer` is one of: 'A', 'B', 'C', 'D'
- Make sure `topic` matches your topic names

## 🆘 Troubleshooting

### Issue: Questions Still Not Loading

**Check:**
1. Questions are in database (check Table Editor)
2. Questions have correct format
3. Backend endpoint is working (test with curl)
4. Frontend is making request (check Network tab)
5. Response contains questions (check Network tab response)

### Issue: Wrong Question Format

**Check:**
1. `correct_answer` is 'A', 'B', 'C', or 'D'
2. All options (A, B, C, D) are filled
3. `question_text` is not empty
4. `topic` matches your topic names

### Issue: Backend Not Returning Questions

**Check:**
1. Backend is querying correct table
2. Backend SQL query is correct
3. Backend is not filtering out questions
4. Backend is returning all questions

---

## ✅ Quick Fix

1. **Add at least 30 questions to the database**
2. **Verify questions are in database**
3. **Refresh quiz page**
4. **Quiz should load!**

---

**Status:** 🔧 **DATABASE SETUP REQUIRED**
**Next:** Add questions to database and test quiz page

