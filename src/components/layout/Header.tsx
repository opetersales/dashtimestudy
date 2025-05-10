
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { logoutUser, getCurrentProfile } from '@/services/auth';
import { useToast } from '@/components/ui/use-toast';
import { User, LogOut, Sun, Moon, Menu } from 'lucide-react';

interface HeaderProps {
  sidebarCollapsed?: boolean;
  onToggleTheme?: () => void;
  isDarkTheme?: boolean;
}

const Header = ({ sidebarCollapsed, onToggleTheme, isDarkTheme }: HeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = getCurrentProfile();

  const handleLogout = () => {
    logoutUser();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso."
    });
    navigate('/auth');
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm py-3 px-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-primary">STime</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {onToggleTheme && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleTheme}
            className="rounded-full"
            aria-label="Toggle theme"
          >
            {isDarkTheme ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        )}
        
        {currentUser && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 text-primary rounded-full p-1.5">
                <User size={18} />
              </div>
              <div>
                <p className="text-sm font-medium">{currentUser.name}</p>
                <p className="text-xs text-muted-foreground">{currentUser.email}</p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center"
            >
              <LogOut className="mr-1 h-4 w-4" />
              Sair
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
