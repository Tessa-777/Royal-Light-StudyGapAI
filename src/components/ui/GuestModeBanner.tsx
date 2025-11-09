import React from 'react';
import { X, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

type GuestModeBannerProps = {
  onDismiss?: () => void;
  className?: string;
};

const GuestModeBanner = ({
  onDismiss,
  className = ''
}: GuestModeBannerProps) => {
  return <div className={`bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center flex-grow">
          <UserCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
          <p className="text-sm text-blue-800">
            Taking quiz as guest -{' '}
            <Link to="/register" className="font-medium underline hover:text-blue-900">
              Create account
            </Link>{' '}
            to save your results
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-3 text-blue-600 hover:text-blue-800 flex-shrink-0"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>;
};

export default GuestModeBanner;

