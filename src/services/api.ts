/**
 * Axios API Client Configuration
 * Handles base URL, authentication headers, and error interceptors
 * Includes retry logic for 408 Request Timeout errors
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Get API base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Log the API base URL in development to help debug
if (import.meta.env.DEV) {
  console.log('[API] VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
  console.log('[API] Using API_BASE_URL:', API_BASE_URL);
}

// In production, log a warning if using localhost fallback
if (import.meta.env.PROD && API_BASE_URL.includes('localhost')) {
  console.error('[API] WARNING: Using localhost fallback in production!');
  console.error('[API] VITE_API_BASE_URL is not set. Please set it in Vercel environment variables.');
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_BASE = 1000; // 1 second base delay
const MAX_RETRY_DELAY = 30000; // Maximum 30 seconds delay
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504]; // Timeout, Rate limit, Server errors

// Request deduplication: Track pending requests to prevent duplicates
interface PendingRequest {
  promise?: Promise<any>; // Optional - only set when using makeRequest wrapper
  timestamp: number;
  abortController?: AbortController;
}

const pendingRequests = new Map<string, PendingRequest>();
const REQUEST_CACHE_TIME = 5000; // 5 seconds cache for duplicate detection

// Request throttling: Track last request time per endpoint
const lastRequestTime = new Map<string, number>();
const MIN_REQUEST_INTERVAL = 100; // Minimum 100ms between requests to same endpoint

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 seconds timeout for AI analysis
});

// Track retry attempts for each request
interface RetryConfig extends InternalAxiosRequestConfig {
  _retryCount?: number;
  _retryDelay?: number;
  _requestKey?: string; // Unique key for request deduplication
  _abortController?: AbortController; // Abort controller for canceling duplicates
}

/**
 * Generate unique request key for deduplication
 */
const getRequestKey = (config: InternalAxiosRequestConfig): string => {
  const method = config.method?.toUpperCase() || 'GET';
  const url = config.url || '';
  const params = config.params ? JSON.stringify(config.params) : '';
  const data = config.data ? JSON.stringify(config.data) : '';
  return `${method}:${url}:${params}:${data}`;
};

/**
 * Calculate exponential backoff delay with jitter
 */
const getRetryDelay = (retryCount: number, retryAfter?: number): number => {
  // If server provides retry_after (e.g., for 503), use it
  if (retryAfter && retryAfter > 0) {
    return Math.min(retryAfter * 1000, MAX_RETRY_DELAY); // Convert seconds to milliseconds
  }
  
  // Exponential backoff: 1s, 2s, 4s, 8s...
  const exponentialDelay = RETRY_DELAY_BASE * Math.pow(2, retryCount);
  
  // Add jitter (random 0-25% of delay) to prevent thundering herd
  const jitter = Math.random() * 0.25 * exponentialDelay;
  
  // Cap at maximum delay
  return Math.min(exponentialDelay + jitter, MAX_RETRY_DELAY);
};

/**
 * Extract retry-after header from response (in seconds)
 */
const getRetryAfter = (error: AxiosError): number | undefined => {
  const retryAfterHeader = error.response?.headers?.['retry-after'] || 
                          error.response?.headers?.['Retry-After'];
  if (retryAfterHeader) {
    const seconds = parseInt(retryAfterHeader, 10);
    if (!isNaN(seconds) && seconds > 0) {
      return seconds;
    }
  }
  return undefined;
};

/**
 * Check if error is abort-related
 */
