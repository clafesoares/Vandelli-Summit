import React, { useState, useEffect } from 'react';
import { useEvent } from '../context/EventContext';
import { generateMonasteryWisdom } from '../services/geminiService';
import { SecurityTip, User } from '../types';
import { STANDS_LIST } from '../constants';
import { QRCodeSVG } from 'qrcode.react';
import { Scroll, MapPin, Calendar, Clock, Ticket, Trophy, QrCode, X, CheckCircle, Leaf, Trees, AlertTriangle, RotateCw } from 'lucide-react';

type ViewState = 'landing' | 'register' | 'login' | 'dashboard';

export const Registration: React.FC = () => {
  const { registerUser, users, sponsors, visitStand, eventImage } = useEvent();
  const [view, setView] = useState<ViewState>('landing');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '' });
  const [loginEmail, setLoginEmail] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [wisdom, setWisdom] = useState<SecurityTip | null>(null);
  const [loading, setLoading] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'pass' | 'info' | 'challenge'>('pass');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [showScanner, setShowScanner] = useState(false);
  const [scanInput, setScanInput] = useState('');

  const [showApprovedModal, setShowApprovedModal] = useState(false);
  const [previousStatus, setPreviousStatus] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
        const updatedUser = users.find(u => u.id === currentUser.id);
        if (updatedUser) {
            if (previousStatus === 'pending' && updatedUser.status === 'approved') {
                setShowApprovedModal(true);
            }
            setCurrentUser(updatedUser);
            setPreviousStatus(updatedUser.status);
        }
    }
  }, [users, currentUser?.id, previousStatus]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const existing = users.find(u => u.email.toLowerCase() === formData.email.toLowerCase());
    if (existing) {
        setLoading(false);
        setErrorMsg("Este email já está no nosso Herbário. Por favor faça login.");
        return;
    }

    try {
        const result = await registerUser(formData.name, formData.email, formData.phone, formData.company);
        if (result.success && result.user) {
            setCurrentUser(result.user);
            setPreviousStatus(result.user.status);
            const tip = await generateMonasteryWisdom();
            setWisdom(tip);
            setView('dashboard');
        } else {
            setErrorMsg(result.error || "Erro ao semear o seu registo. Tente novamente.");
        }
    } catch (err: any) {
        setErrorMsg("Ocorreu um erro inesperado no jardim. Verifique a sua ligação.");
    } finally {
        setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
      e.preventDefault();
      const user = users.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
      if (user) {
          setCurrentUser(user);
          setPreviousStatus(user.status);
          setView('dashboard');
          setErrorMsg('');
      } else {
          setErrorMsg("Email não encontrado no catálogo botânico.");
      }
  };

  const handleScanSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!currentUser) return;
      const stand = STANDS_LIST.find(s => s.id === scanInput.toUpperCase().trim());
      if (stand) {
          visitStand(currentUser.id, stand.id);
          alert(`Espécie coletada: ${stand.name}!`);
          setShowScanner(false);
          setScanInput('');
      } else {
          alert("Código de Espécime inválido.");
      }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 flex flex-col items-center min-h-[600px]">
        
        {/* APPROVAL NOTIFICATION MODAL */}
        {showApprovedModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                <div className="relative max-w-md w-full herbarium-paper rounded-lg shadow-2xl border-4 border-emerald-700 p-8 text-center">
                    <div className="flex justify-center mb-4">
                        <CheckCircle size={64} className="text-emerald-700 animate-bounce" />
                    </div>
                    <h3 className="text-2xl font-bold text-emerald-900 mb-2 display-font">
                        Acesso Concedido!
                    </h3>
                    <p className="text-gray-800 mb-6 font-serif">
                        O Curador do Jardim aprovou a sua entrada. Explore o Herbário Digital e as maravilhas da Estufa Vandelli.
                    </p>
                    <button 
                        onClick={() => setShowApprovedModal(false)}
                        className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded shadow-lg uppercase tracking-widest"
                    >
                        Entrar no Jardim
                    </button>
                </div>
            </div>
        )}
        
        {/* LANDING VIEW */}
        {view === 'landing' && (
            <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in py-10">
                <div className="text-center max-w-2xl px-4">
                    <h2 className="text-4xl md:text-5xl font-bold text-emerald-200 mb-6 display-font gold-text drop-shadow-lg">Bem-vindo ao Jardim</h2>
                    <p className="text-xl text-emerald-100 mb-8 font-serif leading-relaxed">
                        No coração da Ajuda, onde a ciência encontra a natureza. 
                        Registe a sua presença no summit de cibersegurança mais orgânico do ano.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-6">
                    <button 
                        onClick={() => setView('register')}
                        className="px-8 py-4 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-lg rounded-lg border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:scale-105 uppercase tracking-widest"
                    >
                        Novo Registo
                    </button>
                    <button 
                        onClick={() => setView('login')}
                        className="px-8 py-4 bg-white/10 hover:bg-white/20 text-emerald-100 font-bold text-lg rounded-lg border-2 border-emerald-500/50 shadow-lg backdrop-blur-md transition-all transform hover:scale-105 uppercase tracking-widest"
                    >
                        O Meu Passe
                    </button>
                </div>
            </div>
        )}

        {/* REGISTER VIEW */}
        {view === 'register' && (
            <div className="max-w-md w-full mx-auto herbarium-paper p-10 rounded-lg shadow-2xl relative overflow-hidden border-2 border-emerald-900/20">
                <button onClick={() => setView('landing')} className="absolute top-4 left-4 text-emerald-800 hover:text-black font-bold z-10">← Sair</button>
                
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                    <Leaf size={128} className="text-emerald-900 transform -rotate-45" />
                </div>

                <h2 className="text-3xl font-bold text-center text-emerald-900 mb-8 display-font tracking-wider">Entrar no Herbário</h2>
                
                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block text-emerald-800 font-bold mb-1 uppercase text-xs tracking-widest">Nome do Visitante</label>
                        <input required type="text" className="w-full bg-transparent border-b-2 border-emerald-900/30 p-2 text-emerald-950 focus:outline-none focus:border-emerald-700" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-emerald-800 font-bold mb-1 uppercase text-xs tracking-widest">Instituição/Empresa</label>
                        <input required type="text" className="w-full bg-transparent border-b-2 border-emerald-900/30 p-2 text-emerald-950 focus:outline-none focus:border-emerald-700" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-emerald-800 font-bold mb-1 uppercase text-xs tracking-widest">Email</label>
                        <input required type="email" className="w-full bg-transparent border-b-2 border-emerald-900/30 p-2 text-emerald-950 focus:outline-none focus:border-emerald-700" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-emerald-800 font-bold mb-1 uppercase text-xs tracking-widest">Telefone</label>
                        <input required type="tel" className="w-full bg-transparent border-b-2 border-emerald-900/30 p-2 text-emerald-950 focus:outline-none focus:border-emerald-700" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    
                    {errorMsg && (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex flex-col gap-2 items-center animate-shake">
                        <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                          <AlertTriangle size={18} />
                          <span>Erro no Registo</span>
                        </div>
                        <p className="text-red-600 text-xs text-center leading-relaxed font-serif">{errorMsg}</p>
                        {errorMsg.includes('rede') && (
                          <button 
                            type="button"
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-1 text-[10px] text-red-800 underline uppercase tracking-widest font-bold"
                          >
                            <RotateCw size={10} /> Recarregar Jardim
                          </button>
                        )}
                      </div>
                    )}

                    <button type="submit" disabled={loading} className="w-full bg-emerald-900 text-white font-bold py-4 mt-8 hover:bg-emerald-800 transition shadow-lg uppercase tracking-widest border border-emerald-950 flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <RotateCw size={18} className="animate-spin" />
                            <span>A Semear...</span>
                          </>
                        ) : "Confirmar Registo"}
                    </button>
                </form>
            </div>
        )}

        {/* LOGIN VIEW */}
        {view === 'login' && (
            <div className="max-w-md w-full mx-auto herbarium-paper p-10 rounded-lg shadow-2xl relative border-2 border-emerald-900/20">
                <button onClick={() => setView('landing')} className="absolute top-4 left-4 text-emerald-800 hover:text-black font-bold">← Voltar</button>
                <h2 className="text-3xl font-bold text-center text-emerald-900 mb-8 display-font">Identificação</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-emerald-800 font-bold mb-1 uppercase text-xs tracking-widest">Email do Visitante</label>
                        <input required type="email" className="w-full bg-transparent border-b-2 border-emerald-900/30 p-2 text-emerald-950 focus:outline-none focus:border-emerald-700" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                    </div>
                    {errorMsg && <p className="text-red-700 text-sm font-bold text-center">{errorMsg}</p>}
                    <button type="submit" className="w-full bg-emerald-900 text-white font-bold py-3 mt-4 hover:bg-emerald-800 transition shadow-lg uppercase tracking-widest">
                        Entrar no Jardim
                    </button>
                </form>
            </div>
        )}

        {/* DASHBOARD VIEW */}
        {view === 'dashboard' && currentUser && (
             currentUser.status === 'pending' ? (
                <div className="max-w-lg w-full mx-auto herbarium-paper p-8 rounded-lg text-center border-4 border-emerald-800/30">
                    <div className="flex justify-center mb-6">
                        <Trees size={64} className="text-emerald-800 animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-bold text-emerald-900 mb-4 display-font">Registo em Germinação</h2>
                    <p className="text-emerald-950 text-lg mb-6">
                        O Curador do Jardim Vandelli está a validar os seus dados. <br/>
                        Em breve receberá autorização para entrar.
                    </p>
                    <p className="text-sm text-emerald-700 italic border-t border-emerald-900/20 pt-4">
                        Por favor aguarde um momento sob a sombra das nossas árvores.
                    </p>
                    <button onClick={() => setView('landing')} className="mt-8 text-emerald-900 font-bold underline">Voltar ao Portão</button>
                </div>
             ) : (
                <div className="max-w-4xl w-full mx-auto bg-white/10 backdrop-blur-xl rounded-xl border border-emerald-500/30 overflow-hidden shadow-2xl relative">
                    
                    {/* Scanner Modal */}
                    {showScanner && (
                        <div className="absolute inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in">
                            <div className="w-full max-w-sm border-2 border-emerald-500 rounded-lg p-6 bg-emerald-950 relative">
                                <button onClick={() => setShowScanner(false)} className="absolute top-2 right-2 text-emerald-400 hover:text-white"><X /></button>
                                <div className="text-center mb-6">
                                    <QrCode size={64} className="mx-auto text-emerald-400 mb-4 animate-pulse" />
                                    <h3 className="text-xl font-bold text-white mb-2">Identificador de Espécimes</h3>
                                    <p className="text-emerald-400 text-sm">Escaneie o QR Code no canteiro (Stand)</p>
                                </div>
                                <form onSubmit={handleScanSubmit} className="space-y-4">
                                    <input autoFocus type="text" className="w-full bg-black/50 border border-emerald-700 p-3 text-center text-emerald-100 font-mono uppercase tracking-widest text-lg focus:outline-none focus:border-emerald-400" placeholder="CÓDIGO" value={scanInput} onChange={e => setScanInput(e.target.value)} />
                                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded">COLETAR</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="bg-emerald-900/90 p-6 flex flex-col md:flex-row justify-between items-center border-b-2 border-emerald-500/50">
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-bold text-emerald-100 display-font">Bem-vindo, {currentUser?.name}</h2>
                            <p className="text-emerald-300 text-sm font-serif italic">{currentUser?.company}</p>
                        </div>
                        <button onClick={() => { setCurrentUser(null); setView('landing'); }} className="px-4 py-2 border border-emerald-400 text-emerald-200 rounded hover:bg-emerald-800 text-sm mt-4 md:mt-0 transition">Sair</button>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-black/20 border-b border-emerald-900/30 overflow-x-auto">
                        <button onClick={() => setDashboardTab('pass')} className={`flex-1 py-4 flex items-center justify-center font-bold uppercase tracking-wider transition-colors text-sm ${dashboardTab === 'pass' ? 'bg-emerald-600/30 text-emerald-300 border-b-4 border-emerald-400' : 'text-emerald-700 hover:text-emerald-300'}`}>
                            <Ticket className="mr-2" size={18} /> Passe
                        </button>
                        <button onClick={() => setDashboardTab('info')} className={`flex-1 py-4 flex items-center justify-center font-bold uppercase tracking-wider transition-colors text-sm ${dashboardTab === 'info' ? 'bg-emerald-600/30 text-emerald-300 border-b-4 border-emerald-400' : 'text-emerald-700 hover:text-emerald-300'}`}>
                            <Scroll className="mr-2" size={18} /> Programa
                        </button>
                        <button onClick={() => setDashboardTab('challenge')} className={`flex-1 py-4 flex items-center justify-center font-bold uppercase tracking-wider transition-colors text-sm ${dashboardTab === 'challenge' ? 'bg-emerald-600/30 text-emerald-300 border-b-4 border-emerald-400' : 'text-emerald-700 hover:text-emerald-300'}`}>
                            <Trophy className="mr-2" size={18} /> Herbário
                        </button>
                    </div>

                    <div className="p-8 min-h-[400px]">
                        {dashboardTab === 'pass' && (
                            <div className="flex flex-col items-center animate-fade-in">
                                <div className="herbarium-paper p-8 rounded shadow-2xl max-w-sm w-full text-center border-4 border-emerald-900/10">
                                    <h3 className="text-2xl text-emerald-900 font-bold mb-6 display-font">Passe de Visitante</h3>
                                    <div className="bg-white p-3 border-4 border-double border-emerald-900 inline-block mb-6 shadow-md">
                                        <QRCodeSVG value={currentUser?.id || ""} size={160} />
                                    </div>
                                    <div className="bg-emerald-900/10 p-4 rounded border border-emerald-900/5 mb-6">
                                        <h4 className="text-emerald-900 font-bold uppercase text-xs mb-2">Números de Sorteio</h4>
                                        <div className="flex justify-center gap-2">
                                            {currentUser?.ticketNumbers.map(num => (
                                                <span key={num} className="w-10 h-10 flex items-center justify-center bg-emerald-800 text-white rounded-full font-bold shadow-md">
                                                    {num}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {wisdom && (
                                        <div className="mt-4 pt-4 border-t border-emerald-900/10">
                                            <p className="font-serif italic text-emerald-900 text-sm">"{wisdom.title}"</p>
                                            <p className="text-xs text-emerald-700 mt-1">{wisdom.content}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {dashboardTab === 'info' && (
                            <div className="grid md:grid-cols-2 gap-8 animate-fade-in text-emerald-50">
                                <div className="space-y-6">
                                    <div className="bg-emerald-900/40 p-6 rounded-lg border border-emerald-500/20 backdrop-blur-md">
                                        <h3 className="text-xl text-emerald-300 mb-4 flex items-center font-bold">
                                            <MapPin className="mr-2" /> Onde Cultivamos
                                        </h3>
                                        <p className="text-lg font-serif">Jardim Botânico da Ajuda</p>
                                        <p className="text-emerald-400 text-sm">Calçada da Ajuda, 1300-006 Lisboa</p>
                                        
                                        {/* EVENT IMAGE - Neoclassical Frame */}
                                        <div className="mt-4 h-64 w-full rounded-lg overflow-hidden border-2 border-emerald-600/50 relative shadow-inner bg-black/40 flex items-center justify-center greenhouse-border">
                                            {eventImage ? (
                                                <img src={eventImage} alt="Localização" className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="w-full h-full relative">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Jardim_Bot%C3%A2nico_da_Ajuda_-_Lisboa.jpg/1280px-Jardim_Bot%C3%A2nico_da_Ajuda_-_Lisboa.jpg" alt="Vandelli Garden" className="w-full h-full object-cover opacity-60" />
                                                    <div className="absolute inset-0 flex items-center justify-center flex-col p-4 text-center">
                                                        <span className="text-emerald-200 font-cinzel text-lg font-bold uppercase tracking-widest drop-shadow-lg">ESTUFA REAL</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-emerald-900/40 p-6 rounded-lg border border-emerald-500/20">
                                        <h3 className="text-xl text-emerald-300 mb-2 flex items-center font-bold">
                                            <Calendar className="mr-2" /> Temporada
                                        </h3>
                                        <p className="text-lg font-serif">10 de Fevereiro, 2026</p>
                                        <p className="text-emerald-400">09:00H - 22:00H</p>
                                    </div>
                                </div>

                                <div className="bg-black/20 p-6 rounded-lg border border-emerald-500/20 h-full overflow-y-auto max-h-[500px] hide-scrollbar backdrop-blur-sm">
                                    <h3 className="text-xl text-emerald-300 mb-6 flex items-center font-bold sticky top-0 bg-emerald-950/80 py-2 z-10">
                                        <Scroll className="mr-2" /> Ordem dos Trabalhos
                                    </h3>
                                    <ul className="space-y-6 relative border-l-2 border-emerald-800 ml-3 pl-6">
                                        {[
                                            { time: "09:00", title: "Entrada e Herbário", desc: "Check-in" },
                                            { time: "10:00", title: "Abertura Oficial", desc: "Direção Vandelli" },
                                            { time: "11:30", title: "Pausa para Chá", desc: "Coffee Break" },
                                            { time: "13:00", title: "Almoço na Estufa", desc: "Catering Gourmet" },
                                            { time: "16:00", title: "Sorteio de Espécimes", desc: "Roda da Sorte" },
                                            { time: "18:00", title: "Cocktail no Miradouro", desc: "Vista Tejo" },
                                        ].map((item, idx) => (
                                            <li key={idx} className="relative">
                                                <span className="absolute -left-[31px] top-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-emerald-950"></span>
                                                <span className="text-emerald-400 font-mono text-sm">{item.time}</span>
                                                <h4 className="font-bold text-white">{item.title}</h4>
                                                <p className="text-xs text-emerald-600 italic">{item.desc}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {dashboardTab === 'challenge' && (
                            <div className="flex flex-col items-center animate-fade-in">
                                <div className="text-center mb-8 max-w-2xl">
                                    <h3 className="text-3xl text-emerald-300 display-font mb-4">Coleção do Herbário</h3>
                                    <p className="text-emerald-100">Visite todos os setores do jardim e escaneie as relíquias botânicas para ganhar o prémio final.</p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
                                    {STANDS_LIST.map((stand) => {
                                        const isVisited = currentUser?.visitedStands?.includes(stand.id);
                                        return (
                                            <div key={stand.id} className={`aspect-[3/4] rounded-lg border-2 relative overflow-hidden transition-all duration-500 ${isVisited ? 'border-emerald-500 bg-emerald-900/40 shadow-xl' : 'border-emerald-950 bg-black/40 grayscale opacity-40'}`}>
                                                {isVisited ? (
                                                    <img src={stand.imageUrl} alt={stand.name} className="w-full h-full object-cover p-3" />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-emerald-800"><Trees size={40} /></div>
                                                )}
                                                <div className="absolute bottom-0 inset-x-0 bg-emerald-950/80 py-1 text-center">
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isVisited ? 'text-emerald-200' : 'text-emerald-700'}`}>{stand.name}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button onClick={() => setShowScanner(true)} className="mt-10 flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-4 px-8 rounded-full shadow-2xl transform hover:scale-105 transition-all">
                                    <QrCode size={24} /> LER CÓDIGO BOTÂNICO
                                </button>
                            </div>
                        )}
                    </div>
                </div>
             )
        )}

        {/* SPONSORS SECTION */}
        {(view === 'landing' || view === 'register' || view === 'login') && sponsors.length > 0 && (
            <div className="w-full max-w-5xl mx-auto mt-12 mb-8 animate-fade-in-up">
                <div className="bg-white/10 backdrop-blur-md border-t-2 border-b-2 border-emerald-500/20 p-8 rounded-xl">
                    <h3 className="text-center text-emerald-300 font-serif text-xl mb-8 uppercase tracking-[0.2em]">Mecenas do Jardim</h3>
                    <div className="flex flex-wrap justify-center gap-10">
                        {sponsors.map((sponsor) => (
                            <div key={sponsor.id} className="w-40 h-24 flex items-center justify-center p-3 bg-white/90 rounded-md border border-emerald-400 shadow-lg transform hover:scale-105 transition-transform">
                                <img src={sponsor.logoBase64} alt={sponsor.name} className="max-w-full max-h-full object-contain" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-4px); }
            75% { transform: translateX(4px); }
          }
          .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
        `}</style>
    </div>
  );
};