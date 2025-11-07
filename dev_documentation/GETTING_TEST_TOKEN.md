# Getting a Test JWT Token - Guide

## Issue: Email Validation Failed

The `get_test_token.py` script failed because Supabase rejected the email format or requires email confirmation.

## Solutions (Choose One)

### Option 1: Disable Email Confirmation (Easiest for Testing)

1. Go to Supabase Dashboard
2. Navigate to **Authentication** → **Settings**
3. Scroll to **Email Auth** section
4. **Disable** "Enable email confirmations"
5. Save changes
6. Run `python get_test_token.py` again

### Option 2: Use Admin API (Recommended)

Use the admin script to create a user with auto-confirmed email:

```bash
python create_test_user_manual.py
```

This uses the SERVICE_ROLE_KEY to create a user with email already confirmed.

### Option 3: Create User via Supabase Dashboard

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **"Add User"** → **"Create new user"**
3. Enter:
   - Email: `test@example.com` (or any valid email)
   - Password: `TestPassword123!`
   - **Check "Auto Confirm User"** (important!)
4. Click **"Create user"**
5. Copy the user's **UUID** (not the token yet)

Then use this Python script to get a token:

```python
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY")
)

# Sign in with the user you created
response = supabase.auth.sign_in_with_password({
    "email": "test@example.com",
    "password": "TestPassword123!"
})

if response.session:
    token = response.session.access_token
    print(f"Token: {token}")
```

### Option 4: Use Your Real Email

1. Edit `get_test_token.py`
2. Change `TEST_EMAIL` to your real email address
3. Run the script
4. Check your email for confirmation link
5. Click the confirmation link
6. Run the script again to get the token

### Option 5: Temporarily Disable Auth (Testing Only)

**⚠️ WARNING: Only for local testing!**

1. Open `backend/routes/ai.py`
2. Find the `analyze_diagnostic` function (around line 37)
3. Comment out `@require_auth`:
   ```python
   # @require_auth  # Temporarily disabled for testing
   @validate_json(AnalyzeDiagnosticRequest)
   def analyze_diagnostic(current_user_id=None):  # Make parameter optional
   ```
4. Update function to handle `current_user_id=None`:
   ```python
   def analyze_diagnostic(current_user_id=None):
       if current_user_id is None:
           # Use a default test user ID for testing
           current_user_id = "test-user-id"
       # ... rest of function
   ```
5. Test your API
6. **REMEMBER TO RE-ENABLE AUTH BEFORE COMMITTING!**

---

## Quick Fix: Use Admin Script

The easiest solution is to use the admin script:

```bash
# Make sure you have requests installed
pip install requests

# Run the admin script
python create_test_user_manual.py
```

This will:
- Create a user with auto-confirmed email
- Sign in automatically
- Get the JWT token
- Display it for you to copy

---

## Verify Token Works

After getting a token, test it:

```bash
# Set the token in test_manual_api.py
# Then run:
python test_manual_api.py
```

You should see:
```
✅ Diagnostic endpoint works
✅ All checks passed!
```

---

## Troubleshooting

### "Invalid email format"
- Use a standard email format: `user@example.com`
- Avoid special characters or domains that might be blocked

### "Email confirmation required"
- Disable email confirmation in Supabase settings (Option 1)
- Or use the admin script (Option 2)
- Or check your email and confirm

### "User already exists"
- Try a different email address
- Or sign in instead of signing up

### "Invalid credentials"
- Make sure password meets requirements (8+ chars, uppercase, lowercase, number)
- Try resetting the password in Supabase Dashboard

---

## Recommended Approach

**For Development/Testing:**
1. Disable email confirmation (Option 1)
2. Use `get_test_token.py` to get tokens quickly

**For Production:**
- Keep email confirmation enabled
- Use proper authentication flow in frontend
- Never disable auth in production!

