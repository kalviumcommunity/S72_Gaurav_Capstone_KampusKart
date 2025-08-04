import { useState, useCallback, useEffect } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  steps: Array<{ text: string; completed: boolean }>;
  progress: number;
}

interface UseLoadingOptions {
  initialSteps?: string[];
  autoComplete?: boolean;
  timeout?: number;
}

export const useLoading = (options: UseLoadingOptions = {}) => {
  const { initialSteps = [], autoComplete = false, timeout } = options;
  
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    steps: initialSteps.map(text => ({ text, completed: false })),
    progress: 0
  });

  const startLoading = useCallback((title?: string) => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      progress: 0,
      steps: prev.steps.map(step => ({ ...step, completed: false }))
    }));
  }, []);

  const stopLoading = useCallback(() => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      progress: 100
    }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({
      ...prev,
      isLoading: false,
      error,
      progress: 0
    }));
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setState(prev => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress))
    }));
  }, []);

  const completeStep = useCallback((stepIndex: number) => {
    setState(prev => ({
      ...prev,
      steps: prev.steps.map((step, index) => 
        index === stepIndex ? { ...step, completed: true } : step
      )
    }));
  }, []);

  const setSteps = useCallback((steps: string[]) => {
    setState(prev => ({
      ...prev,
      steps: steps.map(text => ({ text, completed: false }))
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      steps: initialSteps.map(text => ({ text, completed: false })),
      progress: 0
    });
  }, [initialSteps]);

  // Auto-complete functionality
  useEffect(() => {
    if (autoComplete && state.isLoading && state.progress < 100) {
      const interval = setInterval(() => {
        setState(prev => ({
          ...prev,
          progress: Math.min(100, prev.progress + 10)
        }));
      }, 200);

      return () => clearInterval(interval);
    }
  }, [autoComplete, state.isLoading, state.progress]);

  // Timeout functionality
  useEffect(() => {
    if (timeout && state.isLoading) {
      const timer = setTimeout(() => {
        setError('Request timed out. Please try again.');
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [timeout, state.isLoading, setError]);

  return {
    ...state,
    startLoading,
    stopLoading,
    setError,
    updateProgress,
    completeStep,
    setSteps,
    reset
  };
};

// Predefined loading configurations for common scenarios
export const usePageLoading = () => {
  return useLoading({
    initialSteps: [
      'Initializing page...',
      'Loading content...',
      'Setting up features...',
      'Ready!'
    ],
    autoComplete: true,
    timeout: 10000
  });
};

export const useDataLoading = () => {
  return useLoading({
    initialSteps: [
      'Connecting to server...',
      'Fetching data...',
      'Processing information...',
      'Data loaded!'
    ],
    timeout: 15000
  });
};

export const useFormLoading = () => {
  return useLoading({
    initialSteps: [
      'Validating form...',
      'Submitting data...',
      'Processing request...',
      'Success!'
    ],
    timeout: 8000
  });
};

export const useImageLoading = () => {
  return useLoading({
    initialSteps: [
      'Loading images...',
      'Optimizing content...',
      'Preparing display...',
      'Images ready!'
    ],
    autoComplete: true,
    timeout: 5000
  });
}; 