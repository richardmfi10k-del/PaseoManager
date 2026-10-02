export type PaymentMethod = 
  | 'Nequi'
  | 'Daviplata'
  | 'Efectivo'
  | 'Transferencia Bancaria'
  | 'Tarjeta / Otro';

export interface Payment {
  id: string;
  participantId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface Participant {
  id: string;
  name: string;
  phone?: string;
  documentId?: string;
  quota: number;
  notes?: string;
  avatarColor?: string;
  createdAt: string;
}

export interface TripSettings {
  id: string;
  title: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  currency: string;
  adminPassword: string;
  bannerUrl?: string;
  organizerName: string;
  organizerPhone: string;
  organizerAccountInfo?: string;
  description?: string;
}

export interface ParticipantFinancials {
  totalPaid: number;
  remainingBalance: number;
  progressPercentage: number;
  paymentsCount: number;
  isFullyPaid: boolean;
  hasStartedPaying: boolean;
  lastPaymentDate?: string;
}
