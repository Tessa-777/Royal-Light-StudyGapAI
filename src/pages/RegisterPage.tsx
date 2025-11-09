import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [targetScore, setTargetScore] = useState<number>(300);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if already authenticated (but allow user to stay on register if they want)
  // Only redirect if they're trying to access a protected route
  // For landing page and register, don't auto-redirect

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const result = await signUp({
        email,
        password,
        name,
        phone: phone || undefined,
        targetScore: targetScore || undefined,
      });

      if (result.success) {
        // Check if email confirmation is required
        if (result.requiresEmailConfirmation) {
          setSuccess(result.message || 'Registration successful! Please check your email to confirm your account. After confirming, you can login and your account will be synced to our database.');
          // Don't redirect - user needs to confirm email first
          // Don't show save modal - user hasn't confirmed email yet
          // Note: If guest diagnostic exists, it will remain in localStorage
          // User can save it after confirming email and logging in (but we won't show modal on login per user requirement)
          console.log('[REGISTER] Email confirmation required. User data stored in pending_registration.');
          console.log('[REGISTER] Guest diagnostic (if any) will remain in localStorage until user manually saves it.');
          return;
        }
        
        // Registration successful and session exists (email confirmation disabled)
        setSuccess('Registration successful! Syncing your account...');
        console.log('[REGISTER] Registration successful - guest diagnostic is automatically saved in auth.ts');
        
        // Guest diagnostic is automatically saved in auth.ts during registration
        // Navigate to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        const errorMsg = result.error || 'Registration failed. Please try again.';
        setError(errorMsg);
        console.error('[REGISTER] Registration failed:', errorMsg);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email Address"
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Phone Number (Optional)"
              id="phone"
              type="tel"
              placeholder="080XXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Password"
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              label="Target JAMB Score"
              id="targetScore"
              type="number"
              placeholder="300"
              value={targetScore.toString()}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 0;
                // Enforce max of 400
                if (value > 400) {
                  setTargetScore(400);
                } else if (value < 0) {
                  setTargetScore(0);
                } else {
                  setTargetScore(value);
                }
              }}
              min="0"
              max="400"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum score is 400
            </p>
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
    </>
  );
};

export default RegisterPage;

