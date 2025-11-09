# Replit Deployment Steps - Quick Reference

## 🚀 Step-by-Step Deployment Guide

### Step 1: Prepare Your Codebase ✅

The codebase is already prepared with:
- ✅ `.replit` configuration file
- ✅ `replit.nix` for system dependencies
- ✅ `server.js` for production serving
- ✅ Updated `vite.config.ts` for Replit port configuration
- ✅ Updated `package.json` with production scripts
- ✅ Express server for serving built files

### Step 2: Create Replit Project

1. **Go to Replit**
   - Visit [replit.com](https://replit.com)
   - Sign in or create an account

2. **Import from GitHub**
   - Click **"Create Repl"**
   - Select **"Import from GitHub"**
   - Enter your repository URL: `https://github.com/yourusername/your-repo`
   - Click **"Import"**

3. **Wait for Setup**
   - Replit will clone your repository
   - It will automatically detect Node.js
   - Dependencies will start installing

### Step 3: Configure Environment Variables

1. **Open Secrets Tab**
   - Click **"Secrets"** (lock icon) in the left sidebar
   - Or use the padlock icon in the top bar

2. **Add Required Secrets**
   Click **"New secret"** and add:

   | Key | Value | Notes |
   |-----|-------|-------|
   | `VITE_API_BASE_URL` | `https://your-backend.onrender.com/api` | Your backend API URL |
   | `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Your Supabase anon key |

3. **Save Secrets**
   - Click **"Add secret"** for each variable
   - Secrets are automatically saved
   - **Important**: Restart the repl after adding secrets

### Step 4: Run Your App

1. **Click Run Button**
   - Click the green **"Run"** button
   - Or press `Ctrl + Enter` (Windows/Linux) or `Cmd + Enter` (Mac)

2. **Wait for Startup**
   - Replit will run: `npm run dev`
   - Wait for dependencies to install (first time only)
   - Vite dev server will start

3. **View Your App**
   - Replit will show a preview pane
   - Click **"Open in new tab"** for full browser view
   - Your app URL: `https://your-repl-name.your-username.repl.co`

### Step 5: Update Backend CORS

1. **Go to Your Backend Service**
   - Render: Go to your service → Environment
   - Railway: Go to your service → Variables
   - Update CORS configuration

2. **Add Replit Domain**
   - Add to `ALLOWED_ORIGINS`:
     ```
     https://your-repl-name.your-username.repl.co
     ```
   - Or allow all Replit domains (less secure):
     ```
     https://*.repl.co
     ```

3. **Restart Backend**
   - Save environment variables
   - Restart your backend service

### Step 6: Test Your App

1. **Open Your App**
   - Visit your Replit URL in browser
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

## 🏗️ Production Deployment

### Option 1: Development Mode (Default)

**Runs Vite dev server with hot reload:**
- ✅ Fast development
- ✅ Hot module replacement
- ✅ Easy debugging
- ⚠️ Not optimized for production

**Command**: `npm run dev` (automatic when you click Run)

### Option 2: Production Mode

**Builds and serves optimized files:**
- ✅ Optimized bundle
- ✅ Faster load times
- ✅ Smaller file sizes
- ⚠️ Requires rebuild for changes

**Steps**:
1. Build: `npm run build`
2. Serve: `npm run start`

**Or use deploy command**:
```bash
npm install && npm run build && npm run start
```

## 📝 Environment Variables Checklist

- [ ] `VITE_API_BASE_URL` - Your backend API URL
- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

## 🔧 Troubleshooting

### Port Already in Use
- Replit automatically sets `PORT` environment variable
- Vite config uses `process.env.PORT`
- No action needed

### Environment Variables Not Working
1. Check Secrets are set in Replit Secrets tab
2. Restart repl after adding secrets
3. Verify variables start with `VITE_` prefix
4. Check browser console: `console.log(import.meta.env.VITE_API_BASE_URL)`

### CORS Errors
1. Update backend CORS to allow Replit domain
2. Check browser console for CORS errors
3. Verify backend URL is correct
4. Restart backend after updating CORS

### Build Errors
1. Run `npm install` first
2. Check for TypeScript errors
3. Verify all files are uploaded
4. Check `vite.config.ts` is correct

## 📚 Documentation

- **Full Guide**: [docs/REPLIT_DEPLOYMENT_GUIDE.md](./docs/REPLIT_DEPLOYMENT_GUIDE.md)
- **Quick Start**: [docs/REPLIT_QUICK_START.md](./docs/REPLIT_QUICK_START.md)
- **Backend Deployment**: [docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)

## 🆘 Need Help?

1. Check Replit logs in Shell
2. Check browser console for errors
3. Verify environment variables
4. Test API connection
5. Review full deployment guide

## ✅ Deployment Checklist

- [ ] Repl created and configured
- [ ] All files uploaded/imported
- [ ] Dependencies installed
- [ ] Environment variables set in Secrets
- [ ] Backend URL configured
- [ ] Backend CORS updated
- [ ] App runs successfully
- [ ] API requests work
- [ ] Authentication works
- [ ] Quiz flow works
- [ ] Production build works (optional)

---

**Ready to deploy?** Follow the steps above and you'll have your app running on Replit in minutes! 🚀

