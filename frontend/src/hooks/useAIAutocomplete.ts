import { useState, useEffect, useCallback, useRef } from 'react';
import { aiService, AutocompleteSuggestion, SearchContext } from '../services/aiService';

interface UseAIAutocompleteProps {
  context: SearchContext;
  debounceMs?: number;
  preExistingStrings?: string[];
}

interface UseAIAutocompleteReturn {
  suggestions: AutocompleteSuggestion[];
  isLoading: boolean;
  error: string | null;
  handleInputChange: (value: string) => void;
  handleSuggestionSelect: (suggestion: AutocompleteSuggestion) => void;
  clearSuggestions: () => void;
}

export const useAIAutocomplete = ({ 
  context, 
  debounceMs = 300,
  preExistingStrings = []
}: UseAIAutocompleteProps): UseAIAutocompleteReturn => {
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const debouncedFetchSuggestions = useCallback(
    async (input: string) => {
      if (input.trim().length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);

      try {
        const newSuggestions = await aiService.getSuggestions(input, context, preExistingStrings);
        if (!abortControllerRef.current.signal.aborted) {
          setSuggestions(newSuggestions);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        console.error('Error fetching AI suggestions:', err);
        setError('Failed to load suggestions');
      } finally {
        if (!abortControllerRef.current?.signal.aborted) {
          setIsLoading(false);
        }
      }
    },
    [context, preExistingStrings]
  );

  const handleInputChange = useCallback(
    (value: string) => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(() => {
        debouncedFetchSuggestions(value);
      }, debounceMs);
    },
    [debounceMs, debouncedFetchSuggestions]
  );

  const handleSuggestionSelect = useCallback(
    (suggestion: AutocompleteSuggestion) => {
      aiService.recordSearch(suggestion.text, context);
      setSuggestions([]);
      setIsLoading(false);
      setError(null);
    },
    [context]
  );

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setIsLoading(false);
    setError(null);
    if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
    if (abortControllerRef.current) abortControllerRef.current.abort();
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    handleInputChange,
    handleSuggestionSelect,
    clearSuggestions
  };
};
