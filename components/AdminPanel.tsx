import React, { useState, useRef } from 'react';
import { useEvent } from '../context/EventContext';
import { AppState } from '../types';
import { Download, Upload, ShieldAlert, CheckCircle, Users, Trophy, Trash2, RotateCcw, ImagePlus, XCircle, Clock, Check, UserCog, Lock, LogOut, LayoutTemplate, MessageSquare, Send, Trees } from 'lucide-react';
import { AdminLogin } from './AdminLogin';

export const AdminPanel: React.FC = () => {
  const { 
    users, checkInUser, approveUser, deleteUser, exportUsersToExcel, importUsersFromExcel, 
    appState, setAppState, lotteryState, setLotteryState, 
    sponsors, addSponsor, removeSponsor,
    isAuthenticated, logoutAdmin, updateAdminPassword,
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8 border-b border-emerald-800 pb-4">
          <h2 className="text-4xl text-emerald-400 display-font uppercase tracking-tighter">Direção do Jardim Vandelli</h2>
          <button onClick={logoutAdmin} className="flex items-center gap-2 text-red-400 hover:text-red-300 border border-red-900 px-4 py-2 rounded hover:bg-red-900/20 transition">
              <LogOut size={18} /> Sair
          </button>
      </div>

      <div className="flex justify-center flex-wrap gap-2 mb-8">
        {[
            { id: 'users', label: 'Herbário', icon: Users },
            { id: 'accreditation', label: 'Controlo Entradas', icon: CheckCircle },
            { id: 'controls', label: 'Emergência/Avisos', icon: ShieldAlert },
            { id: 'sponsors', label: 'Mecenas', icon: ImagePlus },
            { id: 'event', label: 'Layout', icon: LayoutTemplate },
            { id: 'profile', label: 'Chaves', icon: UserCog }
        ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-6 py-2 rounded-t-lg border-2 flex items-center transition-all ${activeTab === tab.id ? 'bg-emerald-900 border-emerald-500 text-white' : 'bg-black/40 border-emerald-900/50 text-emerald-700 hover:text-emerald-300'}`}>
                <tab.icon className="inline mr-2" size={18} /> {tab.label}
            </button>
        ))}
      </div>

      <div className="bg-emerald-950/80 p-8 rounded-lg border border-emerald-800 shadow-2xl min-h-[400px]">
        
        {activeTab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl text-emerald-200">Visitantes Registados ({users.length})</h3>
                <div className="flex gap-2">
                    <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={(e) => importUsersFromExcel(e.target.files![0])} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 rounded transition flex items-center"><Upload size={18} className="mr-2" /> Importar</button>
                    <button onClick={exportUsersToExcel} className="bg-emerald-900 border border-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded transition flex items-center"><Download size={18} className="mr-2" /> Exportar</button>
                </div>
            </div>
            <div className="overflow-x-auto max-h-[500px] hide-scrollbar">
                <table className="w-full text-left text-emerald-300">
                    <thead className="bg-emerald-900 text-emerald-100 uppercase sticky top-0">
                        <tr>
                            <th className="p-3">Visitante</th>
                            <th className="p-3">Empresa</th>
                            <th className="p-3">Bilhetes</th>
                            <th className="p-3">Estado</th>
                            <th className="p-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-900/50">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-emerald-900/30">
                                <td className="p-3 font-medium text-white">{user.name}</td>
                                <td className="p-3 text-emerald-500">{user.company}</td>
                                <td className="p-3 font-mono text-emerald-200">{user.ticketNumbers.join(', ')}</td>
                                <td className="p-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.status === 'approved' ? 'bg-emerald-900 text-emerald-200' : 'bg-yellow-900 text-yellow-200'}`}>
                                        {user.status === 'approved' ? 'AUTORIZADO' : 'PENDENTE'}
                                    </span>
                                </td>
                                <td className="p-3 text-center flex justify-center gap-2">
                                    {user.status === 'pending' && (
                                      <button onClick={() => approveUser(user.id)} className="text-emerald-400 hover:bg-emerald-900/50 p-2 rounded"><Check size={18} /></button>
                                    )}
                                    <button onClick={() => deleteUser(user.id)} className="text-red-500 hover:bg-red-900/20 p-2 rounded"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {activeTab === 'controls' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Broadcast Section */}
                <div className="border border-emerald-700/50 bg-emerald-900/20 p-6 rounded-lg col-span-1 md:col-span-2 shadow-inner">
                    <div className="flex items-center gap-3 mb-4">
                        <MessageSquare size={32} className="text-emerald-400" />
                        <h3 className="text-xl text-emerald-200 font-bold">Aviso aos Visitantes (Broadcast)</h3>
                    </div>
                    <p className="text-emerald-500 mb-4 text-sm">Este aviso aparecerá instantaneamente como um popup botânico para todos os utilizadores ligados.</p>
                    <div className="flex gap-4">
                        <input type="text" className="flex-1 bg-emerald-950 border border-emerald-800 p-3 rounded text-white focus:outline-none focus:border-emerald-500" placeholder="Ex: O sorteio final começará em 10 minutos na Estufa Real!" value={broadcastText} onChange={e => setBroadcastText(e.target.value)} />
                        <button onClick={handleSendBroadcast} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-2 rounded font-bold flex items-center gap-2 transition-all">
                            <Send size={18} /> ENVIAR
                        </button>
                    </div>
                </div>

                {/* Attack Simulator */}
                <div className="border border-red-900/50 bg-red-950/20 p-6 rounded-lg flex flex-col items-center">
                    <ShieldAlert size={48} className="text-red-600 mb-4" />
                    <h3 className="text-xl text-red-400 mb-2 font-bold uppercase">Espécies Invasoras</h3>
                    <p className="text-red-900 text-center mb-6 text-xs font-bold uppercase tracking-widest">Protocolo de Ataque Simulado</p>
                    <button onClick={() => setAppState(appState === AppState.NORMAL ? AppState.ATTACK : AppState.NORMAL)} className={`w-full py-4 text-xl font-bold rounded transition-all ${appState === AppState.ATTACK ? 'bg-red-600 text-white animate-pulse' : 'bg-black text-red-600 border border-red-600 hover:bg-red-900/30'}`}>
                        {appState === AppState.ATTACK ? "PARAR ATAQUE" : "SIMULAR PRAGA"}
                    </button>
                </div>

                {/* Lottery Control */}
                <div className="border border-emerald-900/50 bg-emerald-900/20 p-6 rounded-lg flex flex-col items-center">
                    <Trophy size={48} className="text-emerald-500 mb-4" />
                    <h3 className="text-xl text-emerald-200 mb-4 font-bold uppercase">Roda das Relíquias</h3>
                    <div className="grid grid-cols-3 gap-4 w-full">
                        {[1, 2, 3].map((num) => (
                            <button key={num} onClick={() => startLottery(num as 1|2|3)} className="bg-emerald-800 hover:bg-emerald-700 text-emerald-200 py-3 rounded border border-emerald-600 text-xs font-bold uppercase">Sorteio {num}</button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* EVENT CONFIG */}
        {activeTab === 'event' && (
            <div className="flex flex-col items-center">
                <div className="w-full max-w-3xl">
                    <h3 className="text-2xl text-emerald-200 mb-6">Imagem do Jardim/Summit</h3>
                    <p className="text-emerald-500 mb-6 text-sm">Esta imagem aparecerá na secção de localização para todos os visitantes. O sistema ajustará o zoom para caber na moldura da estufa.</p>
                    <div className="bg-emerald-900/40 p-8 rounded-lg border border-emerald-800 flex flex-col items-center">
                        {eventImage ? (
                            <div className="w-full mb-6 relative group">
                                <img src={eventImage} alt="Preview" className="w-full h-64 object-contain rounded border border-emerald-500 bg-black" />
                                <button onClick={removeEventImage} className="absolute inset-0 m-auto w-fit h-fit bg-red-600 text-white px-4 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">Eliminar</button>
                            </div>
                        ) : (
                            <div className="w-full h-48 border-2 border-dashed border-emerald-800 rounded flex flex-col items-center justify-center mb-6"><ImagePlus size={48} className="text-emerald-800" /></div>
                        )}
                        <input type="file" accept="image/*" ref={eventImageInputRef} onChange={(e) => uploadEventImage(e.target.files![0])} className="hidden" />
                        <button onClick={() => eventImageInputRef.current?.click()} className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-3 rounded font-bold transition flex items-center gap-2"><Upload size={20} /> ATUALIZAR IMAGEM</button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};