# CORS Fix - Backend Configuration

## 🚨 Issue: CORS Error

**Error Message:**
```
CORS Missing Allow Origin
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at http://localhost:5000/api/users/me. (Reason: CORS header 'Access-Control-Allow-Origin' missing).
```

**Root Cause:**
- Frontend runs on `http://localhost:5173` (Vite dev server)
- Backend runs on `http://localhost:5000`
- Different origins = CORS required
- Backend is receiving OPTIONS requests but not returning proper CORS headers

---

## ✅ Solution: Fix Backend CORS Configuration

### Option 1: Use Flask-CORS (Recommended)

#### Step 1: Install Flask-CORS

```bash
pip install flask-cors
```

#### Step 2: Update Backend `app.py`

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000", "https://your-frontend-domain.vercel.app"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

# Or enable CORS for all routes (simpler)
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])
```

#### Step 3: Restart Backend

```bash
flask run
# or
python app.py
```

### Option 2: Manual CORS Headers (If not using Flask-CORS)

#### Update Backend `app.py`

```python
from flask import Flask, jsonify, request
from functools import wraps

app = Flask(__name__)

def add_cors_headers(response):
    """Add CORS headers to response"""
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response

@app.after_request
def after_request(response):
    """Add CORS headers to all responses"""
    return add_cors_headers(response)

@app.before_request
def handle_preflight():
    """Handle OPTIONS preflight requests"""
    if request.method == "OPTIONS":
        response = jsonify({})
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
        response.headers.add('Access-Control-Allow-Headers', "Content-Type,Authorization")
        response.headers.add('Access-Control-Allow-Methods', "GET,PUT,POST,DELETE,OPTIONS")
        response.headers.add('Access-Control-Allow-Credentials', "true")
        return response
```

### Option 3: Use Flask-CORS with Specific Configuration

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Configure CORS
CORS(app, 
     origins=["http://localhost:5173", "http://localhost:3000"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=True,
     expose_headers=["Content-Type", "Authorization"]
)
```

---

## 🧪 Test CORS Configuration

### Test 1: Check OPTIONS Request

```bash
# Test OPTIONS preflight request
curl -X OPTIONS http://localhost:5000/api/users/me \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  -v
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

### Test 2: Check Actual Request

```bash
# Test GET request with CORS
curl -X GET http://localhost:5000/api/users/me \
  -H "Origin: http://localhost:5173" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -v
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
```

---

## 🔧 Backend CORS Configuration Examples

### For Development (Local)

```python
CORS(app, origins=["http://localhost:5173"])
```

### For Production

```python
CORS(app, origins=[
    "https://your-frontend-domain.vercel.app",
    "https://studygapai-frontend.vercel.app"
])
```

### For Both Development and Production

```python
import os

allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://your-frontend-domain.vercel.app"
]

# Add environment-specific origins
if os.getenv("ENVIRONMENT") == "development":
    allowed_origins.append("http://localhost:5173")

CORS(app, origins=allowed_origins)
```

---

## 📋 CORS Headers Explained

### Required Headers:

1. **`Access-Control-Allow-Origin`**
   - Value: `http://localhost:5173` (frontend origin)
   - Allows requests from this origin

2. **`Access-Control-Allow-Methods`**
   - Value: `GET, POST, PUT, DELETE, OPTIONS`
   - Allows these HTTP methods

3. **`Access-Control-Allow-Headers`**
   - Value: `Content-Type, Authorization`
   - Allows these request headers

4. **`Access-Control-Allow-Credentials`**
   - Value: `true`
   - Allows cookies and credentials

### Optional Headers:

- **`Access-Control-Expose-Headers`** - Headers frontend can access
- **`Access-Control-Max-Age`** - How long preflight response is cached

---

## 🚀 Quick Fix Steps

### Step 1: Install Flask-CORS

```bash
cd backend
pip install flask-cors
```

### Step 2: Update `backend/app.py`

```python
from flask_cors import CORS

# Add after creating Flask app
CORS(app, origins=["http://localhost:5173"])
```

### Step 3: Restart Backend

```bash
flask run
```

### Step 4: Test

1. Try registration/login again
2. Check browser console - CORS errors should be gone
3. Check Network tab - Requests should succeed

---

## ✅ Verification

### Check Backend Logs:

After fixing CORS, you should see:
```
127.0.0.1 - - [08/Nov/2025 23:43:40] "OPTIONS /api/users/me HTTP/1.1" 200 -
127.0.0.1 - - [08/Nov/2025 23:43:40] "GET /api/users/me HTTP/1.1" 200 -
```

### Check Browser Console:

Should see:
```
[API] Request to /api/users/me with auth token
[API] Response from /api/users/me: 200
[AUTH] User profile received: {...}
```

### Check Network Tab:

- OPTIONS request: 200 OK
- GET/POST request: 200 OK (not blocked)
- Response headers include CORS headers

---

## 🔍 Troubleshooting

### Issue: Still Getting CORS Errors

**Check:**
1. Backend restarted after CORS changes?
2. CORS headers in response?
3. Origin matches allowed origins?
4. Backend running on correct port?

### Issue: OPTIONS Returns 200 but GET/POST Still Blocked

**Check:**
1. CORS headers in actual response (not just OPTIONS)
2. `Access-Control-Allow-Origin` header value
3. `Access-Control-Allow-Credentials` header
4. Browser console for specific CORS error

### Issue: CORS Works in Development but Not Production

**Check:**
1. Production backend CORS configuration
2. Frontend origin in production
3. Environment variables
4. Backend deployed with CORS enabled

---

## 📝 Backend Code Example

### Complete `app.py` Example:

```python
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS
CORS(app, 
     origins=["http://localhost:5173"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=True
)

# Your routes here
@app.route('/api/users/me', methods=['GET'])
def get_user():
    # Your code here
    return jsonify({}), 200
```

---

## 🎯 Next Steps

1. **Install Flask-CORS** in backend
2. **Update backend/app.py** with CORS configuration
3. **Restart backend**
4. **Test registration/login** again
5. **Verify CORS headers** in response

---

**Status:** ⚠️ **BACKEND FIX REQUIRED**
**Priority:** 🔴 **HIGH** - Blocks all API calls

