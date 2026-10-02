import React from 'react';
import { CheckCircle2, Clock, AlertCircle, ChevronRight, PlusCircle } from 'lucide-react';
import { Participant, Payment, TripSettings } from '../types';
import { calculateFinancials, formatMoney } from '../utils/storage';

interface ParticipantCardProps {
  participant: Participant;
  payments: Payment[];
  settings: TripSettings;
  isAdmin: boolean;
  onSelect: (participant: Participant) => void;
  onQuickAddPayment?: (participant: Participant) => void;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  payments,
  settings,
  isAdmin,
  onSelect,
  onQuickAddPayment,
}) => {
  const fin = calculateFinancials(participant, payments);

  // Generate initials for avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  return (
    <div
      onClick={() => onSelect(participant)}
      className="group relative bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/50 hover:shadow-md transition-all duration-200 p-5 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Header: Avatar, Name, Status */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl text-white font-bold flex items-center justify-center text-sm shadow-xs ${
                participant.avatarColor || 'bg-emerald-600'
              }`}
            >
              {getInitials(participant.name)}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                {participant.name}
              </h3>
              {/* Unboxed metadata per frontend design */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                {participant.phone && <span>{participant.phone}</span>}
                {participant.phone && participant.notes && <span aria-hidden="true">·</span>}
                {participant.notes && <span className="line-clamp-1 italic">{participant.notes}</span>}
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="shrink-0">
            {fin.isFullyPaid ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Paz y Salvo</span>
              </span>
            ) : fin.hasStartedPaying ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>En Abonos</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Sin Abonos</span>
              </span>
            )}
          </div>
        </div>

        {/* Financial Numbers with Tabular Figures */}
        <div className="grid grid-cols-2 gap-2 py-3 px-3.5 bg-slate-50 rounded-xl border border-slate-100 mb-3">
          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Total Abonado</span>
            <span className="text-base font-bold text-emerald-700 font-mono-numbers">
              {formatMoney(fin.totalPaid, settings.currency)}
            </span>
          </div>

          <div>
            <span className="text-[11px] font-medium text-slate-500 block">Saldo Pendiente</span>
            <span
              className={`text-base font-bold font-mono-numbers ${
                fin.remainingBalance > 0 ? 'text-amber-700' : 'text-slate-400'
              }`}
            >
              {fin.remainingBalance > 0 ? formatMoney(fin.remainingBalance, settings.currency) : '$ 0 (Pagado)'}
            </span>
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-500 font-medium">
              Cuota Total: <strong className="text-slate-700 font-mono-numbers">{formatMoney(participant.quota, settings.currency)}</strong>
            </span>
            <span className="font-bold text-slate-900 font-mono-numbers">
              {fin.progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-slate-200/80 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                fin.isFullyPaid ? 'bg-emerald-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${fin.progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="text-slate-500 font-medium">
          {fin.paymentsCount === 1 ? '1 abono registrado' : `${fin.paymentsCount} abonos registrados`}
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && onQuickAddPayment && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickAddPayment(participant);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
              title="Registrar abono rápido"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Abonar</span>
            </button>
          )}

          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 group-hover:translate-x-0.5 transition-transform">
            <span>Ver historial</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
