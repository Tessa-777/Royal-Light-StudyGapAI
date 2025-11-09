# 🚀 Render Deployment Guide - StudyGapAI Backend

## Prerequisites

- ✅ All tests pass locally
- ✅ Render account (free tier available)
- ✅ GitHub repository connected to Render
- ✅ Supabase project set up
- ✅ Gemini API key ready
- ✅ Python 3.11.9 specified in `runtime.txt`

---

## Step 1: Clean Up Repository (✅ DONE)

### 1.1 Verify Files Are Ready

✅ **Required Files:**
- `Procfile` - Defines how to run the app
- `requirements.txt` - Python dependencies
- `runtime.txt` - Python version (3.11.9)
- `env.example` - Environment variable template
- `.gitignore` - Excludes sensitive files

### 1.2 Commit All Changes

```bash
git add .
git commit -m "feat: Complete backend with target_score support and guest diagnostic save"
git push origin main
```

---

## Step 2: Delete Old Render Service (If Exists)

### 2.1 Go to Render Dashboard

1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click on your **existing backend service** (if you have one)

### 2.2 Delete Old Service

1. Go to **Settings** tab
2. Scroll down to **"Delete Service"** section
3. Click **"Delete"** and confirm
4. **⚠️ Note:** This will permanently delete the service and all its data
5. Wait for deletion to complete

### 2.3 Verify Deletion

- Old service should no longer appear in your dashboard
- You're now ready to create a new service

---

## Step 3: Create New Render Web Service

### 3.1 Create New Service

1. In Render Dashboard, click **"New +"** → **"Web Service"**
2. Connect your GitHub repository:
   - Select your Git provider (GitHub, GitLab, etc.)
   - Select the repository: `Royal-Light-StudyGapAI` (or your repo name)
   - Select the branch: `main` (or your default branch)

### 3.2 Configure Service Settings

**Basic Settings:**
- **Name:** `studygapai-backend` (or your preferred name)
- **Region:** Choose closest to your users (e.g., `Oregon (US West)` or `Singapore (Asia Pacific)`)
- **Branch:** `main`
- **Root Directory:** Leave **empty** (root of repo)
- **Runtime:** `Python 3`

**Build & Start:**
- **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt`
- **Start Command:** `gunicorn backend.app:app --workers=2 --timeout=120 --bind 0.0.0.0:$PORT`

**⚠️ Important:** 
- Render automatically sets the `$PORT` environment variable
- Don't set `PORT` manually in environment variables
- The `Procfile` will be used automatically, but you can also set it in the dashboard

---

## Step 4: Set Python Version

### 4.1 Method 1: Using runtime.txt (Recommended)

The `runtime.txt` file already specifies `python-3.11.9`. Render will automatically detect this.

### 4.2 Method 2: Set in Render Dashboard (Alternative)

1. Go to **Settings** → **Environment**
2. Add environment variable:
   - **Key:** `PYTHON_VERSION`
   - **Value:** `3.11.9`
3. Click **"Save Changes"**

**✅ Verify:** Check build logs to confirm Python 3.11.9 is being used

---

## Step 5: Configure Environment Variables

### 5.1 Go to Environment Section

In Render Dashboard, go to **Environment** tab and add these variables:

### 5.2 Required Environment Variables

```env
# Flask Configuration
FLASK_ENV=production
FLASK_APP=backend.app:app
FLASK_DEBUG=0
SECRET_KEY=<generate-strong-random-key>
APP_NAME=StudyGapAI Backend
APP_VERSION=0.1.0

# Python Version (optional - runtime.txt handles this)
PYTHON_VERSION=3.11.9

# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
USE_IN_MEMORY_DB=false

# Google Gemini AI Configuration
GOOGLE_API_KEY=your-gemini-api-key-here
AI_MODEL_NAME=gemini-2.0-flash
AI_MOCK=false

# CORS Configuration (for frontend)
CORS_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:5173

