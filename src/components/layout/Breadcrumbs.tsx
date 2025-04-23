
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Home } from 'lucide-react';

interface RouteMapping {
  [key: string]: {
    label: string;
    parent?: string;
  };
}

const routes: RouteMapping = {
  '/': { label: 'Dashboard' },
  '/gbos': { label: 'GBOs', parent: '/' },
  '/operators': { label: 'Operadores', parent: '/' },
  '/planning': { label: 'Planejamento', parent: '/' },
  '/history': { label: 'Histórico', parent: '/' },
  '/documents': { label: 'Documentos', parent: '/' },
  '/settings': { label: 'Configurações', parent: '/' },
  '/analise-atividades': { label: 'Análise de Atividades', parent: '/gbos' },
};

export function Breadcrumbs() {
  const location = useLocation();
  const paths = location.pathname.split('/').filter(Boolean);
  
  // Function to build breadcrumb items with proper links
  const buildBreadcrumbs = () => {
    const breadcrumbs = [];
    let currentPath = '';

    // Add home
    breadcrumbs.push({
      path: '/',
      label: <Home size={16} />,
      isCurrentPage: location.pathname === '/',
    });

    // Add each path segment
    for (let i = 0; i < paths.length; i++) {
      currentPath += `/${paths[i]}`;
      const routeInfo = routes[currentPath];
      
      if (routeInfo) {
        breadcrumbs.push({
          path: currentPath,
          label: routeInfo.label,
          isCurrentPage: currentPath === location.pathname,
        });
      } else {
        // Handle dynamic routes (like '/gbos/:id')
        // For simplicity, we'll just show the URL segment
        breadcrumbs.push({
          path: currentPath,
          label: paths[i].charAt(0).toUpperCase() + paths[i].slice(1),
          isCurrentPage: currentPath === location.pathname,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null; // Don't show breadcrumbs on home page
  }

  return (
    <Breadcrumb className="mb-4 px-6 py-2">
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => (
          <React.Fragment key={breadcrumb.path}>
            <BreadcrumbItem>
              {breadcrumb.isCurrentPage ? (
                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={breadcrumb.path}>{breadcrumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
