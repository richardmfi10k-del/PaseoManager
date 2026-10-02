import React, { useState } from 'react';
import { Calendar, MapPin, Users, CheckCircle2, TrendingUp, CreditCard, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { TripSettings, Participant, Payment } from '../types';
import { calculateFinancials, formatMoney, formatDate } from '../utils/storage';

interface HeroBannerProps {
  settings: TripSettings;
  participants: Participant[];
  payments: Payment[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  settings,
  participants,
  payments,
}) => {
  const [copied, setCopied] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);

  // Compute aggregated stats
  let totalQuota = 0;
  let totalCollected = 0;
  let fullyPaidCount = 0;

  participants.forEach((p) => {
    const fin = calculateFinancials(p, payments);
    totalQuota += Math.max(0, p.quota || 0);
    totalCollected += fin.totalPaid;
    if (fin.isFullyPaid) fullyPaidCount++;
  });

  const remainingToCollect = Math.max(0, totalQuota - totalCollected);
  const globalPercentage = totalQuota > 0 ? Math.min(100, Math.round((totalCollected / totalQuota) * 100)) : 0;

  const handleCopyAccounts = () => {
    if (settings.organizerAccountInfo) {
      navigator.clipboard.writeText(settings.organizerAccountInfo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="relative mb-8 rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
      {/* Background Photography with measured scrim */}
      <div className="absolute inset-0 z-0">
        <img
          src={settings.bannerUrl}
          alt={settings.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-45 scale-102 transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-slate-950/40" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 p-6 sm:p-8 md:p-10 text-white">
        <div className="max-w-4xl">
          {/* Tag & Destination */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-medium text-emerald-300 mb-3">
            <span className="flex items-center gap-1.5 bg-emerald-950/70 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-300 backdrop-blur-md">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{settings.destination}</span>
            </span>

            <span className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 px-3 py-1 rounded-full text-slate-200 backdrop-blur-md">
              <Calendar className="w-3.5 h-3.5 text-slate-300" />
              <span>Salida: {formatDate(settings.departureDate)}</span>
              {settings.returnDate && <span> - Regreso: {formatDate(settings.returnDate)}</span>}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-3 text-balance">
            {settings.title}
          </h1>

          {settings.description && (
            <p className="text-sm sm:text-base text-slate-300 line-clamp-2 max-w-2xl mb-6">
              {settings.description}
            </p>
          )}

          {/* Account Details Quick Dropdown for Travelers */}
          {settings.organizerAccountInfo && (
            <div className="mb-6">
              <button
                onClick={() => setShowAccountDetails(!showAccountDetails)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              >
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Cuentas para realizar abonos (Nequi, Daviplata, Bancos)</span>
                {showAccountDetails ? (
                  <ChevronUp className="w-4 h-4 text-emerald-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-emerald-400" />
                )}
              </button>

              {showAccountDetails && (
                <div className="mt-3 p-4 rounded-2xl bg-slate-900/90 border border-emerald-500/30 backdrop-blur-md text-xs sm:text-sm text-slate-200 max-w-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                  <div>
                    <span className="font-semibold text-emerald-400 block mb-1">
                      Coordinador: {settings.organizerName} {settings.organizerPhone && `(${settings.organizerPhone})`}
                    </span>
                    <p className="text-slate-300 select-all font-mono-numbers text-xs">
                      {settings.organizerAccountInfo}
                    </p>
                  </div>
                  <button
                    onClick={handleCopyAccounts}
                    className="self-start sm:self-center shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-white" />
                        <span>¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Datos</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global Stats Grid with Tabular Numerals */}
        <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/60 backdrop-blur-xs">
            <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Recaudado Total
            </span>
            <div className="text-lg sm:text-2xl font-bold font-mono-numbers text-emerald-400">
              {formatMoney(totalCollected, settings.currency)}
            </div>
            <div className="text-xs text-slate-400 mt-1 font-mono-numbers">
              Meta: {formatMoney(totalQuota, settings.currency)}
            </div>
          </div>

          <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/60 backdrop-blur-xs">
            <span className="text-xs text-slate-400 block mb-1">Progreso Global</span>
            <div className="text-lg sm:text-2xl font-bold font-mono-numbers text-white flex items-baseline gap-1">
              <span>{globalPercentage}%</span>
              <span className="text-xs font-normal text-slate-400">cubierto</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-2 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${globalPercentage}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/60 backdrop-blur-xs">
            <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              Viajeros Inscritos
            </span>
            <div className="text-lg sm:text-2xl font-bold font-mono-numbers text-white">
              {participants.length}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {remainingToCollect > 0 ? (
                <span className="text-amber-400 font-mono-numbers">
                  Resta: {formatMoney(remainingToCollect, settings.currency)}
                </span>
              ) : (
                <span className="text-emerald-400">¡100% Recaudado!</span>
              )}
            </div>
          </div>

          <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/60 backdrop-blur-xs">
            <span className="text-xs text-slate-400 block mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              A Paz y Salvo
            </span>
            <div className="text-lg sm:text-2xl font-bold font-mono-numbers text-emerald-400">
              {fullyPaidCount} <span className="text-sm font-normal text-slate-400">/ {participants.length}</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {participants.length - fullyPaidCount} con abonos pendientes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
