# How to Get a JWT Token for API Testing

## 🎯 Quick Answer

**Easiest Method:** Run the test user creation script:

```bash
python create_test_user_manual.py
```

This will:
1. Create a test user automatically
2. Sign in and get a JWT token
3. Display the token for you to copy

---

## 📋 All Methods (Choose One)

### Method 1: Use Test User Script (Recommended) ⭐

**Best for:** Quick testing, automated setup

```bash
# Make sure you have required packages
pip install supabase requests PyJWT

# Run the script
python create_test_user_manual.py
```

**Output:**
```
JWT Token: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Copy the token** and use it in your curl command:
```bash
curl -X GET http://localhost:5000/api/quiz/32e8cf30-fbc8-40a8-a9e1-1c27a66190c6/results \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsImtpZCI6IjFWNGphZm1YQlVFWG4xa2kiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3JhenhmcnV2bnRjZGR3YmZzeXVoLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2YmE5M2U1Yy01NWExLTQ1NmUtYjY0Mi1hY2QzODlhNzg3MmIiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYyNjUwMjkwLCJpYXQiOjE3NjI2NDY2OTAsImVtYWlsIjoidGVzdF8xNzYyNjQ2Njg3QGV4YW1wbGUuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IlRlc3QgVXNlciJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzYyNjQ2NjkwfV0sInNlc3Npb25faWQiOiI3MTVmOTgxMS0zZWQ1LTRjYmQtYWNhYy00MTkxNjNlY2ExNzkiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.QbbqI-g5nRiENBTu4eoIVgNVkeM9pIJut3-l6IpVEDw"
```

---

### Method 2: Use Frontend (If You Have It Running)

**Best for:** Testing with your actual user account

1. **Open your frontend** (usually `http://localhost:5173`)
2. **Log in** with your account
3. **Open browser console** (F12)
4. **Get token from localStorage:**
   ```javascript
   // For Supabase Auth
   const session = JSON.parse(localStorage.getItem('sb-<project-ref>-auth-token'));
   console.log(session.access_token);
   
   // OR if using Supabase client
   const { data: { session } } = await supabase.auth.getSession();
   console.log(session.access_token);
   ```
5. **Copy the token** and use it in curl

---

### Method 3: Create User via Supabase Dashboard

**Best for:** Manual user creation, testing specific users

1. **Go to Supabase Dashboard:**
   - Navigate to your project
   - Go to **Authentication** → **Users**
   - Click **"Add User"** → **"Create new user"**

2. **Create User:**
   - Email: `test@example.com` (or any email)
   - Password: `TestPassword123!`
   - **✅ Check "Auto Confirm User"** (important!)
   - Click **"Create user"**

3. **Get Token via Python Script:**
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

4. **Save as `get_token.py` and run:**
   ```bash
   python get_token.py
   ```

---

### Method 4: Use Existing User (If You Have One)

**Best for:** Testing with your existing account

If you already have a user account:

1. **Create a simple script `get_token.py`:**
   ```python
   from supabase import create_client
   import os
   from dotenv import load_dotenv
   
   load_dotenv()
   
   supabase = create_client(
       os.getenv("SUPABASE_URL"),
       os.getenv("SUPABASE_ANON_KEY")
   )
   
   # Sign in with your existing credentials
   response = supabase.auth.sign_in_with_password({
       "email": "your-email@example.com",  # Your email
       "password": "YourPassword123!"      # Your password
   })
   
   if response.session:
       token = response.session.access_token
       print(f"\n✅ Token: {token}\n")
       print("Use this token in your curl command:")
       print(f'curl -X GET http://localhost:5000/api/quiz/<quiz_id>/results \\')
       print(f'  -H "Authorization: Bearer {token}"')
   else:
       print("❌ Failed to get token. Check your credentials.")
   ```

2. **Run the script:**
   ```bash
   python get_token.py
   ```

---

## 🧪 Test the Token

After getting a token, test it:

### Option 1: Using PowerShell (Windows) ⭐

**PowerShell uses `Invoke-RestMethod` or `Invoke-WebRequest` (curl is an alias with different syntax):**

```powershell
# Replace <token> with your actual token
# Replace <quiz_id> with an actual quiz ID from your database

$token = "eyJhbGciOiJIUzI1NiIsImtpZCI6IjFWNGphZm1YQlVFWG4xa2kiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL3JhenhmcnV2bnRjZGR3YmZzeXVoLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2YmE5M2U1Yy01NWExLTQ1NmUtYjY0Mi1hY2QzODlhNzg3MmIiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzYyNjUwMjkwLCJpYXQiOjE3NjI2NDY2OTAsImVtYWlsIjoidGVzdF8xNzYyNjQ2Njg3QGV4YW1wbGUuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IlRlc3QgVXNlciJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6InBhc3N3b3JkIiwidGltZXN0YW1wIjoxNzYyNjQ2NjkwfV0sInNlc3Npb25faWQiOiI3MTVmOTgxMS0zZWQ1LTRjYmQtYWNhYy00MTkxNjNlY2ExNzkiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.QbbqI-g5nRiENBTu4eoIVgNVkeM9pIJut3-l6IpVEDw"
$quizId = "32e8cf30-fbc8-40a8-a9e1-1c27a66190c6"

# Method 1: Using Invoke-RestMethod (Recommended - returns JSON directly)
Invoke-RestMethod -Uri "http://localhost:5000/api/quiz/$quizId/results" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
  }

# Method 2: Using Invoke-WebRequest (Returns full response object)
$response = Invoke-WebRequest -Uri "http://localhost:5000/api/quiz/$quizId/results" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
  }
$response.Content | ConvertFrom-Json
```

