
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
      return null;
    }
    
    if (authData.user) {
      // Buscar o perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
      
      if (profileError) {
        console.error('Erro ao buscar perfil:', profileError);
        return null;
      }
      
      if (profile) {
        // Salva o usuário no localStorage
        saveToLocalStorage('currentUser', profile);
        return profile;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return null;
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
      return null;
    }
    
    if (authData.user) {
      // Verificar se o usuário já existe
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();
      
      if (existingUser) {
        return existingUser; // Usuário já existe
      }
      
      // Inserir novo usuário
      const { data, error } = await supabase
        .from('profiles')
        .insert([{ 
          id: authData.user.id,
          name, 
          email 
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao cadastrar usuário:', error);
        return null;
      }
      
      if (data) {
        // Salva o usuário no localStorage
        saveToLocalStorage('currentUser', data);
        return data;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    return null;
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
