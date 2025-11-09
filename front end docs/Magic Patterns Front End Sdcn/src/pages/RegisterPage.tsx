import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import SaveDiagnosticModal from '../components/ui/SaveDiagnosticModal';
const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSavingDiagnostic, setIsSavingDiagnostic] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      // Mock API call - in a real app, this would be an actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      // Simulate registration success
      setSuccess('Registration successful!');
      // Store auth token
      localStorage.setItem('auth_token', 'mock_auth_token');
      // Check for guest diagnostic
      const guestDiagnostic = localStorage.getItem('guest_diagnostic');
      if (guestDiagnostic) {
        setShowSaveModal(true);
      } else {
        // Navigate to dashboard after a delay if no guest diagnostic
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
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
              Create an Account
            </h1>
            <p className="text-gray-600 mt-2">
              Join StudyGapAI to start your JAMB prep journey
            </p>
          </div>
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>}
          {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
              {success}
            </div>}
          <form onSubmit={handleSubmit}>
            <Input label="Full Name" id="name" type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
            <Input label="Email Address" id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            <Input label="Phone Number (Optional)" id="phone" type="tel" placeholder="080XXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
            <Input label="Password" id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            <div className="mt-6">
              <Button type="submit" variant="primary" isLoading={isLoading} fullWidth>
                Create Account
              </Button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                Login
              </Link>
            </p>
          </div>
          <div className="mt-6 pt-5 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              By creating an account, you agree to our{' '}
              <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
            </p>
          </div>
        </Card>
      </div>
      {/* Save Diagnostic Modal */}
      <SaveDiagnosticModal isOpen={showSaveModal} onSave={handleSaveDiagnostic} onSkip={handleSkipSave} isLoading={isSavingDiagnostic} />
    </>;
};
export default RegisterPage;