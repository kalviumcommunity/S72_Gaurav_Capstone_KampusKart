import React from 'react';
import { FiCalendar, FiTag, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { NewsItem } from '../types';
import { UI_PATTERNS } from '../../../theme/uiPatterns';

interface NewsCardProps {
  news: NewsItem;
  isAdmin?: boolean;
  onSelect: (news: NewsItem) => void;
  onEdit: (news: NewsItem) => void;
  onDelete: (id: string) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  news,
  isAdmin,
  onSelect,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200 h-full flex flex-col"
      onClick={() => onSelect(news)}
    >
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
        {news.images && news.images.length > 0 ? (
          <img src={news.images[0].url} alt={news.title} className="object-cover w-full h-full" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <span className="text-5xl text-gray-200 dark:text-gray-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-16 h-16"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0v10.5A2.25 2.25 0 0113.5 21h-3a2.25 2.25 0 01-2.25-2.25V9m7.5 0H6.75m8.25 0H18m-12 0h2.25"
                />
              </svg>
            </span>
          </div>
        )}

        <div className={UI_PATTERNS.badgeTopLeft}>
          <span className={UI_PATTERNS.badgeLabel}>
            <FiTag className="w-3 h-3" />
            {news.category}
          </span>
        </div>

        <div className={UI_PATTERNS.badgeTopRight}>
          <span className={UI_PATTERNS.badgeLabel}>
            <FiCalendar className="w-3 h-3" />
            {new Date(news.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 line-clamp-2">
          {news.title}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 flex-grow">
          {news.description}
        </p>

        {isAdmin && (
          <div className="flex flex-row gap-2 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(news);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors text-xs font-bold"
            >
              <FiEdit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(news._id);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors text-xs font-bold"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
