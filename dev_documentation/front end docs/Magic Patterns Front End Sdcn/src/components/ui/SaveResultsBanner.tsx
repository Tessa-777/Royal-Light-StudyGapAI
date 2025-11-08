import React from 'react';
import { X, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './Button';
type SaveResultsBannerProps = {
  onDismiss: () => void;
  className?: string;
};
const SaveResultsBanner = ({
  onDismiss,
  className = ''
}: SaveResultsBannerProps) => {
  return <div className={`bg-blue-50 border-2 border-blue-200 rounded-lg shadow-md mb-6 ${className}`}>
      <div className="p-6 relative">
        <button onClick={onDismiss} className="absolute top-4 right-4 text-blue-600 hover:text-blue-800" aria-label="Dismiss banner">
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-start mb-4">
          <div className="bg-blue-100 p-3 rounded-full mr-4 flex-shrink-0">
            <Save className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Save your results and track your progress?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Create an account to save your diagnostic results, get a
              personalized study plan, and track your improvement over time.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 ml-0 sm:ml-16">
          <Link to="/register" className="flex-grow sm:flex-grow-0">
            <Button variant="primary" size="md" className="w-full sm:w-auto">
              Create Account
            </Button>
          </Link>
          <button onClick={onDismiss} className="text-sm text-gray-600 hover:text-gray-800 font-medium">
            Continue Without Saving
          </button>
        </div>
      </div>
    </div>;
};
export default SaveResultsBanner;