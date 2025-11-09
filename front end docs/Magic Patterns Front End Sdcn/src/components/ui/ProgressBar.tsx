import React from 'react';
type ProgressBarProps = {
  progress: number; // 0-100
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red';
  className?: string;
};
const ProgressBar = ({
  progress,
  showPercentage = false,
  size = 'md',
  color = 'blue',
  className = ''
}: ProgressBarProps) => {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(Math.max(progress, 0), 100);
  const sizeStyles = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-4'
  };
  const colorStyles = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };
  return <div className={`w-full ${className}`}>
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeStyles[size]}`}>
        <div className={`${colorStyles[color]} rounded-full transition-all duration-500 ease-out`} style={{
        width: `${clampedProgress}%`
      }} role="progressbar" aria-valuenow={clampedProgress} aria-valuemin={0} aria-valuemax={100} />
      </div>
      {showPercentage && <div className="mt-1 text-xs text-gray-500 text-right">
          {clampedProgress}%
        </div>}
    </div>;
};
export default ProgressBar;