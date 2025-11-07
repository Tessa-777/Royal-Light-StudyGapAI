# Gemini API Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: 400 Bad Request Error

**Error Message:**
```
AI service error: 400 Client Error: Bad Request for url: https://generativelanguage.googleapis.com/v1beta/models/...
```

**Possible Causes:**

1. **Invalid Model Name**
   - ❌ `gemini-2.5-flash` (doesn't exist)
   - ✅ `gemini-1.5-flash` (stable)
   - ✅ `gemini-1.5-pro` (more capable)
   - ✅ `gemini-2.0-flash-exp` (experimental)

2. **Invalid API Key**
   - Check your `GOOGLE_API_KEY` in `.env`
   - Make sure it's a valid Gemini API key
   - Get one from: https://aistudio.google.com/apikey

3. **Invalid Request Format**
   - The `responseSchema` format might be incorrect
   - Check if the schema matches Gemini's expected format

**Solution:**

1. **Update `.env` with correct model name:**
   ```env
   AI_MODEL_NAME=gemini-1.5-flash
   GOOGLE_API_KEY=your_actual_api_key
   AI_MOCK=false
   ```

2. **Restart Flask:**
   ```bash
   flask run
   ```

3. **Test again:**
   ```bash
   python test_manual_api.py
   ```

---

### Issue 2: Model Name Mismatch

**Problem:** Config says one model, but error shows different model.

**Check:**
1. Your `.env` file has `AI_MODEL_NAME=gemini-1.5-flash`
2. Restart Flask after changing `.env`
3. Check Flask logs to see what model is being used

---

### Issue 3: Structured Output Not Supported

**Error:** `responseSchema` not supported for this model

**Solution:**
- Use `gemini-1.5-flash` or `gemini-1.5-pro` (both support structured output)
- Avoid experimental models if they don't support structured output

---

### Issue 4: API Key Issues

**Error:** `401 Unauthorized` or `403 Forbidden`

**Solutions:**
1. **Check API Key:**
   - Go to https://aistudio.google.com/apikey
   - Create a new API key if needed
   - Copy it to `.env` as `GOOGLE_API_KEY=...`

2. **Check API Quota:**
   - Free tier has rate limits
   - Check your quota in Google AI Studio

3. **Verify Key Format:**
   - Should start with `AIza...`
   - No spaces or extra characters

---

### Issue 5: Rate Limiting

**Error:** `429 Too Many Requests` or `RESOURCE_EXHAUSTED`

**Solutions:**
1. **Wait and Retry:**
   - Free tier has rate limits
   - Wait a few minutes and try again

2. **Use Mock Mode for Testing:**
   ```env
   AI_MOCK=true
   ```
   - This uses mock data instead of real API
   - Perfect for development and testing

3. **Upgrade API Tier:**
   - If you need higher limits
   - Check Google AI Studio for pricing

---

## Recommended Configuration

**For Development (Mock Mode):**
```env
AI_MOCK=true
# No API key needed
```

**For Testing Real API:**
```env
AI_MOCK=false
GOOGLE_API_KEY=your_actual_key
AI_MODEL_NAME=gemini-1.5-flash
```

**For Production:**
```env
AI_MOCK=false
GOOGLE_API_KEY=your_production_key
AI_MODEL_NAME=gemini-1.5-flash
```

---

## Valid Model Names (2025)

| Model Name | Status | Structured Output | Notes |
|------------|--------|-------------------|-------|
| `gemini-1.5-flash` | ✅ Stable | ✅ Yes | Recommended |
| `gemini-1.5-pro` | ✅ Stable | ✅ Yes | More capable |
| `gemini-2.0-flash-exp` | ⚠️ Experimental | ✅ Yes | May have issues |
| `gemini-2.5-flash` | ❌ Doesn't exist | - | Don't use |

---

## Testing Steps

1. **Check Model Name:**
   ```bash
   # In your .env file
   AI_MODEL_NAME=gemini-1.5-flash
   ```

2. **Check API Key:**
   ```bash
   # In your .env file
   GOOGLE_API_KEY=AIzaSy...
   ```

3. **Restart Flask:**
   ```bash
   flask run
   ```

4. **Check Flask Logs:**
   - Look for error messages
   - Check what model is being used
   - Check API response details

5. **Test:**
   ```bash
   python test_manual_api.py
   ```

---

## Quick Fix

**If you're getting 400 errors, try this:**

1. **Set model to stable version:**
   ```env
   AI_MODEL_NAME=gemini-1.5-flash
   ```

2. **Or use mock mode:**
   ```env
   AI_MOCK=true
   ```

3. **Restart Flask and test again**

---

## Need More Help?

- Check Flask server logs for detailed error messages
- Verify your API key at https://aistudio.google.com/apikey
- Check Gemini API documentation: https://ai.google.dev/docs

