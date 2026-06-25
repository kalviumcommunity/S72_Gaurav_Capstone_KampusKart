import React from 'react';
import { FiCheckCircle, FiX } from 'react-icons/fi';

interface SuccessMessageProps {
  message: string | null;
  className?: string;
  onDismiss?: () => void;
}

/**
 * Reusable success message banner component
 * Displays a green banner with checkmark icon
 */
export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  message,
  className = '',
  onDismiss,
}) => {
  if (!message) return null;

  return (
    <div
      className={`mb-6 rounded-lg bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 p-4 flex items-center gap-3 animate-fade-in ${className}`}
      role="alert"
      aria-live="polite"
    >
      <FiCheckCircle
        className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-green-800 dark:text-green-300 flex-1">{message}</p>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-md text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800/30"
          aria-label="Dismiss success message"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
