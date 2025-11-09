# Authentication Issues - Fixes Applied

## ✅ Fixes Applied

### 1. Fixed Quiz Endpoints
- ✅ Updated endpoints to match backend routes
- ✅ Changed `/api/quiz/quiz/start` → `/api/quiz/start`
- ✅ Changed `/api/quiz/quiz/<id>/submit` → `/api/quiz/<id>/submit`
- ✅ Changed `/api/quiz/quiz/<id>/results` → `/api/quiz/<id>/results`

### 2. Added Comprehensive Logging
- ✅ Added `[AUTH]` logs for authentication flow
- ✅ Added `[API]` logs for API requests/responses
- ✅ Added `[REGISTER]` and `[LOGIN]` logs for page-level events
- ✅ All logs show in browser console

### 3. Improved Error Handling
- ✅ Better error messages for email confirmation
- ✅ Detailed error logging with status codes
- ✅ Handles 404 (user not found) gracefully
- ✅ Handles 401 (unauthorized) properly

### 4. Added Debug Utilities
- ✅ `window.checkJWTToken()` - Check JWT token
- ✅ `window.checkLocalStorage()` - Check localStorage
- ✅ `window.clearAuthStorage()` - Clear auth storage
- ✅ Available in browser console

### 5. Fixed Backend Sync Logic
- ✅ Syncs user to backend when session exists
- ✅ Stores pending registration when email confirmation required
- ✅ Syncs pending registration on login
- ✅ Auto-syncs user profile if missing

---

## 🔍 How to Debug Your Issues

### Issue 1: Backend API Not Called

**Check Console Logs:**
1. Open browser console (F12)
2. Look for `[AUTH]` and `[API]` logs
3. Check if you see:
   - `[AUTH] Syncing user data to backend...`
   - `[API] Request to /api/users/register with auth token`

**If logs are missing:**
- Email confirmation is required (no session = no API call)
- Check if `Session exists: false` in console

**Solution:**
1. Disable email confirmation in Supabase (see below)
2. Or wait for email confirmation, then login (will sync on login)

### Issue 2: Check JWT Token

**In Browser Console:**
```javascript
// Check JWT token
window.checkJWTToken()

// Or manually
localStorage.getItem('auth_token')
```

**In DevTools:**
1. Application tab → Local Storage
2. Look for `auth_token` key
3. Value should be a long JWT token string

### Issue 3: User Not in Backend Database

**Check:**
1. Browser console - Look for `[AUTH] Backend sync successful`
2. Network tab - Look for `/api/users/register` request
3. Backend logs - Check if request arrived

**If user not in database:**
1. Check if backend API was called (Network tab)
2. Check backend logs for errors
3. Check if email confirmation is blocking sync
4. Try logging in again (will sync on login)

### Issue 4: Email Not Confirmed Error

**Problem:** Supabase requires email confirmation by default.

**Solution 1: Disable Email Confirmation (Development)**

1. Go to **Supabase Dashboard**
2. **Authentication** → **Settings**
3. **Email Auth** section
4. **Disable "Enable email confirmations"**
5. **Save changes**
6. Try registration again

**Solution 2: Confirm Email (Production)**

1. Check email inbox for confirmation email
2. Click confirmation link
3. Email will be confirmed
4. Login will work
5. Backend sync will happen on login

**Solution 3: Manual Confirmation (Development)**

1. Go to **Supabase Dashboard**
2. **Authentication** → **Users**
3. Find your user
4. Click on user
5. **Confirm email** manually
6. Try login again

---

## 🚀 Quick Fix Steps

### Step 1: Disable Email Confirmation

1. Supabase Dashboard → Authentication → Settings
2. Disable "Enable email confirmations"
3. Save

### Step 2: Clear and Retry

```javascript
// In browser console
window.clearAuthStorage()
```

### Step 3: Register Again

1. Go to registration page
2. Fill form and submit
3. Watch console for logs
4. Check Network tab for API calls
5. Check backend logs

### Step 4: Verify

1. Check JWT token: `window.checkJWTToken()`
2. Check backend database: Supabase Table Editor → users
3. Check backend logs for API calls

---

## 📋 Expected Console Output

### Successful Registration (Email Confirmation Disabled):

