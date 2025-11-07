# Post-Deployment Verification Steps

## ✅ Step 1: Test Health Endpoint

Get your Render URL (e.g., `https://studygapai-backend.onrender.com`) and test:

```bash
curl https://your-app.onrender.com/health
```

Expected response:
```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

## ✅ Step 2: Verify Environment Variables

In Render dashboard → Your Service → Environment, make sure you have:

**Required:**
- ✅ `FLASK_ENV=production`
- ✅ `SECRET_KEY=<your-secret-key>`
- ✅ `SUPABASE_URL=<your-supabase-url>`
- ✅ `SUPABASE_ANON_KEY=<your-anon-key>`
- ✅ `SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>`
- ✅ `USE_IN_MEMORY_DB=false`
- ✅ `GOOGLE_API_KEY=<your-gemini-api-key>`
- ✅ `AI_MODEL_NAME=gemini-2.5-flash` (or your preferred model)
- ✅ `AI_MOCK=false`
- ✅ `CORS_ORIGINS=<your-frontend-url>` (or `*` for testing)

**Optional but recommended:**
- `PYTHON_VERSION=3.11.9` (if you set it)

## ✅ Step 3: Test API Endpoints

### Option A: Quick Browser Test
1. Open: `https://your-app.onrender.com/health`
2. Should see: `{"status":"ok","version":"0.1.0"}`

### Option B: Full Test Suite
Update `test_all_endpoints.py` to use your Render URL:

```python
# In test_all_endpoints.py, change:
BASE_URL = "https://your-app.onrender.com"  # Your Render URL
```

Then run:
```bash
python test_all_endpoints.py
```

## ✅ Step 4: Check Logs

In Render dashboard → Your Service → Logs:
- Look for any errors
- Check if the app started successfully
- Verify database connections

## ✅ Step 5: Test AI Endpoints (Important!)

Since we switched to REST API, test the AI endpoints:

```bash
# Test Explain Answer (public endpoint)
curl -X POST https://your-app.onrender.com/api/ai/explain-answer \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "test-1",
    "studentAnswer": "A",
    "correctAnswer": "B",
    "studentReasoning": "I thought A was correct"
  }'
```

This will verify the REST API integration works!

## 🎯 What We Fixed

1. ✅ **Removed google-genai SDK** - Eliminated dependency conflicts
2. ✅ **Switched to REST API** - Uses `requests` library (no conflicts)
3. ✅ **Maintained error handling** - 429/503 errors still handled properly
4. ✅ **Build succeeds** - No more dependency resolution errors

## 🚀 You're Live!

Your backend is now deployed on Render! Next steps:
- Test all endpoints
- Connect your frontend
- Monitor logs for any issues
- Set up health check monitoring (optional)

## 📝 Notes

- **Free tier spins down** after 15 min inactivity (first request takes ~30s)
- **Auto-deploys** on every push to main branch
- **HTTPS enabled** automatically
- **Logs available** in Render dashboard

Congratulations! 🎉

