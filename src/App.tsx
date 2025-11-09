import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import QuizPage from './pages/QuizPage';
import DiagnosticResultsPage from './pages/DiagnosticResultsPage';
import StudyPlanPage from './pages/StudyPlanPage';
import ProgressPage from './pages/ProgressPage';
import ResourcesPage from './pages/ResourcesPage';
import DashboardPage from './pages/DashboardPage';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AppRedirect from './components/AppRedirect';
import ScrollToTop from './components/ScrollToTop';
import { isAuthenticatedSync } from './services/auth';

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error: any) => {
        // Don't retry on 408 (timeout) - we handle it in API interceptor
        // Don't retry on 401 (unauthorized) - user needs to login
        // Don't retry on 403 (forbidden) - user doesn't have permission
        // Don't retry on 404 (not found) - resource doesn't exist
        if (error?.response?.status === 408) {
          return false; // API interceptor handles retries for 408
        }
        if ([401, 403, 404].includes(error?.response?.status)) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on 408 (timeout) - we handle it in API interceptor
        // Don't retry on 401, 403, 404
        if (error?.response?.status === 408) {
          return false; // API interceptor handles retries for 408
        }
        if ([401, 403, 404, 400].includes(error?.response?.status)) {
          return false;
        }
        // Retry up to 2 times for server errors (500, 502, 503, 504)
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isAuthenticatedSync()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ScrollToTop />
        <AppRedirect />
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/diagnostic/:quizId" element={<DiagnosticResultsPage />} />
              <Route path="/results" element={<DiagnosticResultsPage />} />
              <Route
                path="/study-plan/:quizId"
                element={
                  <ProtectedRoute>
                    <StudyPlanPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/resources/:topicId" element={<ResourcesPage />} />
              <Route path="/resources/all" element={<ResourcesPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>
  );
}

