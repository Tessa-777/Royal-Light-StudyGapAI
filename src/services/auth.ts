/**
 * Supabase Authentication Service
 * Handles user authentication via Supabase Auth SDK
 */

import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import api from './api';
import endpoints from './endpoints';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
  console.error('');
  console.error('For GitHub Pages deployment:');
  console.error('1. Go to GitHub Repository → Settings → Secrets and variables → Actions');
  console.error('2. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as secrets');
  console.error('3. The workflow will use these secrets during build');
}

export const supabase: SupabaseClient | null = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  targetScore?: number;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  target_score: number;
  created_at?: string;
  last_active?: string;
  has_diagnostic?: boolean;
  latest_diagnostic_id?: string;
}

/**
 * Sign up a new user
 * 
 * Flow:
 * 1. Register with Supabase Auth SDK
 * 2. Store JWT token from Supabase session
 * 3. Sync user data to backend (create user record in database)
 */
export const signUp = async (data: SignUpData): Promise<{ user: User | null; session: any | null; profile: UserProfile | null; error: Error | null }> => {
  if (!supabase) {
    return { user: null, session: null, profile: null, error: new Error('Supabase not configured') };
  }

  try {
    console.log('[AUTH] Starting registration for:', data.email);
    
    // Step 1: Register with Supabase Auth SDK
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone || '',
        },
      },
    });

    if (authError) {
      console.error('[AUTH] Supabase registration error:', authError);
      return { user: null, session: null, profile: null, error: authError };
    }

    console.log('[AUTH] Supabase registration successful. Session exists:', !!authData.session);
    console.log('[AUTH] User:', authData.user?.email);

    // Declare userProfile outside the if block so it's accessible in the return statement
    let userProfile: UserProfile | null = null;

      // Step 2: Store JWT token if session exists
      if (authData.session) {
        console.log('[AUTH] Storing JWT token in localStorage');
        localStorage.setItem('auth_token', authData.session.access_token);
        localStorage.setItem('user', JSON.stringify(authData.user));
        console.log('[AUTH] JWT token stored:', authData.session.access_token.substring(0, 20) + '...');

        // Step 2.5: Save guest diagnostic if it exists (BEFORE clearing)
        // This must happen after token is stored but before clearing guest data
        const { saveGuestDiagnostic } = await import('./guestDiagnostic');
        const guestDiagnostic = localStorage.getItem('guest_diagnostic');
        const guestQuiz = localStorage.getItem('guest_quiz');
        
        if (guestDiagnostic && guestQuiz) {
          console.log('[AUTH] Found guest diagnostic and quiz - saving to account...');
          try {
            const saveResult = await saveGuestDiagnostic();
            if (saveResult.success) {
              console.log('[AUTH] Guest diagnostic saved successfully');
              if (saveResult.quizId) {
                console.log('[AUTH] Quiz ID:', saveResult.quizId);
              }
            } else {
              console.warn('[AUTH] Failed to save guest diagnostic:', saveResult.error);
              // Continue with registration even if save fails - user can save manually later
            }
          } catch (saveError) {
            console.error('[AUTH] Error saving guest diagnostic:', saveError);
            // Continue with registration even if save fails
          }
        } else {
          // Clear guest data if no diagnostic exists (cleanup)
          console.log('[AUTH] No guest diagnostic found - clearing any stale guest data');
          localStorage.removeItem('guest_diagnostic');
          localStorage.removeItem('guest_quiz');
          localStorage.removeItem('guest_quiz_complete');
          localStorage.removeItem('guest_banner_dismissed');
          localStorage.removeItem('latest_quiz_id'); // Clear previous user's quiz ID
        }

        // Step 3: Sync user data with backend
      console.log('[AUTH] Syncing user data to backend...');
      console.log('[AUTH] Backend URL:', endpoints.users.register);
      try {
        const backendResponse = await api.post(endpoints.users.register, {
          email: data.email,
          name: data.name,
          phone: data.phone || '',
          target_score: data.targetScore || 300,
        });
        console.log('[AUTH] Backend sync successful:', backendResponse.status);
        console.log('[AUTH] Backend response:', backendResponse.data);
        
        // Step 3.5: Fetch user profile after successful registration to get the saved target_score
        try {
          userProfile = await getCurrentUser();
          console.log('[AUTH] User profile fetched after registration:', userProfile ? 'Success' : 'Not found');
          if (userProfile) {
            console.log('[AUTH] Profile target_score:', userProfile.target_score);
          }
        } catch (profileError) {
          console.error('[AUTH] Failed to fetch profile after registration:', profileError);
          // Continue even if profile fetch fails
        }
      } catch (backendError: any) {
        console.error('[AUTH] Backend sync error:', backendError);
        console.error('[AUTH] Error message:', backendError.message);
        console.error('[AUTH] Error code:', backendError.code);
        console.error('[AUTH] Error response:', backendError.response?.data);
        console.error('[AUTH] Error status:', backendError.response?.status);
        
        // Check if it's a CORS/Network error
        if (backendError.code === 'ERR_NETWORK' || backendError.message === 'Network Error') {
          console.error('[AUTH] ⚠️ CORS ERROR: Backend is not returning CORS headers.');
          console.error('[AUTH] ⚠️ Backend must allow requests from:', window.location.origin);
          console.error('[AUTH] ⚠️ See BACKEND_CORS_FIX.md for instructions to fix CORS.');
          // Don't throw error - user account is created in Supabase
          // Backend sync will happen on next login or when CORS is fixed
        }
        
        // If backend sync fails, we still have the Supabase account
        // User can retry sync later or it will sync on next login
        if (backendError.response?.status !== 409) { // 409 = user already exists (not a critical error)
          console.warn('[AUTH] Backend sync failed but Supabase account created. User can sync on next login.');
        } else {
          console.log('[AUTH] User already exists in backend (409), this is OK');
        }
      }
    } else {
      // Supabase might require email confirmation
      // In this case, session will be null until user confirms email
      console.warn('[AUTH] No session returned - email confirmation may be required');
      console.warn('[AUTH] User will need to confirm email before backend sync can happen');
      // Store user data temporarily so we can sync after email confirmation
      localStorage.setItem('pending_registration', JSON.stringify({
        email: data.email,
        name: data.name,
        phone: data.phone || '',
      }));
    }

    return { user: authData.user, session: authData.session, profile: userProfile || null, error: null };
  } catch (error) {
    console.error('[AUTH] Registration exception:', error);
    return { user: null, session: null, profile: null, error: error as Error };
  }
};

