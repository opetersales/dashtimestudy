
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { TimeStudy } from '@/utils/types';
import { useTimeStudyExport } from '@/shared/hooks/useTimeStudyExport';

interface TimeStudyExportProps {
  study: TimeStudy;
}

/**
 * Componente para exportação de estudos de tempo
 * Fornece botões para exportar em Excel ou PDF
 */
export const TimeStudyExport: React.FC<TimeStudyExportProps> = ({ study }) => {
  const { exportToExcel, exportStudyToPDF } = useTimeStudyExport();
  const [isLoading, setIsLoading] = useState({
    excel: false,
    pdf: false
  });

  const handleExportExcel = async () => {
    try {
      setIsLoading(prev => ({ ...prev, excel: true }));
      await exportToExcel(study);
    } finally {
      setIsLoading(prev => ({ ...prev, excel: false }));
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsLoading(prev => ({ ...prev, pdf: true }));
      await exportStudyToPDF(study);
    } finally {
      setIsLoading(prev => ({ ...prev, pdf: false }));
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button 
        variant="outline" 
        onClick={handleExportExcel} 
        disabled={isLoading.excel}
        className="min-w-[130px]"
      >
        {isLoading.excel ? (
          <span className="animate-pulse">Exportando...</span>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Exportar Excel
          </>
        )}
      </Button>
      <Button 
        variant="outline" 
        onClick={handleExportPDF}
        disabled={isLoading.pdf}
        className="min-w-[130px]"
      >
        {isLoading.pdf ? (
          <span className="animate-pulse">Exportando...</span>
        ) : (
          <>
            <FileText className="mr-2 h-4 w-4" />
            Exportar PDF
          </>
        )}
      </Button>
    </div>
  );
};
