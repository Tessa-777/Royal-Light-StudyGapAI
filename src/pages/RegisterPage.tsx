import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import SaveDiagnosticModal from '../components/ui/SaveDiagnosticModal';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import endpoints from '../services/endpoints';
import { isAuthenticatedSync } from '../services/auth';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSavingDiagnostic, setIsSavingDiagnostic] = useState(false);

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
        console.log('[REGISTER] Registration successful, checking for guest diagnostic...');
        
        // Only show save modal if:
        // 1. Registration was successful (session exists)
        // 2. Guest diagnostic exists in localStorage
        // This ensures modal only shows after creating account (not on login)
        const guestDiagnostic = localStorage.getItem('guest_diagnostic');
        if (guestDiagnostic) {
          console.log('[REGISTER] Guest diagnostic found - showing save modal');
          setShowSaveModal(true);
        } else {
          console.log('[REGISTER] No guest diagnostic found - navigating to dashboard');
          // Navigate to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        }
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

  const handleSaveDiagnostic = async () => {
    setIsSavingDiagnostic(true);
    try {
      const guestDiagnostic = localStorage.getItem('guest_diagnostic');
      if (guestDiagnostic) {
        const diagnosticData = JSON.parse(guestDiagnostic);
        
        console.log('[REGISTER] Attempting to save guest diagnostic to account');
        console.log('[REGISTER] Diagnostic data structure:', diagnosticData);
        console.log('[REGISTER] Diagnostic:', diagnosticData.diagnostic);
        console.log('[REGISTER] Quiz data:', diagnosticData.quizData);
        
        const diagnostic = diagnosticData.diagnostic;
        const quizData = diagnosticData.quizData;
        
        // Log the actual question structure to understand the ID format
        console.log('[REGISTER] Sample question from quizData:', quizData.questions?.[0]);
        console.log('[REGISTER] All question IDs from quizData:', quizData.questions?.map((q: any) => ({
          id: q.id,
          idType: typeof q.id,
          topic: q.topic,
        })));
        console.log('[REGISTER] Sample response keys:', Object.keys(quizData.responses || {}).slice(0, 5));
        
        // Build questions_list from quizData - match the exact format from useQuiz.ts
        // quizData.responses is Record<string, QuestionResponse>
        // quizData.questions is Question[]
        const questionsList = quizData.questions?.map((q: any, index: number) => {
          // Get response from responses dictionary (keyed by question.id)
          const response = quizData.responses?.[q.id];
          
          // Backend expects numeric question IDs
          // Since we're creating a new quiz, we can use sequential IDs (1, 2, 3, ...)
          // The backend will use the question content to identify questions, not the ID
          const questionId = index + 1;
          
          // If response exists, use it (it should already be a QuestionResponse)
          if (response && typeof response === 'object') {
            return {
              id: questionId, // Always use the question's ID, never response.id
              topic: response.topic || q.topic || '',
              student_answer: response.student_answer || 'A',
              correct_answer: response.correct_answer || q.correct_answer || 'A',
              is_correct: response.is_correct === true || response.is_correct === false 
                ? response.is_correct 
                : (response.student_answer === (q.correct_answer || response.correct_answer)),
              confidence: typeof response.confidence === 'number' && response.confidence >= 1 && response.confidence <= 5
                ? response.confidence 
                : 3,
              explanation: response.explanation || '',
              time_spent_seconds: typeof response.time_spent_seconds === 'number' && response.time_spent_seconds >= 0
                ? response.time_spent_seconds 
                : 0,
            };
          }
          
          // If no response, create a default one
          return {
            id: questionId,
            topic: q.topic || '',
            student_answer: 'A',
            correct_answer: q.correct_answer || 'A',
            is_correct: false,
            confidence: 3,
            explanation: '',
            time_spent_seconds: 0,
          };
        }) || [];
        
        // Filter out null entries (questions that couldn't be processed) and invalid questions
        const validQuestionsList = questionsList
          .filter((q: any) => q !== null) // Remove null entries
          .filter((q: any) => {
          const isValid = q.id && q.id > 0 && !isNaN(q.id) && 
                         q.topic && 
                         q.student_answer && 
                         q.correct_answer &&
                         typeof q.is_correct === 'boolean';
          if (!isValid) {
            console.error('[REGISTER] Filtering out invalid question:', q);
          }
          return isValid;
        });
        
        // Log if we filtered out any questions
        if (validQuestionsList.length !== questionsList.length) {
          console.warn(`[REGISTER] Filtered out ${questionsList.length - validQuestionsList.length} invalid questions`);
        }
        
        // Use the filtered list
        const finalQuestionsList = validQuestionsList.length > 0 ? validQuestionsList : questionsList;
        
        // Calculate total time from quizData (ensure it's a valid number)
        const totalTimeMinutes = typeof quizData.totalTime === 'number' && quizData.totalTime > 0
          ? quizData.totalTime
          : 0;
        
        // Validate that questions_list is not empty
        if (!finalQuestionsList || finalQuestionsList.length === 0) {
          console.error('[REGISTER] Questions list is empty after validation - cannot save diagnostic');
          console.error('[REGISTER] Original questions count:', questionsList.length);
          console.error('[REGISTER] Valid questions count:', validQuestionsList.length);
          alert('Unable to save diagnostic: No valid quiz data found. Please take the quiz again.');
          navigate('/dashboard');
          return;
        }
        
        // Log question IDs for debugging
        console.log('[REGISTER] Question IDs being sent:', finalQuestionsList.map((q: any) => q.id));
        console.log('[REGISTER] Sample question structure:', finalQuestionsList[0]);
        
        // The backend expects the analyze-diagnostic format at ROOT level
        // Error shows it needs: subject, total_questions, time_taken, questions_list
        // This endpoint uses the same format as analyze-diagnostic
        const requestBody = {
          subject: 'Mathematics',
          total_questions: finalQuestionsList.length,
          time_taken: totalTimeMinutes,
          questions_list: finalQuestionsList,
        };
        
        // Validate required fields
        if (!requestBody.subject || !requestBody.total_questions || !requestBody.questions_list) {
          console.error('[REGISTER] Missing required fields:', {
            subject: !!requestBody.subject,
            total_questions: !!requestBody.total_questions,
            questions_list: !!requestBody.questions_list,
          });
          alert('Unable to save diagnostic: Missing required data. Please take the quiz again.');
          navigate('/dashboard');
          return;
        }
        
        if (requestBody.total_questions <= 0 || requestBody.questions_list.length === 0) {
          console.error('[REGISTER] Invalid data:', {
            total_questions: requestBody.total_questions,
            questions_list_length: requestBody.questions_list.length,
          });
          alert('Unable to save diagnostic: Invalid quiz data. Please take the quiz again.');
          navigate('/dashboard');
          return;
        }
        
        console.log('[REGISTER] Sending save-diagnostic request with analyze-diagnostic format');
        console.log('[REGISTER] Request summary:', {
          subject: requestBody.subject,
          total_questions: requestBody.total_questions,
          time_taken: requestBody.time_taken,
          questions_list_length: requestBody.questions_list.length,
        });
        
        try {
          // Log the exact request body being sent
          console.log('[REGISTER] Request body:', {
            subject: requestBody.subject,
            total_questions: requestBody.total_questions,
            time_taken: requestBody.time_taken,
            questions_list_count: requestBody.questions_list.length,
            first_question: requestBody.questions_list[0],
          });
          
          const response = await api.post(endpoints.ai.saveDiagnostic, requestBody);
          
          console.log('[REGISTER] Diagnostic saved successfully:', response.data);
          
          // Update latest_quiz_id with the new quiz_id from backend (if provided)
          if (response.data?.quiz_id) {
            localStorage.setItem('latest_quiz_id', response.data.quiz_id);
            console.log('[REGISTER] Updated latest_quiz_id to:', response.data.quiz_id);
            
            // Remove guest diagnostic from localStorage after successful save
            localStorage.removeItem('guest_diagnostic');
            localStorage.removeItem('guest_quiz');
            localStorage.removeItem('guest_quiz_complete');
            console.log('[REGISTER] Removed guest diagnostic from localStorage');
            
            // Navigate to diagnostic results with new quiz_id
            navigate(`/diagnostic/${response.data.quiz_id}`);
            return;
          } else if (response.data?.diagnostic_id) {
            // If backend returns diagnostic_id, we need to get the quiz_id from the diagnostic
            console.warn('[REGISTER] Backend returned diagnostic_id but not quiz_id');
            // Keep diagnostic in localStorage for now
          }
          
          // Navigate to dashboard if no quiz_id returned
          navigate('/dashboard');
        } catch (saveError: any) {
          console.error('[REGISTER] Error saving diagnostic:', saveError);
          console.error('[REGISTER] Error status:', saveError?.response?.status);
          console.error('[REGISTER] Error response:', saveError?.response?.data);
          
          // Log detailed validation errors
          if (saveError?.response?.data?.fields) {
            console.error('[REGISTER] Validation errors (fields array):', saveError.response.data.fields);
            saveError.response.data.fields.forEach((fieldError: any, index: number) => {
              console.error(`[REGISTER] Field error ${index + 1}:`, fieldError);
              // Log the location (path) of the error
              if (fieldError.loc) {
                console.error(`[REGISTER] Error location (path):`, fieldError.loc);
                console.error(`[REGISTER] Error message:`, fieldError.msg);
                console.error(`[REGISTER] Error type:`, fieldError.type);
              }
              // Log the input that caused the error
              if (fieldError.input) {
                console.error(`[REGISTER] Invalid input:`, fieldError.input);
              }
            });
          }
          
          // Also check if there's a detail field (FastAPI/Pydantic format)
          if (saveError?.response?.data?.detail) {
            console.error('[REGISTER] Validation error details:', saveError.response.data.detail);
            if (Array.isArray(saveError.response.data.detail)) {
              saveError.response.data.detail.forEach((err: any, idx: number) => {
                console.error(`[REGISTER] Detail error ${idx + 1}:`, {
                  loc: err.loc,
                  msg: err.msg,
                  type: err.type,
                  input: err.input,
                });
              });
            }
          }
          
          // Log the exact request that was sent for debugging
          console.error('[REGISTER] Request that failed:', JSON.stringify(requestBody, null, 2));
          console.error('[REGISTER] Full error response:', saveError.response?.data);
          
          // If save endpoint doesn't exist (404) or fails, keep diagnostic in localStorage
          if (saveError?.response?.status === 404) {
            console.warn('[REGISTER] Save diagnostic endpoint not found (404) - keeping diagnostic in localStorage');
            console.warn('[REGISTER] Backend endpoint /api/ai/save-diagnostic does not exist');
            alert('Unable to save diagnostic: The save endpoint is not available. Your diagnostic results are still available in your browser storage.');
          } else if (saveError?.response?.status === 400) {
            console.error('[REGISTER] Bad request (400) - backend validation failed');
            const validationErrors = saveError?.response?.data?.fields || [];
            const errorMessages = validationErrors.map((err: any) => 
              `${err.field || 'Unknown field'}: ${err.message || 'Invalid value'}`
            ).join('\n');
            
            console.error('[REGISTER] Validation error details:', errorMessages);
            console.error('[REGISTER] Full validation response:', saveError.response.data);
            
            // Show user-friendly error message with details
            const userMessage = validationErrors.length > 0
              ? `Unable to save diagnostic: ${errorMessages}. Your diagnostic results are still available in your browser storage.`
              : 'Unable to save diagnostic: The backend endpoint expects a different data format. Your diagnostic results are still available in your browser storage.';
            alert(userMessage);
          } else {
            console.error('[REGISTER] Unexpected error saving diagnostic:', saveError?.message);
            alert('Unable to save diagnostic: An unexpected error occurred. Your diagnostic results are still available in your browser storage.');
          }
          
          // Keep diagnostic in localStorage on error - user can still access it
          // Navigate to dashboard - user can view diagnostic from localStorage
          navigate('/dashboard');
        }
      } else {
        // No guest diagnostic found
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('[REGISTER] Error in handleSaveDiagnostic:', err);
      // Navigate to dashboard even if there's an error
      navigate('/dashboard');
    } finally {
      setIsSavingDiagnostic(false);
    }
  };

  const handleSkipSave = () => {
    // Don't remove guest diagnostic - user might want to access it later
    // Just navigate to dashboard
    console.log('[REGISTER] User skipped saving diagnostic - keeping in localStorage');
    navigate('/dashboard');
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
      <SaveDiagnosticModal
        isOpen={showSaveModal}
        onSave={handleSaveDiagnostic}
        onSkip={handleSkipSave}
        isLoading={isSavingDiagnostic}
      />
    </>
  );
};

export default RegisterPage;