/**
 * Sign in an existing user
 * 
 * Flow:
 * 1. Login with Supabase Auth SDK
 * 2. Store JWT token from Supabase session
 * 3. Get user profile from backend (to sync data if needed)
 */
export const signIn = async (data: SignInData): Promise<{ user: User | null; session: any | null; profile: UserProfile | null; error: Error | null }> => {
  if (!supabase) {
    return { user: null, session: null, profile: null, error: new Error('Supabase not configured') };
  }

  try {
    console.log('[AUTH] Starting login for:', data.email);
    
    // Step 1: Login with Supabase Auth SDK
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (authError) {
      console.error('[AUTH] Supabase login error:', authError);
      return { user: null, session: null, profile: null, error: authError };
    }

    if (!authData.session) {
      console.error('[AUTH] No session returned from Supabase');
      return { user: null, session: null, profile: null, error: new Error('No session returned from Supabase. Please confirm your email first.') };
    }

    console.log('[AUTH] Supabase login successful. Session exists:', !!authData.session);
    console.log('[AUTH] User:', authData.user?.email);

    // Step 2: Store JWT token
    console.log('[AUTH] Storing JWT token in localStorage');
    localStorage.setItem('auth_token', authData.session.access_token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    console.log('[AUTH] JWT token stored:', authData.session.access_token.substring(0, 20) + '...');

    // Step 2.5: Save guest diagnostic if it exists (BEFORE clearing)
    // This must happen after token is stored but before clearing guest data
    const { saveGuestDiagnostic } = await import('./guestDiagnostic');
    const guestDiagnostic = localStorage.getItem('guest_diagnostic');
    const guestQuiz = localStorage.getItem('guest_quiz');
    
    if (guestDiagnostic && guestQuiz) {
      console.log('[AUTH] Found guest diagnostic and quiz - saving to account...');
      try {
        const saveResult = await saveGuestDiagnostic();
        if (saveResult.success) {
          console.log('[AUTH] Guest diagnostic saved successfully');
          if (saveResult.quizId) {
            console.log('[AUTH] Quiz ID:', saveResult.quizId);
          }
        } else {
          console.warn('[AUTH] Failed to save guest diagnostic:', saveResult.error);
          // Continue with login even if save fails - user can save manually later
        }
      } catch (saveError) {
        console.error('[AUTH] Error saving guest diagnostic:', saveError);
        // Continue with login even if save fails
      }
    } else {
      // Clear guest data if no diagnostic exists (cleanup)
      console.log('[AUTH] No guest diagnostic found - clearing any stale guest data');
      localStorage.removeItem('guest_diagnostic');
      localStorage.removeItem('guest_quiz');
      localStorage.removeItem('guest_quiz_complete');
      localStorage.removeItem('guest_banner_dismissed');
    }
    
    // Clear latest_quiz_id on login - it might be from a guest session
    // The backend will provide the correct quiz_id if the user has quizzes
    // (But if we just saved a guest diagnostic, the quiz_id is already set)
    if (!guestDiagnostic || !guestQuiz) {
      localStorage.removeItem('latest_quiz_id');
      console.log('[AUTH] Cleared latest_quiz_id - will be set from backend if user has quizzes');
    }

    // Check for pending registration data (from email confirmation flow)
    const pendingRegistration = localStorage.getItem('pending_registration');
    if (pendingRegistration) {
      console.log('[AUTH] Found pending registration, syncing to backend...');
      try {
        const pendingData = JSON.parse(pendingRegistration);
        await api.post(endpoints.users.register, {
          email: pendingData.email,
          name: pendingData.name,
          phone: pendingData.phone || '',
        });
        console.log('[AUTH] Pending registration synced successfully');
        localStorage.removeItem('pending_registration');
      } catch (syncError: any) {
        console.error('[AUTH] Failed to sync pending registration:', syncError);
        if (syncError.response?.status !== 409) {
          console.warn('[AUTH] Will try to sync on profile fetch');
        }
      }
    }

    // Step 3: Get user profile from backend
    console.log('[AUTH] Fetching user profile from backend...');
    let userProfile: UserProfile | null = null;
    try {
      userProfile = await getCurrentUser();
      console.log('[AUTH] User profile fetched:', userProfile ? 'Success' : 'Not found');
      
      if (!userProfile) {
        // If profile doesn't exist in backend, sync it
        console.log('[AUTH] User profile not found in backend. Syncing...');
        try {
          const syncResponse = await api.post(endpoints.users.register, {
            email: data.email,
            name: authData.user.user_metadata?.name || '',
            phone: authData.user.user_metadata?.phone || '',
          });
          console.log('[AUTH] User profile synced to backend:', syncResponse.status);
          // Retry getting profile
          userProfile = await getCurrentUser();
          console.log('[AUTH] User profile after sync:', userProfile ? 'Success' : 'Still not found');
        } catch (syncError: any) {
          console.error('[AUTH] Failed to sync user profile:', syncError);
          console.error('[AUTH] Sync error response:', syncError.response?.data);
          console.error('[AUTH] Sync error status:', syncError.response?.status);
        }
      }
    } catch (profileError: any) {
      console.error('[AUTH] Failed to fetch user profile:', profileError);
      console.error('[AUTH] Profile error response:', profileError.response?.data);
      console.error('[AUTH] Profile error status:', profileError.response?.status);
      // Continue even if profile fetch fails - user is still authenticated
    }

    return { user: authData.user, session: authData.session, profile: userProfile, error: null };
  } catch (error) {
    console.error('[AUTH] Login exception:', error);
    return { user: null, session: null, profile: null, error: error as Error };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: Error | null }> => {
  if (!supabase) {
    return { error: new Error('Supabase not configured') };
  }

  try {
    const { error } = await supabase.auth.signOut();
    // Clear all auth and user data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    // Clear quiz/diagnostic data on logout
    localStorage.removeItem('latest_quiz_id');
    localStorage.removeItem('guest_diagnostic');
    localStorage.removeItem('guest_quiz');
    localStorage.removeItem('guest_quiz_complete');
    localStorage.removeItem('guest_banner_dismissed');
    return { error };
  } catch (error) {
    return { error: error as Error };
  }
};

/**
 * Get current user profile from backend
 */
export const getCurrentUser = async (): Promise<UserProfile | null> => {
  try {
    console.log('[AUTH] Fetching user profile from:', endpoints.users.me);
    const response = await api.get(endpoints.users.me);
    console.log('[AUTH] User profile received:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[AUTH] Failed to fetch user profile:', error);
    console.error('[AUTH] Error response:', error.response?.data);
    console.error('[AUTH] Error status:', error.response?.status);
    
    // If 404, user doesn't exist in backend (this is OK, we'll sync)
    if (error.response?.status === 404) {
      console.log('[AUTH] User profile not found in backend (404)');
      return null;
    }
    
    // If 401, token is invalid
    if (error.response?.status === 401) {
      console.warn('[AUTH] Unauthorized (401) - token may be invalid');
      return null;
    }
    
    return null;
  }
};

/**
 * Get current session
 */
export const getSession = async () => {
  if (!supabase) {
    return null;
  }
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

/**
 * Check if user is authenticated
 * Also validates that the token is still valid by checking Supabase session
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return false;
  }

  // Validate token with Supabase
  if (supabase) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        // Token is invalid, clear it
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        return false;
      }
      // Update token if it was refreshed
      if (session.access_token !== token) {
        localStorage.setItem('auth_token', session.access_token);
      }
      return true;
    } catch (error) {
      console.error('Error validating session:', error);
      return false;
    }
  }

  // Fallback: just check if token exists
  return !!token;
};

/**
 * Check if user is authenticated (synchronous version)
 * Use this for quick checks, but prefer async isAuthenticated() for validation
 */
export const isAuthenticatedSync = (): boolean => {
  return !!localStorage.getItem('auth_token');
};

/**
 * Get stored user from localStorage
 */
export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

