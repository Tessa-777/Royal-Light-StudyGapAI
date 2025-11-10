# 🔐 GitHub Pages: Setting Up Environment Variables (Secrets)

## Problem

Your app works locally but fails on GitHub Pages with:
```
AuthApiError: Invalid API key
```

This happens because environment variables are **not set in GitHub Secrets**.

## Solution: Add GitHub Secrets

GitHub Actions needs access to your environment variables during the build process. These are stored as **GitHub Secrets**.

---

## Step-by-Step Guide

### Step 1: Go to Repository Settings

1. Go to your GitHub repository: `https://github.com/Tessa-777/Royal-Light-StudyGapAI`
2. Click on **"Settings"** tab (top navigation)
3. In the left sidebar, click **"Secrets and variables"**
4. Click **"Actions"**

**Important:** Since your workflow uses the `github-pages` environment, you have two options:

#### Option A: Repository-Level Secrets (Recommended)
- Set secrets at the repository level (they will be available to all environments)
- Follow steps below

#### Option B: Environment-Level Secrets
- Go to **"Environments"** in the left sidebar
- Click on **"github-pages"** environment
- Click **"Add secret"** and add secrets there
- This is more secure but requires setting up the environment first

### Step 2: Add Required Secrets

You need to add **3 secrets**:

#### 1. VITE_SUPABASE_URL

1. Click **"New repository secret"**
2. **Name**: `VITE_SUPABASE_URL`
3. **Secret**: Your Supabase URL (e.g., `https://razxfruvntcddwbfsyuh.supabase.co`)
4. Click **"Add secret"**

#### 2. VITE_SUPABASE_ANON_KEY

1. Click **"New repository secret"** again
2. **Name**: `VITE_SUPABASE_ANON_KEY`
3. **Secret**: Your Supabase anon key (starts with `eyJ...`)
4. Click **"Add secret"**

**To find your Supabase keys:**
- Go to [Supabase Dashboard](https://app.supabase.com)
- Select your project
- Go to **Settings** → **API**
- Copy **Project URL** (for VITE_SUPABASE_URL)
- Copy **anon public** key (for VITE_SUPABASE_ANON_KEY)

#### 3. VITE_API_BASE_URL (Optional but Recommended)

1. Click **"New repository secret"** again
2. **Name**: `VITE_API_BASE_URL`
3. **Secret**: Your Railway backend URL + `/api` (e.g., `https://your-backend.railway.app/api`)
4. Click **"Add secret"**

**To find your Railway backend URL:**
- Go to [Railway Dashboard](https://railway.app)
- Click on your backend service
- Go to **Settings** → **Networking**
- Copy your **Public Domain**
- Add `/api` at the end

---

## Step 3: Verify Secrets Are Set

After adding all secrets, you should see:

```
Secrets (3)
├── VITE_API_BASE_URL
├── VITE_SUPABASE_ANON_KEY
└── VITE_SUPABASE_URL
```

---

## Step 4: Trigger a New Deployment

After adding secrets, you need to trigger a new deployment:

### Option A: Push a Commit (Recommended)

```bash
# Make a small change (like updating a comment)
# Then commit and push
git add .
git commit -m "Trigger deployment with secrets"
git push
```

### Option B: Manual Workflow Trigger

1. Go to **"Actions"** tab in your repository
2. Click on **"Deploy to GitHub Pages"** workflow
3. Click **"Run workflow"** button (top right)
4. Select branch: `main`
5. Click **"Run workflow"**

---

## Step 5: Verify Deployment

1. Go to **"Actions"** tab
2. Click on the latest workflow run
3. Check the **"Validate environment variables"** step
4. You should see: `✅ Environment variables validated`
5. Wait for deployment to complete
6. Visit your site: `https://Tessa-777.github.io/Royal-Light-StudyGapAI`
7. Test registration/login - it should work now!

---

## Troubleshooting

### ❌ Error: "Invalid API key" Still Appearing

**Possible causes:**

1. **Secrets not set correctly**
   - Double-check secret names (must be exact: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
   - Verify secret values (no extra spaces, correct URLs)

2. **Build happened before secrets were added**
   - Trigger a new deployment after adding secrets
   - Go to Actions → Run workflow manually

3. **Wrong Supabase key**
   - Make sure you're using the **anon key** (not the service role key)
   - Anon key starts with `eyJ...` and is safe to expose in client-side code

4. **Cache issue**
   - Clear browser cache
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Try incognito/private window

### ❌ Workflow Fails with "Secret not set"

**Solution:**
- The workflow now validates secrets before building
- If validation fails, check the error message
- Add the missing secret in repository settings

### ❌ Still Not Working?

1. **Check workflow logs:**
   - Go to Actions → Latest workflow run
   - Check the "Validate environment variables" step
   - Look for error messages

2. **Verify secrets are set:**
   - Go to Settings → Secrets and variables → Actions
   - Verify all 3 secrets exist
   - Check secret names are exact (case-sensitive)

3. **Test locally:**
   - Create `.env.production` file with your values
   - Run `npm run build`
   - Check if build includes correct values
   - Run `npm run preview` to test

4. **Check browser console:**
   - Open deployed site
   - Open DevTools (F12)
   - Check Console for error messages
   - Look for environment variable warnings

---

## Security Notes

### ✅ Safe to Expose (Public)

- **VITE_SUPABASE_URL**: Safe to expose (public URL)
- **VITE_SUPABASE_ANON_KEY**: Safe to expose (designed for client-side use)
- **VITE_API_BASE_URL**: Safe to expose (public API URL)

These values are **embedded in your built JavaScript files** and are visible to anyone. This is **normal and safe** for:
- Supabase anon key (has Row Level Security)
- Public API URLs
- Frontend environment variables

### ❌ Never Expose (Private)

- **Service role keys** (Supabase)
- **Database passwords**
- **API keys with admin privileges**
- **Backend secrets**

---

## Quick Checklist

- [ ] Added `VITE_SUPABASE_URL` secret
- [ ] Added `VITE_SUPABASE_ANON_KEY` secret
- [ ] Added `VITE_API_BASE_URL` secret (optional)
- [ ] Verified secret names are exact (case-sensitive)
- [ ] Verified secret values are correct
- [ ] Triggered new deployment
- [ ] Checked workflow logs for validation
- [ ] Tested registration/login on deployed site
- [ ] Verified no "Invalid API key" errors

---

## Next Steps

After setting up secrets:

1. **Update backend CORS** (if not done already)
   - Add GitHub Pages URL to Railway `ALLOWED_ORIGINS`
   - Format: `https://Tessa-777.github.io`

2. **Test all features:**
   - User registration
   - User login
   - Quiz functionality
   - API calls

3. **Monitor deployments:**
   - Check Actions tab for deployment status
   - Verify workflow completes successfully

---

## Related Documentation

- [GitHub Pages Deployment Guide](./GITHUB_PAGES_DEPLOYMENT.md)
- [Environment Variables Fix](./ENV_VARIABLES_FIX.md)
- [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md)

---

## Summary

**The issue:** Environment variables are not set in GitHub Secrets.

**The fix:**
1. Go to Repository → Settings → Secrets and variables → Actions
2. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_BASE_URL`
3. Trigger a new deployment
4. Verify deployment succeeds

**Result:** Your app will have access to environment variables during build, and the "Invalid API key" error will be resolved.

---

**Need help?** Check the workflow logs in the Actions tab for specific error messages.

