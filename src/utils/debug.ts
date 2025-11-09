/**
 * Debug Utilities
 * Helper functions for debugging authentication and API calls
 */

/**
 * Check if JWT token is stored in localStorage
 */
export const checkJWTToken = () => {
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('user');
  
  console.log('=== JWT Token Check ===');
  console.log('Token exists:', !!token);
  if (token) {
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
    console.log('Token length:', token.length);
    
    // Try to decode JWT (basic decode, not validation)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('Token payload:', {
        email: payload.email,
        exp: new Date(payload.exp * 1000).toISOString(),
        iat: new Date(payload.iat * 1000).toISOString(),
      });
    } catch (e) {
      console.log('Could not decode token');
    }
  } else {
    console.log('No token found in localStorage');
  }
  
  console.log('User object exists:', !!user);
  if (user) {
    try {
      const userObj = JSON.parse(user);
      console.log('User object:', {
        email: userObj.email,
        id: userObj.id,
      });
    } catch (e) {
      console.log('Could not parse user object');
    }
  }
  
  console.log('=====================');
  
  return {
    hasToken: !!token,
    hasUser: !!user,
    token: token?.substring(0, 50) + '...' || null,
  };
};

/**
 * Check localStorage contents
 */
export const checkLocalStorage = () => {
  console.log('=== LocalStorage Check ===');
  console.log('auth_token:', localStorage.getItem('auth_token') ? 'EXISTS' : 'NOT FOUND');
  console.log('user:', localStorage.getItem('user') ? 'EXISTS' : 'NOT FOUND');
  console.log('guest_quiz:', localStorage.getItem('guest_quiz') ? 'EXISTS' : 'NOT FOUND');
  console.log('guest_diagnostic:', localStorage.getItem('guest_diagnostic') ? 'EXISTS' : 'NOT FOUND');
  console.log('pending_registration:', localStorage.getItem('pending_registration') ? 'EXISTS' : 'NOT FOUND');
  console.log('========================');
};

/**
 * Clear all auth-related localStorage items
 */
export const clearAuthStorage = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
  localStorage.removeItem('pending_registration');
  console.log('Cleared all auth-related localStorage items');
};

// Make functions available in browser console
if (typeof window !== 'undefined') {
  (window as any).checkJWTToken = checkJWTToken;
  (window as any).checkLocalStorage = checkLocalStorage;
  (window as any).clearAuthStorage = clearAuthStorage;
  console.log('Debug utilities available:');
  console.log('- window.checkJWTToken() - Check JWT token');
  console.log('- window.checkLocalStorage() - Check localStorage');
  console.log('- window.clearAuthStorage() - Clear auth storage');
}

