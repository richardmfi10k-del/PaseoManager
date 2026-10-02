import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Clock, Calendar, Tag, FileText, Share2, Plus, Trash2, Edit2, Check, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Participant, Payment, TripSettings } from '../types';
import { calculateFinancials, formatMoney, formatDate } from '../utils/storage';

interface ParticipantDetailModalProps {
  participant: Participant | null;
  payments: Payment[];
  settings: TripSettings;
  isAdmin: boolean;
  onClose: () => void;
  onAddPaymentForParticipant?: (participant: Participant) => void;
  onEditPayment?: (payment: Payment) => void;
  onDeletePayment?: (paymentId: string) => void;
}

export const ParticipantDetailModal: React.FC<ParticipantDetailModalProps> = ({
  participant,
  payments,
  settings,
  isAdmin,
  onClose,
  onAddPaymentForParticipant,
  onEditPayment,
  onDeletePayment,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (participant) {
      const fin = calculateFinancials(participant, payments);
      if (fin.isFullyPaid) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#059669', '#10B981', '#34D399', '#FBBF24'],
        });
      }
    }
  }, [participant, payments]);

  if (!participant) return null;

  const fin = calculateFinancials(participant, payments);
  const userPayments = payments
    .filter((p) => p.participantId === participant.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCopyWhatsApp = () => {
    const lines = [
      `🌴 *Resumen de Abonos - ${settings.title}* 🌴`,
      `👤 *Viajero:* ${participant.name}`,
      `💰 *Cuota Total:* ${formatMoney(participant.quota, settings.currency)}`,
      `✅ *Total Abonado:* ${formatMoney(fin.totalPaid, settings.currency)}`,
      `⏳ *Saldo Pendiente:* ${formatMoney(fin.remainingBalance, settings.currency)}`,
      `📊 *Progreso:* ${fin.progressPercentage}%`,
      ``,
      `📋 *Historial de Pagos:*`,
      ...userPayments.map(
        (p, idx) =>
          `${idx + 1}. ${formatDate(p.date)} - ${formatMoney(p.amount, settings.currency)} (${p.method}${p.reference ? ` Ref: ${p.reference}` : ''})`
      ),
      ``,
      fin.isFullyPaid
        ? `🎉 *¡Felicidades, estás a Paz y Salvo para el paseo!*`
        : `💳 Puedes realizar tus siguientes abonos a: ${settings.organizerAccountInfo || 'Consulta con el organizador'}`,
    ];

    navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-6 sm:p-7 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800/80 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            {fin.isFullyPaid ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Paz y Salvo (100% Pagado)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-300 bg-amber-950/80 border border-amber-500/30 px-2.5 py-1 rounded-full">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Saldo Pendiente: {formatMoney(fin.remainingBalance, settings.currency)}</span>
              </span>
            )}

            {participant.phone && (
              <span className="text-xs text-slate-400">
                · Tel: {participant.phone}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {participant.name}
          </h2>

          {participant.notes && (
            <p className="text-xs sm:text-sm text-slate-300 mt-1 italic">
              {participant.notes}
            </p>
          )}

          {/* Quick Metrics */}
          <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-3 gap-3 text-center">
            <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">Cuota Total</span>
              <span className="text-sm sm:text-base font-bold font-mono-numbers text-white">
                {formatMoney(participant.quota, settings.currency)}
              </span>
            </div>
            <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">Abonado</span>
              <span className="text-sm sm:text-base font-bold font-mono-numbers text-emerald-400">
                {formatMoney(fin.totalPaid, settings.currency)}
              </span>
            </div>
            <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-[11px] text-slate-400 block mb-0.5">Pendiente</span>
              <span
                className={`text-sm sm:text-base font-bold font-mono-numbers ${
                  fin.remainingBalance > 0 ? 'text-amber-400' : 'text-slate-400'
                }`}
              >
                {formatMoney(fin.remainingBalance, settings.currency)}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${fin.progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content Body: Payments History */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Historial de Abonos ({userPayments.length})</span>
            </h3>

            {isAdmin && onAddPaymentForParticipant && (
              <button
                onClick={() => onAddPaymentForParticipant(participant)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar Abono</span>
              </button>
            )}
          </div>

          {userPayments.length === 0 ? (
            <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Aún no hay abonos registrados</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Los pagos o transferencias que el organizador confirme aparecerán listados aquí con fecha y comprobante.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {userPayments.map((payment, index) => (
                <div
                  key={payment.id}
                  className="bg-slate-50 hover:bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500 font-mono-numbers">
                        #{userPayments.length - index}
                      </span>
                      <span className="text-base font-bold font-mono-numbers text-slate-900">
                        {formatMoney(payment.amount, settings.currency)}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded-md">
                        <Tag className="w-3 h-3" />
                        <span>{payment.method}</span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
                      <span>Fecha: <strong className="text-slate-700">{formatDate(payment.date)}</strong></span>
                      {payment.reference && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono-numbers text-slate-600">Ref: {payment.reference}</span>
                        </>
                      )}
                    </div>

                    {payment.notes && (
                      <p className="text-xs text-slate-600 italic bg-white/70 p-1.5 rounded-lg border border-slate-200/50 mt-1">
                        Nota: {payment.notes}
                      </p>
                    )}
                  </div>

                  {/* Admin controls for individual payments */}
                  {isAdmin && (
                    <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                      {onEditPayment && (
                        <button
                          onClick={() => onEditPayment(payment)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="Editar este abono"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeletePayment && (
                        <button
                          onClick={() => {
                            if (confirm('¿Seguro que deseas eliminar este abono?')) {
                              onDeletePayment(payment.id);
                            }
                          }}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar abono"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleCopyWhatsApp}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200/80 rounded-xl transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-700" />
                <span>¡Copiado para WhatsApp!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-emerald-700" />
                <span>Copiar resumen para WhatsApp</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
