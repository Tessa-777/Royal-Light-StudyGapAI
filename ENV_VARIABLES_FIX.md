# 🔧 Fix: Environment Variables Not Working in Vercel

## Problem

Your app is trying to connect to `localhost:5000` instead of your production backend, and you're seeing:
- `Backend URL: undefined`
- `Cannot connect to backend` errors
- Requests going to `http://localhost:5000/api`

## Root Cause

The `VITE_API_BASE_URL` environment variable is **not set in Vercel** or **not set for the correct environment**.

## Solution: Set Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard

1. Visit [vercel.com](https://vercel.com)
2. Sign in
3. Click on your project: **Royal-Light-StudyGapAI**

### Step 2: Add Environment Variables

1. Click **"Settings"** tab
2. Click **"Environment Variables"** in sidebar
3. Click **"Add New"**

### Step 3: Add Required Variables

Add these **3 variables** (one at a time):

#### 1. Backend API URL
- **Key**: `VITE_API_BASE_URL`
- **Value**: 
  - **Railway**: `https://your-service-name.railway.app/api`
  - **Render**: `https://your-backend.onrender.com/api`
  - Replace with your actual backend URL
- **Environments**: ✅ Production ✅ Preview ✅ Development

**To get your Railway URL:**
1. Go to Railway Dashboard → Your Service
2. Go to Settings → Networking
3. Find your Public Domain
4. Use that URL + `/api`

#### 2. Supabase URL
- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://xxx.supabase.co` (your Supabase URL)
- **Environments**: ✅ Production ✅ Preview ✅ Development

#### 3. Supabase Key
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJ...` (your Supabase anon key)
- **Environments**: ✅ Production ✅ Preview ✅ Development

### Step 4: Update Backend CORS (Railway)

Your Railway backend needs to allow requests from Vercel:

1. Go to [Railway Dashboard](https://railway.app)
2. Click on your backend service
3. Go to **"Variables"** tab
4. Add/Update `ALLOWED_ORIGINS`:
   ```
   https://royal-light-study-gap-ai.vercel.app,https://*.vercel.app
   ```
5. Railway will automatically redeploy

### Step 5: Redeploy Vercel

**IMPORTANT**: After adding variables, you MUST redeploy:

1. Go to **"Deployments"** tab in Vercel
2. Click **three dots (⋯)** on latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete

### Step 5: Verify

1. Open your app: `https://royal-light-study-gap-ai.vercel.app`
2. Open browser DevTools (F12)
3. Go to Console tab
4. Check for API requests - they should go to your backend (not localhost)

## Common Mistakes

### ❌ Not Setting for All Environments
Only setting for Production - **Fix**: Set for all 3 environments

### ❌ Wrong URL Format
```
❌ https://your-service-name.railway.app (missing /api)
✅ https://your-service-name.railway.app/api

❌ http://your-service-name.railway.app/api (using http)
✅ https://your-service-name.railway.app/api (use https)
```

### ❌ Using HTTP instead of HTTPS
```
❌ http://your-backend.onrender.com/api
✅ https://your-backend.onrender.com/api
```

### ❌ Forgetting to Redeploy
Added variable but didn't redeploy - **Fix**: Always redeploy after adding variables

## Quick Checklist

### Vercel Frontend
- [ ] `VITE_API_BASE_URL` set in Vercel
- [ ] Set for all 3 environments (Production, Preview, Development)
- [ ] URL includes `/api` at the end
- [ ] URL uses `https://` (not `http://`)
- [ ] URL uses your Railway backend domain
- [ ] Redeployed after adding variables

### Railway Backend
- [ ] Backend deployed on Railway
- [ ] Railway public domain obtained
- [ ] `ALLOWED_ORIGINS` set in Railway variables
- [ ] CORS allows Vercel domain: `https://royal-light-study-gap-ai.vercel.app`
- [ ] Railway service restarted/redeployed

### Testing
- [ ] Tested in browser - requests go to Railway backend (not localhost)
- [ ] No CORS errors in browser console
- [ ] API calls work correctly

## Still Not Working?

1. **Double-check variable name**: Must be exactly `VITE_API_BASE_URL`
2. **Verify variable value**: No typos, correct URL
3. **Check environments**: All three selected
4. **Redeploy**: Always redeploy after changes
5. **Clear cache**: Clear browser cache and hard refresh
6. **Check build logs**: Look for errors in Vercel

## Need Help?

See detailed guide: [docs/VERCEL_ENV_VARIABLES_SETUP.md](./docs/VERCEL_ENV_VARIABLES_SETUP.md)

---

**Remember**: Environment variables are injected at **build time**. You must **redeploy** for changes to take effect!

