import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AuthCallback from './pages/AuthCallback';
import BrandPortal from './pages/BrandPortal';

// Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import CandidaturasPage from './pages/admin/CandidaturasPage';
import MarcasPage from './pages/admin/MarcasPage';
import LogisticaPage from './pages/admin/LogisticaPage';
import ComunicacaoPage from './pages/admin/ComunicacaoPage';
import SustentabilidadePage from './pages/admin/SustentabilidadePage';
import SocialMediaPage from './pages/admin/SocialMediaPage';
import PatrocinadoresPage from './pages/admin/PatrocinadoresPage';

import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If user data is passed from AuthCallback via state, skip loading check
  if (location.state?.user) {
    const userData = location.state.user;
    if (adminOnly && userData.role !== 'admin') {
      return <Navigate to="/portal" replace />;
    }
    return children;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8C3B20]"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/portal" replace />;
  }

  return children;
};

// Public Route - redirects to portal/admin if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Don't redirect if processing OAuth callback
  if (window.location.hash?.includes('session_id=')) {
    return children;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8C3B20]"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/portal'} replace />;
  }

  return children;
};

// App Router Component
const AppRouter = () => {
  const location = useLocation();

  // Check URL fragment for session_id - handle OAuth callback
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route path="/auth/callback" element={<AuthCallback />} />

      {/* Brand Portal */}
      <Route 
        path="/portal" 
        element={
          <ProtectedRoute>
            <BrandPortal />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute adminOnly>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/candidaturas" 
        element={
          <ProtectedRoute adminOnly>
            <CandidaturasPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/marcas" 
        element={
          <ProtectedRoute adminOnly>
            <MarcasPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/logistica" 
        element={
          <ProtectedRoute adminOnly>
            <LogisticaPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/comunicacao" 
        element={
          <ProtectedRoute adminOnly>
            <ComunicacaoPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/sustentabilidade" 
        element={
          <ProtectedRoute adminOnly>
            <SustentabilidadePage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/socialmedia" 
        element={
          <ProtectedRoute adminOnly>
            <SocialMediaPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/patrocinadores" 
        element={
          <ProtectedRoute adminOnly>
            <PatrocinadoresPage />
          </ProtectedRoute>
        } 
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
