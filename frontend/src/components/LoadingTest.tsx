import React, { useState } from 'react';
import UniversalLoader from './UniversalLoader';
import { usePageLoading, useDataLoading, useFormLoading, useImageLoading } from '../hooks/useLoading';
import { themeConfig } from '../theme/themeConfig';

const LoadingTest: React.FC = () => {
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState(false);
  const [loaderConfig, setLoaderConfig] = useState({
    variant: 'page' as const,
    title: 'Loading...',
    subtitle: 'Please wait...',
    showLogo: true,
    showSteps: false,
    size: 'medium' as const,
    error: null as string | null
  });

  const pageLoading = usePageLoading();
  const dataLoading = useDataLoading();
  const formLoading = useFormLoading();
  const imageLoading = useImageLoading();

  const runTest = (testType: string, config: any) => {
    setActiveTest(testType);
    setLoaderConfig(config);
    setShowLoader(true);
    
    // Simulate loading
    setTimeout(() => {
      setShowLoader(false);
      setActiveTest(null);
    }, 3000);
  };

  const runErrorTest = () => {
    setActiveTest('error');
    setLoaderConfig({
      ...loaderConfig,
      error: 'Failed to load content. Please check your connection and try again.'
    });
    setShowLoader(true);
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Loading System Test</h1>
      
      {/* Test Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <button
          onClick={() => runTest('page', {
            variant: 'page',
            title: 'Loading Home Page',
            subtitle: 'Preparing your campus dashboard...',
            showLogo: true,
            showSteps: true,
            size: 'large'
          })}
          className="p-4 text-white rounded-lg mobile-touch-friendly mobile-no-hover mobile-active-feedback"
          style={{ backgroundColor: themeConfig.colors.info }}
        >
          Test Page Loading
        </button>

        <button
          onClick={() => runTest('data', {
            variant: 'page',
            title: 'Loading Data',
            subtitle: 'Fetching information from server...',
            showLogo: true,
            showSteps: true,
            size: 'medium'
          })}
          className="p-4 text-white rounded-lg mobile-touch-friendly mobile-no-hover mobile-active-feedback"
          style={{ backgroundColor: themeConfig.colors.success }}
        >
          Test Data Loading
        </button>

        <button
          onClick={() => runTest('form', {
            variant: 'component',
            title: 'Submitting Form',
            subtitle: 'Processing your request...',
            showLogo: false,
            showSteps: true,
            size: 'small'
          })}
          className="p-4 text-white rounded-lg mobile-touch-friendly mobile-no-hover mobile-active-feedback"
          style={{ backgroundColor: themeConfig.colors.accent }}
        >
          Test Form Loading
        </button>

        <button
          onClick={() => runTest('overlay', {
            variant: 'overlay',
            title: 'Loading Images',
            subtitle: 'Optimizing content for display...',
            showLogo: true,
            showSteps: false,
            size: 'medium'
          })}
          className="p-4 text-white rounded-lg mobile-touch-friendly mobile-no-hover mobile-active-feedback"
          style={{ backgroundColor: themeConfig.colors.warning }}
        >
          Test Overlay Loading
        </button>

        <button
          onClick={() => runTest('component', {
            variant: 'component',
            title: 'Loading Component',
            subtitle: 'Initializing features...',
            showLogo: false,
            showSteps: false,
            size: 'small'
          })}
          className="p-4 text-white rounded-lg mobile-touch-friendly mobile-no-hover mobile-active-feedback"
          style={{ backgroundColor: themeConfig.colors.primary }}
        >
          Test Component Loading
        </button>

        <button
          onClick={runErrorTest}
          className="p-4 text-white rounded-lg mobile-touch-friendly mobile-no-hover mobile-active-feedback"
          style={{ backgroundColor: themeConfig.colors.error }}
        >
          Test Error State
        </button>
      </div>

      {/* Hook Tests */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-bold mb-4">Hook Tests</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
                         <button
               onClick={() => pageLoading.startLoading()}
               className="w-full p-2 rounded mobile-touch-friendly mobile-no-hover mobile-active-feedback"
               style={{ 
                 backgroundColor: themeConfig.colors.info + '20',
                 color: themeConfig.colors.info 
               }}
             >
               Start Page Loading
             </button>
             <button
               onClick={() => pageLoading.stopLoading()}
               className="w-full p-2 rounded mobile-touch-friendly mobile-no-hover mobile-active-feedback"
               style={{ 
                 backgroundColor: themeConfig.colors.gray[100],
                 color: themeConfig.colors.gray[800] 
               }}
             >
               Stop Page Loading
             </button>
             <button
               onClick={() => pageLoading.setError('Page failed to load')}
               className="w-full p-2 rounded mobile-touch-friendly mobile-no-hover mobile-active-feedback"
               style={{ 
                 backgroundColor: themeConfig.colors.error + '20',
                 color: themeConfig.colors.error 
               }}
             >
               Simulate Page Error
             </button>
          </div>

                     <div className="space-y-2">
             <button
               onClick={() => dataLoading.startLoading()}
               className="w-full p-2 rounded mobile-touch-friendly mobile-no-hover mobile-active-feedback"
               style={{ 
                 backgroundColor: themeConfig.colors.success + '20',
                 color: themeConfig.colors.success 
               }}
             >
               Start Data Loading
             </button>
             <button
               onClick={() => dataLoading.stopLoading()}
               className="w-full p-2 rounded mobile-touch-friendly mobile-no-hover mobile-active-feedback"
               style={{ 
                 backgroundColor: themeConfig.colors.gray[100],
                 color: themeConfig.colors.gray[800] 
               }}
             >
               Stop Data Loading
             </button>
             <button
               onClick={() => dataLoading.setError('Data fetch failed')}
               className="w-full p-2 rounded mobile-touch-friendly mobile-no-hover mobile-active-feedback"
               style={{ 
                 backgroundColor: themeConfig.colors.error + '20',
                 color: themeConfig.colors.error 
               }}
             >
               Simulate Data Error
             </button>
           </div>
        </div>
      </div>

      {/* Hook Status Display */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-bold mb-4">Hook Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-semibold">Page Loading:</h3>
            <p>Loading: {pageLoading.isLoading ? 'Yes' : 'No'}</p>
            <p>Error: {pageLoading.error || 'None'}</p>
            <p>Progress: {pageLoading.progress}%</p>
          </div>
          <div>
            <h3 className="font-semibold">Data Loading:</h3>
            <p>Loading: {dataLoading.isLoading ? 'Yes' : 'No'}</p>
            <p>Error: {dataLoading.error || 'None'}</p>
            <p>Progress: {dataLoading.progress}%</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h2 className="text-lg font-bold mb-2">Test Instructions:</h2>
        <ul className="text-sm space-y-1">
          <li>• <strong>Page Loading:</strong> Full-screen loading with logo and steps</li>
          <li>• <strong>Data Loading:</strong> Server data fetching simulation</li>
          <li>• <strong>Form Loading:</strong> Form submission processing</li>
          <li>• <strong>Overlay Loading:</strong> Overlay loading for components</li>
          <li>• <strong>Component Loading:</strong> Small component loading</li>
          <li>• <strong>Error State:</strong> Error handling with retry</li>
          <li>• <strong>Hook Tests:</strong> Test individual loading hooks</li>
        </ul>
      </div>

      {/* Universal Loader Display */}
      {showLoader && (
        <div className="fixed inset-0 z-50">
          <UniversalLoader
            variant={loaderConfig.variant}
            title={loaderConfig.title}
            subtitle={loaderConfig.subtitle}
            showLogo={loaderConfig.showLogo}
            showSteps={loaderConfig.showSteps}
            error={loaderConfig.error}
            onRetry={() => {
              setShowLoader(false);
              setActiveTest(null);
            }}
            size={loaderConfig.size}
          />
        </div>
      )}

      {/* Hook Loader Display */}
      {(pageLoading.isLoading || dataLoading.isLoading) && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-center justify-center">
          <UniversalLoader
            variant="overlay"
            title={pageLoading.isLoading ? "Page Loading" : "Data Loading"}
            subtitle={pageLoading.isLoading ? "Preparing page..." : "Fetching data..."}
            showSteps={true}
            steps={pageLoading.isLoading ? pageLoading.steps : dataLoading.steps}
            error={pageLoading.error || dataLoading.error}
            onRetry={() => {
              pageLoading.reset();
              dataLoading.reset();
            }}
            size="medium"
          />
        </div>
      )}
    </div>
  );
};

export default LoadingTest; 