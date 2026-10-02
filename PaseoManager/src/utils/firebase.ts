import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Participant, Payment, TripSettings } from '../types';

const firebaseConfig = {
  projectId: "sistema-de-pedidos-7f91f",
  appId: "1:611940942676:web:4d9a91ff2c69e811dabec1",
  apiKey: "AIzaSyA8nsDapmnCRbcC1391giFerUMeVQt0g74",
  authDomain: "sistema-de-pedidos-7f91f.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-paseomanager-1e8bf4a1-6d12-4861-b8d6-ca4c53be76dc",
  storageBucket: "sistema-de-pedidos-7f91f.firebasestorage.app",
  messagingSenderId: "611940942676"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export function subscribeToTripLive(
  onData: (data: {
    settings: TripSettings | null;
    participants: Participant[];
    payments: Payment[];
  }) => void
): () => void {
  let currentSettings: TripSettings | null = null;
  let currentParticipants: Participant[] = [];
  let currentPayments: Payment[] = [];

  const triggerUpdate = () => {
    onData({
      settings: currentSettings,
      participants: currentParticipants,
      payments: currentPayments,
    });
  };

  const unsubSettings = onSnapshot(doc(db, 'trip_settings', 'main'), (snap) => {
    if (snap.exists()) currentSettings = snap.data() as TripSettings;
    triggerUpdate();
  });

  const unsubParticipants = onSnapshot(collection(db, 'participants'), (snap) => {
    currentParticipants = snap.docs.map((d) => d.data() as Participant);
    triggerUpdate();
  });

  const unsubPayments = onSnapshot(collection(db, 'payments'), (snap) => {
    currentPayments = snap.docs.map((d) => d.data() as Payment);
    triggerUpdate();
  });

  return () => {
    unsubSettings();
    unsubParticipants();
    unsubPayments();
  };
}

export async function saveSettingsToFirestore(settings: TripSettings): Promise<void> {
  await setDoc(doc(db, 'trip_settings', 'main'), settings, { merge: true });
}

export async function saveParticipantToFirestore(participant: Participant): Promise<void> {
  await setDoc(doc(db, 'participants', participant.id), participant);
}

export async function deleteParticipantFromFirestore(participantId: string): Promise<void> {
  await deleteDoc(doc(db, 'participants', participantId));
}

export async function savePaymentToFirestore(payment: Payment): Promise<void> {
  await setDoc(doc(db, 'payments', payment.id), payment);
}

export async function deletePaymentFromFirestore(paymentId: string): Promise<void> {
  await deleteDoc(doc(db, 'payments', paymentId));
}

export async function clearFirestoreData(): Promise<void> {
  const partsSnap = await getDocs(collection(db, 'participants'));
  const paysSnap = await getDocs(collection(db, 'payments'));
  const batch = writeBatch(db);
  partsSnap.docs.forEach((d) => batch.delete(d.ref));
  paysSnap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}
