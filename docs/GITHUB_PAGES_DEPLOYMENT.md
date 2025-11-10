# GitHub Pages Deployment Guide: StudyGapAI Frontend

Complete guide for deploying the StudyGapAI frontend to GitHub Pages and connecting it to your Railway backend.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Install gh-pages](#step-1-install-gh-pages)
4. [Step 2: Configure package.json](#step-2-configure-packagejson)
5. [Step 3: Configure Vite for GitHub Pages](#step-3-configure-vite-for-github-pages)
6. [Step 4: Set Environment Variables](#step-4-set-environment-variables)
7. [Step 5: Build and Deploy](#step-5-build-and-deploy)
8. [Step 6: Configure GitHub Pages](#step-6-configure-github-pages)
9. [Step 7: Update Backend CORS](#step-7-update-backend-cors)
8. [Step 8: Verify Deployment](#step-8-verify-deployment)
9. [Troubleshooting](#troubleshooting)
10. [Environment Variables Reference](#environment-variables-reference)

---

## Overview

### What is GitHub Pages?

GitHub Pages is a static site hosting service that:
- Hosts your React app directly from your GitHub repository
- Provides free HTTPS and custom domain support
- Automatically deploys from the `gh-pages` branch
- Works great for static React applications

### Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   GitHub Pages  │  HTTPS  │   Railway       │  HTTPS  │   Supabase      │
│   (Frontend)    │────────▶│   (Backend API) │────────▶│   (Database)    │
│   React + Vite  │         │   Flask/Python  │         │   PostgreSQL    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### GitHub Pages URL Format

Your app will be available at:
```
https://Tessa-777.github.io/Royal-Light-StudyGapAI
```

---

## Prerequisites

- GitHub account
- GitHub repository: `Royal-Light-StudyGapAI`
- Railway backend deployed and accessible
- Supabase project URL and anon key
- Node.js and npm installed

---

## Step 1: Install gh-pages

Install the `gh-pages` package as a dev dependency:

```bash
npm install --save-dev gh-pages
```

This package will handle deploying your built files to the `gh-pages` branch.

---

## Step 2: Configure package.json

### 2.1 Add Homepage

Add the `homepage` field to `package.json`:

```json
{
  "homepage": "https://Tessa-777.github.io/Royal-Light-StudyGapAI"
}
```

This tells Vite where your app will be hosted.

### 2.2 Add Deploy Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

- `predeploy`: Runs before deploy (builds your app)
- `deploy`: Deploys the `dist` folder to `gh-pages` branch

---

## Step 3: Configure Vite for GitHub Pages

### 3.1 Update vite.config.ts

Your `vite.config.ts` should have the `base` configuration:

```typescript
export default defineConfig({
  base: process.env.NODE_ENV === "production" ? "/Royal-Light-StudyGapAI/" : "/",
  // ... rest of config
});
```

This ensures assets are loaded correctly from the GitHub Pages subdirectory.

### 3.2 Create 404.html

GitHub Pages needs a `404.html` file for SPA routing. This file redirects all routes to `index.html`.

The `404.html` file is already created in the root directory.

---

## Step 4: Set Environment Variables

### 4.1 Create .env.production File

Create a `.env.production` file in the root directory:

```env
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**Important Notes:**
- Use your **Railway backend URL** + `/api`
- Variables must start with `VITE_` to be exposed to the frontend
- This file will be used during the build process

### 4.2 Update .gitignore

Make sure `.env.production` is **NOT** in `.gitignore` (or commit it with safe values):

```gitignore
# Environment variables
.env
.env.local
.env.*.local
# .env.production  # Comment this out if you want to commit it
```

**Security Note**: 
- For public repositories, use GitHub Secrets and GitHub Actions
- For private repositories, you can commit `.env.production` with your values

### 4.3 Alternative: Use GitHub Secrets (Recommended for Public Repos)

If your repository is public, use GitHub Actions with secrets:

1. Go to GitHub Repository → **Settings** → **Secrets and variables** → **Actions**
2. Add secrets:
   - `VITE_API_BASE_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Create GitHub Actions workflow (see below)

---

## Step 5: Build and Deploy

### 5.1 Build Locally (Test First)

```bash
# Build the app
npm run build

# Preview the build locally
npm run preview
```

Verify the build works and assets load correctly.

### 5.2 Deploy to GitHub Pages

```bash
# Deploy to GitHub Pages
npm run deploy
```

This will:
1. Run `predeploy` script (builds your app)
2. Deploy `dist` folder to `gh-pages` branch
3. Create/update `gh-pages` branch automatically

### 5.3 Verify Deployment

1. Go to GitHub Repository
2. Check that `gh-pages` branch was created
3. Verify `gh-pages` branch contains your built files

---

## Step 6: Configure GitHub Pages

### 6.1 Enable GitHub Pages

1. Go to GitHub Repository → **Settings**
2. Scroll to **Pages** section (left sidebar)
3. Under **Source**, select:
   - **Branch**: `gh-pages`
   - **Folder**: `/ (root)`
4. Click **Save**

### 6.2 Wait for Deployment

GitHub Pages will build and deploy your site. This usually takes 1-2 minutes.

### 6.3 Access Your Site

Your site will be available at:
```
https://Tessa-777.github.io/Royal-Light-StudyGapAI
```

---

## Step 7: Update Backend CORS (Railway)

### 7.1 Configure Railway Backend CORS

1. Go to [Railway Dashboard](https://railway.app)
2. Click on your backend service
3. Go to **"Variables"** tab
4. Add or update `ALLOWED_ORIGINS`:
   ```
   https://Tessa-777.github.io
   ```
   Or allow all GitHub Pages:
   ```
   https://Tessa-777.github.io,https://*.github.io
   ```

### 7.2 Restart Railway Service

Railway will automatically redeploy when you update variables.

---

## Step 8: Verify Deployment

### 8.1 Test Your App

1. Visit: `https://Tessa-777.github.io/Royal-Light-StudyGapAI`
2. Open browser DevTools (F12)
3. Check **Console** for errors
4. Check **Network** tab for API requests

### 8.2 Verify API Connection

1. Navigate through your app
2. Check Network tab - requests should go to your Railway backend
3. Verify no CORS errors
4. Test authentication
5. Test quiz flow

### 8.3 Test Routing

1. Navigate to different routes (e.g., `/dashboard`, `/quiz`)
2. Verify routes work correctly
3. Test browser back/forward buttons
4. Verify 404.html handles unknown routes

---

## Troubleshooting

### Common Issues

#### 1. 404 Errors on Routes

**Error**: Routes return 404 when accessed directly

**Solution**: 
- Verify `404.html` exists in root directory
- Check `vite.config.ts` has correct `base` path
- Verify GitHub Pages is serving from `gh-pages` branch

#### 2. Assets Not Loading

**Error**: Images, CSS, or JS files return 404

**Solution**:
- Check `vite.config.ts` `base` configuration
- Verify `homepage` in `package.json` matches your GitHub Pages URL
- Check that assets are in `dist/assets/` folder after build
- Clear browser cache and hard refresh

#### 3. Environment Variables Not Working

**Error**: API calls going to localhost or undefined

**Solution**:
1. Verify `.env.production` file exists
2. Check variables start with `VITE_` prefix
3. Rebuild and redeploy after changing variables
4. Check browser console for actual values

#### 4. CORS Errors

**Error**: CORS policy blocking requests

**Solution**:
1. Update Railway `ALLOWED_ORIGINS` to include GitHub Pages URL
2. Verify CORS allows: `https://Tessa-777.github.io`
3. Restart Railway service after updating CORS
4. Check backend CORS configuration

#### 5. Build Failures

**Error**: Build fails during `npm run deploy`

**Solution**:
1. Test build locally: `npm run build`
2. Check for TypeScript errors
3. Verify all dependencies are installed
4. Check `package.json` scripts are correct
5. Verify `homepage` is set correctly

#### 6. Deployment Not Updating

**Error**: Changes not reflected on GitHub Pages

**Solution**:
1. Verify `gh-pages` branch was updated
2. Wait 1-2 minutes for GitHub Pages to rebuild
3. Clear browser cache
4. Check GitHub Pages deployment status in repository Settings

### Debugging Steps

1. **Check GitHub Pages Status**
   - Go to Repository → Settings → Pages
   - Check deployment status
   - View deployment logs if available

2. **Check gh-pages Branch**
   - Go to Repository → Branches
   - Verify `gh-pages` branch exists
   - Check branch contains built files

3. **Check Build Output**
   - Run `npm run build` locally
   - Verify `dist` folder is created
   - Check files are correct

4. **Check Browser Console**
   - Open your GitHub Pages URL
   - Open DevTools (F12)
   - Check Console for errors
   - Check Network tab for failed requests

5. **Test Environment Variables**
   - Check `.env.production` file
   - Verify variables are set correctly
   - Rebuild and redeploy

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Railway backend API URL | `https://your-backend.railway.app/api` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Setting Variables

#### Option 1: .env.production File (Simplest)

Create `.env.production` in root directory:

```env
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

#### Option 2: GitHub Secrets + GitHub Actions (Recommended for Public Repos)

1. Go to Repository → Settings → Secrets and variables → Actions
2. Add secrets:
   - `VITE_API_BASE_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Create `.github/workflows/deploy.yml` (see below)

### Accessing Variables in Code

```typescript
// In your code
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if variable is set
if (!apiUrl) {
  console.error('VITE_API_BASE_URL is not set');
}
```

---

## GitHub Actions Workflow (Optional)

For automated deployments with GitHub Secrets, create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.VITE_API_BASE_URL }}
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

---

## Quick Reference

### GitHub Pages URL

```
https://Tessa-777.github.io/Royal-Light-StudyGapAI
```

### Repository Info

- **Username**: Tessa-777
- **Repository**: Royal-Light-StudyGapAI
- **Branch**: main (source), gh-pages (deployed)

### Common Commands

```bash
# Install dependencies
npm install

# Build locally
npm run build

# Preview build
npm run preview

# Deploy to GitHub Pages
npm run deploy

# Check gh-pages branch
git checkout gh-pages
```

### File Structure

```
.
├── .github/
│   └── workflows/
│       └── deploy.yml (optional - for GitHub Actions)
├── .env.production (environment variables)
├── 404.html (SPA routing for GitHub Pages)
├── package.json (with homepage and deploy scripts)
├── vite.config.ts (with base path configuration)
├── dist/ (built files - created during build)
└── src/ (source code)
```

### Deployment Checklist

- [ ] `gh-pages` package installed
- [ ] `homepage` set in `package.json`
- [ ] Deploy scripts added to `package.json`
- [ ] `vite.config.ts` configured with base path
- [ ] `404.html` created for SPA routing
- [ ] `.env.production` created with environment variables
- [ ] Build tested locally (`npm run build`)
- [ ] Deployed to GitHub Pages (`npm run deploy`)
- [ ] GitHub Pages enabled in repository settings
- [ ] Railway backend CORS updated
- [ ] App tested on GitHub Pages URL
- [ ] API requests work correctly
- [ ] Routing works correctly
- [ ] Authentication works
- [ ] All features tested

---

## Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [gh-pages Package](https://www.npmjs.com/package/gh-pages)
- [Vite Base Configuration](https://vitejs.dev/config/shared-options.html#base)
- [GitHub Pages SPA Routing](https://github.com/rafgraph/spa-github-pages)

---

## Support

If you encounter issues:

1. Check GitHub Pages deployment status
2. Check browser console for errors
3. Verify environment variables are set
4. Test API connection with curl
5. Check Railway backend CORS configuration
6. Review troubleshooting section above

For backend-specific issues, refer to your Railway backend documentation.
For frontend code issues, check the main project documentation.

---

## Next Steps

After deploying to GitHub Pages:

1. **Set up custom domain** (optional)
2. **Configure GitHub Actions** for automated deployments
3. **Set up monitoring** (optional)
4. **Optimize performance** (lazy loading, code splitting)
5. **Set up analytics** (optional)

Your app is now live on GitHub Pages! 🚀

