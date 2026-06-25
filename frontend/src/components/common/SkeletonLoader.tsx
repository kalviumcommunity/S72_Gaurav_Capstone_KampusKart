import React from 'react';
import { UI_PATTERNS } from '../../theme/uiPatterns';

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

// Card Skeleton for grid layouts (standard 3-column)
export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          <div className={UI_PATTERNS.skeletonCardMedia} />
          <div className={UI_PATTERNS.skeletonCardBody}>
            <Skeleton height="24px" width="70%" className="mb-3" />
            <Skeleton height="16px" width="90%" className="mb-2" />
            <Skeleton height="16px" width="60%" className="mb-4" />
            <div className={UI_PATTERNS.skeletonCardActions}>
              <Skeleton height="14px" width="40%" />
              <Skeleton height="14px" width="30%" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Card Skeleton for 4-column layouts (LostFound, Complaints)
export const CardSkeleton4Col: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 overflow-hidden"
        >
          <div className={UI_PATTERNS.skeletonCardMedia} />
          <div className={UI_PATTERNS.skeletonCardBody}>
            <Skeleton height="20px" width="70%" className="mb-2" />
            <Skeleton height="16px" width="85%" className="mb-1" />
            <Skeleton height="16px" width="50%" className="mb-3" />
            <div className={UI_PATTERNS.skeletonCardActions}>
              <Skeleton height="14px" width="40%" />
              <Skeleton height="14px" width="25%" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// List Skeleton for list layouts
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 p-4"
        >
          <div className="flex items-start gap-4">
            <Skeleton width={48} height={48} rounded="full" />
            <div className="flex-1 space-y-2">
              <Skeleton height="20px" width="40%" />
              <Skeleton height="16px" width="80%" />
              <Skeleton height="16px" width="60%" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Table Skeleton
export const TableSkeleton: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <Skeleton height="24px" width="30%" />
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-800">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 flex gap-4">
            {Array.from({ length: cols }).map((_, colIndex) => (
              <Skeleton key={colIndex} height="20px" width={`${100 / cols}%`} className="flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Page Skeleton with header and content
export const PageSkeleton: React.FC<{
  showHeader?: boolean;
  showFilters?: boolean;
  filterCount?: number; // Number of filter dropdowns (1 or 2)
  contentType?: 'cards' | 'cards4col' | 'list' | 'table';
  itemCount?: number;
  showAddButton?: boolean;
}> = ({
  showHeader = true,
  showFilters = true,
  filterCount = 1,
  contentType = 'cards',
  itemCount = 6,
  showAddButton = true,
}) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {showHeader && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <Skeleton height="40px" className="w-48 sm:w-64 md:w-72" />
            {showAddButton && <Skeleton height="48px" width="180px" rounded="lg" />}
          </div>
        )}

        {showFilters && (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              {Array.from({ length: filterCount }).map((_, index) => (
                <Skeleton key={index} height="40px" width="150px" rounded="md" />
              ))}
            </div>
            <div className="relative w-full md:w-[500px]">
              <Skeleton height="40px" width="100%" rounded="lg" />
            </div>
          </div>
        )}

        {contentType === 'cards' && <CardSkeleton count={itemCount} />}
        {contentType === 'cards4col' && <CardSkeleton4Col count={itemCount} />}
        {contentType === 'list' && <ListSkeleton count={itemCount} />}
        {contentType === 'table' && <TableSkeleton rows={itemCount} />}
      </main>
    </div>
  );
};

// Chat Message Skeleton
export const ChatMessageSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="space-y-4 p-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`flex gap-3 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}
        >
          {index % 2 !== 0 && <Skeleton width={40} height={40} rounded="full" />}
          <div className={`max-w-[70%] ${index % 2 === 0 ? 'order-2' : ''}`}>
            <Skeleton height="60px" width="200px" rounded="lg" className="mb-2" />
            <Skeleton height="12px" width="80px" />
          </div>
          {index % 2 === 0 && <Skeleton width={40} height={40} rounded="full" />}
        </div>
      ))}
    </div>
  );
};

// Chat Page Skeleton with Header
export const ChatSkeleton: React.FC<{ messageCount?: number }> = ({ messageCount = 8 }) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 overflow-hidden">
      {/* Chat Header Skeleton - matches actual ChatHeader */}
      <div className="bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-800 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Avatar with border box */}
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm">
            <Skeleton width={36} height={36} rounded="full" />
          </div>
          <div className="space-y-1">
            {/* Title */}
            <Skeleton height="20px" width="140px" className="mb-1" />
            {/* Status with dot */}
            <div className="flex items-center gap-2">
              <Skeleton width={8} height={8} rounded="full" />
              <Skeleton height="12px" width="100px" />
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages Skeleton */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 bg-transparent">
        <ChatMessageSkeleton count={messageCount} />
      </div>

      {/* Input Area Skeleton */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-3 sm:p-4 bg-white dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Skeleton height="40px" width="40px" rounded="full" />
          <Skeleton height="48px" width="100%" rounded="full" />
          <Skeleton height="40px" width="40px" rounded="full" />
        </div>
      </div>
    </div>
  );
};

// Map Skeleton
export const MapSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <div className="p-4">
        <Skeleton height="40px" width="200px" className="mb-4" />
      </div>
      <div className="relative w-full h-[calc(100vh-200px)]">
        <Skeleton height="100%" rounded="none" />
        <div className="absolute top-4 left-4 right-4">
          <Skeleton height="48px" rounded="full" />
        </div>
        <div className="absolute bottom-4 right-4 w-80 bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 p-4">
          <Skeleton height="24px" width="60%" className="mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} height="60px" rounded="md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Skeleton;
