# Deployment Checklist

Quick reference checklist for deploying StudyGapAI to production.

## 🚀 Pre-Deployment

### Backend Preparation
- [ ] Backend code is production-ready
- [ ] All environment variables documented
- [ ] CORS configuration allows frontend origins
- [ ] Database migrations completed
- [ ] API endpoints tested locally
- [ ] Error handling implemented
- [ ] Logging configured

### Frontend Preparation
- [ ] Frontend builds without errors (`npm run build`)
- [ ] All environment variables documented
- [ ] API endpoints use environment variables (not hardcoded)
- [ ] Error handling for network failures
- [ ] Loading states implemented
- [ ] Production build tested locally (`npm run preview`)

---

## 📦 Backend Deployment (Render)

### Step 1: Create Render Service
- [ ] Created Render account
- [ ] Connected GitHub repository
- [ ] Created new Web Service
- [ ] Selected correct repository and branch
- [ ] Set runtime to Python 3

### Step 2: Configure Service
- [ ] Set build command: `pip install -r requirements.txt`
- [ ] Set start command: `gunicorn app:app --bind 0.0.0.0:$PORT`
- [ ] Set root directory (if needed)
- [ ] Selected region (closest to users)

### Step 3: Environment Variables
- [ ] `DATABASE_URL` - Supabase database connection string
- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_KEY` - Supabase service role key
- [ ] `FLASK_ENV` - Set to `production`
- [ ] `SECRET_KEY` - Flask secret key (generate new for production)
- [ ] `GEMINI_API_KEY` - Google Gemini API key
- [ ] `ALLOWED_ORIGINS` - Leave empty for now (will add after frontend deployment)
- [ ] `PORT` - Render sets this automatically

### Step 4: Deploy
- [ ] Clicked "Create Web Service"
- [ ] Build completed successfully
- [ ] Service is running
- [ ] Backend URL noted: `https://studygapai-backend.onrender.com`
- [ ] Tested backend endpoint: `curl https://studygapai-backend.onrender.com/api/topics`

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Create Vercel Project
- [ ] Created Vercel account
- [ ] Connected GitHub repository
- [ ] Imported frontend repository
- [ ] Set framework preset to Vite

### Step 2: Configure Project
- [ ] Build command: `npm run build` (default)
- [ ] Output directory: `dist` (default)
- [ ] Install command: `npm install` (default)
- [ ] Root directory: (leave empty or set if needed)

### Step 3: Environment Variables
- [ ] `VITE_API_BASE_URL` - `https://studygapai-backend.onrender.com/api`
- [ ] `VITE_SUPABASE_URL` - Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Supabase anon key
- [ ] Set for all environments: Production, Preview, Development

### Step 4: Deploy
- [ ] Clicked "Deploy"
- [ ] Build completed successfully
- [ ] Deployment is live
- [ ] Frontend URL noted: `https://your-app.vercel.app`

---

## 🔗 Post-Deployment Configuration

### Update Backend CORS
- [ ] Went to Render Dashboard → Service → Environment
- [ ] Updated `ALLOWED_ORIGINS`: `https://your-app.vercel.app`
- [ ] Saved environment variables
- [ ] Restarted service (or waited for auto-restart)

### Verify Deployment
- [ ] Frontend loads at Vercel URL
- [ ] No console errors in browser
- [ ] API requests go to Render URL (not localhost)
- [ ] No CORS errors in browser console
- [ ] Authentication works
- [ ] Quiz flow works
- [ ] Diagnostic results display
- [ ] Study plan displays

---

## 🧪 Testing Checklist

### Frontend Tests
- [ ] Landing page loads
- [ ] Navigation works
- [ ] Register new user
- [ ] Login with existing user
- [ ] Logout
- [ ] Protected routes redirect to login
- [ ] Guest mode: Take quiz without login
- [ ] Guest mode: View results
- [ ] Authenticated: Take quiz
- [ ] Authenticated: View diagnostic results
- [ ] Authenticated: View study plan
- [ ] Authenticated: Browse resources
- [ ] Dashboard displays correctly
- [ ] Error messages display correctly

