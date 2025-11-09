/**
 * Resources Hook
 * Manages resources and topics data
 */

import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import endpoints from '../services/endpoints';

export interface Topic {
  id: string;
  name: string;
  description?: string;
  prerequisite_topic_ids?: string[];
  jamb_weight?: number;
}

export interface Resource {
  id: string;
  topic_id: string;
  type: 'video' | 'practice_set';
  title: string;
  url: string;
  source?: string;
  duration_minutes?: number;
  difficulty: 'easy' | 'medium' | 'hard';
  upvotes: number;
}

/**
 * Fetch all topics
 */
export const useTopics = () => {
  return useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      const response = await api.get(endpoints.topics.getAll);
      return response.data as Topic[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Fetch resources by topic ID
 */
export const useResourcesByTopicId = (topicId: string) => {
  return useQuery({
    queryKey: ['resources', 'topic_id', topicId],
    queryFn: async () => {
      const response = await api.get(endpoints.resources.byTopicId(topicId));
      return response.data as Resource[];
    },
    enabled: !!topicId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Fetch resources by topic name
 */
export const useResourcesByTopicName = (topicName: string) => {
  return useQuery({
    queryKey: ['resources', 'topic_name', topicName],
    queryFn: async () => {
      const response = await api.get(endpoints.resources.byTopicName(topicName));
      return response.data as Resource[];
    },
    enabled: !!topicName,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Fetch all resources
 */
export const useAllResources = () => {
  return useQuery({
    queryKey: ['resources', 'all'],
    queryFn: async () => {
      const response = await api.get(endpoints.resources.getAll);
      return response.data as Resource[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

