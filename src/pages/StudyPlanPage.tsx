import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useDiagnostic } from '../hooks/useDiagnostic';

const StudyPlanPage = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { data: diagnostic, isLoading, error } = useDiagnostic(quizId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading study plan...</p>
        </div>
      </div>
    );
  }

  if (error || !diagnostic) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <Card.Body>
            <div className="text-center">
              <p className="text-red-600 mb-4">Failed to load study plan</p>
              <Link to="/dashboard">
                <Button variant="primary">Go to Dashboard</Button>
              </Link>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  const studyPlan = diagnostic.study_plan;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your 6-Week Study Plan</h1>
          <p className="text-gray-600">
            Personalized study plan based on your diagnostic results
          </p>
        </div>

        <div className="space-y-6">
          {studyPlan.weekly_schedule.map((week) => (
            <Card key={week.week} className="mb-6">
              <Card.Header>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Week {week.week}: {week.focus}
                  </h2>
                  <Badge variant="developing">{week.study_hours} hours</Badge>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Key Activities</h3>
                  <ul className="space-y-2">
                    {week.key_activities.map((activity, index) => (
                      <li key={index} className="flex items-start">
                        <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5 text-xs font-medium">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Link to={`/resources/all`}>
                  <Button variant="primary" size="sm">
                    View Resources
                  </Button>
                </Link>
              </Card.Body>
            </Card>
          ))}
        </div>

        {/* Back to Dashboard Button */}
        <div className="mt-8 text-center">
          <Link to="/dashboard">
            <Button variant="secondary" size="lg">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudyPlanPage;

