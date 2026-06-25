import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width = '100%',
  height = '1rem',
  rounded = 'md',
}) => {
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <div
      className={`bg-gray-200 dark:bg-gray-800 animate-pulse ${roundedClasses[rounded]} ${className}`}
      style={{ width, height }}
    />
  );
};

// Simple app-level skeleton for initial auth loading
export const AppSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="text-center">
        <Skeleton width={80} height={80} rounded="full" className="mx-auto mb-4" />
        <Skeleton height="24px" width="200px" className="mx-auto mb-2" />
        <Skeleton height="16px" width="150px" className="mx-auto" />
      </div>
    </div>
  );
};
