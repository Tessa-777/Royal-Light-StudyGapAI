# Deploy AI/SE Backend to Render

## Overview

This guide walks you through deploying the new AI/SE integrated backend to Render, similar to how `backend-main` was deployed.

---

## Prerequisites

1. ✅ Backend code is complete and tested
2. ✅ All tests pass locally
3. ✅ You have a Render account
4. ✅ You have a Supabase project set up
5. ✅ You have a Gemini API key

---

## Step 1: Prepare Your Repository

### 1.1 Commit All Changes

```bash
git add .
git commit -m "feat: Complete AI/SE integration with full testing"
git push origin your-branch-name
```

### 1.2 Verify Files Are Ready

Make sure these files exist and are correct:
- ✅ `Procfile` - Defines how to run the app
- ✅ `requirements.txt` - Python dependencies
- ✅ `runtime.txt` - Python version (optional)
- ✅ `.env.example` - Environment variable template
- ✅ `Dockerfile` - If using Docker (optional)

---

## Step 2: Create New Render Service

### 2.1 Go to Render Dashboard

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**

### 2.2 Connect Your Repository

1. **Connect Repository:**
   - Select your Git provider (GitHub, GitLab, etc.)
   - Select the repository
   - Select the branch (your AI/SE integration branch)

2. **Configure Service:**
   - **Name:** `studygapai-backend-ai-se` (or your preferred name)
   - **Region:** Choose closest to your users
   - **Branch:** Your branch name (e.g., `ai-se-integration`)
   - **Root Directory:** Leave empty (or `backend` if your app is in a subdirectory)
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** From `Procfile` (should be: `gunicorn backend.app:app --workers=2 --timeout=120 --bind 0.0.0.0:$PORT`)

---

## Step 3: Configure Environment Variables

In Render Dashboard, go to **Environment** section and add these variables:

### Required Variables

```env
# Flask Configuration
FLASK_ENV=production
FLASK_APP=backend.app:app
FLASK_DEBUG=0
SECRET_KEY=your-super-secret-key-change-this-in-production

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
USE_IN_MEMORY_DB=false

# Google Gemini AI Configuration
GOOGLE_API_KEY=your-gemini-api-key-here
AI_MODEL_NAME=gemini-1.5-flash
AI_MOCK=false

# CORS Configuration (for frontend)
CORS_ORIGINS=https://your-frontend-domain.com,http://localhost:3000
```

### Important Notes:

1. **SECRET_KEY:** Generate a strong random secret key:
   ```python
   import secrets
   print(secrets.token_hex(32))
   ```

2. **SUPABASE_SERVICE_ROLE_KEY:** Use the service role key (not anon key) for backend operations

3. **AI_MOCK:** Set to `false` for production (uses real Gemini API)

4. **CORS_ORIGINS:** Add your frontend domain(s) - separate multiple origins with commas

---

## Step 4: Deploy

### 4.1 Initial Deploy

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Install dependencies
   - Build your app
   - Start the service

### 4.2 Monitor Deployment

Watch the logs for:
- ✅ Build successful
- ✅ Dependencies installed
- ✅ App started successfully
- ✅ Health check passed

### 4.3 Common Issues

**Issue: Build fails**
- Check `requirements.txt` is correct
- Check Python version in `runtime.txt`
- Check build logs for specific errors

**Issue: App crashes on start**
- Check environment variables are set
- Check `Procfile` command is correct
- Check logs for error messages

**Issue: Database connection fails**
- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check Supabase project is active
- Check network connectivity

---

## Step 5: Verify Deployment

### 5.1 Test Health Endpoint

```bash
curl https://your-service-name.onrender.com/health
```

Expected response:
```json
{"status": "healthy"}
```

### 5.2 Test API Endpoint

```bash
curl https://your-service-name.onrender.com/api/questions?total=5
```

### 5.3 Test Diagnostic Endpoint (with auth)

