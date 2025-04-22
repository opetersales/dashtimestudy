
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createClient } from '@supabase/supabase-js';
import Index from "./pages/Index";
import GBOs from "./pages/GBOs";
import Operators from "./pages/Operators";
import Planning from "./pages/Planning";
import History from "./pages/History";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
import ActivityAnalysis from "./pages/ActivityAnalysis";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Initialize Supabase client with fallback values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    // Verificar se o modo de demonstração está ativado
    const storedDemoMode = localStorage.getItem('demoMode') === 'true';
    if (storedDemoMode) {
      setDemoMode(true);
      setLoading(false);
      return;
    }

    // Check for active session
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        
        // Listener for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            setSession(session);
          }
        );

        return () => subscription.unsubscribe();
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
        // Se não conseguir verificar a sessão, habilita o modo de demonstração
        if (window.location.pathname !== '/auth') {
          localStorage.setItem('demoMode', 'true');
          setDemoMode(true);
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  // Se estiver em modo de demonstração, considere o usuário como autenticado
  const isAuthenticated = session || demoMode;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Authentication route */}
            <Route path="/auth" element={isAuthenticated ? <Navigate to="/" /> : <Auth />} />

            {/* Protected routes */}
            <Route path="/" element={isAuthenticated ? <Index /> : <Navigate to="/auth" />} />
            <Route path="/gbos" element={isAuthenticated ? <GBOs /> : <Navigate to="/auth" />} />
            <Route path="/operators" element={isAuthenticated ? <Operators /> : <Navigate to="/auth" />} />
            <Route path="/planning" element={isAuthenticated ? <Planning /> : <Navigate to="/auth" />} />
            <Route path="/history" element={isAuthenticated ? <History /> : <Navigate to="/auth" />} />
            <Route path="/documents" element={isAuthenticated ? <Documents /> : <Navigate to="/auth" />} />
            <Route path="/settings" element={isAuthenticated ? <Settings /> : <Navigate to="/auth" />} />
            <Route path="/activity-analysis" element={isAuthenticated ? <ActivityAnalysis /> : <Navigate to="/auth" />} />
            
            {/* Fallback route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
