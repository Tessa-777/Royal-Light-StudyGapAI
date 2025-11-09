import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { BookOpen, TrendingUp, Calendar, Target } from 'lucide-react';

const DashboardPage = () => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.name || 'Student'}!
          </h1>
          <p className="text-gray-600">Track your progress and continue your learning journey</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <Card.Body>
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Target Score</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {profile?.target_score || 300}
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Topics Completed</div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                </div>
              </div>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-full mr-4">
                  <TrendingUp className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">In Progress</div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                </div>
              </div>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-full mr-4">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-500">Days Active</div>
                  <div className="text-2xl font-bold text-gray-900">0</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </Card.Header>
            <Card.Body>
              <div className="space-y-3">
                <Link to="/quiz">
                  <Button variant="primary" fullWidth>
                    Take Diagnostic Quiz
                  </Button>
                </Link>
                <Link to="/progress">
                  <Button variant="secondary" fullWidth>
                    View Progress
                  </Button>
                </Link>
                <Link to="/resources/all">
                  <Button variant="secondary" fullWidth>
                    Browse Resources
                  </Button>
                </Link>
              </div>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
            </Card.Header>
            <Card.Body>
              {(() => {
                // Check if user has a recent diagnostic
                const latestQuizId = localStorage.getItem('latest_quiz_id');
                if (latestQuizId) {
                  return (
                    <div className="space-y-3">
                      <p className="text-gray-600 mb-4">
                        You have a recent diagnostic quiz result. View your results and study plan below.
                      </p>
                      <Link to={`/diagnostic/${latestQuizId}`}>
                        <Button variant="primary" fullWidth>
                          View Diagnostic Results
                        </Button>
                      </Link>
                      <Link to={`/study-plan/${latestQuizId}`}>
                        <Button variant="secondary" fullWidth>
                          View Study Plan
                        </Button>
                      </Link>
                    </div>
                  );
                }
                return (
                  <p className="text-gray-500 text-center py-8">
                    No recent activity. Complete a diagnostic quiz to get started!
                  </p>
                );
              })()}
            </Card.Body>
          </Card>
        </div>

        {/* Study Plan Preview */}
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900">Your Study Plan</h2>
          </Card.Header>
          <Card.Body>
            {(() => {
              const latestQuizId = localStorage.getItem('latest_quiz_id');
              if (latestQuizId) {
                return (
                  <>
                    <p className="text-gray-500 mb-4">
                      You have a personalized 6-week study plan based on your diagnostic results.
                    </p>
                    <Link to={`/study-plan/${latestQuizId}`}>
                      <Button variant="primary">View Study Plan</Button>
                    </Link>
                  </>
                );
              }
              return (
                <>
                  <p className="text-gray-500 mb-4">
                    Complete a diagnostic quiz to get your personalized 6-week study plan.
                  </p>
                  <Link to="/quiz">
                    <Button variant="primary">Get Started</Button>
                  </Link>
                </>
              );
            })()}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;

