
import { useTimeStudyCalculations } from './useTimeStudyCalculations';
import { Workstation, Activity } from '@/utils/types';
import '@testing-library/jest-dom';

describe('useTimeStudyCalculations', () => {
  const { 
    calculateActivityCycleTime,
    calculateWorkstationCycleTime,
    calculateTaktTime
  } = useTimeStudyCalculations();

  describe('calculateActivityCycleTime', () => {
    it('should calculate cycle time with PF&D factor', () => {
      const activity: Activity = {
        id: 'act1',
        description: 'Test Activity',
        type: 'Manual',
        collections: [
          { id: 'col1', value: 10 },
          { id: 'col2', value: 20 },
          { id: 'col3', value: 30 }
        ],
        pfdFactor: 0.1
      };

      // Média = (10 + 20 + 30) / 3 = 20
      // Com PF&D de 10% = 20 * 1.1 = 22
      const result = calculateActivityCycleTime(activity);
      expect(result).toBeCloseTo(22, 1);
    });

    it('should return 0 for activity with no valid collections', () => {
      const activity: Activity = {
        id: 'act1',
        description: 'Test Activity',
        type: 'Manual',
        collections: [],
        pfdFactor: 0.1
      };

      const result = calculateActivityCycleTime(activity);
      expect(result).toBe(0);
    });
  });

  describe('calculateWorkstationCycleTime', () => {
    it('should sum cycle times of all activities', () => {
      const workstation: Workstation = {
        id: 'ws1',
        number: '1',
        name: 'Test Workstation',
        activities: [
          {
            id: 'act1',
            description: 'Activity 1',
            type: 'Manual',
            collections: [{ id: 'col1', value: 10 }],
            pfdFactor: 0.1
          },
          {
            id: 'act2',
            description: 'Activity 2',
            type: 'Maquinário',
            collections: [{ id: 'col2', value: 20 }],
            pfdFactor: 0.05
          }
        ]
      };

      // Activity 1: 10 * 1.1 = 11
      // Activity 2: 20 * 1.05 = 21
      // Total: 11 + 21 = 32
      const result = calculateWorkstationCycleTime(workstation);
      expect(result).toBeCloseTo(32, 1);
    });

    it('should return 0 for workstation with no activities', () => {
      const workstation: Workstation = {
        id: 'ws1',
        number: '1',
        name: 'Empty Workstation',
        activities: []
      };

      const result = calculateWorkstationCycleTime(workstation);
      expect(result).toBe(0);
    });
  });

  describe('calculateTaktTime', () => {
    it('should calculate takt time correctly', () => {
      const study = {
        id: 'study1',
        client: 'Test Client',
        modelName: 'Test Model',
        studyDate: '2023-01-01',
        responsiblePerson: 'Test Person',
        monthlyDemand: 1000,
        workingDays: 20,
        dailyDemand: 50,
        shifts: [
          { id: 'shift1', name: 'Morning', hours: 4, isActive: true },
          { id: 'shift2', name: 'Afternoon', hours: 4, isActive: true },
          { id: 'shift3', name: 'Night', hours: 8, isActive: false }
        ],
        productionLines: [],
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        createdBy: 'Test User',
        version: '1.0',
        status: 'draft' as const
      };

      // Takt time = (4 + 4) * 3600 / 50 = 576 segundos
      const result = calculateTaktTime(study);
      expect(result).toBe(576);
    });

    it('should return 0 if no dailyDemand', () => {
      const study = {
        id: 'study1',
        client: 'Test Client',
        modelName: 'Test Model',
        studyDate: '2023-01-01',
        responsiblePerson: 'Test Person',
        monthlyDemand: 1000,
        workingDays: 20,
        dailyDemand: 0,
        shifts: [
          { id: 'shift1', name: 'Morning', hours: 4, isActive: true }
        ],
        productionLines: [],
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
        createdBy: 'Test User',
        version: '1.0',
        status: 'draft' as const
      };

      const result = calculateTaktTime(study);
      expect(result).toBe(0);
    });
  });
});
