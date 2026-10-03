import React, { useState } from 'react';
import { 
  UserPlus, 
  DollarSign, 
  Settings, 
  FileSpreadsheet, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Eye,
  Receipt,
  Wallet,
  Tag
} from 'lucide-react';
import { Participant, Payment, TripSettings } from '../types';
import { calculateFinancials, formatMoney, formatDate } from '../utils/storage';
import { ExpenseModal } from './ExpenseModal';

export type ExpenseCategory = 
  | 'Hospedaje / Cabaña'
  | 'Transporte / Gasolina'
  | 'Alimentación / Bebidas'
  | 'Actividades / Entradas'
  | 'Logística / Imprevistos'
  | 'Otro';

export interface Expense {
  id: string;
  concept: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: string;
  paidTo?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
}

interface AdminDashboardProps {
  settings: TripSettings;
  participants: Participant[];
  payments: Payment[];
  expenses?: Expense[];
  onOpenAddParticipant: () => void;
  onOpenEditParticipant: (participant: Participant) => void;
  onDeleteParticipant: (participantId: string) => void;
  onOpenAddPayment: (participant?: Participant) => void;
  onOpenAddExpense?: () => void;
  onOpenEditExpense?: (expense: Expense) => void;
  onDeleteExpense?: (expenseId: string) => void;
  onOpenSettings: () => void;
  onSelectParticipant: (participant: Participant) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  participants,
  payments,
  expenses,
  onOpenAddParticipant,
  onOpenEditParticipant,
  onDeleteParticipant,
  onOpenAddPayment,
  onOpenAddExpense,
  onOpenEditExpense,
  onDeleteExpense,
  onOpenSettings,
  onSelectParticipant,
}) => {
  // Estado de gastos con respaldo en memoria local
  const [localExpenses, setLocalExpenses] = useState<Expense[]>(() => {
    try {
      const raw = localStorage.getItem('paseomanager_expenses_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [
      {
        id: 'exp-1',
        concept: 'Anticipo Reserva Cabaña y Finca (50%)',
        category: 'Hospedaje / Cabaña',
        amount: 800000,
        date: '2026-09-08',
        paymentMethod: 'Transferencia Bancaria',
        paidTo: 'Cabañas del Mar Palomino',
        receiptNumber: 'REC-0912',
        notes: 'Pago del 50% para congelar tarifa de las 3 noches',
        createdAt: '2026-09-08T17:00:00Z',
      },
      {
        id: 'exp-2',
        concept: 'Apartado Transporte Van 15 Pasajeros',
        category: 'Transporte / Gasolina',
        amount: 400000,
        date: '2026-09-10',
        paymentMethod: 'Nequi',
        paidTo: 'Transportes Caribe Express',
        receiptNumber: 'V-4421',
        notes: 'Anticipo al conductor para asegurar el vehículo ida y vuelta',
        createdAt: '2026-09-10T12:30:00Z',
      },
    ];
  });

  const [internalModalOpen, setInternalModalOpen] = useState(false);
  const [internalEditingExpense, setInternalEditingExpense] = useState<Expense | null>(null);

  const activeExpenses = (expenses && expenses.length > 0) ? expenses : localExpenses;

  const [searchTerm, setSearchTerm] = useState('');
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'zero'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'expenses' | 'recent_payments'>('table');

  // Métricas financieras
  let totalQuota = 0;
  let totalPaid = 0;
  let fullyPaidCount = 0;

  participants.forEach((p) => {
    const fin = calculateFinancials(p, payments);
    totalQuota += Math.max(0, p.quota || 0);
    totalPaid += fin.totalPaid;
    if (fin.isFullyPaid) fullyPaidCount++;
  });

  const totalExpenses = activeExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netCashBalance = totalPaid - totalExpenses;
  const totalRemaining = Math.max(0, totalQuota - totalPaid);
  const globalPercentage = totalQuota > 0 ? Math.min(100, Math.round((totalPaid / totalQuota) * 100)) : 0;

  // Filtrar viajeros
  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.documentId && p.documentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.phone && p.phone.includes(searchTerm));

    if (!matchesSearch) return false;

    const fin = calculateFinancials(p, payments);
    if (filterStatus === 'paid') return fin.isFullyPaid;
    if (filterStatus === 'pending') return !fin.isFullyPaid && fin.hasStartedPaying;
    if (filterStatus === 'zero') return !fin.hasStartedPaying;

    return true;
  });

  // Filtrar gastos
  const filteredExpenses = activeExpenses.filter((e) => {
    const matchesCategory = selectedExpenseCategory === 'all' || e.category === selectedExpenseCategory;
    const matchesSearch =
      e.concept.toLowerCase().includes(expenseSearchTerm.toLowerCase()) ||
      (e.paidTo && e.paidTo.toLowerCase().includes(expenseSearchTerm.toLowerCase())) ||
      (e.receiptNumber && e.receiptNumber.toLowerCase().includes(expenseSearchTerm.toLowerCase())) ||
      (e.notes && e.notes.toLowerCase().includes(expenseSearchTerm.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleTriggerAddExpense = () => {
    if (onOpenAddExpense) {
      onOpenAddExpense();
    } else {
      setInternalEditingExpense(null);
      setInternalModalOpen(true);
    }
  };

  const handleTriggerEditExpense = (exp: Expense) => {
    if (onOpenEditExpense) {
      onOpenEditExpense(exp);
    } else {
      setInternalEditingExpense(exp);
      setInternalModalOpen(true);
    }
  };

  const handleTriggerDeleteExpense = (expId: string) => {
    if (onDeleteExpense) {
      onDeleteExpense(expId);
    } else {
      const updated = localExpenses.filter((e) => e.id !== expId);
      setLocalExpenses(updated);
      try {
        localStorage.setItem('paseomanager_expenses_v1', JSON.stringify(updated));
      } catch {}
    }
  };

  const handleSaveInternalExpense = (expData: Partial<Expense>) => {
    let updated: Expense[];
    if (expData.id) {
      updated = localExpenses.map((e) => (e.id === expData.id ? ({ ...e, ...expData } as Expense) : e));
    } else {
      const newExp: Expense = {
        id: `exp-${Date.now()}`,
        concept: expData.concept || 'Gasto',
        category: (expData.category as ExpenseCategory) || 'Hospedaje / Cabaña',
        amount: Number(expData.amount) || 0,
        date: expData.date || new Date().toISOString().split('T')[0],
        paymentMethod: expData.paymentMethod || 'Nequi',
        paidTo: expData.paidTo || '',
        receiptNumber: expData.receiptNumber || '',
        notes: expData.notes || '',
        createdAt: new Date().toISOString(),
      };
      updated = [newExp, ...localExpenses];
    }
    setLocalExpenses(updated);
    try {
      localStorage.setItem('paseomanager_expenses_v1', JSON.stringify(updated));
    } catch {}
    setInternalModalOpen(false);
  };

  // Descargar Excel Completo
  const handleExportCSV = () => {
    const BOM = '\uFEFF';
    const lines: string[] = [];

    // 1. Resumen
    lines.push(`"INFORME FINANCIERO Y CONTROL DE CAJA - ${settings.title.replace(/"/g, '""')}"`);
    lines.push(`"Fecha de Emisión: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}"`);
    lines.push('');
    lines.push('"1. RESUMEN FINANCIERO GENERAL (CONTROL DE CAJA DEL ORGANIZADOR)"');
    lines.push('"Concepto","Monto","Detalle"');
    lines.push(`"Total Meta Cuotas Viajeros","${totalQuota}","Suma de cuotas acordadas (${participants.length} participantes)"`);
    lines.push(`"Total Recaudado (Ingresos de Abonos)","${totalPaid}","Dinero total recibido de los participantes"`);
    lines.push(`"Total Gastos y Salidas Realizadas (Egresos)","${totalExpenses}","Dinero pagado a proveedores (cabañas, transporte, comida, etc.)"`);
    lines.push(`"SALDO NETO DISPONIBLE EN CAJA","${netCashBalance}","Dinero físico/digital en poder del organizador"`);
    lines.push(`"Saldo Pendiente por Recaudar de Viajeros","${totalRemaining}","Dinero por cobrar"`);
    lines.push('');

    // 2. Control de Gastos
    lines.push('"2. REGISTRO DE GASTOS Y SALIDAS DE DINERO (EGRESOS PRIVADOS DEL ORGANIZADOR)"');
    lines.push('"Fecha","Concepto / Detalle","Categoría","Monto Salida","Método de Pago","Pagado a / Proveedor","No. Recibo / Ref","Notas"');
    if (activeExpenses.length === 0) {
      lines.push('"Sin gastos registrados aún","","","0","","","",""');
    } else {
      activeExpenses.forEach((e) => {
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

    // 3. Viajeros
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

    // 4. Historial de Abonos
    lines.push('"4. HISTORIAL DE ABONOS RECIBIDOS (ENTRADAS)"');
    lines.push('"Fecha","Viajero","Monto Abonado","Método de Pago","No. Comprobante / Referencia","Notas"');
    sortedPayments.forEach((pay) => {
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

    const csvContent = BOM + lines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_financiero_${settings.title.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Barra de Acciones */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Panel de Administración y Control
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Gestiona el dinero recaudado de los viajeros, asienta las salidas de gastos y mantén tu caja al día.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenAddPayment()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>+ Registrar Abono</span>
            </button>

            {/* BOTÓN NUEVO DE GASTOS */}
            <button
              onClick={handleTriggerAddExpense}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              <Receipt className="w-4 h-4" />
              <span>+ Registrar Gasto</span>
            </button>

            <button
              onClick={onOpenAddParticipant}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Nuevo Viajero</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm transition-colors cursor-pointer border border-slate-200"
              title="Configuración general"
            >
              <Settings className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Configuración</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 font-medium text-xs transition-colors cursor-pointer border border-emerald-200"
              title="Descargar reporte completo en Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span className="hidden md:inline font-semibold">Descargar Excel</span>
            </button>
          </div>
        </div>

        {/* 4 Tarjetas de Balance */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs">
          {/* Card 1: Total Recaudado */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80">
            <span className="text-slate-500 font-medium block mb-1">Total Recaudado (Abonos)</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-emerald-700 block">
              {formatMoney(totalPaid, settings.currency)}
            </span>
            <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
              {globalPercentage}% de {formatMoney(totalQuota, settings.currency)} meta
            </span>
          </div>

          {/* Card 2: Total Gastos Realizados */}
          <div className="bg-amber-50/60 p-3.5 sm:p-4 rounded-2xl border border-amber-200/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-amber-900 font-medium">Gastos Realizados</span>
              <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded-md">
                Privado
              </span>
            </div>
            <span className="text-lg sm:text-xl font-bold font-mono text-amber-800 block">
              {formatMoney(totalExpenses, settings.currency)}
            </span>
            <span className="text-[11px] text-amber-700/90 font-mono mt-0.5 block">
              {activeExpenses.length} salidas registradas
            </span>
          </div>

          {/* Card 3: Saldo Disponible en Caja */}
          <div className="bg-emerald-50/70 p-3.5 sm:p-4 rounded-2xl border border-emerald-300">
            <div className="flex items-center justify-between mb-1">
              <span className="text-emerald-950 font-bold">Disponible en Caja</span>
              <Wallet className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <span className="text-lg sm:text-xl font-bold font-mono text-emerald-800 block">
              {formatMoney(netCashBalance, settings.currency)}
            </span>
            <span className="text-[11px] text-emerald-700 mt-0.5 block">
              Recaudado - Gastos en manos del org.
            </span>
          </div>

          {/* Card 4: Saldo por Cobrar */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200/80">
            <span className="text-slate-500 font-medium block mb-1">Pendiente por Cobrar</span>
            <span className="text-lg sm:text-xl font-bold font-mono text-slate-800 block">
              {formatMoney(totalRemaining, settings.currency)}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {participants.length - fullyPaidCount} viajeros por completar
            </span>
          </div>
        </div>
      </div>

      {/* Pestañas Principales */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👥 Lista de Viajeros ({participants.length})
            </button>
            <button
              onClick={() => setViewMode('expenses')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'expenses' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>💸 Gastos y Salidas ({activeExpenses.length})</span>
            </button>
            <button
              onClick={() => setViewMode('recent_payments')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'recent_payments' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🕒 Historial de Abonos ({payments.length})
            </button>
          </div>

          {viewMode === 'table' && (
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar viajero o cédula..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-emerald-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    filterStatus === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    filterStatus === 'pending' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Pendientes
                </button>
                <button
                  onClick={() => setFilterStatus('paid')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    filterStatus === 'paid' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Paz y Salvo
                </button>
              </div>
            </div>
          )}

          {viewMode === 'expenses' && (
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={expenseSearchTerm}
                  onChange={(e) => setExpenseSearchTerm(e.target.value)}
                  placeholder="Buscar gasto o proveedor..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-amber-600 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              <select
                value={selectedExpenseCategory}
                onChange={(e) => setSelectedExpenseCategory(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-700 outline-none cursor-pointer"
              >
                <option value="all">Todas las Categorías</option>
                <option value="Hospedaje / Cabaña">Hospedaje / Cabaña</option>
                <option value="Transporte / Gasolina">Transporte / Gasolina</option>
                <option value="Alimentación / Bebidas">Alimentación / Bebidas</option>
                <option value="Actividades / Entradas">Actividades / Entradas</option>
                <option value="Logística / Imprevistos">Logística / Imprevistos</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          )}
        </div>

        {/* 1. TABLA DE VIAJEROS */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Viajero</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4 text-right">Cuota Total</th>
                  <th className="py-3 px-4 text-right">Abonado</th>
                  <th className="py-3 px-4 text-right">Saldo</th>
                  <th className="py-3 px-4 text-center">Progreso</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      No se encontraron viajeros con ese criterio.
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((p) => {
                    const fin = calculateFinancials(p, payments);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-full ${p.avatarColor || 'bg-emerald-600'} text-white font-bold flex items-center justify-center text-xs shrink-0`}>
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-slate-900 block">{p.name}</span>
                              {p.documentId && <span className="text-[11px] text-slate-400 block font-mono">CC: {p.documentId}</span>}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                          {p.phone || 'Sin número'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900">
                          {formatMoney(p.quota, settings.currency)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-700">
                          {formatMoney(fin.totalPaid, settings.currency)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-medium">
                          {fin.remainingBalance > 0 ? (
                            <span className="text-amber-700">{formatMoney(fin.remainingBalance, settings.currency)}</span>
                          ) : (
                            <span className="text-slate-400">$0</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="w-24 mx-auto">
                            <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
                              <span>{fin.progressPercentage}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  fin.isFullyPaid ? 'bg-emerald-500' : 'bg-emerald-400'
                                }`}
                                style={{ width: `${fin.progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {fin.isFullyPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Paz y Salvo
                            </span>
                          ) : fin.hasStartedPaying ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3" />
                              Abonando
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600">
                              Sin Abonos
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenAddPayment(p)}
                              title="Registrar Abono a este viajero"
                              className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onSelectParticipant(p)}
                              title="Ver ficha detallada"
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onOpenEditParticipant(p)}
                              title="Editar datos de viajero"
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Seguro que deseas eliminar a ${p.name}? Se borrarán también sus abonos registrados.`)) {
                                  onDeleteParticipant(p.id);
                                }
                              }}
                              title="Eliminar viajero"
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. TABLA DE GASTOS Y SALIDAS (PRIVADO ORGANIZADOR) */}
        {viewMode === 'expenses' && (
          <div>
            <div className="px-5 py-3.5 bg-amber-50/70 border-b border-amber-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs text-amber-950">
                <Receipt className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Control Privado de Gastos:</strong> Estas salidas son visibles <strong>únicamente para ti como organizador</strong> y se exportan en tu Excel. El público solo ve el total recaudado de cuotas.
                </span>
              </div>
              <button
                onClick={handleTriggerAddExpense}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer shadow-xs"
              >
                + Nueva Salida
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 sm:px-6">Fecha</th>
                    <th className="py-3 px-4">Concepto / Detalle</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4 text-right">Monto Salida</th>
                    <th className="py-3 px-4">Método & Beneficiario</th>
                    <th className="py-3 px-4">Comprobante / Ref</th>
                    <th className="py-3 px-4 sm:px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {sortedExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-14 text-center">
                        <Receipt className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-slate-700">No hay gastos o salidas registradas todavía</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          Lleva el control de anticipos a cabañas, pagos de transporte, compras de víveres o pólizas.
                        </p>
                        <button
                          onClick={handleTriggerAddExpense}
                          className="mt-4 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          + Registrar Primera Salida
                        </button>
                      </td>
                    </tr>
                  ) : (
                    sortedExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(exp.date)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900 block">{exp.concept}</span>
                          {exp.notes && (
                            <span className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{exp.notes}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900">
                            <Tag className="w-3 h-3 text-amber-700" />
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-800 whitespace-nowrap">
                          -{formatMoney(exp.amount, settings.currency)}
                        </td>
                        <td className="py-3.5 px-4 text-xs">
                          <span className="font-medium text-slate-800 block">{exp.paymentMethod}</span>
                          {exp.paidTo && (
                            <span className="text-[11px] text-slate-500 block">A: {exp.paidTo}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500 whitespace-nowrap">
                          {exp.receiptNumber || '—'}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleTriggerEditExpense(exp)}
                              title="Editar gasto"
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`¿Seguro que deseas eliminar el gasto "${exp.concept}"?`)) {
                                  handleTriggerDeleteExpense(exp.id);
                                }
                              }}
                              title="Eliminar gasto"
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. HISTORIAL DE ABONOS */}
        {viewMode === 'recent_payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Fecha</th>
                  <th className="py-3 px-4">Viajero</th>
                  <th className="py-3 px-4 text-right">Monto Abonado</th>
                  <th className="py-3 px-4">Método</th>
                  <th className="py-3 px-4">No. Comprobante / Ref</th>
                  <th className="py-3 px-4 sm:px-6">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sortedPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No hay abonos registrados aún en el sistema.
                    </td>
                  </tr>
                ) : (
                  sortedPayments.map((pay) => {
                    const traveler = participants.find((p) => p.id === pay.participantId);
                    return (
                      <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 sm:px-6 font-mono text-xs text-slate-500">
                          {formatDate(pay.date)}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {traveler ? traveler.name : 'Viajero no encontrado'}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                          +{formatMoney(pay.amount, settings.currency)}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          {pay.method}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs text-slate-500">
                          {pay.reference || '—'}
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-500">
                          {pay.notes || '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Ventana Modal de Gasto Interna */}
      <ExpenseModal
        isOpen={internalModalOpen}
        onClose={() => setInternalModalOpen(false)}
        onSave={handleSaveInternalExpense}
        expense={internalEditingExpense}
        currency={settings.currency}
      />
    </div>
  );
};
