import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Spinner } from '@phosphor-icons/react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Use useRef to prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processCallback = async () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.replace('#', ''));
      const sessionId = params.get('session_id');

      if (sessionId) {
        try {
          const userData = await handleOAuthCallback(sessionId);
          // Clear the hash from URL
          window.history.replaceState(null, '', window.location.pathname);
          // Navigate based on role
          navigate(userData.role === 'admin' ? '/admin' : '/portal', { 
            replace: true,
            state: { user: userData }
          });
        } catch (error) {
          console.error('OAuth callback error:', error);
          navigate('/login', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    };

    processCallback();
  }, [handleOAuthCallback, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAF7]" data-testid="auth-callback">
      <div className="text-center">
        <Spinner size={48} className="animate-spin text-[#8C3B20] mx-auto mb-4" />
        <p className="text-[#66665E] font-['IBM_Plex_Sans']">A autenticar...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
