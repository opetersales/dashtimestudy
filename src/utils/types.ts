// Time study types
export interface TimeCollection {
  id: string;
  value: number; // in seconds
}

export interface Activity {
  id: string;
  description: string;
  type: 'Manual' | 'Maquinário';
  collections: TimeCollection[];
  pfdFactor: number; // Default 10% (0.1)
  averageNormalTime?: number; // Calculated
  cycleTime?: number; // Calculated
}

export interface Workstation {
  id: string;
  number: string; // "01", "02", etc.
  name?: string;
  notes?: string;
  activities: Activity[];
  cycleTime?: number; // Calculated - sum of activities cycle times
  uph?: number; // Calculated - 3600 / cycleTime
  idleTime?: number; // Calculated - [(line CT - station CT) / line CT] * 100
}

export interface ProductionLine {
  id: string;
  name: string;
  notes?: string;
  workstations: Workstation[];
  cycleTime?: number; // Calculated - highest workstation CT (bottleneck)
  uph?: number; // Calculated - 3600 / cycleTime
}

export interface Shift {
  id: string;
  name: string; // "1º", "2º", "3º"
  hours: number; // Hours worked in this shift
  isActive: boolean;
  taktTime?: number; // Calculated
  estimatedProduction?: number; // Calculated
}

export interface TimeStudy {
  id: string;
  client: string;
  modelName: string;
  studyDate: string; // ISO date string
  responsiblePerson: string;
  monthlyDemand: number;
  workingDays: number;
  dailyDemand?: number; // Calculated - monthlyDemand / workingDays
  shifts: Shift[];
  productionLines: ProductionLine[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  totalTimePerUnit?: number; // Calculated - sum of all CTs
  dailyCapacity?: number; // Calculated - sum of all shifts' estimated production
  efficiency?: number; // Calculated
}

// PerformanceData type for charts
export interface PerformanceData {
  label: string;
  actual: number;
  target: number;
}

// Type for the dashboard metric cards
export interface MetricCardData {
  title: string;
  value: string;
  description: string;
  trend?: number;
}

// GBO type for backward compatibility during transition
export interface GBO {
  id: string;
  name: string;
  productModel: string;
  productVariant: string;
  productionLine: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: string;
  status: 'draft' | 'active' | 'archived';
  cycleTime: number;
  targetUPH: number;
  actualUPH: number;
  efficiency: number;
  operatorCount: number;
  workstations: any[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePicture?: string;
  department?: string;
  position?: string;
  phoneNumber?: string;
}

export interface HistoryEntry {
  id: string;
  date: string;
  user: string;
  action: string;
  details: string;
  entityType: 'timeStudy' | 'gbo' | 'document' | 'user' | 'settings';
  entityId: string;
  entityName: string;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  uploadedBy: string;
  description?: string;
  tags?: string[];
  url?: string;
}
