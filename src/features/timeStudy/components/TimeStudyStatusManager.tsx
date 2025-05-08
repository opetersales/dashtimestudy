
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TimeStudy } from '@/utils/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Save, Send } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface TimeStudyStatusManagerProps {
  study: TimeStudy;
  onStudyUpdate: (updatedData: Partial<TimeStudy>) => void;
  updateHistory: (action: string, details: string) => void;
}

/**
 * Componente para gerenciar o status do estudo (rascunho/publicado)
 * Fornece botões e diálogos para alteração de status
 */
export const TimeStudyStatusManager: React.FC<TimeStudyStatusManagerProps> = ({ 
  study, 
  onStudyUpdate,
  updateHistory
}) => {
  const { toast } = useToast();
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [publishJustification, setPublishJustification] = useState('');
  const [isLoading, setIsLoading] = useState({
    publish: false,
    draft: false
  });

  const handlePublish = () => {
    if (!study || !publishJustification.trim() || publishJustification.length < 10) {
      toast({
        title: "Erro",
        description: "A justificativa precisa conter pelo menos 10 caracteres.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(prev => ({ ...prev, publish: true }));
      
      const updatedStudy = {
        ...study,
        status: 'active' as const,
        updatedAt: new Date().toISOString()
      };
      
      onStudyUpdate(updatedStudy);
      
      // Registra a justificativa no histórico
      updateHistory('publish', `Estudo publicado. Justificativa: ${publishJustification}`);
      
      setIsPublishDialogOpen(false);
      setPublishJustification('');
      
      toast({
        title: "Estudo publicado",
        description: "O estudo foi publicado com sucesso."
      });
    } finally {
      setIsLoading(prev => ({ ...prev, publish: false }));
    }
  };

  const handleSaveDraft = () => {
    if (!study) return;
    
    try {
      setIsLoading(prev => ({ ...prev, draft: true }));
      
      const updatedStudy = {
        ...study,
        status: 'draft' as const,
        updatedAt: new Date().toISOString()
      };
      
      onStudyUpdate(updatedStudy);
      
      updateHistory('draft', `Estudo salvo como rascunho`);
      
      toast({
        title: "Rascunho salvo",
        description: "O estudo foi salvo como rascunho."
      });
    } finally {
      setIsLoading(prev => ({ ...prev, draft: false }));
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          onClick={handleSaveDraft}
          disabled={isLoading.draft}
          className="min-w-[150px]"
        >
          {isLoading.draft ? (
            <span className="animate-pulse">Salvando...</span>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Rascunho
            </>
          )}
        </Button>
        <Button 
          onClick={() => setIsPublishDialogOpen(true)}
          disabled={isLoading.publish}
          className="min-w-[120px]"
        >
          {isLoading.publish ? (
            <span className="animate-pulse">Publicando...</span>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Publicar
            </>
          )}
        </Button>
      </div>

      {/* Diálogo de publicação com campo de justificativa */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publicar estudo</DialogTitle>
            <DialogDescription>
              Para publicar este estudo, forneça uma justificativa.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label htmlFor="justification" className="text-sm font-medium mb-2 block">
              Justificativa para publicação*
            </label>
            <Textarea
              id="justification"
              placeholder="Ex: Estudo validado com os valores de UPH aprovados pelo supervisor da linha."
              value={publishJustification}
              onChange={(e) => setPublishJustification(e.target.value)}
              className="min-h-[100px]"
            />
            {publishJustification.length < 10 && publishJustification.length > 0 && (
              <p className="text-sm text-destructive mt-1">
                A justificativa deve conter pelo menos 10 caracteres.
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Caracteres: {publishJustification.length}/10 mínimo
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPublishDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handlePublish} 
              disabled={publishJustification.length < 10}
            >
              Publicar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
