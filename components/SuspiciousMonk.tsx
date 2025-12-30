import React, { useState, useEffect } from 'react';

const PEACOCK_PHRASES = [
    "Tenho cem olhos nas minhas penas, e todos viram a sua password...",
    "Essa firewall é tão curta como uma pena de pardal.",
    "A exibir os seus dados assim? Que falta de elegância digital!",
    "A minha cauda detetou um pacote de dados suspeito no jardim.",
    "Cuidado com o brilho excessivo de links desconhecidos.",
    "Um pavão prevenido nunca deixa as suas chaves no canteiro.",
    "O seu tráfego está tão exposto como um pavão sem cauda.",
    "Vi um intruso a tentar bicar o seu sistema!",
    "A elegância da segurança reside na complexidade da criptografia.",
    "Abra o leque das suas defesas, o perigo espreita na estufa.",
];

export const SuspiciousMonk: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState(50);
  const [phrase, setPhrase] = useState("");

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const triggerPeacock = () => {
      setPosition(Math.floor(Math.random() * 70) + 10);
      setPhrase(PEACOCK_PHRASES[Math.floor(Math.random() * PEACOCK_PHRASES.length)]);
      setIsVisible(true);
      setTimeout(() => {
        setIsVisible(false);
        timeoutId = setTimeout(triggerPeacock, Math.random() * 15000 + 15000);
      }, 5000);
    };
    timeoutId = setTimeout(triggerPeacock, 5000);
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div 
      className={`fixed bottom-0 z-30 transition-transform duration-1000 ease-in-out pointer-events-none`}
      style={{ left: `${position}%`, transform: isVisible ? `translateY(0)` : `translateY(100%)` }}
    >
      <div className="relative w-56 flex flex-col items-center">
        {/* Speech Bubble */}
        <div className={`mb-4 herbarium-paper text-emerald-950 p-4 rounded-2xl text-xs font-serif border-2 border-emerald-800 shadow-[0_10px_25px_rgba(0,0,0,0.3)] text-center w-52 transition-all duration-700 transform origin-bottom ${isVisible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-10'}`}>
          <p className="font-bold italic">"{phrase}"</p>
          <div className="absolute -bottom-2 left-1/2 w-4 h-4 herbarium-paper border-b-2 border-r-2 border-emerald-800 transform rotate-45 -translate-x-1/2"></div>
        </div>

        {/* Peacock SVG */}
        <div className={`w-44 h-44 filter drop-shadow-2xl transition-all duration-1000 ${isVisible ? 'peacock-strut scale-110' : 'scale-90'}`}>
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            {/* Tail Feathers (Fan) */}
            <g className={isVisible ? 'animate-fan' : 'opacity-0'}>
              {[...Array(7)].map((_, i) => (
                <g key={i} style={{ transform: `rotate(${(i - 3) * 25}deg)`, transformOrigin: '100px 150px' }}>
                  <path d="M100,150 Q100,50 100,20" stroke="#059669" strokeWidth="8" fill="none" opacity="0.6" />
                  <circle cx="100" cy="30" r="10" fill="#064e3b" stroke="#fbbf24" strokeWidth="2" />
                  <circle cx="100" cy="30" r="4" fill="#60a5fa" />
                </g>
              ))}
            </g>
            
            {/* Peacock Body */}
            <path d="M85,160 Q100,180 115,160 L110,100 Q110,60 100,50 Q90,60 90,100 Z" fill="#1e40af" />
            
            {/* Head & Neck */}
            <circle cx="100" cy="55" r="18" fill="#1e40af" />
            <path d="M98,40 L102,40 L100,30 Z" fill="#fbbf24" /> {/* Crest */}
            
            {/* Eyes */}
            <circle cx="93" cy="52" r="3" fill="white" />
            <circle cx="107" cy="52" r="3" fill="white" />
            <circle cx="93" cy="52" r="1.5" fill="black" />
            <circle cx="107" cy="52" r="1.5" fill="black" />
            
            {/* Beak */}
            <path d="M95,62 L105,62 L100,75 Z" fill="#fbbf24" />
          </svg>
        </div>
      </div>
      <style>{`
        .peacock-strut { animation: strut 3s ease-in-out infinite; }
        @keyframes strut { 
          0%, 100% { transform: translateY(0) rotate(0); } 
          50% { transform: translateY(-5px) rotate(2deg); } 
        }
        .animate-fan { 
          animation: fan-out 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; 
        }
        @keyframes fan-out {
          from { transform: scale(0.2) translateY(50px); opacity: 0; }
          to { transform: scale(1) translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};