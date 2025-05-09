
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';
import { saveToLocalStorage, loadFromLocalStorage, removeFromLocalStorage } from './localStorage';

// Função para fazer login
export const loginUser = async (email: string): Promise<Profile | null> => {
  try {
    // Verificar se o usuário já existe
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }

    if (profiles) {
      // Salva o usuário no localStorage
      saveToLocalStorage('currentUser', profiles);
      return profiles;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return null;
  }
};

// Função para cadastrar novo usuário
export const registerUser = async (name: string, email: string): Promise<Profile | null> => {
  try {
    // Verificar se o usuário já existe
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return null; // Usuário já existe
    }

    // Inserir novo usuário
    const { data, error } = await supabase
      .from('profiles')
      .insert([{ name, email }])
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
    
    return null;
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    return null;
  }
};

// Função para fazer logout
export const logoutUser = (): void => {
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
