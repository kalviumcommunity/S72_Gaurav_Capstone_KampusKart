import React from 'react';
import { FiMapPin, FiTag, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { MdSchool } from 'react-icons/md';
import { Facility } from '../types';
import { getIconByValue } from '../constants';
import { UI_PATTERNS } from '../../../theme/uiPatterns';

interface FacilityCardProps {
  facility: Facility;
  isAdmin?: boolean;
  onSelect: (facility: Facility) => void;
  onEdit: (facility: Facility) => void;
  onDelete: (id: string) => void;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({
  facility,
  isAdmin,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const iconOption = getIconByValue(facility.icon || 'MdSchool');

  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors duration-200 h-full flex flex-col"
      onClick={() => onSelect(facility)}
    >
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
        {facility.images && facility.images.length > 0 ? (
          <img
            src={facility.images[0].url}
            alt={facility.name}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/600x400?text=No+Image';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="flex flex-col items-center justify-center">
              <div className="p-4 rounded-lg bg-[#181818] dark:bg-[#00C6A7]">
                <div className="text-white">
                  {iconOption?.icon || <MdSchool className="w-16 h-16" />}
                </div>
              </div>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-4">
                No Image
              </span>
            </div>
          </div>
        )}

        <div className={UI_PATTERNS.badgeTopLeft}>
          <span className={UI_PATTERNS.badgeLabel}>
            <FiTag className="w-3 h-3" />
            {facility.type}
          </span>
        </div>

        <div className={UI_PATTERNS.badgeTopRight}>
          <span className={UI_PATTERNS.badgeLabel}>
            <FiMapPin className="w-3 h-3" />
            {facility.location}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 md:p-6 flex flex-col flex-grow">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 line-clamp-2">
          {facility.name}
        </h2>

        <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-3 flex-grow">
          {facility.description}
        </p>

        {isAdmin && (
          <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(facility);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors text-sm font-medium"
            >
              <FiEdit2 className="w-4 h-4" />
              <span>Edit</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(facility._id);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
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