# Testing (optional)
TESTING=false
```

### 5.3 Generate SECRET_KEY

Run this command to generate a secure secret key:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and use it as your `SECRET_KEY` value.

### 5.4 Important Notes

1. **SECRET_KEY:** Must be a strong random string (use the generator above)
2. **SUPABASE_SERVICE_ROLE_KEY:** Use the **service role key** (not anon key) for backend operations
3. **AI_MOCK:** Set to `false` for production (uses real Gemini API)
4. **CORS_ORIGINS:** Add your frontend domain(s) - separate multiple origins with commas
   - Example: `https://studygapai.vercel.app,http://localhost:5173`
5. **USE_IN_MEMORY_DB:** Must be `false` for production
6. **PORT:** Don't set this manually - Render provides it automatically

---

## Step 6: Deploy

### 6.1 Create Web Service

1. Click **"Create Web Service"** button
2. Render will:
   - Clone your repository
   - Install Python 3.11.9
   - Install dependencies from `requirements.txt`
   - Build your app
   - Start the service with gunicorn

### 6.2 Monitor Deployment

Watch the **Logs** tab for:
- ✅ Build successful
- ✅ Python 3.11.9 detected
- ✅ Dependencies installed
- ✅ App started successfully
- ✅ Health check passed

### 6.3 Expected Build Logs

```
==> Building...
==> Python 3.11.9 detected
==> Installing dependencies...
==> Starting service...
==> Service started successfully on port $PORT
```

---

## Step 7: Verify Deployment

### 7.1 Test Health Endpoint

```bash
curl https://your-service-name.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "version": "0.1.0"
}
```

### 7.2 Test Questions Endpoint

```bash
curl https://your-service-name.onrender.com/api/quiz/questions?total=5
```

**Expected Response:**
```json
[
  {
    "id": "...",
    "question_text": "...",
    "option_a": "...",
    ...
  }
]
```

### 7.3 Test User Registration (with target_score)

```bash
curl -X POST https://your-service-name.onrender.com/api/users/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "targetScore": 300
  }'
```

**Expected Response:**
```json
{
  "id": "...",
  "email": "test@example.com",
  "name": "Test User",
  "target_score": 300,
  ...
}
```

---

## Step 8: Configure Auto-Deploy

### 8.1 Enable Auto-Deploy

1. Go to **Settings** → **Auto-Deploy**
2. Enable **"Auto-Deploy"**
3. Select branch: `main` (or your default branch)
4. Click **"Save Changes"**

### 8.2 Auto-Deploy Behavior

- ✅ Deploys automatically on every push to `main`
- ✅ Builds and restarts service automatically
- ✅ Shows deployment status in dashboard

---

## Step 9: Update Frontend Configuration

### 9.1 Share API URL

Provide your frontend developer with:
```
https://your-service-name.onrender.com/api
```

### 9.2 Update Frontend Environment Variables

