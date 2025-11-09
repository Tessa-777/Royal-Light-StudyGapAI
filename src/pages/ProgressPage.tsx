import React from 'react';
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import Badge from '../components/ui/Badge';
import { useProgress } from '../hooks/useProgress';
import { useAuth } from '../hooks/useAuth';

const ProgressPage = () => {
  useAuth();
  const { data: progress, isLoading, error } = useProgress();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <Card.Body>
            <div className="text-center">
              <p className="text-red-600 mb-4">Failed to load progress</p>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  const completedTopics = progress?.filter((p) => p.status === 'completed').length || 0;
  const inProgressTopics = progress?.filter((p) => p.status === 'in_progress').length || 0;
  const totalTopics = progress?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Progress</h1>
          <p className="text-gray-600">
            Track your learning journey and topic mastery
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <Card.Body>
              <div className="text-sm text-gray-500 mb-1">Total Topics</div>
              <div className="text-3xl font-bold text-gray-900">{totalTopics}</div>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <div className="text-sm text-gray-500 mb-1">Completed</div>
              <div className="text-3xl font-bold text-green-600">{completedTopics}</div>
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <div className="text-sm text-gray-500 mb-1">In Progress</div>
              <div className="text-3xl font-bold text-blue-600">{inProgressTopics}</div>
            </Card.Body>
          </Card>
        </div>

        {/* Progress List */}
        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-900">Topic Progress</h2>
          </Card.Header>
          <Card.Body>
            {!progress || progress.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No progress data available. Complete a diagnostic quiz to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {progress.map((item) => (
                  <div
                    key={item.topic_id}
                    className="border-b border-gray-200 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.topic_name}
                      </h3>
                      <Badge
                        variant={
                          item.status === 'completed'
                            ? 'strong'
                            : item.status === 'in_progress'
                            ? 'developing'
                            : 'weak'
                        }
                      >
                        {item.status === 'completed'
                          ? 'Completed'
                          : item.status === 'in_progress'
                          ? 'In Progress'
                          : 'Not Started'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <div className="text-sm text-gray-500">Resources Viewed</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {item.resources_viewed}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Practice Problems</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {item.practice_problems_completed}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default ProgressPage;

