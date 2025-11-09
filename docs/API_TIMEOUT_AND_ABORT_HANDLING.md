# API Timeout and Abort Error Handling

## Overview

This document describes the implementation of 408 Request Timeout handling with retry logic and abort error monitoring in the frontend.

---

## Implementation Summary

### 1. API Interceptor Retry Logic (`src/services/api.ts`)

#### Features:
- **408 Request Timeout Handling**: Automatically retries requests that return 408 status
- **Exponential Backoff**: Retries use exponential backoff (1s, 2s, 4s delays)
- **Max Retries**: Up to 3 retries for timeout and other retryable errors
- **Abort Error Detection**: Detects and logs abort errors without retrying
- **Comprehensive Logging**: Logs all retry attempts and abort errors for monitoring

#### Retryable Status Codes:
- `408` - Request Timeout
- `429` - Too Many Requests (Rate Limit)
- `500` - Internal Server Error
- `502` - Bad Gateway
- `503` - Service Unavailable
- `504` - Gateway Timeout

#### Retry Configuration:
```typescript
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];
```

#### Retry Delay Calculation:
- Attempt 1: 1 second delay
- Attempt 2: 2 seconds delay
- Attempt 3: 4 seconds delay
- Total max wait: ~7 seconds (if all retries fail)

---

### 2. Abort Error Detection

#### Abort Error Detection:
The API interceptor detects abort errors by checking:
- `error.code === 'ECONNABORTED'`
- `error.message === 'canceled'`
- `error.message.toLowerCase().includes('abort')`
- `error.config?.signal?.aborted === true`

#### Abort Error Logging:
When an abort error is detected, the following information is logged:
```typescript
{
  url: string,
  method: string,
  code: string,
  message: string,
  timestamp: ISO string
}
```

**Important**: Aborted requests are **not retried** - they are logged and rejected immediately.

---

### 3. React Query Configuration (`src/App.tsx`)

#### Query Retry Logic:
- **408 Timeout**: Don't retry (handled by API interceptor)
- **401, 403, 404**: Don't retry (user/auth errors)
- **Other Errors**: Retry up to 3 times with exponential backoff

#### Mutation Retry Logic:
- **408 Timeout**: Don't retry (handled by API interceptor)
- **400, 401, 403, 404**: Don't retry (client errors)
- **Server Errors (500, 502, 503, 504)**: Retry up to 2 times

---

### 4. Component-Level Error Handling

#### Quiz Submission (`src/pages/QuizPage.tsx`):
- Detects timeout errors (`error?.isTimeout || error?.response?.status === 408`)
- Provides user-friendly message with options:
  - Retry submission
  - Save progress for later
- Saves quiz data to localStorage if user chooses to try later

---

## Testing

### Test 408 Request Timeout Handling:

1. **Simulate 408 Response from Backend**:
   ```bash
   # Backend should return 408 status for testing
   # Frontend will automatically retry up to 3 times
   ```

2. **Monitor Console Logs**:
   ```javascript
   // Expected logs:
   [API] 408 error - Retrying request (attempt 1/3) { url: ..., status: 408, retryCount: 1, delayMs: 1000 }
   [API] 408 error - Retrying request (attempt 2/3) { url: ..., status: 408, retryCount: 2, delayMs: 2000 }
   [API] 408 error - Retrying request (attempt 3/3) { url: ..., status: 408, retryCount: 3, delayMs: 4000 }
   [API] Request failed after 3 retries: { url: ..., status: 408 }
   ```

3. **Test Abort Errors**:
   ```javascript
   // Create an AbortController and abort the request
   const controller = new AbortController();
   const request = api.get('/endpoint', { signal: controller.signal });
   controller.abort();
   
   // Expected log:
   [API] Request was aborted: { url: '/endpoint', method: 'get', code: 'ECONNABORTED', message: 'canceled', timestamp: '...' }
   ```

### Test Real API Call that Gets Aborted:

1. **Manual Abort Test**:
   ```typescript
   // In browser console or test file
   const controller = new AbortController();
   const timeout = setTimeout(() => controller.abort(), 5000); // Abort after 5 seconds
   
   api.get('/api/quiz/questions?total=5', { signal: controller.signal })
     .then(response => {
       clearTimeout(timeout);
       console.log('Success:', response);
     })
     .catch(error => {
       clearTimeout(timeout);
       console.log('Abort error detected:', error);
       // Should see abort error in console logs
     });
   ```

