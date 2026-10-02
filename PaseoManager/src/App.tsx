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
  calculateFinancials
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
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { PublicBoard } from './components/PublicBoard';
import { AdminDashboard } from './components/AdminDashboard';
import { ParticipantDetailModal } from './components/ParticipantDetailModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PaymentModal } from './components/PaymentModal';
import { ParticipantModal } from './components/ParticipantModal';
import { TripSettingsModal } from './components/TripSettingsModal';
import { Check, Info } from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState<TripSettings>(loadTripSettings);
  const [participants, setParticipants] = useState<Participant[]>(loadParticipants);
  const [payments, setPayments] = useState<Payment[]>(loadPayments);
  const [isAdmin, setIsAdmin] = useState<boolean>(checkAdminSession);
  const [activeTab, setActiveTab] = useState<'public' | 'admin'>('public');

  // Modals state
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [initialPaymentParticipantId, setInitialPaymentParticipantId] = useState<string | null>(null);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync with backend API
  const refreshFromBackend = useCallback(async () => {
    const data = await fetchTripData();
    if (data.settings) setSettings(data.settings);
    if (data.participants) setParticipants(data.participants);
    if (data.payments) setPayments(data.payments);
  }, []);

  useEffect(() => {
    refreshFromBackend();
    // Background polling every 6 seconds so travelers see organizer updates live
    const interval = setInterval(refreshFromBackend, 6000);
    return () => clearInterval(interval);
  }, [refreshFromBackend]);

  // Sync state changes with local & backend
  const updateSettings = async (newSettings: TripSettings) => {
    setSettings(newSettings);
    saveTripSettings(newSettings);
    await apiSaveSettings(newSettings);
    showToast('Configuración guardada correctamente.');
  };

  const updateParticipants = (newParticipants: Participant[]) => {
    setParticipants(newParticipants);
    saveParticipants(newParticipants);
  };

  const updatePayments = (newPayments: Payment[]) => {
    setPayments(newPayments);
    savePayments(newPayments);
  };

  // Admin Auth Handlers
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

  // Participant Management
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
      // Editing existing participant
      const updated = participants.map((p) =>
        p.id === data.id ? ({ ...p, ...data } as Participant) : p
      );
      updateParticipants(updated);
      const target = updated.find((p) => p.id === data.id);
      if (target) await apiSaveParticipant(target);
      showToast('Datos del viajero actualizados.');
    } else {
      // New participant
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
    await apiDeleteParticipant(participantId);
    if (selectedParticipant?.id === participantId) {
      setSelectedParticipant(null);
    }
    showToast('Viajero y sus pagos eliminados.', 'info');
  };

  // Payment Management
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
      // Edit payment
      const updated = payments.map((p) =>
        p.id === data.id ? ({ ...p, ...data } as Payment) : p
      );
      updatePayments(updated);
      const target = updated.find((p) => p.id === data.id);
      if (target) await apiSavePayment(target);
      showToast('Abono modificado exitosamente.');
    } else {
      // New payment
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
      await apiSavePayment(newPay);

      // Check if this payment completes the traveler's quota
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
          showToast(`Abono de $${newPay.amount.toLocaleString('es-CO')} registrado a ${traveler.name}.`);
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
    await apiDeletePayment(paymentId);
    showToast('Abono eliminado.', 'info');
  };

  // Reset / Clear Data
  const handleResetData = async () => {
    resetAllData();
    await apiResetData();
    await refreshFromBackend();
    showToast('Datos de ejemplo cargados.');
  };

  const handleClearData = async () => {
    clearData();
    await apiClearData();
    setParticipants([]);
    setPayments([]);
    showToast('Todos los datos han sido vaciados.', 'info');
  };

  const handleDataImported = async () => {
    const s = loadTripSettings();
    const parts = loadParticipants();
    const pays = loadPayments();
    await apiSaveAll({ settings: s, participants: parts, payments: pays });
    setSettings(s);
    setParticipants(parts);
    setPayments(pays);
    showToast('Datos importados y sincronizados con éxito.');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            {toast.type === 'success' ? <Check className="w-3.5 h-3.5" /> : <Info className="w-3.5 h-3.5" />}
          </div>
          <span className="text-xs sm:text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        settings={settings}
        isAdmin={isAdmin}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Hero Section with Global Stats */}
        <HeroBanner
          settings={settings}
          participants={participants}
          payments={payments}
        />

        {/* View Switcher: Public Board vs Admin Dashboard */}
        {activeTab === 'public' ? (
          <PublicBoard
            settings={settings}
            participants={participants}
            payments={payments}
            isAdmin={isAdmin}
            onSelectParticipant={(p) => setSelectedParticipant(p)}
            onQuickAddPayment={(p) => handleOpenAddPayment(p)}
          />
        ) : (
          <AdminDashboard
            settings={settings}
            participants={participants}
            payments={payments}
            onOpenAddParticipant={handleOpenAddParticipant}
            onOpenEditParticipant={handleOpenEditParticipant}
            onDeleteParticipant={handleDeleteParticipant}
            onOpenAddPayment={handleOpenAddPayment}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onSelectParticipant={(p) => setSelectedParticipant(p)}
          />
        )}
      </main>

      {/* Modals */}
      {/* 1. Participant Detail Modal */}
      <ParticipantDetailModal
        participant={selectedParticipant}
        payments={payments}
        settings={settings}
        isAdmin={isAdmin}
        onClose={() => setSelectedParticipant(null)}
        onAddPaymentForParticipant={(p) => handleOpenAddPayment(p)}
        onEditPayment={(pay) => handleOpenEditPayment(pay)}
        onDeletePayment={handleDeletePayment}
      />

      {/* 2. Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        settings={settings}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 3. Payment Modal (Add / Edit) */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={handleSavePayment}
        participants={participants}
        payments={payments}
        settings={settings}
        editingPayment={editingPayment}
        initialParticipantId={initialPaymentParticipantId}
      />

      {/* 4. Participant Modal (Add / Edit) */}
      <ParticipantModal
        isOpen={isParticipantModalOpen}
        onClose={() => setIsParticipantModalOpen(false)}
        onSave={handleSaveParticipant}
        editingParticipant={editingParticipant}
        settings={settings}
      />

      {/* 5. Trip Settings Modal */}
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

      {/* Minimal Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            {settings.title} · Coordinado con <strong className="text-slate-700">PaseoManager</strong>
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Control centralizado y transparencia para todos los viajeros</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
