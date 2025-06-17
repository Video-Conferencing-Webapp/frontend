import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Button } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { Provider } from 'react-redux';
import { SnackbarProvider, closeSnackbar } from 'notistack';

import { store } from './store/store';
import { useAuthState } from './hooks/useAuthState';
import Layout from './components/Layout/Layout';
import LoadingScreen from './components/LoadingScreen/LoadingScreen';
import cacheBuster from './utils/cacheBuster';

// Lazy load pages to reduce initial bundle size
const LoginPage = React.lazy(() => 
  import('./pages/LoginPage/LoginPage').catch(err => {
    console.error('Error loading LoginPage:', err);
    return { default: () => <div>Error loading login page</div> };
  })
);

const RegisterPage = React.lazy(() => 
  import('./pages/RegisterPage/RegisterPage').catch(err => {
    console.error('Error loading RegisterPage:', err);
    return { default: () => <div>Error loading register page</div> };
  })
);

const HomePage = React.lazy(() => 
  import('./pages/HomePage/HomePage').catch(err => {
    console.error('Error loading HomePage:', err);
    return { default: () => <div>Error loading home page</div> };
  })
);

const NotFoundPage = React.lazy(() => 
  import('./pages/NotFoundPage/NotFoundPage').catch(err => {
    console.error('Error loading NotFoundPage:', err);
    return { default: () => <div>Page not found</div> };
  })
);

const ProfilePage = React.lazy(() => 
  import('./pages/ProfilePage/ProfilePage').catch(err => {
    console.error('Error loading ProfilePage:', err);
    return { default: () => <div>Error loading profile page</div> };
  })
);

// MeetSphere theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#06b6d4', // Cyan
      light: '#67e8f9',
      dark: '#0891b2',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
});

function AppContent() {
  const { isAuthenticated, isLoading } = useAuthState();

  // Initialize cache busting on app startup
  useEffect(() => {
    try {
      cacheBuster.initialize();
    } catch (error) {
      console.warn('Cache buster initialization failed:', error);
    }
  }, []);

  if (isLoading) {
    return (
      <LoadingScreen 
        message="Connecting to MeetSphere..."
        submessage="Verifying your authentication"
        variant="full"
        size="medium"
      />
    );
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            isAuthenticated ? (
              <Navigate to="/home" replace />
            ) : (
              <Suspense fallback={
                <LoadingScreen 
                  message="Loading sign in page..."
                  variant="full"
                  size="medium"
                />
              }>
                <LoginPage />
              </Suspense>
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            isAuthenticated ? (
              <Navigate to="/home" replace />
            ) : (
              <Suspense fallback={
                <LoadingScreen 
                  message="Loading registration page..."
                  variant="full"
                  size="medium"
                />
              }>
                <RegisterPage />
              </Suspense>
            )
          } 
        />
        <Route 
          path="/home" 
          element={
            isAuthenticated ? (
              <Layout>
                <Suspense fallback={
                  <LoadingScreen 
                    message="Loading your dashboard..."
                    submessage="Preparing your meetings and connections"
                    variant="inline"
                    size="medium"
                  />
                }>
                  <HomePage />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/profile" 
          element={
            isAuthenticated ? (
              <Layout>
                <Suspense fallback={
                  <LoadingScreen 
                    message="Loading your profile..."
                    submessage="Preparing your account settings"
                    variant="inline"
                    size="medium"
                  />
                }>
                  <ProfilePage />
                </Suspense>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        <Route 
          path="/" 
          element={
            <Navigate to={isAuthenticated ? "/home" : "/login"} replace />
          } 
        />
        {/* 404 Route - Must be last */}
        <Route 
          path="*" 
          element={
            <Suspense fallback={
              <LoadingScreen 
                message="Loading page..."
                variant="full"
                size="medium"
              />
            }>
              <NotFoundPage />
            </Suspense>
          }
        />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider 
          maxSnack={3}
          autoHideDuration={3000}
          preventDuplicate
          dense
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          action={(snackbarId) => (
            <Button 
              color="inherit" 
              size="small"
              onClick={() => closeSnackbar(snackbarId)}
              sx={{ 
                minWidth: 'auto',
                padding: '4px 8px',
                fontSize: '1.2rem',
                lineHeight: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              ✕
            </Button>
          )}
        >
          <AppContent />
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
