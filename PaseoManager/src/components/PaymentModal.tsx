import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Tag, FileText, User, Hash, Check } from 'lucide-react';
import { Participant, Payment, PaymentMethod, TripSettings } from '../types';
import { calculateFinancials, formatMoney } from '../utils/storage';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payment: Partial<Payment>) => void;
  participants: Participant[];
  payments: Payment[];
  settings: TripSettings;
  editingPayment?: Payment | null;
  initialParticipantId?: string | null;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  'Nequi',
  'Daviplata',
  'Efectivo',
  'Transferencia Bancaria',
  'Tarjeta / Otro',
];

const FIXED_PRESETS = [50000, 100000, 150000, 200000, 300000];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  participants,
  payments,
  settings,
  editingPayment,
  initialParticipantId,
}) => {
  const [participantId, setParticipantId] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('Nequi');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Inicializar campos ÚNICAMENTE cuando se abre el modal
  useEffect(() => {
    if (!isOpen) return;

    if (editingPayment) {
      setParticipantId(editingPayment.participantId);
      setAmount(editingPayment.amount);
      setDate(editingPayment.date);
      setMethod(editingPayment.method);
      setReference(editingPayment.reference || '');
      setNotes(editingPayment.notes || '');
    } else {
      setParticipantId(initialParticipantId || (participants[0]?.id ?? ''));
      setAmount('');
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setMethod('Nequi');
      setReference('');
      setNotes('');
    }
    setError('');
  }, [isOpen, editingPayment, initialParticipantId]);

  // Si los participantes cargan después de abrir y no había ninguno seleccionado
  useEffect(() => {
    if (isOpen && !participantId && participants.length > 0 && !editingPayment) {
      setParticipantId(initialParticipantId || participants[0].id);
    }
  }, [isOpen, participants.length, participantId, editingPayment, initialParticipantId]);

  if (!isOpen) return null;

  const selectedParticipant = participants.find((p) => p.id === participantId);
  const fin = selectedParticipant ? calculateFinancials(selectedParticipant, payments) : null;

  // Fijar precio exacto con los botones
  const handleSetFixedAmount = (val: number) => {
    setAmount(val);
    setError('');
  };

  // Sumar al monto actual
  const handleAddAmount = (val: number) => {
    setAmount((prev) => (Number(prev) || 0) + val);
    setError('');
  };

  // Escritura manual libre con separadores de miles
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawDigits = e.target.value.replace(/\D/g, '');
    if (!rawDigits) {
      setAmount('');
    } else {
      const num = parseInt(rawDigits, 10);
      setAmount(isNaN(num) ? '' : num);
    }
    if (error) setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantId) {
      setError('Por favor selecciona un participante.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('El monto del abono debe ser mayor a 0.');
      return;
    }
    if (!date) {
      setError('Por favor selecciona la fecha del abono.');
      return;
    }

    onSave({
      id: editingPayment?.id,
      participantId,
      amount: Number(amount),
      date,
      method,
      reference: reference.trim(),
      notes: notes.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-7">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {editingPayment ? 'Editar Abono Registrado' : 'Registrar Nuevo Abono'}
            </h2>
            <p className="text-xs text-slate-500">
              Registra el pago para que se cargue de inmediato al estado de cuenta del participante.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Selector de Participante */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Participante</span>
            </label>
            <select
              value={participantId}
              onChange={(e) => setParticipantId(e.target.value)}
              disabled={!!editingPayment}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all bg-white"
            >
              {participants.map((p) => {
                const f = calculateFinancials(p, payments);
                return (
                  <option key={p.id} value={p.id}>
                    {p.name} - Saldo pendiente: {formatMoney(f.remainingBalance, settings.currency)}
                  </option>
                );
              })}
            </select>

            {fin && (
              <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 font-mono-numbers">
                <span>Cuota: {formatMoney(selectedParticipant?.quota || 0, settings.currency)}</span>
                <span>Ya abonado: {formatMoney(fin.totalPaid, settings.currency)}</span>
                <span className="font-semibold text-amber-700">Resta: {formatMoney(fin.remainingBalance, settings.currency)}</span>
              </div>
            )}
          </div>

          {/* Monto del Abono y Precios Fijos */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Monto del Abono ({settings.currency})</span>
              </label>
              {fin && fin.remainingBalance > 0 && (
                <button
                  type="button"
                  onClick={() => handleSetFixedAmount(fin.remainingBalance)}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
                >
                  Pagar saldo completo ({formatMoney(fin.remainingBalance, settings.currency)})
                </button>
              )}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-base select-none">
                {settings.currency}
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={amount !== '' ? Number(amount).toLocaleString('es-CO') : ''}
                onChange={handleAmountChange}
                placeholder="0"
                autoFocus
                className="w-full pl-9 pr-14 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-lg font-bold font-mono-numbers outline-none transition-all placeholder:text-slate-300"
              />
              {amount !== '' && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Borrar
                </button>
              )}
            </div>

            {/* Botones de Precios Fijos */}
            <div className="mt-2.5 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Precios fijos (un solo toque):</span>
                <span className="text-slate-400">Haz clic para fijar</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {FIXED_PRESETS.map((val) => {
                  const isSelected = amount === val;
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleSetFixedAmount(val)}
                      className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs scale-102 ring-2 ring-emerald-600/30'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {formatMoney(val, settings.currency)}
                    </button>
                  );
                })}
                {fin && fin.remainingBalance > 0 && !FIXED_PRESETS.includes(fin.remainingBalance) && (
                  <button
                    type="button"
                    onClick={() => handleSetFixedAmount(fin.remainingBalance)}
                    className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      amount === fin.remainingBalance
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                    }`}
                  >
                    Saldo: {formatMoney(fin.remainingBalance, settings.currency)}
                  </button>
                )}
              </div>

              {/* Atajos para sumar */}
              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                <span>Sumar al valor:</span>
                <button
                  type="button"
                  onClick={() => handleAddAmount(10000)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors cursor-pointer"
                >
                  +10.000
                </button>
                <button
                  type="button"
                  onClick={() => handleAddAmount(50000)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors cursor-pointer"
                >
                  +50.000
                </button>
                <button
                  type="button"
                  onClick={() => handleAddAmount(100000)}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors cursor-pointer"
                >
                  +100.000
                </button>
              </div>
            </div>
          </div>

          {/* Fecha y Medio de Pago */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>Fecha del Pago</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Medio de Pago</span>
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all bg-white font-medium"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Comprobante y Notas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-slate-500" />
                <span>No. Comprobante / Ref. (Opcional)</span>
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ej. M9823412"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Nota Interna (Opcional)</span>
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej. Primer abono quincena"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Botones de Acción */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingPayment ? 'Guardar Cambios' : 'Registrar Abono'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
