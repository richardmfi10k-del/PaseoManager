import React, { useState } from 'react';
import { Search, Users, AlertCircle, Info, Sparkles } from 'lucide-react';
import { Participant, Payment, TripSettings } from '../types';
import { ParticipantCard } from './ParticipantCard';
import { calculateFinancials } from '../utils/storage';

interface PublicBoardProps {
  settings: TripSettings;
  participants: Participant[];
  payments: Payment[];
  isAdmin: boolean;
  onSelectParticipant: (participant: Participant) => void;
  onQuickAddPayment?: (participant: Participant) => void;
}

export const PublicBoard: React.FC<PublicBoardProps> = ({
  settings,
  participants,
  payments,
  isAdmin,
  onSelectParticipant,
  onQuickAddPayment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.documentId && p.documentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.phone && p.phone.includes(searchTerm));

    if (!matchesSearch) return false;

    const fin = calculateFinancials(p, payments);
    if (filter === 'paid') return fin.isFullyPaid;
    if (filter === 'pending') return !fin.isFullyPaid;

    return true;
  });

  const fullyPaidCount = participants.filter((p) => calculateFinancials(p, payments).isFullyPaid).length;
  const pendingCount = participants.length - fullyPaidCount;

  return (
    <div className="space-y-6">
      {/* Board Controls Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Tablero de Viajeros y Abonos</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              En Vivo
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Busca tu nombre en el listado para revisar tus pagos registrados y saldo pendiente para el paseo.
          </p>
        </div>

        {/* Search & Segmented Filter */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por tu nombre..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all placeholder:text-slate-400 bg-white"
            />
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({participants.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === 'pending'
                  ? 'bg-white text-amber-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendientes ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('paid')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                filter === 'paid'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paz y Salvo ({fullyPaidCount})
            </button>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredParticipants.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No se encontraron participantes
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm
              ? `No hay nadie registrado con el nombre o documento "${searchTerm}".`
              : 'Aún no hay participantes en este estado.'}
          </p>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors cursor-pointer"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredParticipants.map((participant) => (
            <ParticipantCard
              key={participant.id}
              participant={participant}
              payments={payments}
              settings={settings}
              isAdmin={isAdmin}
              onSelect={onSelectParticipant}
              onQuickAddPayment={onQuickAddPayment}
            />
          ))}
        </div>
      )}

      {/* Helpful Traveler Notice */}
      <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs sm:text-sm text-emerald-900">
        <Info className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block text-emerald-950">
            ¿Hiciste un abono o transferencia recientemente?
          </strong>
          <p className="text-emerald-800 mt-0.5 leading-relaxed">
            Envía el comprobante por WhatsApp al organizador ({settings.organizerName} {settings.organizerPhone ? `- ${settings.organizerPhone}` : ''}). Tan pronto el pago sea validado en la cuenta, quedará cargado en tu tarjeta y el saldo se actualizará en este tablero.
          </p>
        </div>
      </div>
    </div>
  );
};
