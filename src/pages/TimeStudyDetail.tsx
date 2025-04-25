
  // This function was missing in our previous fix
  const handleNewLineSubmit = (data: ProductionLine) => {
    if (!study) return;
    
    const newLine: ProductionLine = {
      id: `line-${Date.now()}`,
      name: data.name,
      notes: data.notes,
      workstations: [],
    };
    
    const updatedStudy: TimeStudy = {
      ...study,
      productionLines: [...study.productionLines, newLine],
      updatedAt: new Date().toISOString(),
    };
    
    handleSaveStudy({ productionLines: updatedStudy.productionLines });
    setIsLineFormOpen(false);
  };

  const handleUpdateLine = (updatedLine: ProductionLine) => {
    if (!study) return;
  
    const updatedLines = study.productionLines.map(line =>
      line.id === updatedLine.id ? { ...line, ...updatedLine } : line
    );
  
    handleSaveStudy({ productionLines: updatedLines });
    setSelectedLine(null);
  };

  const handleDeleteLine = (lineToDelete: ProductionLine) => {
    if (!study) return;
  
    const updatedLines = study.productionLines.filter(line => line.id !== lineToDelete.id);
    handleSaveStudy({ productionLines: updatedLines });
    setSelectedLine(null);
  };

  const handleNewWorkstationSubmit = (data: Workstation) => {
    if (!study || !selectedLine) return;
    
    const newWorkstation: Workstation = {
      id: `ws-${Date.now()}`,
      number: data.number,
      name: data.name,
      notes: data.notes,
      activities: [],
    };
    
    const updatedLines = study.productionLines.map(line => {
      if (line.id === selectedLine.id) {
        return {
          ...line,
          workstations: [...line.workstations, newWorkstation],
        };
      }
      return line;
    });
    
    handleSaveStudy({ productionLines: updatedLines });
    setIsWorkstationFormOpen(false);
  };

  const handleUpdateWorkstation = (updatedWorkstation: Workstation) => {
    if (!study || !selectedLine) return;
  
    const updatedLines = study.productionLines.map(line => {
      if (line.id === selectedLine.id) {
        const updatedWorkstations = line.workstations.map(ws =>
          ws.id === updatedWorkstation.id ? { ...ws, ...updatedWorkstation } : ws
        );
        return { ...line, workstations: updatedWorkstations };
      }
      return line;
    });
  
    handleSaveStudy({ productionLines: updatedLines });
    setSelectedWorkstation(null);
  };

  const handleDeleteWorkstation = (workstationToDelete: Workstation) => {
    if (!study || !selectedLine) return;
  
    const updatedLines = study.productionLines.map(line => {
      if (line.id === selectedLine.id) {
        const updatedWorkstations = line.workstations.filter(ws => ws.id !== workstationToDelete.id);
        return { ...line, workstations: updatedWorkstations };
      }
      return line;
    });
  
    handleSaveStudy({ productionLines: updatedLines });
    setSelectedWorkstation(null);
  };

  const handleNewActivitySubmit = (data: Activity) => {
    if (!study || !selectedLine || !selectedWorkstation) return;
    
    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      description: data.description,
      type: data.type,
      collections: [],
      pfdFactor: data.pfdFactor,
    };
    
    const updatedLines = study.productionLines.map(line => {
      if (line.id === selectedLine.id) {
        const updatedWorkstations = line.workstations.map(ws => {
          if (ws.id === selectedWorkstation.id) {
            return {
              ...ws,
              activities: [...ws.activities, newActivity],
            };
          }
          return ws;
        });
        return { ...line, workstations: updatedWorkstations };
      }
      return line;
    });
    
    handleSaveStudy({ productionLines: updatedLines });
    setIsActivityFormOpen(false);
  };

  const handleUpdateActivity = (updatedActivity: Activity) => {
    if (!study || !selectedLine || !selectedWorkstation) return;
  
    const updatedLines = study.productionLines.map(line => {
      if (line.id === selectedLine.id) {
        const updatedWorkstations = line.workstations.map(ws => {
          if (ws.id === selectedWorkstation.id) {
            const updatedActivities = ws.activities.map(act =>
              act.id === updatedActivity.id ? { ...act, ...updatedActivity } : act
            );
            return { ...ws, activities: updatedActivities };
          }
          return ws;
        });
        return { ...line, workstations: updatedWorkstations };
      }
      return line;
    });
  
    handleSaveStudy({ productionLines: updatedLines });
    setSelectedActivity(null);
  };

  const handleDeleteActivity = (activityToDelete: Activity) => {
    if (!study || !selectedLine || !selectedWorkstation) return;
  
    const updatedLines = study.productionLines.map(line => {
      if (line.id === selectedLine.id) {
        const updatedWorkstations = line.workstations.map(ws => {
          if (ws.id === selectedWorkstation.id) {
            const updatedActivities = ws.activities.filter(act => act.id !== activityToDelete.id);
            return { ...ws, activities: updatedActivities };
          }
          return ws;
        });
        return { ...line, workstations: updatedWorkstations };
      }
      return line;
    });
  
    handleSaveStudy({ productionLines: updatedLines });
    setSelectedActivity(null);
  };

  const handleNewShiftSubmit = (data: Shift) => {
    if (!study) return;
    
    const newShift: Shift = {
      id: `shift-${Date.now()}`,
      name: data.name,
      hours: data.hours,
      isActive: data.isActive,
    };
    
    const updatedStudy: TimeStudy = {
      ...study,
      shifts: [...study.shifts, newShift],
      updatedAt: new Date().toISOString(),
    };
    
    handleSaveStudy({ shifts: updatedStudy.shifts });
    setIsShiftFormOpen(false);
  };

  const handleUpdateShift = (updatedShift: Shift) => {
    if (!study) return;
  
    const updatedShifts = study.shifts.map(shift =>
      shift.id === updatedShift.id ? { ...shift, ...updatedShift } : shift
    );
  
    handleSaveStudy({ shifts: updatedShifts });
    setSelectedShift(null);
  };

  const handleDeleteShift = (shiftToDelete: Shift) => {
    if (!study) return;
  
    const updatedShifts = study.shifts.filter(shift => shift.id !== shiftToDelete.id);
    handleSaveStudy({ shifts: updatedShifts });
    setSelectedShift(null);
  };
