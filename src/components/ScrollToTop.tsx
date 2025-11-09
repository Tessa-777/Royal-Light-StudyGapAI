import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component to scroll to top on route change
 * Ensures every page starts at the top when navigated to
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;

