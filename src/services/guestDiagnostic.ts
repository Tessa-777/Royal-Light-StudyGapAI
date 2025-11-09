/**
 * Guest Diagnostic Service
 * Handles saving guest diagnostic data after user authentication
 */

import api from './api';
import endpoints from './endpoints';

export interface GuestQuizData {
  questions: Array<{
    id: string;
    question_text: string;
    option_a: string;
    option_b: string;
    option_c: string;
    option_d: string;
    correct_answer: string;
    topic: string;
    difficulty?: string;
    subtopic?: string;
  }>;
  responses: Record<string, {
    id?: number;
    topic: string;
    student_answer: string;
    correct_answer: string;
    is_correct: boolean;
    confidence?: number;
    explanation: string;
    time_spent_seconds: number;
  }>;
  timeSpent?: Record<string, number>;
  startTime?: number;
  currentQuestionIndex?: number;
  totalTime?: number; // Total time in minutes
}

export interface GuestDiagnosticData {
  diagnostic: any; // AnalyzeDiagnosticResponse
  quizData: GuestQuizData;
  timestamp: string;
}

/**
 * Build questions_list from guest quiz data
 */
function buildQuestionsList(guestQuiz: GuestQuizData): Array<{
  id: number;
  topic: string;
  student_answer: string;
  correct_answer: string;
  is_correct: boolean;
  confidence: number;
  explanation: string;
  time_spent_seconds: number;
}> {
  const questionsList: Array<{
    id: number;
    topic: string;
    student_answer: string;
    correct_answer: string;
    is_correct: boolean;
    confidence: number;
    explanation: string;
    time_spent_seconds: number;
  }> = [];

  guestQuiz.questions.forEach((question, index) => {
    const response = guestQuiz.responses[question.id];
    
    if (response) {
      // Use response data if available
      questionsList.push({
        id: index + 1, // Sequential IDs starting from 1
        topic: response.topic || question.topic || '',
        student_answer: response.student_answer || 'A',
        correct_answer: response.correct_answer || question.correct_answer || 'A',
        is_correct: response.is_correct !== undefined 
          ? response.is_correct 
          : (response.student_answer === question.correct_answer),
        confidence: (response.confidence && response.confidence >= 1 && response.confidence <= 5)
          ? response.confidence 
          : 3,
        explanation: response.explanation || '',
        time_spent_seconds: response.time_spent_seconds || guestQuiz.timeSpent?.[question.id] || 0,
      });
    } else {
      // No response - create default entry
      questionsList.push({
        id: index + 1,
        topic: question.topic || '',
        student_answer: 'A',
        correct_answer: question.correct_answer || 'A',
        is_correct: false,
        confidence: 3,
        explanation: '',
        time_spent_seconds: guestQuiz.timeSpent?.[question.id] || 0,
      });
    }
  });

  return questionsList;
}

/**
 * Save guest diagnostic to user account
 * Called after successful registration or login
 */
export async function saveGuestDiagnostic(): Promise<{ success: boolean; error?: string; quizId?: string }> {
  try {
    // Get guest diagnostic and quiz from localStorage
    const guestDiagnosticStr = localStorage.getItem('guest_diagnostic');
    const guestQuizStr = localStorage.getItem('guest_quiz');

    if (!guestDiagnosticStr || !guestQuizStr) {
      console.log('[GUEST_DIAGNOSTIC] No guest diagnostic or quiz found');
      return { success: false, error: 'No guest diagnostic or quiz found' };
    }

    let guestDiagnostic: GuestDiagnosticData;
    let guestQuiz: GuestQuizData;

    try {
      guestDiagnostic = JSON.parse(guestDiagnosticStr);
      guestQuiz = JSON.parse(guestQuizStr);
    } catch (parseError) {
      console.error('[GUEST_DIAGNOSTIC] Error parsing guest data:', parseError);
      return { success: false, error: 'Invalid guest diagnostic data' };
    }

    // Extract diagnostic from guestDiagnostic
    const diagnostic = guestDiagnostic.diagnostic || guestDiagnostic;
    
    // Build questions_list from guest quiz
    const questionsList = buildQuestionsList(guestQuiz);
    
    // Calculate total time (in minutes)
    // Check if totalTime is already in minutes, or calculate from timeSpent
    let totalTimeMinutes = guestQuiz.totalTime || 0;
    if (!totalTimeMinutes && guestQuiz.timeSpent) {
      // Sum all time spent and convert to minutes
      const totalSeconds = Object.values(guestQuiz.timeSpent).reduce((sum, time) => sum + (time || 0), 0);
      totalTimeMinutes = totalSeconds / 60;
    }
    // If still no time, use a default or calculate from responses
    if (!totalTimeMinutes && guestDiagnostic.quizData?.totalTime) {
      totalTimeMinutes = guestDiagnostic.quizData.totalTime;
    }

    // Validate data
    if (!diagnostic || !questionsList || questionsList.length === 0) {
      console.error('[GUEST_DIAGNOSTIC] Invalid diagnostic or questions list');
      return { success: false, error: 'Invalid diagnostic data' };
    }

    // Prepare request body in the format backend expects
    const requestBody = {
      subject: 'Mathematics',
      total_questions: questionsList.length,
      time_taken: totalTimeMinutes,
      questions_list: questionsList,
      diagnostic: diagnostic,
    };

    console.log('[GUEST_DIAGNOSTIC] Saving guest diagnostic to account...');
    console.log('[GUEST_DIAGNOSTIC] Request body:', {
      subject: requestBody.subject,
      total_questions: requestBody.total_questions,
      time_taken: requestBody.time_taken,
      questions_list_length: requestBody.questions_list.length,
      has_diagnostic: !!requestBody.diagnostic,
    });

    // Call save-diagnostic endpoint
    const response = await api.post(endpoints.ai.saveDiagnostic, requestBody);

    console.log('[GUEST_DIAGNOSTIC] Diagnostic saved successfully:', response.data);

    // Extract quiz_id from response
    const quizId = response.data?.quiz_id || response.data?.diagnostic?.quiz_id;
    
    if (quizId) {
      // Update latest_quiz_id in localStorage
      localStorage.setItem('latest_quiz_id', quizId);
      console.log('[GUEST_DIAGNOSTIC] Updated latest_quiz_id to:', quizId);
    }

    // Clear guest data after successful save
    localStorage.removeItem('guest_diagnostic');
    localStorage.removeItem('guest_quiz');
    localStorage.removeItem('guest_quiz_complete');
    localStorage.removeItem('guest_banner_dismissed');
    console.log('[GUEST_DIAGNOSTIC] Cleared guest diagnostic data from localStorage');

    return { success: true, quizId };
  } catch (error: any) {
    console.error('[GUEST_DIAGNOSTIC] Error saving guest diagnostic:', error);
    console.error('[GUEST_DIAGNOSTIC] Error response:', error?.response?.data);
    console.error('[GUEST_DIAGNOSTIC] Error status:', error?.response?.status);
    
    return { 
      success: false, 
      error: error?.response?.data?.message || error?.message || 'Failed to save guest diagnostic' 
    };
  }
}

