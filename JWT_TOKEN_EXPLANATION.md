# Why Users in Table ≠ JWT Tokens

## The Confusion

You're seeing users in your `users` table and wondering why JWT authentication doesn't work. Here's the key distinction:

## Two Separate Systems

### 1. **Users Table** (`public.users`)
- Created by your backend `/api/users/register` endpoint
- Can be created **WITHOUT** Supabase Auth
- Just database records
- **Does NOT give you a JWT token**

### 2. **Supabase Auth** (`auth.users`)
- Separate system managed by Supabase
- Issues JWT tokens when users sign up/login
- **This is what your Flask API checks for authentication**

## What Happened During Testing

When you ran `test_all_endpoints.py` or other tests:

1. **`/api/users/register` endpoint** created users in `public.users` table
   - This endpoint has a fallback that creates users **without requiring authentication**
   - See `backend/routes/users.py` lines 42-47: "Fallback: create user without auth"
   - These users exist in your database but **don't have JWT tokens**

2. **No Supabase Auth accounts were created**
   - The register endpoint doesn't create Supabase Auth accounts
   - Without Supabase Auth accounts, there are no JWT tokens

## Why JWT Authentication Fails

Your Flask API's `@require_auth` decorator checks for a **valid JWT token** from Supabase Auth:

```python
# backend/utils/auth.py
def require_auth(f):
    def decorated_function(*args, **kwargs):
        user_id = get_current_user_id()  # Extracts user_id from JWT token
        if not user_id:
            return jsonify({"error": "unauthorized"}), 401
        # ...
```

**The problem:**
- Users in `public.users` table ≠ Users in `auth.users` (Supabase Auth)
- No Supabase Auth account = No JWT token
- No JWT token = 401 Unauthorized

## Solution: Get a Real JWT Token

You need to create a user **via Supabase Auth** (not just the register endpoint):

### Option 1: Use `get_jwt_token.py` (Recommended)

```bash
python get_jwt_token.py
```

This will:
1. Create a user in **Supabase Auth** (not just the table)
2. Get a JWT token from Supabase Auth
3. Save it to `.test_token` file
4. Your test script will use this token

### Option 2: Manual Creation

1. **Create user in Supabase Dashboard:**
   - Go to Authentication → Users → Add User
   - Enter email/password
   - ✅ Check "Auto Confirm User"
   - This creates both:
     - `auth.users` account (Supabase Auth) ← **This gives you JWT tokens**
     - `public.users` record (via trigger) ← This is just data

2. **Get token:**
   ```bash
   python get_jwt_token_manual.py
   ```

## The Flow

### ❌ What Happened (No JWT):
```
Test Script → /api/users/register → Creates user in public.users table
                                 → No Supabase Auth account
                                 → No JWT token
                                 → 401 when trying authenticated endpoints
```

### ✅ What Should Happen (With JWT):
```
get_jwt_token.py → Creates user in Supabase Auth → Gets JWT token
                → Saves to .test_token file
                → Test script uses token
                → ✅ Authenticated endpoints work
```

## Quick Check

To verify if your users have Supabase Auth accounts:

1. **Check Supabase Dashboard:**
   - Go to Authentication → Users
   - See if any users exist there
   - If empty, that's why JWT auth fails!

2. **Check your `.test_token` file:**
   ```bash
   # Windows PowerShell
   Get-Content .test_token
   ```
   - If file doesn't exist or is empty, you need to get a token

## Summary

- **Users in `public.users` table** = Database records (no JWT tokens)
- **Users in `auth.users` (Supabase Auth)** = Can get JWT tokens
- **JWT Token** = Required for Flask API authentication
- **Solution** = Run `python get_jwt_token.py` to create Auth account and get token

