import React, { useState } from 'react';
import { 
  UserPlus, 
  DollarSign, 
  Settings, 
  FileSpreadsheet, 
  Search, 
  Edit3, 
  Trash2, 
  History, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  PlusCircle, 
  TrendingUp, 
  Users, 
  Filter,
  Eye
} from 'lucide-react';
import { Participant, Payment, TripSettings } from '../types';
import { calculateFinancials, formatMoney, formatDate, generateCSVReport } from '../utils/storage';

interface AdminDashboardProps {
  settings: TripSettings;
  participants: Participant[];
  payments: Payment[];
  onOpenAddParticipant: () => void;
  onOpenEditParticipant: (participant: Participant) => void;
  onDeleteParticipant: (participantId: string) => void;
  onOpenAddPayment: (participant?: Participant) => void;
  onOpenSettings: () => void;
  onSelectParticipant: (participant: Participant) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  settings,
  participants,
  payments,
  onOpenAddParticipant,
  onOpenEditParticipant,
  onDeleteParticipant,
  onOpenAddPayment,
  onOpenSettings,
  onSelectParticipant,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'zero'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'recent_payments'>('table');

  // Overall financial stats
  let totalQuota = 0;
  let totalPaid = 0;
  let fullyPaidCount = 0;

  participants.forEach((p) => {
    const fin = calculateFinancials(p, payments);
    totalQuota += Math.max(0, p.quota || 0);
    totalPaid += fin.totalPaid;
    if (fin.isFullyPaid) fullyPaidCount++;
  });

  const totalRemaining = Math.max(0, totalQuota - totalPaid);
  const globalPercentage = totalQuota > 0 ? Math.min(100, Math.round((totalPaid / totalQuota) * 100)) : 0;

  // Filter participants
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

