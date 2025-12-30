import React, { useEffect, useState } from 'react';
import { useEvent } from '../context/EventContext';
import { Scroll, X, Info } from 'lucide-react';

export const BroadcastOverlay: React.FC = () => {
  const { broadcastMessage } = useEvent();
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [lastSeenId, setLastSeenId] = useState<string | null>(null);

  useEffect(() => {
    if (broadcastMessage && broadcastMessage.id !== lastSeenId) {
      setMessage(broadcastMessage.text);
      setIsVisible(true);
      setLastSeenId(broadcastMessage.id);
    }
  }, [broadcastMessage, lastSeenId]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-emerald-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative max-w-lg w-full herbarium-paper rounded-lg shadow-[0_0_50px_rgba(0,0,0,0.5)] border-4 border-emerald-900 transform scale-100 transition-all">
        
        {/* Header - Botanical Label Style */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-emerald-900 text-emerald-100 px-6 py-2 rounded-md border-2 border-emerald-400 shadow-xl flex items-center gap-2">
            <Info size={18} />
            <span className="font-serif font-bold tracking-widest uppercase text-xs">Aviso do Curador Vandelli</span>
        </div>

        {/* Content */}
        <div className="p-10 text-center">
            <div className="mb-6 opacity-20">
                <Scroll size={48} className="mx-auto text-emerald-900" />
            </div>
            <p className="text-xl text-emerald-950 font-serif leading-relaxed font-bold italic">
                "{message}"
            </p>
        </div>

        {/* Close Button */}
        <div className="bg-emerald-900/10 p-4 flex justify-center border-t border-emerald-900/10">
            <button 
                onClick={() => setIsVisible(false)}
                className="bg-emerald-900 hover:bg-emerald-800 text-white font-bold py-2 px-10 rounded shadow-lg uppercase tracking-widest flex items-center gap-2 transition-transform hover:scale-105"
            >
                <X size={18} /> CIENTE
            </button>
        </div>
      </div>
    </div>
  );
};