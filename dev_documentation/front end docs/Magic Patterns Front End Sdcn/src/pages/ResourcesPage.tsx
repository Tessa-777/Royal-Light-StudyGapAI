import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Search, Video, FileText, BookOpen, Filter, ExternalLink } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
// Mock resources data
const mockTopics = [{
  id: 'all',
  name: 'All Resources'
}, {
  id: 'algebra',
  name: 'Algebra'
}, {
  id: 'calculus',
  name: 'Calculus'
}, {
  id: 'geometry',
  name: 'Geometry'
}, {
  id: 'physics',
  name: 'Physics'
}, {
  id: 'chemistry',
  name: 'Chemistry'
}];
const mockResources = {
  all: [{
    id: 'res1',
    type: 'video',
    title: 'Introduction to Algebra',
    source: 'Khan Academy',
    duration: '15 min',
    difficulty: 'easy',
    upvotes: 42,
    topic: 'algebra',
    url: '#'
  }, {
    id: 'res2',
    type: 'practice',
    title: 'Calculus Problem Set 1',
    source: 'JAMB Prep',
    duration: null,
    difficulty: 'medium',
    upvotes: 28,
    topic: 'calculus',
    url: '#'
  }, {
    id: 'res3',
    type: 'reading',
    title: 'Geometry Concepts Explained',
    source: 'StudyGapAI',
    duration: '30 min',
    difficulty: 'medium',
    upvotes: 35,
    topic: 'geometry',
    url: '#'
  }, {
    id: 'res4',
    type: 'video',
    title: 'Physics Mechanics Fundamentals',
    source: 'MathExplained',
    duration: '25 min',
    difficulty: 'hard',
    upvotes: 19,
    topic: 'physics',
    url: '#'
  }, {
    id: 'res5',
    type: 'practice',
    title: 'Chemistry Equations Quiz',
    source: 'JAMB Prep',
    duration: null,
    difficulty: 'medium',
    upvotes: 31,
    topic: 'chemistry',
    url: '#'
  }, {
    id: 'res6',
    type: 'reading',
    title: 'Advanced Calculus Techniques',
    source: 'StudyGapAI',
    duration: '45 min',
    difficulty: 'hard',
    upvotes: 22,
    topic: 'calculus',
    url: '#'
  }],
  algebra: [{
    id: 'res1',
    type: 'video',
    title: 'Introduction to Algebra',
    source: 'Khan Academy',
    duration: '15 min',
    difficulty: 'easy',
    upvotes: 42,
    topic: 'algebra',
    url: '#'
  }, {
    id: 'res7',
    type: 'practice',
    title: 'Algebra Practice Problems',
    source: 'JAMB Prep',
    duration: null,
    difficulty: 'medium',
    upvotes: 37,
    topic: 'algebra',
    url: '#'
  }, {
    id: 'res8',
    type: 'video',
    title: 'Solving Quadratic Equations',
    source: 'MathExplained',
    duration: '20 min',
    difficulty: 'medium',
    upvotes: 29,
    topic: 'algebra',
    url: '#'
  }],
  calculus: [{
    id: 'res2',
    type: 'practice',
    title: 'Calculus Problem Set 1',
    source: 'JAMB Prep',
    duration: null,
    difficulty: 'medium',
    upvotes: 28,
    topic: 'calculus',
    url: '#'
  }, {
    id: 'res6',
    type: 'reading',
    title: 'Advanced Calculus Techniques',
    source: 'StudyGapAI',
    duration: '45 min',
    difficulty: 'hard',
    upvotes: 22,
    topic: 'calculus',
    url: '#'
  }, {
    id: 'res9',
    type: 'video',
    title: 'Understanding Derivatives',
    source: 'Khan Academy',
    duration: '18 min',
    difficulty: 'medium',
    upvotes: 33,
    topic: 'calculus',
    url: '#'
  }],
  geometry: [{
    id: 'res3',
    type: 'reading',
    title: 'Geometry Concepts Explained',
    source: 'StudyGapAI',
    duration: '30 min',
    difficulty: 'medium',
    upvotes: 35,
    topic: 'geometry',
    url: '#'
  }, {
    id: 'res10',
    type: 'practice',
    title: 'Geometry Problem Set',
    source: 'JAMB Prep',
    duration: null,
    difficulty: 'easy',
    upvotes: 41,
    topic: 'geometry',
    url: '#'
  }],
  physics: [{
    id: 'res4',
    type: 'video',
    title: 'Physics Mechanics Fundamentals',
    source: 'MathExplained',
    duration: '25 min',
    difficulty: 'hard',
    upvotes: 19,
    topic: 'physics',
    url: '#'
  }, {
    id: 'res11',
    type: 'practice',
    title: 'Physics Problem Set',
    source: 'JAMB Prep',
    duration: null,
    difficulty: 'hard',
    upvotes: 15,
    topic: 'physics',
    url: '#'
  }],
  chemistry: [{
    id: 'res5',
    type: 'practice',
    title: 'Chemistry Equations Quiz',
    source: 'JAMB Prep',
    duration: null,
    difficulty: 'medium',
    upvotes: 31,
    topic: 'chemistry',
    url: '#'
  }, {
    id: 'res12',
    type: 'video',
    title: 'Balancing Chemical Equations',
    source: 'Chemistry Simplified',
    duration: '22 min',
    difficulty: 'medium',
    upvotes: 27,
    topic: 'chemistry',
    url: '#'
  }]
};
const ResourcesPage = () => {
  const {
    topicId = 'all'
  } = useParams<{
    topicId: string;
  }>();
  const [typeFilter, setTypeFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  // Get current topic name
  const currentTopic = mockTopics.find(topic => topic.id === topicId) || mockTopics[0];
  // Get resources for current topic
  const topicResources = mockResources[topicId as keyof typeof mockResources] || mockResources.all;
  // Apply filters and sorting
  const filteredResources = topicResources.filter(resource => {
    // Apply type filter
    if (typeFilter !== 'all' && resource.type !== typeFilter) {
      return false;
    }
    // Apply difficulty filter
    if (difficultyFilter !== 'all' && resource.difficulty !== difficultyFilter) {
      return false;
    }
    // Apply search query
    if (searchQuery && !resource.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  }).sort((a, b) => {
    // Apply sorting
    if (sortBy === 'relevance') {
      return 0; // No specific sorting for relevance
    } else if (sortBy === 'upvotes') {
      return b.upvotes - a.upvotes;
    } else if (sortBy === 'duration') {
      // Sort by duration (videos and readings)
      if (a.duration && b.duration) {
        return parseInt(a.duration) - parseInt(b.duration);
      } else if (a.duration) {
        return -1;
      } else if (b.duration) {
        return 1;
      }
      return 0;
    }
    return 0;
  });
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
  // Toggle viewed status
  const handleToggleViewed = (resourceId: string) => {
    // In a real app, this would update the state and make an API call
    console.log(`Toggling viewed status for resource: ${resourceId}`);
  };
  return <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center">
            <Link to="/resources/all" className="mr-3">
              <Button variant="secondary" size="sm" className="p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentTopic.name}
            </h1>
          </div>
          <div className="flex sm:w-auto w-full">
            <div className="relative flex-grow">
              <input type="text" placeholder="Search resources..." className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <button className="ml-2 p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 md:hidden" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className={`md:w-64 md:block ${showFilters ? 'block' : 'hidden'}`}>
            <Card className="sticky top-20">
              <Card.Header>
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              </Card.Header>
              <Card.Body className="space-y-6">
                {/* Topics Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Topics
                  </h3>
                  <div className="space-y-2">
                    {mockTopics.map(topic => <div key={topic.id} className="flex items-center">
                        <Link to={`/resources/${topic.id}`} className={`text-sm ${topicId === topic.id ? 'font-medium text-blue-600' : 'text-gray-700 hover:text-blue-600'}`}>
                          {topic.name}
                        </Link>
                      </div>)}
                  </div>
                </div>
                {/* Resource Type Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Resource Type
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input id="type-all" type="radio" name="type" checked={typeFilter === 'all'} onChange={() => setTypeFilter('all')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      <label htmlFor="type-all" className="ml-2 text-sm text-gray-700">
                        All Types
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input id="type-video" type="radio" name="type" checked={typeFilter === 'video'} onChange={() => setTypeFilter('video')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      <label htmlFor="type-video" className="ml-2 text-sm text-gray-700">
                        Videos
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input id="type-practice" type="radio" name="type" checked={typeFilter === 'practice'} onChange={() => setTypeFilter('practice')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      <label htmlFor="type-practice" className="ml-2 text-sm text-gray-700">
                        Practice Sets
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input id="type-reading" type="radio" name="type" checked={typeFilter === 'reading'} onChange={() => setTypeFilter('reading')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      <label htmlFor="type-reading" className="ml-2 text-sm text-gray-700">
                        Reading
                      </label>
                    </div>
                  </div>
                </div>
                {/* Difficulty Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Difficulty
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input id="difficulty-all" type="radio" name="difficulty" checked={difficultyFilter === 'all'} onChange={() => setDifficultyFilter('all')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      <label htmlFor="difficulty-all" className="ml-2 text-sm text-gray-700">
                        All Difficulties
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input id="difficulty-easy" type="radio" name="difficulty" checked={difficultyFilter === 'easy'} onChange={() => setDifficultyFilter('easy')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      <label htmlFor="difficulty-easy" className="ml-2 text-sm text-gray-700">
                        Easy
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input id="difficulty-medium" type="radio" name="difficulty" checked={difficultyFilter === 'medium'} onChange={() => setDifficultyFilter('medium')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      <label htmlFor="difficulty-medium" className="ml-2 text-sm text-gray-700">
                        Medium
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input id="difficulty-hard" type="radio" name="difficulty" checked={difficultyFilter === 'hard'} onChange={() => setDifficultyFilter('hard')} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      <label htmlFor="difficulty-hard" className="ml-2 text-sm text-gray-700">
                        Hard
                      </label>
                    </div>
                  </div>
                </div>
                {/* Sort By */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Sort By
                  </h3>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="relevance">Relevance</option>
                    <option value="upvotes">Most Upvoted</option>
                    <option value="duration">Duration (Shortest First)</option>
                  </select>
                </div>
              </Card.Body>
            </Card>
          </div>
          {/* Resources Grid */}
          <div className="flex-grow">
            {filteredResources.length > 0 ? <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredResources.map(resource => <Card key={resource.id} className="h-full">
                    <Card.Body>
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
                          <div className="flex flex-wrap justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <Badge variant={resource.difficulty === 'easy' ? 'easy' : resource.difficulty === 'medium' ? 'medium' : 'hard'}>
                                {resource.difficulty.charAt(0).toUpperCase() + resource.difficulty.slice(1)}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {resource.upvotes} upvotes
                              </span>
                            </div>
                            <div className="flex mt-2 sm:mt-0">
                              <button onClick={() => handleToggleViewed(resource.id)} className="text-xs text-gray-500 hover:text-blue-600 mr-3">
                                Mark as viewed
                              </button>
                              <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
                                View
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>)}
              </div> : <Card className="text-center py-12">
                <Card.Body>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No resources found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your filters or search query
                  </p>
                  <Button variant="secondary" onClick={() => {
                setTypeFilter('all');
                setDifficultyFilter('all');
                setSearchQuery('');
              }}>
                    Reset Filters
                  </Button>
                </Card.Body>
              </Card>}
          </div>
        </div>
      </div>
    </div>;
};
export default ResourcesPage;