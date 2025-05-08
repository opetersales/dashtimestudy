
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface BreadcrumbsProps {
  className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  return (
    <nav className={cn("flex", className)}>
      <ol className="flex text-sm items-center space-x-2">
        <li>
          <Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link>
        </li>
        
        {pathSegments.map((segment, index) => {
          // Format the segment to be more readable
          const readableSegment = segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, char => char.toUpperCase());
          
          // The path up to this segment
          const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
          
          // Check if this is the last segment
          const isLast = index === pathSegments.length - 1;
          
          return (
            <React.Fragment key={path}>
              <li className="text-muted-foreground">/</li>
              <li>
                {isLast ? (
                  <span className="font-medium">{readableSegment}</span>
                ) : (
                  <Link to={path} className="text-muted-foreground hover:text-foreground">
                    {readableSegment}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
