# Troubleshooting Guide - Authentication Issues

## 🔍 Issue 1: Backend API Not Called During Registration/Login

### How to Check:

1. **Open Browser DevTools** (F12)
2. **Go to Console tab** - Look for `[AUTH]` and `[API]` logs
3. **Go to Network tab** - Look for API calls to `/api/users/register` or `/api/users/me`

### Expected Behavior:

**During Registration:**
```
[AUTH] Starting registration for: user@example.com
[AUTH] Supabase registration successful. Session exists: true/false
[AUTH] Storing JWT token in localStorage
[AUTH] Syncing user data to backend...
[API] Request to /api/users/register with auth token
[API] Response from /api/users/register: 200
[AUTH] Backend sync successful: 200
```

**During Login:**
```
[AUTH] Starting login for: user@example.com
[AUTH] Supabase login successful. Session exists: true
[AUTH] Storing JWT token in localStorage
[AUTH] Fetching user profile from backend...
[API] Request to /api/users/me with auth token
[API] Response from /api/users/me: 200
```

### If API Calls Are Missing:

1. Check if Supabase session exists (look for "Session exists: false")
2. If session is false, email confirmation is required
3. Check browser console for errors
4. Check Network tab for failed requests

---

## 🔑 Issue 2: How to Check JWT Token Storage

### Method 1: Browser Console

Open browser console (F12) and run:

```javascript
// Check JWT token
window.checkJWTToken()

// Check all localStorage
window.checkLocalStorage()

// Clear auth storage (if needed)
window.clearAuthStorage()
```

### Method 2: Browser DevTools

1. **Open DevTools** (F12)
2. **Go to Application tab** (Chrome) or **Storage tab** (Firefox)
3. **Click on Local Storage** → `http://localhost:5173`
4. Look for:
   - `auth_token` - JWT token from Supabase
   - `user` - User object from Supabase
   - `pending_registration` - Pending registration data (if email confirmation required)

### Method 3: Console Commands

```javascript
// Check token
localStorage.getItem('auth_token')

// Check user
localStorage.getItem('user')

// Decode JWT token (basic)
const token = localStorage.getItem('auth_token');
const payload = JSON.parse(atob(token.split('.')[1]));
console.log(payload);
```

---

## 🗄️ Issue 3: User Not in Backend Database

### Problem:

User exists in Supabase Auth but not in backend `users` table.

### Root Cause:

1. **Email confirmation required** - Session is null, so backend sync never happens
2. **Backend API call failed** - Check backend logs for errors
3. **CORS issue** - Backend not allowing frontend requests
4. **Backend endpoint not working** - `/api/users/register` endpoint has issues

### Solution:

#### Step 1: Disable Email Confirmation (Development)

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Find **Email Auth** section
4. **Disable "Enable email confirmations"** (for development only)
5. Save changes

#### Step 2: Check Backend Logs

Look for:
- API call received: `POST /api/users/register`
- User creation success
- Any errors

#### Step 3: Manually Sync User

If user is in Supabase but not in backend, you can:

1. **Option A: Login again** - Login will sync user to backend
2. **Option B: Manually create user in backend** - Use backend API or database

#### Step 4: Check Backend Endpoint

Test backend endpoint directly:

```bash
# Test registration endpoint
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "phone": "+2341234567890"
  }'
```

---

## ✉️ Issue 4: Email Not Confirmed Error

### Problem:

Registration says "successful" but login says "email not confirmed".

### Root Cause:

Supabase requires email confirmation. When email confirmation is enabled:
- Registration succeeds but session is `null`
- User must confirm email before login works
- Backend sync cannot happen without session

### Solution:

#### Option 1: Disable Email Confirmation (Development)

1. Go to Supabase Dashboard
2. **Authentication** → **Settings** → **Email Auth**
3. **Disable "Enable email confirmations"**
4. Save changes
5. Try registration again

#### Option 2: Confirm Email (Production)

1. Check email inbox for confirmation email
2. Click confirmation link
3. Email will be confirmed
4. Login will work
5. Backend sync will happen on login

#### Option 3: Manual Email Confirmation (Development)

1. Go to Supabase Dashboard
2. **Authentication** → **Users**
3. Find user
4. Click on user
5. Manually confirm email

---

## 🔧 Debugging Steps

