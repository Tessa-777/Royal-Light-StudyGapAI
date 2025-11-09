# Backend CORS Fix - Quick Reference

## 🚨 Problem

**CORS Error:** Browser blocking API requests because backend is not returning CORS headers.

**Symptoms:**
- OPTIONS requests return 200
- GET/POST requests blocked by browser
- Error: "CORS header 'Access-Control-Allow-Origin' missing"

## ✅ Quick Fix

### Step 1: Install Flask-CORS

```bash
cd backend
pip install flask-cors
```

### Step 2: Update `backend/app.py`

Add this at the top (after importing Flask):

```python
from flask_cors import CORS
```

Add this after creating the Flask app:

```python
# Enable CORS for all routes
CORS(app, origins=["http://localhost:5173"])
```

### Step 3: Restart Backend

```bash
flask run
```

### Step 4: Test

Try registration/login again. CORS errors should be gone.

---

## 🔧 Complete Backend CORS Configuration

### For Development:

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
```

### For Production:

```python
CORS(app, 
     origins=[
         "http://localhost:5173",
         "https://your-frontend-domain.vercel.app"
     ],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"],
     supports_credentials=True
)
```

---

## 🧪 Verify CORS is Working

### Test in Browser Console:

After fixing CORS, registration/login should work and you should see:

```
[API] Request to /api/users/register with auth token
[API] Response from /api/users/register: 200
[AUTH] Backend sync successful: 200
```

### Test with curl:

```bash
curl -X OPTIONS http://localhost:5000/api/users/me \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: GET" \
  -v
```

Should return CORS headers in response.

---

## 📋 Checklist

- [ ] Flask-CORS installed
- [ ] CORS configured in `app.py`
- [ ] Backend restarted
- [ ] CORS headers in response
- [ ] API calls working
- [ ] No CORS errors in console

---

**This is a BACKEND fix - the frontend is working correctly!**

