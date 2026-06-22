import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import { LostFoundFilters as Filters } from '../types';

interface LostFoundFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Partial<Filters>) => void;
  suggestions: string[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  searchRef: React.RefObject<HTMLDivElement>;
  onSuggestionSelect: (suggestion: string) => void;
}

export const LostFoundFilters: React.FC<LostFoundFiltersProps> = ({
  filters,
  onFilterChange,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  searchRef,
  onSuggestionSelect,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search);

  const handleSearchSubmit = () => {
    onFilterChange({ search: searchInput });
    setShowSuggestions(false);
  };

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
      {/* Type and Resolution Filters */}
      <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
        <div className="relative">
          <select
            value={filters.type}
            onChange={e => onFilterChange({ type: e.target.value as any })}
            className="appearance-none w-full sm:w-auto px-5 py-3 pr-10 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-semibold border-2 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] focus:border-transparent transition-all duration-200 cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="lost">Lost Items</option>
            <option value="found">Found Items</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="relative">
          <select
            value={filters.resolved}
            onChange={e => onFilterChange({ resolved: e.target.value as any })}
            className="appearance-none w-full sm:w-auto px-5 py-3 pr-10 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 font-semibold border-2 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00C6A7] focus:border-transparent transition-all duration-200 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="unresolved">Unresolved</option>
            <option value="resolved">Resolved</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full sm:w-[380px] md:w-[440px] lg:w-[520px]" ref={searchRef}>
        <div className="relative w-full rounded-lg border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 focus-within:ring-2 focus-within:ring-[#00C6A7] focus-within:border-transparent transition-all duration-200 flex items-center">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchSubmit();
              else if (e.key === 'Escape') setShowSuggestions(false);
            }}
            placeholder="Search items..."
            className="flex-1 pl-12 pr-3 py-3.5 bg-transparent text-gray-700 dark:text-gray-200 font-medium outline-none text-base border-none placeholder:text-gray-400 rounded-l-lg"
          />
          <button
            type="button"
            onClick={handleSearchSubmit}
            className="px-6 py-3.5 bg-[#181818] text-white font-bold text-sm hover:bg-[#00C6A7] active:bg-[#181818] flex items-center justify-center gap-2 transition-all duration-200 border-l-2 border-gray-200 dark:border-gray-800 rounded-r-lg"
          >
            <FiSearch className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-[60] w-full mt-2 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-lg shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSearchInput(suggestion);
                  onSuggestionSelect(suggestion);
                }}
                className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b-2 border-gray-200 dark:border-gray-800 last:border-b-0"
              >
                <FiSearch className="w-4 h-4 text-gray-400 mr-3 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{suggestion}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