```
[AUTH] Starting registration for: user@example.com
[AUTH] Supabase registration successful. Session exists: true
[AUTH] User: user@example.com
[AUTH] Storing JWT token in localStorage
[AUTH] JWT token stored: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
[AUTH] Syncing user data to backend...
[API] Request to /api/users/register with auth token
[API] Response from /api/users/register: 200
[AUTH] Backend sync successful: 200
[REGISTER] Registration successful, redirecting to dashboard...
```

### Registration with Email Confirmation:

```
[AUTH] Starting registration for: user@example.com
[AUTH] Supabase registration successful. Session exists: false
[AUTH] User: user@example.com
[AUTH] No session returned - email confirmation may be required
[AUTH] User will need to confirm email before backend sync can happen
[REGISTER] Email confirmation required. User data stored in pending_registration.
```

**Note:** Backend sync will happen AFTER email confirmation and login.

### Successful Login:

```
[AUTH] Starting login for: user@example.com
[AUTH] Supabase login successful. Session exists: true
[AUTH] User: user@example.com
[AUTH] Storing JWT token in localStorage
[AUTH] JWT token stored: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
[AUTH] Fetching user profile from backend...
[API] Request to /api/users/me with auth token
[API] Response from /api/users/me: 200 (or 404 if user doesn't exist)
[AUTH] User profile fetched: Success (or "Not found")
[AUTH] User profile not found in backend. Syncing...
[API] Request to /api/users/register with auth token
[API] Response from /api/users/register: 200
[AUTH] User profile synced to backend: 200
[LOGIN] Login successful, redirecting to dashboard...
```

---

## 🔧 Configuration

### Supabase Email Confirmation

**For Development:**
- **Disable** email confirmation
- Users can register and login immediately
- Backend sync happens immediately

**For Production:**
- **Enable** email confirmation
- Users must confirm email before login
- Backend sync happens on login (after email confirmation)

### Backend Endpoints

**Expected Endpoints:**
- `POST /api/users/register` - Should accept optional auth
- `GET /api/users/me` - Should require auth
- `POST /api/quiz/start` - Should require auth
- `GET /api/quiz/questions` - Should be public (no auth)

---

## 🧪 Testing Checklist

### Registration Test:

- [ ] Open browser console
- [ ] Go to registration page
- [ ] Fill form and submit
- [ ] Check console for `[AUTH]` logs
- [ ] Check console for `[API]` logs
- [ ] Check Network tab for `/api/users/register`
- [ ] Check JWT token stored: `window.checkJWTToken()`
- [ ] Check backend logs for API call
- [ ] Check Supabase users table for user
- [ ] Check backend users table for user

### Login Test:

- [ ] Open browser console
- [ ] Go to login page
- [ ] Fill form and submit
- [ ] Check console for `[AUTH]` logs
- [ ] Check console for `[API]` logs
- [ ] Check Network tab for `/api/users/me`
- [ ] Check JWT token stored: `window.checkJWTToken()`
- [ ] Check backend logs for API calls
- [ ] Verify user profile fetched
- [ ] Verify redirect to dashboard

---

## 🆘 Still Having Issues?

### Check These:

1. **Backend is running?**
   ```bash
   curl http://localhost:5000/api/users/me
   # Should return 401 (unauthorized) if backend is running
   ```

2. **Environment variables correct?**
   ```javascript
   console.log(import.meta.env.VITE_API_BASE_URL)
   console.log(import.meta.env.VITE_SUPABASE_URL)
   ```

3. **CORS configured?**
   - Backend should allow `http://localhost:5173`
   - Check backend CORS settings

4. **Supabase configured?**
   - Check Supabase URL and key
   - Check email confirmation settings
   - Check users in Supabase Dashboard

5. **Network issues?**
   - Check Network tab for failed requests
   - Check browser console for errors
   - Check backend logs for errors

---

## 📚 Documentation

- [TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md) - Detailed troubleshooting
- [DEBUG_STEPS.md](./DEBUG_STEPS.md) - Step-by-step debugging
- [AUTH_FIXES_SUMMARY.md](./AUTH_FIXES_SUMMARY.md) - Authentication implementation

---

**Status:** ✅ **FIXES APPLIED**
**Next Steps:** Test registration and login with console open to see logs

