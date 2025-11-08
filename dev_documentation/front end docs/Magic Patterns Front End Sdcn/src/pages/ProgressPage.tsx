import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, TrendingUp, TrendingDown, Award, Clock, CheckCircle2, ChevronRight, BookOpen } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
// Mock progress data
const mockProgressData = {
  totalQuizzes: 4,
  averageScore: 72,
  scoreImprovement: 15,
  topicsMastered: ['Algebra', 'Physics Mechanics'],
  quizHistory: [{
    id: 'quiz1',
    date: '2023-05-10',
    subject: 'Mathematics',
    score: 65,
    accuracy: 65,
    diagnosticId: 'diag1'
  }, {
    id: 'quiz2',
    date: '2023-05-17',
    subject: 'Physics',
    score: 70,
    accuracy: 70,
    diagnosticId: 'diag2'
  }, {
    id: 'quiz3',
    date: '2023-05-24',
    subject: 'Chemistry',
    score: 75,
    accuracy: 75,
    diagnosticId: 'diag3'
  }, {
    id: 'quiz4',
    date: '2023-05-31',
    subject: 'Mathematics',
    score: 80,
    accuracy: 80,
    diagnosticId: 'diag4'
  }],
  topicMasteryData: [{
    name: 'Week 1',
    Algebra: 40,
    Calculus: 25,
    Geometry: 60
  }, {
    name: 'Week 2',
    Algebra: 55,
    Calculus: 30,
    Geometry: 65
  }, {
    name: 'Week 3',
    Algebra: 70,
    Calculus: 45,
    Geometry: 70
  }, {
    name: 'Week 4',
    Algebra: 85,
    Calculus: 55,
    Geometry: 75
  }],
  topicAccuracyData: [{
    name: 'Algebra',
    value: 85,
    color: '#10b981'
  }, {
    name: 'Calculus',
    value: 55,
    color: '#f59e0b'
  }, {
    name: 'Geometry',
    value: 75,
    color: '#10b981'
  }, {
    name: 'Physics Mechanics',
    value: 80,
    color: '#10b981'
  }, {
    name: 'Electricity',
    value: 60,
    color: '#f59e0b'
  }, {
    name: 'Chemistry',
    value: 70,
    color: '#f59e0b'
  }],
  recentActivity: [{
    id: 'act1',
    type: 'quiz',
    description: 'Completed Mathematics Quiz',
    timestamp: '2 days ago'
  }, {
    id: 'act2',
    type: 'study',
    description: 'Completed Week 3 of Study Plan',
    timestamp: '4 days ago'
  }, {
    id: 'act3',
    type: 'resource',
    description: 'Viewed "Calculus Concepts Explained"',
    timestamp: '5 days ago'
  }, {
    id: 'act4',
    type: 'quiz',
    description: 'Completed Chemistry Quiz',
    timestamp: '1 week ago'
  }]
};
const ProgressPage = () => {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState('all');
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  // Handle quiz click
  const handleQuizClick = (diagnosticId: string) => {
    navigate(`/diagnostic/${diagnosticId}`);
  };
  // Line chart configuration
  const lineChartLines = [{
    dataKey: 'Algebra',
    color: '#3b82f6',
    name: 'Algebra'
  }, {
    dataKey: 'Calculus',
    color: '#f59e0b',
    name: 'Calculus'
  }, {
    dataKey: 'Geometry',
    color: '#10b981',
    name: 'Geometry'
  }];
  return <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
          <div className="flex space-x-2">
            <button className={`px-3 py-1 rounded-md text-sm font-medium ${timeFilter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`} onClick={() => setTimeFilter('all')}>
              All Time
            </button>
            <button className={`px-3 py-1 rounded-md text-sm font-medium ${timeFilter === 'month' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`} onClick={() => setTimeFilter('month')}>
              This Month
            </button>
            <button className={`px-3 py-1 rounded-md text-sm font-medium ${timeFilter === 'week' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`} onClick={() => setTimeFilter('week')}>
              This Week
            </button>
          </div>
        </div>
        {/* Progress Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Quizzes Card */}
          <Card>
            <Card.Body className="p-6">
              <div className="flex items-start">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Total Quizzes
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {mockProgressData.totalQuizzes}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
          {/* Average Score Card */}
          <Card>
            <Card.Body className="p-6">
              <div className="flex items-start">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  {mockProgressData.scoreImprovement > 0 ? <TrendingUp className="h-6 w-6 text-green-600" /> : <TrendingDown className="h-6 w-6 text-red-600" />}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Average Score
                  </h3>
                  <div className="flex items-center mt-1">
                    <p className="text-3xl font-bold text-gray-900">
                      {mockProgressData.averageScore}%
                    </p>
                    {mockProgressData.scoreImprovement > 0 && <span className="ml-2 text-sm font-medium text-green-600 flex items-center">
                        <TrendingUp className="h-4 w-4 mr-1" />+
                        {mockProgressData.scoreImprovement}%
                      </span>}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
          {/* Topics Mastered Card */}
          <Card>
            <Card.Body className="p-6">
              <div className="flex items-start">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <Award className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Topics Mastered
                  </h3>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {mockProgressData.topicsMastered.length}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {mockProgressData.topicsMastered.map((topic, index) => <Badge key={index} variant="strong">
                        {topic}
                      </Badge>)}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>
        {/* Quiz History Section */}
        <Card className="mb-8">
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900">
              Quiz History
            </h2>
          </Card.Header>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Accuracy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockProgressData.quizHistory.map(quiz => <tr key={quiz.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(quiz.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {quiz.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16">
                          <ProgressBar progress={quiz.score} size="sm" color={quiz.score >= 80 ? 'green' : quiz.score >= 60 ? 'yellow' : 'red'} />
                        </div>
                        <span className="ml-2 text-sm text-gray-500">
                          {quiz.score}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quiz.accuracy}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900" onClick={() => handleQuizClick(quiz.diagnosticId)}>
                        View Results
                      </button>
                    </td>
                  </tr>)}
              </tbody>
            </table>
          </div>
        </Card>
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Topic Mastery Chart */}
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold text-gray-900">
                Topic Mastery Over Time
              </h2>
            </Card.Header>
            <Card.Body>
              <LineChart data={mockProgressData.topicMasteryData} lines={lineChartLines} height={300} xAxisLabel="Time" yAxisLabel="Mastery %" />
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
              <BarChart data={mockProgressData.topicAccuracyData} horizontal={true} height={300} yAxisLabel="Accuracy" />
            </Card.Body>
          </Card>
        </div>
        {/* Recent Activity Section */}
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900">
              Recent Activity
            </h2>
          </Card.Header>
          <Card.Body className="p-0">
            <div className="divide-y divide-gray-200">
              {mockProgressData.recentActivity.map(activity => <div key={activity.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start">
                    <div className="mr-4">
                      {activity.type === 'quiz' && <div className="bg-blue-100 p-2 rounded-full">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>}
                      {activity.type === 'study' && <div className="bg-green-100 p-2 rounded-full">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        </div>}
                      {activity.type === 'resource' && <div className="bg-purple-100 p-2 rounded-full">
                          <BookOpen className="h-5 w-5 text-purple-600" />
                        </div>}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {activity.timestamp}
                      </p>
                    </div>
                    <div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>)}
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>;
};
export default ProgressPage;