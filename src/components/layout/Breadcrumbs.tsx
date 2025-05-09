
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbsProps {
  className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Get URL for each path segment
  const getPathUrl = (index: number): string => {
    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
    return path;
  };

  // Map path segments to their correct route
  const getCorrectPath = (segment: string, index: number): string => {
    // Mapping special cases to ensure correct navigation
    if (segment === 'study' && index === 0 && pathSegments.length > 1) {
      // When we're in a study detail page like /study/123, 
      // clicking on "study" should go to /studies
      return '/studies';
    }
    if (segment === 'gbo' && index === 0 && pathSegments.length > 1) {
      // When we're in a GBO detail page like /gbo/123, 
      // clicking on "gbo" should go to /gbos
      return '/gbos';
    }
    
    // Default behavior for other paths
    return getPathUrl(index);
  };

  // Map segment names to more readable display names
  const getDisplayName = (segment: string): string => {
    // Custom mapping for specific segments
    const nameMap: Record<string, string> = {
      'studies': 'Estudos',
      'study': 'Estudo',
      'gbos': 'GBOs',
      'gbo': 'GBO',
      'operators': 'Operadores',
      'documents': 'Documentos',
      'settings': 'Configurações',
      'history': 'Histórico',
      'planning': 'Planejamento',
      'analysis': 'Análise'
    };

    // Check if we have a custom mapping
    if (nameMap[segment]) {
      return nameMap[segment];
    }

    // Otherwise, format the segment name
    return segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  };

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Início</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {pathSegments.map((segment, index) => {
          const isLast = index === pathSegments.length - 1;
          const url = getCorrectPath(segment, index);
          const displayName = getDisplayName(segment);
          
          return (
            <React.Fragment key={url}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{displayName}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={url}>{displayName}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
