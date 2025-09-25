import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import './i18n/i18n';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OfflineProvider } from './contexts/OfflineContext';
import Register from './pages/Register';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import FamilySurveyForm from './pages/forms/FamilySurveyForm';
import PregnancyReportForm from './pages/forms/PregnancyReportForm';
import LeprosyReportForm from './pages/forms/LeprosyReportForm';
import ChildVaccinationForm from './pages/forms/ChildVaccinationForm';
import PostnatalCareForm from './pages/forms/PostnatalCareForm';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Alerts from './pages/Alerts';
import './App.css';

// Material-UI theme configuration
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#ff4081',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

// Public Route Component (redirects if authenticated)
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? children : <Navigate to="/" />;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Register service worker for PWA functionality
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Initialize the app
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <h2 className="mt-4 text-xl font-semibold text-gray-800">AASHAKIRANA</h2>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <OfflineProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Public Routes */}
                <Route 
                  path="/register" 
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  } 
                />
                <Route 
                  path="/login" 
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } 
                />

                {/* Protected Routes */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Landing />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/forms/family-survey" 
                  element={
                    <ProtectedRoute>
                      <FamilySurveyForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/forms/pregnancy-report" 
                  element={
                    <ProtectedRoute>
                      <PregnancyReportForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/forms/leprosy-report" 
                  element={
                    <ProtectedRoute>
                      <LeprosyReportForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/forms/child-vaccination" 
                  element={
                    <ProtectedRoute>
                      <ChildVaccinationForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/forms/postnatal-care" 
                  element={
                    <ProtectedRoute>
                      <PostnatalCareForm />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/alerts" 
                  element={
                    <ProtectedRoute>
                      <Alerts />
                    </ProtectedRoute>
                  } 
                />

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </Router>
        </OfflineProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;