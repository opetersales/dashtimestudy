
import React from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { getCurrentProfile, logoutUser } from '@/services/auth';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleTheme: () => void;
  isDarkTheme: boolean;
}

export const Header = ({ sidebarCollapsed, onToggleTheme, isDarkTheme }: HeaderProps) => {
  const navigate = useNavigate();
  const user = getCurrentProfile();
  
  const handleLogout = () => {
    logoutUser();
    navigate('/auth');
  };
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <header className="border-b bg-background sticky top-0 z-30">
      <div className="flex h-16 items-center justify-between px-4">
        <div>
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold">STime</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onToggleTheme}>
            {isDarkTheme ? <Sun /> : <Moon />}
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};
