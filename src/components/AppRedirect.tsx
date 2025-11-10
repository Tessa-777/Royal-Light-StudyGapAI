import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticatedSync } from '../services/auth';

/**
 * Component to handle app-level redirects
 * - Redirects authenticated users from home page to dashboard
 * - Handles browser resume/login session
 * - On errors, redirects to home page (not login) for non-authenticated users
 */
const AppRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const authenticated = isAuthenticatedSync();
    // If user is authenticated and on home/login/register pages, redirect to dashboard
    if (authenticated && (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register')) {
      console.log('[APP REDIRECT] User is authenticated, redirecting to dashboard from:', location.pathname);
      navigate('/dashboard', { replace: true });
    }
    // If user is not authenticated and tries to access protected routes, redirect to home (not login)
    // This is handled by ProtectedRoute component, but we ensure home is default
  }, [location.pathname, navigate]);

  return null;
};

export default AppRedirect;

