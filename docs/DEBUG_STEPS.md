# Debug Steps - Authentication Issues

## 🚀 Quick Debug Commands

Open browser console (F12) and run these commands:

### Check JWT Token
```javascript
window.checkJWTToken()
```

### Check LocalStorage
```javascript
window.checkLocalStorage()
```

### Clear Auth Storage
```javascript
window.clearAuthStorage()
```

### Check API Base URL
```javascript
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)
```

### Check Supabase Config
```javascript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY)
```

---

## 📋 Step-by-Step Debugging

### Step 1: Check Environment Variables

1. Open browser console
2. Run: `console.log(import.meta.env)`
3. Check:
   - `VITE_API_BASE_URL` should be `http://localhost:5000/api`
   - `VITE_SUPABASE_URL` should be your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` should exist

### Step 2: Test Registration

1. Open browser console (keep it open)
2. Go to registration page
3. Fill form and submit
4. Watch console for:
   - `[AUTH] Starting registration for: ...`
   - `[AUTH] Supabase registration successful`
   - `[AUTH] Storing JWT token`
   - `[AUTH] Syncing user data to backend`
   - `[API] Request to /api/users/register`

### Step 3: Check Network Tab

1. Open DevTools → Network tab
2. Filter by "XHR"
3. Look for `/api/users/register`
4. Check:
   - Request URL
   - Request Method (POST)
   - Request Headers (Authorization header)
   - Response Status
   - Response Data

### Step 4: Check Backend Logs

Look for:
- `POST /api/users/register`
- Request body
- Response status
- Any errors

### Step 5: Check Supabase

1. Go to Supabase Dashboard
2. Authentication → Users
3. Check if user exists
4. Check if email is confirmed

### Step 6: Check Backend Database

1. Go to Supabase Dashboard
2. Table Editor → users
3. Check if user exists
4. If not, backend sync failed

---

## 🔍 Common Issues and Solutions

### Issue: "No API calls in Network tab"

**Possible Causes:**
1. Email confirmation required (no session = no API call)
2. Backend URL incorrect
3. CORS blocking requests
4. Backend not running

**Solution:**
1. Check console for `[AUTH]` logs
2. Check if session exists
3. Disable email confirmation
4. Check backend is running
5. Check CORS settings

### Issue: "JWT token not stored"

**Check:**
```javascript
localStorage.getItem('auth_token')
```

**If null:**
- Email confirmation required
- Supabase registration failed
- Check console for errors

### Issue: "User not in backend database"

**Check:**
1. Network tab - Did `/api/users/register` get called?
2. Backend logs - Did request arrive?
3. Backend response - Was it successful?
4. Console logs - Any errors?

**Solution:**
1. Disable email confirmation
2. Register again
3. Check backend logs
4. Manually sync user on login

---

## 🛠️ Quick Fix: Disable Email Confirmation

1. Go to Supabase Dashboard
2. Authentication → Settings
3. Email Auth section
4. **Disable "Enable email confirmations"**
5. Save changes
6. Try registration again

---

## 📊 Expected Console Output

### Successful Registration:

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

### Successful Login:

```
[AUTH] Starting login for: user@example.com
[AUTH] Supabase login successful. Session exists: true
[AUTH] User: user@example.com
[AUTH] Storing JWT token in localStorage
[AUTH] JWT token stored: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
[AUTH] Fetching user profile from backend...
[API] Request to /api/users/me with auth token
[API] Response from /api/users/me: 200
[AUTH] User profile fetched: Success
[LOGIN] Login successful, redirecting to dashboard...
```

---

**Use these debug steps to identify and fix authentication issues!**

