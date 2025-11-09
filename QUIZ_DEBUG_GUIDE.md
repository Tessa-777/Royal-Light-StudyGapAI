# Quiz Debug Guide

## 🚨 Issue: Quiz Page Not Loading

If clicking "Take Diagnostic Quiz" doesn't load anything, follow these steps:

## 🔍 Step 1: Check Browser Console

Open browser console (F12) and look for:

### Expected Logs:
```
[QUIZ PAGE] Component mounted
[QUIZ PAGE] Is guest: true/false
[QUIZ PAGE] Questions loading: true
[QUIZ] Fetching questions from: http://localhost:5000/api/quiz/questions?total=30
[API] Request to http://localhost:5000/api/quiz/questions?total=30 without auth token (guest mode)
[API] Response from http://localhost:5000/api/quiz/questions?total=30: 200
[QUIZ] Questions received: 30 questions
[QUIZ PAGE] Questions loading: false
[QUIZ PAGE] Questions count: 30
```

### If No Logs Appear:
- Component is not mounting
- Check if route is working
- Check if there's a JavaScript error preventing component from loading

### If Error Logs Appear:
- Check the error message
- Check if backend is running
- Check if CORS is configured
- Check if endpoint exists

## 🔍 Step 2: Check Network Tab

1. Open DevTools → Network tab
2. Filter by "XHR" or "Fetch"
3. Look for `/api/quiz/questions?total=30`
4. Check:
   - Request URL
   - Request Method (GET)
   - Response Status
   - Response Data

### If Request is Missing:
- React Query is not triggering
- Check if component is mounting
- Check if hook is being called

### If Request Fails:
- Check error status code
- Check error message
- Check CORS headers
- Check backend logs

## 🔍 Step 3: Check Backend Logs

Look for:
```
127.0.0.1 - - [DATE] "GET /api/quiz/questions?total=30 HTTP/1.1" 200 -
```

### If No Logs:
- Backend is not receiving request
- Check if backend is running
- Check if endpoint exists
- Check if route is registered

### If Error Logs:
- Check error message
- Check backend code
- Check database connection
- Check if questions exist in database

## 🔍 Step 4: Verify Endpoint

Test the endpoint directly:

```bash
# Test quiz questions endpoint
curl http://localhost:5000/api/quiz/questions?total=30
```

Should return JSON array of questions.

## 🔍 Step 5: Check React Query

Verify React Query is working:

1. Check if `QueryClientProvider` is set up in `App.tsx`
2. Check if `useQuery` is being called
3. Check if query is enabled
4. Check if query key is correct

## 🛠️ Common Issues and Solutions

### Issue 1: Component Not Mounting

**Symptoms:**
- No console logs
- Page is blank
- No network requests

**Solution:**
- Check if route is correct in `App.tsx`
- Check if component is imported correctly
- Check for JavaScript errors in console
- Check if React Router is working

### Issue 2: Questions Not Loading

**Symptoms:**
- Component mounts
- Loading state shows
- But questions never load
- No error shown

**Solution:**
- Check if API endpoint is correct
- Check if backend is running
- Check if CORS is configured
- Check if questions exist in database
- Check React Query configuration

### Issue 3: CORS Error

**Symptoms:**
- Network error in console
- CORS error message
- Request blocked by browser

**Solution:**
- Check backend CORS configuration
- Ensure backend allows requests from frontend origin
- Check if CORS headers are present

### Issue 4: Backend Not Responding

**Symptoms:**
- Network request fails
- Timeout error
- 500 error

**Solution:**
- Check if backend is running
- Check backend logs for errors
- Check if endpoint exists
- Check if database is connected
- Check if questions exist in database

### Issue 5: Questions Empty

**Symptoms:**
- Request succeeds (200)
- But questions array is empty
- No questions shown

**Solution:**
- Check if questions exist in database
- Check if backend is returning questions
- Check if response format is correct
- Check if questions are being filtered out

## 🧪 Testing Steps

### Test 1: Component Mounting

1. Click "Take Diagnostic Quiz"
2. Check console for `[QUIZ PAGE] Component mounted`
3. If not present, check routing

### Test 2: API Request

1. Click "Take Diagnostic Quiz"
2. Check Network tab for `/api/quiz/questions?total=30`
3. Check request status
4. Check response data

### Test 3: Backend Response

1. Check backend logs for request
2. Check if response is sent
3. Check response status code
4. Check response data

### Test 4: Questions Display

1. Check if questions are received
2. Check if questions are displayed
3. Check if quiz interface is shown
4. Check if navigation works

## 📋 Checklist

- [ ] Component mounts (check console logs)
- [ ] API request is made (check Network tab)
- [ ] Backend receives request (check backend logs)
- [ ] Backend responds successfully (check response status)
- [ ] Questions are received (check console logs)
- [ ] Questions are displayed (check page)
- [ ] Quiz interface is shown (check UI)
- [ ] Navigation works (check buttons)

## 🆘 Still Having Issues?

1. Check browser console for errors
2. Check Network tab for failed requests
3. Check backend logs for errors
4. Check if backend is running
5. Check if CORS is configured
6. Check if endpoint exists
7. Check if questions exist in database
8. Check React Query configuration

---

**Last Updated:** 2025-11-09

