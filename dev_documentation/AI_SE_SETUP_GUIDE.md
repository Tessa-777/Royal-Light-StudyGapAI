# AI/SE Integration Setup Guide

## Overview
This guide provides step-by-step instructions for setting up the AI/SE enhanced diagnostic analysis system in a new Supabase project and branch.

## Prerequisites

- Python 3.9+
- Supabase account
- Gemini API key from Google AI Studio
- Git (for branch management)

## Step 1: Create New Supabase Project

### 1.1 Create Project
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Fill in project details:
   - **Name**: `studygapai-ai-se` (or your preferred name)
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for development

### 1.2 Get Project Credentials
1. Go to Project Settings → API
2. Copy the following:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJ...` (anon key)
   - **service_role key**: `eyJ...` (service_role key - keep this secret!)

## Step 2: Run Database Migrations

### 2.1 Connect to Supabase Database
You can use either:
- **Supabase SQL Editor** (recommended for first-time setup)
- **psql** command line
- **Supabase CLI**

### 2.2 Run Migration Scripts

1. **Open Supabase SQL Editor**:
   - Go to SQL Editor in your Supabase project
   - Click "New Query"

2. **Run Schema Migration**:
   - Open `supabase/migrations/0001_ai_se_enhanced_schema.sql`
   - Copy the entire contents
   - Paste into SQL Editor
   - Click "Run" (or press Ctrl+Enter)
   - Verify no errors

3. **Run RLS Policies Migration**:
   - Open `supabase/migrations/0002_ai_se_rls_policies.sql`
   - Copy the entire contents
   - Paste into SQL Editor
   - Click "Run"
   - Verify no errors

### 2.3 Verify Tables Created
Run this query to verify all tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- `users`
- `topics`
- `questions`
- `diagnostic_quizzes`
- `quiz_responses`
- `ai_diagnostics`
- `study_plans`
- `progress_tracking`
- `resources`

## Step 3: Configure Environment Variables

### 3.1 Create `.env` File
Copy `env.example` to `.env`:

```bash
cp env.example .env
```

### 3.2 Update `.env` File
Edit `.env` with your actual values:

```env
# Flask Configuration
FLASK_ENV=production
FLASK_APP=backend.app:app
FLASK_DEBUG=0
SECRET_KEY=your-super-secret-key-change-this-in-production
APP_NAME=StudyGapAI Backend
APP_VERSION=0.1.0

# Supabase Configuration (NEW PROJECT)
SUPABASE_URL=https://your-new-project-id.supabase.co
SUPABASE_ANON_KEY=your-new-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-new-service-role-key-here
USE_IN_MEMORY_DB=false

# Google Gemini AI Configuration
GEMINI_API_KEY=your-gemini-api-key-here
AI_MODEL_NAME=gemini-2.0-flash
AI_MOCK=false

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,https://your-frontend-domain.com

# Testing
TESTING=false
```

### 3.3 Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key
5. Paste into `.env` as `GEMINI_API_KEY`

**Important**: 
- Keep your API key secret!
- Never commit `.env` to git
- Add `.env` to `.gitignore`

## Step 4: Install Dependencies

### 4.1 Create Virtual Environment (Recommended)
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 4.2 Install Python Packages
```bash
pip install -r requirements.txt
```

### 4.3 Verify Installation
```bash
python -c "import flask; import supabase; print('Dependencies installed successfully')"
```

## Step 5: Seed Sample Data (Optional)

### 5.1 Create Sample Topics
Run this SQL in Supabase SQL Editor:

```sql
-- Insert sample topics
INSERT INTO topics (name, subject, description, jamb_weight) VALUES
('Algebra', 'Mathematics', 'Linear equations, quadratics, polynomials', 0.25),
('Geometry', 'Mathematics', 'Shapes, angles, areas, volumes', 0.20),
('Trigonometry', 'Mathematics', 'Angles, identities, triangles', 0.15),
('Calculus', 'Mathematics', 'Derivatives, integrals, limits', 0.20),
('Statistics', 'Mathematics', 'Data analysis, probability', 0.20);
```

### 5.2 Create Sample Questions (Optional)
You can create sample questions via the API or directly in the database. For testing, the mock mode will work without questions.

## Step 6: Test the Integration

### 6.1 Run Tests
```bash
pytest tests/test_ai_se_integration.py -v
```

### 6.2 Test with Mock Mode
1. Set `AI_MOCK=true` in `.env`
2. Start the Flask server:
   ```bash
   python -m flask run
   ```
3. Test the endpoint with sample data (see Testing section below)

### 6.3 Test with Real API (Optional)
1. Set `AI_MOCK=false` in `.env`
2. Ensure `GEMINI_API_KEY` is set
3. Test the endpoint

## Step 7: Verify Setup

### 7.1 Check Database Connection

**Option 1: Use the test script (Recommended)**
```bash
python test_db_connection.py
```

This script automatically loads your `.env` file and provides helpful error messages.

**Option 2: Simple test script (no dependencies)**
```bash
python test_db_simple.py
```

**Option 3: Manual Python command (requires python-dotenv installed)**
```bash
python -c "from dotenv import load_dotenv; import os; load_dotenv(); from backend.repositories.supabase_repository import SupabaseRepository; repo = SupabaseRepository(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_ROLE_KEY')); print('✅ Database connection successful!')"
```

**Important**: The `.env` file must be loaded! The test scripts do this automatically. If using `python -c` directly, you need to either install `python-dotenv` (`pip install python-dotenv`) or load the `.env` file manually.

### 7.2 Test API Endpoint
Use the test script or Postman to test the `/api/ai/analyze-diagnostic` endpoint.

## Troubleshooting

### Database Connection Issues
- **Error**: "Connection refused"
  - **Solution**: Check `SUPABASE_URL` is correct
  - Verify you're using the correct project URL

- **Error**: "Invalid API key"
  - **Solution**: Check `SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`
  - Ensure you copied the keys correctly (no extra spaces)

### Migration Issues
- **Error**: "relation already exists"
  - **Solution**: Tables may already exist. Check if you need to drop existing tables first
  - Or modify migration to use `CREATE TABLE IF NOT EXISTS`

- **Error**: "permission denied"
  - **Solution**: Ensure you're using the service_role key for migrations
  - Or run migrations as database superuser

### Gemini API Issues
- **Error**: "API key invalid"
  - **Solution**: Verify `GEMINI_API_KEY` is correct
  - Check API key has proper permissions
  - Ensure billing is enabled (free tier is fine)

- **Error**: "Rate limit exceeded"
  - **Solution**: Wait a few minutes and try again
  - Consider implementing request throttling

### RLS Policy Issues
- **Error**: "new row violates row-level security policy"
  - **Solution**: Check RLS policies are correctly set up
  - Verify user authentication is working
  - Check that policies allow the operation you're trying to perform

## Next Steps

1. **Test the API**: Use the provided test scripts or Postman
2. **Review Documentation**: Read `AI_SE_INTEGRATION_PLAN.md` for architecture details
3. **Frontend Integration**: Update frontend to use new API format
4. **Monitoring**: Set up logging and monitoring for production

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review error logs in Supabase dashboard
3. Check Flask application logs
4. Verify all environment variables are set correctly

## Important Notes

- **Never commit `.env` file**: Contains sensitive credentials
- **Use service_role key carefully**: Bypasses RLS, only use for backend operations
- **Test in mock mode first**: Verify integration before using real API
- **Monitor API usage**: Gemini API has rate limits and costs
- **Backup database**: Before making changes, backup your database

