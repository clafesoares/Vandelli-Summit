
import React, { useState, useRef } from 'react';
import { useEvent } from '../context/EventContext';
import { AppState } from '../types';
import { Download, Upload, ShieldAlert, CheckCircle, Users, Trophy, Trash2, RotateCcw, ImagePlus, XCircle, Clock, Check, UserCog, Lock, LogOut, LayoutTemplate, MessageSquare, Send, Trees, Activity, Database, Zap } from 'lucide-react';
import { AdminLogin } from './AdminLogin';

export const AdminPanel: React.FC = () => {
  const { 
    users, checkInUser, approveUser, deleteUser, exportUsersToExcel, importUsersFromExcel, 
    appState, setAppState, lotteryState, setLotteryState, 
    sponsors, addSponsor, removeSponsor,
    isAuthenticated, isConnected, logoutAdmin, updateAdminPassword,
    eventImage, uploadEventImage, removeEventImage,
    sendBroadcastMessage
  } = useEvent();

  const [activeTab, setActiveTab] = useState<'users' | 'accreditation' | 'controls' | 'sponsors' | 'event' | 'profile'>('users');
  const [scanId, setScanId] = useState('');
  const [accreditationMsg, setAccreditationMsg] = useState('');
  const [broadcastText, setBroadcastText] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sponsorInputRef = useRef<HTMLInputElement>(null);
  const eventImageInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthenticated) return <AdminLogin />;

  const handleCheckIn = () => {
    const success = checkInUser(scanId);
    if (success) {
      setAccreditationMsg(`Entrada registada para ${scanId.substring(0,8)}.`);
      setScanId('');
    } else {
      setAccreditationMsg("Erro: Identificador não encontrado no herbário.");
    }
  };

  const handleSendBroadcast = async () => {
      if (!broadcastText.trim()) return;
      if (window.confirm("Esta notificação será enviada para TODOS os visitantes. Confirmar?")) {
          await sendBroadcastMessage(broadcastText);
          setBroadcastText('');
          alert("Mensagem enviada com sucesso.");
      }
  };

  const startLottery = (drawNum: 1 | 2 | 3) => {
    const eligibleTickets = users.filter(u => u.status === 'approved').flatMap(u => u.ticketNumbers);
    if (eligibleTickets.length === 0) return alert("Sem visitantes aprovados.");
    setLotteryState({ ...lotteryState, active: true, currentDraw: drawNum, isSpinning: true, winner: null });
    setTimeout(() => {
        const winner = eligibleTickets[Math.floor(Math.random() * eligibleTickets.length)];
        setLotteryState(prev => ({ ...prev, isSpinning: false, winner, results: { ...prev.results, [drawNum]: winner }}));
    }, 4000);
  };

  const approvedCount = users.filter(u => u.status === 'approved').length;
  const pendingCount = users.filter(u => u.status === 'pending').length;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header & Status Center */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-emerald-800 pb-6 gap-4">
          <div>
            <h2 className="text-4xl text-emerald-400 display-font uppercase tracking-tighter">Direção Vandelli</h2>
            <div className="flex gap-4 mt-2">
               <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-900">
                  <Database size={12} className={isConnected ? "text-emerald-400" : "text-red-500"} />
                  <span>Sync: {isConnected ? "ONLINE" : "OFFLINE"}</span>
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-900">
                  <Activity size={12} className="text-emerald-400 animate-pulse" />
                  <span>Live: {users.length} Participantes</span>
               </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="hidden lg:flex flex-col items-end mr-4">
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest">Network Health</span>
                <div className="flex gap-1">
                    {[1,2,3,4,5].map(i => <div key={i} className={`h-1 w-4 rounded-full ${i < 5 ? 'bg-emerald-500' : 'bg-emerald-900'}`}></div>)}
                </div>
            </div>
            <button onClick={logoutAdmin} className="flex items-center gap-2 text-red-400 hover:text-red-300 border border-red-900 px-4 py-2 rounded hover:bg-red-900/20 transition group">
                <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> Sair
            </button>
          </div>
      </div>

      <div className="flex justify-center flex-wrap gap-2 mb-8">
        {[
            { id: 'users', label: 'Herbário', icon: Users },
            { id: 'accreditation', label: 'Acreditação', icon: CheckCircle },
            { id: 'controls', label: 'Emergência/Sorteio', icon: ShieldAlert },
            { id: 'sponsors', label: 'Mecenas', icon: ImagePlus },
            { id: 'event', label: 'Layout', icon: LayoutTemplate },
            { id: 'profile', label: 'Segurança', icon: UserCog }
        ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-2 rounded-t-lg border-2 flex items-center transition-all ${activeTab === tab.id ? 'bg-emerald-900 border-emerald-500 text-white shadow-[0_-5px_15px_rgba(16,185,129,0.1)]' : 'bg-black/40 border-emerald-900/50 text-emerald-700 hover:text-emerald-300'}`}>
                <tab.icon className="inline mr-2" size={18} /> {tab.label}
            </button>
        ))}
      </div>

      <div className="bg-emerald-950/80 p-8 rounded-lg border border-emerald-800 shadow-2xl min-h-[400px]">
        
        {activeTab === 'users' && (
          <div className="animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h3 className="text-2xl text-emerald-200">Visitantes Registados</h3>
                  <div className="flex gap-4 mt-1">
                     <span className="text-xs text-emerald-500 uppercase font-bold tracking-widest">{approvedCount} Aprovados</span>
                     <span className="text-xs text-yellow-600 uppercase font-bold tracking-widest">{pendingCount} Pendentes</span>
                  </div>
                </div>
                <div className="flex gap-2">
                    <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={(e) => importUsersFromExcel(e.target.files![0])} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded transition flex items-center shadow-lg"><Upload size={18} className="mr-2" /> Importar</button>
                    <button onClick={exportUsersToExcel} className="bg-emerald-900 border border-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded transition flex items-center shadow-lg"><Download size={18} className="mr-2" /> Exportar</button>
                </div>
            </div>
            <div className="overflow-x-auto max-h-[500px] hide-scrollbar border border-emerald-900/50 rounded-lg">
                <table className="w-full text-left text-emerald-300">
                    <thead className="bg-emerald-900/80 text-emerald-100 uppercase sticky top-0 backdrop-blur-md">
                        <tr>
                            <th className="p-4 border-b border-emerald-800">Visitante</th>
                            <th className="p-4 border-b border-emerald-800">Empresa</th>
                            <th className="p-4 border-b border-emerald-800">Bilhetes</th>
                            <th className="p-4 border-b border-emerald-800">Estado</th>
                            <th className="p-4 border-b border-emerald-800 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-900/50">
                        {users.length === 0 ? (
                          <tr><td colSpan={5} className="p-10 text-center text-emerald-800 font-serif italic">Nenhum espécime encontrado no herbário...</td></tr>
                        ) : users.map(user => (
                            <tr key={user.id} className="hover:bg-emerald-900/30 transition-colors">
                                <td className="p-4 font-medium text-white">{user.name}</td>
                                <td className="p-4 text-emerald-500">{user.company || '—'}</td>
                                <td className="p-4 font-mono text-emerald-200">{user.ticketNumbers.join(', ')}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${user.status === 'approved' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30' : 'bg-yellow-950/50 text-yellow-500 border border-yellow-700/30'}`}>
                                        {user.status === 'approved' ? 'AUTORIZADO' : 'PENDENTE'}
                                    </span>
                                </td>
                                <td className="p-4 text-center flex justify-center gap-2">
                                    {user.status === 'pending' && (
                                      <button onClick={() => approveUser(user.id)} className="text-emerald-400 hover:bg-emerald-900/50 p-2 rounded transition-all hover:scale-110" title="Aprovar"><Check size={18} /></button>
                                    )}
                                    <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:bg-red-900/20 p-2 rounded transition-all hover:scale-110" title="Eliminar"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {activeTab === 'controls' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                {/* Broadcast Section */}
                <div className="border border-emerald-700/50 bg-emerald-900/20 p-6 rounded-lg col-span-1 md:col-span-2 shadow-inner">
                    <div className="flex items-center gap-3 mb-4">
                        <MessageSquare size={32} className="text-emerald-400" />
                        <h3 className="text-xl text-emerald-200 font-bold">Aviso aos Visitantes (Broadcast)</h3>
                    </div>
                    <p className="text-emerald-500 mb-4 text-sm font-serif">Este aviso aparecerá instantaneamente como um popup botânico para todos os utilizadores ligados através da sua base de dados.</p>
                    <div className="flex gap-4">
                        <input type="text" className="flex-1 bg-emerald-950 border border-emerald-800 p-4 rounded text-white focus:outline-none focus:border-emerald-500 shadow-inner" placeholder="Ex: O sorteio final começará em 10 minutos na Estufa Real!" value={broadcastText} onChange={e => setBroadcastText(e.target.value)} />
                        <button onClick={handleSendBroadcast} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2 rounded font-black flex items-center gap-2 transition-all uppercase tracking-widest shadow-lg">
                            <Send size={18} /> ENVIAR
                        </button>
                    </div>
                </div>

                {/* Attack Simulator */}
                <div className="border border-red-900/50 bg-red-950/20 p-6 rounded-lg flex flex-col items-center">
                    <ShieldAlert size={48} className="text-red-600 mb-4" />
                    <h3 className="text-xl text-red-400 mb-2 font-bold uppercase tracking-tighter">Espécies Invasoras</h3>
                    <p className="text-red-900 text-center mb-6 text-xs font-bold uppercase tracking-widest">Protocolo de Ataque Simulado</p>
                    <button onClick={() => setAppState(appState === AppState.NORMAL ? AppState.ATTACK : AppState.NORMAL)} className={`w-full py-5 text-xl font-black rounded transition-all uppercase tracking-[0.2em] shadow-xl ${appState === AppState.ATTACK ? 'bg-red-600 text-white animate-pulse' : 'bg-black text-red-600 border border-red-600 hover:bg-red-900/30'}`}>
                        {appState === AppState.ATTACK ? "PARAR ATAQUE" : "SIMULAR PRAGA"}
                    </button>
                </div>

                {/* Lottery Control */}
                <div className="border border-emerald-900/50 bg-emerald-900/20 p-6 rounded-lg flex flex-col items-center">
                    <Trophy size={48} className="text-emerald-500 mb-4" />
                    <h3 className="text-xl text-emerald-200 mb-4 font-bold uppercase tracking-tighter">Roda das Relíquias</h3>
                    <div className="grid grid-cols-1 gap-3 w-full">
                        {[1, 2, 3].map((num) => (
                            <button key={num} onClick={() => startLottery(num as 1|2|3)} className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 py-4 rounded border border-emerald-600 text-xs font-black uppercase tracking-widest flex justify-between px-6 items-center group transition-all">
                              <span>Sorteio #{num}</span>
                              <Zap size={14} className="group-hover:text-yellow-400 transition-colors" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'accreditation' && (
          <div className="max-w-xl mx-auto py-10 animate-fade-in text-center">
             <CheckCircle size={64} className="text-emerald-500 mx-auto mb-6" />
             <h3 className="text-2xl text-emerald-200 mb-4">Controlo de Entradas</h3>
             <p className="text-emerald-500 mb-8 font-serif">Introduza o ID do visitante ou escaneie o passe para confirmar a presença no herbário.</p>
             <div className="flex gap-4">
                <input 
                  type="text" 
                  className="flex-1 bg-emerald-950 border border-emerald-800 p-4 rounded text-white font-mono text-center tracking-widest uppercase"
                  placeholder="ID DO VISITANTE"
                  value={scanId}
                  onChange={e => setScanId(e.target.value)}
                />
                <button onClick={handleCheckIn} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2 rounded font-bold uppercase tracking-widest shadow-lg">Confirmar</button>
             </div>
             {accreditationMsg && <p className="mt-6 text-emerald-400 font-bold bg-emerald-900/30 py-3 rounded border border-emerald-800">{accreditationMsg}</p>}
          </div>
        )}

        {/* EVENT CONFIG */}
        {activeTab === 'event' && (
            <div className="flex flex-col items-center animate-fade-in">
                <div className="w-full max-w-3xl">
                    <h3 className="text-2xl text-emerald-200 mb-6 font-bold tracking-tight">Imagem do Jardim/Summit</h3>
                    <p className="text-emerald-500 mb-8 text-sm font-serif">Personalize a experiência visual da localização para todos os visitantes. A imagem será sincronizada através da sua base de dados Supabase.</p>
                    <div className="bg-emerald-900/20 p-10 rounded-xl border border-emerald-800 flex flex-col items-center shadow-inner">
                        {eventImage ? (
                            <div className="w-full mb-8 relative group">
                                <img src={eventImage} alt="Preview" className="w-full h-72 object-contain rounded border-2 border-emerald-500 bg-black shadow-2xl" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                                  <button onClick={removeEventImage} className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-full font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                                    <Trash2 size={20} /> Eliminar Imagem
                                  </button>
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-64 border-2 border-dashed border-emerald-800 rounded-xl flex flex-col items-center justify-center mb-8 bg-emerald-950/30 text-emerald-800">
                              <ImagePlus size={64} className="mb-4 opacity-50" />
                              <span className="font-serif italic">Nenhuma imagem personalizada carregada</span>
                            </div>
                        )}
                        <input type="file" accept="image/*" ref={eventImageInputRef} onChange={(e) => uploadEventImage(e.target.files![0])} className="hidden" />
                        <button onClick={() => eventImageInputRef.current?.click()} className="bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-4 rounded-full font-black transition shadow-xl flex items-center gap-3 uppercase tracking-widest hover:-translate-y-1 active:translate-y-0">
                          <Upload size={24} /> ATUALIZAR MAPA BOTÂNICO
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
