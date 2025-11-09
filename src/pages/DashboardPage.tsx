import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import { useAuth } from '../hooks/useAuth';
import { useDiagnostic } from '../hooks/useDiagnostic';
import { Target, CheckCircle2, Clock, TrendingUp, AlertCircle, BookOpen } from 'lucide-react';
import { isAuthenticatedSync } from '../services/auth';
import api from '../services/api';
import endpoints from '../services/endpoints';
import { AnalyzeDiagnosticResponse } from '../hooks/useDiagnostic';

const DashboardPage = () => {
  const { profile, isAuthenticated } = useAuth();
  const authState = isAuthenticatedSync();
  const [diagnostic, setDiagnostic] = useState<AnalyzeDiagnosticResponse | null>(null);
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [diagnosticError, setDiagnosticError] = useState<Error | null>(null);
  const [hasDiagnosticFromProfile, setHasDiagnosticFromProfile] = useState(false);
  
  // Step 1: Check user profile for diagnostic info on mount
  useEffect(() => {
    const fetchDiagnostic = async () => {
      if (!authState || !profile) {
        // For guest users, check localStorage
        const guestDiagnostic = localStorage.getItem('guest_diagnostic');
        if (guestDiagnostic) {
          try {
            const parsed = JSON.parse(guestDiagnostic);
            setDiagnostic(parsed.diagnostic);
            setHasDiagnosticFromProfile(true);
          } catch (e) {
            console.error('[DASHBOARD] Error parsing guest diagnostic:', e);
          }
        }
        return;
      }

      try {
        setDiagnosticLoading(true);
        setDiagnosticError(null);

        // Check if profile has diagnostic info
        if (profile.has_diagnostic && profile.latest_diagnostic_id) {
          console.log('[DASHBOARD] Profile indicates diagnostic exists, fetching latest diagnostic...');
          
          // Fetch the actual diagnostic from the new endpoint
          const response = await api.get(endpoints.users.latestDiagnostic);
          console.log('[DASHBOARD] Latest diagnostic fetched:', response.data);
          
          setDiagnostic(response.data);
          setHasDiagnosticFromProfile(true);
          
          // Update localStorage with the latest quiz_id
          if (response.data.quiz_id) {
            localStorage.setItem('latest_quiz_id', response.data.quiz_id);
          }
        } else {
          console.log('[DASHBOARD] Profile indicates no diagnostic exists');
          setHasDiagnosticFromProfile(false);
          setDiagnostic(null);
          // Clear localStorage if profile says no diagnostic
          localStorage.removeItem('latest_quiz_id');
        }
      } catch (error: any) {
        console.error('[DASHBOARD] Error fetching diagnostic:', error);
        setDiagnosticError(error);
        
        // If 403 or 404, user doesn't have a diagnostic
        if (error.response?.status === 403 || error.response?.status === 404) {
          setHasDiagnosticFromProfile(false);
          setDiagnostic(null);
          localStorage.removeItem('latest_quiz_id');
        }
      } finally {
        setDiagnosticLoading(false);
      }
    };

    fetchDiagnostic();
  }, [authState, profile?.has_diagnostic, profile?.latest_diagnostic_id]);

  // Fallback: If profile doesn't have diagnostic info, try localStorage
  const latestQuizId = localStorage.getItem('latest_quiz_id');
  const fallbackDiagnostic = useDiagnostic(
    authState && latestQuizId && latestQuizId !== 'null' && latestQuizId !== 'undefined' && !hasDiagnosticFromProfile
      ? latestQuizId 
      : undefined
  );

  // Use fallback diagnostic if profile-based fetch didn't work
  useEffect(() => {
    if (!diagnostic && fallbackDiagnostic.data && !hasDiagnosticFromProfile) {
      setDiagnostic(fallbackDiagnostic.data);
    }
  }, [fallbackDiagnostic.data, hasDiagnosticFromProfile]);

  // If diagnostic fetch failed with 403, the quiz doesn't belong to this user
  // Clear the invalid quiz_id so dashboard shows "Not Started"
  useEffect(() => {
    if (fallbackDiagnostic.error && (fallbackDiagnostic.error as any)?.message?.includes('does not belong to current user')) {
      console.warn('[DASHBOARD] Invalid quiz_id detected, clearing from localStorage');
      localStorage.removeItem('latest_quiz_id');
    }
  }, [fallbackDiagnostic.error]);

  // Check if diagnostic exists (completed or not)
  // For authenticated users, use profile info or diagnostic data
  // For guest users, check localStorage
  const hasDiagnostic = authState 
    ? (hasDiagnosticFromProfile || !!diagnostic)
    : !!localStorage.getItem('guest_diagnostic');
  const diagnosticCompleted = !!diagnostic;

  // Get diagnostic data for calculations
  let diagnosticData = diagnostic;
  if (!diagnosticData && !authState) {
    // Try to get from localStorage for guest users
    const guestDiagnostic = localStorage.getItem('guest_diagnostic');
    if (guestDiagnostic) {
      try {
        const parsed = JSON.parse(guestDiagnostic);
        diagnosticData = parsed.diagnostic;
      } catch (e) {
        console.error('Error parsing guest diagnostic:', e);
      }
    }
  }

  // Calculate performance metrics - only show if we have a projected score
  const targetScore = profile?.target_score || 300;
  const projectedScore = diagnosticData?.predicted_jamb_score?.score || 0;
  const hasProjectedScore = projectedScore > 0;
  const pointsNeeded = hasProjectedScore ? Math.max(0, targetScore - projectedScore) : 0;

  // Get study plan progress - only show if study plan exists
  const studyPlan = diagnosticData?.study_plan;
  const hasStudyPlan = !!studyPlan && !!studyPlan.weekly_schedule && studyPlan.weekly_schedule.length > 0;
  const currentWeek = hasStudyPlan ? (studyPlan.weekly_schedule[0]?.week || 1) : 1;
  const studyPlanProgress = 0; // Default 0% for MVP

  // Get strong and weak topics
  const strongTopics = diagnosticData?.topic_breakdown?.filter(t => t.status === 'strong') || [];
  const weakTopics = diagnosticData?.topic_breakdown?.filter(t => t.status === 'weak') || [];

  // Welcome message - check if user just registered (created within last 5 minutes)
  const welcomeName = authState ? (profile?.name || 'Student') : '';
  const isNewUser = profile?.created_at 
    ? (Date.now() - new Date(profile.created_at).getTime()) < 5 * 60 * 1000 // 5 minutes
    : false;
  const welcomeMessage = authState 
    ? (isNewUser ? `Welcome, ${welcomeName}!` : `Welcome back, ${welcomeName}!`)
    : 'Welcome back!';

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {welcomeMessage}
          </h1>
          <p className="text-gray-600">Track your progress and continue your learning journey</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Target Score */}
          <Card>
            <Card.Body>
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Target Score</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {targetScore}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Diagnostic Status */}
          <Card>
            <Card.Body>
              <div className="flex items-center">
                <div className={`p-3 rounded-full mr-4 ${diagnosticCompleted ? 'bg-green-100' : 'bg-yellow-100'}`}>
                  {diagnosticCompleted ? (
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  ) : (
                    <Clock className="h-6 w-6 text-yellow-600" />
                  )}
                </div>
                <div>
                  <div className="text-sm text-gray-500">Diagnostic Status</div>
                  <div className="text-lg font-bold text-gray-900">
                    {diagnosticCompleted ? 'Completed' : 'Not Started'}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Study Plan Progress - Only show if study plan exists */}
          {hasStudyPlan && (
            <Card>
              <Card.Body>
                <div className="flex items-center">
                  <div className="bg-purple-100 p-3 rounded-full mr-4">
                    <BookOpen className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Study Plan</div>
                    <div className="text-lg font-bold text-gray-900">
                      Week {currentWeek}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{studyPlanProgress}% Complete</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Performance - Only show if we have a projected score */}
          {hasProjectedScore && (
            <Card>
              <Card.Body>
                <div className="flex items-center">
                  <div className="bg-orange-100 p-3 rounded-full mr-4">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Projected Score</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {projectedScore}
                    </div>
                    {pointsNeeded > 0 && (
                      <div className="text-xs text-red-600 mt-1">
                        {pointsNeeded} points to goal
                      </div>
                    )}
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Diagnostic Status & Study Plan Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Diagnostic Status Card */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold text-gray-900">Diagnostic Status</h2>
            </Card.Header>
            <Card.Body>
              {hasDiagnostic && diagnosticCompleted ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-gray-700">Diagnostic Completed</span>
                    </div>
                    <Badge variant="strong">Completed</Badge>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <Link to={latestQuizId ? `/diagnostic/${latestQuizId}` : '/diagnostic/null'}>
                      <Button variant="primary" fullWidth>
                        View Report
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : hasDiagnostic && !diagnosticCompleted ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                      <span className="text-gray-700">Diagnostic In Progress</span>
                    </div>
                    <Badge variant="developing">In Progress</Badge>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <Link to="/quiz">
                      <Button variant="primary" fullWidth>
                        Continue Diagnostic
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-gray-700">No diagnostic taken yet</span>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <Link to="/quiz">
                      <Button variant="primary" fullWidth>
                        Take Diagnostic Quiz
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Study Plan Progress Card - Only show if study plan exists */}
          {hasStudyPlan ? (
            <Card>
              <Card.Header>
                <h2 className="text-xl font-semibold text-gray-900">Study Plan Progress</h2>
              </Card.Header>
              <Card.Body>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Week {currentWeek} of {studyPlan.weekly_schedule?.length || 6}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {studyPlanProgress}%
                      </span>
                    </div>
                    <ProgressBar progress={studyPlanProgress} color="blue" />
                  </div>
                  {studyPlan.weekly_schedule?.[currentWeek - 1] && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Current Focus:</strong> {studyPlan.weekly_schedule[currentWeek - 1].focus}
                      </p>
                    </div>
                  )}
                  <div className="pt-2">
                    <Link to={latestQuizId ? `/study-plan/${latestQuizId}` : '/study-plan/null'}>
                      <Button variant="secondary" fullWidth>
                        View Study Plan
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Header>
                <h2 className="text-xl font-semibold text-gray-900">Study Plan Progress</h2>
              </Card.Header>
              <Card.Body>
                <div className="space-y-4">
                  <p className="text-gray-500">
                    Complete a diagnostic quiz to get your personalized study plan.
                  </p>
                  <div className="pt-4 border-t border-gray-200">
                    <Link to="/quiz">
                      <Button variant="primary" fullWidth>
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Performance Metrics - Only show if we have diagnostic data with projected score */}
        {diagnosticData && hasProjectedScore && (
          <Card className="mb-8">
            <Card.Header>
              <h2 className="text-xl font-semibold text-gray-900">Performance</h2>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-500 mb-2">Projected JAMB Score</div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {projectedScore}
                  </div>
                  <div className="text-sm text-gray-500">
                    {diagnosticData.predicted_jamb_score?.confidence_interval && (
                      <span>±{diagnosticData.predicted_jamb_score.confidence_interval}</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-2">Target Score</div>
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {targetScore}
                  </div>
                  {pointsNeeded > 0 ? (
                    <div className="text-sm text-red-600">
                      {pointsNeeded} points needed to reach goal
                    </div>
                  ) : (
                    <div className="text-sm text-green-600">
                      Goal achieved! 🎉
                    </div>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Strong & Weak Topics */}
        {(strongTopics.length > 0 || weakTopics.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Strong Topics */}
            {strongTopics.length > 0 && (
              <Card>
                <Card.Header>
                  <h2 className="text-xl font-semibold text-gray-900">Strong Topics</h2>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-3">
                    {strongTopics.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="font-medium text-gray-900">{topic.topic}</span>
                        <Badge variant="strong">{topic.accuracy.toFixed(0)}%</Badge>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Weak Topics */}
            {weakTopics.length > 0 && (
              <Card>
                <Card.Header>
                  <h2 className="text-xl font-semibold text-gray-900">Weak Topics</h2>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-3">
                    {weakTopics.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span className="font-medium text-gray-900">{topic.topic}</span>
                        <Badge variant="weak">{topic.accuracy.toFixed(0)}%</Badge>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-3">
              {hasDiagnostic && diagnosticCompleted ? (
                <>
                  <Link to={latestQuizId ? `/study-plan/${latestQuizId}` : '/study-plan/null'}>
                    <Button variant="primary" fullWidth>
                      View Study Plan
                    </Button>
                  </Link>
                  <Link to="/resources/all">
                    <Button variant="secondary" fullWidth>
                      Browse Resources
                    </Button>
                  </Link>
                  <Link to="/quiz">
                    <Button variant="secondary" fullWidth>
                      Retake Diagnostic Quiz
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/quiz">
                    <Button variant="primary" fullWidth>
                      Take Diagnostic Quiz
                    </Button>
                  </Link>
                  <Link to="/resources/all">
                    <Button variant="secondary" fullWidth>
                      Browse Resources
                    </Button>
                  </Link>
                  {hasDiagnostic && (
                    <Link to={latestQuizId ? `/study-plan/${latestQuizId}` : '/study-plan/null'}>
                      <Button variant="secondary" fullWidth>
                        View Study Plan
                      </Button>
                    </Link>
                  )}
                </>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
