# How to Get JWT Token for Testing Live Backend

## Quick Summary

Your test script needs a **JWT token from Supabase Auth** to test authenticated endpoints. The `SUPABASE_SERVICE_ROLE_KEY` only bypasses database RLS policies - it doesn't bypass Flask API authentication.

---

## Step-by-Step Guide

### Step 1: Make sure your `.env` has Supabase credentials

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here  # Optional but helpful
```

### Step 2: Get a JWT Token

You have two options:

#### Option A: Automated (Recommended)

```bash
python get_jwt_token.py
```

This script will:
- Try to sign in with test emails
- Create a new user if needed
- Get a JWT token
- Save it to `.test_token` file automatically

#### Option B: Manual (If Option A fails)

1. **Create user in Supabase Dashboard:**
   - Go to Supabase Dashboard → Authentication → Users
   - Click "Add User" → "Create new user"
   - Enter email (e.g., `test@studygapai.com`) and password
   - ✅ **Check "Auto Confirm User"** (important!)
   - Click "Create User"

2. **Run the manual script:**
   ```bash
   python get_jwt_token_manual.py
   ```
   - Enter the email and password you just created
   - Token will be saved to `.test_token` file

### Step 3: Verify Token is Saved

Check that `.test_token` file exists:
```bash
# Windows PowerShell
Get-Content .test_token

# Should show a long JWT token string
```

### Step 4: Verify Test Script is Using Live Backend

Check line 18 in `test_all_endpoints.py`:
```python
BASE_URL = os.getenv("BACKEND_URL", "https://studygapai-backend.onrender.com")
```

Or set it explicitly in `.env`:
```env
BACKEND_URL=https://studygapai-backend.onrender.com
```

### Step 5: Run Tests

```bash
python test_all_endpoints.py
```

The script will automatically:
- Load token from `.test_token` file
- Use it for all authenticated endpoints
- Test your live Render backend

---

## Troubleshooting

### ❌ "JWT_TOKEN not found" error

**Solution:** Make sure `.test_token` file exists:
```bash
python get_jwt_token.py
```

### ❌ Still getting 401 errors

**Check 1:** Verify token is valid
```bash
# Test token manually
curl -H "Authorization: Bearer $(Get-Content .test_token)" \
  https://studygapai-backend.onrender.com/api/users/me
```

**Check 2:** Token might be expired (JWT tokens expire after ~1 hour)
```bash
# Get a fresh token
python get_jwt_token.py
```

**Check 3:** Make sure user exists in Supabase `users` table
- The JWT token authenticates you, but your user must also exist in the `public.users` table
- If missing, the `/api/users/register` endpoint should create it automatically

### ❌ "Sign up failed" when running get_jwt_token.py

**Possible causes:**
1. Email auth not enabled in Supabase
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable "Email" provider

2. User already exists
   - Try a different email, or use `get_jwt_token_manual.py` to sign in

3. Email confirmation required
   - When creating user manually, check "Auto Confirm User"
   - Or use service role key method (see below)

### ✅ Using Service Role Key to Create User

If you have `SUPABASE_SERVICE_ROLE_KEY` set, the script will try to create users via Admin API (bypasses email confirmation):

```bash
# Make sure SUPABASE_SERVICE_ROLE_KEY is in .env
python get_jwt_token.py
```

---

## How It Works

1. **JWT Token** = Your identity (proves you're logged in)
2. **Flask `@require_auth` decorator** = Checks for valid JWT token in `Authorization: Bearer <token>` header
3. **Service Role Key** = Only used for database operations (bypasses RLS), NOT for API auth

---

## Quick Test

After getting token, test manually:

```bash
# Windows PowerShell
$token = Get-Content .test_token
$headers = @{
    "Authorization" = "Bearer $token"
}
Invoke-RestMethod -Uri "https://studygapai-backend.onrender.com/api/users/me" -Headers $headers
```

Should return user info instead of 401!

---

## Next Steps

Once you have a valid token:
1. ✅ Token saved to `.test_token`
2. ✅ `test_all_endpoints.py` will use it automatically
3. ✅ All authenticated endpoints will work
4. ✅ Test your live Render backend!