### Step 1: Check Console Logs

Open browser console and look for:
- `[AUTH]` logs - Authentication flow
- `[API]` logs - API calls
- Error messages

### Step 2: Check Network Tab

1. Open DevTools → Network tab
2. Filter by "XHR" or "Fetch"
3. Look for:
   - `/api/users/register` - Should appear during registration
   - `/api/users/me` - Should appear during login
   - Check request/response details

### Step 3: Check Backend Logs

Look for:
- Incoming requests
- User creation
- Errors

### Step 4: Check Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Check if user exists
3. Check if email is confirmed
4. Check user metadata

### Step 5: Check Backend Database

1. Go to Supabase Dashboard
2. Go to **Table Editor** → **users** table
3. Check if user exists
4. If not, user sync failed

---

## 🛠️ Quick Fixes

### Fix 1: Clear and Retry

```javascript
// In browser console
window.clearAuthStorage()
// Then try registration/login again
```

### Fix 2: Disable Email Confirmation

1. Supabase Dashboard → Authentication → Settings
2. Disable email confirmation
3. Retry registration

### Fix 3: Manually Confirm Email

1. Supabase Dashboard → Authentication → Users
2. Find user → Confirm email manually
3. Retry login

### Fix 4: Check Environment Variables

Make sure `.env` file has correct values:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SUPABASE_URL=https://razxfruvntcddwbfsyuh.supabase.co
VITE_SUPABASE_ANON_KEY=your_key_here
```

### Fix 5: Check Backend is Running

```bash
# Test backend
curl http://localhost:5000/api/users/me
# Should return 401 (unauthorized) if backend is running
```

---

## 📋 Checklist

### Registration Checklist:

- [ ] Supabase registration successful (check console)
- [ ] Session exists (check console logs)
- [ ] JWT token stored (check localStorage)
- [ ] Backend API called (check Network tab)
- [ ] Backend responds 200 (check Network tab)
- [ ] User created in backend database (check Supabase Table Editor)

### Login Checklist:

- [ ] Supabase login successful (check console)
- [ ] Session exists (check console logs)
- [ ] JWT token stored (check localStorage)
- [ ] Backend API called (check Network tab)
- [ ] User profile fetched (check console logs)
- [ ] User exists in backend database (check Supabase Table Editor)

---

## 🆘 Common Errors

### Error: "Email not confirmed"

**Solution:** Disable email confirmation in Supabase or confirm email manually

### Error: "Backend sync failed"

**Solution:** 
1. Check backend is running
2. Check backend logs for errors
3. Check CORS settings
4. Check API endpoint URL

### Error: "No session returned"

**Solution:** 
1. Email confirmation required
2. Disable email confirmation or confirm email
3. Retry registration/login

### Error: "401 Unauthorized"

**Solution:**
1. Check JWT token exists
2. Check token is valid
3. Check backend accepts token
4. Check token format (Bearer token)

---

## 📞 Still Having Issues?

1. Check browser console for errors
2. Check Network tab for failed requests
3. Check backend logs for errors
4. Check Supabase Dashboard for user status
5. Check environment variables
6. Check backend is running
7. Check CORS settings

---

## 🎯 Expected Flow

### Registration (Email Confirmation Disabled):

```
1. User fills registration form
2. Frontend calls signUp() → Supabase Auth SDK
3. Supabase creates account → Returns session
4. Frontend stores JWT token in localStorage
5. Frontend calls /api/users/register → Backend
6. Backend creates user in database
7. Frontend redirects to dashboard
```

### Registration (Email Confirmation Enabled):

```
1. User fills registration form
2. Frontend calls signUp() → Supabase Auth SDK
3. Supabase creates account → Returns user, NO session
4. Frontend stores pending_registration in localStorage
5. User confirms email (via email link)
6. User logs in → Session created
7. Frontend syncs user to backend on login
```

### Login:

```
1. User fills login form
2. Frontend calls signIn() → Supabase Auth SDK
3. Supabase authenticates → Returns session
4. Frontend stores JWT token in localStorage
5. Frontend calls /api/users/me → Backend
6. If user doesn't exist → Frontend calls /api/users/register
7. Backend creates user in database
8. Frontend redirects to dashboard
```

---

**Last Updated:** 2025-01-27