const isAbortError = (error: AxiosError): boolean => {
  return (
    error.code === 'ECONNABORTED' ||
    error.message === 'canceled' ||
    error.message.toLowerCase().includes('abort') ||
    (error.config?.signal as AbortSignal)?.aborted === true
  );
};

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Request interceptor: Add auth token, prevent duplicates, and throttle requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const retryConfig = config as RetryConfig;
    const requestKey = getRequestKey(config);
    retryConfig._requestKey = requestKey;
    
    // Skip deduplication/throttling for retries
    if (!retryConfig._retryCount) {
      // Prevent duplicate requests: Cancel previous request if same request is pending
      const pending = pendingRequests.get(requestKey);
      if (pending) {
        const age = Date.now() - pending.timestamp;
        if (age < REQUEST_CACHE_TIME) {
          console.log(`[API] Duplicate request detected, canceling previous request: ${config.url}`);
          // Cancel the previous request using its abort controller
          if (pending.abortController && !pending.abortController.signal.aborted) {
            pending.abortController.abort();
            console.log(`[API] Previous request canceled: ${config.url}`);
          }
          // Remove from pending (new request will replace it)
          pendingRequests.delete(requestKey);
        } else {
          // Request is too old, remove it
          pendingRequests.delete(requestKey);
        }
      }
      
      // Create abort controller for this request (to allow cancellation of duplicates)
      const abortController = new AbortController();
      // Merge with existing signal if present
      if (config.signal) {
        // If there's already a signal, we need to handle both
        // For simplicity, use the new abort controller
        config.signal = abortController.signal;
      } else {
        config.signal = abortController.signal;
      }
      retryConfig._abortController = abortController;
      
      // Store abort controller in pending requests for future cancellation
      // This allows us to cancel duplicate requests
      pendingRequests.set(requestKey, {
        timestamp: Date.now(),
        abortController: abortController,
      });
      
      // Throttle rapid-fire requests to same endpoint
      const endpoint = `${config.method?.toUpperCase()}:${config.url}`;
      const lastTime = lastRequestTime.get(endpoint);
      if (lastTime) {
        const timeSinceLastRequest = Date.now() - lastTime;
        if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
          const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
          console.warn(`[API] Throttling request to ${config.url}, waiting ${waitTime}ms`);
          await sleep(waitTime);
          // Check if request was aborted during wait
          if (abortController.signal.aborted) {
            throw new Error('Request was canceled');
          }
        }
      }
      lastRequestTime.set(endpoint, Date.now());
    }
    
    // Add auth token
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API] Request to ${config.url} with auth token`);
    } else {
      console.log(`[API] Request to ${config.url} without auth token (guest mode)`);
    }
    
    return config;
  },
  (error: AxiosError) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors with retry logic for 408 and other retryable errors
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Response from ${response.config.url}:`, response.status);
    
    // Clear pending request on successful response
    const config = response.config as RetryConfig;
    if (config._requestKey) {
      pendingRequests.delete(config._requestKey);
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as RetryConfig;
    
    // Log abort errors for monitoring
    if (isAbortError(error)) {
      console.warn('[API] Request was aborted (likely duplicate request canceled):', {
        url: config?.url,
        method: config?.method,
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString(),
      });
      // Clear pending request on abort
      if (config?._requestKey) {
        pendingRequests.delete(config._requestKey);
      }
      // Don't retry aborted requests
      return Promise.reject(error);
    }
    
    // Log error details
    console.error(`[API] Error from ${config?.url}:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      code: error.code,
      message: error.message,
    });
    
    // Handle CORS errors
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('[API] Network Error - This is likely a CORS issue. Check backend CORS configuration.');
      console.error('[API] Backend must allow requests from:', window.location.origin);
      console.error('[API] Backend URL:', import.meta.env.VITE_API_BASE_URL);
      // Don't show network error to user for CORS - it's a backend configuration issue
      throw new Error('Cannot connect to backend. Please check that the backend server is running and CORS is configured correctly.');
    }
    
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      const token = localStorage.getItem('auth_token');
      const isGuest = !token;
      const url = config?.url || '';
      
      // Check if this is a guest user trying to access a quiz/diagnostic endpoint
      const isQuizEndpoint = url.includes('/quiz/') || url.includes('/ai/analyze-diagnostic');
      
      if (isGuest && isQuizEndpoint) {
        // Guest users should be able to submit quizzes, but backend is rejecting it
        // This is a backend configuration issue - the endpoint should allow guest access
        console.warn('[API] 401 Unauthorized for guest user on quiz endpoint');
        console.warn('[API] Backend should allow unauthenticated requests to /api/ai/analyze-diagnostic for guest mode');
        // Don't redirect - let the error bubble up so the component can handle it
        // The component will show a message to the user about creating an account
        return Promise.reject(error);
      }
      
      // For authenticated users or non-quiz endpoints, clear token and redirect
      console.warn('[API] 401 Unauthorized - clearing auth token');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // Only redirect if not already on login/register page
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
    
    // Handle 503 Service Unavailable with retry-after header
    if (error.response?.status === 503 && config) {
      const retryAfter = getRetryAfter(error);
      const retryCount = config._retryCount || 0;
      
      if (retryCount < MAX_RETRIES) {
        config._retryCount = retryCount + 1;
        const delay = getRetryDelay(retryCount, retryAfter);
        config._retryDelay = delay;
        
        const retryAfterMsg = retryAfter ? ` (server requested ${retryAfter}s wait)` : '';
        console.warn(`[API] 503 Service Unavailable - Retrying request (attempt ${retryCount + 1}/${MAX_RETRIES})${retryAfterMsg}`, {
          url: config.url,
          retryCount: retryCount + 1,
          delayMs: delay,
          retryAfter,
        });
        
        // Wait before retrying (respect retry-after if provided)
        await sleep(delay);
        
        // Clear pending request cache to allow retry
        if (config._requestKey) {
          pendingRequests.delete(config._requestKey);
        }
        
        // Retry the request
        try {
          return await api.request(config);
        } catch (retryError) {
          return Promise.reject(retryError);
        }
      } else {
        console.error(`[API] 503 Service Unavailable - Max retries exceeded:`, {
          url: config.url,
          retries: MAX_RETRIES,
        });
        const serviceError = new Error(
          retryAfter 
            ? `Service temporarily unavailable. Please try again in ${retryAfter} seconds.`
            : 'Service temporarily unavailable. Please try again later.'
        ) as any;
        serviceError.status = 503;
        serviceError.originalError = error;
        return Promise.reject(serviceError);
      }
    }
    
    // Handle 408 Request Timeout and other retryable errors
    const status = error.response?.status;
    if (status && RETRYABLE_STATUS_CODES.includes(status) && config) {
      const retryCount = config._retryCount || 0;
      
      // Check if we should retry
      if (retryCount < MAX_RETRIES) {
        config._retryCount = retryCount + 1;
        
        // For 429 (Rate Limit), check for retry-after header
        const retryAfter = status === 429 ? getRetryAfter(error) : undefined;
        const delay = getRetryDelay(retryCount, retryAfter);
        config._retryDelay = delay;
        
        const retryAfterMsg = retryAfter ? ` (server requested ${retryAfter}s wait)` : '';
        console.warn(`[API] ${status} error - Retrying request (attempt ${retryCount + 1}/${MAX_RETRIES})${retryAfterMsg}`, {
          url: config.url,
          status,
          retryCount: retryCount + 1,
          delayMs: delay,
          retryAfter,
        });
        
        // Wait before retrying (exponential backoff with jitter)
        await sleep(delay);
        
        // Clear pending request cache to allow retry
        if (config._requestKey) {
          pendingRequests.delete(config._requestKey);
        }
        
        // Retry the request
        try {
          return await api.request(config);
        } catch (retryError) {
          // If retry also fails and we've exhausted retries, log and reject
          if ((retryError as AxiosError).response?.status === status && (config._retryCount || 0) >= MAX_RETRIES) {
            console.error(`[API] Request failed after ${MAX_RETRIES} retries:`, {
              url: config.url,
              status,
              finalError: retryError,
            });
          }
          return Promise.reject(retryError);
        }
      } else {
        // Max retries exceeded
        console.error(`[API] Request failed after ${MAX_RETRIES} retries:`, {
          url: config.url,
          status,
          finalStatus: error.response?.status,
        });
        
        // Provide user-friendly error message for 408
        if (status === 408) {
          const timeoutError = new Error(
            'Request timed out. The server took too long to respond. Please try again.'
          ) as any;
          timeoutError.isTimeout = true;
          timeoutError.originalError = error;
          return Promise.reject(timeoutError);
        }
        
        // Provide user-friendly error message for 429
        if (status === 429) {
          const rateLimitError = new Error(
            'Too many requests. Please wait a moment and try again.'
          ) as any;
          rateLimitError.status = 429;
          rateLimitError.originalError = error;
          return Promise.reject(rateLimitError);
        }
      }
    }
    
    // Clear pending request on error (if not retrying and not going to retry)
    if (config?._requestKey) {
      const status = error.response?.status;
      const willRetry = status && RETRYABLE_STATUS_CODES.includes(status) && (config._retryCount || 0) < MAX_RETRIES;
      
      // Only clear if not retrying and not a promise-based request (handled by makeRequest)
      if (!willRetry && !config._retryCount) {
        const pending = pendingRequests.get(config._requestKey);
        // Only clear if it's not a promise-based request (those are managed by makeRequest)
        if (pending && !pending.promise) {
          pendingRequests.delete(config._requestKey);
        }
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Wrapper function to handle duplicate request prevention with promise reuse
 * This should be used for critical requests that might be triggered multiple times
 */
export const makeRequest = async <T = any>(
  requestFn: () => Promise<T>,
  requestKey?: string,
  options?: { skipDeduplication?: boolean; cacheTime?: number }
): Promise<T> => {
  if (options?.skipDeduplication) {
    return requestFn();
  }
  
  // Generate request key if not provided
  const key = requestKey || `request-${Date.now()}-${Math.random()}`;
  const cacheTime = options?.cacheTime || REQUEST_CACHE_TIME;
  
  // Check if same request is already pending
  const pending = pendingRequests.get(key);
  if (pending) {
    const age = Date.now() - pending.timestamp;
    if (age < cacheTime) {
      console.log(`[API] Reusing pending request for key: ${key}`);
      return pending.promise as Promise<T>;
    } else {
      // Request is too old, remove it
      pendingRequests.delete(key);
    }
  }
  
  // Create new request promise
  const requestPromise = requestFn();
  
  // Track pending request
  pendingRequests.set(key, {
    promise: requestPromise,
    timestamp: Date.now(),
  });
  
  // Clean up on completion (success or error)
  requestPromise
    .then(() => {
      pendingRequests.delete(key);
    })
    .catch(() => {
      pendingRequests.delete(key);
    });
  
  return requestPromise;
};

/**
 * Clear pending requests cache (useful for testing or cleanup)
 */
export const clearPendingRequests = (): void => {
  pendingRequests.clear();
  lastRequestTime.clear();
};

export default api;

