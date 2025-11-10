# 🔧 Quick Fix: Invalid API Key Error on GitHub Pages

## The Problem

Your app works locally but fails on GitHub Pages with:
```
AuthApiError: Invalid API key
```

## The Cause

Environment variables are **not set in GitHub Secrets**. The GitHub Actions workflow needs these secrets during the build process.

## The Solution (5 minutes)

### Step 1: Add GitHub Secrets

1. Go to: `https://github.com/Tessa-777/Royal-Light-StudyGapAI/settings/secrets/actions`
2. Click **"New repository secret"**
3. Add these **3 secrets**:

| Secret Name | Value | Where to Find |
|------------|-------|---------------|
| `VITE_SUPABASE_URL` | `https://razxfruvntcddwbfsyuh.supabase.co` | Supabase Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` (your anon key) | Supabase Dashboard → Settings → API → anon public key |
| `VITE_API_BASE_URL` | `https://your-backend.railway.app/api` | Railway Dashboard → Your Service → Settings → Networking → Public Domain + `/api` |

### Step 2: Trigger Deployment

After adding secrets, trigger a new deployment:

**Option A: Push a commit**
```bash
git commit --allow-empty -m "Trigger deployment"
git push
```

**Option B: Manual trigger**
1. Go to **Actions** tab
2. Click **"Deploy to GitHub Pages"**
3. Click **"Run workflow"**
4. Click **"Run workflow"** button

### Step 3: Verify

1. Go to **Actions** tab
2. Check the latest workflow run
3. Look for: `✅ Environment variables validated`
4. Wait for deployment to complete
5. Test your site: `https://Tessa-777.github.io/Royal-Light-StudyGapAI`

## What I Fixed

1. ✅ Added validation step to workflow (will fail with clear error if secrets are missing)
2. ✅ Improved error messages in auth service
3. ✅ Created detailed setup guide: `docs/GITHUB_PAGES_SECRETS_SETUP.md`

## Still Not Working?

See the full guide: [docs/GITHUB_PAGES_SECRETS_SETUP.md](./docs/GITHUB_PAGES_SECRETS_SETUP.md)

---

**Next Steps:**
1. Add the 3 secrets in GitHub repository settings
2. Trigger a new deployment
3. Test your site

That's it! 🚀

