import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { EventProvider } from './context/EventContext';
import { Registration } from './components/Registration';
import { AdminPanel } from './components/AdminPanel';
import { AttackOverlay } from './components/AttackOverlay';
import { Roulette } from './components/Roulette';
import { SuspiciousMonk } from './components/SuspiciousMonk';
import { BroadcastOverlay } from './components/BroadcastOverlay';
import { Leaf } from 'lucide-react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const getBackgroundImage = () => {
    if (isAdmin) {
      // Estufa Real de Mafra / Ajuda (Neoclassical Greenhouse)
      return "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Estufa_Real_-_Jardim_Bot%C3%A2nico_da_Ajuda.jpg/1280px-Estufa_Real_-_Jardim_Bot%C3%A2nico_da_Ajuda.jpg";
    }
    // Jardim Botânico da Ajuda with Tejo View
    return "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Jardim_Bot%C3%A2nico_da_Ajuda_-_Lisboa.jpg/1280px-Jardim_Bot%C3%A2nico_da_Ajuda_-_Lisboa.jpg";
  };

  return (
    <div className="min-h-screen bg-emerald-950 text-gray-100 flex flex-col relative overflow-hidden transition-all duration-700">
      
      {/* Background with Botanical Tint */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center pointer-events-none transition-all duration-1000 ease-in-out"
        style={{
          backgroundImage: `url(${getBackgroundImage()})`,
          filter: 'sepia(30%) saturate(120%) brightness(0.4)',
          opacity: 0.6, 
        }}
      />
      
      {/* Vignette Overlay */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)] pointer-events-none"></div>

      <AttackOverlay />
      <BroadcastOverlay />
      <Roulette />
      <SuspiciousMonk />

      {/* Header - Neoclassical Glass Style */}
      <header className="bg-emerald-900/80 border-b border-emerald-600/30 py-6 sticky top-0 z-40 backdrop-blur-lg shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center relative z-50">
          <div className="flex items-center space-x-3">
             <div className="p-2 bg-emerald-800 rounded-full border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                <Leaf size={28} className="text-emerald-200" />
             </div>
             <div>
                 <h1 className="text-2xl font-bold gold-text tracking-wider uppercase drop-shadow-md">Cyber Security Summit</h1>
                 <p className="text-xs text-emerald-400 uppercase tracking-widest font-serif">Vandelli Botanical Edition</p>
             </div>
          </div>
          
          <nav className="space-x-6 text-sm font-serif">
             <Link to="/" className={`hover:text-emerald-300 transition font-bold tracking-wide ${location.pathname === '/' ? 'text-emerald-400 underline decoration-emerald-600 underline-offset-4' : 'text-gray-300'}`}>Registo</Link>
             <Link to="/admin" className={`hover:text-emerald-300 transition font-bold tracking-wide ${location.pathname === '/admin' ? 'text-emerald-400 underline decoration-emerald-600 underline-offset-4' : 'text-gray-300'}`}>Direção</Link>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow p-6 flex flex-col items-center justify-center relative z-10">
        <div className="w-full">
            {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950/90 py-4 text-center text-emerald-700 text-xs border-t border-emerald-800/30 relative z-10">
        <p className="font-serif">Vandelli Botanical Garden &copy; 2026. Cultiva a tua segurança.</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <EventProvider>
        <HashRouter>
            <Layout>
                <Routes>
                    <Route path="/" element={<Registration />} />
                    <Route path="/admin" element={<AdminPanel />} />
                </Routes>
            </Layout>
        </HashRouter>
    </EventProvider>
  );
};

export default App;