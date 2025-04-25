
  // Helper functions that were missing in our update
  const handleDeleteStudy = (e: React.MouseEvent, study: TimeStudy) => {
    e.preventDefault();
    e.stopPropagation();
    setStudyToDelete(study);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteStudy = () => {
    if (!studyToDelete) return;
    
    const updatedStudies = studies.filter(s => s.id !== studyToDelete.id);
    setStudies(updatedStudies);
    saveToLocalStorage('timeStudies', updatedStudies);
    
    updateHistory(
      'delete',
      `Exclusão do estudo ${studyToDelete.client} - ${studyToDelete.modelName}`,
      `${studyToDelete.client} - ${studyToDelete.modelName}`
    );
    
    toast({
      title: "Estudo excluído",
      description: `${studyToDelete.client} - ${studyToDelete.modelName} foi excluído com sucesso.`,
    });
    
    setIsDeleteDialogOpen(false);
    setStudyToDelete(null);
    
    window.dispatchEvent(new Event('dashboardUpdate'));
  };

  const handleExportStudy = (e: React.MouseEvent, study: TimeStudy) => {
    e.preventDefault();
    e.stopPropagation();
    
    const blob = new Blob([JSON.stringify(study, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `estudo_${study.client}_${study.modelName}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Estudo exportado",
      description: "Os dados do estudo foram exportados com sucesso."
    });
    
    updateHistory(
      'export',
      `Exportação do estudo ${study.client} - ${study.modelName}`,
      `${study.client} - ${study.modelName}`
    );
  };
