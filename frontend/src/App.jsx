import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Layout from './components/Layout';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import CampaignsList from './pages/CampaignsList';
import CampaignDetail from './pages/CampaignDetail';
import AccountsList from './pages/AccountsList';
import LeadsList from './pages/LeadsList';
import MessagesList from './pages/MessagesList';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Engagement from './pages/Engagement';

// Auth context
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

// Auth checker for homepage
const HomeRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Home Page */}
      <Route
        path="/"
        element={
          <HomeRoute>
            <>
              <Navbar />
              <Home />
            </>
          </HomeRoute>
        }
      />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/campaigns"
        element={
          <ProtectedRoute>
            <Layout>
              <CampaignsList />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/campaigns/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <CampaignDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/accounts"
        element={
          <ProtectedRoute>
            <Layout>
              <AccountsList />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/leads"
        element={
          <ProtectedRoute>
            <Layout>
              <LeadsList />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <Layout>
              <MessagesList />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/engagement"
        element={
          <ProtectedRoute>
            <Layout>
              <Engagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App; 