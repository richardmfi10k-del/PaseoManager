import React, { useState } from 'react';
import { Lock, X, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { TripSettings } from '../types';

interface AdminLoginModalProps {
  isOpen: boolean;
  settings: TripSettings;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  settings,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check against configured admin password
    const correctPassword = settings.adminPassword || 'admin';
    if (password.trim() === correctPassword) {
      setPassword('');
      onLoginSuccess();
    } else {
      setError('Contraseña incorrecta. Por favor verifica e intenta nuevamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Acceso para Organizador
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs mx-auto">
            Ingresa tu contraseña para registrar participantes, modificar cuotas y asentar nuevos abonos.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Contraseña de Administrador</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              placeholder="Escribe la contraseña..."
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm shadow-xs transition-colors cursor-pointer"
          >
            <span>Iniciar Sesión de Control</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Contraseña de fábrica predeterminada: <strong className="text-slate-600 font-mono">admin</strong>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Puedes cambiarla en cualquier momento desde la configuración del panel.
          </p>
        </div>
      </div>
    </div>
  );
};
