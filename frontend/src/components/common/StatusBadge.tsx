import React from 'react';
import {
  getEventStatusColor,
  getComplaintStatusColor,
  getLostFoundTypeColor,
  getResolvedStatusColor,
  getClubStatusColor,
  getPriorityColor,
  type EventStatus,
  type ComplaintStatus,
  type LostFoundType,
  type ClubStatus,
} from '../../utils/statusBadge';

interface StatusBadgeProps {
  status: string;
  type?: 'event' | 'complaint' | 'lostfound' | 'club' | 'priority' | 'resolved';
  className?: string;
}

/**
 * Reusable status badge component with consistent styling
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'event',
  className = '',
}) => {
  let colorClass = 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';

  switch (type) {
    case 'event':
      colorClass = getEventStatusColor(status as EventStatus);
      break;
    case 'complaint':
      colorClass = getComplaintStatusColor(status as ComplaintStatus);
      break;
    case 'lostfound':
      colorClass = getLostFoundTypeColor(status as LostFoundType);
      break;
    case 'club':
      colorClass = getClubStatusColor(status as ClubStatus);
      break;
    case 'priority':
      colorClass = getPriorityColor(status as 'Low' | 'Medium' | 'High' | 'Urgent');
      break;
    case 'resolved':
      colorClass = getResolvedStatusColor(status === 'resolved' || status === 'true');
      break;
  }

  return (
    <span
      className={`text-xs px-3 py-1.5 rounded-lg font-medium ${colorClass} ${className}`}
      role="status"
    >
      {status}
    </span>
  );
};
