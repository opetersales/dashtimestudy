
// Common types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'engineer' | 'supervisor' | 'operator';
  avatar?: string;
}

// GBO related types
export interface GBO {
  id: string;
  name: string;
  productModel: string;
  productVariant?: string;
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
  workstations: Workstation[];
}

export interface Workstation {
  id: string;
  name: string;
  position: number;
  cycleTime: number;
  activities: Activity[];
  operatorId?: string;
  efficiency: number;
  status: 'bottleneck' | 'optimal' | 'warning' | 'normal';
}

export interface Activity {
  id: string;
  name: string;
  description?: string;
  timeRequired: number;
  requiredTraining?: string[];
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'document';
  url: string;
}

export interface Operator {
  id: string;
  name: string;
  badge: string;
  shift: 'morning' | 'afternoon' | 'night';
  trainings: string[];
  efficiency: number;
  assignedWorkstationId?: string;
}

// Chart and analytics types
export interface TimeSeriesData {
  date: string;
  value: number;
}

export interface PerformanceData {
  label: string;
  actual: number;
  target: number;
}

// Mock data generator functions
export const generateMockGBOs = (count: number = 5): GBO[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `gbo-${i + 1}`,
    name: `GBO #${i + 1}`,
    productModel: ['ModelA', 'ModelB', 'ModelC'][Math.floor(Math.random() * 3)],
    productVariant: ['Standard', 'Premium', 'Economic'][Math.floor(Math.random() * 3)],
    productionLine: ['Line01', 'Line02', 'Line03'][Math.floor(Math.random() * 3)],
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
    createdBy: 'John Doe',
    version: `1.${Math.floor(Math.random() * 5)}`,
    status: ['draft', 'active', 'archived'][Math.floor(Math.random() * 3)] as any,
    cycleTime: Math.floor(Math.random() * 120) + 60,
    targetUPH: Math.floor(Math.random() * 100) + 50,
    actualUPH: Math.floor(Math.random() * 100) + 30,
    efficiency: Math.random() * 0.5 + 0.5,
    operatorCount: Math.floor(Math.random() * 10) + 5,
    workstations: generateMockWorkstations(Math.floor(Math.random() * 5) + 3)
  }));
};

export const generateMockWorkstations = (count: number = 5): Workstation[] => {
  return Array.from({ length: count }, (_, i) => {
    const efficiency = Math.random();
    let status: Workstation['status'] = 'normal';
    
    if (efficiency < 0.6) status = 'bottleneck';
    else if (efficiency < 0.75) status = 'warning';
    else if (efficiency >= 0.9) status = 'optimal';
    
    return {
      id: `ws-${i + 1}`,
      name: `Workstation ${i + 1}`,
      position: i + 1,
      cycleTime: Math.floor(Math.random() * 60) + 30,
      activities: generateMockActivities(Math.floor(Math.random() * 3) + 1),
      operatorId: Math.random() > 0.3 ? `op-${Math.floor(Math.random() * 10) + 1}` : undefined,
      efficiency,
      status
    };
  });
};

export const generateMockActivities = (count: number = 3): Activity[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `act-${i + 1}`,
    name: `Activity ${i + 1}`,
    description: `Description for activity ${i + 1}`,
    timeRequired: Math.floor(Math.random() * 30) + 15,
    requiredTraining: Math.random() > 0.5 ? ['Safety', 'Technical'] : undefined,
    attachments: Math.random() > 0.7 ? [{
      id: `att-${i + 1}`,
      name: `Attachment ${i + 1}`,
      type: ['image', 'video', 'document'][Math.floor(Math.random() * 3)] as any,
      url: '#'
    }] : undefined
  }));
};

export const generatePerformanceData = (): PerformanceData[] => {
  return ['Line01', 'Line02', 'Line03'].map(line => ({
    label: line,
    actual: Math.floor(Math.random() * 100) + 30,
    target: Math.floor(Math.random() * 50) + 80
  }));
};
