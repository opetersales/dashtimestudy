
import React, { useEffect, useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Breadcrumbs } from './Breadcrumbs';
import { cn } from '@/lib/utils';

interface BasePageProps {
  title: string;
  children: React.ReactNode;
  showBreadcrumbs?: boolean;
}

export const BasePage = ({ title, children, showBreadcrumbs = true }: BasePageProps) => {
  // Load sidebar state from localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const storedState = localStorage.getItem('sidebarCollapsed');
    return storedState ? JSON.parse(storedState) : false;
  });
  
  // Handle sidebar toggle
  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
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
        <Header title={title} />
        
        <main className="container px-4 py-6 max-w-7xl mx-auto">
          {showBreadcrumbs && <Breadcrumbs className="mb-6" />}
          {children}
        </main>
      </div>
    </div>
  );
};
