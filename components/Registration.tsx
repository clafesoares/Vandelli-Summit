
import React, { useState, useEffect } from 'react';
import { useEvent } from '../context/EventContext';
import { generateMonasteryWisdom } from '../services/geminiService';
import { SecurityTip, User } from '../types';
import { STANDS_LIST } from '../constants';
import { QRCodeSVG } from 'qrcode.react';
import { Scroll, MapPin, Calendar, Clock, Ticket, Trophy, QrCode, X, CheckCircle, Leaf, Trees, AlertTriangle, RotateCw, Database } from 'lucide-react';

type ViewState = 'landing' | 'register' | 'login' | 'dashboard';

export const Registration: React.FC = () => {
  const { registerUser, users, sponsors, visitStand, eventImage, isConnected } = useEvent();
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
    if (!isConnected) {
      setErrorMsg("Falha crítica: O Jardim está offline. Verifique a sua ligação ou desative bloqueadores de anúncios.");
      return;
    }
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
            setErrorMsg(result.error || "Erro ao semear o seu registo na base de dados. Tente novamente.");
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
                        className="bg-emerald-800 hover:bg-emerald-700 text-white font-black py-4 px-10 rounded shadow-lg uppercase tracking-widest border border-emerald-950 transition-all hover:scale-105"
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
                    {!isConnected && (
                      <div className="flex items-center justify-center gap-2 text-yellow-500 font-bold text-xs uppercase tracking-widest bg-black/40 py-2 rounded-full border border-yellow-900/50 mb-4">
                        <Database size={14} className="animate-pulse" />
                        <span>A estabelecer ligação à base de dados...</span>
                      </div>
                    )}
                </div>
                <div className="flex flex-col sm:flex-row gap-6">
                    <button 
                        onClick={() => setView('register')}
                        className="px-10 py-5 bg-emerald-800 hover:bg-emerald-700 text-white font-black text-lg rounded-lg border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform hover:scale-105 uppercase tracking-widest"
                    >
                        Novo Registo
                    </button>
                    <button 
                        onClick={() => setView('login')}
                        className="px-10 py-5 bg-white/10 hover:bg-white/20 text-emerald-100 font-black text-lg rounded-lg border-2 border-emerald-500/50 shadow-lg backdrop-blur-md transition-all transform hover:scale-105 uppercase tracking-widest"
                    >
                        O Meu Passe
                    </button>
                </div>
            </div>
        )}

        {/* REGISTER VIEW */}
        {view === 'register' && (
            <div className="max-w-md w-full mx-auto herbarium-paper p-10 rounded-lg shadow-2xl relative overflow-hidden border-2 border-emerald-900/20 animate-fade-in">
                <button onClick={() => setView('landing')} className="absolute top-4 left-4 text-emerald-800 hover:text-black font-bold z-10">← Sair</button>
                
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
                    <Leaf size={128} className="text-emerald-900 transform -rotate-45" />
                </div>

                <h2 className="text-3xl font-bold text-center text-emerald-900 mb-8 display-font tracking-wider">Entrar no Herbário</h2>
                
                <form onSubmit={handleRegister} className="space-y-6">
                    <div>
                        <label className="block text-emerald-800 font-bold mb-1 uppercase text-xs tracking-widest">Nome do Visitante</label>
                        <input required type="text" className="w-full bg-transparent border-b-2 border-emerald-900/30 p-3 text-emerald-950 focus:outline-none focus:border-emerald-700 font-medium" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-emerald-800 font-bold mb-1 uppercase text-xs tracking-widest">Instituição/Empresa</label>
                        <input required type="text" className="w-full bg-transparent border-b-2 border-emerald-900/30 p-3 text-emerald-950 focus:outline-none focus:border-emerald-700 font-medium" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-emerald-800 font-bold mb-1 uppercase text-xs tracking-widest">Email</label>
                        <input required type="email" className="w-full bg-transparent border-b-2 border-emerald-900/30 p-3 text-emerald-950 focus:outline-none focus:border-emerald-700 font-medium" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-emerald-800 font-bold mb-1 uppercase text-xs tracking-widest">Telefone</label>
                        <input required type="tel" className="w-full bg-transparent border-b-2 border-emerald-900/30 p-3 text-emerald-950 focus:outline-none focus:border-emerald-700 font-medium" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    
                    {errorMsg && (
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg flex flex-col gap-2 items-center animate-shake shadow-inner">
                        <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                          <AlertTriangle size={18} />
                          <span>Erro no Registo</span>
                        </div>
                        <p className="text-red-600 text-xs text-center leading-relaxed font-serif">{errorMsg}</p>
                        {errorMsg.includes('base') || errorMsg.includes('rede') ? (
                          <button 
                            type="button"
                            onClick={() => window.location.reload()}
                            className="flex items-center gap-1 text-[10px] text-red-800 underline uppercase tracking-widest font-black mt-2"
                          >
                            <RotateCw size={10} /> Recarregar Jardim
                          </button>
                        ) : null}
                      </div>
                    )}

                    <button type="submit" disabled={loading} className="group relative w-full bg-emerald-900 text-white font-black py-5 mt-8 hover:bg-emerald-800 transition-all shadow-xl uppercase tracking-widest border border-emerald-950 flex items-center justify-center gap-2 overflow-hidden">
                        <div className="absolute inset-0 bg-emerald-400/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                        {loading ? (
                          <>
                            <RotateCw size={20} className="animate-spin" />
                            <span>A Semear...</span>
                          </>
                        ) : "Confirmar Registo"}
                    </button>
                </form>
            </div>
        )}

        {/* LOGIN VIEW */}
        {view === 'login' && (
            <div className="max-w-md w-full mx-auto herbarium-paper p-10 rounded-lg shadow-2xl relative border-2 border-emerald-900/20 animate-fade-in">
                <button onClick={() => setView('landing')} className="absolute top-4 left-4 text-emerald-800 hover:text-black font-bold">← Voltar</button>
                <h2 className="text-3xl font-bold text-center text-emerald-900 mb-8 display-font">Identificação</h2>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-emerald-800 font-bold mb-1 uppercase text-xs tracking-widest">Email do Visitante</label>
                        <input required type="email" className="w-full bg-transparent border-b-2 border-emerald-900/30 p-3 text-emerald-950 focus:outline-none focus:border-emerald-700 font-medium" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                    </div>
                    {errorMsg && <p className="text-red-700 text-sm font-bold text-center">{errorMsg}</p>}
                    <button type="submit" className="w-full bg-emerald-900 text-white font-black py-4 mt-4 hover:bg-emerald-800 transition shadow-xl uppercase tracking-widest border border-emerald-950">
                        Entrar no Jardim
                    </button>
                </form>
            </div>
        )}

        {/* DASHBOARD VIEW */}
        {view === 'dashboard' && currentUser && (
             currentUser.status === 'pending' ? (
                <div className="max-w-lg w-full mx-auto herbarium-paper p-10 rounded-lg text-center border-4 border-emerald-800/30 shadow-2xl animate-fade-in">
                    <div className="flex justify-center mb-8">
                        <Trees size={72} className="text-emerald-800 animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-bold text-emerald-900 mb-4 display-font">Registo em Germinação</h2>
                    <p className="text-emerald-950 text-lg mb-8 font-serif leading-relaxed">
                        O Curador do Jardim Vandelli está a validar o seu acesso através da base de dados segura. <br/>
                        Aguarde a aprovação da Direção.
                    </p>
                    <div className="bg-emerald-900/10 p-5 rounded-lg border border-emerald-900/20 mb-8">
                      <p className="text-xs text-emerald-800 font-bold uppercase tracking-widest mb-1">Status de Ligação</p>
                      <div className="flex items-center justify-center gap-2">
                         <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
                         <span className="text-[10px] font-mono">{isConnected ? 'ENCRYPTED SYNC ACTIVE' : 'DATABASE OFFLINE'}</span>
                      </div>
                    </div>
                    <button onClick={() => setView('landing')} className="text-emerald-900 font-bold underline uppercase text-xs tracking-widest hover:text-emerald-700">Voltar ao Portão</button>
                </div>
             ) : (
                <div className="max-w-4xl w-full mx-auto bg-white/10 backdrop-blur-xl rounded-2xl border border-emerald-500/30 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative animate-fade-in">
                    
                    {/* Scanner Modal */}
                    {showScanner && (
                        <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in backdrop-blur-md">
                            <div className="w-full max-w-sm border-2 border-emerald-500 rounded-2xl p-8 bg-emerald-950 shadow-[0_0_50px_rgba(16,185,129,0.2)] relative">
                                <button onClick={() => setShowScanner(false)} className="absolute top-4 right-4 text-emerald-400 hover:text-white transition-colors"><X /></button>
                                <div className="text-center mb-8">
                                    <QrCode size={72} className="mx-auto text-emerald-400 mb-4 animate-pulse" />
                                    <h3 className="text-2xl font-bold text-white mb-2 display-font">Scanner Botânico</h3>
                                    <p className="text-emerald-400 text-sm font-serif">Aproxime o código do espécime para validação.</p>
                                </div>
                                <form onSubmit={handleScanSubmit} className="space-y-6">
                                    <input autoFocus type="text" className="w-full bg-black/50 border-2 border-emerald-700 p-4 rounded-lg text-center text-emerald-100 font-mono uppercase tracking-[0.3em] text-xl focus:outline-none focus:border-emerald-400 shadow-inner" placeholder="ID-STAND" value={scanInput} onChange={e => setScanInput(e.target.value)} />
                                    <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-lg shadow-xl uppercase tracking-widest transition-all">COLETAR RELÍQUIA</button>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="bg-emerald-900/90 p-8 flex flex-col md:flex-row justify-between items-center border-b border-emerald-500/30">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold text-emerald-100 display-font gold-text">Bem-vindo, {currentUser?.name}</h2>
                            <p className="text-emerald-400 text-sm font-serif italic tracking-wide">{currentUser?.company}</p>
                        </div>
                        <button onClick={() => { setCurrentUser(null); setView('landing'); }} className="px-6 py-2 border-2 border-emerald-500/50 text-emerald-100 rounded-full hover:bg-emerald-800 hover:border-emerald-400 text-xs font-black uppercase tracking-widest mt-6 md:mt-0 transition-all">Sair do Jardim</button>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-black/30 border-b border-emerald-900/30 overflow-x-auto">
                        <button onClick={() => setDashboardTab('pass')} className={`flex-1 py-5 flex items-center justify-center font-black uppercase tracking-widest transition-all text-xs ${dashboardTab === 'pass' ? 'bg-emerald-600/30 text-emerald-300 border-b-4 border-emerald-400' : 'text-emerald-700 hover:text-emerald-300'}`}>
                            <Ticket className="mr-2" size={20} /> O Meu Passe
                        </button>
                        <button onClick={() => setDashboardTab('info')} className={`flex-1 py-5 flex items-center justify-center font-black uppercase tracking-widest transition-all text-xs ${dashboardTab === 'info' ? 'bg-emerald-600/30 text-emerald-300 border-b-4 border-emerald-400' : 'text-emerald-700 hover:text-emerald-300'}`}>
                            <Scroll className="mr-2" size={20} /> Programa
                        </button>
                        <button onClick={() => setDashboardTab('challenge')} className={`flex-1 py-5 flex items-center justify-center font-black uppercase tracking-widest transition-all text-xs ${dashboardTab === 'challenge' ? 'bg-emerald-600/30 text-emerald-300 border-b-4 border-emerald-400' : 'text-emerald-700 hover:text-emerald-300'}`}>
                            <Trophy className="mr-2" size={20} /> Coleção
                        </button>
                    </div>

                    <div className="p-8 min-h-[450px]">
                        {dashboardTab === 'pass' && (
                            <div className="flex flex-col items-center animate-fade-in">
                                <div className="herbarium-paper p-10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.3)] max-w-sm w-full text-center border border-emerald-900/20">
                                    <h3 className="text-2xl text-emerald-900 font-bold mb-8 display-font tracking-wide">Passe Vandelli</h3>
                                    <div className="bg-white p-4 border-4 border-double border-emerald-900 inline-block mb-8 shadow-xl rounded">
                                        <QRCodeSVG value={currentUser?.id || ""} size={180} />
                                    </div>
                                    <div className="bg-emerald-900/5 p-5 rounded-xl border border-emerald-900/10 mb-8">
                                        <h4 className="text-emerald-900 font-black uppercase text-[10px] tracking-[0.3em] mb-3">Números de Sorteio</h4>
                                        <div className="flex justify-center gap-3">
                                            {currentUser?.ticketNumbers.map(num => (
                                                <span key={num} className="w-12 h-12 flex items-center justify-center bg-emerald-900 text-emerald-100 rounded-full font-black shadow-lg border-2 border-emerald-700 text-lg">
                                                    {num}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {wisdom && (
                                        <div className="mt-4 pt-6 border-t border-emerald-900/10">
                                            <p className="font-serif italic text-emerald-900 text-sm leading-relaxed">"{wisdom.title}"</p>
                                            <p className="text-[10px] text-emerald-700 mt-2 font-bold uppercase tracking-widest">{wisdom.content}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {dashboardTab === 'info' && (
                            <div className="grid md:grid-cols-2 gap-8 animate-fade-in text-emerald-50">
                                <div className="space-y-8">
                                    <div className="bg-emerald-900/40 p-8 rounded-2xl border border-emerald-500/20 backdrop-blur-md shadow-inner">
                                        <h3 className="text-xl text-emerald-300 mb-6 flex items-center font-black uppercase tracking-widest">
                                            <MapPin className="mr-3" /> Localização
                                        </h3>
                                        <p className="text-lg font-serif mb-1">Jardim Botânico da Ajuda</p>
                                        <p className="text-emerald-400 text-xs uppercase tracking-widest mb-6 font-bold">Calçada da Ajuda, 1300-006 Lisboa</p>
                                        
                                        <div className="mt-4 h-64 w-full rounded-xl overflow-hidden border-2 border-emerald-600/50 relative shadow-2xl bg-black/40 flex items-center justify-center greenhouse-border">
                                            {eventImage ? (
                                                <img src={eventImage} alt="Localização" className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="w-full h-full relative">
                                                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Jardim_Bot%C3%A2nico_da_Ajuda_-_Lisboa.jpg/1280px-Jardim_Bot%C3%A2nico_da_Ajuda_-_Lisboa.jpg" alt="Vandelli Garden" className="w-full h-full object-cover opacity-60" />
                                                    <div className="absolute inset-0 flex items-center justify-center flex-col p-4 text-center">
                                                        <span className="text-emerald-200 font-cinzel text-xl font-bold uppercase tracking-[0.2em] drop-shadow-2xl">ESTUFA REAL</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-emerald-900/40 p-8 rounded-2xl border border-emerald-500/20 shadow-inner">
                                        <h3 className="text-xl text-emerald-300 mb-4 flex items-center font-black uppercase tracking-widest">
                                            <Calendar className="mr-3" /> Temporada
                                        </h3>
                                        <p className="text-2xl font-serif">10 de Fevereiro, 2026</p>
                                        <p className="text-emerald-400 font-bold uppercase tracking-[0.2em] text-sm">09:00H - 22:00H</p>
                                    </div>
                                </div>

                                <div className="bg-black/20 p-8 rounded-2xl border border-emerald-500/20 h-full overflow-y-auto max-h-[550px] hide-scrollbar backdrop-blur-sm shadow-inner">
                                    <h3 className="text-xl text-emerald-300 mb-8 flex items-center font-black uppercase tracking-widest sticky top-0 bg-emerald-950/90 py-4 z-10 border-b border-emerald-800/50">
                                        <Scroll className="mr-3" /> Ordem dos Trabalhos
                                    </h3>
                                    <ul className="space-y-8 relative border-l-2 border-emerald-800 ml-4 pl-8">
                                        {[
                                            { time: "09:00", title: "Abertura do Herbário", desc: "Check-in & Networking Digital" },
                                            { time: "10:30", title: "Palestra: Raízes Fortes", desc: "Infraestruturas Críticas" },
                                            { time: "12:00", title: "Cocktail Botânico", desc: "Degustação de Chás Vandelli" },
                                            { time: "13:30", title: "Almoço na Estufa", desc: "Catering Gourmet Bio" },
                                            { time: "16:00", title: "Sorteio das Relíquias", desc: "O Grande Momento da Roda" },
                                            { time: "18:00", title: "Sunset Cibersegurança", desc: "Vista Panorâmica Tejo" },
                                            { time: "21:00", title: "Encerramento", desc: "Protocolo de Segurança" },
                                        ].map((item, idx) => (
                                            <li key={idx} className="relative group">
                                                <span className="absolute -left-[41px] top-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-emerald-950 group-hover:scale-125 transition-transform duration-300 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                                                <span className="text-emerald-400 font-mono text-sm font-bold tracking-tighter">{item.time}</span>
                                                <h4 className="font-black text-white text-lg display-font group-hover:text-emerald-200 transition-colors">{item.title}</h4>
                                                <p className="text-xs text-emerald-600 italic font-serif mt-1">{item.desc}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {dashboardTab === 'challenge' && (
                            <div className="flex flex-col items-center animate-fade-in">
                                <div className="text-center mb-10 max-w-2xl">
                                    <h3 className="text-3xl text-emerald-200 display-font mb-4 gold-text">Herbário Digital</h3>
                                    <p className="text-emerald-100 font-serif leading-relaxed">Visite todos os setores do jardim e escaneie as relíquias para desbloquear a sua participação no sorteio final.</p>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 w-full">
                                    {STANDS_LIST.map((stand) => {
                                        const isVisited = currentUser?.visitedStands?.includes(stand.id);
                                        return (
                                            <div key={stand.id} className={`aspect-[3/4] rounded-2xl border-2 relative overflow-hidden transition-all duration-700 transform hover:scale-105 ${isVisited ? 'border-emerald-500 bg-emerald-900/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-emerald-950 bg-black/40 grayscale opacity-40'}`}>
                                                {isVisited ? (
                                                    <img src={stand.imageUrl} alt={stand.name} className="w-full h-full object-cover p-4 animate-fade-in" />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center h-full text-emerald-900 gap-2">
                                                      <Trees size={40} className="opacity-30" />
                                                      <span className="text-[8px] font-black uppercase tracking-[0.2em]">{stand.id}</span>
                                                    </div>
                                                )}
                                                <div className="absolute bottom-0 inset-x-0 bg-emerald-950/90 py-2 text-center border-t border-emerald-800/50">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${isVisited ? 'text-emerald-200' : 'text-emerald-800'}`}>{stand.name}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <button onClick={() => setShowScanner(true)} className="group mt-12 flex items-center gap-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-5 px-10 rounded-full shadow-[0_15px_30px_rgba(16,185,129,0.3)] transform hover:scale-105 transition-all uppercase tracking-widest border border-emerald-400">
                                    <QrCode size={28} className="group-hover:rotate-90 transition-transform duration-500" /> 
                                    <span>LER CÓDIGO BOTÂNICO</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
             )
        )}

        {/* SPONSORS SECTION */}
        {(view === 'landing' || view === 'register' || view === 'login') && sponsors.length > 0 && (
            <div className="w-full max-w-5xl mx-auto mt-16 mb-12 animate-fade-in-up">
                <div className="bg-white/5 backdrop-blur-xl border-t-2 border-b-2 border-emerald-500/10 p-10 rounded-3xl shadow-2xl">
                    <h3 className="text-center text-emerald-400 font-cinzel text-xl mb-10 uppercase tracking-[0.4em] font-bold">Mecenas do Jardim</h3>
                    <div className="flex flex-wrap justify-center gap-12">
                        {sponsors.map((sponsor) => (
                            <div key={sponsor.id} className="w-44 h-28 flex items-center justify-center p-4 bg-white/95 rounded-xl border-2 border-emerald-500/20 shadow-xl transform hover:scale-110 hover:-rotate-2 transition-all">
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
            25% { transform: translateX(-6px); }
            75% { transform: translateX(6px); }
          }
          .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
          .gold-text {
            background: linear-gradient(to bottom, #fde68a 0%, #d97706 50%, #fde68a 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
        `}</style>
    </div>
  );
};