```bash
curl -X POST https://your-service-name.onrender.com/api/ai/analyze-diagnostic \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d @test_data.json
```

---

## Step 6: Update Frontend Developer

### 6.1 Provide API URL

Share the deployed API URL:
```
https://your-service-name.onrender.com/api
```

### 6.2 Update Frontend Spec

Update `FRONTEND_TECHNICAL_SPECIFICATION.md` with:
- Production API URL
- Staging API URL (if different)
- CORS configuration

### 6.3 Share Environment Variables Template

Provide frontend developer with:
```env
VITE_API_BASE_URL=https://your-service-name.onrender.com/api
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Step 7: Set Up Auto-Deploy

### 7.1 Enable Auto-Deploy

In Render Dashboard:
1. Go to **Settings**
2. Enable **"Auto-Deploy"**
3. Select branch to auto-deploy from

### 7.2 Set Up Branch Protection

- Main branch: Manual deploy only
- Feature branches: Auto-deploy to preview

---

## Step 8: Monitoring & Logs

### 8.1 View Logs

In Render Dashboard:
- Go to **Logs** tab
- View real-time logs
- Filter by error level

### 8.2 Set Up Alerts

1. Go to **Alerts**
2. Set up alerts for:
   - Deployment failures
   - High error rates
   - Response time issues

---

## Step 9: Database Migrations

### 9.1 Run Migrations

Make sure your Supabase migrations are applied:

1. Go to Supabase Dashboard
2. Go to SQL Editor
3. Run migrations in order:
   - `0001_ai_se_enhanced_schema.sql`
   - `0002_ai_se_rls_policies.sql`

### 9.2 Verify Tables

Check that all tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';
```

---

## Step 10: Post-Deployment Checklist

- [ ] Health endpoint works
- [ ] API endpoints work
- [ ] Authentication works
- [ ] Database connection works
- [ ] Gemini API integration works
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] Logs are accessible
- [ ] Auto-deploy is enabled
- [ ] Frontend developer has API URL

---

## Troubleshooting

### Issue: Service won't start

**Check:**
1. Environment variables are set
2. `Procfile` command is correct
3. Dependencies are installed
4. Port is bound to `$PORT`

**Solution:**
- Check logs for specific errors
- Verify `Procfile` matches: `gunicorn backend.app:app --workers=2 --timeout=120 --bind 0.0.0.0:$PORT`

### Issue: Database connection fails

**Check:**
1. `SUPABASE_URL` is correct
2. `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Supabase project is active
4. Network allows connections

**Solution:**
- Verify credentials in Supabase Dashboard
- Test connection locally first
- Check Supabase project status

### Issue: Gemini API fails

**Check:**
1. `GOOGLE_API_KEY` is set
2. API key is valid
3. `AI_MOCK=false` (for production)
4. API quota not exceeded

**Solution:**
- Test API key locally
- Check Gemini API usage/dashboard
- Verify model name is correct

### Issue: CORS errors

**Check:**
1. `CORS_ORIGINS` includes frontend domain
2. Frontend is making requests to correct URL
3. CORS middleware is enabled

**Solution:**
- Add frontend domain to `CORS_ORIGINS`
- Verify CORS configuration in `backend/app.py`
- Check browser console for specific CORS errors

---

## Next Steps

1. ✅ Deploy to Render
2. ✅ Verify deployment works
3. ✅ Share API URL with frontend developer
4. ✅ Monitor logs for issues
5. ✅ Set up alerts
6. ✅ Document any deployment-specific notes

---

## Support

If you encounter issues:
1. Check Render logs
2. Check Supabase logs
3. Test locally first
4. Verify environment variables
5. Check this documentation

---

## Summary

You should deploy because:
- ✅ Backend is complete and tested
- ✅ Frontend developer needs a live API
- ✅ Integration testing requires a deployed backend
- ✅ Staging environment is needed

**Deploy now and share the API URL with your frontend developer!** 🚀

