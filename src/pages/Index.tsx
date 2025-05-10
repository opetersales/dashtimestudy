
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentProfile } from '@/services/auth';
import Header from '@/components/layout/Header';

const Index = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentProfile();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Bem-vindo ao Sistema de Estudo de Tempos
          </h1>
          <p className="text-gray-600 mt-2">
            Gerencie seus estudos de tempo de forma eficiente
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Estudos de Tempo</CardTitle>
              <CardDescription>Gerencie seus estudos de tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Visualize, crie e edite seus estudos de tempo.</p>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate('/studies')}>
                Ver estudos
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
              <CardDescription>Analise dados e resultados</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Visualize gráficos e relatórios baseados nos seus estudos.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                Ver relatórios
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>Personalize sua experiência</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Ajuste preferências e configurações do sistema.</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline">
                Configurar
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} STime - Sistema de Estudo de Tempos
      </footer>
    </div>
  );
};

export default Index;
