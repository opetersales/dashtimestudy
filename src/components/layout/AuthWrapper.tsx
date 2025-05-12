
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { isAuthenticated, getCurrentProfile } from '@/services/auth';
import { Profile } from '@/types/auth';
import { Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { saveToLocalStorage } from '@/services/localStorage';
import { useToast } from '@/components/ui/use-toast';

export const AuthWrapper = () => {
  const [user, setUser] = useState<Profile | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar a sessão atual do Supabase
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (data.session) {
        // Temos uma sessão válida, buscar o perfil
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .maybeSingle(); // Alterado de .single() para .maybeSingle()
        
        if (profileData && !error) {
          saveToLocalStorage('currentUser', profileData);
          setUser(profileData);
        } else {
          // Criar um perfil básico baseado nos dados do usuário
          const basicProfile: Profile = {
            id: data.session.user.id,
            name: data.session.user.user_metadata.name || data.session.user.email?.split('@')[0] || 'Usuário',
            email: data.session.user.email || ''
          };
          
          saveToLocalStorage('currentUser', basicProfile);
          setUser(basicProfile);
          
          // Tentar inserir o perfil no banco de dados
          const { error: insertError } = await supabase
            .from('profiles')
            .insert(basicProfile);
          
          if (insertError) {
            console.error('Erro ao criar perfil:', insertError);
            toast({
              title: "Aviso",
              description: "Seu perfil foi criado localmente, mas não foi possível salvá-lo no servidor.",
              variant: "destructive"
            });
          }
        }
      } else {
        setUser(null);
      }
      
      setIsChecking(false);
    };
    
    // Configurar listener para mudanças de autenticação do Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_OUT') {
          setUser(null);
          navigate('/auth');
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session) {
            // Buscar o perfil do usuário quando ele fizer login
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .maybeSingle(); // Alterado de .single() para .maybeSingle()
            
            if (profileData && !error) {
              saveToLocalStorage('currentUser', profileData);
              setUser(profileData);
            } else {
              // Criar um perfil básico baseado nos dados do usuário
              const basicProfile: Profile = {
                id: session.user.id,
                name: session.user.user_metadata.name || session.user.email?.split('@')[0] || 'Usuário',
                email: session.user.email || ''
              };
              
              saveToLocalStorage('currentUser', basicProfile);
              setUser(basicProfile);
              
              // Tentar inserir o perfil no banco de dados
              const { error: insertError } = await supabase
                .from('profiles')
                .insert(basicProfile);
              
              if (insertError) {
                console.error('Erro ao criar perfil:', insertError);
                toast({
                  title: "Aviso",
                  description: "Seu perfil foi criado localmente, mas não foi possível salvá-lo no servidor.",
                  variant: "destructive"
                });
              }
            }
          }
        }
      }
    );

    // Verificar sessão inicial
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

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
