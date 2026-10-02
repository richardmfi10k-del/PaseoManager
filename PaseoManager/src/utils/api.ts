import { Participant, Payment, TripSettings } from '../types';
import { 
  loadTripSettings, 
  loadParticipants, 
  loadPayments,
  saveTripSettings,
  saveParticipants,
  savePayments,
  INITIAL_SETTINGS,
  INITIAL_PARTICIPANTS,
  INITIAL_PAYMENTS
} from './storage';

export async function fetchTripData(): Promise<{
  settings: TripSettings;
  participants: Participant[];
  payments: Payment[];
}> {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error('API response not ok');
    const data = await res.json();
    
    // Cache in local storage for fast initial render
    if (data.settings) saveTripSettings(data.settings);
    if (Array.isArray(data.participants)) saveParticipants(data.participants);
    if (Array.isArray(data.payments)) savePayments(data.payments);

    return {
      settings: data.settings || loadTripSettings(),
      participants: data.participants || loadParticipants(),
      payments: data.payments || loadPayments(),
    };
  } catch (err) {
    console.warn('Backend API unavailable, using cached local data', err);
    return {
      settings: loadTripSettings(),
      participants: loadParticipants(),
      payments: loadPayments(),
    };
  }
}

export async function apiSaveParticipant(participant: Participant): Promise<boolean> {
  try {
    await fetch('/api/participants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(participant),
    });
    return true;
  } catch (err) {
    console.error('Error saving participant to backend', err);
    return false;
  }
}

export async function apiDeleteParticipant(id: string): Promise<boolean> {
  try {
    await fetch(`/api/participants/${id}`, { method: 'DELETE' });
    return true;
  } catch (err) {
    console.error('Error deleting participant from backend', err);
    return false;
  }
}

export async function apiSavePayment(payment: Payment): Promise<boolean> {
  try {
    await fetch('/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payment),
    });
    return true;
  } catch (err) {
    console.error('Error saving payment to backend', err);
    return false;
  }
}

export async function apiDeletePayment(id: string): Promise<boolean> {
  try {
    await fetch(`/api/payments/${id}`, { method: 'DELETE' });
    return true;
  } catch (err) {
    console.error('Error deleting payment from backend', err);
    return false;
  }
}

export async function apiSaveSettings(settings: TripSettings): Promise<boolean> {
  try {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return true;
  } catch (err) {
    console.error('Error saving settings to backend', err);
    return false;
  }
}

export async function apiResetData(): Promise<boolean> {
  try {
    await fetch('/api/reset', { method: 'POST' });
    return true;
  } catch (err) {
    console.error('Error resetting backend data', err);
    return false;
  }
}

export async function apiClearData(): Promise<boolean> {
  try {
    await fetch('/api/clear', { method: 'POST' });
    return true;
  } catch (err) {
    console.error('Error clearing backend data', err);
    return false;
  }
}

export async function apiSaveAll(data: {
  settings: TripSettings;
  participants: Participant[];
  payments: Payment[];
}): Promise<boolean> {
  try {
    await fetch('/api/save-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return true;
  } catch (err) {
    console.error('Error saving all data to backend', err);
    return false;
  }
}
