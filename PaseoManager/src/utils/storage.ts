import { Participant, Payment, TripSettings, ParticipantFinancials } from '../types';
import heroBannerImage from '../assets/images/hero_paseo_adventure_1790900751214.jpg';

const STORAGE_KEYS = {
  SETTINGS: 'paseomanager_trip_settings_v1',
  PARTICIPANTS: 'paseomanager_participants_v1',
  PAYMENTS: 'paseomanager_payments_v1',
  ADMIN_SESSION: 'paseomanager_admin_auth_v1',
};

export const INITIAL_SETTINGS: TripSettings = {
  id: 'trip-principal-2026',
  title: 'Paseo Santa Marta & Tayrona 2026',
  destination: 'Santa Marta, Palomino & Parque Tayrona',
  departureDate: '2026-11-14',
  returnDate: '2026-11-18',
  currency: '$',
  adminPassword: 'admin',
  bannerUrl: heroBannerImage,
  organizerName: 'Carlos Gómez',
  organizerPhone: '+57 312 456 7890',
  organizerAccountInfo: 'Nequi / Daviplata: 312 456 7890 (Carlos Gómez) · Bancolombia Ahorros #451-892341-02',
  description: '¡Nos vamos de paseo! Incluye transporte ida y vuelta, 3 noches de cabaña en la playa, desayunos, cenas y recorrido guiado por el Tayrona.',
};

export const INITIAL_PARTICIPANTS: Participant[] = [
  {
    id: 'p-1',
    name: 'Carlos Gómez (Organizador)',
    phone: '312 456 7890',
    documentId: '1020304050',
    quota: 450000,
    notes: 'Coordinador general y conductor de apoyo',
    avatarColor: 'bg-emerald-600',
    createdAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'p-2',
    name: 'Laura Valentina Díaz',
    phone: '310 987 6543',
    documentId: '1098765432',
    quota: 450000,
    notes: 'Habitación compartida con Mariana',
    avatarColor: 'bg-teal-600',
    createdAt: '2026-09-02T11:30:00Z',
  },
  {
    id: 'p-3',
    name: 'Mariana Restrepo',
    phone: '315 234 5678',
    documentId: '1034567891',
    quota: 450000,
    notes: 'Habitación compartida con Laura',
    avatarColor: 'bg-cyan-600',
    createdAt: '2026-09-02T14:15:00Z',
  },
  {
    id: 'p-4',
    name: 'Juan Diego Morales',
    phone: '320 876 5432',
    documentId: '1045678912',
    quota: 450000,
    notes: 'Alimentación vegetariana',
    avatarColor: 'bg-emerald-700',
    createdAt: '2026-09-05T09:20:00Z',
  },
  {
    id: 'p-5',
    name: 'Andrés Felipe Pérez',
    phone: '311 345 6789',
    documentId: '1056789123',
    quota: 450000,
    notes: 'Lleva parlante y kit de primeros auxilios',
    avatarColor: 'bg-green-600',
    createdAt: '2026-09-06T16:40:00Z',
  },
  {
    id: 'p-6',
    name: 'Camilo & Sara (Pareja)',
    phone: '318 654 3210',
    documentId: '1067891234',
    quota: 850000,
    notes: 'Tarifa doble en cabaña matrimonial',
    avatarColor: 'bg-teal-700',
    createdAt: '2026-09-07T12:00:00Z',
  },
  {
    id: 'p-7',
    name: 'Valentina Ospina',
    phone: '314 567 8901',
    documentId: '1078912345',
    quota: 320000,
    notes: 'Tarifa especial (llega en su propio carro)',
    avatarColor: 'bg-emerald-800',
    createdAt: '2026-09-10T15:10:00Z',
  },
  {
    id: 'p-8',
    name: 'Mateo Henao',
    phone: '316 789 0123',
    documentId: '1089123456',
    quota: 450000,
    notes: 'Confirmado, primer abono programado para quincena',
    avatarColor: 'bg-slate-600',
    createdAt: '2026-09-12T18:00:00Z',
  },
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    participantId: 'p-1',
    amount: 450000,
    date: '2026-09-01',
    method: 'Transferencia Bancaria',
    reference: 'BANC-009182',
    notes: 'Pago total completo',
    createdAt: '2026-09-01T10:05:00Z',
  },
  {
    id: 'pay-2',
    participantId: 'p-2',
    amount: 200000,
    date: '2026-09-05',
    method: 'Nequi',
    reference: 'M9823412',
    notes: 'Primer abono de reserva cupo',
    createdAt: '2026-09-05T12:30:00Z',
  },
  {
    id: 'pay-3',
    participantId: 'p-2',
    amount: 100000,
    date: '2026-09-20',
    method: 'Daviplata',
    reference: 'DP-55421',
    notes: 'Segundo abono',
    createdAt: '2026-09-20T17:10:00Z',
  },
  {
    id: 'pay-4',
    participantId: 'p-3',
    amount: 250000,
    date: '2026-09-04',
    method: 'Nequi',
    reference: 'NQ-771822',
    notes: 'Abono inicial 50%',
    createdAt: '2026-09-04T15:20:00Z',
  },
  {
    id: 'pay-5',
    participantId: 'p-3',
    amount: 200000,
    date: '2026-09-25',
    method: 'Transferencia Bancaria',
    reference: 'TRANS-44819',
    notes: 'Liquidación final del cupo',
    createdAt: '2026-09-25T11:45:00Z',
  },
  {
    id: 'pay-6',
    participantId: 'p-4',
    amount: 250000,
    date: '2026-09-10',
    method: 'Efectivo',
    reference: 'Entregado en persona',
    notes: 'Abono en reunión informativa',
    createdAt: '2026-09-10T19:00:00Z',
  },
  {
    id: 'pay-7',
    participantId: 'p-5',
    amount: 150000,
    date: '2026-09-12',
    method: 'Nequi',
    reference: 'NQ-882910',
    notes: 'Abono 1 de 3',
    createdAt: '2026-09-12T14:00:00Z',
  },
  {
    id: 'pay-8',
    participantId: 'p-6',
    amount: 500000,
    date: '2026-09-08',
    method: 'Transferencia Bancaria',
    reference: 'BANCO-9921',
    notes: 'Abono inicial de pareja',
    createdAt: '2026-09-08T16:30:00Z',
  },
  {
    id: 'pay-9',
    participantId: 'p-7',
    amount: 320000,
    date: '2026-09-11',
    method: 'Daviplata',
    reference: 'DP-88129',
    notes: 'Pago total del cupo sin transporte',
    createdAt: '2026-09-11T10:15:00Z',
  },
];

