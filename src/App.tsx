
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Documents from './pages/Documents';
import GBOs from './pages/GBOs';
import GboDetail from './pages/GboDetail';
import Planning from './pages/Planning';
import Operators from './pages/Operators';
import Settings from './pages/Settings';
import History from './pages/History';
import NotFound from './pages/NotFound';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/documents" element={<Documents />} />
      <Route path="/gbos" element={<GBOs />} />
      <Route path="/gbo/:id" element={<GboDetail />} />
      <Route path="/planning" element={<Planning />} />
      <Route path="/operators" element={<Operators />} />
      <Route path="/history" element={<History />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
