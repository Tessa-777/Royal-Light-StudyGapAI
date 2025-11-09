import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CheckCircle, Clock, ChevronDown, ChevronUp, BookOpen, Video, FileText } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
// Mock study plan data
const mockStudyPlan = {
  id: 'plan123',
  diagnosticId: 'diag123',
  totalWeeks: 6,
  currentWeek: 1,
  overallProgress: 15,
  completedTopics: ['Algebra Basics'],
  weeks: [{
    number: 1,
    focus: 'Calculus Fundamentals',
    studyHours: 10,
    activities: [{
      id: 'act1',
      text: 'Review derivatives and integrals',
      completed: true
    }, {
      id: 'act2',
      text: 'Practice basic calculus problems',
      completed: true
    }, {
      id: 'act3',
      text: 'Watch video lectures on calculus concepts',
      completed: false
    }, {
      id: 'act4',
      text: 'Complete practice quiz on limits and continuity',
      completed: false
    }, {
      id: 'act5',
      text: 'Review feedback and correct mistakes',
      completed: false
    }],
    resources: [{
      id: 'res1',
      type: 'video',
      title: 'Introduction to Calculus',
      source: 'Khan Academy',
      duration: '15 min',
      difficulty: 'easy',
      url: '#'
    }, {
      id: 'res2',
      type: 'practice',
      title: 'Calculus Problem Set 1',
      source: 'JAMB Prep',
      duration: null,
      difficulty: 'medium',
      url: '#'
    }, {
      id: 'res3',
      type: 'reading',
      title: 'Calculus Concepts Explained',
      source: 'StudyGapAI',
      duration: '30 min',
      difficulty: 'medium',
      url: '#'
    }, {
      id: 'res4',
      type: 'video',
      title: 'Advanced Calculus Techniques',
      source: 'MathExplained',
      duration: '25 min',
      difficulty: 'hard',
      url: '#'
    }]
  }, {
    number: 2,
    focus: 'Electricity and Magnetism',
    studyHours: 8,
    activities: [{
      id: 'act6',
      text: 'Study electric fields and forces',
      completed: false
    }, {
      id: 'act7',
      text: 'Practice problems on circuits',
      completed: false
    }, {
      id: 'act8',
      text: 'Watch videos on electromagnetic induction',
      completed: false
    }, {
      id: 'act9',
      text: 'Complete practice quiz on electricity',
      completed: false
    }],
    resources: [{
      id: 'res5',
      type: 'video',
      title: 'Electric Fields Explained',
      source: 'Physics Hub',
      duration: '20 min',
      difficulty: 'medium',
      url: '#'
    }, {
      id: 'res6',
      type: 'practice',
      title: 'Circuit Problems',
      source: 'JAMB Prep',
      duration: null,
      difficulty: 'hard',
      url: '#'
    }]
  }, {
    number: 3,
    focus: 'Geometry and Trigonometry',
    studyHours: 12,
    activities: [{
      id: 'act10',
      text: 'Review geometric formulas and theorems',
      completed: false
    }, {
      id: 'act11',
      text: 'Practice trigonometric equations',
      completed: false
    }, {
      id: 'act12',
      text: 'Complete practice problems on circles and triangles',
      completed: false
    }],
    resources: [{
      id: 'res7',
      type: 'video',
      title: 'Geometry Basics',
      source: 'MathExplained',
      duration: '15 min',
      difficulty: 'easy',
      url: '#'
    }, {
      id: 'res8',
      type: 'practice',
      title: 'Trigonometry Problem Set',
      source: 'JAMB Prep',
      duration: null,
      difficulty: 'medium',
      url: '#'
    }]
  }, {
    number: 4,
    focus: 'Chemical Reactions and Equations',
    studyHours: 10,
    activities: [{
      id: 'act13',
      text: 'Study balancing chemical equations',
      completed: false
    }, {
      id: 'act14',
      text: 'Practice problems on reaction rates',
      completed: false
    }, {
      id: 'act15',
      text: 'Review acid-base reactions',
      completed: false
    }],
    resources: [{
      id: 'res9',
      type: 'video',
      title: 'Balancing Chemical Equations',
      source: 'Chemistry Simplified',
      duration: '18 min',
      difficulty: 'medium',
      url: '#'
    }, {
      id: 'res10',
      type: 'practice',
      title: 'Chemical Reactions Quiz',
      source: 'JAMB Prep',
      duration: null,
      difficulty: 'hard',
      url: '#'
    }]
  }, {
    number: 5,
    focus: 'Mechanics and Motion',
    studyHours: 8,
    activities: [{
      id: 'act16',
      text: "Study Newton's laws of motion",
      completed: false
    }, {
      id: 'act17',
      text: 'Practice problems on force and acceleration',
      completed: false
    }, {
      id: 'act18',
      text: 'Review momentum and collisions',
      completed: false
    }],
    resources: [{
      id: 'res11',
      type: 'video',
      title: "Newton's Laws Explained",
      source: 'Physics Hub',
      duration: '22 min',
      difficulty: 'medium',
      url: '#'
    }, {
      id: 'res12',
      type: 'practice',
      title: 'Mechanics Problem Set',
      source: 'JAMB Prep',
      duration: null,
      difficulty: 'medium',
      url: '#'
    }]
  }, {
    number: 6,
    focus: 'Final Review and Practice Tests',
    studyHours: 15,
    activities: [{
      id: 'act19',
      text: 'Take full-length practice test',
      completed: false
    }, {
      id: 'act20',
      text: 'Review weak areas identified in practice test',
      completed: false
    }, {
      id: 'act21',
      text: 'Complete focused practice on challenging topics',
      completed: false
    }, {
      id: 'act22',
      text: 'Take final diagnostic test',
      completed: false
    }],
    resources: [{
      id: 'res13',
      type: 'practice',
      title: 'JAMB Full Practice Test',
      source: 'JAMB Prep',
      duration: null,
      difficulty: 'hard',
      url: '#'
    }, {
      id: 'res14',
      type: 'video',
      title: 'Last-Minute JAMB Tips',
      source: 'StudyGapAI',
      duration: '10 min',
      difficulty: 'easy',
      url: '#'
    }]
  }]
};
const StudyPlanPage = () => {
  const {
    diagnosticId
  } = useParams<{
    diagnosticId: string;
  }>();
  const [activeWeek, setActiveWeek] = useState(1);
  const [resourceFilter, setResourceFilter] = useState('all');
  // In a real app, we would fetch the study plan data based on the diagnosticId
  const studyPlan = mockStudyPlan;
  // Get the currently active week data
  const currentWeekData = studyPlan.weeks.find(week => week.number === activeWeek);
  // Calculate completion percentage for current week
  const completedActivities = currentWeekData?.activities.filter(act => act.completed).length || 0;
  const totalActivities = currentWeekData?.activities.length || 0;
  const weekCompletionPercentage = totalActivities > 0 ? Math.round(completedActivities / totalActivities * 100) : 0;
  // Filter resources based on selected filter
  const filteredResources = currentWeekData?.resources.filter(resource => {
    if (resourceFilter === 'all') return true;
    return resource.type === resourceFilter;
  }) || [];
  // Toggle activity completion
  const toggleActivityCompletion = (activityId: string) => {
    // In a real app, this would update the state and make an API call
    console.log(`Toggling completion for activity: ${activityId}`);
  };
  // Get icon for resource type
  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5 text-blue-500" />;
      case 'practice':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'reading':
        return <BookOpen className="h-5 w-5 text-yellow-500" />;
      default:
        return <BookOpen className="h-5 w-5 text-gray-500" />;
    }
  };
  return <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Your 6-Week Study Plan
          </h1>
          <Button variant="secondary" size="sm">
            Adjust Plan
          </Button>
        </div>
        {/* Progress Overview */}
        <Card className="mb-8">
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Overall Progress
                </h3>
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-gray-900 mr-2">
                    {studyPlan.overallProgress}%
                  </span>
                  <div className="flex-grow">
                    <ProgressBar progress={studyPlan.overallProgress} color="blue" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Week {studyPlan.currentWeek} of {studyPlan.totalWeeks}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Current Focus
                </h3>
                <p className="text-lg font-medium text-gray-900">
                  {currentWeekData?.focus}
                </p>
                <p className="text-sm text-gray-500 mt-2 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {currentWeekData?.studyHours} hours/week
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  Completed Topics
                </h3>
                <div className="space-y-1">
                  {studyPlan.completedTopics.length > 0 ? studyPlan.completedTopics.map((topic, index) => <div key={index} className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-900">{topic}</span>
                      </div>) : <p className="text-sm text-gray-500">
                      No topics completed yet
                    </p>}
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
        {/* Week Selector */}
        <div className="bg-white rounded-lg shadow-md mb-8 overflow-hidden">
          <div className="grid grid-cols-3 md:grid-cols-6 border-b border-gray-200">
            {studyPlan.weeks.map(week => <button key={week.number} className={`
                  py-4 text-center transition-colors
                  ${activeWeek === week.number ? 'border-b-2 border-blue-500 bg-blue-50 text-blue-600 font-medium' : 'text-gray-500 hover:bg-gray-50'}
                `} onClick={() => setActiveWeek(week.number)}>
                Week {week.number}
              </button>)}
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Weekly Schedule */}
          <div className="lg:col-span-2">
            <Card className="mb-8">
              <Card.Header className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Week {activeWeek}: {currentWeekData?.focus}
                </h2>
                <div className="text-sm font-medium text-gray-500">
                  {completedActivities} of {totalActivities} completed
                </div>
              </Card.Header>
              <Card.Body>
                <div className="mb-4">
                  <ProgressBar progress={weekCompletionPercentage} color="blue" showPercentage />
                </div>
                <div className="space-y-4">
                  {currentWeekData?.activities.map(activity => <div key={activity.id} className={`
                        p-4 rounded-lg border flex items-start
                        ${activity.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}
                      `}>
                      <div className="mr-3 mt-0.5">
                        <button className={`
                            w-5 h-5 rounded-full border flex items-center justify-center
                            ${activity.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}
                          `} onClick={() => toggleActivityCompletion(activity.id)} aria-label={activity.completed ? 'Mark as incomplete' : 'Mark as complete'}>
                          {activity.completed && <CheckCircle className="h-4 w-4" />}
                        </button>
                      </div>
                      <div>
                        <p className={`text-base ${activity.completed ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                          {activity.text}
                        </p>
                      </div>
                    </div>)}
                </div>
              </Card.Body>
            </Card>
            {/* Resources Section */}
            <Card>
              <Card.Header className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Recommended Resources
                </h2>
                <div className="flex space-x-2">
                  <button className={`px-3 py-1 rounded-full text-xs font-medium ${resourceFilter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`} onClick={() => setResourceFilter('all')}>
                    All
                  </button>
                  <button className={`px-3 py-1 rounded-full text-xs font-medium ${resourceFilter === 'video' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`} onClick={() => setResourceFilter('video')}>
                    Videos
                  </button>
                  <button className={`px-3 py-1 rounded-full text-xs font-medium ${resourceFilter === 'practice' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`} onClick={() => setResourceFilter('practice')}>
                    Practice
                  </button>
                  <button className={`px-3 py-1 rounded-full text-xs font-medium ${resourceFilter === 'reading' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`} onClick={() => setResourceFilter('reading')}>
                    Reading
                  </button>
                </div>
              </Card.Header>
              <Card.Body>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredResources.length > 0 ? filteredResources.map(resource => <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start">
                          <div className="p-2 bg-gray-100 rounded-full mr-3">
                            {getResourceTypeIcon(resource.type)}
                          </div>
                          <div className="flex-grow">
                            <h3 className="text-base font-medium text-gray-900 mb-1">
                              {resource.title}
                            </h3>
                            <p className="text-sm text-gray-500 mb-2">
                              {resource.source}
                              {resource.duration && ` • ${resource.duration}`}
                            </p>
                            <div className="flex justify-between items-center">
                              <Badge variant={resource.difficulty === 'easy' ? 'easy' : resource.difficulty === 'medium' ? 'medium' : 'hard'}>
                                {resource.difficulty.charAt(0).toUpperCase() + resource.difficulty.slice(1)}
                              </Badge>
                              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                                View Resource
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>) : <div className="col-span-2 py-8 text-center">
                      <p className="text-gray-500">
                        No resources found for this filter.
                      </p>
                    </div>}
                </div>
              </Card.Body>
            </Card>
          </div>
          {/* Week Overview Sidebar */}
          <div>
            <Card className="sticky top-20">
              <Card.Header>
                <h2 className="text-xl font-semibold text-gray-900">
                  Study Plan Overview
                </h2>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="divide-y divide-gray-200">
                  {studyPlan.weeks.map(week => <div key={week.number} className={`p-4 hover:bg-gray-50 cursor-pointer ${activeWeek === week.number ? 'bg-blue-50' : ''}`} onClick={() => setActiveWeek(week.number)}>
                      <div className="flex justify-between items-center">
                        <h3 className={`font-medium ${activeWeek === week.number ? 'text-blue-600' : 'text-gray-900'}`}>
                          Week {week.number}
                        </h3>
                        {activeWeek === week.number ? <ChevronDown className="h-5 w-5 text-blue-500" /> : <ChevronUp className="h-5 w-5 text-gray-400" />}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{week.focus}</p>
                      {activeWeek === week.number && <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{week.studyHours} hours/week</span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {week.activities.length} activities
                          </div>
                        </div>}
                    </div>)}
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      </div>
    </div>;
};
export default StudyPlanPage;