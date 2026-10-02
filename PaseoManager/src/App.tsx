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
import { ShareModal } from './components/ShareModal';
import { Check, Info } from 'lucide-react';

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
    }, 3800);
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
          showToast(`Abono de $${newPay.amount.toLocaleString('es-CO')} registrado.`);
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
    showToast('Datos importados y sincronizados con la nube.');
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

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        settings={settings}
        participants={participants}
        payments={payments}
      />

      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium animate-bounce bg-emerald-600">
          <Check className="w-5 h-5" />
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
