# Railway Backend Setup for StudyGapAI

Guide for configuring your Railway backend to work with your Vercel frontend.

## 🚂 Railway Backend Configuration

### Step 1: Get Your Railway Backend URL

1. Go to [Railway Dashboard](https://railway.app)
2. Click on your backend service
3. Go to **"Settings"** tab
4. Scroll to **"Networking"** section
5. Find your **"Public Domain"** - this is your backend URL

**Example Railway URL:**
```
https://studygapai-backend.railway.app
```

### Step 2: Configure CORS in Railway Backend

Your Railway backend needs to allow requests from your Vercel frontend.

#### Option A: Using Environment Variables (Recommended)

1. Go to Railway Dashboard → Your Service → **"Variables"** tab
2. Add or update `ALLOWED_ORIGINS` environment variable:
   ```
   https://royal-light-study-gap-ai.vercel.app,https://*.vercel.app
   ```
3. This allows:
   - Your production Vercel deployment
   - All Vercel preview deployments

#### Option B: Using Backend Code

If your backend uses Flask-CORS, update your backend code:

```python
from flask_cors import CORS
import os

# Get allowed origins from environment variable
allowed_origins = os.getenv('ALLOWED_ORIGINS', '').split(',')

CORS(app, 
     origins=allowed_origins,
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization'])
```

### Step 3: Set Environment Variables in Railway

In Railway Dashboard → Your Service → **"Variables"** tab, ensure you have:

| Variable | Value | Description |
|----------|-------|-------------|
| `ALLOWED_ORIGINS` | `https://royal-light-study-gap-ai.vercel.app,https://*.vercel.app` | CORS allowed origins |
| `DATABASE_URL` | `postgresql://...` | Database connection string |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase project URL |
| `SUPABASE_KEY` | `eyJ...` | Supabase service role key |
| `GEMINI_API_KEY` | `your-key` | Google Gemini API key |
| `FLASK_ENV` | `production` | Flask environment |
| `SECRET_KEY` | `your-secret-key` | Flask secret key |

### Step 4: Restart Railway Service

After updating environment variables:

1. Go to Railway Dashboard
2. Click on your service
3. Click **"Settings"** → **"Deployments"**
4. Click **"Redeploy"** or wait for automatic redeployment

### Step 5: Verify Railway Backend is Accessible

Test your Railway backend:

```bash
# Test health endpoint (if available)
curl https://your-service-name.railway.app/health

# Test API endpoint
curl https://your-service-name.railway.app/api/topics

# Test with CORS headers
curl -H "Origin: https://royal-light-study-gap-ai.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://your-service-name.railway.app/api/topics
```

You should see CORS headers in the response:
```
Access-Control-Allow-Origin: https://royal-light-study-gap-ai.vercel.app
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## 🔗 Frontend Configuration (Vercel)

### Set Backend URL in Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click on your project
3. Go to **"Settings"** → **"Environment Variables"**
4. Add/Update `VITE_API_BASE_URL`:
   ```
   https://your-service-name.railway.app/api
   ```
5. Set for all environments: Production, Preview, Development
6. **Redeploy** your Vercel project

## 🎯 Complete Setup Checklist

### Railway Backend
- [ ] Backend deployed on Railway
- [ ] Railway public domain obtained
- [ ] `ALLOWED_ORIGINS` environment variable set in Railway
- [ ] CORS configured in backend code
- [ ] Backend restarted/redeployed
- [ ] Backend accessible via public URL
- [ ] CORS headers present in API responses

### Vercel Frontend
- [ ] `VITE_API_BASE_URL` set in Vercel (Railway URL + `/api`)
- [ ] Environment variables set for all environments
- [ ] Vercel project redeployed
- [ ] Frontend app loads correctly
- [ ] API requests go to Railway backend (not localhost)
- [ ] No CORS errors in browser console

## 🐛 Troubleshooting Railway Backend

### Backend Not Accessible

**Problem**: Cannot access Railway backend URL

**Solutions**:
1. Check Railway service is running
2. Verify public domain is set in Railway settings
3. Check Railway deployment logs for errors
4. Verify service is not paused (free tier limitation)

### CORS Errors

**Problem**: CORS errors when frontend tries to access backend

**Solutions**:
1. Verify `ALLOWED_ORIGINS` is set in Railway environment variables
2. Check backend CORS configuration
3. Verify Vercel URL is included in `ALLOWED_ORIGINS`
4. Restart Railway service after updating CORS
5. Check backend logs for CORS-related errors

### Environment Variables Not Working

**Problem**: Backend not using environment variables

**Solutions**:
1. Check Railway Variables tab - variables are set
2. Verify variable names are correct (case-sensitive)
3. Restart Railway service after adding variables
4. Check backend logs to verify variables are loaded

### Backend URL Format

**Problem**: Wrong backend URL format

**Solutions**:
1. Railway URL format: `https://service-name.railway.app`
2. If using custom domain: `https://your-domain.com`
3. Include `/api` if backend serves API under `/api`
4. Use `https://` (not `http://`)

## 📝 Railway-Specific Notes

### Free Tier Limitations

- **Sleep Mode**: Railway free tier services sleep after inactivity
- **Cold Start**: First request after sleep may take 10-30 seconds
- **Resource Limits**: Limited CPU and memory
- **Custom Domain**: Available on paid plans

### Railway Environment Variables

- Set in Railway Dashboard → Service → Variables tab
- Variables are available as environment variables in your backend
- Changes require service restart (automatic on Railway)
- Variables are encrypted and secure

### Railway Deployment

- Railway automatically deploys on git push (if connected)
- Manual deployments available in Railway dashboard
- Deployment logs available in Railway dashboard
- Rollback available for previous deployments

## 🔄 Complete Workflow

### 1. Deploy Backend to Railway
- Push backend code to GitHub
- Connect Railway to GitHub repository
- Railway automatically deploys
- Note your Railway public domain

### 2. Configure Backend CORS
- Set `ALLOWED_ORIGINS` in Railway environment variables
- Include your Vercel frontend URL
- Restart Railway service

### 3. Deploy Frontend to Vercel
- Push frontend code to GitHub
- Connect Vercel to GitHub repository
- Set `VITE_API_BASE_URL` in Vercel environment variables
- Use your Railway backend URL + `/api`
- Redeploy Vercel project

### 4. Test Integration
- Open Vercel frontend URL
- Test API calls
- Verify requests go to Railway backend
- Check for CORS errors
- Test all features

## 📚 Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Railway Networking](https://docs.railway.app/networking/domains)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 🆘 Need Help?

If you encounter issues:

1. Check Railway deployment logs
2. Check Railway service status
3. Verify environment variables are set
4. Test backend API directly with curl
5. Check CORS configuration
6. Verify Vercel environment variables
7. Check browser console for errors

---

**Remember**: 
- Railway backend URL: `https://your-service-name.railway.app`
- Vercel frontend URL: `https://royal-light-study-gap-ai.vercel.app`
- CORS must allow Vercel URL in Railway backend
- Frontend must use Railway URL in Vercel environment variables

