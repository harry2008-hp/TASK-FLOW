import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { initializeAuth, fetchUserProfile } from './redux/authSlice';
import { syncTheme } from './redux/uiSlice';

// Import pages and layouts
import LandingPage from './pages/LandingPage';
import AuthPages from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import AdminPanel from './pages/AdminPanel';
import SidebarLayout from './layouts/SidebarLayout';

// Simple Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token } = useSelector(state => state.auth);
  
  if (!isAuthenticated && !token && !sessionStorage.getItem('tf_token') && !localStorage.getItem('tf_token')) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Protected Route wrapper
const AdminRoute = ({ children }) => {
  const { user } = useSelector(state => state.auth);
  
  if (!user || user.role !== 'Admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // 1. Initialize authentication from storage
    dispatch(initializeAuth());
    
    // 2. Fetch full profile to verify token validity
    dispatch(fetchUserProfile());
    
    // 3. Sync initial theme
    dispatch(syncTheme());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPages defaultTab="login" />} />
        <Route path="/register" element={<AuthPages defaultTab="register" />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <SidebarLayout>
              <Dashboard />
            </SidebarLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/tasks" element={
          <ProtectedRoute>
            <SidebarLayout>
              <KanbanBoard />
            </SidebarLayout>
          </ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminRoute>
              <SidebarLayout>
                <AdminPanel />
              </SidebarLayout>
            </AdminRoute>
          </ProtectedRoute>
        } />

        {/* Redirect Fallbacks */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
