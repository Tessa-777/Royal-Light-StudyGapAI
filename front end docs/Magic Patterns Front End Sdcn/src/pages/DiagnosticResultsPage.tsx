import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Download, Share2, ChevronRight } from 'lucide-react';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import PieChart from '../components/charts/PieChart';
import BarChart from '../components/charts/BarChart';
import SaveResultsBanner from '../components/ui/SaveResultsBanner';
// Mock data for diagnostic results
const mockDiagnosticData = {
  id: 'diag123',
  overallAccuracy: 72,
  totalQuestions: 30,
  correctAnswers: 22,
  averageConfidence: 3.8,
  timePerQuestion: '45 seconds',
  projectedScore: 325,
  projectedScoreConfidenceInterval: 25,
  topics: [{
    id: 'topic1',
    name: 'Algebra',
    accuracy: 85,
    fluencyIndex: 80,
    status: 'strong',
    questionsAttempted: 5
  }, {
    id: 'topic2',
    name: 'Geometry',
    accuracy: 70,
    fluencyIndex: 65,
    status: 'developing',
    questionsAttempted: 5
  }, {
    id: 'topic3',
    name: 'Calculus',
    accuracy: 40,
    fluencyIndex: 30,
    status: 'weak',
    questionsAttempted: 5
  }, {
    id: 'topic4',
    name: 'Physics Mechanics',
    accuracy: 80,
    fluencyIndex: 75,
    status: 'strong',
    questionsAttempted: 5
  }, {
    id: 'topic5',
    name: 'Electricity',
    accuracy: 60,
    fluencyIndex: 55,
    status: 'developing',
    questionsAttempted: 5
  }, {
    id: 'topic6',
    name: 'Chemistry',
    accuracy: 90,
    fluencyIndex: 85,
    status: 'strong',
    questionsAttempted: 5
  }],
  errorDistribution: [{
    name: 'Conceptual Gap',
    value: 40,
    color: '#ef4444'
  }, {
    name: 'Procedural Error',
    value: 25,
    color: '#f59e0b'
  }, {
    name: 'Careless Mistake',
    value: 15,
    color: '#3b82f6'
  }, {
    name: 'Knowledge Gap',
    value: 10,
    color: '#8b5cf6'
  }, {
    name: 'Misinterpretation',
    value: 10,
    color: '#10b981'
  }],
  primaryWeakness: 'Conceptual Gap',
  recommendations: [{
    id: 'rec1',
    priority: 1,
    category: 'Study Approach',
    action: 'Focus on understanding fundamental concepts in Calculus',
    rationale: 'Your performance shows conceptual gaps in this area'
  }, {
    id: 'rec2',
    priority: 2,
    category: 'Practice',
    action: 'Complete practice problems in Electricity with step-by-step solutions',
    rationale: 'Your accuracy is lower in this topic'
  }, {
    id: 'rec3',
    priority: 3,
    category: 'Time Management',
    action: 'Allocate more time for complex problems',
    rationale: "You're spending too little time on difficult questions"
  }],
  studyPlan: {
    id: 'plan123',
    week1: {
      focus: 'Calculus Fundamentals',
      activities: ['Review derivatives and integrals', 'Practice basic calculus problems', 'Watch video lectures on calculus concepts']
    }
  }
};
const DiagnosticResultsPage = () => {
  const {
    quizId
  } = useParams<{
    quizId: string;
  }>();
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  // Check if user is guest (no auth token)
  const isGuest = !localStorage.getItem('auth_token');
  // In a real app, we would fetch the diagnostic data based on the quizId
  const diagnosticData = mockDiagnosticData;
  // Topic data for bar chart
  const topicBarData = diagnosticData.topics.map(topic => ({
    name: topic.name,
    value: topic.accuracy,
    color: topic.status === 'strong' ? '#10b981' : topic.status === 'developing' ? '#f59e0b' : '#ef4444'
  }));
  // Show save prompt for guest users on mount
  useEffect(() => {
    if (isGuest) {
      setShowSavePrompt(true);
      // Store diagnostic in localStorage for guest users
      const guestDiagnostic = {
        diagnosticId: diagnosticData.id,
        quizId,
        data: diagnosticData,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem('guest_diagnostic', JSON.stringify(guestDiagnostic));
    }
  }, [isGuest, quizId]);
  return <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Save Results Banner (Guest Mode Only) */}
        {isGuest && showSavePrompt && <SaveResultsBanner onDismiss={() => setShowSavePrompt(false)} />}
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Your Diagnostic Report
          </h1>
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
                    {diagnosticData.overallAccuracy}%
                  </span>
                  <span className="text-sm text-gray-500">Accuracy</span>
                </div>
                <div className="grid grid-cols-2 gap-4 flex-grow">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Total Questions</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {diagnosticData.totalQuestions}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Correct Answers</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {diagnosticData.correctAnswers}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">Avg. Confidence</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {diagnosticData.averageConfidence}/5
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-500">
                      Time per Question
                    </div>
                    <div className="text-xl font-semibold text-gray-900">
                      {diagnosticData.timePerQuestion}
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
          {/* JAMB Score Projection Card */}
          <Card>
            <Card.Body>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                JAMB Score Projection
              </h2>
              <div className="flex flex-col items-center justify-center h-full">
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {diagnosticData.projectedScore}
                </div>
                <div className="text-sm text-gray-500 mb-4">
                  ± {diagnosticData.projectedScoreConfidenceInterval} points
                </div>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  Based on your diagnostic performance
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        {/* Topic Breakdown Section */}
        <Card className="mb-8">
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900">
              Topic Breakdown
            </h2>
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
                {diagnosticData.topics.map(topic => <tr key={topic.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {topic.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {topic.accuracy}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="w-32">
                        <ProgressBar progress={topic.fluencyIndex} size="sm" color={topic.status === 'strong' ? 'green' : topic.status === 'developing' ? 'yellow' : 'red'} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={topic.status === 'strong' ? 'strong' : topic.status === 'developing' ? 'developing' : 'weak'}>
                        {topic.status.charAt(0).toUpperCase() + topic.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {topic.questionsAttempted}
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </Card>
        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Root Cause Analysis */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold text-gray-900">
                Error Distribution
              </h2>
            </Card.Header>
            <Card.Body>
              <PieChart data={diagnosticData.errorDistribution} height={250} />
              <div className="mt-4 text-center">
                <span className="text-sm font-medium text-gray-700">
                  Primary Weakness:
                </span>{' '}
                <span className="text-sm font-bold text-red-600">
                  {diagnosticData.primaryWeakness}
                </span>
              </div>
            </Card.Body>
          </Card>
          {/* Topic Accuracy Chart */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold text-gray-900">
                Topic Accuracy
              </h2>
            </Card.Header>
            <Card.Body>
              <BarChart data={topicBarData} horizontal={true} height={300} yAxisLabel="Accuracy" />
            </Card.Body>
          </Card>
        </div>
        {/* Recommendations Section */}
        <Card className="mb-8">
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900">
              Recommendations
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="space-y-4">
              {diagnosticData.recommendations.map(rec => <div key={rec.id} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
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
                      <div className="text-sm text-gray-500">
                        {rec.rationale}
                      </div>
                    </div>
                  </div>
                </div>)}
            </div>
          </Card.Body>
        </Card>
        {/* Study Plan Preview Card */}
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900">
              Your 6-Week Study Plan
            </h2>
          </Card.Header>
          <Card.Body>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
              <h3 className="text-lg font-medium text-blue-800 mb-2">
                Week 1: {diagnosticData.studyPlan.week1.focus}
              </h3>
              <ul className="space-y-2 mb-4">
                {diagnosticData.studyPlan.week1.activities.slice(0, 3).map((activity, index) => <li key={index} className="flex items-start">
                      <div className="bg-blue-200 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <span className="text-blue-800">{activity}</span>
                    </li>)}
              </ul>
              {isGuest ? <Link to="/register">
                  <Button variant="primary" fullWidth>
                    Create Account to Access Study Plan
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link> : <Link to={`/study-plan/${diagnosticData.id}`}>
                  <Button variant="primary" fullWidth>
                    View Full Study Plan
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>;
};
export default DiagnosticResultsPage;