2. **Monitor Abort Error Logs**:
   - Open browser DevTools Console
   - Look for `[API] Request was aborted:` logs
   - Check that abort errors are not retried
   - Verify timestamp and request details are logged

---

## Monitoring

### Console Logs to Monitor:

1. **Retry Attempts**:
   ```
   [API] 408 error - Retrying request (attempt X/3)
   ```

2. **Abort Errors**:
   ```
   [API] Request was aborted: { url, method, code, message, timestamp }
   ```

3. **Final Failure**:
   ```
   [API] Request failed after 3 retries: { url, status }
   ```

4. **Timeout Error (User-Facing)**:
   ```
   [QUIZ PAGE] Request timeout - quiz submission took too long
   ```

### What to Look For:

- **Abort Error Frequency**: How often are requests aborted?
- **Timeout Frequency**: How often do requests timeout (408)?
- **Retry Success Rate**: Do retries succeed or fail?
- **User Impact**: Are users seeing timeout errors in the UI?

---

## Error Messages

### User-Facing Error Messages:

1. **408 Timeout (After Retries)**:
   ```
   Request timed out. The server took too long to respond. Please try again.
   ```

2. **Quiz Submission Timeout**:
   ```
   The quiz submission is taking longer than expected. This might be because the AI analysis is processing.

   Your quiz data has been saved. Would you like to:
   1. Try submitting again
   2. Save your progress and try later
   ```

---

## Configuration

### Adjustable Parameters:

1. **Max Retries** (`MAX_RETRIES`):
   - Default: 3
   - Location: `src/services/api.ts`
   - Increase for more resilient requests
   - Decrease for faster failure feedback

2. **Retry Delay Base** (`RETRY_DELAY_BASE`):
   - Default: 1000ms (1 second)
   - Location: `src/services/api.ts`
   - Increase for slower backoff
   - Decrease for faster retries

3. **Request Timeout** (`timeout`):
   - Default: 60000ms (60 seconds)
   - Location: `src/services/api.ts`
   - Increase for longer-running requests (e.g., AI analysis)
   - Decrease for faster timeout detection

---

## Best Practices

1. **Don't Retry Aborted Requests**: Aborted requests are intentional (user cancellation, navigation away, etc.) and should not be retried.

2. **Log All Abort Errors**: Monitor abort error frequency to identify patterns (e.g., users canceling long-running requests).

3. **Provide User Feedback**: Show loading states and progress indicators for long-running requests to reduce abort frequency.

4. **Save Progress**: For critical operations (like quiz submission), save progress to localStorage so users can resume later.

5. **Exponential Backoff**: Use exponential backoff to avoid overwhelming the server with rapid retries.

---

## Troubleshooting

### Issue: Requests are being retried when they shouldn't be

**Solution**: Check that abort errors are properly detected. Verify that `isAbortError()` function correctly identifies abort errors.

### Issue: Too many retries causing performance issues

**Solution**: Reduce `MAX_RETRIES` or increase `RETRY_DELAY_BASE` to slow down retries.

### Issue: Timeout errors not being handled

**Solution**: Verify that 408 status code is in `RETRYABLE_STATUS_CODES` array and that the backend is returning 408 (not just closing the connection).

### Issue: Abort errors not being logged

**Solution**: Check browser console for abort error logs. Verify that `isAbortError()` is correctly detecting abort conditions.

---

## Future Improvements

1. **Retry Configuration per Endpoint**: Different endpoints may need different retry strategies (e.g., quiz submission vs. fetching questions).

2. **Retry UI Feedback**: Show retry progress to users (e.g., "Retrying... Attempt 2 of 3").

3. **Circuit Breaker**: Implement circuit breaker pattern to prevent retrying when backend is consistently failing.

4. **Retry Analytics**: Track retry success rates and timeout frequencies for monitoring and optimization.

---

**Last Updated**: 2025-11-09
**Status**: Implemented and Ready for Testing

