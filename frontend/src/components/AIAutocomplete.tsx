import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiClock, FiTrendingUp, FiTag, FiFileText } from 'react-icons/fi';

interface AutocompleteSuggestion {
  id: string;
  text: string;
  type: 'recent' | 'trending' | 'ai' | 'category' | 'data';
  category?: string;
  confidence?: number;
}

interface AIAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (suggestion: AutocompleteSuggestion) => void;
  placeholder: string;
  className?: string;
  suggestions: AutocompleteSuggestion[];
  isLoading?: boolean;
  disabled?: boolean;
  showSubmitButton?: boolean;
  submitLabel?: string;
  onSubmit?: () => void;
}

const AIAutocomplete: React.FC<AIAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder,
  className = '',
  suggestions,
  isLoading = false,
  disabled = false,
  showSubmitButton = true,
  submitLabel = 'Search',
  onSubmit
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [openUpward, setOpenUpward] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Decide whether to open dropdown above or below based on viewport space
  const decideDropdownDirection = useCallback(() => {
    const inputEl = inputRef.current;
    if (!inputEl) return setOpenUpward(false);
    const rect = inputEl.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    // Prefer below, but open upward if below space is limited (< 220px) and above has more room
    setOpenUpward(spaceBelow < 220 && spaceAbove > spaceBelow);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        onSelect(suggestions[highlightedIndex]);
        setIsOpen(false);
        setHighlightedIndex(-1);
      } else if (onSubmit) {
        onSubmit();
        setIsOpen(false);
      }
      return;
    }

    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  }, [isOpen, suggestions, highlightedIndex, onSelect, onSubmit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    if (newValue.trim().length > 0) {
      decideDropdownDirection();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
    setHighlightedIndex(-1);
  };

  const handleSuggestionClick = (suggestion: AutocompleteSuggestion) => {
    onSelect(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const getSuggestionIcon = (type: AutocompleteSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return <FiClock className="w-4 h-4 text-gray-400" />;
      case 'trending':
        return <FiTrendingUp className="w-4 h-4 text-green-500" />;
      case 'ai':
        return <FiSearch className="w-4 h-4 text-blue-500" />;
      case 'category':
        return <FiTag className="w-4 h-4 text-purple-500" />;
      case 'data':
        return <FiFileText className="w-4 h-4 text-amber-600" />;
      default:
        return <FiSearch className="w-4 h-4 text-gray-400" />;
    }
  };

  const getSuggestionBadge = (type: AutocompleteSuggestion['type']) => {
    switch (type) {
      case 'recent':
        return <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">Recent</span>;
      case 'trending':
        return <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded">Trending</span>;
      case 'ai':
        return <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">AI</span>;
      case 'category':
        return <span className="text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">Category</span>;
      case 'data':
        return <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">Data</span>;
      default:
        return null;
    }
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div className="relative w-full rounded-full border border-gray-300 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 overflow-hidden">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { decideDropdownDirection(); if (suggestions.length > 0) setIsOpen(true); }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-24 sm:pr-32 py-3 sm:py-2.5 bg-transparent text-black outline-none text-base sm:text-sm border-none"
        />
        {showSubmitButton && (
          <button
            type="button"
            onClick={() => onSubmit && onSubmit()}
            disabled={disabled || isLoading}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-10 sm:h-9 px-3.5 sm:px-4 rounded-full bg-[#00C6A7] text-white font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            aria-label={submitLabel}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <>
                <FiSearch className="w-4 h-4" />
                <span className="hidden sm:inline">{submitLabel}</span>
              </>
            )}
          </button>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className={`${openUpward ? 'bottom-full mb-1' : 'top-full mt-1'} absolute z-50 w-full bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg max-h-[50vh] sm:max-h-64 overflow-auto`}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion.id}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${index === highlightedIndex ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                {getSuggestionIcon(suggestion.type)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 line-clamp-1">{suggestion.text}</div>
                  {suggestion.category && (
                    <div className="text-[10px] text-gray-500">{suggestion.category}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {typeof suggestion.confidence === 'number' && (
                  <span className="text-[10px] text-gray-400">{Math.round(suggestion.confidence * 100)}%</span>
                )}
                {getSuggestionBadge(suggestion.type)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AIAutocomplete;
