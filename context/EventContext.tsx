
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AppState, LotteryState, Sponsor } from '../types';
import { supabase } from '../services/supabaseClient';

interface EventContextType {
  users: User[];
  registerUser: (name: string, email: string, phone: string, company: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  checkInUser: (id: string) => Promise<boolean>;
  approveUser: (id: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  visitStand: (userId: string, standId: string) => Promise<boolean>;
  appState: AppState;
  setAppState: (state: AppState) => void;
  lotteryState: LotteryState;
  setLotteryState: React.Dispatch<React.SetStateAction<LotteryState>>;
  exportUsersToExcel: () => void;
  importUsersFromExcel: (file: File) => Promise<void>;
  sponsors: Sponsor[];
  addSponsor: (file: File) => Promise<void>;
  removeSponsor: (id: string) => Promise<void>;
  eventImage: string | null;
  uploadEventImage: (file: File) => Promise<void>;
  removeEventImage: () => Promise<void>;
  broadcastMessage: { id: string; text: string } | null;
  sendBroadcastMessage: (text: string) => Promise<void>;
  isAuthenticated: boolean;
  isConnected: boolean;
  loginAdmin: (username: string, pass: string) => boolean;
  logoutAdmin: () => void;
  updateAdminPassword: (newPass: string) => Promise<boolean>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [appState, setLocalAppState] = useState<AppState>(AppState.NORMAL);
  const [lotteryState, setLocalLotteryState] = useState<LotteryState>({
      active: false,
      currentDraw: null,
      winner: null,
      isSpinning: false,
      results: {}
  });
  const [eventImage, setEventImage] = useState<string | null>(null);
  const [broadcastMessage, setBroadcastMessage] = useState<{ id: string; text: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentAdminPassword, setCurrentAdminPassword] = useState('#SMTsec$2026');
  const ADMIN_USERNAME = 'Arrow';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: usersData, error: usersError } = await supabase.from('users').select('*');
        if (usersError) throw usersError;
        
        setIsConnected(true);

        if (usersData) {
          setUsers(usersData.map((u: any) => ({
             id: u.id, name: u.name, email: u.email, company: u.company, phone: u.phone,
             ticketNumbers: u.ticket_numbers || [], checkedIn: u.checked_in,
             registrationDate: u.registration_date, status: u.status, visitedStands: u.visited_stands || []
          })));
        }

        const { data: sponsorsData } = await supabase.from('sponsors').select('*');
        if (sponsorsData) {
          setSponsors(sponsorsData.map((s: any) => ({
             id: s.id, name: s.name, logoBase64: s.logo_base64
          })));
        }

        const { data: globalData, error: globalError } = await supabase.from('global_state').select('*').eq('id', 1).maybeSingle();
        
        if (!globalData && !globalError) {
          // Initialize global state if missing
          const initialState = {
            id: 1,
            app_state: AppState.NORMAL,
            lottery_active: false,
            admin_password: '#SMTsec$2026'
          };
          await supabase.from('global_state').insert([initialState]);
        } else if (globalData) {
           setLocalAppState(globalData.app_state as AppState);
           setLocalLotteryState({
               active: globalData.lottery_active,
               currentDraw: globalData.lottery_draw,
               winner: globalData.lottery_winner,
               isSpinning: globalData.lottery_is_spinning,
               results: globalData.lottery_results || {}
           });
           if (globalData.admin_password) setCurrentAdminPassword(globalData.admin_password);
           if (globalData.event_image_base64) setEventImage(globalData.event_image_base64);
           if (globalData.broadcast_message && globalData.broadcast_id) {
               setBroadcastMessage({ id: globalData.broadcast_id, text: globalData.broadcast_message });
           }
        }
      } catch (e) {
        console.error("Initial fetch error:", e);
        setIsConnected(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    try {
      const channel = supabase.channel('public:db_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, (payload) => {
            if (payload.eventType === 'INSERT') {
               const u = payload.new;
               setUsers(prev => {
                 if (prev.some(user => user.id === u.id)) return prev;
                 return [...prev, {
                   id: u.id, name: u.name, email: u.email, company: u.company, phone: u.phone,
                   ticketNumbers: u.ticket_numbers || [], checkedIn: u.checked_in,
                   registrationDate: u.registration_date, status: u.status, visitedStands: u.visited_stands || []
                 }];
               });
            } else if (payload.eventType === 'UPDATE') {
               const u = payload.new;
               setUsers(prev => prev.map(user => user.id === u.id ? {
                   ...user, name: u.name, email: u.email, company: u.company, phone: u.phone,
                   ticketNumbers: u.ticket_numbers || [], checkedIn: u.checked_in,
                   status: u.status, visitedStands: u.visited_stands || []
               } : user));
            } else if (payload.eventType === 'DELETE') {
               setUsers(prev => prev.filter(user => user.id !== payload.old.id));
            }
        })
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    } catch (e) {
      console.error("Realtime subscription error:", e);
    }
  }, []);

  const loginAdmin = (username: string, pass: string): boolean => {
      if (username === ADMIN_USERNAME && pass === currentAdminPassword) {
          setIsAuthenticated(true);
          return true;
      }
      return false;
  };

  const logoutAdmin = () => setIsAuthenticated(false);

  const updateAdminPassword = async (newPass: string): Promise<boolean> => {
      try {
        setCurrentAdminPassword(newPass);
        const { error } = await supabase.from('global_state').update({ admin_password: newPass }).eq('id', 1);
        return !error;
      } catch (e) { return false; }
  };

  const generateUniqueNumbers = (existingUsers: User[]): number[] => {
    const usedNumbers = new Set(existingUsers.flatMap(u => u.ticketNumbers));
    const newNumbers: number[] = [];
    while (newNumbers.length < 3) {
      const num = Math.floor(Math.random() * 999) + 1;
      if (!usedNumbers.has(num) && !newNumbers.includes(num)) newNumbers.push(num);
    }
    return newNumbers;
  };

  const registerUser = async (name: string, email: string, phone: string, company: string) => {
    try {
      const newNumbers = generateUniqueNumbers(users);
      
      const { data, error } = await supabase.from('users').insert([{
          name,
          email,
          phone,
          company,
          ticket_numbers: newNumbers,
          checked_in: false,
          registration_date: new Date().toISOString(),
          status: 'pending',
          visited_stands: []
      }]).select();

      if (error) {
          console.error("Supabase registration error detail:", error);
          const msg = error.code === 'PGRST116' ? "Erro de integridade. Verifique se o utilizador já existe." : 
                      error.message === 'Load failed' ? "Ligação à base de dados bloqueada ou falha de rede." : error.message;
          return { success: false, error: msg };
      }

      if (!data || data.length === 0) {
          return { success: false, error: "Registo falhou. Verifique as políticas de segurança da base de dados." };
      }

      const u = data[0];
      const registeredUser: User = {
          id: u.id, name: u.name, email: u.email, company: u.company, phone: u.phone,
          ticketNumbers: u.ticket_numbers, checkedIn: u.checked_in,
          registrationDate: u.registration_date, status: u.status, visitedStands: u.visited_stands
      };
      return { success: true, user: registeredUser };
    } catch (e: any) {
      return { success: false, error: "Erro crítico de rede ao contactar a base de dados." };
    }
  };

  const approveUser = async (id: string) => {
    try { await supabase.from('users').update({ status: 'approved' }).eq('id', id); } catch (e) {}
  };

  const checkInUser = async (id: string) => {
    try {
      const { error } = await supabase.from('users').update({ 
          checked_in: true, 
          status: 'approved' 
      }).eq('id', id);
      return !error;
    } catch (e) { return false; }
  };

  const deleteUser = async (id: string) => {
    try { await supabase.from('users').delete().eq('id', id); } catch (e) {}
  };

  const visitStand = async (userId: string, standId: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user || user.visitedStands.includes(standId)) return true;
      const newStands = [...user.visitedStands, standId];
      await supabase.from('users').update({ visited_stands: newStands }).eq('id', userId);
      return true;
    } catch (e) { return false; }
  };

  const setAppState = async (state: AppState) => {
      try {
        setLocalAppState(state);
        await supabase.from('global_state').update({ app_state: state }).eq('id', 1);
      } catch (e) {}
  };

  const updateLotteryState = async (newStateOrFn: LotteryState | ((prev: LotteryState) => LotteryState)) => {
      try {
        let newState: LotteryState;
        if (typeof newStateOrFn === 'function') newState = newStateOrFn(lotteryState);
        else newState = newStateOrFn;
        setLocalLotteryState(newState);
        await supabase.from('global_state').update({
            lottery_active: newState.active,
            lottery_draw: newState.currentDraw,
            lottery_winner: newState.winner,
            lottery_is_spinning: newState.isSpinning,
            lottery_results: newState.results
        }).eq('id', 1);
      } catch (e) {}
  };

  const addSponsor = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          await supabase.from('sponsors').insert([{ name: file.name.split('.')[0], logo_base64: reader.result as string }]);
          resolve();
        } catch (e) { reject(e); }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeSponsor = async (id: string) => { try { await supabase.from('sponsors').delete().eq('id', id); } catch (e) {} };

  const uploadEventImage = async (file: File) => {
      return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = async () => {
              try {
                const base64 = reader.result as string;
                setEventImage(base64);
                await supabase.from('global_state').update({ event_image_base64: base64 }).eq('id', 1);
                resolve();
              } catch (e) { reject(e); }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
      });
  };

  const removeEventImage = async () => {
      try {
        setEventImage(null);
        await supabase.from('global_state').update({ event_image_base64: null }).eq('id', 1);
      } catch (e) {}
  };

  const sendBroadcastMessage = async (text: string) => {
      try {
        const id = crypto.randomUUID();
        await supabase.from('global_state').update({ broadcast_message: text, broadcast_id: id }).eq('id', 1);
        setBroadcastMessage({ id, text });
      } catch (e) {}
  };

  const exportUsersToExcel = async () => {
    try {
      const XLSX = await import('xlsx');
      const ws = XLSX.utils.json_to_sheet(users.map(u => ({
        ID: u.id, "Nome Completo": u.name, "Email": u.email, "Empresa": u.company, "Telefone": u.phone,
        "Números": u.ticketNumbers.join(', '), "Estado": u.status === 'approved' ? 'Aprovado' : 'Pendente',
        "Acreditado": u.checkedIn ? "Sim" : "Não", "Stands Visitados": u.visitedStands?.join(', ') || "", "Data Registo": u.registrationDate
      })));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Participantes");
      XLSX.writeFile(wb, "Cyber_Summit_Participantes.xlsx");
    } catch (e) {}
  };

  const importUsersFromExcel = async (file: File) => {
    try {
      const XLSX = await import('xlsx');
      const reader = new FileReader();
      return new Promise<void>((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);
            for (const row of jsonData) {
               const name = row["Nome Completo"] || row["nome"];
               const email = row["Email"] || row["email"];
               if (name && email && !users.some(u => u.email === email)) {
                  await registerUser(String(name), String(email), "", "");
               }
            }
            resolve();
          } catch (error) { reject(error); }
        };
        reader.readAsArrayBuffer(file);
      });
    } catch (e) {}
  };

  return (
    <EventContext.Provider value={{
      users, registerUser, checkInUser, approveUser, deleteUser, visitStand,
      appState, setAppState, lotteryState, setLotteryState: updateLotteryState as any,
      exportUsersToExcel, importUsersFromExcel, sponsors, addSponsor, removeSponsor,
      eventImage, uploadEventImage, removeEventImage, broadcastMessage, sendBroadcastMessage,
      isAuthenticated, isConnected, loginAdmin, logoutAdmin, updateAdminPassword
    }}>
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) throw new Error("useEvent must be used within an EventProvider");
  return context;
};
