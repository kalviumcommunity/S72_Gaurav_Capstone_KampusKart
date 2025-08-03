import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/Login';
import Signup from './components/Signup';
import Header from './components/Header';
import Landing from './components/Landing';
import ForgotPassword from './components/ForgotPassword';
import Home from './components/Home';
import LostFound from './components/LostFound';
import Profile from './components/Profile';
import Complaints from './components/Complaints';
import CampusMap from './components/CampusMap';
import AuthenticatedLayout from './components/AuthenticatedLayout';
import Features from './components/Features';
import Events from './components/Events';
import News from './components/News';
import Facilities from './components/Facilities';
import ChatWindow from './components/Chat/ChatWindow';
import ClubsRecruitment from './components/ClubsRecruitment';

// Protected Route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
};

// Google Callback component
const GoogleCallback: React.FC = () => {
  const { handleGoogleCallback } = useAuth();
  const location = useLocation();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      handleGoogleCallback(token);
    }
  }, [location, handleGoogleCallback]);

  return <Navigate to="/home" />;
};

// Add this component for root redirect
const RootRedirect: React.FC = () => {
  const { token } = useAuth();
  if (token) {
    return <Navigate to="/home" />;
  }
  return <Landing />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Home />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <ChatWindow />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lostfound"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <LostFound />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/complaints"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Complaints />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/features"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Features />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/campus-map"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <CampusMap />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Profile />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile/:userId"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Profile />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Events />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/news"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <News />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/facilities"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <Facilities />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/clubs-recruitment"
            element={
              <ProtectedRoute>
                <AuthenticatedLayout>
                  <ClubsRecruitment />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
    </ErrorBoundary>
  );
};

export default App; 