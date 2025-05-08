
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { TimeStudy } from '@/utils/types';

interface TimeStudyHeaderProps {
  study: TimeStudy;
}

/**
 * Componente para o cabeçalho da página de detalhes de estudo de tempo
 * Exibe o botão de voltar para estudos
 */
export const TimeStudyHeader: React.FC<TimeStudyHeaderProps> = ({ study }) => {
  const navigate = useNavigate();

  return (
    <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <Button variant="outline" onClick={() => navigate('/studies')}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Estudos
      </Button>
    </div>
  );
};
