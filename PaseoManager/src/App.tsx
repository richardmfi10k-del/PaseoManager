import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  TripSettings, 
  Participant, 
  Payment 
} from './types';
import { 
  loadTripSettings, 
  saveTripSettings, 
  loadParticipants, 
  saveParticipants, 
  loadPayments, 
  savePayments, 
  checkAdminSession, 
  setAdminSession,
  resetAllData,
  clearData,
  calculateFinancials,
  importTripPayload,
} from './utils/storage';
import {
  fetchTripData,
  apiSaveParticipant,
  apiDeleteParticipant,
  apiSavePayment,
  apiDeletePayment,
  apiSaveSettings,
  apiResetData,
  apiClearData,
  apiSaveAll,
} from './utils/api';
import {
  subscribeToTripLive,
  saveSettingsToFirestore,
  saveParticipantToFirestore,
  deleteParticipantFromFirestore,
  savePaymentToFirestore,
  deletePaymentFromFirestore,
  clearFirestoreData,
} from './utils/firebase';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { PublicBoard } from './components/PublicBoard';
import { AdminDashboard } from './components/AdminDashboard';
import { ParticipantDetailModal } from './components/ParticipantDetailModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PaymentModal } from './components/PaymentModal';
import { ParticipantModal } from './components/ParticipantModal';
import { TripSettingsModal } from './components/TripSettingsModal';
import { Check, Info, Share2, Copy, X } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<TripSettings>(loadTripSettings);
  const [participants, setParticipants] = useState<Participant[]>(loadParticipants);
  const [payments, setPayments] = useState<Payment[]>(loadPayments);
  const [isAdmin, setIsAdmin] = useState<boolean>(checkAdminSession);
  const [activeTab, setActiveTab] = useState<'public' | 'admin'>('public');

  // Modals
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Selection state
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [initialPaymentParticipantId, setInitialPaymentParticipantId] = useState<string | null>(null);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Real-time Firestore synchronization
  useEffect(() => {
    const unsubscribe = subscribeToTripLive((live) => {
      if (live.settings) {
        setSettings(live.settings);
        saveTripSettings(live.settings);
      }
      if (Array.isArray(live.participants)) {
        setParticipants(live.participants);
        saveParticipants(live.participants);
      }
      if (Array.isArray(live.payments)) {
        setPayments(live.payments);
        savePayments(live.payments);
      }
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: TripSettings) => {
    setSettings(newSettings);
    saveTripSettings(newSettings);
    await saveSettingsToFirestore(newSettings);
    await apiSaveSettings(newSettings);
    showToast('Configuración guardada en la nube.');
  };

  const updateParticipants = (newParticipants: Participant[]) => {
    setParticipants(newParticipants);
    saveParticipants(newParticipants);
  };

  const updatePayments = (newPayments: Payment[]) => {
    setPayments(newPayments);
    savePayments(newPayments);
  };

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setAdminSession(true);
    setIsLoginModalOpen(false);
    setActiveTab('admin');
    showToast('¡Sesión de organizador iniciada!', 'success');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setAdminSession(false);
    setActiveTab('public');
    showToast('Sesión cerrada.', 'info');
  };

  const handleOpenAddParticipant = () => {
    setEditingParticipant(null);
    setIsParticipantModalOpen(true);
  };

  const handleOpenEditParticipant = (participant: Participant) => {
    setEditingParticipant(participant);
    setIsParticipantModalOpen(true);
  };

  const handleSaveParticipant = async (data: Partial<Participant>) => {
    if (data.id) {
      const updated = participants.map((p) =>
        p.id === data.id ? ({ ...p, ...data } as Participant) : p
      );
      updateParticipants(updated);
      const target = updated.find((p) => p.id === data.id);
      if (target) {
        await saveParticipantToFirestore(target);
        await apiSaveParticipant(target);
      }
      showToast('Datos del viajero actualizados.');
    } else {
      const newPart: Participant = {
        id: `p-${Date.now()}`,
        name: data.name || '',
        phone: data.phone || '',
        documentId: data.documentId || '',
        quota: Number(data.quota) || 0,
        notes: data.notes || '',
        avatarColor: data.avatarColor || 'bg-emerald-600',
        createdAt: new Date().toISOString(),
      };
      updateParticipants([...participants, newPart]);
      await saveParticipantToFirestore(newPart);
      await apiSaveParticipant(newPart);
      showToast(`Viajero ${newPart.name} registrado con éxito.`);
    }
    setIsParticipantModalOpen(false);
  };

  const handleDeleteParticipant = async (participantId: string) => {
    const updatedParts = participants.filter((p) => p.id !== participantId);
    const updatedPays = payments.filter((p) => p.participantId !== participantId);
    updateParticipants(updatedParts);
    updatePayments(updatedPays);
    await deleteParticipantFromFirestore(participantId);
    await apiDeleteParticipant(participantId);
    if (selectedParticipant?.id === participantId) {
      setSelectedParticipant(null);
    }
    showToast('Viajero y sus pagos eliminados.', 'info');
  };

  const handleOpenAddPayment = (preselectedParticipant?: Participant) => {
    setEditingPayment(null);
    setInitialPaymentParticipantId(preselectedParticipant ? preselectedParticipant.id : null);
    setIsPaymentModalOpen(true);
  };

  const handleOpenEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = async (data: Partial<Payment>) => {
    if (data.id) {
      const updated = payments.map((p) =>
        p.id === data.id ? ({ ...p, ...data } as Payment) : p
      );
      updatePayments(updated);
      const target = updated.find((p) => p.id === data.id);
      if (target) {
        await savePaymentToFirestore(target);
        await apiSavePayment(target);
      }
      showToast('Abono modificado exitosamente.');
    } else {
      const newPay: Payment = {
        id: `pay-${Date.now()}`,
        participantId: data.participantId || '',
        amount: Number(data.amount) || 0,
        date: data.date || new Date().toISOString().split('T')[0],
        method: data.method || 'Nequi',
        reference: data.reference || '',
        notes: data.notes || '',
        createdAt: new Date().toISOString(),
      };

      const updated = [...payments, newPay];
      updatePayments(updated);
      await savePaymentToFirestore(newPay);
      await apiSavePayment(newPay);

      const traveler = participants.find((p) => p.id === newPay.participantId);
      if (traveler) {
        const fin = calculateFinancials(traveler, updated);
        if (fin.isFullyPaid) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#059669', '#10B981', '#34D399', '#FBBF24'],
          });
          showToast(`¡Abono registrado! ${traveler.name} quedó a paz y salvo 🎉`);
        } else {
          showToast(`Abono registrado a ${traveler.name}.`);
        }
      } else {
        showToast('Abono registrado con éxito.');
      }
    }
    setIsPaymentModalOpen(false);
  };

  const handleDeletePayment = async (paymentId: string) => {
    const updated = payments.filter((p) => p.id !== paymentId);
    updatePayments(updated);
    await deletePaymentFromFirestore(paymentId);
    await apiDeletePayment(paymentId);
    showToast('Abono eliminado.', 'info');
  };

  const handleResetData = async () => {
    resetAllData();
    await apiResetData();
    showToast('Datos de ejemplo cargados.');
  };

  const handleClearData = async () => {
    clearData();
    setParticipants([]);
    setPayments([]);
    setSelectedParticipant(null);
    await clearFirestoreData();
    await apiClearData();
    showToast('Todos los datos fueron borrados.', 'info');
  };

  const handleDataImported = async () => {
    const s = loadTripSettings();
    const parts = loadParticipants();
    const pays = loadPayments();
    setSettings(s);
    setParticipants(parts);
    setPayments(pays);
    await saveSettingsToFirestore(s);
    for (const p of parts) await saveParticipantToFirestore(p);
    for (const y of pays) await savePaymentToFirestore(y);
    showToast('Datos importados y sincronizados.');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        settings={settings}
        isAdmin={isAdmin}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogoutClick={handleLogout}
        onShareClick={() => setIsShareModalOpen(true)}
      />

      <HeroBanner
        settings={settings}
        participants={participants}
        payments={payments}
        onShareClick={() => setIsShareModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'public' ? (
          <PublicBoard
            settings={settings}
            participants={participants}
            payments={payments}
            onSelectParticipant={setSelectedParticipant}
          />
        ) : (
          <AdminDashboard
            settings={settings}
            participants={participants}
            payments={payments}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onOpenAddParticipant={handleOpenAddParticipant}
            onOpenEditParticipant={handleOpenEditParticipant}
            onDeleteParticipant={handleDeleteParticipant}
            onOpenAddPayment={handleOpenAddPayment}
            onOpenEditPayment={handleOpenEditPayment}
            onDeletePayment={handleDeletePayment}
            onSelectParticipant={setSelectedParticipant}
          />
        )}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-center text-sm">
        <p className="font-semibold text-slate-300">{settings.title}</p>
        <p className="mt-1 text-slate-500">
          Tablero de control de abonos en tiempo real · Sincronizado en la nube
        </p>
      </footer>

      {/* Modals */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        adminPassword={settings.adminPassword || 'admin'}
        onLoginSuccess={handleLoginSuccess}
      />

      <TripSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        participants={participants}
        payments={payments}
        onSaveSettings={updateSettings}
        onResetData={handleResetData}
        onClearData={handleClearData}
        onDataImported={handleDataImported}
      />

      <ParticipantModal
        isOpen={isParticipantModalOpen}
        onClose={() => setIsParticipantModalOpen(false)}
        participant={editingParticipant}
        defaultQuota={participants[0]?.quota || 450000}
        currency={settings.currency}
        onSave={handleSaveParticipant}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        payment={editingPayment}
        participants={participants}
        initialParticipantId={initialPaymentParticipantId}
        currency={settings.currency}
        onSave={handleSavePayment}
      />

      <ParticipantDetailModal
        participant={selectedParticipant}
        payments={payments}
        settings={settings}
        onClose={() => setSelectedParticipant(null)}
        onAddPayment={() => {
          const p = selectedParticipant;
          setSelectedParticipant(null);
          if (p) handleOpenAddPayment(p);
        }}
      />

      {/* Share Modal (Autónomo) */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Compartir Paseo</h3>
                <p className="text-xs text-slate-500">Envía el enlace a los viajeros para ver sus abonos</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Enlace web del paseo:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={window.location.href}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-xl font-mono truncate select-all"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      showToast('¡Enlace copiado al portapapeles!');
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  const text = encodeURIComponent(`¡Hola! Consulta el estado de tu cupo y abonos para "${settings.title}" en tiempo real aquí: ${window.location.href}`);
                  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                }}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                Compartir por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium animate-bounce bg-emerald-600">
          <Check className="w-5 h-5" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
