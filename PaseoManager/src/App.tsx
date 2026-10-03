import React, { useState, useEffect } from 'react';
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
} from './utils/storage';
import {
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
  db,
} from './utils/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { PublicBoard } from './components/PublicBoard';
import { AdminDashboard } from './components/AdminDashboard';
import { ParticipantDetailModal } from './components/ParticipantDetailModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { PaymentModal } from './components/PaymentModal';
import { ParticipantModal } from './components/ParticipantModal';
import { TripSettingsModal } from './components/TripSettingsModal';
import { ExpenseModal } from './components/ExpenseModal';
import { Check, Info, Share2, Copy, X } from 'lucide-react';

export type ExpenseCategory = 
  | 'Hospedaje / Cabaña'
  | 'Transporte / Gasolina'
  | 'Alimentación / Bebidas'
  | 'Actividades / Entradas'
  | 'Logística / Imprevistos'
  | 'Otro';

export interface Expense {
  id: string;
  concept: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  paymentMethod: string;
  paidTo?: string;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
}

const EXPENSES_STORAGE_KEY = 'paseomanager_expenses_v1';

function getStoredExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(EXPENSES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function storeExpenses(data: Expense[]): void {
  try {
    localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export default function App() {
  const [settings, setSettings] = useState<TripSettings>(loadTripSettings);
  const [participants, setParticipants] = useState<Participant[]>(loadParticipants);
  const [payments, setPayments] = useState<Payment[]>(loadPayments);
  const [expenses, setExpenses] = useState<Expense[]>(getStoredExpenses);
  const [isAdmin, setIsAdmin] = useState<boolean>(checkAdminSession);
  const [activeTab, setActiveTab] = useState<'public' | 'admin'>('public');

  // Pantalla de carga para evitar que nuevos visitantes vean la pantalla vacia mientras conecta Firebase
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const cached = loadParticipants();
    return cached.length === 0;
  });

  // Modals state
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [initialPaymentParticipantId, setInitialPaymentParticipantId] = useState<string | null>(null);
  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<Participant | null>(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Expense Modal state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Real-time Firestore synchronization
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    const unsubscribe = subscribeToTripLive((live: any) => {
      setIsLoading(false);
      clearTimeout(timer);
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
      if (Array.isArray(live.expenses) && live.expenses.length > 0) {
        setExpenses(live.expenses);
        storeExpenses(live.expenses);
      }
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
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

  const updateExpenses = (newExpenses: Expense[]) => {
    setExpenses(newExpenses);
    storeExpenses(newExpenses);
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

  // Expense Management (Control Privado de Gastos)
  const handleOpenAddExpense = () => {
    setEditingExpense(null);
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = async (data: Partial<Expense>) => {
    if (data.id) {
      const updated = expenses.map((e) =>
        e.id === data.id ? ({ ...e, ...data } as Expense) : e
      );
      updateExpenses(updated);
      try {
        await setDoc(doc(db, 'expenses', data.id), data, { merge: true });
      } catch {}
      showToast('Gasto modificado exitosamente.');
    } else {
      const newExp: Expense = {
        id: `exp-${Date.now()}`,
        concept: data.concept || 'Gasto no especificado',
        category: (data.category as ExpenseCategory) || 'Hospedaje / Cabaña',
        amount: Number(data.amount) || 0,
        date: data.date || new Date().toISOString().split('T')[0],
        paymentMethod: data.paymentMethod || 'Nequi',
        paidTo: data.paidTo || '',
        receiptNumber: data.receiptNumber || '',
        notes: data.notes || '',
        createdAt: new Date().toISOString(),
      };
      const updated = [newExp, ...expenses];
      updateExpenses(updated);
      try {
        await setDoc(doc(db, 'expenses', newExp.id), newExp);
      } catch {}
      showToast(`Salida "${newExp.concept}" registrada en caja.`);
    }
    setIsExpenseModalOpen(false);
  };

  const handleDeleteExpense = async (expenseId: string) => {
    const updated = expenses.filter((e) => e.id !== expenseId);
    updateExpenses(updated);
    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
    } catch {}
    showToast('Salida eliminada.', 'info');
  };

  const handleResetData = async () => {
    resetAllData();
    setExpenses([]);
    storeExpenses([]);
    await apiResetData();
    showToast('Datos restablecidos.');
  };

  const handleClearData = async () => {
    clearData();
    setParticipants([]);
    setPayments([]);
    setExpenses([]);
    storeExpenses([]);
    setSelectedParticipant(null);
    await clearFirestoreData();
    await apiClearData();
    showToast('Todos los datos fueron borrados.', 'info');
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

  // Pantalla de carga si un usuario entra por primera vez
  if (isLoading && participants.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 animate-pulse shadow-xl shadow-emerald-500/10">
          <div className="w-8 h-8 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Cargando Paseo...</h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xs">
          Sincronizando la lista oficial y abonos en tiempo real
        </p>
        <div className="mt-6 w-36 h-1 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full w-2/3 animate-pulse" />
        </div>
      </div>
    );
  }

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
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onLogoutClick={handleLogout}
        onOpenShare={() => setIsShareModalOpen(true)}
        onShareClick={() => setIsShareModalOpen(true)}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <HeroBanner
          settings={settings}
          participants={participants}
          payments={payments}
        />

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
            expenses={expenses}
            onOpenAddParticipant={handleOpenAddParticipant}
            onOpenEditParticipant={handleOpenEditParticipant}
            onDeleteParticipant={handleDeleteParticipant}
            onOpenAddPayment={handleOpenAddPayment}
            onOpenAddExpense={handleOpenAddExpense}
            onOpenEditExpense={handleOpenEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            onSelectParticipant={(p) => setSelectedParticipant(p)}
          />
        )}
      </main>

      {/* Modals */}
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

      <AdminLoginModal
        isOpen={isLoginModalOpen}
        settings={settings}
        adminPassword={settings.adminPassword || 'admin'}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

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

      <ParticipantModal
        isOpen={isParticipantModalOpen}
        onClose={() => setIsParticipantModalOpen(false)}
        onSave={handleSaveParticipant}
        editingParticipant={editingParticipant}
        settings={settings}
      />

      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSave={handleSaveExpense}
        expense={editingExpense}
        currency={settings.currency}
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

      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
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

      {/* Footer */}
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
