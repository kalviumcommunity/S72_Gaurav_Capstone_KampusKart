import React from 'react';
import { FiAlertCircle } from 'react-icons/fi';

interface ErrorMessageProps {
  message: string | null | undefined;
  className?: string;
}

/**
 * Standardized error message component
 * Provides consistent error display across all features
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, className = '' }) => {
  if (!message) return null;

  return (
    <div
      className={`mb-6 p-4 bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-900 rounded-lg ${className}`}
    >
      <div className="flex items-center text-red-700 dark:text-red-400">
        <FiAlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
        <span>{message}</span>
      </div>
    </div>
  );
};