### Option 2: Using curl.exe (Windows)

**Use `curl.exe` directly (not the PowerShell alias):**

```powershell
# Use curl.exe instead of curl
curl.exe -X GET "http://localhost:5000/api/quiz/32e8cf30-fbc8-40a8-a9e1-1c27a66190c6/results" `
  -H "Authorization: Bearer your-token-here" `
  -H "Content-Type: application/json"
```

### Option 3: Using Python (Cross-platform)

**Best for:** Detailed testing, easier debugging

```python
import requests

token = "your-token-here"
quiz_id = "32e8cf30-fbc8-40a8-a9e1-1c27a66190c6"

response = requests.get(
    f"http://localhost:5000/api/quiz/{quiz_id}/results",
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
)

print(response.json())
# Or pretty print:
import json
print(json.dumps(response.json(), indent=2))
```

### Option 4: Using Unix/Linux/Mac curl

```bash
# Replace <token> with your actual token
# Replace <quiz_id> with an actual quiz ID from your database

curl -X GET http://localhost:5000/api/quiz/32e8cf30-fbc8-40a8-a9e1-1c27a66190c6/results \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "quiz": {...},
  "responses": [...],
  "diagnostic": {
    "id": "...",
    "quiz_id": "...",
    "overall_performance": {...},
    "topic_breakdown": [...],
    "root_cause_analysis": {...},
    ...
  }
}
```

---

## 🔍 Troubleshooting

### "401 Unauthorized"
- **Check:** Token is valid and not expired
- **Fix:** Get a new token using one of the methods above

### "403 Forbidden"
- **Check:** Quiz belongs to the authenticated user
- **Fix:** Use a quiz ID that belongs to your user, or test with the same user who created the quiz

### "Token expired"
- **Check:** JWT tokens expire after some time (usually 1 hour)
- **Fix:** Get a new token

### "Invalid token"
- **Check:** Token format is correct (should start with `eyJ...`)
- **Fix:** Make sure you're using the full token, including the `Bearer ` prefix in the header

### "User not found"
- **Check:** User exists in Supabase `users` table
- **Fix:** The backend should auto-create users, but if not, create the user in the `users` table first

---

## 📝 Quick Reference

### Get Token (Method 1 - Easiest):
```bash
python create_test_user_manual.py
```

### Use Token in PowerShell (Windows):
```powershell
$token = "your-token-here"
$quizId = "your-quiz-id"

Invoke-RestMethod -Uri "http://localhost:5000/api/quiz/$quizId/results" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
  }
```

### Use Token in curl (Unix/Linux/Mac):
```bash
curl -X GET http://localhost:5000/api/quiz/<quiz_id>/results \
  -H "Authorization: Bearer <token>"
```

### Use Token with curl.exe (Windows):
```powershell
curl.exe -X GET "http://localhost:5000/api/quiz/<quiz_id>/results" `
  -H "Authorization: Bearer <token>"
```

### Use Token in Python:
```python
import requests

token = "your-token-here"
quiz_id = "32e8cf30-fbc8-40a8-a9e1-1c27a66190c6"

response = requests.get(
    f"http://localhost:5000/api/quiz/{quiz_id}/results",
    headers={
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
)

print(response.json())
```

---

## 🎯 Recommended Workflow

1. **Run the script:**
   ```bash
   python create_test_user_manual.py
   ```

2. **Copy the token** from the output

3. **Test the API:**
   
   **PowerShell (Windows):**
   ```powershell
   $token = "your-token-here"
   $quizId = "your-quiz-id"
   Invoke-RestMethod -Uri "http://localhost:5000/api/quiz/$quizId/results" `
     -Method GET `
     -Headers @{ "Authorization" = "Bearer $token" }
   ```
   
   **Unix/Linux/Mac:**
   ```bash
   curl -X GET http://localhost:5000/api/quiz/<quiz_id>/results \
     -H "Authorization: Bearer <token>"
   ```
   
   **Or use Python (cross-platform):**
   ```python
   import requests
   response = requests.get(
       f"http://localhost:5000/api/quiz/{quiz_id}/results",
       headers={"Authorization": f"Bearer {token}"}
   )
   print(response.json())
   ```

4. **Check the response** - you should see diagnostic data with all fields

---

**That's it!** You now have a JWT token to test your API endpoints. 🎉

