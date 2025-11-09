import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Download, Share2, ChevronRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';
import SaveResultsBanner from '../components/ui/SaveResultsBanner';
import { useDiagnostic, type AnalyzeDiagnosticResponse } from '../hooks/useDiagnostic';
import { isAuthenticatedSync } from '../services/auth';

const DiagnosticResultsPage = () => {
  const { quizId: quizIdFromUrl } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const isGuest = !isAuthenticatedSync();
  
  // For guest users, don't use quizId from URL - use localStorage instead
  // For authenticated users, use quizId from URL or localStorage
  // IMPORTANT: Don't use "null" string or null values - they cause 404 errors
  const quizIdFromStorage = localStorage.getItem('latest_quiz_id');
  const quizId = isGuest 
    ? null // Guest users should always use localStorage (don't pass quizId to hook)
    : (quizIdFromUrl && quizIdFromUrl !== 'null' && quizIdFromUrl !== 'undefined' 
        ? quizIdFromUrl 
        : (quizIdFromStorage && quizIdFromStorage !== 'null' && quizIdFromStorage !== 'undefined' 
            ? quizIdFromStorage 
            : null));
  
  console.log('[DIAGNOSTIC RESULTS PAGE] Is guest:', isGuest);
  console.log('[DIAGNOSTIC RESULTS PAGE] Quiz ID from URL:', quizIdFromUrl);
  console.log('[DIAGNOSTIC RESULTS PAGE] Quiz ID from localStorage:', quizIdFromStorage);
  console.log('[DIAGNOSTIC RESULTS PAGE] Final Quiz ID for hook:', quizId);
  
  // Don't try to fetch from API if quizId is null or "null" string
  if (!isGuest && (!quizId || quizId === 'null' || quizId === 'undefined')) {
    console.warn('[DIAGNOSTIC RESULTS PAGE] Invalid quizId - will use localStorage fallback');
  }

  // Try to get diagnostic from API or localStorage
  // For guests: useDiagnostic will check localStorage (quizId is null)
  // For authenticated: useDiagnostic will fetch from API using quizId
  const { data: diagnosticData, isLoading, error } = useDiagnostic(quizId || undefined);
  const [diagnostic, setDiagnostic] = useState<AnalyzeDiagnosticResponse | null>(null);
  
  // For guest users, always show save prompt when diagnostic exists
  // Only hide if user explicitly dismissed it (stored in localStorage)
  const [showSavePrompt, setShowSavePrompt] = useState(() => {
    // Always show for guest users initially (unless they dismissed it)
    if (isGuest) {
      const dismissed = localStorage.getItem('guest_banner_dismissed');
      return dismissed !== 'true'; // Show banner unless explicitly dismissed
    }
    return false;
  });

  // Sync diagnosticData from hook to local state
  useEffect(() => {
    if (diagnosticData) {
      // Only update if different to prevent unnecessary re-renders
      if (!diagnostic || diagnostic.id !== diagnosticData.id) {
        console.log('[DIAGNOSTIC RESULTS PAGE] Setting diagnostic from hook:', diagnosticData);
        setDiagnostic(diagnosticData);
        
        // Store quiz_id in localStorage for easy access later (only for authenticated users)
        if (!isGuest && diagnosticData.quiz_id) {
          localStorage.setItem('latest_quiz_id', diagnosticData.quiz_id);
        }
        
        // For guest users, set save prompt when diagnostic is loaded
        if (isGuest) {
          const dismissed = localStorage.getItem('guest_banner_dismissed');
          const shouldShow = dismissed !== 'true';
          setShowSavePrompt(shouldShow);
        }
      }
    }
  }, [diagnosticData?.id, isGuest]); // Use diagnosticData.id to prevent re-runs when diagnostic changes

  // Show loading state while fetching
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading diagnostic results...</p>
        </div>
      </div>
    );
  }

  // Show error message only if we have an error and no diagnostic data from hook
  // The useDiagnostic hook handles localStorage fallback automatically, so if diagnosticData exists, we're good
  if (error && !diagnosticData && !diagnostic) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <Card.Body>
            <div className="text-center">
              <p className="text-red-600 mb-4">
                Failed to load diagnostic results
              </p>
              <p className="text-sm text-gray-500 mb-4">
                {(error as any)?.response?.status === 403 
                  ? 'You don\'t have permission to access this diagnostic. It may have been created as a guest.'
                  : 'The diagnostic could not be found or loaded.'}
              </p>
              <Button variant="primary" onClick={() => navigate('/quiz')}>
                Take Diagnostic Quiz
              </Button>
              {isAuthenticatedSync() && (
                <Button 
                  variant="secondary" 
                  onClick={() => navigate('/dashboard')}
                  className="mt-3"
                >
                  Go to Dashboard
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // If we still don't have a diagnostic after all checks, show error
  // But wait a bit for the hook to process localStorage fallback
  if (!diagnostic && !diagnosticData && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <Card.Body>
            <div className="text-center">
              <p className="text-red-600 mb-4">No diagnostic results found</p>
              <p className="text-sm text-gray-500 mb-4">
                {isAuthenticatedSync() 
                  ? 'Take a diagnostic quiz to get started!' 
                  : 'Take a diagnostic quiz to see your results!'}
              </p>
              <Button variant="primary" onClick={() => navigate('/quiz')}>
                Take Diagnostic Quiz
              </Button>
              {isAuthenticatedSync() && (
                <Button 
                  variant="secondary" 
                  onClick={() => navigate('/dashboard')}
                  className="mt-3"
                >
                  Go to Dashboard
                </Button>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // If we're still loading or don't have diagnostic yet, show loading
  if (!diagnostic && (isLoading || diagnosticData)) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading diagnostic results...</p>
        </div>
      </div>
    );
  }

  // At this point, diagnostic must exist (we've checked all error cases above)
  // Add a final guard to satisfy TypeScript
  if (!diagnostic) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <Card.Body>
            <div className="text-center">
              <p className="text-red-600 mb-4">No diagnostic results found</p>
              <Button variant="primary" onClick={() => navigate('/quiz')}>
                Take Diagnostic Quiz
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Log diagnostic data for debugging
  console.log('[DIAGNOSTIC RESULTS] Diagnostic data:', diagnostic);
  console.log('[DIAGNOSTIC RESULTS] Topic breakdown:', diagnostic.topic_breakdown);
  console.log('[DIAGNOSTIC RESULTS] Root cause analysis:', diagnostic.root_cause_analysis);
  console.log('[DIAGNOSTIC RESULTS] Overall performance:', diagnostic.overall_performance);

  // Validate diagnostic data structure
  if (!diagnostic.topic_breakdown || !Array.isArray(diagnostic.topic_breakdown)) {
    console.error('[DIAGNOSTIC RESULTS] Invalid diagnostic data - topic_breakdown is missing or not an array');
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <Card.Body>
            <div className="text-center">
              <p className="text-red-600 mb-4 font-semibold">Invalid Diagnostic Data</p>
              <p className="text-sm text-gray-500 mb-4">
                The diagnostic data is missing required fields. Please check the backend response.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 text-left">
                <p className="text-sm font-semibold text-yellow-800 mb-2">Missing Data:</p>
                <ul className="text-xs text-yellow-700 list-disc list-inside space-y-1">
                  <li>topic_breakdown: {diagnostic.topic_breakdown ? 'Present' : 'Missing'}</li>
                  <li>root_cause_analysis: {diagnostic.root_cause_analysis ? 'Present' : 'Missing'}</li>
                  <li>overall_performance: {diagnostic.overall_performance ? 'Present' : 'Missing'}</li>
                </ul>
              </div>
              <Button variant="primary" onClick={() => navigate('/quiz')}>
                Take Quiz Again
              </Button>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Prepare data for charts with defensive checks
  const topicBarData = (diagnostic.topic_breakdown || []).map((topic: AnalyzeDiagnosticResponse['topic_breakdown'][0]) => ({
    name: topic.topic,
    value: topic.accuracy,
    color:
      topic.status === 'strong'
        ? '#10b981'
        : topic.status === 'developing'
        ? '#f59e0b'
        : '#ef4444',
  }));

  const errorDistribution = diagnostic.root_cause_analysis?.error_distribution
    ? [
        {
          name: 'Conceptual Gap',
          value: diagnostic.root_cause_analysis.error_distribution.conceptual_gap || 0,
          color: '#ef4444',
        },
        {
          name: 'Procedural Error',
          value: diagnostic.root_cause_analysis.error_distribution.procedural_error || 0,
          color: '#f59e0b',
        },
        {
          name: 'Careless Mistake',
          value: diagnostic.root_cause_analysis.error_distribution.careless_mistake || 0,
          color: '#3b82f6',
        },
        {
          name: 'Knowledge Gap',
          value: diagnostic.root_cause_analysis.error_distribution.knowledge_gap || 0,
          color: '#8b5cf6',
        },
        {
          name: 'Misinterpretation',
          value: diagnostic.root_cause_analysis.error_distribution.misinterpretation || 0,
          color: '#10b981',
        },
      ].filter((item) => item.value > 0)
    : [];

  const overallPerformance = diagnostic.overall_performance || {
    accuracy: 0,
    total_questions: 0,
    correct_answers: 0,
    avg_confidence: 0,
    time_per_question: 0,
  };
  const avgTimePerQuestion = Math.round(overallPerformance.time_per_question || 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Save Results Banner (Guest Mode Only) - Show for guest users with diagnostic */}
        {isGuest && diagnostic && showSavePrompt && (
          <SaveResultsBanner 
            onDismiss={() => {
              setShowSavePrompt(false);
              // Remember that user dismissed the banner (optional - can remove if we want it to always show)
              localStorage.setItem('guest_banner_dismissed', 'true');
            }} 
          />
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Diagnostic Report</h1>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="secondary" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Overall Performance Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="md:col-span-2">
            <Card.Body>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Overall Performance
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex flex-col items-center justify-center bg-blue-50 rounded-full w-32 h-32 border-4 border-blue-100">
                  <span className="text-4xl font-bold text-blue-600">
                    {overallPerformance.accuracy.toFixed(0)}%
                  </span>
                  <span className="text-sm text-gray-500">Accuracy</span>
                </div>
                <div className="grid grid-cols-2 gap-4 flex-grow">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Total Questions</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {overallPerformance.total_questions}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Correct Answers</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {overallPerformance.correct_answers}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Avg. Confidence</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {overallPerformance.avg_confidence.toFixed(1)}/5
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Time per Question</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {avgTimePerQuestion}s
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* JAMB Score Projection Card */}
          {diagnostic.predicted_jamb_score && (
            <Card>
              <Card.Body>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  JAMB Score Projection
                </h2>
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    {diagnostic.predicted_jamb_score.score || 0}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    {diagnostic.predicted_jamb_score.confidence_interval || 'N/A'}
                  </div>
                  <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                    Based on your diagnostic performance
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Topic Breakdown Section */}
        <Card className="mb-8">
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900">Topic Breakdown</h2>
          </Card.Header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Topic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accuracy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fluency Index
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(diagnostic.topic_breakdown || []).map((topic: AnalyzeDiagnosticResponse['topic_breakdown'][0], index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {topic.topic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {topic.accuracy.toFixed(0)}%
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center gap-3">
                        <div className="w-32 flex-shrink-0">
                          <ProgressBar
                            progress={topic.fluency_index ?? 0}
                            size="sm"
                            color={
                              topic.status === 'strong'
                                ? 'green'
                                : topic.status === 'developing'
                                ? 'yellow'
                                : 'red'
                            }
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                          {topic.fluency_index !== undefined && topic.fluency_index !== null
                            ? `${topic.fluency_index.toFixed(0)}%`
                            : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          topic.status === 'strong'
                            ? 'strong'
                            : topic.status === 'developing'
                            ? 'developing'
                            : 'weak'
                        }
                      >
                        {topic.status.charAt(0).toUpperCase() + topic.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {topic.questions_attempted}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Root Cause Analysis */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold text-gray-900">Error Distribution</h2>
            </Card.Header>
            <Card.Body className="overflow-visible">
              <div className="w-full px-2">
                <PieChart data={errorDistribution} height={280} />
              </div>
              <div className="mt-4 text-center">
                <span className="text-sm font-medium text-gray-700">
                  Primary Weakness:
                </span>{' '}
                <span className="text-sm font-bold text-red-600">
                  {diagnostic.root_cause_analysis?.primary_weakness
                    ? diagnostic.root_cause_analysis.primary_weakness
                        .split('_')
                        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ')
                    : errorDistribution.length > 0
                    ? // Fallback: find the error type with highest value
                      errorDistribution.reduce((prev, current) => 
                        (prev.value > current.value) ? prev : current
                      ).name
                    : 'N/A'}
                </span>
              </div>
            </Card.Body>
          </Card>

          {/* Topic Accuracy Chart */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold text-gray-900">Topic Accuracy</h2>
            </Card.Header>
            <Card.Body>
              <BarChart
                data={topicBarData}
                horizontal={true}
                height={300}
                yAxisLabel="Accuracy"
              />
            </Card.Body>
          </Card>
        </div>

        {/* Recommendations Section */}
        <Card className="mb-8">
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900">Recommendations</h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {(diagnostic.recommendations || []).map((rec: AnalyzeDiagnosticResponse['recommendations'][0], index: number) => (
                <div
                  key={index}
                  className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500"
                >
                  <div className="flex items-start">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-4 flex-shrink-0">
                      {rec.priority}
                    </div>
                    <div>
                      <div className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">
                        {rec.category}
                      </div>
                      <div className="text-base font-medium text-gray-900 mb-1">
                        {rec.action}
                      </div>
                      <div className="text-sm text-gray-500">{rec.rationale}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        {/* Study Plan Preview Card */}
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900">Your 6-Week Study Plan</h2>
          </Card.Header>
          <Card.Body>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-blue-800 mb-2">
                Week 1: {diagnostic.study_plan?.weekly_schedule?.[0]?.focus || 'Getting Started'}
              </h3>
              <ul className="space-y-2 mb-4">
                {(diagnostic.study_plan?.weekly_schedule?.[0]?.key_activities || [])
                  .slice(0, 3)
                  .map((activity: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-blue-800">{activity}</span>
                    </li>
                  ))}
              </ul>
              {isGuest ? (
                <div className="space-y-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
                    <p className="text-sm text-yellow-800 mb-2">
                      <strong>Create an account</strong> to access your full 6-week study plan and save your diagnostic results.
                    </p>
                    <p className="text-xs text-yellow-700">
                      Your results will be saved and you'll be able to track your progress over time.
                    </p>
                  </div>
                  <Link to="/register">
                    <Button variant="primary" fullWidth>
                      Create Account to Access Study Plan
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="secondary" fullWidth>
                      Already have an account? Login
                    </Button>
                  </Link>
                </div>
              ) : diagnostic.quiz_id ? (
                <Link to={`/study-plan/${diagnostic.quiz_id}`}>
                  <Button variant="primary" fullWidth>
                    View Full Study Plan
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This diagnostic was created as a guest. To access your full study plan, please create an account and save your results.
                  </p>
                  <Link to="/register" className="mt-3 inline-block">
                    <Button variant="primary" size="sm">
                      Create Account to Save Results
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default DiagnosticResultsPage;


