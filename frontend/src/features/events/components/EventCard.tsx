import React from 'react';
import { FiCalendar, FiMapPin } from 'react-icons/fi';
import { Event } from '../types';
import { UI_PATTERNS } from '../../../theme/uiPatterns';

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const renderStatus = (status: Event['status']) => {
    let bgColorClass;
    let textColorClass;

    switch (status) {
      case 'Upcoming':
        bgColorClass = 'bg-blue-100 dark:bg-blue-900/30';
        textColorClass = 'text-blue-800 dark:text-blue-300';
        break;
      case 'Ongoing':
        bgColorClass = 'bg-green-100 dark:bg-green-900/30';
        textColorClass = 'text-green-800 dark:text-green-300';
        break;
      case 'Completed':
        bgColorClass = 'bg-gray-100 dark:bg-gray-800';
        textColorClass = 'text-gray-800 dark:text-gray-300';
        break;
      case 'Cancelled':
        bgColorClass = 'bg-red-100 dark:bg-red-900/30';
        textColorClass = 'text-red-800 dark:text-red-300';
        break;
      default:
        bgColorClass = 'bg-gray-100 dark:bg-gray-800';
        textColorClass = 'text-gray-800 dark:text-gray-300';
    }

    return (
      <span
        className={`text-xs px-3 py-1.5 rounded-lg font-medium ${bgColorClass} ${textColorClass}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 overflow-hidden cursor-pointer hover:border-gray-300 dark:hover:border-gray-700 transition-colors duration-200 h-full flex flex-col"
      onClick={() => onClick(event)}
    >
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
        {event.image?.url ? (
          <img src={event.image.url} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-col items-center justify-center text-gray-300 dark:text-gray-600">
              <FiCalendar className="w-16 h-16" />
              <span className="text-xs mt-2">No Image Available</span>
            </div>
          </div>
        )}

        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 max-w-[calc(100%-1rem)]">
          {renderStatus(event.status)}
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 line-clamp-2">
          {event.title}
        </h2>

        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 flex-grow">
          {event.description}
        </p>

        <div className="space-y-3 pt-4 border-t-2 border-gray-200 dark:border-gray-800">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FiCalendar className="mr-2 flex-shrink-0" />
            <span>
              {new Date(event.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FiMapPin className="mr-2 flex-shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-800">
          <button
            className={`w-full flex items-center justify-center gap-2 ${UI_PATTERNS.buttonPrimary} font-medium ${
              event.registerUrl
                ? ''
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-800 cursor-not-allowed border-gray-200 dark:border-gray-700'
            }`}
            disabled={!event.registerUrl}
            onClick={(e) => {
              e.stopPropagation();
              if (event.registerUrl) window.open(event.registerUrl, '_blank');
            }}
          >
            {event.registerUrl ? 'Register Now' : 'Details Only'}
          </button>
        </div>
      </div>
    </div>
  );
};
