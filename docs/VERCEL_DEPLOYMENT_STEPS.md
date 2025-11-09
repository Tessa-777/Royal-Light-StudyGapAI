# Vercel Deployment Steps - Quick Reference

## 🚀 Quick Deployment Guide

### Step 1: Prepare Your Repository ✅

The codebase is ready for Vercel deployment:
- ✅ `vercel.json` configuration file
- ✅ Build script: `npm run build`
- ✅ Output directory: `dist`
- ✅ Vite configuration optimized
- ✅ React Router SPA routing configured

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Create New Project**
   - Click **"Add New..."** → **"Project"**
   - Import your GitHub repository
   - Select your repository

3. **Configure Project**
   - **Framework Preset**: `Vite` (auto-detected)
   - **Root Directory**: `.` (leave empty if root)
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `dist` (default)
   - **Install Command**: `npm install` (default)

4. **Deploy**
   - Click **"Deploy"**
   - Wait for build to complete (2-5 minutes)
   - Your app will be live at: `https://your-app.vercel.app`

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Step 3: Configure Environment Variables

1. **Go to Project Settings**
   - Click on your project in Vercel dashboard
   - Go to **"Settings"** tab
   - Click **"Environment Variables"**

2. **Add Required Variables**
   Click **"Add New"** and add:

   | Key | Value | Environments |
   |-----|-------|--------------|
   | `VITE_API_BASE_URL` | `https://your-backend.onrender.com/api` | Production, Preview, Development |
   | `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
   | `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Production, Preview, Development |

3. **Save and Redeploy**
   - Click **"Save"** after adding each variable
   - Go to **"Deployments"** tab
   - Click **"Redeploy"** on latest deployment

### Step 4: Update Backend CORS

1. **Go to Your Backend Service**
   - Render: Go to your service → Environment
   - Railway: Go to your service → Variables
   - Update CORS configuration

2. **Add Vercel Domain**
   - Add to `ALLOWED_ORIGINS`:
     ```
     https://your-app.vercel.app
     ```
   - Or allow all Vercel preview deployments:
     ```
     https://your-app.vercel.app,https://*.vercel.app
     ```

3. **Restart Backend**
   - Save environment variables
   - Restart your backend service

### Step 5: Test Your App

1. **Open Your App**
   - Visit your Vercel URL: `https://your-app.vercel.app`
   - Open browser DevTools (F12)

2. **Test Features**
   - ✅ Landing page loads
   - ✅ Register new user
   - ✅ Login
   - ✅ Take diagnostic quiz
   - ✅ View results
   - ✅ View study plan

3. **Check for Errors**
   - Check browser console for errors
   - Check Network tab for API requests
   - Verify API requests go to your backend (not localhost)
   - Check for CORS errors

## 📝 Environment Variables Checklist

- [ ] `VITE_API_BASE_URL` - Your backend API URL
- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

## 🔧 Troubleshooting

### Build Failures
- Check build logs in Vercel dashboard
- Test build locally: `npm run build`
- Fix TypeScript errors
- Check for missing dependencies

### Environment Variables Not Working
- Check variables are set in Vercel
- Verify variables start with `VITE_` prefix
- Redeploy after adding/updating variables
- Check browser console for actual values

### CORS Errors
- Update backend CORS to allow Vercel domain
- Check browser console for CORS errors
- Verify backend URL is correct
- Restart backend after updating CORS

### 404 Errors on Routes
- Verify `vercel.json` has rewrite rules
- Redeploy after adding `vercel.json`
- Check React Router configuration

## 📚 Documentation

- **Full Guide**: [docs/VERCEL_DEPLOYMENT_GUIDE.md](./docs/VERCEL_DEPLOYMENT_GUIDE.md)
- **Backend Deployment**: [docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)

## ✅ Deployment Checklist

- [ ] Repository pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables set
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Backend URL configured
- [ ] Backend CORS updated
- [ ] Deployment successful
- [ ] App loads correctly
- [ ] API requests work
- [ ] Authentication works
- [ ] All features tested

---

**Ready to deploy?** Follow the steps above and you'll have your app running on Vercel in minutes! 🚀

