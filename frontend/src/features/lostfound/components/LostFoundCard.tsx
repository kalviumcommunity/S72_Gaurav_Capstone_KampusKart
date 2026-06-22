import React from 'react';
import { FiMapPin, FiCalendar, FiUser, FiCheckCircle, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { LostFoundItem } from '../types';
import { UI_PATTERNS } from '../../../theme/uiPatterns';

interface LostFoundCardProps {
  item: LostFoundItem;
  currentUser: any;
  token: string | null;
  onSelect: (item: LostFoundItem) => void;
  onResolve: (id: string) => void;
  onEdit: (item: LostFoundItem) => void;
  onDelete: (id: string) => void;
}

export const LostFoundCard: React.FC<LostFoundCardProps> = ({
  item,
  currentUser,
  token,
  onSelect,
  onResolve,
  onEdit,
  onDelete,
}) => {
  const canManage = token && currentUser && item.user && (currentUser._id === item.user._id || currentUser.isAdmin);

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 overflow-hidden cursor-pointer hover:border-gray-300 dark:hover:border-gray-700 transition-colors duration-200"
      onClick={() => onSelect(item)}
    >
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
        {item.images && item.images.length > 0 ? (
          <img
            src={item.images[0].url}
            alt={item.title || 'Item'}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <span className="text-5xl text-gray-300 dark:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-16 h-16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0v10.5A2.25 2.25 0 0113.5 21h-3a2.25 2.25 0 01-2.25-2.25V9m7.5 0H6.75m8.25 0H18m-12 0h2.25" />
              </svg>
            </span>
          </div>
        )}
        <div className={`${UI_PATTERNS.badgeTopRight} flex flex-col gap-2`}>
          <span className={`${UI_PATTERNS.badgeLabel} ${
            item.type === 'lost' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {item.type === 'lost' ? 'Lost Item' : 'Found Item'}
          </span>
          <span className={`${UI_PATTERNS.badgeLabel} ${
            item.resolved ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {item.resolved ? 'Resolved' : 'Unresolved'}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 line-clamp-2">{item.title || 'Item'}</h2>
        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3">{item.description}</p>

        <div className="space-y-3 pt-4 border-t-2 border-gray-200 dark:border-gray-800">
          {item.location && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <FiMapPin className="mr-2 flex-shrink-0" />
              <span className="truncate">{item.location}</span>
            </div>
          )}
          {item.date && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <FiCalendar className="mr-2 flex-shrink-0" />
              <span>{new Date(item.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
          )}
          {item.user?.name && (
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <FiUser className="mr-2 flex-shrink-0" />
              <span className="truncate">Posted by {item.user.name}</span>
            </div>
          )}
        </div>

        {canManage && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-800">
            {!item.resolved && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onResolve(item._id);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-200 text-xs font-medium min-w-0 min-h-touch"
              >
                <FiCheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Resolve</span>
              </button>
            )}
            {!item.resolved && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-xs font-medium min-w-0 min-h-touch"
              >
                <FiEdit2 className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">Edit</span>
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item._id);
              }}
              className="flex-1 sm:flex-none sm:px-4 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white dark:bg-gray-900 text-red-700 dark:text-red-400 border-2 border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 text-xs font-semibold min-w-0 min-h-touch"
            >
              <FiTrash2 className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">Delete</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
