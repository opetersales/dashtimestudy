
import React from 'react';
import { BasePage } from '@/components/layout/BasePage';
import { Dashboard } from '@/components/dashboard/Dashboard';

const Index = () => {
  return (
    <BasePage title="Dashboard de Estudos de Tempo">
      <Dashboard />
    </BasePage>
  );
};

export default Index;
