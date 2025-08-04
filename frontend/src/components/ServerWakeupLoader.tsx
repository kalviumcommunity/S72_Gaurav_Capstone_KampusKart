import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

interface ServerWakeupLoaderProps {
  onServerReady: () => void;
  onError: (error: string) => void;
}

const ServerWakeupLoader: React.FC<ServerWakeupLoaderProps> = ({ onServerReady, onError }) => {
  const [status, setStatus] = useState('checking');
  const [retryCount, setRetryCount] = useState(0);
  const [message, setMessage] = useState('Checking server status...');

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        setStatus('checking');
        setMessage('Checking server status...');
        
        const response = await fetch(`${API_BASE}/api/server-status`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          setStatus('ready');
          setMessage('Server is ready!');
          setTimeout(() => {
            onServerReady();
          }, 500);
        } else {
          throw new Error('Server not ready');
        }
      } catch (error) {
        console.log('Server check failed, retrying...', error);
        setRetryCount(prev => prev + 1);
        
        if (retryCount >= 10) {
          setStatus('error');
          setMessage('Unable to connect to server. Please try again.');
          onError('Server connection timeout');
          return;
        }

        // Exponential backoff: 1s, 2s, 4s, 8s, etc.
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        setMessage(`Server is starting up... (Attempt ${retryCount + 1}/10)`);
        
        setTimeout(() => {
          checkServerStatus();
        }, delay);
      }
    };

    checkServerStatus();
  }, [retryCount, onServerReady, onError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <img src="/Logo.png" alt="KampusKart Logo" className="h-16 w-16 object-contain" />
            <span className="text-2xl font-extrabold text-gray-900">KampusKart</span>
          </div>

          {/* Loading Animation */}
          <div className="mb-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {status === 'checking' && 'Waking up server...'}
              {status === 'ready' && 'Server is ready!'}
              {status === 'error' && 'Connection failed'}
            </h3>
            <p className="text-gray-600 text-sm">{message}</p>
          </div>

          {/* Progress Indicator */}
          {status === 'checking' && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((retryCount / 10) * 100, 90)}%` }}
              ></div>
            </div>
          )}

          {/* Tips */}
          <div className="text-xs text-gray-500 space-y-1">
            <p>💡 This usually takes 10-30 seconds</p>
            <p>💡 The server sleeps after 15 minutes of inactivity</p>
            <p>💡 Your data is safe and secure</p>
          </div>

          {/* Retry Button for Error State */}
          {status === 'error' && (
            <button
              onClick={() => {
                setRetryCount(0);
                setStatus('checking');
                setMessage('Checking server status...');
              }}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServerWakeupLoader; 