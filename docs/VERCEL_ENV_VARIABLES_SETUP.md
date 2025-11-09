# Vercel Environment Variables Setup Guide

## Problem: Environment Variables Not Working

If you're seeing errors like:
- `Backend URL: undefined`
- Requests going to `http://localhost:5000/api` instead of your production backend
- `Cannot connect to backend` errors

This means your environment variables are not set correctly in Vercel.

## Solution: Set Environment Variables in Vercel

### Step 1: Go to Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Sign in to your account
3. Click on your project: **Royal-Light-StudyGapAI**

### Step 2: Navigate to Environment Variables

1. Click on **"Settings"** tab (top navigation)
2. Click on **"Environment Variables"** in the left sidebar
3. You'll see a list of environment variables (empty if none are set)

### Step 3: Add Environment Variables

Click **"Add New"** button and add each variable:

#### Variable 1: Backend API URL

- **Key**: `VITE_API_BASE_URL`
- **Value**: `https://your-backend.onrender.com/api` (replace with your actual backend URL)
- **Environments**: Select all three:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

**Important Notes:**
- Include `/api` at the end if your backend serves API under `/api`
- Use `https://` (not `http://`)
- Don't include a trailing slash after `/api`

#### Variable 2: Supabase URL

- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://xxx.supabase.co` (your Supabase project URL)
- **Environments**: Select all three:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

#### Variable 3: Supabase Anon Key

- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJ...` (your Supabase anon key)
- **Environments**: Select all three:
  - ✅ Production
  - ✅ Preview
  - ✅ Development

### Step 4: Save and Redeploy

1. Click **"Save"** after adding each variable
2. After adding all variables, go to **"Deployments"** tab
3. Click on the **three dots (⋯)** next to the latest deployment
4. Click **"Redeploy"**
5. Select **"Use existing Build Cache"** (optional, faster)
6. Click **"Redeploy"**

### Step 5: Verify Environment Variables

After redeployment:

1. Go to your deployed app: `https://royal-light-study-gap-ai.vercel.app`
2. Open browser DevTools (F12)
3. Go to **Console** tab
4. Look for logs showing the API URL (in development mode)
5. Check **Network** tab to verify requests go to your backend URL (not localhost)

## Common Mistakes

### ❌ Wrong: Not Setting for All Environments
```
Environments: Only Production selected
```
**Fix**: Select all three environments (Production, Preview, Development)

### ❌ Wrong: Missing `/api` in URL
```
VITE_API_BASE_URL: https://your-backend.onrender.com
```
**Fix**: Include `/api`:
```
VITE_API_BASE_URL: https://your-backend.onrender.com/api
```

### ❌ Wrong: Using `http://` instead of `https://`
```
VITE_API_BASE_URL: http://your-backend.onrender.com/api
```
**Fix**: Use `https://`:
```
VITE_API_BASE_URL: https://your-backend.onrender.com/api
```

### ❌ Wrong: Typo in Variable Name
```
VITE_API_BASE_URL: ... (correct)
VITE_API_BASE_UR: ... (wrong - missing L)
```
**Fix**: Double-check the variable name is exactly `VITE_API_BASE_URL`

### ❌ Wrong: Forgetting to Redeploy
```
Added variable but didn't redeploy
```
**Fix**: Always redeploy after adding/updating environment variables

## Verification Checklist

- [ ] Environment variables set in Vercel dashboard
- [ ] All three environments selected (Production, Preview, Development)
- [ ] Variable names are correct (start with `VITE_`)
- [ ] Backend URL includes `/api` at the end
- [ ] Backend URL uses `https://` (not `http://`)
- [ ] Redeployed after adding variables
- [ ] Checked browser console for API URL
- [ ] Verified Network tab shows requests to production backend
- [ ] No more `localhost:5000` in requests

## Testing Environment Variables

### Method 1: Check Browser Console

1. Open your deployed app
2. Open DevTools (F12)
3. Go to Console tab
4. Type:
   ```javascript
   console.log('API URL:', import.meta.env.VITE_API_BASE_URL);
   ```
5. Should show your backend URL (not `undefined`)

### Method 2: Check Network Tab

1. Open your deployed app
2. Open DevTools (F12)
3. Go to Network tab
4. Navigate through your app (trigger API calls)
5. Check request URLs - should go to your backend (not localhost)

### Method 3: Check Vercel Build Logs

1. Go to Vercel dashboard
2. Click on your project
3. Go to **"Deployments"** tab
4. Click on a deployment
5. Check **"Build Logs"**
6. Look for any errors related to environment variables

## Troubleshooting

### Environment Variable is `undefined`

**Problem**: Variable is not set or not accessible

**Solutions**:
1. Verify variable is set in Vercel dashboard
2. Check variable name is exactly correct
3. Verify it's set for the correct environment
4. Redeploy after adding variable
5. Clear browser cache and hard refresh

### Still Using Localhost

**Problem**: Build is using fallback localhost URL

**Solutions**:
1. Verify `VITE_API_BASE_URL` is set in Vercel
2. Check variable value is correct
3. Redeploy after setting variable
4. Verify build logs show the variable is being used

### CORS Errors

**Problem**: Backend is blocking requests from Vercel

**Solutions**:
1. Update backend CORS to allow Vercel domain:
   ```
   https://royal-light-study-gap-ai.vercel.app
   ```
2. Or allow all Vercel preview deployments:
   ```
   https://royal-light-study-gap-ai.vercel.app,https://*.vercel.app
   ```
3. Restart backend after updating CORS

## Quick Reference

### Required Environment Variables

| Variable | Example Value | Required For |
|----------|---------------|--------------|
| `VITE_API_BASE_URL` | `https://studygapai-backend.onrender.com/api` | Backend API calls |
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase authentication |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Supabase authentication |

### Vercel Environment Variables URL

Direct link to your project's environment variables:
```
https://vercel.com/your-username/royal-light-study-gap-ai/settings/environment-variables
```

## Still Having Issues?

1. **Double-check variable names**: Must start with `VITE_`
2. **Verify variable values**: No typos, correct URLs
3. **Check environments**: Set for Production, Preview, Development
4. **Redeploy**: Always redeploy after changing variables
5. **Clear cache**: Clear browser cache and hard refresh
6. **Check build logs**: Look for errors in Vercel build logs
7. **Test locally**: Set variables in `.env.local` and test locally first

## Next Steps

After setting environment variables:
1. Redeploy your Vercel project
2. Test your app to verify it works
3. Update backend CORS to allow Vercel domain
4. Test API calls work correctly
5. Monitor for any errors

---

**Remember**: Environment variables are injected at **build time**, not runtime. You must **redeploy** after adding or updating environment variables for changes to take effect.

