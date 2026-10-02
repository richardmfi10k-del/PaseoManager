import React, { useState } from 'react';
import { Lock, LogOut, Compass, ShieldCheck, Share2, Check } from 'lucide-react';
import { TripSettings } from '../types';

interface NavbarProps {
  settings: TripSettings;
  isAdmin: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  activeTab: 'public' | 'admin';
  onChangeTab: (tab: 'public' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  isAdmin,
  onOpenLogin,
  onLogout,
  activeTab,
  onChangeTab,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleShareLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: Single text element wordmark with icon */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Compass className="w-5 h-5" />
          </div>
          <button 
            onClick={() => onChangeTab('public')}
            className="text-left group cursor-pointer focus:outline-none"
          >
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">
              PaseoManager
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium text-slate-500">
              · {settings.title}
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links / Segmented View */}
        <nav className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => onChangeTab('public')}
            className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'public'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tablero Público
          </button>
          
          {isAdmin ? (
            <button
              onClick={() => onChangeTab('admin')}
              className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Panel Organizador</span>
            </button>
          ) : null}
        </nav>

        {/* Zone 3: Primary Actions (Share link + Admin Login / Logout) */}
        <div className="flex items-center gap-2">
          {/* Share Link Button */}
          <button
            onClick={handleShareLink}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer border border-slate-200"
            title="Copiar enlace público del paseo para compartir por WhatsApp"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">¡Enlace Copiado!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden sm:inline">Compartir Enlace</span>
              </>
            )}
          </button>

          {isAdmin ? (
            <div className="flex items-center gap-2">
              <span className="hidden lg:inline-flex text-xs font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                Admin Activo
              </span>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer border border-rose-200"
                title="Cerrar sesión de organizador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Salir</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Acceso Organizador</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
