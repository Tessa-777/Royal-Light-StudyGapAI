import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import SaveDiagnosticModal from '../components/ui/SaveDiagnosticModal';
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSavingDiagnostic, setIsSavingDiagnostic] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // Mock API call - in a real app, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Simulate login success or failure
      if (email === 'test@example.com' && password === 'password') {
        // Success - store auth token
        localStorage.setItem('auth_token', 'mock_auth_token');
        // Check for guest diagnostic
        const guestDiagnostic = localStorage.getItem('guest_diagnostic');
        if (guestDiagnostic) {
          setShowSaveModal(true);
        } else {
          // Navigate to dashboard if no guest diagnostic
          window.location.href = '/dashboard';
        }
      } else {
        // Failure
        setError('Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSaveDiagnostic = async () => {
    setIsSavingDiagnostic(true);
    try {
      // Mock API call to save diagnostic
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Remove guest diagnostic from localStorage
      localStorage.removeItem('guest_diagnostic');
      localStorage.removeItem('guest_quiz');
      localStorage.removeItem('guest_quiz_complete');
      // Navigate to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('Error saving diagnostic:', err);
    } finally {
      setIsSavingDiagnostic(false);
    }
  };
  const handleSkipSave = () => {
    // Remove guest diagnostic from localStorage
    localStorage.removeItem('guest_diagnostic');
    localStorage.removeItem('guest_quiz');
    localStorage.removeItem('guest_quiz_complete');
    // Navigate to dashboard
    window.location.href = '/dashboard';
  };
  return <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Login to StudyGapAI
            </h1>
            <p className="text-gray-600 mt-2">
              Enter your details to access your account
            </p>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>}
          <form onSubmit={handleSubmit}>
            <Input label="Email Address" id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="Password" id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-500">
                  Forgot password?
                </Link>
              </div>
            </div>
            <Button type="submit" variant="primary" isLoading={isLoading} fullWidth>
              Login
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                Register
              </Link>
            </p>
          </div>
        </Card>
      </div>
      {/* Save Diagnostic Modal */}
      <SaveDiagnosticModal isOpen={showSaveModal} onSave={handleSaveDiagnostic} onSkip={handleSkipSave} isLoading={isSavingDiagnostic} />
    </>;
};
export default LoginPage;