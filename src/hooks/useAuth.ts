/**
 * Authentication Hook
 * Manages user authentication state and actions
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp, signIn, signOut, getCurrentUser, getStoredUser, isAuthenticated, isAuthenticatedSync, type SignUpData, type SignInData } from '../services/auth';
import { User } from '@supabase/supabase-js';
import { UserProfile } from '../services/auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Load user profile on mount (skip if profile already loaded)
  useEffect(() => {
    const loadUser = async () => {
      const authenticated = await isAuthenticated();
      if (authenticated) {
        const storedUser = getStoredUser();
        setUser(storedUser);
        
        // Only fetch profile if not already loaded (prevents duplicate fetches after login)
        if (!profile) {
          try {
            console.log('[useAuth] Loading user profile on mount...');
            const userProfile = await getCurrentUser();
            setProfile(userProfile);
          } catch (err) {
            console.error('Failed to load user profile:', err);
          }
        } else {
          console.log('[useAuth] Profile already loaded, skipping fetch');
        }
      }
      setLoading(false);
    };

    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount - profile changes handled by login/register

  const handleSignUp = useCallback(async (data: SignUpData) => {
    setLoading(true);
    setError(null);
    try {
      const { user: newUser, session, error: signUpError } = await signUp(data);
      if (signUpError) {
        setError(signUpError.message);
        return { success: false, error: signUpError.message };
      }

      if (newUser) {
        setUser(newUser);
        
        // If session exists, fetch profile from backend
        if (session) {
          try {
            const userProfile = await getCurrentUser();
            setProfile(userProfile);
          } catch (profileError) {
            console.error('Failed to fetch profile after registration:', profileError);
            // Continue even if profile fetch fails
          }
        } else {
          // No session - email confirmation required
          return { 
            success: true, 
            user: newUser,
            requiresEmailConfirmation: true,
            message: 'Registration successful! Please check your email to confirm your account.' 
          };
        }
        
        return { success: true, user: newUser, requiresEmailConfirmation: false };
      }
      return { success: false, error: 'Failed to create user' };
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during registration';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignIn = useCallback(async (data: SignInData) => {
    setLoading(true);
    setError(null);
    try {
      const { user: signedInUser, session, profile: userProfile, error: signInError } = await signIn(data);
      if (signInError) {
        setError(signInError.message);
        return { success: false, error: signInError.message };
      }

      if (signedInUser && session) {
        setUser(signedInUser);
        // Profile is already fetched in signIn function
        setProfile(userProfile);
        return { success: true, user: signedInUser, profile: userProfile };
      }
      return { success: false, error: 'Failed to sign in - no session returned' };
    } catch (err: any) {
      const errorMessage = err.message || 'An error occurred during sign in';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    setLoading(true);
    try {
      await signOut();
      setUser(null);
      setProfile(null);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'An error occurred during sign out');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  return {
    user,
    profile,
    loading,
    error,
    isAuthenticated: isAuthenticatedSync(),
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
};

