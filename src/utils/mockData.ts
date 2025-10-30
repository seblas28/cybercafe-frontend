// src/utils/mockData.ts
// Mocks 100% locales con localStorage – SIN SUPABASE

export interface PC {
  id: string;
  number: number;
  status: 'libre' | 'ocupada' | 'mantenimiento';
  location: string;
  specs: string;
}

export interface Reservation {
  id: string;
  userId: string;
  pcId: string;
  startTime: string;
  duration: number;
  status: 'activa' | 'completada' | 'cancelada';
}

export interface ActiveSession {
  id: string;
  userId: string;
  userName: string;
  pcId: string;
  pcNumber: number;
  startTime: string;
  elapsedTime: number;
}

export interface DemandPrediction {
  id?: string;
  hour: number;
  day: string;
  predictedUsage: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'cliente' | 'admin';
  createdAt: string;
  isBanned: boolean;
}

export interface Report {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  pcNumber: string;
  description: string;
  timestamp: string;
  status: 'pendiente' | 'resuelto';
}

export type UserRole = 'cliente' | 'admin';

// === INICIALIZACIÓN COMPLETA ===
export const initializeMockData = (): void => {
  if (localStorage.getItem('cybercafe_initialized')) return;

  // === USUARIOS (con password) ===
  const users: User[] = [
    {
      id: '1',
      name: 'Admin Cyber',
      email: 'admin@cybercafe.com',
      password: '123456',
      role: 'admin',
      createdAt: new Date().toISOString(),
      isBanned: false,
    },
    {
      id: '2',
      name: 'Juan Pérez',
      email: 'juan@cybercafe.com',
      password: '123456',
      role: 'cliente',
      createdAt: new Date().toISOString(),
      isBanned: false,
    },
    {
      id: '3',
      name: 'María Gómez',
      email: 'maria@cybercafe.com',
      password: '123456',
      role: 'cliente',
      createdAt: new Date().toISOString(),
      isBanned: false,
    },
  ];
  localStorage.setItem('cybercafe_users', JSON.stringify(users));

  // === PCs ===
  const pcs: PC[] = Array.from({ length: 20 }, (_, i) => ({
    id: `pc-${i + 1}`,
    number: i + 1,
    status: i % 7 === 0 ? 'ocupada' : i % 11 === 0 ? 'mantenimiento' : 'libre',
    location: `Zona ${Math.floor(i / 5) + 1}`,
    specs: 'Intel i7, 16GB RAM, RTX 3060',
  }));
  localStorage.setItem('cybercafe_pcs', JSON.stringify(pcs));

  // === SESIONES ACTIVAS ===
  const sessions: ActiveSession[] = [
    {
      id: 'sess-1',
      userId: '2',
      userName: 'Juan Pérez',
      pcId: 'pc-3',
      pcNumber: 3,
      startTime: new Date(Date.now() - 45 * 60000).toISOString(),
      elapsedTime: 45,
    },
    {
      id: 'sess-2',
      userId: '3',
      userName: 'María Gómez',
      pcId: 'pc-10',
      pcNumber: 10,
      startTime: new Date(Date.now() - 20 * 60000).toISOString(),
      elapsedTime: 20,
    },
  ];
  localStorage.setItem('cybercafe_sessions', JSON.stringify(sessions));

  // === RESERVAS ===
  const reservations: Reservation[] = [
    {
      id: 'res-1',
      userId: '2',
      pcId: 'pc-5',
      startTime: '2025-04-05T18:00:00',
      duration: 2,
      status: 'activa',
    },
  ];
  localStorage.setItem('cybercafe_reservations', JSON.stringify(reservations));

  // === REPORTES ===
  const reports: Report[] = [
    {
      id: 'rep-1',
      userId: '2',
      userName: 'Juan Pérez',
      subject: 'PC #3 se reinicia sola',
      pcNumber: '3',
      description: 'Cada 10 minutos se apaga y reinicia. Urgente.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'pendiente',
    },
  ];
  localStorage.setItem('cybercafe_reports', JSON.stringify(reports));

  // === PEDIDOS CAFETERÍA ===
  localStorage.setItem('cybercafe_orders', JSON.stringify([]));

  // === PREDICCIONES DE DEMANDA ===
  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  const predictions: DemandPrediction[] = [];

  days.forEach(day => {
    for (let hour = 8; hour <= 23; hour++) {
      const isPeak = hour >= 14 && hour <= 22;
      const isWeekend = day === 'Sábado' || day === 'Domingo';
      let baseUsage = isPeak ? 70 : 40;
      if (isWeekend) baseUsage += 20;
      const variance = Math.random() * 15 - 7.5;
      const predictedUsage = Math.round(Math.max(0, Math.min(100, baseUsage + variance)));

      predictions.push({ hour, day, predictedUsage });
    }
  });
  localStorage.setItem('cybercafe_predictions', JSON.stringify(predictions));

  localStorage.setItem('cybercafe_initialized', 'true');
};