export function loadTripSettings(): TripSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return INITIAL_SETTINGS;
    return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveTripSettings(settings: TripSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving trip settings', e);
  }
}

export function loadParticipants(): Participant[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PARTICIPANTS);
    if (!raw) return INITIAL_PARTICIPANTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PARTICIPANTS;
  } catch {
    return INITIAL_PARTICIPANTS;
  }
}

export function saveParticipants(participants: Participant[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
  } catch (e) {
    console.error('Error saving participants', e);
  }
}

export function loadPayments(): Payment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (!raw) return INITIAL_PAYMENTS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_PAYMENTS;
  } catch {
    return INITIAL_PAYMENTS;
  }
}

export function savePayments(payments: Payment[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  } catch (e) {
    console.error('Error saving payments', e);
  }
}

export function checkAdminSession(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION) === 'true';
  } catch {
    return false;
  }
}

export function setAdminSession(isLoggedIn: boolean): void {
  try {
    if (isLoggedIn) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
    }
  } catch (e) {
    console.error('Error modifying admin session', e);
  }
}

export function calculateFinancials(participant: Participant, payments: Payment[]): ParticipantFinancials {
  const userPayments = payments.filter((p) => p.participantId === participant.id);
  const totalPaid = userPayments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const quota = Math.max(0, Number(participant.quota || 0));
  const remainingBalance = Math.max(0, quota - totalPaid);
  const progressPercentage = quota > 0 ? Math.min(100, Math.round((totalPaid / quota) * 100)) : 100;
  
  // Sort payments to get last payment date
  const sorted = [...userPayments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastPaymentDate = sorted.length > 0 ? sorted[0].date : undefined;

  return {
    totalPaid,
    remainingBalance,
    progressPercentage,
    paymentsCount: userPayments.length,
    isFullyPaid: totalPaid >= quota && quota > 0,
    hasStartedPaying: totalPaid > 0,
    lastPaymentDate,
  };
}

export function formatMoney(amount: number, currency: string = '$'): string {
  const rounded = Math.round(amount);
  return `${currency} ${rounded.toLocaleString('es-CO')}`;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      return d.toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
    return new Date(dateStr).toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function resetAllData(): void {
  saveTripSettings(INITIAL_SETTINGS);
  saveParticipants(INITIAL_PARTICIPANTS);
  savePayments(INITIAL_PAYMENTS);
}

export function clearData(): void {
  saveParticipants([]);
  savePayments([]);
}

export function exportFullDataJSON(): string {
  const settings = loadTripSettings();
  const participants = loadParticipants();
  const payments = loadPayments();
  return JSON.stringify({ settings, participants, payments, exportedAt: new Date().toISOString() }, null, 2);
}

export function importFullDataJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.settings) saveTripSettings(parsed.settings);
    if (Array.isArray(parsed.participants)) saveParticipants(parsed.participants);
    if (Array.isArray(parsed.payments)) savePayments(parsed.payments);
    return true;
  } catch (e) {
    console.error('Failed to import JSON data', e);
    return false;
  }
}

export function generateCSVReport(participants: Participant[], payments: Payment[], currency: string = '$'): string {
  const header = ['ID', 'Nombre', 'Telefono', 'Documento', 'Cuota Total', 'Total Abonado', 'Saldo Pendiente', '% Pagado', 'Estado', 'Notas'].join(',');
  const rows = participants.map((p) => {
    const fin = calculateFinancials(p, payments);
    const estado = fin.isFullyPaid ? 'Pagado Total' : fin.hasStartedPaying ? 'Abonando' : 'Sin Abonos';
    const cleanNotes = (p.notes || '').replace(/,/g, ';').replace(/"/g, '""');
    return [
      `"${p.id}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.phone || ''}"`,
      `"${p.documentId || ''}"`,
      fin.totalPaid + fin.remainingBalance,
      fin.totalPaid,
      fin.remainingBalance,
      `${fin.progressPercentage}%`,
      `"${estado}"`,
      `"${cleanNotes}"`,
    ].join(',');
  });

  return [header, ...rows].join('\n');
}
