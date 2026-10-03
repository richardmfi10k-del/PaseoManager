import { Participant, Payment, TripSettings, ParticipantFinancials, Expense } from '../types';
import heroBannerImage from '../assets/images/hero_paseo_adventure_1790900751214.jpg';

const STORAGE_KEYS = {
  SETTINGS: 'paseomanager_trip_settings_v1',
  PARTICIPANTS: 'paseomanager_participants_v1',
  PAYMENTS: 'paseomanager_payments_v1',
  EXPENSES: 'paseomanager_expenses_v1',
  ADMIN_SESSION: 'paseomanager_admin_auth_v1',
};

export const INITIAL_SETTINGS: TripSettings = {
  id: 'trip-principal-2026',
  title: 'Finca Arango Enero 9–11',
  destination: 'Finca Arango',
  departureDate: '2027-01-09',
  returnDate: '2027-01-11',
  currency: '$',
  adminPassword: 'admin',
  bannerUrl: heroBannerImage,
  organizerName: 'Organizador',
  organizerPhone: '',
  description: 'Control oficial de cuotas y abonos del paseo.',
};

export const INITIAL_PARTICIPANTS: Participant[] = [];

export const INITIAL_PAYMENTS: Payment[] = [];

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
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function savePayments(payments: Payment[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  } catch (e) {
    console.error('Error saving payments', e);
  }
}

export const INITIAL_EXPENSES: Expense[] = [];

export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Error saving expenses', e);
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
  
  const sortedUserPayments = [...userPayments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastPaymentDate = sortedUserPayments.length > 0 ? sortedUserPayments[0].date : undefined;

  return {
    totalPaid,
    remainingBalance,
    progressPercentage,
    paymentsCount: userPayments.length,
    isFullyPaid: quota > 0 && remainingBalance === 0,
    hasStartedPaying: totalPaid > 0,
    lastPaymentDate,
  };
}

export function formatMoney(amount: number, currency: string = '$'): string {
  try {
    const formatted = Math.round(amount).toLocaleString('es-CO');
    return `${currency} ${formatted}`;
  } catch {
    return `${currency} ${amount}`;
  }
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Fecha pendiente';
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
  saveExpenses(INITIAL_EXPENSES);
}

export function clearData(): void {
  saveParticipants([]);
  savePayments([]);
  saveExpenses([]);
}

export function exportFullDataJSON(): string {
  const settings = loadTripSettings();
  const participants = loadParticipants();
  const payments = loadPayments();
  const expenses = loadExpenses();
  return JSON.stringify({ settings, participants, payments, expenses, exportedAt: new Date().toISOString() }, null, 2);
}

export function importFullDataJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (!data || (!data.settings && !data.participants)) return false;
    if (data.settings) saveTripSettings(data.settings);
    if (Array.isArray(data.participants)) saveParticipants(data.participants);
    if (Array.isArray(data.payments)) savePayments(data.payments);
    if (Array.isArray(data.expenses)) saveExpenses(data.expenses);
    return true;
  } catch (err) {
    console.error('Error importing backup JSON', err);
    return false;
  }
}

