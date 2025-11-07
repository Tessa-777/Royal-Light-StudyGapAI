# Render.com Deployment Checklist

## ✅ Pre-Deployment Checklist

- [ ] GitHub repository is public or connected to Render
- [ ] All environment variables ready (see below)
- [ ] Supabase project is set up and active
- [ ] Google Gemini API key is ready

## 📋 Required Files (Already Created)

- ✅ `Procfile` - Start command for Render
- ✅ `requirements.txt` - Python dependencies
- ✅ `runtime.txt` - Python version specification

## 🔑 Environment Variables to Set in Render

Copy these to Render dashboard → Your Service → Environment:

```env
FLASK_ENV=production
SECRET_KEY=<generate-using-python-secrets-token_urlsafe-32>
APP_NAME=StudyGapAI Backend
APP_VERSION=0.1.0

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
USE_IN_MEMORY_DB=false

GOOGLE_API_KEY=your-gemini-api-key-here
AI_MODEL_NAME=gemini-2.5-flash
AI_MOCK=false

CORS_ORIGINS=https://your-frontend-domain.com
```

**Note**: `PORT` is automatically set by Render - don't add it manually.

## 🚀 Deployment Steps

1. **Go to Render.com** → Sign up/Login
2. **New +** → **Web Service**
3. **Connect GitHub** → Select your repository
4. **Configure**:
   - Name: `studygapai-backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn backend.app:app --bind 0.0.0.0:$PORT`
5. **Add Environment Variables** (see above)
6. **Create Web Service**
7. **Wait for build** (3-5 minutes)
8. **Test**: `curl https://your-app.onrender.com/health`

## ✅ Post-Deployment Verification

```bash
# Health check
curl https://your-app.onrender.com/health

# Should return:
# {"status":"ok","version":"0.1.0"}
```

## 📚 Full Documentation

See `dev_documentation/RENDER_DEPLOYMENT.md` for complete guide.

