import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  collection, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  getDocFromServer,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Participant, Payment, TripSettings } from '../types';
import { INITIAL_SETTINGS, INITIAL_PARTICIPANTS, INITIAL_PAYMENTS } from './storage';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  console.error(`Firestore Error [${operationType}] at ${path}:`, error);
}

// Sincronización en vivo para todos los viajeros
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

  const unsubSettings = onSnapshot(
    doc(db, 'trip_settings', 'main'),
    (snap) => {
      if (snap.exists()) {
        currentSettings = snap.data() as TripSettings;
      }
      triggerUpdate();
    },
    (err) => handleFirestoreError(err, OperationType.GET, 'trip_settings/main')
  );

  const unsubParticipants = onSnapshot(
    collection(db, 'participants'),
    (snap) => {
      currentParticipants = snap.docs.map((d) => d.data() as Participant);
      triggerUpdate();
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'participants')
  );

  const unsubPayments = onSnapshot(
    collection(db, 'payments'),
    (snap) => {
      currentPayments = snap.docs.map((d) => d.data() as Payment);
      triggerUpdate();
    },
    (err) => handleFirestoreError(err, OperationType.LIST, 'payments')
  );

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

export async function seedFirestoreIfEmpty(): Promise<boolean> {
  try {
    const settingsDoc = await getDocFromServer(doc(db, 'trip_settings', 'main'));
    if (!settingsDoc.exists()) {
      await setDoc(doc(db, 'trip_settings', 'main'), INITIAL_SETTINGS);
      const batch = writeBatch(db);
      for (const p of INITIAL_PARTICIPANTS) batch.set(doc(db, 'participants', p.id), p);
      for (const y of INITIAL_PAYMENTS) batch.set(doc(db, 'payments', y.id), y);
      await batch.commit();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export async function clearFirestoreData(): Promise<void> {
  try {
    const partsSnap = await getDocs(collection(db, 'participants'));
    const paysSnap = await getDocs(collection(db, 'payments'));
    const batch = writeBatch(db);
    partsSnap.docs.forEach((d) => batch.delete(d.ref));
    paysSnap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, 'clearAll');
  }
}
