import React, { useState } from 'react';
import { FiSearch, FiMapPin, FiInfo } from 'react-icons/fi';
import { Location } from '../types';

interface MapSidebarProps {
  locations: Location[];
  onLocationSelect: (loc: Location) => void;
  selectedLocationId?: number;
  searchInput: string;
  onSearchChange: (val: string) => void;
  suggestions: string[];
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  searchRef: React.RefObject<HTMLDivElement>;
}

export const MapSidebar: React.FC<MapSidebarProps> = ({
  locations,
  onLocationSelect,
  selectedLocationId,
  searchInput,
  onSearchChange,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  searchRef,
}) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l-2 border-gray-200 dark:border-gray-700 w-full md:w-1/3 min-w-[320px] max-w-[480px]">
      {/* Search Header */}
      <div
        className="p-4 border-b-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        ref={searchRef}
      >
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search campus..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:border-[#00C6A7] focus:ring-4 focus:ring-teal-50 dark:focus:ring-teal-900/30 outline-none transition-all font-medium"
          />

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-auto">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSearchChange(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="w-full flex items-center px-4 py-3 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-colors text-left border-b border-gray-50 dark:border-gray-700 last:border-none"
                >
                  <FiSearch className="mr-3 text-gray-300" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {suggestion}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Locations List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <FiInfo className="text-gray-300 w-8 h-8" />
            </div>
            <p className="text-gray-500 dark:text-gray-300 font-bold">No locations found</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1 px-8">
              Try a different search term or category
            </p>
          </div>
        ) : (
          locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => onLocationSelect(loc)}
              className={`w-full flex flex-col p-4 rounded-2xl border-2 transition-all text-left group ${
                selectedLocationId === loc.id
                  ? 'border-[#00C6A7] bg-teal-50 dark:bg-teal-900/20 ring-2 ring-teal-100 dark:ring-teal-800'
                  : 'border-gray-50 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl flex-shrink-0 transition-colors ${
                    selectedLocationId === loc.id
                      ? 'bg-[#00C6A7] text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-300 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                  }`}
                >
                  <FiMapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4
                    className={`font-bold text-sm leading-tight mb-1 transition-colors ${
                      selectedLocationId === loc.id
                        ? 'text-teal-900 dark:text-teal-300'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    {loc.name}
                  </h4>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      selectedLocationId === loc.id
                        ? 'bg-teal-200/50 dark:bg-teal-800/40 text-teal-700 dark:text-teal-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-300'
                    }`}
                  >
                    {loc.category}
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