// === RESTO DE FUNCIONES (SIN CAMBIOS) ===
export const getPCs = (): PC[] => {
  initializeMockData();
  return JSON.parse(localStorage.getItem('cybercafe_pcs') || '[]');
};

export const updatePCStatus = (pcId: string, status: PC['status']): void => {
  const pcs: PC[] = getPCs();
  const updated = pcs.map(pc => (pc.id === pcId ? { ...pc, status } : pc));
  localStorage.setItem('cybercafe_pcs', JSON.stringify(updated));
};

export const getActiveSessions = (): ActiveSession[] => {
  initializeMockData();
  const sessions: ActiveSession[] = JSON.parse(localStorage.getItem('cybercafe_sessions') || '[]');
  const users: User[] = JSON.parse(localStorage.getItem('cybercafe_users') || '[]');

  return sessions.map(s => {
    const user = users.find(u => u.id === s.userId);
    return {
      ...s,
      userName: user?.name || 'Desconocido',
      elapsedTime: Math.floor((Date.now() - new Date(s.startTime).getTime()) / 60000),
    };
  });
};

export const endSession = (sessionId: string): void => {
  const sessions: ActiveSession[] = JSON.parse(localStorage.getItem('cybercafe_sessions') || '[]');
  const updated = sessions.filter(s => s.id !== sessionId);
  localStorage.setItem('cybercafe_sessions', JSON.stringify(updated));
};

export const getMockUsers = (): User[] => {
  initializeMockData();
  const users: User[] = JSON.parse(localStorage.getItem('cybercafe_users') || '[]');
  return users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: new Date(u.createdAt).toISOString().split('T')[0],
    isBanned: u.isBanned,
  }));
};

export const banUser = (userId: string): void => {
  const users: User[] = JSON.parse(localStorage.getItem('cybercafe_users') || '[]');
  const updated = users.map(u => (u.id === userId ? { ...u, isBanned: true } : u));
  localStorage.setItem('cybercafe_users', JSON.stringify(updated));
};

export const editUserRole = (userId: string, role: UserRole): void => {
  const users: User[] = JSON.parse(localStorage.getItem('cybercafe_users') || '[]');
  const updated = users.map(u => (u.id === userId ? { ...u, role } : u));
  localStorage.setItem('cybercafe_users', JSON.stringify(updated));
};

export const generateDemandPredictions = (): DemandPrediction[] => {
  initializeMockData();
  return JSON.parse(localStorage.getItem('cybercafe_predictions') || '[]');
};

export const getReports = (): Report[] => {
  initializeMockData();
  return JSON.parse(localStorage.getItem('cybercafe_reports') || '[]');
};

export const resolveReport = (reportId: string): void => {
  const reports: Report[] = getReports();
  const updated = reports.map(r => (r.id === reportId ? { ...r, status: 'resuelto' } : r));
  localStorage.setItem('cybercafe_reports', JSON.stringify(updated));
};