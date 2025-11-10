/**
 * Quiz Hook
 * Manages quiz state, questions, and responses
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import endpoints from '../services/endpoints';
import { isAuthenticatedSync } from '../services/auth';

export interface Question {
  id: string;
  topic: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: 'A' | 'B' | 'C' | 'D';
  difficulty: string;
  subtopic?: string;
}

export interface QuestionResponse {
  id: number;
  topic: string;
  student_answer: 'A' | 'B' | 'C' | 'D';
  correct_answer: 'A' | 'B' | 'C' | 'D';
  is_correct: boolean;
  confidence?: number; // 1-5, optional
  explanation: string;
  time_spent_seconds: number;
}

export interface QuizState {
  questions: Question[];
  currentQuestionIndex: number;
  responses: Record<string, QuestionResponse>;
  startTime: number;
  timeSpent: Record<string, number>;
  quizId: string | null;
  isGuest: boolean;
}

/**
 * Fetch quiz questions
 */
export const useQuizQuestions = (total: number = 15) => {
  return useQuery({
    queryKey: ['questions', total],
    queryFn: async () => {
      const url = endpoints.quiz.questions(total);
      console.log('[QUIZ] Fetching questions from:', url);
      try {
        const response = await api.get(url);
        console.log('[QUIZ] Response status:', response.status);
        console.log('[QUIZ] Response data:', response.data);
        console.log('[QUIZ] Questions received:', response.data?.length || 0, 'questions');
        
        // Check if response is empty
        if (!response.data || response.data.length === 0) {
          console.warn('[QUIZ] ⚠️ WARNING: Questions database is empty!');
          console.warn('[QUIZ] ⚠️ Backend returned empty array. Please add questions to the database.');
        }
        
        return response.data as Question[];
      } catch (error: any) {
        console.error('[QUIZ] Error fetching questions:', error);
        console.error('[QUIZ] Error message:', error.message);
        console.error('[QUIZ] Error response:', error.response?.data);
        console.error('[QUIZ] Error status:', error.response?.status);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: 1000,
  });
};

/**
 * Start a new quiz session (authenticated users only)
 */
export const useStartQuiz = () => {
  return useMutation({
    mutationFn: async (totalQuestions: number = 15) => {
      const response = await api.post(endpoints.quiz.start, {
        totalQuestions,
      });
      return response.data;
    },
  });
};

/**
 * Submit quiz and get diagnostic
 */
export const useSubmitQuiz = () => {
  return useMutation({
    mutationFn: async (data: {
      subject: string;
      total_questions: number;
      time_taken: number; // in minutes
      questions_list: QuestionResponse[];
      quiz_id?: string;
    }) => {
      const response = await api.post(endpoints.ai.analyzeDiagnostic, data);
      return response.data;
    },
  });
};

/**
 * Custom hook for quiz management
 */
export const useQuiz = (totalQuestions: number = 15) => {
  const [quizState, setQuizState] = useState<QuizState>({
    questions: [],
    currentQuestionIndex: 0,
    responses: {},
    startTime: Date.now(),
    timeSpent: {},
    quizId: null,
    isGuest: !isAuthenticatedSync(),
  });

  // Fetch questions
  const { data: questions, isLoading: questionsLoading, error: questionsError } = useQuizQuestions(totalQuestions);
  const startQuizMutation = useStartQuiz();
  const submitQuizMutation = useSubmitQuiz();

  // Initialize quiz state with questions (but don't auto-load guest quiz)
  useEffect(() => {
    if (questions && questions.length > 0) {
      setQuizState((prev) => ({
        ...prev,
        questions,
        // Only update startTime if this is a fresh start (not resuming)
        // startTime will be set when resuming
        startTime: prev.startTime || Date.now(),
      }));
    }
  }, [questions]);

  // Calculate answered count (memoized to avoid recalculating on every render)
  const answeredCount = useMemo(() => {
    return Object.keys(quizState.responses).filter(
      (questionId) => {
        const response = quizState.responses[questionId];
        return response?.student_answer && 
               typeof response.student_answer === 'string' &&
               ['A', 'B', 'C', 'D'].includes(response.student_answer.trim().toUpperCase());
      }
    ).length;
  }, [quizState.responses]);

  // Auto-save quiz data for guest users
  // CRITICAL: Only save when answeredCount > 0, preserve timestamp forever
  useEffect(() => {
    // Skip if authenticated or no questions loaded
    if (isAuthenticatedSync() || quizState.questions.length === 0) {
      return;
    }
    
    // Get existing quiz data FIRST to preserve original timestamp
    const existingQuiz = localStorage.getItem('guest_quiz');
    let originalTimestamp: string | undefined;
    let originalStartTime: number | undefined;
    
    if (existingQuiz) {
      try {
        const existingData = JSON.parse(existingQuiz);
        // CRITICAL: Always preserve original timestamp and startTime if they exist
        originalTimestamp = existingData.timestamp;
        originalStartTime = existingData.startTime;
      } catch {
        // If parsing fails, existing data is corrupted - will create new
      }
    }
    
    // CRITICAL: Only auto-save if there is at least 1 valid answered question
    // NEVER save if answeredCount === 0 (this prevents creating invalid quiz data)
    if (answeredCount > 0) {
      const quizData = {
        questions: quizState.questions,
        currentQuestionIndex: quizState.currentQuestionIndex,
        responses: quizState.responses,
        timeSpent: quizState.timeSpent,
        // CRITICAL: Preserve original values if they exist, never overwrite with new timestamp
        startTime: originalStartTime !== undefined ? originalStartTime : quizState.startTime,
        timestamp: originalTimestamp !== undefined ? originalTimestamp : new Date().toISOString(),
      };
      
      localStorage.setItem('guest_quiz', JSON.stringify(quizData));
    } else {
      // answeredCount === 0 - clear any existing invalid quiz data
      if (existingQuiz) {
        console.log('[useQuiz] answeredCount is 0 - clearing invalid quiz data');
        localStorage.removeItem('guest_quiz');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answeredCount, quizState.questions.length, quizState.currentQuestionIndex, JSON.stringify(quizState.responses), JSON.stringify(quizState.timeSpent)]);

  const startQuiz = useCallback(async () => {
    if (isAuthenticatedSync()) {
      try {
        const result = await startQuizMutation.mutateAsync(totalQuestions);
        setQuizState((prev) => ({
          ...prev,
          quizId: result.quiz_id || null,
        }));
        return result;
      } catch (error) {
        console.error('Failed to start quiz:', error);
        throw error;
      }
    }
    // Guest mode - no backend call needed
    return { quiz_id: null };
  }, [totalQuestions, startQuizMutation]);

  const updateResponse = useCallback((questionId: string, response: Partial<QuestionResponse>) => {
    setQuizState((prev) => {
      const currentResponse = prev.responses[questionId] || {
        id: parseInt(questionId.replace('q', '')),
        topic: prev.questions.find((q) => q.id === questionId)?.topic || '',
        student_answer: 'A',
        correct_answer: prev.questions.find((q) => q.id === questionId)?.correct_answer || 'A',
        is_correct: false,
        explanation: '',
        time_spent_seconds: 0,
      };

      return {
        ...prev,
        responses: {
          ...prev.responses,
          [questionId]: {
            ...currentResponse,
            ...response,
          },
        },
      };
    });
  }, []);

  const updateTimeSpent = useCallback((questionId: string, seconds: number) => {
    setQuizState((prev) => ({
      ...prev,
      timeSpent: {
        ...prev.timeSpent,
        [questionId]: seconds,
      },
    }));
  }, []);

  // Check if there's a saved guest quiz with VALID answered questions
  // ONLY returns true if there is at least 1 answered question
  const hasSavedQuiz = useCallback((): boolean => {
    if (isAuthenticatedSync()) return false;
    const savedQuiz = localStorage.getItem('guest_quiz');
    if (!savedQuiz) return false;
    
    try {
      const data = JSON.parse(savedQuiz);
      // Must have questions and currentQuestionIndex
      if (!data.questions || data.currentQuestionIndex === undefined) return false;
      
      // Count ONLY valid answered questions (must have student_answer that is A, B, C, or D)
      const answeredCount = Object.keys(data.responses || {}).filter(
        (questionId) => {
          const response = data.responses[questionId];
          return response?.student_answer && 
                 typeof response.student_answer === 'string' &&
                 ['A', 'B', 'C', 'D'].includes(response.student_answer.trim().toUpperCase());
        }
      ).length;
      
      // ONLY return true if there is at least 1 valid answered question
      return answeredCount > 0;
    } catch {
      return false;
    }
  }, []);

  // Get saved quiz progress info
  // ONLY returns progress if there is at least 1 valid answered question
  // Returns null if answeredQuestions === 0
  const getSavedQuizProgress = useCallback(() => {
    if (isAuthenticatedSync()) return null;
    const savedQuiz = localStorage.getItem('guest_quiz');
    if (!savedQuiz) return null;
    
    try {
      const data = JSON.parse(savedQuiz);
      if (!data.questions || data.currentQuestionIndex === undefined) return null;
      
      const totalQuestions = data.questions.length || 0;
      const responses = data.responses || {};
      
      // Count ONLY valid answered questions (must have student_answer that is A, B, C, or D)
      const answeredCount = Object.keys(responses).filter(
        (questionId) => {
          const response = responses[questionId];
          return response?.student_answer && 
                 typeof response.student_answer === 'string' &&
                 ['A', 'B', 'C', 'D'].includes(response.student_answer.trim().toUpperCase());
        }
      ).length;
      
      // CRITICAL: Only return progress if there is at least 1 valid answered question
      // If answeredCount === 0, return null (no valid quiz to resume)
      if (answeredCount === 0) {
        console.log('[useQuiz] getSavedQuizProgress: No valid answered questions - returning null');
        return null;
      }
      
      // Return progress with preserved timestamp
      return {
        currentQuestion: data.currentQuestionIndex || 0,
        totalQuestions,
        answeredQuestions: answeredCount,
        timestamp: data.timestamp || new Date().toISOString(), // Use saved timestamp
      };
    } catch (error) {
      console.error('[useQuiz] getSavedQuizProgress: Error parsing saved quiz:', error);
      return null;
    }
  }, []);

  // Load saved guest quiz (called when user chooses to resume)
  const loadSavedQuiz = useCallback(() => {
    if (isAuthenticatedSync()) {
      console.warn('[useQuiz] Cannot load saved quiz for authenticated users');
      return;
    }
    
    const savedQuiz = localStorage.getItem('guest_quiz');
    if (!savedQuiz) {
      console.warn('[useQuiz] No saved quiz found');
      return;
    }
    
    try {
      const data = JSON.parse(savedQuiz);
      if (data.currentQuestionIndex !== undefined) {
        // Use current questions from API (don't use saved questions as they might be outdated)
        // Only restore the progress state (responses, timeSpent, currentQuestionIndex, startTime)
        setQuizState((prev) => {
          // Filter responses to only include questions that exist in current questions
          const currentQuestionIds = new Set(prev.questions.map(q => q.id));
          const filteredResponses: Record<string, QuestionResponse> = {};
          const filteredTimeSpent: Record<string, number> = {};
          
          Object.keys(data.responses || {}).forEach((questionId) => {
            if (currentQuestionIds.has(questionId)) {
              filteredResponses[questionId] = data.responses[questionId];
            }
          });
          
          Object.keys(data.timeSpent || {}).forEach((questionId) => {
            if (currentQuestionIds.has(questionId)) {
              filteredTimeSpent[questionId] = data.timeSpent[questionId];
            }
          });
          
          // Ensure currentQuestionIndex is within bounds
          const maxIndex = Math.max(0, prev.questions.length - 1);
          const savedIndex = Math.min(data.currentQuestionIndex || 0, maxIndex);
          
          return {
            ...prev,
            currentQuestionIndex: savedIndex,
            responses: filteredResponses,
            timeSpent: filteredTimeSpent,
            startTime: data.startTime || Date.now(),
          };
        });
        console.log('[useQuiz] Loaded saved quiz:', {
          currentQuestion: data.currentQuestionIndex,
          answeredQuestions: Object.keys(data.responses || {}).length,
        });
      }
    } catch (error) {
      console.error('[useQuiz] Error loading saved quiz:', error);
    }
  }, []);

  // Clear saved guest quiz (called when user chooses to start fresh)
  const clearSavedQuiz = useCallback(() => {
    if (isAuthenticatedSync()) {
      console.warn('[useQuiz] Cannot clear saved quiz for authenticated users');
      return;
    }
    
    localStorage.removeItem('guest_quiz');
    localStorage.removeItem('guest_quiz_complete');
    console.log('[useQuiz] Cleared saved guest quiz');
    
    // Reset quiz state to fresh start
    setQuizState((prev) => ({
      ...prev,
      currentQuestionIndex: 0,
      responses: {},
      timeSpent: {},
      startTime: Date.now(),
    }));
  }, []);

  const goToQuestion = useCallback((index: number) => {
    setQuizState((prev) => ({
      ...prev,
      currentQuestionIndex: Math.max(0, Math.min(index, prev.questions.length - 1)),
    }));
  }, []);

  const submitQuiz = useCallback(async () => {
    const questionsList: QuestionResponse[] = quizState.questions.map((q) => {
      const response = quizState.responses[q.id] || {
        id: parseInt(q.id.replace('q', '')),
        topic: q.topic,
        student_answer: 'A' as const,
        correct_answer: q.correct_answer,
        is_correct: false,
        explanation: '',
        time_spent_seconds: 0,
      };

      return {
        ...response,
        time_spent_seconds: quizState.timeSpent[q.id] || 0,
      };
    });

    const totalTimeMinutes = (Date.now() - quizState.startTime) / 1000 / 60;

    try {
      const result = await submitQuizMutation.mutateAsync({
        subject: 'Mathematics',
        total_questions: quizState.questions.length,
        time_taken: totalTimeMinutes,
        questions_list: questionsList,
        quiz_id: quizState.quizId || undefined,
      });

      console.log('[useQuiz] Submit quiz result:', result);
      console.log('[useQuiz] Result keys:', Object.keys(result || {}));

      // Handle different response structures
      // Backend might return: { diagnostic: {...} } or just diagnostic object directly
      let diagnosticData: any;
      let quizIdFromResponse: string | undefined;

      if (result?.diagnostic) {
        // Nested structure: { diagnostic: {...}, quiz: {...}, responses: [...] }
        console.log('[useQuiz] Result has nested diagnostic structure');
        diagnosticData = result.diagnostic;
        quizIdFromResponse = result.diagnostic?.quiz_id || result.quiz?.id;
      } else if (result?.quiz_id || result?.id) {
        // Direct diagnostic object
        console.log('[useQuiz] Result is direct diagnostic object');
        diagnosticData = result;
        quizIdFromResponse = result.quiz_id || result.id;
      } else {
        // Fallback
        console.log('[useQuiz] Using result as-is');
        diagnosticData = result;
        quizIdFromResponse = result?.quiz_id || result?.id;
      }

      // Store diagnostic for guest users
      if (!isAuthenticatedSync()) {
        localStorage.setItem('guest_diagnostic', JSON.stringify({
          diagnostic: diagnosticData,
          quizData: {
            questions: quizState.questions,
            responses: quizState.responses,
            totalTime: totalTimeMinutes,
          },
          timestamp: new Date().toISOString(),
        }));
      }

      // Return diagnostic data with quiz_id for navigation
      return {
        ...diagnosticData,
        quiz_id: quizIdFromResponse || quizState.quizId || diagnosticData?.quiz_id || diagnosticData?.id,
      };
    } catch (error: any) {
      console.error('[useQuiz] Failed to submit quiz:', error);
      
      // Handle 401 error for guest users - backend might require authentication
      if (error?.response?.status === 401 && !isAuthenticatedSync()) {
        console.error('[useQuiz] Guest user received 401 error - backend requires authentication');
        console.error('[useQuiz] Backend endpoint /api/ai/analyze-diagnostic should allow guest access');
        console.error('[useQuiz] Error details:', error?.response?.data);
        
        // Create a more helpful error message for guest users
        const guestError = new Error(
          'Authentication required: The backend endpoint requires authentication. Please create an account to submit your quiz and view your diagnostic results. For guest mode to work, the backend should allow unauthenticated requests to /api/ai/analyze-diagnostic.'
        );
        (guestError as any).isGuestError = true;
        (guestError as any).originalError = error;
        (guestError as any).statusCode = 401;
        throw guestError;
      }
      
      throw error;
    }
  }, [quizState, submitQuizMutation]);

  return {
    quizState,
    questions,
    questionsLoading,
    questionsError,
    startQuiz,
    updateResponse,
    updateTimeSpent,
    goToQuestion,
    submitQuiz,
    isSubmitting: submitQuizMutation.isPending,
    hasSavedQuiz,
    getSavedQuizProgress,
    loadSavedQuiz,
    clearSavedQuiz,
  };
};

