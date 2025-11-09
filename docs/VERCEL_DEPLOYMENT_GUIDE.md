# Vercel Deployment Guide: StudyGapAI Frontend

Complete guide for deploying the StudyGapAI frontend to Vercel.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Step 1: Prepare Your Repository](#step-1-prepare-your-repository)
4. [Step 2: Deploy to Vercel](#step-2-deploy-to-vercel)
5. [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
6. [Step 4: Connect to Backend](#step-4-connect-to-backend)
7. [Step 5: Custom Domain (Optional)](#step-5-custom-domain-optional)
8. [Step 6: Verify Deployment](#step-6-verify-deployment)
9. [Troubleshooting](#troubleshooting)
10. [Environment Variables Reference](#environment-variables-reference)

---

## Overview

### What is Vercel?

Vercel is a cloud platform that specializes in frontend deployments:
- **Automatic Deployments**: Deploys on every git push
- **Global CDN**: Fast content delivery worldwide
- **HTTPS**: Automatic SSL certificates
- **Preview Deployments**: Test changes before production
- **Free Tier**: Generous free tier for personal projects

### Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Vercel        │  HTTPS  │   Backend       │  HTTPS  │   Supabase      │
│   (Frontend)    │────────▶│   (Render/API)  │────────▶│   (Database)    │
│   React + Vite  │         │   Flask/Python  │         │   PostgreSQL    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### How Vercel Works

1. **Build**: Vercel runs `npm run build` to create production bundle
2. **Deploy**: Serves static files from `dist/` directory
3. **Routing**: Uses `vercel.json` for SPA routing (React Router)
4. **Environment Variables**: Injected at build time
5. **CDN**: Serves files from edge locations worldwide

---

## Prerequisites

- GitHub account
- GitHub repository with frontend code
- Vercel account ([vercel.com](https://vercel.com))
- Backend API URL (deployed on Render, Railway, or another service)
- Supabase project URL and anon key

---

## Step 1: Prepare Your Repository

### 1.1 Verify Build Configuration

Ensure your `package.json` has a build script:

```json
{
  "scripts": {
    "build": "tsc && vite build",
    "dev": "vite",
    "preview": "vite preview"
  }
}
```

### 1.2 Verify Vite Configuration

Your `vite.config.ts` should output to `dist/`:

```typescript
export default defineConfig({
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
});
```

### 1.3 Test Local Build

Test that your app builds successfully:

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Verify dist folder was created
ls dist

# Test production build locally
npm run preview
```

### 1.4 Commit and Push to GitHub

```bash
# Add all changes
git add .

# Commit changes
git commit -m "Prepare for Vercel deployment"

# Push to GitHub
git push origin main
```

---

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

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

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   # Deploy to production
   vercel --prod

   # Or deploy to preview
   vercel
   ```

4. **Follow Prompts**
   - Link to existing project or create new
   - Confirm settings
   - Deployment will start

---

## Step 3: Configure Environment Variables

### 3.1 Add Environment Variables in Vercel

1. **Go to Project Settings**
   - Click on your project in Vercel dashboard
   - Go to **"Settings"** tab
   - Click **"Environment Variables"**

2. **Add Variables**
   Click **"Add New"** and add:

   | Key | Value | Environments |
   |-----|-------|--------------|
   | `VITE_API_BASE_URL` | `https://your-backend.onrender.com/api` | Production, Preview, Development |
   | `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
   | `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Production, Preview, Development |

3. **Save Variables**
   - Click **"Save"** after adding each variable
   - Variables are encrypted and only available at build time

### 3.2 Redeploy After Adding Variables

1. **Trigger New Deployment**
   - Go to **"Deployments"** tab
   - Click **"Redeploy"** on latest deployment
   - Or push a new commit to trigger deployment

2. **Verify Variables**
   - Check build logs for any errors
   - Verify API calls use correct URLs in browser console

---

## Step 4: Connect to Backend

### 4.1 Get Backend URL

1. **Backend Deployment**
   - Ensure your backend is deployed (Render, Railway, etc.)
   - Note your backend URL: `https://your-backend.onrender.com`

2. **Update Environment Variable**
   - Go to Vercel → Project → Settings → Environment Variables
   - Update `VITE_API_BASE_URL`:
     ```
     https://your-backend.onrender.com/api
     ```
   - Include `/api` if your backend serves API under `/api`

### 4.2 Update Backend CORS

1. **Go to Backend Service**
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

### 4.3 Test Backend Connection

1. **Open Your App**
   - Visit your Vercel URL: `https://your-app.vercel.app`
   - Open browser DevTools (F12)

2. **Check API Requests**
   - Go to **Network** tab
   - Navigate through your app
   - Verify API requests go to your backend URL
   - Check for CORS errors

3. **Test API Endpoint**
   ```javascript
   // In browser console
   fetch('https://your-backend.onrender.com/api/topics')
     .then(res => res.json())
     .then(data => console.log('Topics:', data))
     .catch(err => console.error('Error:', err));
   ```

---

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain

1. **Go to Project Settings**
   - Click on your project
   - Go to **"Settings"** → **"Domains"**

2. **Add Domain**
   - Enter your domain: `studygapai.com`
   - Click **"Add"**

3. **Configure DNS**
   - Follow Vercel's DNS instructions
   - Add CNAME or A record as instructed
   - Wait for DNS propagation (5-60 minutes)

### 5.2 Update Backend CORS

1. **Update Backend CORS**
   - Add custom domain to `ALLOWED_ORIGINS`:
     ```
     https://your-app.vercel.app,https://studygapai.com,https://www.studygapai.com
     ```
   - Restart backend service

### 5.3 SSL Certificate

- Vercel automatically provisions SSL certificates
- HTTPS is enabled by default
- No additional configuration needed

---

## Step 6: Verify Deployment

### 6.1 Check Deployment Status

1. **Go to Deployments Tab**
   - Click on your project
   - Go to **"Deployments"** tab
   - Check deployment status (should be "Ready")

2. **View Build Logs**
   - Click on deployment
   - Check **"Build Logs"** for any errors
   - Verify build completed successfully

### 6.2 Test Your App

1. **Open Your App**
   - Visit your Vercel URL
   - Test all features:
     - ✅ Landing page loads
     - ✅ Register new user
     - ✅ Login
     - ✅ Take diagnostic quiz
     - ✅ View results
     - ✅ View study plan
     - ✅ Browse resources

2. **Check Browser Console**
   - Open DevTools (F12)
   - Check **Console** for errors
   - Check **Network** tab for API requests
   - Verify API requests go to backend (not localhost)

### 6.3 Performance Check

1. **Lighthouse Audit**
   - Open Chrome DevTools
   - Go to **Lighthouse** tab
   - Run performance audit
   - Aim for 90+ score

2. **Load Time**
   - Check initial load time
   - Should be < 3 seconds
   - Vercel CDN provides fast global delivery

---

## Troubleshooting

### Common Issues

#### 1. Build Failures

**Error:**
```
Build failed: Command "npm run build" exited with 1
```

**Solution:**
1. Check build logs in Vercel dashboard
2. Test build locally: `npm run build`
3. Fix TypeScript errors
4. Check for missing dependencies
5. Verify `vite.config.ts` is correct

#### 2. Environment Variables Not Working

**Error:**
```
API calls going to localhost or undefined
```

**Solution:**
1. Check environment variables are set in Vercel
2. Verify variables start with `VITE_` prefix
3. Redeploy after adding/updating variables
4. Check browser console for actual values:
   ```javascript
   console.log(import.meta.env.VITE_API_BASE_URL);
   ```

#### 3. CORS Errors

**Error:**
```
Access to fetch has been blocked by CORS policy
```

**Solution:**
1. Update backend CORS to allow Vercel domain
2. Add both production and preview URLs:
   ```
   https://your-app.vercel.app,https://*.vercel.app
   ```
3. Restart backend after updating CORS
4. Verify CORS headers in browser Network tab

#### 4. 404 Errors on Routes

**Error:**
```
404 Not Found when navigating to /dashboard
```

**Solution:**
1. Verify `vercel.json` has rewrite rules:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
2. Redeploy after adding `vercel.json`
3. Check React Router configuration

#### 5. API Timeout

**Error:**
```
Request timeout or 504 Gateway Timeout
```

**Solution:**
1. Check backend is running and accessible
2. Verify backend URL is correct
3. Check backend logs for errors
4. Increase timeout in backend if needed

### Debugging Steps

1. **Check Build Logs**
   - Go to Vercel → Deployments → Click deployment
   - Check "Build Logs" for errors
   - Check "Runtime Logs" for runtime errors

2. **Check Browser Console**
   - Open your app in browser
   - Open DevTools (F12)
   - Check Console for errors
   - Check Network tab for failed requests

3. **Test API Connection**
   ```bash
   # Test backend is accessible
   curl https://your-backend.onrender.com/api/topics

   # Test with CORS headers
   curl -H "Origin: https://your-app.vercel.app" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        https://your-backend.onrender.com/api/topics
   ```

4. **Verify Environment Variables**
   - Go to Vercel → Settings → Environment Variables
   - Verify all variables are set
   - Check values are correct
   - Redeploy after making changes

---

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `https://studygapai-backend.onrender.com/api` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Setting Variables in Vercel

1. Go to **Project** → **Settings** → **Environment Variables**
2. Click **"Add New"**
3. Enter key and value
4. Select environments (Production, Preview, Development)
5. Click **"Save"**
6. Redeploy to apply changes

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

**Important Notes:**
- Variables must start with `VITE_` to be exposed to frontend
- Variables are injected at build time
- Changes require redeployment
- Variables are encrypted and secure

---

## Quick Reference

### Vercel URLs

- **Your App**: `https://your-app.vercel.app`
- **Vercel Dashboard**: [vercel.com](https://vercel.com)
- **Documentation**: [vercel.com/docs](https://vercel.com/docs)

### Common Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployments
vercel ls

# View logs
vercel logs
```

### File Structure

```
.
├── vercel.json          # Vercel configuration
├── package.json         # Dependencies and scripts
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── index.html           # HTML entry point
├── src/                 # Source code
│   ├── components/      # React components
│   ├── pages/           # Page components
│   ├── services/        # API services
│   └── hooks/           # React hooks
└── dist/                # Built files (created during build)
```

### Deployment Checklist

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

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify environment variables are set
4. Test API connection with curl
5. Check backend CORS configuration
6. Review troubleshooting section above

For backend-specific issues, refer to your backend deployment documentation.
For frontend code issues, check the main project documentation.

---

## Next Steps

After deploying to Vercel:

1. **Set up custom domain** (optional)
2. **Configure preview deployments** for testing
3. **Set up monitoring** with Vercel Analytics
4. **Optimize performance** with Vercel Speed Insights
5. **Set up CI/CD** with automatic deployments

Your app is now live on Vercel! 🚀