### Backend Tests
- [ ] Health endpoint works (if available)
- [ ] Get topics: `GET /api/topics`
- [ ] Get resources: `GET /api/resources`
- [ ] Register user: `POST /api/users/register`
- [ ] Login user: `POST /api/users/login`
- [ ] Get user profile: `GET /api/users/me` (with auth)
- [ ] Start quiz: `POST /api/quiz/start` (with auth)
- [ ] Submit quiz: `POST /api/quiz/{id}/submit` (with auth)
- [ ] Get quiz results: `GET /api/quiz/{id}/results` (with auth)
- [ ] Analyze diagnostic: `POST /api/ai/analyze-diagnostic`

### Integration Tests
- [ ] Full guest quiz flow
- [ ] Full authenticated quiz flow
- [ ] Save guest diagnostic after registration
- [ ] Study plan generation
- [ ] Resource browsing
- [ ] Progress tracking (if implemented)

### Performance Tests
- [ ] Frontend loads in < 3 seconds
- [ ] API responses in < 2 seconds
- [ ] Diagnostic analysis completes in < 30 seconds
- [ ] No memory leaks
- [ ] No excessive API calls

### Error Handling Tests
- [ ] Network errors show user-friendly messages
- [ ] 401 errors redirect to login
- [ ] 403 errors handled gracefully
- [ ] 404 errors handled gracefully
- [ ] 500 errors show error message
- [ ] Timeout errors retry automatically
- [ ] CORS errors don't crash app

---

## 🔍 Troubleshooting Checklist

### If CORS Errors Occur
- [ ] Check `ALLOWED_ORIGINS` in Render includes Vercel URL
- [ ] Ensure URL is exact match (including `https://`)
- [ ] Restart Render service after updating CORS
- [ ] Check backend CORS configuration
- [ ] Test CORS with curl command

### If API 404 Errors Occur
- [ ] Check `VITE_API_BASE_URL` in Vercel is correct
- [ ] Ensure backend is deployed and running
- [ ] Check backend routes match frontend expectations
- [ ] Verify API base URL includes `/api` if needed
- [ ] Test API endpoint directly with curl

### If Environment Variables Not Working
- [ ] Check variables are set for Production environment
- [ ] Ensure variables start with `VITE_` prefix
- [ ] Redeploy after adding/updating variables
- [ ] Check browser console for actual API URL
- [ ] Verify variables are not in `.env.local` (should be in Vercel)

### If Authentication Fails
- [ ] Check JWT token is stored in localStorage
- [ ] Verify token is sent in Authorization header
- [ ] Check backend token validation
- [ ] Verify Supabase configuration
- [ ] Check Supabase environment variables

### If Backend Timeout
- [ ] Check Render service logs
- [ ] Verify backend is processing requests
- [ ] Check for long-running operations
- [ ] Consider upgrading Render plan
- [ ] Optimize backend code

---

## 📝 Quick Reference

### Backend URL (Render)
```
https://studygapai-backend.onrender.com
```

### Frontend URL (Vercel)
```
https://your-app.vercel.app
```

### Environment Variables

#### Vercel (Frontend)
```env
VITE_API_BASE_URL=https://studygapai-backend.onrender.com/api
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

#### Render (Backend)
```env
DATABASE_URL=postgresql://...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJ...
FLASK_ENV=production
SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=https://your-app.vercel.app
GEMINI_API_KEY=your-key
```

### Test Commands

#### Test Backend
```bash
# Health check
curl https://studygapai-backend.onrender.com/health

# Get topics
curl https://studygapai-backend.onrender.com/api/topics

# Test CORS
curl -H "Origin: https://your-app.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://studygapai-backend.onrender.com/api/topics
```

#### Test Frontend
```bash
# Open in browser
open https://your-app.vercel.app

# Check network requests in browser DevTools
# - Should see requests to Render URL
# - Should not see localhost
# - Should not see CORS errors
```

---

## 📚 Documentation

- [Full Deployment Guide](./DEPLOYMENT_GUIDE.md) - Detailed deployment instructions
- [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md) - Common issues and solutions
- [Project Summary](./PROJECT_SUMMARY.md) - Project overview and architecture

---

## 🆘 Support

If you encounter issues:

1. Check browser console for errors
2. Check Vercel deployment logs
3. Check Render service logs
4. Verify environment variables
5. Test API endpoints directly
6. Check CORS configuration

For detailed troubleshooting, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

