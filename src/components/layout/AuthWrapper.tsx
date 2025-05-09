
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentProfile } from '@/services/auth';
import { Profile } from '@/types/auth';

export const AuthWrapper = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o usuário está autenticado
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      const currentUser = getCurrentProfile();
      
      setUser(currentUser);
      setIsChecking(false);
      
      if (!isAuth) {
        navigate('/auth');
      }
    };

    checkAuth();
    
    // Adicionar listener para atualizar o estado do usuário quando mudar
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};
