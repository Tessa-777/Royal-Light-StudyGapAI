# 🚨 URGENT: Fix Environment Variables in Vercel

## The Problem

Your app is using `localhost:5000` because `VITE_API_BASE_URL` is not set in Vercel, or you didn't redeploy after setting it.

## ✅ Quick Fix (5 Minutes)

### Step 1: Verify Environment Variables in Vercel

1. Go to: https://vercel.com/your-username/royal-light-study-gap-ai/settings/environment-variables
2. Check if these 3 variables exist:
   - `VITE_API_BASE_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Step 2: If Variables Don't Exist - Add Them

For each variable:

1. Click **"Add New"**
2. Enter the **Key** (exactly as shown):
   - `VITE_API_BASE_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Enter the **Value**:
   - `VITE_API_BASE_URL`: `https://your-backend.railway.app/api` (your Railway backend URL - see below)
   - `VITE_SUPABASE_URL`: `https://xxx.supabase.co` (your Supabase URL)
   - `VITE_SUPABASE_ANON_KEY`: `eyJ...` (your Supabase key)
4. **IMPORTANT**: Select ALL THREE environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **"Save"**

### Step 3: REDEPLOY (CRITICAL!)

After adding/updating variables, you MUST redeploy:

1. Go to **"Deployments"** tab
2. Click the **three dots (⋯)** on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (2-5 minutes)

### Step 6: Verify It Works

1. Open your app: `https://royal-light-study-gap-ai.vercel.app`
2. Open browser DevTools (F12)
3. Go to Console tab
4. You should see warnings if variables are missing
5. Go to Network tab
6. Trigger an API call (e.g., take quiz)
7. Verify requests go to your Railway backend URL (not localhost)
8. Check for CORS errors - if you see them, update Railway CORS settings

## 🔍 How to Check if Variables Are Set

### Method 1: Check Vercel Dashboard

1. Go to Settings → Environment Variables
2. Verify all 3 variables are listed
3. Verify they're set for all 3 environments

### Method 2: Check Build Logs

1. Go to Deployments tab
2. Click on a deployment
3. Check Build Logs
4. Look for any errors about environment variables

### Method 3: Check Browser Console

After redeploying, open browser console. If you see:
```
⚠️ WARNING: Using localhost fallback in production!
```
This means `VITE_API_BASE_URL` is still not set.

## ❌ Common Mistakes

### Mistake 1: Not Redeploying
**Problem**: Added variables but didn't redeploy
**Fix**: Always redeploy after adding/updating variables

### Mistake 2: Wrong Environment Selected
**Problem**: Only set for Production, not Preview/Development
**Fix**: Set for all 3 environments

### Mistake 3: Wrong Variable Name
**Problem**: Typo in variable name (e.g., `VITE_API_BASE_UR`)
**Fix**: Double-check variable name is exactly `VITE_API_BASE_URL`

### Mistake 4: Wrong URL Format
**Problem**: Missing `/api` or using `http://` instead of `https://`
**Fix**: 
- Include `/api` at the end
- Use `https://` (not `http://`)
- No trailing slash after `/api`

### Mistake 5: Variable Not Starting with VITE_
**Problem**: Variable name doesn't start with `VITE_`
**Fix**: All frontend variables must start with `VITE_`

## 📝 Exact Steps for Your Case

Based on your error, do this:

1. **Go to Vercel Dashboard**
   - https://vercel.com
   - Click on your project

2. **Go to Environment Variables**
   - Settings → Environment Variables

3. **Add/Update `VITE_API_BASE_URL`**
   - Key: `VITE_API_BASE_URL`
   - Value: `https://your-backend.onrender.com/api` (replace with your actual backend URL)
   - Environments: ✅ Production ✅ Preview ✅ Development
   - Click Save

4. **Redeploy**
   - Deployments tab
   - Three dots → Redeploy
   - Wait for completion

5. **Test**
   - Open your app
   - Check browser console
   - Verify requests go to your backend

## 🎯 What Your Backend URL Should Look Like (Railway)

Since you're using **Railway** for your backend:

### Step 1: Get Your Railway Backend URL

1. Go to [Railway Dashboard](https://railway.app)
2. Click on your backend service
3. Go to **"Settings"** tab
4. Find your **"Public Domain"** or **"Custom Domain"**
5. Your backend URL will be: `https://your-service-name.railway.app`

### Step 2: Add `/api` to the URL

If your backend serves the API under `/api`, your full URL should be:
```
https://your-service-name.railway.app/api
```

**Example Railway URLs:**
```
https://studygapai-backend.railway.app/api
https://studygapai-production.railway.app/api
https://your-custom-domain.railway.app/api
```

### Step 3: Set in Vercel

In Vercel environment variables, set:
```
VITE_API_BASE_URL=https://your-service-name.railway.app/api
```

**Important**: 
- Must start with `https://`
- Must include `/api` at the end (if your backend serves API under `/api`)
- No trailing slash after `/api`
- Replace `your-service-name` with your actual Railway service name

## ✅ Success Checklist

After following these steps, verify:

- [ ] All 3 environment variables set in Vercel
- [ ] Variables set for all 3 environments
- [ ] Redeployed after setting variables
- [ ] No more `localhost:5000` in browser console
- [ ] API requests go to your production backend
- [ ] No CORS errors (backend CORS configured)
- [ ] App works correctly

## 🆘 Still Not Working?

If you've followed all steps and it's still not working:

1. **Double-check variable names**: Must be exactly `VITE_API_BASE_URL`
2. **Verify variable values**: No typos, correct URLs
3. **Check environments**: All three selected
4. **Redeploy again**: Sometimes takes 2 redeploys
5. **Clear browser cache**: Clear cache and hard refresh
6. **Check build logs**: Look for errors in Vercel build logs
7. **Test in incognito**: Open app in incognito mode

## 📚 More Help

See detailed guide: [docs/VERCEL_ENV_VARIABLES_SETUP.md](./docs/VERCEL_ENV_VARIABLES_SETUP.md)

---

**Remember**: Environment variables are injected at BUILD TIME. You MUST redeploy after adding/updating them!