export function generateCSVReport(
  participants: Participant[], 
  payments: Payment[], 
  currency: string = '$',
  expenses: Expense[] = [],
  settings?: TripSettings
): string {
  const BOM = '\uFEFF';

  let totalQuota = 0;
  let totalCollected = 0;
  participants.forEach((p) => {
    const fin = calculateFinancials(p, payments);
    totalQuota += Math.max(0, p.quota || 0);
    totalCollected += fin.totalPaid;
  });
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netBalance = totalCollected - totalExpenses;

  const lines: string[] = [];

  lines.push(`"INFORME FINANCIERO Y CONTROL DE CAJA - ${settings?.title ? settings.title.replace(/"/g, '""') : 'PASEOMANAGER'}"`);
  lines.push(`"Generado: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}"`);
  lines.push('');
  lines.push('"1. RESUMEN FINANCIERO (CONTROL DE CAJA DEL ORGANIZADOR)"');
  lines.push('"Concepto","Monto","Detalle"');
  lines.push(`"Total Meta Cuotas Viajeros","${totalQuota}","Suma de cuotas acordadas (${participants.length} participantes)"`);
  lines.push(`"Total Recaudado (Ingresos por Abonos)","${totalCollected}","Dinero total recibido de los participantes"`);
  lines.push(`"Total Gastos y Salidas Realizadas (Egresos)","${totalExpenses}","Dinero pagado a proveedores"`);
  lines.push(`"SALDO NETO DISPONIBLE EN CAJA","${netBalance}","Dinero físico/digital disponible en poder del organizador"`);
  lines.push(`"Saldo Pendiente por Recaudar de Viajeros","${Math.max(0, totalQuota - totalCollected)}","Pendiente por ingresar a caja"`);
  lines.push('');

  lines.push('"2. CONTROL DE GASTOS Y SALIDAS DE DINERO (EGRESOS PRIVADOS DEL ORGANIZADOR)"');
  lines.push('"Fecha","Concepto / Detalle","Categoría","Monto Salida","Método de Pago","Pagado a / Proveedor","No. Recibo / Ref","Notas"');
  if (expenses.length === 0) {
    lines.push('"Sin gastos registrados aún","","","0","","","",""');
  } else {
    expenses.forEach((e) => {
      const cleanConcept = (e.concept || '').replace(/"/g, '""');
      const cleanPaidTo = (e.paidTo || '').replace(/"/g, '""');
      const cleanReceipt = (e.receiptNumber || '').replace(/"/g, '""');
      const cleanNotes = (e.notes || '').replace(/,/g, ';').replace(/"/g, '""');
      lines.push([
        `"${e.date}"`,
        `"${cleanConcept}"`,
        `"${e.category}"`,
        e.amount,
        `"${e.paymentMethod}"`,
        `"${cleanPaidTo}"`,
        `"${cleanReceipt}"`,
        `"${cleanNotes}"`
      ].join(','));
    });
  }
  lines.push('');

  lines.push('"3. ESTADO DE CUENTA DE VIAJEROS (INGRESOS)"');
  lines.push('"ID","Nombre del Viajero","Teléfono","Documento","Cuota Acordada","Total Abonado","Saldo Pendiente","% Pagado","Estado","Notas"');
  participants.forEach((p) => {
    const fin = calculateFinancials(p, payments);
    const estado = fin.isFullyPaid ? 'Pagado Total' : fin.hasStartedPaying ? 'Abonando' : 'Sin Abonos';
    const cleanNotes = (p.notes || '').replace(/,/g, ';').replace(/"/g, '""');
    lines.push([
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
    ].join(','));
  });
  lines.push('');

  lines.push('"4. HISTORIAL DE ABONOS RECIBIDOS (ENTRADAS)"');
  lines.push('"Fecha","Viajero","Monto Abonado","Método de Pago","No. Comprobante / Referencia","Notas"');
  const sortedPays = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  sortedPays.forEach((pay) => {
    const traveler = participants.find((p) => p.id === pay.participantId);
    const travelerName = traveler ? traveler.name.replace(/"/g, '""') : 'Desconocido';
    const cleanRef = (pay.reference || '').replace(/"/g, '""');
    const cleanNotes = (pay.notes || '').replace(/,/g, ';').replace(/"/g, '""');
    lines.push([
      `"${pay.date}"`,
      `"${travelerName}"`,
      pay.amount,
      `"${pay.method}"`,
      `"${cleanRef}"`,
      `"${cleanNotes}"`
    ].join(','));
  });

  return BOM + lines.join('\n');
}

export function exportTripPayload(settings: TripSettings, participants: Participant[], payments: Payment[]): string {
  const compact = {
    s: {
      t: settings.title,
      d: settings.destination,
      dd: settings.departureDate,
      rd: settings.returnDate,
      c: settings.currency,
      on: settings.organizerName,
      op: settings.organizerPhone,
      oa: settings.organizerAccountInfo,
      desc: settings.description,
    },
    p: participants.map((p) => ({
      i: p.id,
      n: p.name,
      ph: p.phone,
      doc: p.documentId,
      q: p.quota,
      nt: p.notes,
      col: p.avatarColor,
    })),
    y: payments.map((y) => ({
      i: y.id,
      pi: y.participantId,
      a: y.amount,
      d: y.date,
      m: y.method,
      r: y.reference,
      n: y.notes,
    })),
  };

  const jsonStr = JSON.stringify(compact);
  const utf8Bytes = new TextEncoder().encode(jsonStr);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary);
}

export function importTripPayload(encoded: string): {
  settings?: Partial<TripSettings>;
  participants?: Participant[];
  payments?: Payment[];
} | null {
  try {
    const binary = atob(encoded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    const compact = JSON.parse(jsonStr);

    const settings: Partial<TripSettings> = compact.s
      ? {
          title: compact.s.t,
          destination: compact.s.d,
          departureDate: compact.s.dd,
          returnDate: compact.s.rd,
          currency: compact.s.c || '$',
          organizerName: compact.s.on,
          organizerPhone: compact.s.op,
          organizerAccountInfo: compact.s.oa,
          description: compact.s.desc,
        }
      : {};

    const participants: Participant[] = (compact.p || []).map((p: any) => ({
      id: p.i,
      name: p.n,
      phone: p.ph || '',
      documentId: p.doc || '',
      quota: p.q,
      notes: p.nt || '',
      avatarColor: p.col,
      createdAt: new Date().toISOString(),
    }));

    const payments: Payment[] = (compact.y || []).map((y: any) => ({
      id: y.i,
      participantId: y.pi,
      amount: y.a,
      date: y.d,
      method: y.m,
      reference: y.r || '',
      notes: y.n || '',
      createdAt: new Date().toISOString(),
    }));

    return { settings, participants, payments };
  } catch (err) {
    console.error('Failed to import payload from URL', err);
    return null;
  }
}

export function generateShareUrl(settings: TripSettings, participants: Participant[], payments: Payment[]): string {
  try {
    const payload = exportTripPayload(settings, participants, payments);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    return `${origin}${path}#trip=${payload}`;
  } catch {
    return typeof window !== 'undefined' ? window.location.href : '';
  }
}

export function generateWhatsAppSummary(
  settings: TripSettings,
  participants: Participant[],
  payments: Payment[],
  url: string
): string {
  const totalTarget = participants.reduce((acc, p) => acc + p.quota, 0);
  const totalPaid = payments.reduce((acc, y) => acc + y.amount, 0);
  const percent = totalTarget > 0 ? Math.round((totalPaid / totalTarget) * 100) : 0;

  return `🌴 *${settings.title}*
📍 *Destino:* ${settings.destination}
📅 *Salida:* ${settings.departureDate} ${settings.returnDate ? `· *Regreso:* ${settings.returnDate}` : ''}
👤 *Organizador:* ${settings.organizerName} (${settings.organizerPhone})

📊 *Estado del Paseo:*
👥 *Viajeros:* ${participants.length} inscritos
💰 *Total Recaudado:* ${formatMoney(totalPaid, settings.currency)} de ${formatMoney(totalTarget, settings.currency)} (${percent}%)

📲 *Consulta tu saldo y pagos registrados aquí:*
👉 ${url}

💳 *Cuentas para abonos:*
${settings.organizerAccountInfo || 'Consultar con el organizador'}`;
}

export function generateGitHubStorageCode(
  settings: TripSettings,
  participants: Participant[],
  payments: Payment[]
): string {
  return `export const INITIAL_SETTINGS: TripSettings = ${JSON.stringify(settings, null, 2)};

export const INITIAL_PARTICIPANTS: Participant[] = ${JSON.stringify(participants, null, 2)};

export const INITIAL_PAYMENTS: Payment[] = ${JSON.stringify(payments, null, 2)};`;
}
