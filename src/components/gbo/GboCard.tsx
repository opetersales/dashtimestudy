import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Edit } from 'lucide-react';
import { GBO } from '@/utils/types';
import { cn } from '@/lib/utils';

interface GboCardProps {
  gbo: GBO;
  onClick?: () => void;
  isActive?: boolean;
}

export function GboCard({ gbo, onClick, isActive = false }: GboCardProps) {
  const navigate = useNavigate();
  
  const statusColors = {
    draft: 'bg-muted text-muted-foreground',
    active: 'bg-success text-success-foreground',
    archived: 'bg-secondary text-secondary-foreground'
  };

  const efficiencyIndicator = 
    gbo.efficiency >= 0.9 ? 'indicator-up' :
    gbo.efficiency >= 0.7 ? 'indicator-neutral' :
    'indicator-down';

  const uphDifference = gbo.actualUPH - gbo.targetUPH;
  const uphIndicator = 
    uphDifference >= 0 ? 'indicator-up' :
    uphDifference >= -10 ? 'indicator-neutral' :
    'indicator-down';

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/gbo/${gbo.id}`);
  };

  return (
    <Card 
      className={cn("gbo-card", isActive && "gbo-card-active")}
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{gbo.name}</CardTitle>
          <Badge className={statusColors[gbo.status]}>
            {gbo.status === 'draft' ? 'Rascunho' : 
             gbo.status === 'active' ? 'Ativo' : 'Arquivado'}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground flex flex-wrap gap-2">
          <span>{gbo.productModel}</span>
          {gbo.productVariant && (
            <>
              <span>•</span>
              <span>{gbo.productVariant}</span>
            </>
          )}
          <span>•</span>
          <span>{gbo.productionLine}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Tempo de Ciclo</p>
            <p className="font-medium">{gbo.cycleTime}s</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Eficiência</p>
            <p className={efficiencyIndicator}>{Math.round(gbo.efficiency * 100)}%</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">UPH Alvo</p>
            <p className="font-medium">{gbo.targetUPH}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">UPH Atual</p>
            <p className={uphIndicator}>{gbo.actualUPH}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="text-sm">
            <span className="text-muted-foreground">Versão:</span> {gbo.version}
          </div>
          <div className="flex gap-2">
            {onClick && (
              <Button variant="ghost" size="icon" onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}>
                <Edit size={16} />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleViewDetails}>
              <ArrowRight size={16} />
              <span className="sr-only">Ver detalhes</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
