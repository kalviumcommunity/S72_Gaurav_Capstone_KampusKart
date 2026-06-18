import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Global error handlers
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  // Prevent default browser behavior
  event.preventDefault();
  // TODO: Send to error tracking service in production
});

window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // TODO: Send to error tracking service in production
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

<RecommendedEvents />
