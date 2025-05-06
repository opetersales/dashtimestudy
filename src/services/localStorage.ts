
/**
 * Service for handling localStorage operations
 */

// Current user management
export const getCurrentUser = () => {
  return loadFromLocalStorage('currentUser', null);
};

export const setCurrentUser = (user: any) => {
  saveToLocalStorage('currentUser', user);
};

// Generic function to save data to localStorage
export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error(`Error saving data to localStorage (${key}):`, error);
  }
};

// Generic function to load data from localStorage
export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error(`Error loading data from localStorage (${key}):`, error);
    return defaultValue;
  }
};

// Function to remove data from localStorage
export const removeFromLocalStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data from localStorage (${key}):`, error);
  }
};

// Helper function to get user-specific data
export const getUserData = <T>(key: string, defaultValue: T): T => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.id) {
    return defaultValue;
  }
  
  const userKey = `${currentUser.id}_${key}`;
  return loadFromLocalStorage<T>(userKey, defaultValue);
};

// Helper function to save user-specific data
export const saveUserData = <T>(key: string, data: T): void => {
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.id) {
    console.warn('Attempting to save user data without a logged in user');
    return;
  }
  
  const userKey = `${currentUser.id}_${key}`;
  saveToLocalStorage<T>(userKey, data);
};
