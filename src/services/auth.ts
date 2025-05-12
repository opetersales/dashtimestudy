
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';
import { saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage } from './localStorage';

// Função para fazer login
export const loginUser = async (email: string, password: string): Promise<Profile | null> => {
  try {
    // Autenticar com email e senha
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (authError) {
      console.error('Erro ao fazer login:', authError);
      throw authError;
    }
    
    if (authData.user) {
      // Buscar o perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle(); // Alterado de .single() para .maybeSingle()
      
      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        throw profileError;
      }
      
      if (profile) {
        // Salva o usuário no localStorage
        saveToLocalStorage('currentUser', profile);
        return profile;
      } else {
        // Caso o perfil não seja encontrado, vamos criar um com os dados disponíveis
        const newProfile: Profile = {
          id: authData.user.id,
          name: authData.user.user_metadata.name || email.split('@')[0],
          email: authData.user.email || email
        };
        
        // Salva o usuário no localStorage
        saveToLocalStorage('currentUser', newProfile);
        return newProfile;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

// Função para cadastrar novo usuário
export const registerUser = async (name: string, email: string, password: string): Promise<Profile | null> => {
  try {
    // Criar conta com autenticação
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        }
      }
    });
    
    if (authError) {
      console.error('Erro ao cadastrar usuário:', authError);
      throw authError;
    }
    
    if (authData.user) {
      // O perfil será criado automaticamente pelo trigger no Supabase
      // Mas vamos buscar para confirmar que foi criado
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      if (profileError) {
        // Pode haver um pequeno atraso na criação do perfil pelo trigger
        // Vamos criar um objeto de perfil com os dados disponíveis
        const newProfile: Profile = {
          id: authData.user.id,
          name,
          email
        };
        
        // Salva o usuário no localStorage
        saveToLocalStorage('currentUser', newProfile);
        return newProfile;
      }
      
      if (profile) {
        // Salva o usuário no localStorage
        saveToLocalStorage('currentUser', profile);
        return profile;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    throw error;
  }
};

// Função para fazer logout
export const logoutUser = async (): Promise<void> => {
  await supabase.auth.signOut();
  removeFromLocalStorage('currentUser');
};

// Função para obter o usuário atual
export const getCurrentProfile = (): Profile | null => {
  return loadFromLocalStorage<Profile>('currentUser', null);
};

// Função para verificar se o usuário está logado
export const isAuthenticated = (): boolean => {
  const user = getCurrentProfile();
  return !!user;
};
