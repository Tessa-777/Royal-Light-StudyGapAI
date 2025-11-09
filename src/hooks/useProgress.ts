/**
 * Progress Hook
 * Manages user progress tracking
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import endpoints from '../services/endpoints';
import { isAuthenticatedSync } from '../services/auth';

export interface ProgressItem {
  topic_id: string;
  topic_name: string;
  status: 'completed' | 'in_progress' | 'not_started';
  resources_viewed: number;
  practice_problems_completed: number;
  last_updated: string;
}

/**
 * Fetch user progress
 */
export const useProgress = () => {
  return useQuery({
    queryKey: ['progress'],
    queryFn: async () => {
      try {
        console.log('[useProgress] Fetching progress from:', endpoints.progress.getProgress);
        const response = await api.get(endpoints.progress.getProgress);
        console.log('[useProgress] Progress response:', response.data);
        return response.data as ProgressItem[];
      } catch (error: any) {
        console.error('[useProgress] Error fetching progress:', error);
        console.error('[useProgress] Error response:', error.response?.data);
        console.error('[useProgress] Error status:', error.response?.status);
        
        // If 404, the endpoint might not exist yet - return empty array
        if (error.response?.status === 404) {
          console.warn('[useProgress] Progress endpoint not found (404) - backend might not have this endpoint implemented yet');
          return [] as ProgressItem[];
        }
        
        throw error;
      }
    },
    enabled: isAuthenticatedSync(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Mark topic as complete
 */
export const useMarkComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      topicId: string;
      status: 'completed' | 'in_progress' | 'not_started';
      resourcesViewed?: number;
      practiceProblemsCompleted?: number;
    }) => {
      const response = await api.post(endpoints.progress.markComplete, {
        topicId: data.topicId,
        status: data.status,
        resourcesViewed: data.resourcesViewed,
        practiceProblemsCompleted: data.practiceProblemsCompleted,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
  });
};