Update frontend `.env` or environment variables:
```env
VITE_API_BASE_URL=https://your-service-name.onrender.com/api
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Step 10: Monitor & Maintain

### 10.1 View Logs

In Render Dashboard:
- Go to **Logs** tab
- View real-time logs
- Filter by error level
- Download logs if needed

### 10.2 Set Up Alerts (Optional)

1. Go to **Alerts** (if available on your plan)
2. Set up alerts for:
   - Deployment failures
   - High error rates
   - Response time issues

### 10.3 Monitor Performance

- Check **Metrics** tab for:
  - CPU usage
  - Memory usage
  - Request count
  - Response times

---

## Troubleshooting

### Issue 1: Build Fails

**Symptoms:**
- Build logs show errors
- Service won't start

**Solutions:**
1. Check `requirements.txt` is correct
2. Verify Python version in `runtime.txt` (3.11.9)
3. Check build logs for specific errors
4. Ensure all dependencies are listed in `requirements.txt`

### Issue 2: Service Won't Start

**Symptoms:**
- Build succeeds but service crashes
- Health check fails

**Solutions:**
1. Check environment variables are set correctly
2. Verify `Procfile` command is correct
3. Check logs for specific error messages
4. Ensure `PORT` is bound to `$PORT` (don't set it manually)

### Issue 3: Database Connection Fails

**Symptoms:**
- Errors in logs about Supabase connection
- API endpoints return 500 errors

**Solutions:**
1. Verify `SUPABASE_URL` is correct
2. Verify `SUPABASE_SERVICE_ROLE_KEY` is correct (not anon key)
3. Check Supabase project is active
4. Verify `USE_IN_MEMORY_DB=false`
5. Test connection locally first

### Issue 4: Python Version Wrong

**Symptoms:**
- Build uses wrong Python version
- Compatibility errors

**Solutions:**
1. Verify `runtime.txt` contains `python-3.11.9`
2. Add `PYTHON_VERSION=3.11.9` environment variable
3. Check build logs to confirm Python version

### Issue 5: CORS Errors

**Symptoms:**
- Frontend can't make requests
- CORS errors in browser console

**Solutions:**
1. Add frontend domain to `CORS_ORIGINS`
2. Verify CORS configuration in `backend/app.py`
3. Check browser console for specific CORS errors
4. Ensure frontend is making requests to correct URL

### Issue 6: Target Score Not Saving

**Symptoms:**
- Registration succeeds but `target_score` is null
- Profile doesn't show `target_score`

**Solutions:**
1. Verify frontend sends `targetScore` in registration request
2. Check backend logs for registration
3. Verify `target_score` is in database (check Supabase)
4. Check backend code handles `targetScore` correctly

---

## Post-Deployment Checklist

- [ ] Health endpoint works (`/health`)
- [ ] Questions endpoint works (`/api/quiz/questions`)
- [ ] User registration works with `targetScore`
- [ ] User profile returns `target_score`
- [ ] Authentication works (JWT tokens)
- [ ] Database connection works (Supabase)
- [ ] Gemini API integration works
- [ ] CORS is configured correctly
- [ ] Environment variables are set
- [ ] Logs are accessible
- [ ] Auto-deploy is enabled
- [ ] Frontend developer has API URL
- [ ] Python version is 3.11.9

---

## Quick Reference

### Service URL
```
https://your-service-name.onrender.com
```

### API Base URL
```
https://your-service-name.onrender.com/api
```

### Health Check
```
https://your-service-name.onrender.com/health
```

### Key Endpoints
- `GET /health` - Health check
- `GET /api/quiz/questions?total=30` - Get questions
- `POST /api/users/register` - Register user (with targetScore)
- `GET /api/users/me` - Get user profile (includes target_score)
- `POST /api/ai/analyze-diagnostic` - Analyze diagnostic
- `POST /api/ai/save-diagnostic` - Save guest diagnostic

---

## Support

If you encounter issues:
1. Check Render logs in dashboard
2. Check Supabase logs
3. Test locally first
4. Verify environment variables
5. Check this documentation
6. Review `dev_documentation/` for detailed guides

---

## Next Steps

1. ✅ Deploy to Render
2. ✅ Verify all endpoints work
3. ✅ Test with frontend
4. ✅ Monitor logs for issues
5. ✅ Set up alerts (optional)
6. ✅ Share API URL with frontend developer

---

## Summary

Your backend is now deployed to Render! 🎉

**Service URL:** `https://your-service-name.onrender.com`
**API Base URL:** `https://your-service-name.onrender.com/api`

**Key Features:**
- ✅ Python 3.11.9
- ✅ Target score support
- ✅ Guest diagnostic save
- ✅ Full AI integration
- ✅ Database connectivity
- ✅ CORS configured
- ✅ Auto-deploy enabled

**Share the API URL with your frontend developer!** 🚀

