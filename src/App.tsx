
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

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Authentication route */}
            <Route path="/auth" element={session ? <Navigate to="/" /> : <Auth />} />

            {/* Protected routes */}
            <Route path="/" element={session ? <Index /> : <Navigate to="/auth" />} />
            <Route path="/gbos" element={session ? <GBOs /> : <Navigate to="/auth" />} />
            <Route path="/operators" element={session ? <Operators /> : <Navigate to="/auth" />} />
            <Route path="/planning" element={session ? <Planning /> : <Navigate to="/auth" />} />
            <Route path="/history" element={session ? <History /> : <Navigate to="/auth" />} />
            <Route path="/documents" element={session ? <Documents /> : <Navigate to="/auth" />} />
            <Route path="/settings" element={session ? <Settings /> : <Navigate to="/auth" />} />
            <Route path="/activity-analysis" element={session ? <ActivityAnalysis /> : <Navigate to="/auth" />} />
            
            {/* Fallback route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
