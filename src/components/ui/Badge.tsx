import React from 'react';

type BadgeProps = {
  children: React.ReactNode;
  variant: 'weak' | 'developing' | 'strong' | 'easy' | 'medium' | 'hard';
  className?: string;
};

const Badge = ({
  children,
  variant,
  className = ''
}: BadgeProps) => {
  const variantStyles = {
    weak: 'bg-red-100 text-red-800 border border-red-200',
    developing: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    strong: 'bg-green-100 text-green-800 border border-green-200',
    easy: 'bg-green-100 text-green-800 border border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    hard: 'bg-red-100 text-red-800 border border-red-200'
  };

  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {children}
    </span>;
};

export default Badge;

