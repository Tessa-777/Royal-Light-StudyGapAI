import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { useResourcesByTopicId, useResourcesByTopicName, useAllResources, useTopics } from '../hooks/useResources';
import { ExternalLink as ExternalLinkIcon } from 'lucide-react';

const ResourcesPage = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const isAllResources = topicId === 'all';

  // Fetch resources based on topicId
  const { data: resourcesByTopicId } = useResourcesByTopicId(topicId || '');
  const { data: resourcesByTopicName } = useResourcesByTopicName('');
  const { data: allResources } = useAllResources();
  const { data: topics } = useTopics();

  const resources = isAllResources
    ? allResources
    : topicId
    ? resourcesByTopicId
    : resourcesByTopicName;

  const isLoading = false; // Add loading state from hooks if needed
  const error = null; // Add error state from hooks if needed

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading resources...</p>
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
              <p className="text-red-600 mb-4">Failed to load resources</p>
            </div>
          </Card.Body>
        </Card>
      </div>
    );
  }

  // Group resources by type
  const videoResources = resources?.filter((r) => r.type === 'video') || [];
  const practiceResources = resources?.filter((r) => r.type === 'practice_set') || [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Resources</h1>
          <p className="text-gray-600">
            Curated resources to help you master JAMB topics
          </p>
        </div>

        {/* Topic Filter */}
        {topics && topics.length > 0 && (
          <Card className="mb-6">
            <Card.Body>
              <div className="flex flex-wrap gap-2">
                <Link to="/resources/all">
                  <Badge variant={isAllResources ? 'strong' : 'developing'}>All Topics</Badge>
                </Link>
                {topics.map((topic) => (
                  <Link key={topic.id} to={`/resources/${topic.id}`}>
                    <Badge variant={topicId === topic.id ? 'strong' : 'developing'}>
                      {topic.name}
                    </Badge>
                  </Link>
                ))}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Video Resources */}
        {videoResources.length > 0 && (
          <Card className="mb-6">
            <Card.Header>
              <h2 className="text-xl font-semibold text-gray-900">Video Resources</h2>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {videoResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {resource.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          {resource.source && <span>Source: {resource.source}</span>}
                          {resource.duration_minutes && (
                            <span>Duration: {resource.duration_minutes} min</span>
                          )}
                          <Badge variant={resource.difficulty}>{resource.difficulty}</Badge>
                        </div>
                      </div>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4"
                      >
                        <Button variant="primary" size="sm">
                          <ExternalLinkIcon className="h-4 w-4 mr-2" />
                          Open
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Practice Resources */}
        {practiceResources.length > 0 && (
          <Card>
            <Card.Header>
              <h2 className="text-xl font-semibold text-gray-900">Practice Sets</h2>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {practiceResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {resource.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          {resource.source && <span>Source: {resource.source}</span>}
                          <Badge variant={resource.difficulty}>{resource.difficulty}</Badge>
                          <span>Upvotes: {resource.upvotes}</span>
                        </div>
                      </div>
                      <a
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4"
                      >
                        <Button variant="primary" size="sm">
                          <ExternalLinkIcon className="h-4 w-4 mr-2" />
                          Open
                        </Button>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        )}

        {(!resources || resources.length === 0) && (
          <Card>
            <Card.Body>
              <p className="text-gray-500 text-center py-8">
                No resources available for this topic.
              </p>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;

