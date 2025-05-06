
import React from 'react';
import { Button } from '@/components/ui/button';
import { Sun, Moon, Menu } from 'lucide-react';
import { UserProfile } from '@/components/user/UserProfile';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleTheme: () => void;
  isDarkTheme: boolean;
}

export function Header({ sidebarCollapsed, onToggleTheme, isDarkTheme }: HeaderProps) {
  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" className="mr-2 lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onToggleTheme} title={isDarkTheme ? "Mudar para modo claro" : "Mudar para modo escuro"} className="tooltip-hover">
          {isDarkTheme ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <UserProfile />
      </div>
    </header>
  );
}
