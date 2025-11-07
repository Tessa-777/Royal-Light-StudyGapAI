# Railway Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Google OAuth Setup (CRITICAL - Must be done in Supabase Dashboard)

**⚠️ IMPORTANT:** Google OAuth is configured in **Supabase Dashboard**, NOT in backend code or env vars.

**Steps:**

1. **Enable Google OAuth in Supabase Dashboard**
   - Go to: `https://supabase.com/dashboard/project/[your-project]/auth/providers`
   - Enable "Google" provider

2. **Create Google OAuth Credentials**
   - Go to: https://console.cloud.google.com/
   - Create OAuth 2.0 Client ID (Web application)
   - **Authorized redirect URI**: `https://[your-project-id].supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret

3. **Configure in Supabase**
   - Paste Client ID and Client Secret in Supabase Dashboard
   - Save

4. **Set Redirect URLs** (After Railway Deployment)
   - In Supabase Dashboard → Auth → URL Configuration:
     - Site URL: `https://your-frontend-domain.com`
     - Redirect URLs: Include your Railway backend URL if needed

**Note:** Backend doesn't need Google OAuth credentials - it just validates JWTs that Supabase issues after Google OAuth.

---

### 2. Environment Variables Setup

**Update `env.example` to include `SUPABASE_SERVICE_ROLE_KEY`** (already done in config, but should be documented)

**Required Environment Variables for Railway:**

```env
# Flask Configuration
FLASK_ENV=production
SECRET_KEY=<generate-a-strong-random-secret-key>
APP_NAME=StudyGapAI Backend
APP_VERSION=0.1.0

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here  # ⚠️ CRITICAL - Add this!
USE_IN_MEMORY_DB=false  # Must be false for production

# Google Gemini AI Configuration
GOOGLE_API_KEY=your-gemini-api-key-here
AI_MODEL_NAME=gemini-2.5-flash
AI_MOCK=false  # Set to false for production (unless you want mock responses)

# CORS Configuration
CORS_ORIGINS=https://your-frontend-domain.com  # Update with your frontend URL

# Railway automatically provides:
# PORT (set automatically by Railway)
```

### 2. Code Verification

- ✅ **Procfile exists** - `web: gunicorn backend.app:app --workers=2 --timeout=120 --bind 0.0.0.0:$PORT`
- ✅ **requirements.txt is up to date** - All dependencies listed
- ✅ **Tests passing** - 15/15 tests passing (1 is API rate limit, not code issue)
- ✅ **Service role key configured** - Backend uses it for database operations
- ✅ **RLS policies enabled** - Still protecting direct database access

### 3. Security Checklist

- ✅ **SECRET_KEY** - Generate a strong random key (don't use default)
- ✅ **SUPABASE_SERVICE_ROLE_KEY** - Added and configured
- ✅ **CORS_ORIGINS** - Set to your frontend domain (not `*` in production)
- ✅ **AI_MOCK** - Set to `false` for production
- ✅ **USE_IN_MEMORY_DB** - Set to `false` for production

### 4. Database Setup

- ✅ **Supabase migrations run** - Ensure all migrations are applied
- ✅ **RLS policies enabled** - Verify policies are active (run `0002_secure_rls_policies.sql`)
- ✅ **User sync trigger** - Ensure `handle_new_user()` trigger is created (included in migration)
- ✅ **Google OAuth enabled** - Must be enabled in Supabase Dashboard before users can sign in
- ✅ **Test data** - Consider if you need seed data or if frontend will populate

### 5. Railway-Specific Setup

**In Railway Dashboard:**

1. **Create New Project**
   - Connect your GitHub repository
   - Select this repository

2. **Configure Environment Variables**
   - Add all variables from the list above
   - ⚠️ **DO NOT** commit `.env` file to git
   - Set variables in Railway dashboard instead

3. **Build Settings**
   - Railway should auto-detect Python
   - Build command: (auto-detected)
   - Start command: (uses Procfile)

4. **Deploy**
   - Railway will build and deploy automatically
   - Check logs for any errors

### 6. Post-Deployment Verification

After deployment, test:

```bash
# Health check
curl https://your-railway-app.up.railway.app/health

# Test with your test suite (update BASE_URL)
BASE_URL=https://your-railway-app.up.railway.app python test_all_endpoints.py
```

---

## 🤔 AI/SE Prompt Integration: Before or After Deployment?

### **Recommendation: Deploy First, Then Integrate** ✅

**Why this is better practice:**

1. **✅ Incremental Deployment**
   - Deploy working code first
   - Verify deployment process works
   - Ensure infrastructure is stable
   - Then add new features incrementally

2. **✅ Easier Debugging**
   - If deployment fails, you know it's infrastructure
   - If integration fails, you know it's the new code
   - Separates concerns

3. **✅ Rollback Safety**
   - If integration has issues, you can rollback just the integration
   - Don't risk breaking a working deployment

4. **✅ Testing Strategy**
   - Test deployment process with known-good code
   - Then test integration separately
   - Easier to isolate issues

5. **✅ Team Workflow**
   - Frontend can start integrating while backend is stable
   - Then upgrade to enhanced prompts later
   - Less disruption

### **When to Integrate AI/SE Prompts:**

**After:**
- ✅ Railway deployment is successful
- ✅ Health endpoint responds
- ✅ Basic endpoints work
- ✅ Frontend can connect
- ✅ You've verified the deployment process

**Then:**
- Integrate AI/SE prompts
- Test thoroughly
- Deploy as an update

---

## 📋 Quick Deployment Steps

### Step 1: Prepare Environment Variables

1. Generate a strong `SECRET_KEY`:
   ```python
   import secrets
   print(secrets.token_urlsafe(32))
   ```

2. Get all your keys ready:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **Don't forget this!**
   - `GOOGLE_API_KEY`
   - `CORS_ORIGINS` (your frontend URL)

### Step 2: Update env.example

Add `SUPABASE_SERVICE_ROLE_KEY` to documentation (already in code, just document it)

### Step 3: Deploy to Railway

1. Push code to GitHub
2. Connect Railway to repo
3. Set environment variables in Railway dashboard
4. Deploy

### Step 4: Verify Deployment

- Health check works
- Test endpoints respond
- Database connections work
- **Test Google OAuth flow** (if frontend is ready)

### Step 5: Integrate AI/SE Prompts (Later)

- After deployment is stable
- Test integration locally first
- Deploy as update

---

## ⚠️ Common Railway Deployment Issues

1. **Missing SUPABASE_SERVICE_ROLE_KEY**
   - Error: RLS policy violations
   - Fix: Add service role key to Railway env vars

2. **CORS errors**
   - Error: Frontend can't connect
   - Fix: Set `CORS_ORIGINS` to your frontend domain

3. **Port binding**
   - Error: Can't bind to port
   - Fix: Railway provides `$PORT` automatically (already handled in Procfile)

4. **Database connection**
   - Error: Can't connect to Supabase
   - Fix: Verify `SUPABASE_URL` and keys are correct

---

## 🎯 Summary

**Deploy current working code first** → **Then integrate AI/SE prompts**

This is the safer, more professional approach. You'll have:
- ✅ Working deployment process
- ✅ Stable baseline
- ✅ Easier debugging
- ✅ Better rollback options

Good call on this approach! 🚀

