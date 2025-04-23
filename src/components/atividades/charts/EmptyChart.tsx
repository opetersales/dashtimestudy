
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function EmptyChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gráficos de Análise</CardTitle>
        <CardDescription>Não há dados suficientes para gerar gráficos</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center py-10 text-muted-foreground">
        Cadastre atividades para visualizar os gráficos de análise
      </CardContent>
    </Card>
  );
}
