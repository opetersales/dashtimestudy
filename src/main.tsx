
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.tsx';

// Global Styles
import './index.css';
import './components/ui/custom-styles.css';

// Pages
import Index from './pages/Index.tsx';
import TimeStudies from './pages/TimeStudies.tsx';
import TimeStudyDetail from './pages/TimeStudyDetail.tsx';
import Documents from './pages/Documents.tsx';
import History from './pages/History.tsx';
import Settings from './pages/Settings.tsx';
import Planning from './pages/Planning.tsx';
import GBOs from './pages/GBOs.tsx';
import GboDetail from './pages/GboDetail.tsx';
import Operators from './pages/Operators.tsx';
import AnaliseAtividades from './pages/AnaliseAtividades.tsx';
import { Toaster } from "@/components/ui/toaster";
import NotFound from './pages/NotFound.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60, // 1 hour
      retry: 1,
    },
  },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Index />,
      },
      {
        path: "studies",
        element: <TimeStudies />,
      },
      {
        path: "study/:id",
        element: <TimeStudyDetail />,
      },
      {
        path: "documents",
        element: <Documents />,
      },
      {
        path: "history",
        element: <History />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "planning",
        element: <Planning />,
      },
      {
        path: "gbos",
        element: <GBOs />,
      },
      {
        path: "gbo/:id",
        element: <GboDetail />,
      },
      {
        path: "operators",
        element: <Operators />,
      },
      {
        path: "analysis",
        element: <AnaliseAtividades />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>
  </React.StrictMode>
);
