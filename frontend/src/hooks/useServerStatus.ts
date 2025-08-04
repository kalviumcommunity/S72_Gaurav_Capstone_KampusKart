import { useState, useEffect } from 'react';
import { API_BASE } from '../config';

interface ServerStatus {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  checkStatus: () => Promise<void>;
}

export const useServerStatus = (): ServerStatus => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/server-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsReady(true);
        setError(null);
      } else {
        throw new Error('Server not ready');
      }
    } catch (err) {
      setError('Server is starting up...');
      setIsReady(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkStatus();
  }, []);

  return {
    isReady,
    isLoading,
    error,
    checkStatus,
  };
}; 