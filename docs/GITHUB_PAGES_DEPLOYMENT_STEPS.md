# GitHub Pages Deployment - Quick Steps

## 🚀 Quick Deployment Guide

### Step 1: Install gh-pages ✅

```bash
npm install --save-dev gh-pages
```

### Step 2: Configure package.json ✅

Already configured:
- ✅ `homepage`: `https://Tessa-777.github.io/Royal-Light-StudyGapAI`
- ✅ `predeploy`: `npm run build`
- ✅ `deploy`: `gh-pages -d dist`

### Step 3: Configure Vite ✅

Already configured:
- ✅ `base` path set for GitHub Pages
- ✅ `404.html` created for SPA routing

### Step 4: Set Environment Variables

#### Option A: Create .env.production (Simplest)

Create `.env.production` in root directory:

```env
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

#### Option B: Use GitHub Secrets (Recommended)

1. Go to GitHub Repository → **Settings** → **Secrets and variables** → **Actions**
2. Add secrets:
   - `VITE_API_BASE_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. GitHub Actions workflow will use these secrets automatically

### Step 5: Deploy

#### Option A: Manual Deployment

```bash
# Build and deploy
npm run deploy
```

#### Option B: Automated Deployment (GitHub Actions)

1. Push to `main` branch
2. GitHub Actions will automatically build and deploy
3. Check Actions tab for deployment status

### Step 6: Enable GitHub Pages

1. Go to GitHub Repository → **Settings** → **Pages**
2. Under **Source**, select:
   - **Deploy from a branch**: `gh-pages`
   - **Branch**: `gh-pages` → `/ (root)`
3. Click **Save**

### Step 7: Update Railway CORS

1. Go to Railway Dashboard → Your Service → **Variables**
2. Add/Update `ALLOWED_ORIGINS`:
   ```
   https://Tessa-777.github.io
   ```
3. Railway will automatically redeploy

### Step 8: Verify

1. Visit: `https://Tessa-777.github.io/Royal-Light-StudyGapAI`
2. Test your app
3. Check browser console for errors
4. Verify API requests go to Railway backend

## 📝 Environment Variables Checklist

- [ ] `.env.production` created (or GitHub Secrets set)
- [ ] `VITE_API_BASE_URL` = Railway backend URL + `/api`
- [ ] `VITE_SUPABASE_URL` = Supabase URL
- [ ] `VITE_SUPABASE_ANON_KEY` = Supabase anon key

## 🔧 Troubleshooting

### 404 Errors on Routes
- Verify `404.html` exists
- Check `vite.config.ts` base path
- Verify GitHub Pages is enabled

### Assets Not Loading
- Check `vite.config.ts` base configuration
- Verify `homepage` in `package.json`
- Clear browser cache

### Environment Variables Not Working
- Verify `.env.production` exists (or GitHub Secrets set)
- Check variables start with `VITE_`
- Rebuild and redeploy

### CORS Errors
- Update Railway `ALLOWED_ORIGINS`
- Include: `https://Tessa-777.github.io`
- Restart Railway service

## 📚 Documentation

- **Full Guide**: [docs/GITHUB_PAGES_DEPLOYMENT.md](./docs/GITHUB_PAGES_DEPLOYMENT.md)
- **Railway Backend**: [docs/RAILWAY_BACKEND_SETUP.md](./docs/RAILWAY_BACKEND_SETUP.md)

---

**Ready to deploy?** Run `npm run deploy` and enable GitHub Pages! 🚀

