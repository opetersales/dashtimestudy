import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  LayoutDashboard,
  File,
  Clock,
  History,
  ChevronLeft,
  ChevronRight,
  Settings,
  LucideIcon
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <div
      className={cn(
        "h-screen fixed top-0 left-0 z-40 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <h1 className={cn("font-bold text-xl", collapsed && "hidden")}>Estudos de Tempo</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground"
          title={collapsed ? "Expandir menu" : "Recolher menu"}
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </Button>
      </div>
      
      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/" collapsed={collapsed} />
        <SidebarItem icon={Clock} label="Estudos" path="/studies" collapsed={collapsed} />
        <SidebarItem icon={History} label="Histórico" path="/history" collapsed={collapsed} />
        <SidebarItem icon={File} label="Documentos" path="/documents" collapsed={collapsed} />
      </nav>
      
      <div className="p-3 border-t border-sidebar-border">
        <SidebarItem icon={Settings} label="Configurações" path="/settings" collapsed={collapsed} />
      </div>
    </div>
  );
}

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  path: string;
  collapsed: boolean;
}

function SidebarItem({ icon: Icon, label, path, collapsed }: SidebarItemProps) {
  const location = useLocation();
  const isActive = location.pathname === path;
  
  const item = (
    <Link
      to={path}
      className={cn(
        "flex items-center p-2 rounded-md transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
      )}
    >
      <Icon size={20} />
      {!collapsed && <span className="ml-3">{label}</span>}
    </Link>
  );

  // If collapsed, wrap with tooltip
  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {item}
          </TooltipTrigger>
          <TooltipContent side="right">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return item;
}
