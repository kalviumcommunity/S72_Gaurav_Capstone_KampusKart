import React from 'react';
import { FiCalendar, FiTag, FiUsers } from 'react-icons/fi';
import { Club } from '../types';
import { UI_PATTERNS } from '../../../theme/uiPatterns';

interface ClubCardProps {
  club: Club;
  onSelect: (club: Club) => void;
}

export const ClubCard: React.FC<ClubCardProps> = ({ club, onSelect }) => {
  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 overflow-hidden cursor-pointer hover:border-gray-300 dark:hover:border-gray-700 transition-colors duration-200 h-full flex flex-col"
      onClick={() => onSelect(club)}
    >
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
        {club.image?.url ? (
          <img src={club.image.url} alt={club.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-col items-center justify-center text-gray-300 dark:text-gray-500">
              <FiUsers className="w-16 h-16" />
              <span className="text-xs mt-2">No Image Available</span>
            </div>
          </div>
        )}
        <div className={UI_PATTERNS.badgeTopRight}>
          <span
            className={`${UI_PATTERNS.badgeLabel} ${
              club.status === 'Open'
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {club.status}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 line-clamp-2">
          {club.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 flex-grow">
          {club.description}
        </p>

        <div className="space-y-3 pt-4 border-t-2 border-gray-200 dark:border-gray-800">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FiTag className="mr-2 flex-shrink-0 text-gray-400 dark:text-gray-500" />
            <span className="font-medium text-gray-900 dark:text-white">{club.clubName}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <FiCalendar className="mr-2 flex-shrink-0 text-gray-400 dark:text-gray-500" />
            <span>
              {new Date(club.startDate).toLocaleDateString()} -{' '}
              {new Date(club.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-800">
          <button
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-bold transition-colors duration-200 ${
              club.formUrl
                ? 'bg-[#181818] text-white hover:bg-[#00C6A7] active:bg-[#181818]'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
            disabled={!club.formUrl}
            onClick={(e) => {
              e.stopPropagation();
              if (club.formUrl) window.open(club.formUrl, '_blank');
            }}
          >
            {club.formUrl ? 'Apply Now' : 'Applications Closed'}
          </button>
        </div>
      </div>
    </div>
  );
};
