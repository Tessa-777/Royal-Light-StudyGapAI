/**
 * Quiz Hook
 * Manages quiz state, questions, and responses
 */

import { useState, useEffect, useCallback } from 'react';
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

  // Auto-save quiz data for guest users
  // Only save when there are actual changes to avoid unnecessary writes
  useEffect(() => {
    if (!isAuthenticatedSync() && quizState.questions.length > 0) {
      // Only save if we have responses or the quiz has started
      const hasResponses = Object.keys(quizState.responses).length > 0;
      const hasStarted = quizState.currentQuestionIndex > 0 || hasResponses;
      
      if (hasStarted) {
        const quizData = {
          questions: quizState.questions,
          currentQuestionIndex: quizState.currentQuestionIndex,
          responses: quizState.responses,
          timeSpent: quizState.timeSpent,
          startTime: quizState.startTime,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem('guest_quiz', JSON.stringify(quizData));
        console.log('[useQuiz] Auto-saved quiz data:', {
          currentQuestion: quizState.currentQuestionIndex,
          responsesCount: Object.keys(quizState.responses).length,
          answeredCount: Object.keys(quizState.responses).filter(
            (id) => quizState.responses[id]?.student_answer
          ).length,
        });
      }
    }
  }, [quizState.questions.length, quizState.currentQuestionIndex, quizState.responses, quizState.timeSpent, quizState.startTime]);

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

  // Check if there's a saved guest quiz that can be resumed
  // Only return true if there are answered questions (answeredQuestions > 0)
  // If answeredQuestions === 0, the quiz is either not started or submitted/completed - don't allow resumption
  const hasSavedQuiz = useCallback((): boolean => {
    if (isAuthenticatedSync()) return false;
    const savedQuiz = localStorage.getItem('guest_quiz');
    if (!savedQuiz) return false;
    try {
      const data = JSON.parse(savedQuiz);
      // Check if quiz data exists
      if (!data.questions || data.currentQuestionIndex === undefined) return false;
      
      // Count answered questions (only count responses with student_answer)
      const answeredCount = Object.keys(data.responses || {}).filter(
        (questionId) => data.responses[questionId]?.student_answer
      ).length;
      
      // Only allow resumption if there are answered questions > 0
      // If answeredQuestions === 0, the quiz is not started or was cleared/submitted - don't show resume option
      const canResume = answeredCount > 0;
      
      console.log('[useQuiz] hasSavedQuiz check:', {
        answeredCount,
        canResume,
        reason: answeredCount === 0 ? 'no answered questions' : 'has answered questions',
      });
      
      return canResume;
    } catch {
      return false;
    }
  }, []);

  // Get saved quiz progress info
  // Only returns progress if there are answered questions > 0
  // If answeredQuestions === 0, don't show resume option (quiz not started or cleared/submitted)
  const getSavedQuizProgress = useCallback(() => {
    if (isAuthenticatedSync()) return null;
    const savedQuiz = localStorage.getItem('guest_quiz');
    if (!savedQuiz) {
      console.log('[useQuiz] getSavedQuizProgress: No saved quiz in localStorage');
      return null;
    }
    try {
      const data = JSON.parse(savedQuiz);
      if (!data.questions || data.currentQuestionIndex === undefined) {
        console.log('[useQuiz] getSavedQuizProgress: Invalid quiz data structure');
        return null;
      }
      
      const totalQuestions = data.questions.length || 0;
      const responses = data.responses || {};
      
      console.log('[useQuiz] getSavedQuizProgress: Analyzing responses...', {
        totalResponses: Object.keys(responses).length,
        responseKeys: Object.keys(responses),
      });
      
      // Count answered questions (only count responses with student_answer)
      // Also check if student_answer is not empty string
      const answeredCount = Object.keys(responses).filter(
        (questionId) => {
          const response = responses[questionId];
          const hasAnswer = response?.student_answer && 
                           response.student_answer.trim() !== '' &&
                           ['A', 'B', 'C', 'D'].includes(response.student_answer);
          if (hasAnswer) {
            console.log('[useQuiz] Found answered question:', questionId, response.student_answer);
          }
          return hasAnswer;
        }
      ).length;
      
      console.log('[useQuiz] getSavedQuizProgress: Answered count:', answeredCount, 'out of', totalQuestions);
      
      // Only return progress if there are answered questions > 0
      // If answeredQuestions === 0, don't show resume option (quiz not started or cleared/submitted)
      if (answeredCount === 0) {
        console.log('[useQuiz] getSavedQuizProgress: Quiz cannot be resumed - no answered questions');
        // Debug: Show sample responses to understand structure
        const sampleResponses = Object.keys(responses).slice(0, 3).map(key => ({
          questionId: key,
          response: responses[key],
        }));
        console.log('[useQuiz] getSavedQuizProgress: Sample responses:', sampleResponses);
        return null;
      }
      
      return {
        currentQuestion: data.currentQuestionIndex || 0,
        totalQuestions,
        answeredQuestions: answeredCount,
        timestamp: data.timestamp,
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
        
        // Clear guest quiz after successful submission
        // The quiz is complete, so there's nothing to resume
        localStorage.removeItem('guest_quiz');
        localStorage.removeItem('guest_quiz_complete');
        console.log('[useQuiz] Cleared guest_quiz after successful submission');
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

