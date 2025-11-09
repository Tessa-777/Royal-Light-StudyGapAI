# Deployment Guide: StudyGapAI Frontend & Backend

This guide covers deploying the StudyGapAI frontend to Vercel and backend to Render, including environment configuration, CORS setup, and production communication.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Backend Deployment (Render)](#backend-deployment-render)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Environment Variables](#environment-variables)
5. [CORS Configuration](#cors-configuration)
6. [Testing Production Deployment](#testing-production-deployment)
7. [Troubleshooting](#troubleshooting)
8. [Domain & Custom URLs](#domain--custom-urls)

---

## Overview

### Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Vercel        │  HTTPS  │   Render        │  HTTPS  │   Supabase      │
│   (Frontend)    │────────▶│   (Backend API) │────────▶│   (Database)    │
│   React + Vite  │         │   Flask/Python  │         │   PostgreSQL    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### Why Not Localhost?

**❌ Cannot use `localhost` in production:**
- `localhost` refers to the user's local machine, not your server
- Browser security prevents accessing `localhost` from deployed websites
- Vercel (frontend) and Render (backend) are separate servers
- Need HTTPS endpoints for production communication

### Deployment Order

1. **Deploy Backend First** (Render) - Get the production API URL
2. **Deploy Frontend** (Vercel) - Point to the production backend URL

---

## Backend Deployment (Render)

### Prerequisites

- GitHub repository with backend code
- Render account ([render.com](https://render.com))
- Backend should be ready for production

### Step 1: Prepare Backend for Production

#### 1.1 Environment Variables
Create a `.env` file or document all required environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_service_role_key

# Flask
FLASK_ENV=production
SECRET_KEY=your-secret-key-here
FLASK_APP=app.py

# CORS (Important!)
ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://your-custom-domain.com

# API Keys
GEMINI_API_KEY=your-gemini-api-key
```

#### 1.2 CORS Configuration
Ensure your Flask backend allows requests from your Vercel domain:

```python
# app.py or __init__.py
from flask_cors import CORS

# Get allowed origins from environment variable
allowed_origins = os.getenv('ALLOWED_ORIGINS', '').split(',')

CORS(app, 
     origins=allowed_origins,
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization'])
```

#### 1.3 Production Requirements
Create `requirements.txt` if not already present:

```txt
flask==2.3.0
flask-cors==4.0.0
python-dotenv==1.0.0
psycopg2-binary==2.9.9
supabase==1.0.0
google-generativeai==0.3.0
# ... other dependencies
```

### Step 2: Deploy to Render

#### 2.1 Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your backend repository

#### 2.2 Configure Service

**Basic Settings:**
- **Name**: `studygapai-backend` (or your preferred name)
- **Region**: Choose closest to your users (e.g., `Oregon (US West)`)
- **Branch**: `main` (or your production branch)
- **Root Directory**: (leave empty if backend is in root)
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app` (or `python app.py` for development)

**Note:** For production, use `gunicorn`:
```bash
# Install gunicorn in requirements.txt
gunicorn==21.2.0

# Start command
gunicorn app:app --bind 0.0.0.0:$PORT
```

#### 2.3 Environment Variables

Click **"Environment"** tab and add:

| Key | Value | Description |
|-----|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Your Supabase database URL |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase project URL |
| `SUPABASE_KEY` | `eyJ...` | Supabase service role key |
| `FLASK_ENV` | `production` | Flask environment |
| `SECRET_KEY` | `your-secret-key` | Flask secret key |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | CORS allowed origins (comma-separated) |
| `GEMINI_API_KEY` | `your-key` | Google Gemini API key |
| `PORT` | `10000` | Render automatically sets this |

**Important:** Don't add `ALLOWED_ORIGINS` with your Vercel URL yet - we'll add it after frontend deployment.

#### 2.4 Deploy

1. Click **"Create Web Service"**
2. Wait for build to complete (5-10 minutes)
3. Note your service URL: `https://studygapai-backend.onrender.com`

#### 2.5 Test Backend

```bash
# Test health endpoint (if you have one)
curl https://studygapai-backend.onrender.com/health

# Test API endpoint
curl https://studygapai-backend.onrender.com/api/topics
```

### Step 3: Update CORS After Frontend Deployment

After deploying frontend to Vercel:

1. Go to Render Dashboard → Your Service → Environment
2. Update `ALLOWED_ORIGINS`:
   ```
   https://your-app.vercel.app,https://your-custom-domain.com
   ```
3. Save and redeploy (or restart service)

---

## Frontend Deployment (Vercel)

### Prerequisites

- GitHub repository with frontend code
- Vercel account ([vercel.com](https://vercel.com))
- Backend deployed and URL available

### Step 1: Prepare Frontend for Production

#### 1.1 Verify Environment Variables

Your code already uses environment variables:
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_SUPABASE_URL` - Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anon key

#### 1.2 Check Build Configuration

Verify `package.json` has build script:

```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

#### 1.3 Test Local Build

```bash
# Build locally to check for errors
npm run build

# Test production build
npm run preview
```

### Step 2: Deploy to Vercel

#### 2.1 Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Select your frontend repository

#### 2.2 Configure Project

**Framework Preset:**
- **Framework Preset**: `Vite`

**Root Directory:**
- Leave empty if frontend is in root
- Or specify subdirectory if frontend is in a subfolder

**Build and Output Settings:**
- **Build Command**: `npm run build` (default)
- **Output Directory**: `dist` (default for Vite)
- **Install Command**: `npm install` (default)

#### 2.3 Environment Variables

Click **"Environment Variables"** and add:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_API_BASE_URL` | `https://studygapai-backend.onrender.com/api` | Production, Preview, Development |
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | Production, Preview, Development |

**Important:**
- Use your **Render backend URL** (not localhost)
- Include `/api` at the end if your backend serves API under `/api`
- Set for **all environments** (Production, Preview, Development)

#### 2.4 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Note your deployment URL: `https://your-app.vercel.app`

### Step 3: Update Backend CORS

1. Go back to Render Dashboard
2. Update `ALLOWED_ORIGINS` environment variable:
   ```
   https://your-app.vercel.app
   ```
3. Save and restart service (or wait for auto-restart)

### Step 4: Verify Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Open browser DevTools → Network tab
3. Check API requests:
   - Should go to `https://studygapai-backend.onrender.com/api/...`
   - Should not show CORS errors
   - Should return 200 OK responses

---

## Environment Variables

### Frontend (Vercel)

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:5000/api` | `https://studygapai-backend.onrender.com/api` | Backend API URL |
| `VITE_SUPABASE_URL` | `https://xxx.supabase.co` | `https://xxx.supabase.co` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJ...` | `eyJ...` | Supabase anon key |

### Backend (Render)

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | Supabase database connection string |
| `SUPABASE_URL` | `https://xxx.supabase.co` | Supabase project URL |
| `SUPABASE_KEY` | `eyJ...` | Supabase service role key |
| `FLASK_ENV` | `production` | Flask environment |
| `SECRET_KEY` | `your-secret-key` | Flask secret key |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | CORS allowed origins (comma-separated) |
| `GEMINI_API_KEY` | `your-key` | Google Gemini API key |

---

## CORS Configuration

### Why CORS is Important

**CORS (Cross-Origin Resource Sharing)** allows your frontend (Vercel) to make requests to your backend (Render). Without proper CORS configuration, browsers will block API requests.

### Backend CORS Setup

#### Flask with flask-cors

```python
from flask import Flask
from flask_cors import CORS
import os

app = Flask(__name__)

# Get allowed origins from environment variable
allowed_origins = os.getenv('ALLOWED_ORIGINS', '').split(',')
# Filter out empty strings
allowed_origins = [origin.strip() for origin in allowed_origins if origin.strip()]

# Configure CORS
CORS(app,
     origins=allowed_origins,
     supports_credentials=True,
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
```

#### Environment Variable

In Render, set `ALLOWED_ORIGINS`:
```
https://your-app.vercel.app,https://your-custom-domain.com
```

**Multiple origins:** Separate with commas (no spaces around commas)

### Testing CORS

```bash
# Test CORS from command line
curl -H "Origin: https://your-app.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type,Authorization" \
     -X OPTIONS \
     https://studygapai-backend.onrender.com/api/users/me

# Should return CORS headers:
# Access-Control-Allow-Origin: https://your-app.vercel.app
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
# Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Testing Production Deployment

### 1. Frontend Tests

#### Test Authentication
- [ ] Register new user
- [ ] Login with existing user
- [ ] Logout
- [ ] Protected routes redirect to login

#### Test Quiz Flow
- [ ] Start diagnostic quiz (guest mode)
- [ ] Answer questions
- [ ] Submit quiz
- [ ] View diagnostic results
- [ ] Save diagnostic to account (after login)

#### Test Study Plan
- [ ] View study plan (if diagnostic completed)
- [ ] Navigate through weeks
- [ ] View resources

### 2. Backend Tests

#### Test API Endpoints
```bash
# Health check
curl https://studygapai-backend.onrender.com/health

# Get topics
curl https://studygapai-backend.onrender.com/api/topics

# Get resources
curl https://studygapai-backend.onrender.com/api/resources
```

#### Test with Authentication
```bash
# Register user
curl -X POST https://studygapai-backend.onrender.com/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'

# Login
curl -X POST https://studygapai-backend.onrender.com/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use token in subsequent requests
curl https://studygapai-backend.onrender.com/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Integration Tests

#### Test Full Flow
1. **Guest Mode:**
   - Open frontend URL
   - Take diagnostic quiz without login
   - Submit quiz
   - View results

2. **Authentication:**
   - Register new account
   - Login
   - View dashboard

3. **Authenticated Flow:**
   - Take diagnostic quiz (authenticated)
   - View diagnostic results
   - View study plan
   - Browse resources

### 4. Performance Tests

#### Check Load Times
- Frontend loads in < 3 seconds
- API responses in < 2 seconds
- Diagnostic analysis completes in < 30 seconds

#### Check Error Handling
- Network errors show user-friendly messages
- 401 errors redirect to login
- 403/404 errors handled gracefully
- Timeout errors retry automatically

---

## Troubleshooting

### Common Issues

#### 1. CORS Errors

**Error:**
```
Access to fetch at 'https://studygapai-backend.onrender.com/api/...' from origin 'https://your-app.vercel.app' has been blocked by CORS policy
```

**Solution:**
1. Check `ALLOWED_ORIGINS` in Render environment variables
2. Ensure your Vercel URL is included (exact match, including `https://`)
3. Restart Render service after updating CORS
4. Check backend CORS configuration allows your frontend origin

#### 2. API 404 Errors

**Error:**
```
GET https://studygapai-backend.onrender.com/api/topics 404
```

**Solution:**
1. Check backend URL in Vercel environment variables
2. Ensure backend is deployed and running
3. Check backend routes match frontend expectations
4. Verify API base URL includes `/api` if backend serves under `/api`

#### 3. Environment Variables Not Working

**Error:**
```
API calls going to localhost instead of production URL
```

**Solution:**
1. Check Vercel environment variables are set for Production
2. Ensure variables start with `VITE_` prefix
3. Redeploy after adding/updating environment variables
4. Check browser console for actual API URL being used

#### 4. Backend Timeout

**Error:**
```
Request timeout after 60 seconds
```

**Solution:**
1. Render free tier has request timeout limits
2. Consider upgrading to paid tier for longer timeouts
3. Optimize backend code for faster response
4. Implement request queuing for long-running operations

#### 5. Authentication Issues

**Error:**
```
401 Unauthorized even after login
```

**Solution:**
1. Check JWT token is being stored in localStorage
2. Verify token is sent in Authorization header
3. Check backend token validation
4. Ensure Supabase configuration is correct

### Debugging Steps

#### 1. Check Browser Console

Open DevTools → Console and look for:
- API request URLs
- Error messages
- CORS errors
- Network errors

#### 2. Check Network Tab

Open DevTools → Network:
- Check request URLs (should be Render URL, not localhost)
- Check response status codes
- Check response headers (CORS headers)
- Check request headers (Authorization token)

#### 3. Check Vercel Logs

1. Go to Vercel Dashboard
2. Select your project
3. Click "Deployments"
4. Click on latest deployment
5. Check "Build Logs" and "Runtime Logs"

#### 4. Check Render Logs

1. Go to Render Dashboard
2. Select your service
3. Click "Logs" tab
4. Check for errors, CORS issues, database connection issues

#### 5. Test API Directly

```bash
# Test backend is accessible
curl https://studygapai-backend.onrender.com/api/topics

# Test with CORS headers
curl -H "Origin: https://your-app.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://studygapai-backend.onrender.com/api/topics
```

---

## Domain & Custom URLs

### Custom Domain for Frontend (Vercel)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain (e.g., `studygapai.com`)
3. Follow DNS configuration instructions
4. Update `ALLOWED_ORIGINS` in Render to include custom domain

### Custom Domain for Backend (Render)

1. Go to Render Dashboard → Your Service → Settings → Custom Domain
2. Add your custom domain (e.g., `api.studygapai.com`)
3. Follow DNS configuration instructions
4. Update `VITE_API_BASE_URL` in Vercel to use custom domain

### Update CORS After Adding Custom Domain

1. Update `ALLOWED_ORIGINS` in Render:
   ```
   https://your-app.vercel.app,https://studygapai.com,https://www.studygapai.com
   ```
2. Restart Render service
3. Update `VITE_API_BASE_URL` in Vercel if backend has custom domain
4. Redeploy frontend

---

## Quick Reference

### Deployment Checklist

#### Backend (Render)
- [ ] Backend code pushed to GitHub
- [ ] Render service created
- [ ] Environment variables set
- [ ] Service deployed successfully
- [ ] Backend URL noted: `https://studygapai-backend.onrender.com`
- [ ] CORS configured (after frontend deployment)

#### Frontend (Vercel)
- [ ] Frontend code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables set:
  - [ ] `VITE_API_BASE_URL` = Render backend URL
  - [ ] `VITE_SUPABASE_URL` = Supabase URL
  - [ ] `VITE_SUPABASE_ANON_KEY` = Supabase anon key
- [ ] Frontend deployed successfully
- [ ] Frontend URL noted: `https://your-app.vercel.app`
- [ ] Backend CORS updated with Vercel URL

#### Testing
- [ ] Frontend loads correctly
- [ ] API requests go to Render (not localhost)
- [ ] No CORS errors in browser console
- [ ] Authentication works
- [ ] Quiz flow works
- [ ] Diagnostic results display
- [ ] Study plan displays

### Environment Variables Quick Copy

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

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Flask CORS Documentation](https://flask-cors.readthedocs.io/)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase Documentation](https://supabase.com/docs)

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Check Vercel deployment logs
3. Check Render service logs
4. Verify environment variables are set correctly
5. Test API endpoints directly with curl
6. Check CORS configuration

For backend-specific issues, check backend repository documentation.
For frontend-specific issues, check this repository's documentation.

