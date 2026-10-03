import React, { useState, useEffect } from 'react';
import { X, Receipt, DollarSign, Calendar, CreditCard, UserCheck, Tag, FileText } from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod } from '../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Partial<Expense>) => void;
  expense?: Expense | null;
  currency?: string;
}

const CATEGORIES: ExpenseCategory[] = [
  'Hospedaje / Cabaña',
  'Transporte / Gasolina',
  'Alimentación / Bebidas',
  'Actividades / Entradas',
  'Logística / Imprevistos',
  'Otro',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'Nequi',
  'Daviplata',
  'Efectivo',
  'Transferencia Bancaria',
  'Tarjeta / Otro',
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  expense,
  currency = '$',
}) => {
  const [concept, setConcept] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Hospedaje / Cabaña');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Nequi');
  const [paidTo, setPaidTo] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (expense) {
      setConcept(expense.concept || '');
      setCategory(expense.category || 'Hospedaje / Cabaña');
      setAmount(expense.amount || '');
      setDate(expense.date || new Date().toISOString().split('T')[0]);
      setPaymentMethod(expense.paymentMethod || 'Nequi');
      setPaidTo(expense.paidTo || '');
      setReceiptNumber(expense.receiptNumber || '');
      setNotes(expense.notes || '');
    } else {
      setConcept('');
      setCategory('Hospedaje / Cabaña');
      setAmount('');
      setDate(new Date().toISOString().split('T')[0]);
      setPaymentMethod('Nequi');
      setPaidTo('');
      setReceiptNumber('');
      setNotes('');
    }
    setError('');
  }, [expense, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) {
      setError('Por favor escribe el concepto o nombre del gasto.');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Por favor ingresa un monto válido mayor a 0.');
      return;
    }

    onSave({
      ...(expense ? { id: expense.id } : {}),
      concept: concept.trim(),
      category,
      amount: Number(amount),
      date,
      paymentMethod,
      paidTo: paidTo.trim(),
      receiptNumber: receiptNumber.trim(),
      notes: notes.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-7">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {expense ? 'Editar Gasto / Salida' : 'Registrar Nuevo Gasto / Salida'}
            </h2>
            <p className="text-xs text-slate-500">
              Registro privado del organizador. No reduce el dinero recaudado de los viajeros.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Concepto o Detalle del Gasto *</span>
            </label>
            <input
              type="text"
              required
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="Ej: Anticipo 50% de la Cabaña / Alquiler de Van"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-slate-900 outline-none transition-all placeholder:text-slate-400 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-600" />
                <span>Categoría *</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-slate-900 bg-white outline-none transition-all text-xs sm:text-sm"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-amber-600" />
                <span>Monto Pagado ({currency}) *</span>
              </label>
              <input
                type="number"
                required
                min="1000"
                step="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="Ej: 450000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-slate-900 outline-none transition-all font-mono font-medium text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Fecha del Pago *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-slate-900 outline-none transition-all text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-amber-600" />
                <span>Método de Salida *</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-slate-900 bg-white outline-none transition-all text-xs sm:text-sm"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-slate-500" />
                <span>Pagado a / Proveedor (Opcional)</span>
              </label>
              <input
                type="text"
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                placeholder="Ej: Don Pedro (Dueño Finca)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-slate-900 outline-none transition-all text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-slate-500" />
                <span>No. Recibo / Comprobante</span>
              </label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="Ej: REC-4921 o Ref. Nequi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-slate-900 outline-none transition-all text-xs sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Notas u Observaciones del Pago (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detalles sobre lo acordado, qué incluye o pendientes por pagar..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-slate-900 outline-none transition-all text-xs sm:text-sm resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors font-medium text-xs sm:text-sm cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold shadow-xs transition-colors text-xs sm:text-sm cursor-pointer"
            >
              {expense ? 'Guardar Cambios' : 'Registrar Salida'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
