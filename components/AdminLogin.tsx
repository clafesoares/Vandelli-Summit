import React, { useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Shield, KeyRound, Lock } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { loginAdmin } = useEvent();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginAdmin(username, password);
    if (!success) {
      setError('Credenciais inválidas no Herbário. Tente novamente.');
    } else {
      setError('');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[500px] animate-fade-in">
      <div className="max-w-md w-full herbarium-paper p-10 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-emerald-900/40 relative overflow-hidden">
        
        {/* Decorative Neoclassical Corner (Top-Right) */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-900/10 rounded-full border border-emerald-500/20 pointer-events-none"></div>
        
        <div className="flex flex-col items-center mb-8 relative z-10">
          <div className="p-4 bg-emerald-900 rounded-full border-2 border-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.4)]">
             <Lock size={40} className="text-emerald-100" />
          </div>
          <h2 className="text-3xl font-bold text-center gold-text display-font uppercase tracking-widest drop-shadow-sm">
             Direção Vandelli
          </h2>
          <p className="text-xs text-emerald-800 font-serif italic mt-2 uppercase tracking-[0.2em] font-bold">Acesso ao Herbário Real</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">
          <div className="group">
            <label className="block text-emerald-900 font-bold mb-1 uppercase text-xs tracking-widest opacity-70 group-focus-within:opacity-100 transition-opacity">Utilizador Curador</label>
            <input 
              type="text" 
              required
              className="w-full bg-emerald-900/5 border-b-2 border-emerald-900/30 p-3 text-emerald-950 focus:outline-none focus:border-emerald-600 placeholder-emerald-900/30 font-bold transition-colors"
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>
          
          <div className="group">
            <label className="block text-emerald-900 font-bold mb-1 uppercase text-xs tracking-widest opacity-70 group-focus-within:opacity-100 transition-opacity">Chave de Acesso</label>
            <input 
              type="password" 
              required
              className="w-full bg-emerald-900/5 border-b-2 border-emerald-900/30 p-3 text-emerald-950 focus:outline-none focus:border-emerald-600 placeholder-emerald-900/30 transition-colors"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-white bg-[#c2410c] border border-[#9a3412] p-3 text-center text-sm font-bold rounded shadow-inner animate-pulse">
              {/* Terracota style for errors */}
              {error}
            </div>
          )}

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-4 transition-all shadow-[0_10px_20px_rgba(6,78,59,0.3)] uppercase tracking-widest border border-emerald-950 flex items-center justify-center gap-2 transform hover:-translate-y-1 active:scale-95"
            >
              <KeyRound size={18} className="text-emerald-400" /> Validar Entrada
            </button>
          </div>
        </form>

        {/* Footer decoration */}
        <div className="mt-8 pt-6 border-t border-emerald-900/10 text-center">
            <p className="text-[10px] text-emerald-800/60 uppercase tracking-[0.3em]">Jardim Botânico da Ajuda • Lisboa</p>
        </div>
      </div>
    </div>
  );
};