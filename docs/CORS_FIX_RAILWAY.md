# 🔧 Fix: CORS Error with Railway Backend

## Problem

You're getting this CORS error:
```
Cross-Origin Request Blocked: CORS header 'Access-Control-Allow-Origin' missing
```

**Frontend Origin**: `https://tessa-777.github.io`  
**Railway CORS_ORIGIN**: `https://tessa-777.github.io/Royal-Light-StudyGapAI/` ❌

## Root Cause

**CORS origins do NOT include the path!**

The browser sends the `Origin` header as:
```
https://tessa-777.github.io
```

It does NOT include:
- The path (`/Royal-Light-StudyGapAI/`)
- Trailing slashes
- Any subdirectories

CORS matching is **exact** - it only matches:
- Protocol (`https://`)
- Domain (`tessa-777.github.io`)
- Port (default 443 for HTTPS, omitted)

## ✅ Solution

### Step 1: Update Railway CORS_ORIGIN

1. Go to [Railway Dashboard](https://railway.app)
2. Click on your backend service
3. Go to **"Variables"** tab
4. Find `CORS_ORIGIN` (or `ALLOWED_ORIGINS`)
5. Update it to:

```
https://tessa-777.github.io
```

**Important**: 
- ✅ Use: `https://tessa-777.github.io`
- ❌ Don't use: `https://tessa-777.github.io/Royal-Light-StudyGapAI/`
- ❌ Don't use: `https://tessa-777.github.io/`
- ✅ No trailing slash
- ✅ No path

### Step 2: Restart Railway Service

After updating the variable:
1. Railway will automatically redeploy
2. Wait for deployment to complete (1-2 minutes)
3. Test your frontend again

### Step 3: Verify CORS is Working

1. Open your GitHub Pages app: `https://tessa-777.github.io/Royal-Light-StudyGapAI`
2. Open browser DevTools (F12)
3. Go to **Network** tab
4. Trigger an API call (e.g., take quiz)
5. Check the response headers - you should see:
   ```
   Access-Control-Allow-Origin: https://tessa-777.github.io
   ```

## 🔍 How CORS Works

### What the Browser Sends

When your frontend makes a request, the browser sends:
```
Origin: https://tessa-777.github.io
```

### What the Backend Must Return

The backend must respond with:
```
Access-Control-Allow-Origin: https://tessa-777.github.io
```

### Matching Rules

- ✅ Exact match: `https://tessa-777.github.io` = `https://tessa-777.github.io`
- ❌ No match: `https://tessa-777.github.io` ≠ `https://tessa-777.github.io/Royal-Light-StudyGapAI/`
- ❌ No match: `https://tessa-777.github.io` ≠ `https://tessa-777.github.io/`
- ❌ No match: `https://tessa-777.github.io` ≠ `http://tessa-777.github.io` (different protocol)

## 📝 Railway CORS Configuration

### Option 1: Single Origin

Set `CORS_ORIGIN` to:
```
https://tessa-777.github.io
```

### Option 2: Multiple Origins

If you need to allow multiple origins (e.g., for preview deployments):

Set `CORS_ORIGIN` to:
```
https://tessa-777.github.io,https://*.github.io
```

Or set `ALLOWED_ORIGINS` to:
```
https://tessa-777.github.io,https://*.github.io
```

### Option 3: All Origins (Development Only)

⚠️ **Only for development/testing**:
```
*
```

**Never use `*` in production!**

## 🐛 Common Mistakes

### Mistake 1: Including the Path

❌ **Wrong**:
```
CORS_ORIGIN=https://tessa-777.github.io/Royal-Light-StudyGapAI/
```

✅ **Correct**:
```
CORS_ORIGIN=https://tessa-777.github.io
```

### Mistake 2: Trailing Slash

❌ **Wrong**:
```
CORS_ORIGIN=https://tessa-777.github.io/
```

✅ **Correct**:
```
CORS_ORIGIN=https://tessa-777.github.io
```

### Mistake 3: Case Sensitivity

❌ **Wrong** (if your domain is lowercase):
```
CORS_ORIGIN=https://Tessa-777.github.io
```

✅ **Correct**:
```
CORS_ORIGIN=https://tessa-777.github.io
```

### Mistake 4: Wrong Protocol

❌ **Wrong**:
```
CORS_ORIGIN=http://tessa-777.github.io
```

✅ **Correct**:
```
CORS_ORIGIN=https://tessa-777.github.io
```

## 🔍 Debugging CORS

### Check What Origin the Browser Sends

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Make an API request
4. Click on the request
5. Check **Request Headers** → `Origin`

You should see:
```
Origin: https://tessa-777.github.io
```

### Check What the Backend Returns

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Make an API request
4. Click on the request
5. Check **Response Headers** → `Access-Control-Allow-Origin`

You should see:
```
Access-Control-Allow-Origin: https://tessa-777.github.io
```

### Test CORS with curl

```bash
curl -H "Origin: https://tessa-777.github.io" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS \
     https://royal-light-studygapai-backend-production.up.railway.app/api/quiz/questions
```

You should see:
```
Access-Control-Allow-Origin: https://tessa-777.github.io
```

## ✅ Quick Fix Checklist

- [ ] Railway `CORS_ORIGIN` set to `https://tessa-777.github.io` (no path, no trailing slash)
- [ ] Railway service restarted/redeployed
- [ ] Tested frontend - CORS errors gone
- [ ] Verified response headers include `Access-Control-Allow-Origin`
- [ ] API requests work correctly

## 🆘 Still Not Working?

If you've updated `CORS_ORIGIN` and it's still not working:

1. **Double-check the value**: Must be exactly `https://tessa-777.github.io`
2. **Check case**: Must match exactly (lowercase)
3. **Check for typos**: No extra spaces or characters
4. **Restart Railway**: Wait for deployment to complete
5. **Clear browser cache**: Hard refresh (Ctrl+Shift+R)
6. **Check backend logs**: Look for CORS-related errors
7. **Test with curl**: Verify backend returns correct CORS headers

## 📚 Additional Resources

- [MDN: CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Railway Documentation](https://docs.railway.app)
- [Flask-CORS Documentation](https://flask-cors.readthedocs.io/)

---

**Remember**: CORS origins are **exact matches** of protocol + domain + port. They do NOT include paths!

