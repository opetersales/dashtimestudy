
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import Auth from './pages/Auth';
import { AuthWrapper } from './components/layout/AuthWrapper';
import TimeStudies from './pages/TimeStudies';
import TimeStudyDetail from './features/timeStudy/TimeStudyDetail';
import Index from './pages/Index';
import NotFound from './pages/NotFound';

// Import de outros componentes necessários
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="stime-theme">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route path="/auth" element={<Auth />} />
            
            {/* Rotas protegidas */}
            <Route element={<AuthWrapper />}>
              <Route index element={<Index />} />
              <Route path="/studies" element={<TimeStudies />} />
              <Route path="/study/:id" element={<TimeStudyDetail />} />
              {/* Outras rotas protegidas aqui */}
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  </React.StrictMode>
);
