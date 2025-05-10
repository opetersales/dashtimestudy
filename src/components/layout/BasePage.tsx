
import React, { useEffect, useState } from 'react';
import Header from './Header';  // Changed from import { Header } from './Header'
import { Sidebar } from './Sidebar';
import { Breadcrumbs } from './Breadcrumbs';
import { cn } from '@/lib/utils';
import { loadFromLocalStorage, saveToLocalStorage } from '@/services/localStorage';
import { CustomWatermark } from './CustomWatermark';

interface BasePageProps {
  title: string;
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
}

export const BasePage = ({ title, children, showBreadcrumbs = true }: BasePageProps) => {
  // Load sidebar state from localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return loadFromLocalStorage('sidebarCollapsed', false);
  });
  
  // Load theme preference from localStorage
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return loadFromLocalStorage('darkTheme', false);
  });
  
  // Handle sidebar toggle
  const handleToggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    saveToLocalStorage('sidebarCollapsed', newState);
  };
  
  // Handle theme toggle
  const handleToggleTheme = () => {
    const newTheme = !isDarkTheme;
    setIsDarkTheme(newTheme);
    saveToLocalStorage('darkTheme', newTheme);
    
    // Apply theme to document
    if (newTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Update document title
  useEffect(() => {
    document.title = `${title} | Estudos de Tempo`;
  }, [title]);
  
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleToggleSidebar} />
      
      <div 
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarCollapsed ? "ml-16" : "ml-64",
          "md:ml-0" // On mobile, don't add margin
        )}
      >
        <Header 
          sidebarCollapsed={sidebarCollapsed} 
          onToggleTheme={handleToggleTheme} 
          isDarkTheme={isDarkTheme} 
        />
        
        <main className="container px-4 py-6 max-w-7xl mx-auto">
          {showBreadcrumbs && <Breadcrumbs className="mb-6" />}
          {children}
        </main>
        
        <CustomWatermark />
      </div>
    </div>
  );
};
