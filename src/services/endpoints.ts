/**
 * API Endpoint Constants
 * Centralized endpoint definitions for the StudyGapAI backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const endpoints = {
  // User Management
  users: {
    register: `${API_BASE_URL}/users/register`,
    login: `${API_BASE_URL}/users/login`,
    me: `${API_BASE_URL}/users/me`,
    updateTargetScore: (userId: string) => `${API_BASE_URL}/users/${userId}/target-score`,
  },

  // Quiz Management
  quiz: {
    questions: (total: number = 30) => `${API_BASE_URL}/quiz/questions?total=${total}`,
    start: `${API_BASE_URL}/quiz/start`,
    submit: (quizId: string) => `${API_BASE_URL}/quiz/${quizId}/submit`,
    results: (quizId: string) => `${API_BASE_URL}/quiz/${quizId}/results`,
  },

  // AI Services
  ai: {
    analyzeDiagnostic: `${API_BASE_URL}/ai/analyze-diagnostic`,
    generateStudyPlan: `${API_BASE_URL}/ai/generate-study-plan`,
    explainAnswer: `${API_BASE_URL}/ai/explain-answer`,
    adjustPlan: `${API_BASE_URL}/ai/adjust-plan`,
    saveDiagnostic: `${API_BASE_URL}/ai/save-diagnostic`,
  },

  // Progress Tracking
  // Note: Backend might use /api/progress or /api/progress/progress
  // Try /api/progress first, fallback to /api/progress/progress if needed
  progress: {
    getProgress: `${API_BASE_URL}/progress`, // Changed from /progress/progress - backend returns 404
    markComplete: `${API_BASE_URL}/progress/mark-complete`, // Changed from /progress/progress/mark-complete
  },

  // Resources & Topics
  resources: {
    getAll: `${API_BASE_URL}/resources`,
    byTopicId: (topicId: string) => `${API_BASE_URL}/resources?topic_id=${topicId}`,
    byTopicName: (topicName: string) => `${API_BASE_URL}/resources?topic_name=${topicName}`,
  },
  topics: {
    getAll: `${API_BASE_URL}/topics`,
  },

  // Analytics
  analytics: {
    dashboard: `${API_BASE_URL}/analytics/dashboard`,
  },
};

export default endpoints;

