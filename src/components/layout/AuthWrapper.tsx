
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentProfile } from '@/services/auth';
import { Profile } from '@/types/auth';
import { Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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
    
    // Configurar listener para mudanças de autenticação do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/auth');
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          checkAuth();
        }
      }
    );

    const timer = setTimeout(() => {
      checkAuth();
    }, 500); // Pequeno delay para mostrar a animação de carregamento
    
    // Adicionar listener para atualizar o estado do usuário quando mudar
    window.addEventListener('storage', checkAuth);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('storage', checkAuth);
      subscription.unsubscribe();
    };
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <div className="flex justify-center items-center mb-4">
            <Loader size={40} className="text-primary animate-spin" />
          </div>
          <h2 className="text-xl font-medium text-gray-800">Carregando...</h2>
          <p className="text-sm text-gray-500 mt-1">Verificando suas credenciais</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <Outlet />;
};
