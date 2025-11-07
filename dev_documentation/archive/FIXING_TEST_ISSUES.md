# Fixing Test Issues - Quick Guide

## Issues Found

1. **Questions Endpoint 404**: Wrong URL path
2. **Diagnostic Endpoint 401**: Missing JWT token

## Solutions

### Issue 1: Questions Endpoint

The endpoint should be `/api/questions` (not `/api/quiz/questions`).

**Fixed in test script** ✅

### Issue 2: Authentication (JWT Token)

The diagnostic endpoint requires authentication. You have 3 options:

#### Option A: Get a Test Token (Recommended)

1. **Install Supabase package** (if not already installed):
   ```bash
   pip install supabase
   ```

2. **Run the token helper script**:
   ```bash
   python get_test_token.py
   ```

3. **Copy the token** and add it to `test_manual_api.py`:
   ```python
   JWT_TOKEN = "your_token_here"
   ```

4. **Run the test again**:
   ```bash
   python test_manual_api.py
   ```

#### Option B: Use Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Create a test user manually
3. Get the JWT token from the user session
4. Add it to `test_manual_api.py`

#### Option C: Temporarily Disable Auth (For Testing Only)

**⚠️ WARNING: Only for local testing, NOT for production!**

1. Open `backend/routes/ai.py`
2. Comment out `@require_auth` decorator on the `analyze_diagnostic` function:
   ```python
   # @require_auth  # Temporarily disabled for testing
   @validate_json(AnalyzeDiagnosticRequest)
   def analyze_diagnostic(current_user_id=None):
       # ...
   ```
3. Update function signature to make `current_user_id` optional
4. Run tests
5. **REMEMBER TO RE-ENABLE AUTH BEFORE COMMITTING!**

---

## Quick Test Steps

1. **Start Flask**:
   ```bash
   flask run
   ```

2. **Get token** (if using Option A):
   ```bash
   python get_test_token.py
   ```

3. **Add token to test script**:
   Edit `test_manual_api.py` and set `JWT_TOKEN = "your_token"`

4. **Run test**:
   ```bash
   python test_manual_api.py
   ```

---

## Expected Results

After fixing, you should see:

```
✅ Health check passed
✅ Questions endpoint works: 5 questions returned
✅ Diagnostic endpoint works
✅ All checks passed!
```

---

## Troubleshooting

### "Questions endpoint returned 404"

- Check that Flask is running
- Verify the route exists: `GET /api/questions`
- Check Flask logs for errors

### "UNAUTHORIZED: Missing or invalid JWT token"

- Make sure you have a valid JWT token
- Check that Supabase Auth is configured correctly
- Verify the token hasn't expired

### "Connection Error"

- Make sure Flask is running on `http://localhost:5000`
- Check firewall/antivirus settings
- Try `curl http://localhost:5000/health` manually

---

## Next Steps

Once all tests pass:

1. ✅ Test with real Gemini API (`AI_MOCK=false`)
2. ✅ Verify database storage
3. ✅ Test error cases
4. ✅ Move to frontend development

