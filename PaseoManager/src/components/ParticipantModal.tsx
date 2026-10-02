import React, { useState, useEffect } from 'react';
import { X, User, Phone, DollarSign, FileText, Check, ShieldAlert, CreditCard } from 'lucide-react';
import { Participant, TripSettings } from '../types';
import { formatMoney } from '../utils/storage';

interface ParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (participant: Partial<Participant>) => void;
  editingParticipant?: Participant | null;
  settings: TripSettings;
}

const AVATAR_COLORS = [
  'bg-emerald-600',
  'bg-teal-600',
  'bg-cyan-600',
  'bg-green-600',
  'bg-emerald-700',
  'bg-teal-700',
  'bg-slate-600',
  'bg-indigo-600',
];

export const ParticipantModal: React.FC<ParticipantModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingParticipant,
  settings,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [quota, setQuota] = useState<number | ''>(450000);
  const [notes, setNotes] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingParticipant) {
      setName(editingParticipant.name);
      setPhone(editingParticipant.phone || '');
      setDocumentId(editingParticipant.documentId || '');
      setQuota(editingParticipant.quota);
      setNotes(editingParticipant.notes || '');
      setAvatarColor(editingParticipant.avatarColor || AVATAR_COLORS[0]);
    } else {
      setName('');
      setPhone('');
      setDocumentId('');
      setQuota(450000);
      setNotes('');
      setAvatarColor(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
    }
    setError('');
  }, [editingParticipant, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor ingresa el nombre del participante.');
      return;
    }
    if (quota === '' || Number(quota) < 0) {
      setError('La cuota asignada no puede ser negativa.');
      return;
    }

    onSave({
      id: editingParticipant?.id,
      name: name.trim(),
      phone: phone.trim(),
      documentId: documentId.trim(),
      quota: Number(quota),
      notes: notes.trim(),
      avatarColor,
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
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {editingParticipant ? 'Editar Viajero' : 'Inscribir Nuevo Viajero'}
            </h2>
            <p className="text-xs text-slate-500">
              Registra los datos y la cuota personalizada correspondiente a esta persona.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>Nombre y Apellidos *</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Juan Pérez"
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Quota (Personalized value for this traveler) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cuota Asignada para este Viajero ({settings.currency}) *</span>
              </label>
              {quota !== '' && (
                <span className="text-xs font-bold text-emerald-700 font-mono-numbers">
                  {formatMoney(Number(quota), settings.currency)}
                </span>
              )}
            </div>
            <input
              type="number"
              min="0"
              step="5000"
              value={quota}
              onChange={(e) => setQuota(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Ej. 450000"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-base font-bold font-mono-numbers outline-none transition-all"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Puedes definir una tarifa distinta si viaja con niño, pareja, habitación individual o sin transporte.
            </p>
          </div>

          {/* Phone & Document ID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Teléfono / WhatsApp</span>
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ej. 312 456 7890"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>No. Documento / Cédula</span>
              </label>
              <input
                type="text"
                value={documentId}
                onChange={(e) => setDocumentId(e.target.value)}
                placeholder="Ej. 10203040"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Notas o Detalles de Habitación (Opcional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej. Habitación triple con Mariana, incluye alimentación completa"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Avatar Color Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Color de Identificación
            </label>
            <div className="flex items-center gap-2">
              {AVATAR_COLORS.map((col) => (
                <button
                  type="button"
                  key={col}
                  onClick={() => setAvatarColor(col)}
                  className={`w-7 h-7 rounded-lg ${col} transition-all cursor-pointer ${
                    avatarColor === col ? 'ring-2 ring-offset-2 ring-emerald-600 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Actions */}
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
              <span>{editingParticipant ? 'Guardar Cambios' : 'Registrar Viajero'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
