import React, { useEffect, useId, useRef, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { ErrorMessage } from './ErrorMessage';

interface FeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  error?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-3xl',
  xl: 'max-w-4xl',
};

/**
 * Standardized modal component for feature components (Events, News, LostFound, etc.)
 * Provides consistent styling and behavior across all feature modals
 */
export const FeatureModal: React.FC<FeatureModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  error,
  size = 'md',
}) => {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef<number | null>(null);
  const [sheetOffsetY, setSheetOffsetY] = useState(0);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Move focus into modal on open and trap tab navigation inside.
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    const root = dialogRef.current;
    const selector = [
      'button:not([disabled])',
      'a[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const getFocusable = () => Array.from(root.querySelectorAll<HTMLElement>(selector));
    const focusable = getFocusable();
    (focusable[0] || root).focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const currentFocusable = getFocusable();
      if (currentFocusable.length === 0) {
        e.preventDefault();
        root.focus();
        return;
      }

      const first = currentFocusable[0];
      const last = currentFocusable[currentFocusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    root.addEventListener('keydown', handleTabKey);
    return () => root.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !error || !dialogRef.current) return;
    const contentContainer = dialogRef.current.querySelector('div[style]') as HTMLDivElement | null;
    if (contentContainer) {
      contentContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isOpen, error]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-[9999] p-0 sm:p-4"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      tabIndex={-1}
      ref={dialogRef}
    >
      <div
        ref={sheetRef}
        className={`bg-white dark:bg-gray-950 sm:rounded-xl rounded-t-xl shadow-2xl border-2 border-gray-200 dark:border-gray-800 p-4 sm:p-6 md:p-8 ${sizeClasses[size]} w-full mx-auto overflow-y-auto relative`}
        style={{
          maxHeight: 'min(95vh, 95dvh)',
          transform: `translateY(${sheetOffsetY}px)`,
          transition: sheetOffsetY === 0 ? 'transform 220ms ease' : 'none',
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => {
          if (window.innerWidth >= 640) return;
          touchStartYRef.current = e.touches[0].clientY;
        }}
        onTouchMove={(e) => {
          if (window.innerWidth >= 640 || touchStartYRef.current === null) return;
          const deltaY = e.touches[0].clientY - touchStartYRef.current;
          setSheetOffsetY(deltaY > 0 ? deltaY : 0);
        }}
        onTouchEnd={() => {
          if (window.innerWidth >= 640) return;
          if (sheetOffsetY > 90) {
            setSheetOffsetY(0);
            onClose();
            touchStartYRef.current = null;
            return;
          }
          setSheetOffsetY(0);
          touchStartYRef.current = null;
        }}
      >
        <div
          className="sm:hidden w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-700 mx-auto mb-4"
          aria-hidden="true"
        />
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
          <h2 id={titleId} className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="bg-[#181818] hover:bg-[#00C6A7] active:bg-[#181818] text-white rounded-lg p-2 transition-all duration-200 flex-shrink-0 flex items-center justify-center w-10 h-10"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Content */}
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
};
