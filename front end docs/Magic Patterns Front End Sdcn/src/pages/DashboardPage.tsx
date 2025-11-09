import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, TrendingUp, TrendingDown, Calendar, ChevronRight, CheckCircle2, Clock, Brain } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
// Mock dashboard data
const mockDashboardData = {
  user: {
    name: 'Adebayo',
    quizzesTaken: 4,
    lastActive: '2 days ago'
  },
  studyPlan: {
    id: 'plan123',
    currentWeek: 3,
    totalWeeks: 6,
    weekProgress: 60,
    currentFocus: 'Geometry and Trigonometry',
    nextActivities: ['Review geometric formulas and theorems', 'Practice trigonometric equations', 'Complete practice problems on circles and triangles']
  },
  recentActivity: [{
    id: 'act1',
    type: 'quiz',
    description: 'Completed Mathematics Quiz',
    timestamp: '2 days ago',
    score: 80
  }, {
    id: 'act2',
    type: 'study',
    description: 'Completed Week 2 of Study Plan',
    timestamp: '4 days ago'
  }, {
    id: 'act3',
    type: 'resource',
    description: 'Viewed "Calculus Concepts Explained"',
    timestamp: '5 days ago'
  }],
  weakTopics: [{
    id: 'topic1',
    name: 'Calculus',
    accuracy: 55
  }, {
    id: 'topic2',
    name: 'Electricity',
    accuracy: 60
  }],
  strongTopics: [{
    id: 'topic3',
    name: 'Algebra',
    accuracy: 85
  }, {
    id: 'topic4',
    name: 'Physics Mechanics',
    accuracy: 80
  }]
};
const DashboardPage = () => {
  const {
    user,
    studyPlan,
    recentActivity,
    weakTopics,
    strongTopics
  } = mockDashboardData;
  // Get time of day for greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  return <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {getGreeting()}, {user.name}
          </h1>
          <p className="text-gray-600">
            You've taken {user.quizzesTaken} diagnostic quizzes so far. Last
            active {user.lastActive}.
          </p>
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/quiz" className="block">
            <div className="bg-blue-600 text-white rounded-lg p-6 h-full transition-transform hover:translate-y-[-4px]">
              <div className="bg-blue-500 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6" />
              </div>
              <h2 className="text-xl font-semibold mb-2">
                Take Diagnostic Quiz
              </h2>
              <p className="text-blue-100 mb-4">
                Identify your strengths and weaknesses
              </p>
              <div className="flex items-center text-sm">
                <span>Start now</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>
          <Link to={`/study-plan/${studyPlan.id}`} className="block">
            <div className="bg-white rounded-lg p-6 border border-gray-200 h-full transition-shadow hover:shadow-md">
              <div className="bg-green-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                View Study Plan
              </h2>
              <p className="text-gray-500 mb-4">
                Continue your personalized learning journey
              </p>
              <div className="flex items-center text-sm text-blue-600">
                <span>Continue</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>
          <Link to="/progress" className="block">
            <div className="bg-white rounded-lg p-6 border border-gray-200 h-full transition-shadow hover:shadow-md">
              <div className="bg-purple-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                View Progress
              </h2>
              <p className="text-gray-500 mb-4">
                Track your improvement over time
              </p>
              <div className="flex items-center text-sm text-blue-600">
                <span>See details</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>
          <Link to="/resources/all" className="block">
            <div className="bg-white rounded-lg p-6 border border-gray-200 h-full transition-shadow hover:shadow-md">
              <div className="bg-yellow-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-yellow-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Browse Resources
              </h2>
              <p className="text-gray-500 mb-4">
                Find videos, practice sets, and readings
              </p>
              <div className="flex items-center text-sm text-blue-600">
                <span>Explore</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Study Plan Preview */}
            {studyPlan && <Card className="mb-8">
                <Card.Header className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Your Study Plan
                  </h2>
                  <Link to={`/study-plan/${studyPlan.id}`}>
                    <Button variant="secondary" size="sm">
                      View Full Plan
                    </Button>
                  </Link>
                </Card.Header>
                <Card.Body>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm font-medium text-gray-500">
                        Week {studyPlan.currentWeek} of {studyPlan.totalWeeks}
                      </div>
                      <div className="text-sm font-medium text-gray-500">
                        {studyPlan.weekProgress}% complete
                      </div>
                    </div>
                    <ProgressBar progress={studyPlan.weekProgress} color="blue" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Current Focus: {studyPlan.currentFocus}
                  </h3>
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">
                      Next Activities
                    </h4>
                    <ul className="space-y-2">
                      {studyPlan.nextActivities.map((activity, index) => <li key={index} className="flex items-start">
                          <div className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5 text-xs">
                            {index + 1}
                          </div>
                          <span className="text-blue-800 text-sm">
                            {activity}
                          </span>
                        </li>)}
                    </ul>
                  </div>
                  <Link to={`/study-plan/${studyPlan.id}`}>
                    <Button variant="primary" fullWidth>
                      Continue Studying
                    </Button>
                  </Link>
                </Card.Body>
              </Card>}
            {/* Topic Analysis */}
            <Card>
              <Card.Header>
                <h2 className="text-xl font-semibold text-gray-900">
                  Topic Analysis
                </h2>
              </Card.Header>
              <Card.Body>
                <div className="mb-6">
                  <h3 className="text-base font-medium text-red-600 mb-3 flex items-center">
                    <span className="bg-red-100 p-1 rounded-full mr-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    </span>
                    Areas Needing Improvement
                  </h3>
                  <div className="space-y-4">
                    {weakTopics.map(topic => <div key={topic.id} className="bg-red-50 rounded-lg p-4 border border-red-100">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {topic.name}
                          </h4>
                          <span className="text-sm text-red-600 font-medium">
                            {topic.accuracy}% accuracy
                          </span>
                        </div>
                        <ProgressBar progress={topic.accuracy} color="red" size="sm" />
                        <div className="mt-3 flex justify-end">
                          <Link to={`/resources/${topic.name.toLowerCase()}`}>
                            <Button variant="secondary" size="sm">
                              Study Resources
                            </Button>
                          </Link>
                        </div>
                      </div>)}
                  </div>
                </div>
                <div>
                  <h3 className="text-base font-medium text-green-600 mb-3 flex items-center">
                    <span className="bg-green-100 p-1 rounded-full mr-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </span>
                    Strong Areas
                  </h3>
                  <div className="space-y-4">
                    {strongTopics.map(topic => <div key={topic.id} className="bg-green-50 rounded-lg p-4 border border-green-100">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {topic.name}
                          </h4>
                          <span className="text-sm text-green-600 font-medium">
                            {topic.accuracy}% accuracy
                          </span>
                        </div>
                        <ProgressBar progress={topic.accuracy} color="green" size="sm" />
                      </div>)}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>
          {/* Recent Activity Sidebar */}
          <div>
            <Card className="sticky top-20">
              <Card.Header>
                <h2 className="text-xl font-semibold text-gray-900">
                  Recent Activity
                </h2>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="divide-y divide-gray-200">
                  {recentActivity.map(activity => <div key={activity.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start">
                        <div className="mr-3">
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
                            {activity.score && <span className="ml-1 text-sm font-medium text-blue-600">
                                ({activity.score}%)
                              </span>}
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
                <div className="p-4 border-t border-gray-200">
                  <Link to="/progress">
                    <Button variant="secondary" fullWidth>
                      View All Activity
                    </Button>
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default DashboardPage;