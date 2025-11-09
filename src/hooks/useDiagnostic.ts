/**
 * Diagnostic Hook
 * Manages diagnostic data and study plans
 */

import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import endpoints from '../services/endpoints';
import { isAuthenticatedSync } from '../services/auth';

export interface AnalyzeDiagnosticResponse {
  id: string;
  quiz_id: string | null; // Can be null for guest diagnostics
  overall_performance: {
    accuracy: number;
    total_questions: number;
    correct_answers: number;
    avg_confidence: number;
    time_per_question: number;
  };
  topic_breakdown: Array<{
    topic: string;
    accuracy: number;
    fluency_index: number;
    status: 'weak' | 'developing' | 'strong';
    questions_attempted: number;
    severity?: 'critical' | 'moderate' | 'mild' | null;
    dominant_error_type?: string | null;
  }>;
  root_cause_analysis: {
    primary_weakness: 'conceptual_gap' | 'procedural_error' | 'careless_mistake' | 'knowledge_gap' | 'misinterpretation';
    error_distribution: {
      conceptual_gap: number;
      procedural_error: number;
      careless_mistake: number;
      knowledge_gap: number;
      misinterpretation: number;
    };
  };
  predicted_jamb_score: {
    score: number;
    confidence_interval: string;
  };
  study_plan: {
    weekly_schedule: Array<{
      week: number;
      focus: string;
      study_hours: number;
      key_activities: string[];
    }>;
  };
  recommendations: Array<{
    priority: number;
    category: string;
    action: string;
    rationale: string;
  }>;
  generated_at: string;
}

/**
 * Get diagnostic from localStorage (guest mode) or API
 */
export const useDiagnostic = (diagnosticId?: string) => {
  return useQuery({
    queryKey: ['diagnostic', diagnosticId, isAuthenticatedSync()],
    queryFn: async () => {
      // For guest users, always check localStorage first (even if diagnosticId is provided)
      if (!isAuthenticatedSync()) {
        console.log('[useDiagnostic] Guest user - checking localStorage for diagnostic');
        const guestDiagnostic = localStorage.getItem('guest_diagnostic');
        if (guestDiagnostic) {
          try {
            const data = JSON.parse(guestDiagnostic);
            console.log('[useDiagnostic] Found guest diagnostic in localStorage');
            // Return diagnostic from localStorage structure: { diagnostic: {...}, quizData: {...}, timestamp: ... }
            if (data.diagnostic) {
              return data.diagnostic as AnalyzeDiagnosticResponse;
            }
            // Fallback: if data is the diagnostic itself
            return data as AnalyzeDiagnosticResponse;
          } catch (error) {
            console.error('[useDiagnostic] Error parsing guest diagnostic:', error);
          }
        }
        console.warn('[useDiagnostic] No guest diagnostic found in localStorage');
        throw new Error('No diagnostic found');
      }

      // Fetch from API if authenticated and diagnosticId is provided and valid
      // Don't fetch if diagnosticId is null, "null", or "undefined" (will cause 404)
      if (diagnosticId && diagnosticId !== 'null' && diagnosticId !== 'undefined') {
        console.log('[useDiagnostic] Authenticated user - fetching diagnostic from API:', endpoints.quiz.results(diagnosticId));
        try {
          const response = await api.get(endpoints.quiz.results(diagnosticId));
          console.log('[useDiagnostic] Full response:', response.data);
          console.log('[useDiagnostic] Response keys:', Object.keys(response.data || {}));
          console.log('[useDiagnostic] Diagnostic data:', response.data?.diagnostic);
          
          // Backend returns nested structure: { diagnostic: {...}, quiz: {...}, responses: [...] }
          // Extract diagnostic from response
          if (response.data?.diagnostic) {
            console.log('[useDiagnostic] Returning diagnostic from nested structure');
            return response.data.diagnostic as AnalyzeDiagnosticResponse;
          }
          
          // Fallback: if diagnostic is at root level (for backward compatibility)
          console.log('[useDiagnostic] Diagnostic not found in nested structure, trying root level');
          return response.data as AnalyzeDiagnosticResponse;
        } catch (error: any) {
          // If API call fails (404 or 403), check localStorage for guest diagnostic
          // 403 = Forbidden (quiz doesn't belong to user, likely a guest quiz)
          // 404 = Not Found (quiz doesn't exist or quiz_id is null/invalid)
          // This handles the case where guest diagnostic was saved but quiz_id doesn't exist in database
          // or belongs to a different user (guest quiz)
          if (error?.response?.status === 404 || error?.response?.status === 403) {
            console.warn(`[useDiagnostic] Diagnostic not accessible (${error?.response?.status}) - checking localStorage for guest diagnostic`);
            const guestDiagnostic = localStorage.getItem('guest_diagnostic');
            if (guestDiagnostic) {
              try {
                const data = JSON.parse(guestDiagnostic);
                console.log('[useDiagnostic] Found guest diagnostic in localStorage - using as fallback');
                if (data.diagnostic) {
                  // For guest diagnostics, quiz_id might be null - that's OK
                  console.log('[useDiagnostic] Returning guest diagnostic (quiz_id may be null)');
                  return data.diagnostic as AnalyzeDiagnosticResponse;
                }
                return data as AnalyzeDiagnosticResponse;
              } catch (parseError) {
                console.error('[useDiagnostic] Error parsing guest diagnostic:', parseError);
              }
            }
            console.warn('[useDiagnostic] No guest diagnostic found in localStorage either');
          }
          // Re-throw the error if we can't find diagnostic in localStorage
          throw error;
        }
      }
      
      // If no diagnosticId or invalid diagnosticId, check localStorage for guest diagnostic
      if (!diagnosticId || diagnosticId === 'null' || diagnosticId === 'undefined') {
        console.log('[useDiagnostic] No valid diagnosticId provided - checking localStorage for guest diagnostic');
        const guestDiagnostic = localStorage.getItem('guest_diagnostic');
        if (guestDiagnostic) {
          try {
            const data = JSON.parse(guestDiagnostic);
            if (data.diagnostic) {
              console.log('[useDiagnostic] Found guest diagnostic in localStorage');
              return data.diagnostic as AnalyzeDiagnosticResponse;
            }
            return data as AnalyzeDiagnosticResponse;
          } catch (parseError) {
            console.error('[useDiagnostic] Error parsing guest diagnostic:', parseError);
          }
        }
      }

      throw new Error('Diagnostic ID required');
    },
    enabled: !!diagnosticId || !isAuthenticatedSync(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Get guest diagnostic from localStorage
 */
export const getGuestDiagnostic = (): AnalyzeDiagnosticResponse | null => {
  if (isAuthenticatedSync()) {
    return null;
  }

  const guestDiagnostic = localStorage.getItem('guest_diagnostic');
  if (guestDiagnostic) {
    try {
      const data = JSON.parse(guestDiagnostic);
      return data.diagnostic as AnalyzeDiagnosticResponse;
    } catch (error) {
      console.error('Error parsing guest diagnostic:', error);
      return null;
    }
  }

  return null;
};

