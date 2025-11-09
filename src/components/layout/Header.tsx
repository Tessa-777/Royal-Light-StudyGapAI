import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Button from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';
  
  // Check if user has a study plan (check localStorage for latest quiz/diagnostic)
  const latestQuizId = localStorage.getItem('latest_quiz_id');
  const hasStudyPlan = !!latestQuizId && latestQuizId !== 'null' && latestQuizId !== 'undefined';

  // Handle scroll event to change header style
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
    navigate('/');
  };

  // Determine header background style based on scroll and homepage
  const headerBg = isHomePage && !isScrolled ? 'bg-transparent' : 'bg-white shadow-sm';

  return <header className={`sticky top-0 z-50 transition-all duration-300 ${headerBg}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold text-blue-600">
            StudyGapAI
          </Link>
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {/* Show Home link only for guest users (not authenticated) */}
            {!isAuthenticated && (
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
                Home
              </Link>
            )}
            {isAuthenticated && <>
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600 font-medium">
                  Dashboard
                </Link>
                {hasStudyPlan && (
                  <Link 
                    to={latestQuizId ? `/study-plan/${latestQuizId}` : '/study-plan/null'} 
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Study Plan
                  </Link>
                )}
                <Link to="/resources/all" className="text-gray-700 hover:text-blue-600 font-medium">
                  Resources
                </Link>
              </>}
          </nav>
          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              // On pages other than home, just show logout (workaround for username display issue)
              <button
                onClick={handleSignOut}
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Logout
              </button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </>
            )}
          </div>
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex flex-col space-y-4">
              {/* Show Home link only for guest users (not authenticated) */}
              {!isAuthenticated && (
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-600 py-2 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
              )}
              {isAuthenticated ? <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-600 py-2 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  {hasStudyPlan && (
                    <Link
                      to={latestQuizId ? `/study-plan/${latestQuizId}` : '/study-plan/null'}
                      className="text-gray-700 hover:text-blue-600 py-2 font-medium"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Study Plan
                    </Link>
                  )}
                  <Link
                    to="/resources/all"
                    className="text-gray-700 hover:text-blue-600 py-2 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Resources
                  </Link>
                  <hr className="border-gray-200" />
                  <div className="text-gray-700 py-2 font-medium text-left">
                    {profile?.name || user?.email || 'User'}
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-gray-700 hover:text-blue-600 py-2 font-medium text-left"
                  >
                    Logout
                  </button>
                </> : <div className="flex flex-col space-y-3 pt-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="secondary" fullWidth>
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" fullWidth>
                      Register
                    </Button>
                  </Link>
                </div>}
            </nav>
          </div>
        </div>}
    </header>;
};

export default Header;

