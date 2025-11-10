import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import GuestModeBanner from '../components/ui/GuestModeBanner';
import ResumeQuizModal from '../components/ui/ResumeQuizModal';
import { useQuiz } from '../hooks/useQuiz';
import { isAuthenticatedSync } from '../services/auth';

const QuizPage = () => {
  const navigate = useNavigate();
  const [showGuestBanner, setShowGuestBanner] = useState(true);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [quizInitialized, setQuizInitialized] = useState(false);
  const [explanationErrors, setExplanationErrors] = useState<Record<string, boolean>>({});
  const [questionStartTimes, setQuestionStartTimes] = useState<Record<string, number>>({});
  const questionTimeRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track if we've already attempted to start the quiz (prevent duplicate calls)
  const startQuizAttemptedRef = useRef(false);

  const isGuest = !isAuthenticatedSync();
  
  console.log('[QUIZ PAGE] Component mounted');
  console.log('[QUIZ PAGE] Is guest:', isGuest);
  
  const {
    quizState,
    questions,
    questionsLoading,
    questionsError,
    startQuiz,
    updateResponse,
    updateTimeSpent,
    goToQuestion,
    submitQuiz,
    isSubmitting,
    hasSavedQuiz,
    getSavedQuizProgress,
    loadSavedQuiz,
    clearSavedQuiz,
  } = useQuiz(15); // 15 questions for diagnostic quiz

  console.log('[QUIZ PAGE] Questions loading:', questionsLoading);
  console.log('[QUIZ PAGE] Questions error:', questionsError);
  console.log('[QUIZ PAGE] Questions count:', questions?.length || 0);

  const currentQuestion = questions?.[quizState.currentQuestionIndex];
  const currentResponse = currentQuestion
    ? quizState.responses[currentQuestion.id]
    : null;

  // Track time spent on current question
  useEffect(() => {
    if (!currentQuestion) return;

    const questionId = currentQuestion.id;
    const startTime = Date.now();
    setQuestionStartTimes((prev) => ({
      ...prev,
      [questionId]: startTime,
    }));

    // Update time every second
    questionTimeRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      updateTimeSpent(questionId, elapsed);
    }, 1000);

    return () => {
      if (questionTimeRef.current) {
        clearInterval(questionTimeRef.current);
      }
      // Save time spent when leaving question
      if (questionStartTimes[questionId]) {
        const elapsed = Math.floor((Date.now() - questionStartTimes[questionId]) / 1000);
        updateTimeSpent(questionId, elapsed);
      }
    };
  }, [currentQuestion?.id]);

  // Check for saved quiz on mount (guest mode only)
  useEffect(() => {
    // Prevent multiple calls - only run once
    if (startQuizAttemptedRef.current) {
      return;
    }
    
    if (isGuest && questions && questions.length > 0 && !quizInitialized) {
      if (hasSavedQuiz()) {
        console.log('[QUIZ PAGE] Found saved quiz - showing resume modal');
        setShowResumeModal(true);
        startQuizAttemptedRef.current = true; // Mark as attempted
      } else {
        // No saved quiz - initialize as fresh
        console.log('[QUIZ PAGE] No saved quiz - starting fresh');
        setQuizInitialized(true);
        startQuizAttemptedRef.current = true; // Mark as attempted
      }
    } else if (!isGuest && questions && questions.length > 0 && !quizState.quizId && !startQuizAttemptedRef.current) {
      // Authenticated user - start quiz normally (only once)
      console.log('[QUIZ PAGE] Starting quiz for authenticated user');
      startQuizAttemptedRef.current = true; // Mark as attempted BEFORE calling startQuiz
      startQuiz().catch((error) => {
        console.error('[QUIZ PAGE] Failed to start quiz:', error);
        // Reset flag on error so user can retry
        startQuizAttemptedRef.current = false;
      });
      setQuizInitialized(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questions, isGuest, quizInitialized, hasSavedQuiz, quizState.quizId]); // startQuiz is stable (useCallback), ref prevents duplicates

  // Handle resume quiz
  const handleResumeQuiz = () => {
    console.log('[QUIZ PAGE] User chose to resume quiz');
    loadSavedQuiz();
    setShowResumeModal(false);
    setQuizInitialized(true);
    startQuizAttemptedRef.current = true; // Mark as attempted
  };

  // Handle start fresh quiz
  const handleStartFresh = () => {
    console.log('[QUIZ PAGE] User chose to start fresh quiz');
    clearSavedQuiz();
    setShowResumeModal(false);
    setQuizInitialized(true);
    startQuizAttemptedRef.current = true; // Mark as attempted
  };

  // Clear explanation error when question changes
  useEffect(() => {
    if (currentQuestion) {
      setExplanationErrors((prev) => ({
        ...prev,
        [currentQuestion.id]: false,
      }));
    }
  }, [currentQuestion?.id]);

  // Show resume modal if there's a saved quiz
  const savedQuizProgress = getSavedQuizProgress();

  // Show loading state if questions are still loading
  if (questionsLoading) {
    console.log('[QUIZ PAGE] Still loading questions...');
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Show resume modal if there's a saved quiz and quiz hasn't been initialized yet
  if (showResumeModal && savedQuizProgress) {
    return (
      <>
        <ResumeQuizModal
          isOpen={showResumeModal}
          onResume={handleResumeQuiz}
          onStartFresh={handleStartFresh}
          quizProgress={savedQuizProgress}
        />
        {/* Show loading state behind modal */}
        <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading quiz...</p>
          </div>
        </div>
      </>
    );
  }

  // Don't show quiz content until initialized
  if (!quizInitialized && isGuest) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing quiz...</p>
        </div>
      </div>
    );
  }

  // Show error state if questions failed to load
  if (questionsError) {
    console.error('[QUIZ PAGE] Questions error:', questionsError);
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <Card.Body>
            <div className="text-center">
              <p className="text-red-600 mb-4">Failed to load questions</p>
              <p className="text-sm text-gray-500 mb-4">
                {questionsError instanceof Error ? questionsError.message : 'Unknown error occurred'}
              </p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Show error if questions failed to load or are empty
  if (!questions || questions.length === 0) {
    console.error('[QUIZ PAGE] No questions available');
    console.error('[QUIZ PAGE] Questions database is empty. Please add questions to the database.');
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <Card.Body>
            <div className="text-center">
              <p className="text-red-600 mb-4 font-semibold">No Questions Available</p>
              <p className="text-sm text-gray-600 mb-2">
                The questions database is currently empty.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Please add questions to the database to enable the quiz feature.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm font-semibold text-yellow-800 mb-2">To fix this:</p>
                <ol className="text-xs text-yellow-700 list-decimal list-inside space-y-1">
                  <li>Go to Supabase Dashboard</li>
                  <li>Navigate to Table Editor</li>
                  <li>Select the <code className="bg-yellow-100 px-1 rounded">questions</code> table</li>
                  <li>Add quiz questions to the database</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Retry
              </Button>
              <p className="text-xs text-gray-400 mt-4">
                See QUESTIONS_DATABASE_SETUP.md for detailed instructions
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Show error if no current question
  if (!currentQuestion) {
    console.error('[QUIZ PAGE] No current question available');
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <Card.Body>
            <div className="text-center">
              <p className="text-red-600 mb-4">Unable to load current question</p>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  const selectedAnswer = currentResponse?.student_answer;
  const correctAnswer = currentQuestion.correct_answer;
  const isAnswerCorrect = selectedAnswer === correctAnswer;
  const isAnswerWrong = selectedAnswer && !isAnswerCorrect;
  const isExplanationRequired = !!selectedAnswer; // Required for ALL questions now
  const explanation = currentResponse?.explanation || '';
  const isExplanationMissing = isExplanationRequired && !explanation.trim();
  const hasExplanationError = explanationErrors[currentQuestion.id] || false;

  const progress = ((quizState.currentQuestionIndex + 1) / questions.length) * 100;
  const totalTime = Math.floor((Date.now() - quizState.startTime) / 1000);
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optionId: 'A' | 'B' | 'C' | 'D') => {
    updateResponse(currentQuestion.id, {
      student_answer: optionId,
      correct_answer: correctAnswer,
      is_correct: optionId === correctAnswer,
      topic: currentQuestion.topic,
      id: parseInt(currentQuestion.id.replace('q', '')) || 0,
      explanation: explanation,
      time_spent_seconds: quizState.timeSpent[currentQuestion.id] || 0,
    });

    // Clear error when user selects an answer
    setExplanationErrors((prev) => ({
      ...prev,
      [currentQuestion.id]: false,
    }));
  };

  const handleConfidenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (currentResponse) {
      updateResponse(currentQuestion.id, {
        ...currentResponse,
        confidence: value,
      });
    }
  };

  const handleExplanationChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (currentResponse) {
      updateResponse(currentQuestion.id, {
        ...currentResponse,
        explanation: value,
      });
    } else if (selectedAnswer) {
      updateResponse(currentQuestion.id, {
        student_answer: selectedAnswer,
        correct_answer: correctAnswer,
        is_correct: isAnswerCorrect,
        topic: currentQuestion.topic,
        id: parseInt(currentQuestion.id.replace('q', '')) || 0,
        explanation: value,
        time_spent_seconds: quizState.timeSpent[currentQuestion.id] || 0,
      });
    }

    // Clear error when user starts typing
    if (hasExplanationError) {
      setExplanationErrors((prev) => ({
        ...prev,
        [currentQuestion.id]: false,
      }));
    }
  };

  const validateExplanation = (): boolean => {
    if (isExplanationMissing) {
      setExplanationErrors((prev) => ({
        ...prev,
        [currentQuestion.id]: true,
      }));
      return false;
    }
    return true;
  };

  const handleNextQuestion = () => {
    if (!validateExplanation()) {
      return;
    }

    if (quizState.currentQuestionIndex < questions.length - 1) {
      goToQuestion(quizState.currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (quizState.currentQuestionIndex > 0) {
      goToQuestion(quizState.currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // Stop timer immediately
    if (questionTimeRef.current) {
      clearInterval(questionTimeRef.current);
      questionTimeRef.current = null;
    }

    // Validate all explanations for ALL questions
    let hasErrors = false;
    questions.forEach((q) => {
      const response = quizState.responses[q.id];
      if (response && response.student_answer && !response.explanation?.trim()) {
        setExplanationErrors((prev) => ({
          ...prev,
          [q.id]: true,
        }));
        hasErrors = true;
      }
    });

    if (hasErrors) {
      // Go to first question with error
      const firstErrorIndex = questions.findIndex(
        (q) => {
          const response = quizState.responses[q.id];
          return response && response.student_answer && !response.explanation?.trim();
        }
      );
      if (firstErrorIndex !== -1) {
        goToQuestion(firstErrorIndex);
      }
      return;
    }

    // Validate current question explanation
    if (!validateExplanation()) {
      return;
    }

    try {
      const diagnostic = await submitQuiz();
      console.log('[QUIZ PAGE] Diagnostic received:', diagnostic);
      console.log('[QUIZ PAGE] Diagnostic ID:', diagnostic.id);
      console.log('[QUIZ PAGE] Quiz ID:', diagnostic.quiz_id);
      
      // For guest users: quiz_id will be null, use diagnostic.id for navigation
      // For authenticated users: use quiz_id if available, otherwise diagnostic.id
      const isGuest = !isAuthenticatedSync();
      let navigationId: string;
      
      if (isGuest) {
        // Guest diagnostics don't have a real quiz_id - use diagnostic.id
        // But don't store it as latest_quiz_id (it's not a real quiz_id)
        navigationId = diagnostic.id;
        console.log('[QUIZ PAGE] Guest user - using diagnostic.id for navigation:', navigationId);
        // Don't store null quiz_id in localStorage - diagnostic is already in localStorage
      } else {
        // Authenticated user - use quiz_id if available
        navigationId = diagnostic.quiz_id || diagnostic.id;
        if (diagnostic.quiz_id) {
          localStorage.setItem('latest_quiz_id', diagnostic.quiz_id);
          console.log('[QUIZ PAGE] Stored latest quiz_id in localStorage:', diagnostic.quiz_id);
        } else {
          console.warn('[QUIZ PAGE] Warning: quiz_id is null for authenticated user - using diagnostic.id');
        }
        console.log('[QUIZ PAGE] Navigating to diagnostic with quiz ID:', navigationId);
      }
      
      // Navigate to results page
      // For guests: diagnostic page will use localStorage (quizId will be null/undefined)
      // For authenticated: diagnostic page will use quiz_id from URL
      navigate(`/diagnostic/${navigationId}`);
    } catch (error: any) {
        console.error('[QUIZ PAGE] Failed to submit quiz:', error);
        
        // Handle timeout errors (408)
        if (error?.isTimeout || error?.response?.status === 408) {
          console.error('[QUIZ PAGE] Request timeout - quiz submission took too long');
          const timeoutMessage = 
            'The quiz submission is taking longer than expected. This might be because the AI analysis is processing.\n\n' +
            'Your quiz data has been saved. Would you like to:\n' +
            '1. Try submitting again\n' +
            '2. Save your progress and try later';
          
          if (confirm(timeoutMessage)) {
            // User wants to retry - the API interceptor will handle retries automatically
            // Just call submitQuiz again
            try {
              const diagnostic = await submitQuiz();
              // Handle success...
              const isGuest = !isAuthenticatedSync();
              let navigationId: string;
              
              if (isGuest) {
                navigationId = diagnostic.id;
              } else {
                navigationId = diagnostic.quiz_id || diagnostic.id;
                if (diagnostic.quiz_id) {
                  localStorage.setItem('latest_quiz_id', diagnostic.quiz_id);
                }
              }
              
              navigate(`/diagnostic/${navigationId}`);
            } catch (retryError) {
              console.error('[QUIZ PAGE] Retry also failed:', retryError);
              alert('Submission failed after retry. Your quiz data is saved in your browser. Please try again later or contact support.');
            }
          } else {
            // Save quiz data for later
            localStorage.setItem('pending_quiz_submission', JSON.stringify({
              questions: quizState.questions,
              responses: quizState.responses,
              timeSpent: quizState.timeSpent,
              startTime: quizState.startTime,
              timestamp: new Date().toISOString(),
            }));
            alert('Your quiz progress has been saved. You can return later to submit it.');
          }
          return;
        }
        
        // Handle guest user authentication error
        if (error?.isGuestError || (error?.response?.status === 401 && isGuest)) {
          const userMessage = 
            'Unable to submit quiz: Authentication is required.\n\n' +
            'To submit your quiz and view your diagnostic results, please create an account.\n\n' +
            'Would you like to create an account now?';
          
          if (confirm(userMessage)) {
            // Save quiz data to localStorage so user can resume after registration
            localStorage.setItem('pending_quiz_submission', JSON.stringify({
              questions: quizState.questions,
              responses: quizState.responses,
              timeSpent: quizState.timeSpent,
              startTime: quizState.startTime,
              timestamp: new Date().toISOString(),
            }));
            navigate('/register');
          }
        } else {
          // Other errors
          const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error occurred';
          alert(`Failed to submit quiz: ${errorMessage}\n\nPlease try again.`);
        }
      }
  };

  const options = [
    { id: 'A' as const, text: currentQuestion.option_a },
    { id: 'B' as const, text: currentQuestion.option_b },
    { id: 'C' as const, text: currentQuestion.option_c },
    { id: 'D' as const, text: currentQuestion.option_d },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        {/* Guest Mode Banner */}
        {isGuest && showGuestBanner && (
          <GuestModeBanner onDismiss={() => setShowGuestBanner(false)} />
        )}

        {/* Quiz Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            JAMB Diagnostic Quiz
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700 mr-2">
                Question {quizState.currentQuestionIndex + 1} of {questions.length}
              </span>
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-md shadow-sm">
              <Clock className="h-5 w-5 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                {formatTime(totalTime)}
              </span>
            </div>
          </div>
          <ProgressBar progress={progress} color="blue" />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <Card.Body>
            <h2 className="text-lg font-medium text-gray-900 mb-6">
              {currentQuestion.question_text}
            </h2>

            <div className="space-y-3 mb-6">
              {options.map((option) => (
                <div
                  key={option.id}
                  className={`
                    border rounded-md p-4 cursor-pointer transition-colors
                    ${
                      selectedAnswer === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }
                  `}
                  onClick={() => handleSelectOption(option.id)}
                >
                  <div className="flex items-center">
                    <div
                      className={`
                        flex items-center justify-center w-6 h-6 rounded-full mr-3
                        ${
                          selectedAnswer === option.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-700'
                        }
                      `}
                    >
                      <span className="text-sm font-medium uppercase">
                        {option.id}
                      </span>
                    </div>
                    <span className="text-gray-800">{option.text}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Confidence Slider */}
            {selectedAnswer && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How confident are you in this answer? (Optional)
                </label>
                <div className="flex items-center">
                  <span className="text-xs text-gray-500 mr-2">Not confident</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={currentResponse?.confidence || 3}
                    onChange={handleConfidenceChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 ml-2">Very confident</span>
                </div>
                <div className="text-center mt-1">
                  <span className="text-sm font-medium text-gray-700">
                    {currentResponse?.confidence || 3}/5
                  </span>
                </div>
              </div>
            )}

            {/* Explanation Textarea */}
            {selectedAnswer && (
              <div>
                <label
                  className="block text-sm font-medium mb-2 text-red-600"
                >
                  Explain your reasoning (required)
                  <span className="text-red-600 ml-1">*</span>
                </label>
                <textarea
                  value={explanation}
                  onChange={handleExplanationChange}
                  className={`
                    w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${
                      hasExplanationError
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-blue-500'
                    }
                  `}
                  rows={3}
                  placeholder="Explain the steps you used to solve and why you did these steps..."
                />
                {!hasExplanationError && (
                  <p className="text-xs text-gray-500 mt-1">
                    Please explain the steps you used to solve and why you did these steps.
                  </p>
                )}
                {hasExplanationError && (
                  <p className="mt-1 text-sm text-red-600">
                    Please explain the steps you used to solve and why you did these steps.
                  </p>
                )}
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="secondary"
            onClick={handlePreviousQuestion}
            disabled={quizState.currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          {quizState.currentQuestionIndex === questions.length - 1 ? (
            <Button
              variant="primary"
              onClick={handleSubmitQuiz}
              isLoading={isSubmitting}
            >
              Submit Quiz
            </Button>
          ) : (
            <Button variant="primary" onClick={handleNextQuestion}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Question Navigation Dots */}
        <div className="mt-8">
          <div className="flex flex-wrap justify-center gap-2">
            {questions.map((_, index) => {
              const q = questions[index];
              const response = quizState.responses[q.id];
              const hasAnswer = !!response?.student_answer;
              const hasError =
                response && response.student_answer && !response.explanation?.trim();

              return (
                <button
                  key={index}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium
                    ${
                      index === quizState.currentQuestionIndex
                        ? 'bg-blue-500 text-white'
                        : hasAnswer
                        ? hasError
                          ? 'bg-red-100 text-red-700 border-2 border-red-500'
                          : 'bg-blue-100 text-blue-700 border border-blue-500'
                        : 'bg-gray-200 text-gray-700'
                    }
                  `}
                  onClick={() => goToQuestion(index)}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;

