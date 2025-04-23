
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from 'lucide-react';

export function EmptyChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sem dados para visualização</CardTitle>
        <CardDescription>
          Adicione atividades para visualizar os gráficos de análise
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-10">
        <BarChart className="h-16 w-16 text-muted-foreground mb-4" />
        <p className="text-muted-foreground text-center">
          Cadastre atividades na aba "Atividades" para gerar os gráficos de análise de tempo, UPH e UPPH.
        </p>
      </CardContent>
    </Card>
  );
}
