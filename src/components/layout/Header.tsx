
import React from 'react';
import { Bell, Sun, Moon, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onToggleTheme: () => void;
  isDarkTheme: boolean;
}

export function Header({ sidebarCollapsed, onToggleTheme, isDarkTheme }: HeaderProps) {
  const { toast } = useToast();
  
  const handleNotificationClick = () => {
    toast({
      title: "Notificações",
      description: "Não há notificações novas.",
    });
  };

  return (
    <header className={cn(
      "h-16 sticky top-0 z-30 bg-background border-b flex items-center justify-between px-4 transition-all duration-300",
      sidebarCollapsed ? "ml-16" : "ml-64"
    )}>
      <div className="flex items-center w-1/3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="pl-8 w-[240px] bg-muted/50"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleTheme}
          className="text-muted-foreground"
        >
          {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNotificationClick}
          className="text-muted-foreground relative"
        >
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Perfil</DropdownMenuItem>
            <DropdownMenuItem>Configurações</DropdownMenuItem>
            <DropdownMenuItem>Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

import { cn } from '@/lib/utils';
