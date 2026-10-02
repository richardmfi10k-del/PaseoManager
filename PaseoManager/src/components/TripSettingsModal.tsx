import React, { useState } from 'react';
import { X, Settings, Download, Upload, RotateCcw, Trash2, KeyRound, Check, FileSpreadsheet, MapPin, Calendar, CreditCard, User, AlertTriangle } from 'lucide-react';
import { TripSettings, Participant, Payment } from '../types';
import { exportFullDataJSON, importFullDataJSON, generateCSVReport } from '../utils/storage';

interface TripSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TripSettings;
  participants: Participant[];
  payments: Payment[];
  onSaveSettings: (newSettings: TripSettings) => void;
  onResetData: () => void;
  onClearData: () => void;
  onDataImported: () => void;
}

export const TripSettingsModal: React.FC<TripSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  participants,
  payments,
  onSaveSettings,
  onResetData,
  onClearData,
  onDataImported,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'backup'>('info');

  // Form State
  const [title, setTitle] = useState(settings.title);
  const [destination, setDestination] = useState(settings.destination);
  const [departureDate, setDepartureDate] = useState(settings.departureDate);
  const [returnDate, setReturnDate] = useState(settings.returnDate || '');
  const [currency, setCurrency] = useState(settings.currency);
  const [organizerName, setOrganizerName] = useState(settings.organizerName);
  const [organizerPhone, setOrganizerPhone] = useState(settings.organizerPhone);
  const [organizerAccountInfo, setOrganizerAccountInfo] = useState(settings.organizerAccountInfo || '');
  const [description, setDescription] = useState(settings.description || '');
  const [adminPassword, setAdminPassword] = useState(settings.adminPassword);

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !destination.trim()) {
      setMessage({ text: 'El título y el destino son requeridos.', type: 'error' });
      return;
    }
    if (!adminPassword.trim()) {
      setMessage({ text: 'La contraseña de organizador no puede estar vacía.', type: 'error' });
      return;
    }

    onSaveSettings({
      ...settings,
      title: title.trim(),
      destination: destination.trim(),
      departureDate,
      returnDate: returnDate || undefined,
      currency: currency.trim() || '$',
      organizerName: organizerName.trim(),
      organizerPhone: organizerPhone.trim(),
      organizerAccountInfo: organizerAccountInfo.trim(),
      description: description.trim(),
      adminPassword: adminPassword.trim(),
    });

    setMessage({ text: '¡Configuración guardada exitosamente!', type: 'success' });
    setTimeout(() => setMessage(null), 2500);
  };

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

  const handleExportJSON = () => {
    const jsonStr = exportFullDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `backup_${settings.title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const success = importFullDataJSON(content);
        if (success) {
          setMessage({ text: '¡Copia de seguridad restaurada correctamente!', type: 'success' });
          onDataImported();
        } else {
          setMessage({ text: 'El archivo no contiene un formato de respaldo válido.', type: 'error' });
        }
      } catch {
        setMessage({ text: 'Error al procesar el archivo JSON.', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Configuración del Paseo</h2>
              <p className="text-xs text-slate-400">Personaliza los datos del viaje, cuentas y copias de seguridad.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-full bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-4">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'info'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Datos del Viaje & Contraseña
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'backup'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Exportar, Respaldos & Datos
          </button>
        </div>

        {message && (
          <div
            className={`mx-6 mt-4 p-3 rounded-xl text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border border-rose-200 text-rose-800'
            }`}
          >
            <Check className="w-4 h-4 shrink-0" />
            <span>{message.text}</span>
          </div>
        )}

        {/* Tab 1: General Info */}
        {activeTab === 'info' && (
          <form onSubmit={handleSaveInfo} className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <span>Nombre del Paseo / Evento *</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Paseo Fin de Año Santa Marta"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Destino *</span>
                </label>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Ej. Santa Marta & Tayrona"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Símbolo de Moneda
                </label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  placeholder="Ej. $ o USD o COP"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fecha de Salida</span>
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Fecha de Regreso (Opcional)</span>
                </label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Nombre del Organizador</span>
                </label>
                <input
                  type="text"
                  value={organizerName}
                  onChange={(e) => setOrganizerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Teléfono / WhatsApp de Contacto
                </label>
                <input
                  type="text"
                  value={organizerPhone}
                  onChange={(e) => setOrganizerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                <span>Datos de Cuentas para Transferencias (Nequi, Daviplata, Bancos)</span>
              </label>
              <textarea
                rows={2}
                value={organizerAccountInfo}
                onChange={(e) => setOrganizerAccountInfo(e.target.value)}
                placeholder="Ej. Nequi/Daviplata: 312 456 7890 · Bancolombia Ahorros #451-892341-02"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all resize-none"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Este texto aparecerá en la página principal para que los participantes copien tus números con 1 clic.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Descripción o Qué Incluye el Paseo (Opcional)
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej. Incluye hospedaje 3 noches, transporte especial y alimentación completa..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 text-slate-900 text-sm outline-none transition-all resize-none"
              />
            </div>

            {/* Change Password Section */}
            <div className="pt-3 border-t border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                <span>Contraseña Maestra de Organizador</span>
              </label>
              <input
                type="text"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Contraseña para entrar al panel..."
                className="w-full px-3 py-2 rounded-xl border border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20 text-slate-900 text-sm outline-none transition-all font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Esta es la contraseña que te solicita la plataforma para editar o registrar abonos.
              </p>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Guardar Configuración</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Backups & Data */}
        {activeTab === 'backup' && (
          <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
            {/* Export Section */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Descargar y Exportar Reportes</span>
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Exporta el estado de cuenta para abrirlo en Excel o una copia de seguridad para guardar todos los datos.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200/80 rounded-xl transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Exportar a Excel (CSV)</span>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Copia de Seguridad (JSON)</span>
                </button>
              </div>
            </div>

            {/* Import Section */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-600" />
                <span>Restaurar Copia de Seguridad</span>
              </h3>
              <p className="text-xs text-slate-500 mb-3">
                Sube un archivo de copia previa (.json) para restaurar todos los participantes y abonos.
              </p>

              <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer">
                <Upload className="w-4 h-4" />
                <span>Seleccionar Archivo JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>
            </div>

            {/* Dangerous Actions */}
            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200">
              <h3 className="text-sm font-bold text-rose-900 mb-1 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Gestión de Datos</span>
              </h3>
              <p className="text-xs text-rose-700 mb-4">
                Puedes restablecer los datos de ejemplo del paseo para demostración o vaciar la lista para comenzar limpio tu paseo real.
              </p>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    if (confirm('¿Deseas restaurar los datos de ejemplo del paseo a Santa Marta?')) {
                      onResetData();
                      setMessage({ text: 'Datos de ejemplo restaurados.', type: 'success' });
                    }
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Restablecer Datos de Ejemplo</span>
                </button>

                <button
                  onClick={() => {
                    if (confirm('¿ATENCIÓN: Seguro que deseas borrar TODOS los participantes y abonos para empezar de cero? Esta acción no se puede deshacer.')) {
                      onClearData();
                      setMessage({ text: 'Se han eliminado todos los datos.', type: 'success' });
                    }
                  }}
                  className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-white hover:bg-rose-100 border border-rose-300 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Borrar Todo y Empezar Limpio</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
