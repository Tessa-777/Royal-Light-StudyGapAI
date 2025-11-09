# Frontend-Backend Integration Fixes

## Issues Found and Fixed

### ✅ Issue 1: 404 Error on `/api/quiz/questions` - **FIXED**

**Problem:**
- Frontend was calling `/api/quiz/questions?total=30`
- Backend route was registered as `/api/questions` (wrong URL prefix)
- Result: 404 Not Found

**Root Cause:**
- Quiz blueprint was registered with prefix `/api` instead of `/api/quiz`
- Routes had `/quiz/` in their paths, creating double `/quiz/quiz/` in URLs

**Fix Applied:**
1. Changed blueprint registration in `backend/app.py`:
   ```python
   # Before:
   app.register_blueprint(quiz_bp, url_prefix="/api")
   
   # After:
   app.register_blueprint(quiz_bp, url_prefix="/api/quiz")
   ```

2. Removed `/quiz` prefix from route definitions in `backend/routes/quiz.py`:
   ```python
   # Before:
   @quiz_bp.post("/quiz/start")
   @quiz_bp.post("/quiz/<quiz_id>/submit")
   @quiz_bp.get("/quiz/<quiz_id>/results")
   
   # After:
   @quiz_bp.post("/start")           # Now: /api/quiz/start
   @quiz_bp.post("/<quiz_id>/submit") # Now: /api/quiz/<quiz_id>/submit
   @quiz_bp.get("/<quiz_id>/results") # Now: /api/quiz/<quiz_id>/results
   ```

**Result:**
- ✅ `/api/quiz/questions?total=30` now works
- ✅ `/api/quiz/start` now works
- ✅ `/api/quiz/<quiz_id>/submit` now works
- ✅ `/api/quiz/<quiz_id>/results` now works

---

### ⚠️ Issue 2: Login/Registration Not Working - **FRONTEND FIX NEEDED**

**Problem:**
- Registration says "successful" but login doesn't work
- User can't authenticate after registration

**Root Cause:**
The backend **does NOT handle authentication**. It expects the frontend to use **Supabase Auth SDK** for authentication. The backend endpoints (`/api/users/register` and `/api/users/login`) are only for **syncing user data**, not for authentication.

**How Authentication Should Work:**

1. **Registration Flow:**
   ```
   Frontend → Supabase Auth SDK → Get JWT Token
   Frontend → Backend /api/users/register → Sync user data
   ```

2. **Login Flow:**
   ```
   Frontend → Supabase Auth SDK → Get JWT Token
   Frontend → Backend /api/users/me → Get user profile
   ```

**What the Frontend Must Do:**

### Registration:
```typescript
import { supabase } from './services/auth';

// 1. Register with Supabase Auth SDK
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: { name: 'John Doe' }
  }
});

if (data.session) {
  // 2. Store JWT token
  localStorage.setItem('auth_token', data.session.access_token);
  
  // 3. Sync user data to backend
  await api.post('/api/users/register', {
    email: 'user@example.com',
    name: 'John Doe'
  }, {
    headers: {
      'Authorization': `Bearer ${data.session.access_token}`
    }
  });
}
```

### Login:
```typescript
import { supabase } from './services/auth';

// 1. Login with Supabase Auth SDK
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});

if (data.session) {
  // 2. Store JWT token
  localStorage.setItem('auth_token', data.session.access_token);
  
  // 3. Get user profile from backend
  const user = await api.get('/api/users/me', {
    headers: {
      'Authorization': `Bearer ${data.session.access_token}`
    }
  });
}
```

**Backend Endpoints Explained:**

1. **`POST /api/users/register`**:
   - **Purpose:** Sync user data to backend `users` table
   - **Auth:** Optional (can be called with or without JWT)
   - **What it does:** Creates/updates user record in database
   - **NOT for:** Creating Supabase Auth accounts

2. **`POST /api/users/login`**:
   - **Purpose:** Legacy endpoint (for backward compatibility)
   - **Auth:** Optional
   - **What it does:** Returns user info if JWT provided, or looks up by email
   - **NOT for:** Authenticating users (use Supabase Auth SDK instead)

3. **`GET /api/users/me`**:
   - **Purpose:** Get current authenticated user's profile
   - **Auth:** **REQUIRED** (JWT token in Authorization header)
   - **What it does:** Returns user profile from database

**Frontend Fix Required:**

The frontend must:
1. ✅ Use Supabase Auth SDK for registration/login
2. ✅ Store JWT token from Supabase in localStorage
3. ✅ Include JWT token in `Authorization: Bearer <token>` header for all authenticated requests
4. ✅ Call `/api/users/register` AFTER Supabase registration (to sync data)
5. ✅ Call `/api/users/me` AFTER Supabase login (to get user profile)

**Example Frontend Auth Service:**

```typescript
// src/services/auth.ts
import { createClient } from '@supabase/supabase-js';
import api from './api';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Register
export const register = async (email: string, password: string, name: string) => {
  // 1. Register with Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } }
  });
  
  if (error) throw error;
  
  if (data.session) {
    // 2. Store token
    localStorage.setItem('auth_token', data.session.access_token);
    
    // 3. Sync to backend
    await api.post('/api/users/register', {
      email,
      name
    });
  }
  
  return data;
};

// Login
export const login = async (email: string, password: string) => {
  // 1. Login with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  
  if (data.session) {
    // 2. Store token
    localStorage.setItem('auth_token', data.session.access_token);
    
    // 3. Get user profile from backend
    const user = await api.get('/api/users/me');
    return { user: user.data, session: data.session };
  }
  
  return data;
};

// Logout
export const logout = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem('auth_token');
};
```

---

## Summary

### ✅ Fixed (Backend):
- Quiz endpoint URLs now match frontend expectations
- `/api/quiz/questions` works
- `/api/quiz/start` works
- `/api/quiz/<quiz_id>/submit` works

### ⚠️ Needs Frontend Fix:
- Frontend must use Supabase Auth SDK for authentication
- Frontend must store JWT token from Supabase
- Frontend must include JWT token in API requests
- Backend endpoints are for data syncing, not authentication

---

## Testing

### Test Quiz Endpoint:
```bash
# Should return 200 OK with questions
curl http://localhost:5000/api/quiz/questions?total=30
```

### Test Authentication:
1. Register via Supabase Auth SDK (frontend)
2. Get JWT token from Supabase
3. Call `/api/users/me` with JWT token
4. Should return user profile

---

## Next Steps

1. ✅ Backend fixes applied - quiz endpoints work
2. ⚠️ Frontend must implement Supabase Auth SDK integration
3. ⚠️ Frontend must update API calls to use correct endpoints
4. ⚠️ Frontend must include JWT tokens in authenticated requests

---

**TL;DR:**
- ✅ Backend quiz endpoints fixed (404 resolved)
- ⚠️ Frontend must use Supabase Auth SDK for login/registration (backend doesn't handle auth)

