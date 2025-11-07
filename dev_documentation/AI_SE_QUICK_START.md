# AI/SE Integration Quick Start Guide

## Quick Setup (5 minutes)

### Step 1: Create Supabase Project
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create new project
3. Copy your credentials:
   - Project URL
   - anon key
   - service_role key

### Step 2: Run Migrations
1. Open Supabase SQL Editor
2. Run `supabase/migrations/0001_ai_se_enhanced_schema.sql`
3. Run `supabase/migrations/0002_ai_se_rls_policies.sql`

### Step 3: Configure Environment
1. Copy `env.example` to `.env`
2. Update with your Supabase credentials
3. Add Gemini API key (get from [Google AI Studio](https://makersuite.google.com/app/apikey))
4. Set `AI_MOCK=true` for testing

### Step 4: Install & Run
```bash
pip install -r requirements.txt
python -m flask run
```

### Step 5: Test
```bash
# Test with mock mode
curl -X POST http://localhost:5000/api/ai/analyze-diagnostic \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "subject": "Mathematics",
    "total_questions": 3,
    "time_taken": 8.5,
    "questions_list": [
      {
        "id": 1,
        "topic": "Algebra",
        "student_answer": "A",
        "correct_answer": "B",
        "is_correct": false,
        "explanation": "I thought x squared meant multiply by 2"
      }
    ]
  }'
```

## What You Get

✅ Comprehensive diagnostic analysis  
✅ Topic breakdown with Fluency Index  
✅ Root cause analysis  
✅ JAMB score projection  
✅ 6-week personalized study plan  
✅ Priority-based recommendations  

## Next Steps

- Read `AI_SE_SETUP_GUIDE.md` for detailed setup
- Read `AI_SE_TESTING_GUIDE.md` for testing
- Review `AI_SE_IMPLEMENTATION_SUMMARY.md` for architecture

## Troubleshooting

**Database connection fails?**
- Check `SUPABASE_URL` and keys are correct

**API errors?**
- Set `AI_MOCK=true` for testing
- Check `GEMINI_API_KEY` is valid

**Tests failing?**
- Ensure `AI_MOCK=true` for unit tests
- Check all dependencies installed

