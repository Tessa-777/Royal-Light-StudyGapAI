import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
const queryClient = new QueryClient();
export function App() {
  return <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/diagnostic/:quizId" element={<DiagnosticResultsPage />} />
              <Route path="/study-plan/:diagnosticId" element={<StudyPlanPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/resources/:topicId" element={<ResourcesPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </QueryClientProvider>;
}