  // Recent payments sorted desc
  const sortedPayments = [...payments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleExportCSV = () => {
    const csvContent = generateCSVReport(participants, payments, settings.currency);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_abonos_${settings.title.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Admin Action Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Panel de Administración y Control
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Gestiona el listado oficial de viajeros, asigna cuotas individuales y asienta los pagos recibidos.
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
              title="Configuración del paseo y copias de seguridad"
            >
              <Settings className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Configuración</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 font-medium text-xs transition-colors cursor-pointer border border-emerald-200"
              title="Descargar tabla en formato Excel CSV"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden md:inline">Descargar Excel</span>
            </button>
          </div>
        </div>

        {/* Financial Highlights */}
        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-slate-500 block mb-1">Recaudación Real</span>
            <span className="text-lg font-bold font-mono-numbers text-emerald-700 block">
              {formatMoney(totalPaid, settings.currency)}
            </span>
            <span className="text-[11px] text-slate-400 font-mono-numbers">
              de {formatMoney(totalQuota, settings.currency)} meta
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-slate-500 block mb-1">Saldo por Cobrar</span>
            <span className="text-lg font-bold font-mono-numbers text-amber-700 block">
              {formatMoney(totalRemaining, settings.currency)}
            </span>
            <span className="text-[11px] text-slate-400 font-mono-numbers">
              {globalPercentage}% completado
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-slate-500 block mb-1">Viajeros Registrados</span>
            <span className="text-lg font-bold font-mono-numbers text-slate-900 block">
              {participants.length} personas
            </span>
            <span className="text-[11px] text-slate-400">
              {fullyPaidCount} a paz y salvo
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-slate-500 block mb-1">Total de Abonos</span>
            <span className="text-lg font-bold font-mono-numbers text-slate-900 block">
              {payments.length} transacciones
            </span>
            <span className="text-[11px] text-slate-400">
              Historial completo guardado
            </span>
          </div>
        </div>
      </div>

      {/* Main View Switching (Table vs Recent Payments) */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Filter and Search Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lista de Viajeros ({filteredParticipants.length})
            </button>
            <button
              onClick={() => setViewMode('recent_payments')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                viewMode === 'recent_payments' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Últimos Abonos ({payments.length})
            </button>
          </div>

          {viewMode === 'table' && (
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nombre o cédula..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    filterStatus === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    filterStatus === 'pending'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Con Saldo
                </button>
                <button
                  onClick={() => setFilterStatus('paid')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    filterStatus === 'paid'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Paz y Salvo
                </button>
                <button
                  onClick={() => setFilterStatus('zero')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    filterStatus === 'zero'
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Sin Abono
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View Mode 1: Participants Table */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Viajero</th>
                  <th className="py-3 px-4 text-right">Cuota Total</th>
                  <th className="py-3 px-4 text-right">Abonado</th>
                  <th className="py-3 px-4 text-right">Saldo Restante</th>
                  <th className="py-3 px-4 text-center">Progreso</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Acciones de Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-500">
                      <AlertCircle className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                      <p className="font-semibold text-slate-700">No se encontraron viajeros</p>
                      <p className="text-xs text-slate-400 mt-1">Prueba con otro término de búsqueda o agrega un nuevo viajero.</p>
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((participant) => {
                    const fin = calculateFinancials(participant, payments);

                    return (
                      <tr
                        key={participant.id}
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => onSelectParticipant(participant)}
                      >
                        {/* Name & Contact */}
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl text-white font-bold flex items-center justify-center text-xs shrink-0 ${
                                participant.avatarColor || 'bg-emerald-600'
                              }`}
                            >
                              {participant.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                {participant.name}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                                {participant.phone && <span>{participant.phone}</span>}
                                {participant.phone && participant.documentId && <span aria-hidden="true">·</span>}
                                {participant.documentId && <span>CC: {participant.documentId}</span>}
                              </div>
                              {participant.notes && (
                                <div className="text-[11px] text-slate-400 italic line-clamp-1 max-w-xs">
                                  {participant.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Quota */}
                        <td className="py-3.5 px-4 text-right font-mono-numbers font-semibold text-slate-800">
                          {formatMoney(participant.quota, settings.currency)}
                        </td>

                        {/* Total Paid */}
                        <td className="py-3.5 px-4 text-right font-mono-numbers font-bold text-emerald-700">
                          {formatMoney(fin.totalPaid, settings.currency)}
                        </td>

                        {/* Remaining */}
                        <td className="py-3.5 px-4 text-right font-mono-numbers font-bold">
                          {fin.remainingBalance > 0 ? (
                            <span className="text-amber-700">
                              {formatMoney(fin.remainingBalance, settings.currency)}
                            </span>
                          ) : (
                            <span className="text-slate-400">$ 0</span>
                          )}
                        </td>

                        {/* Progress */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-xs font-bold font-mono-numbers text-slate-800">
                              {fin.progressPercentage}%
                            </span>
                            <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                              <div
                                className="bg-emerald-600 h-full rounded-full"
                                style={{ width: `${fin.progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          {fin.isFullyPaid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Paz y Salvo</span>
                            </span>
                          ) : fin.hasStartedPaying ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>En Abonos</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                              <span>Sin Abonos</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td
                          className="py-3.5 px-4 sm:px-6 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onOpenAddPayment(participant)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                              title="Registrar abono para este viajero"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Abonar</span>
                            </button>

                            <button
                              onClick={() => onSelectParticipant(participant)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Ver ficha e historial de abonos"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => onOpenEditParticipant(participant)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title="Editar datos y cuota"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`¿Seguro que deseas eliminar a ${participant.name}? También se borrarán sus abonos registrados.`)) {
                                  onDeleteParticipant(participant.id);
                                }
                              }}
                              className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Eliminar participante"
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

        {/* View Mode 2: Recent Payments Log */}
        {viewMode === 'recent_payments' && (
          <div className="p-4 sm:p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 mb-3">
              Todos los Abonos Registrados ({sortedPayments.length})
            </h3>

            {sortedPayments.length === 0 ? (
              <div className="py-8 text-center text-slate-500">
                Aún no hay abonos registrados en el sistema.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                {sortedPayments.map((pay) => {
                  const traveler = participants.find((p) => p.id === pay.participantId);

                  return (
                    <div
                      key={pay.id}
                      className="p-3.5 sm:p-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {traveler?.name || 'Viajero no asignado'}
                          </span>
                          <span className="text-emerald-700 font-bold font-mono-numbers text-base">
                            {formatMoney(pay.amount, settings.currency)}
                          </span>
                          <span className="bg-emerald-50 text-emerald-800 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
                            {pay.method}
                          </span>
                        </div>

                        <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-2">
                          <span>Fecha: <strong className="text-slate-700">{formatDate(pay.date)}</strong></span>
                          {pay.reference && <span>· Comprobante: {pay.reference}</span>}
                          {pay.notes && <span className="italic">· {pay.notes}</span>}
                        </div>
                      </div>

                      {traveler && (
                        <button
                          onClick={() => onSelectParticipant(traveler)}
                          className="self-end sm:self-center px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          Ver Viajero
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
