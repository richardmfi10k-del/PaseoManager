import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_FILE = path.join(__dirname, 'data_store.json');

// Initial seed data if file doesn't exist yet
const INITIAL_DATA = {
  settings: {
    id: 'trip-principal-2026',
    title: 'Paseo Santa Marta & Tayrona 2026',
    destination: 'Santa Marta, Palomino & Parque Tayrona',
    departureDate: '2026-11-14',
    returnDate: '2026-11-18',
    currency: '$',
    adminPassword: 'admin',
    organizerName: 'Carlos Gómez',
    organizerPhone: '+57 312 456 7890',
    organizerAccountInfo: 'Nequi / Daviplata: 312 456 7890 (Carlos Gómez) · Bancolombia Ahorros #451-892341-02',
    description: '¡Nos vamos de paseo! Incluye transporte ida y vuelta, 3 noches de cabaña en la playa, desayunos, cenas y recorrido guiado por el Tayrona.',
  },
  participants: [
    {
      id: 'p-1',
      name: 'Carlos Gómez (Organizador)',
      phone: '312 456 7890',
      documentId: '1020304050',
      quota: 450000,
      notes: 'Coordinador general y conductor de apoyo',
      avatarColor: 'bg-emerald-600',
      createdAt: '2026-09-01T10:00:00Z',
    },
    {
      id: 'p-2',
      name: 'Laura Valentina Díaz',
      phone: '310 987 6543',
      documentId: '1098765432',
      quota: 450000,
      notes: 'Habitación compartida con Mariana',
      avatarColor: 'bg-teal-600',
      createdAt: '2026-09-02T11:30:00Z',
    },
    {
      id: 'p-3',
      name: 'Mariana Restrepo',
      phone: '315 234 5678',
      documentId: '1034567891',
      quota: 450000,
      notes: 'Habitación compartida con Laura',
      avatarColor: 'bg-cyan-600',
      createdAt: '2026-09-02T14:15:00Z',
    },
    {
      id: 'p-4',
      name: 'Juan Diego Morales',
      phone: '320 876 5432',
      documentId: '1045678912',
      quota: 450000,
      notes: 'Alimentación vegetariana',
      avatarColor: 'bg-emerald-700',
      createdAt: '2026-09-05T09:20:00Z',
    },
    {
      id: 'p-5',
      name: 'Andrés Felipe Pérez',
      phone: '311 345 6789',
      documentId: '1056789123',
      quota: 450000,
      notes: 'Lleva parlante y kit de primeros auxilios',
      avatarColor: 'bg-green-600',
      createdAt: '2026-09-06T16:40:00Z',
    },
    {
      id: 'p-6',
      name: 'Camilo & Sara (Pareja)',
      phone: '318 654 3210',
      documentId: '1067891234',
      quota: 850000,
      notes: 'Tarifa doble en cabaña matrimonial',
      avatarColor: 'bg-teal-700',
      createdAt: '2026-09-07T12:00:00Z',
    },
    {
      id: 'p-7',
      name: 'Valentina Ospina',
      phone: '314 567 8901',
      documentId: '1078912345',
      quota: 320000,
      notes: 'Tarifa especial (llega en su propio carro)',
      avatarColor: 'bg-emerald-800',
      createdAt: '2026-09-10T15:10:00Z',
    },
    {
      id: 'p-8',
      name: 'Mateo Henao',
      phone: '316 789 0123',
      documentId: '1089123456',
      quota: 450000,
      notes: 'Confirmado, primer abono programado para quincena',
      avatarColor: 'bg-slate-600',
      createdAt: '2026-09-12T18:00:00Z',
    },
  ],
  payments: [
    {
      id: 'pay-1',
      participantId: 'p-1',
      amount: 450000,
      date: '2026-09-01',
      method: 'Transferencia Bancaria',
      reference: 'BANC-009182',
      notes: 'Pago total completo',
      createdAt: '2026-09-01T10:05:00Z',
    },
    {
      id: 'pay-2',
      participantId: 'p-2',
      amount: 200000,
      date: '2026-09-05',
      method: 'Nequi',
      reference: 'M9823412',
      notes: 'Primer abono de reserva cupo',
      createdAt: '2026-09-05T12:30:00Z',
    },
    {
      id: 'pay-3',
      participantId: 'p-2',
      amount: 100000,
      date: '2026-09-20',
      method: 'Daviplata',
      reference: 'DP-55421',
      notes: 'Segundo abono',
      createdAt: '2026-09-20T17:10:00Z',
    },
    {
      id: 'pay-4',
      participantId: 'p-3',
      amount: 250000,
      date: '2026-09-04',
      method: 'Nequi',
      reference: 'NQ-771822',
      notes: 'Abono inicial 50%',
      createdAt: '2026-09-04T15:20:00Z',
    },
    {
      id: 'pay-5',
      participantId: 'p-3',
      amount: 200000,
      date: '2026-09-25',
      method: 'Transferencia Bancaria',
      reference: 'TRANS-44819',
      notes: 'Liquidación final del cupo',
      createdAt: '2026-09-25T11:45:00Z',
    },
    {
      id: 'pay-6',
      participantId: 'p-4',
      amount: 250000,
      date: '2026-09-10',
      method: 'Efectivo',
      reference: 'Entregado en persona',
      notes: 'Abono en reunión informativa',
      createdAt: '2026-09-10T19:00:00Z',
    },
    {
      id: 'pay-7',
      participantId: 'p-5',
      amount: 150000,
      date: '2026-09-12',
      method: 'Nequi',
      reference: 'NQ-882910',
      notes: 'Abono 1 de 3',
      createdAt: '2026-09-12T14:00:00Z',
    },
    {
      id: 'pay-8',
      participantId: 'p-6',
      amount: 500000,
      date: '2026-09-08',
      method: 'Transferencia Bancaria',
      reference: 'BANCO-9921',
      notes: 'Abono inicial de pareja',
      createdAt: '2026-09-08T16:30:00Z',
    },
    {
      id: 'pay-9',
      participantId: 'p-7',
      amount: 320000,
      date: '2026-09-11',
      method: 'Daviplata',
      reference: 'DP-88129',
      notes: 'Pago total del cupo sin transporte',
      createdAt: '2026-09-11T10:15:00Z',
    },
  ],
};

function readStore() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      return INITIAL_DATA;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading data store, resetting to initial', err);
    return INITIAL_DATA;
  }
}

function writeStore(data: any) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing data store', err);
  }
}

// Ensure data file exists on start
readStore();

// API Endpoints
// 1. Get full trip data (Public access for travelers and admin)
app.get('/api/data', (_req, res) => {
  const store = readStore();
  res.json({
    settings: store.settings,
    participants: store.participants,
    payments: store.payments,
  });
});

// 2. Save entire state (useful for bulk sync & import)
app.post('/api/save-all', (req, res) => {
  const { settings, participants, payments } = req.body;
  const store = readStore();
  if (settings) store.settings = { ...store.settings, ...settings };
  if (Array.isArray(participants)) store.participants = participants;
  if (Array.isArray(payments)) store.payments = payments;
  writeStore(store);
  res.json({ success: true, store });
});

// 3. Save / Update Participant
app.post('/api/participants', (req, res) => {
  const participant = req.body;
  if (!participant || !participant.name) {
    res.status(400).json({ error: 'Nombre es requerido' });
    return;
  }
  const store = readStore();
  const index = store.participants.findIndex((p: any) => p.id === participant.id);
  if (index >= 0) {
    store.participants[index] = { ...store.participants[index], ...participant };
  } else {
    store.participants.push(participant);
  }
  writeStore(store);
  res.json({ success: true, participant });
});

// 4. Delete Participant
app.delete('/api/participants/:id', (req, res) => {
  const { id } = req.params;
  const store = readStore();
  store.participants = store.participants.filter((p: any) => p.id !== id);
  store.payments = store.payments.filter((pay: any) => pay.participantId !== id);
  writeStore(store);
  res.json({ success: true });
});

// 5. Save / Update Payment
app.post('/api/payments', (req, res) => {
  const payment = req.body;
  if (!payment || !payment.participantId || !payment.amount) {
    res.status(400).json({ error: 'Datos de abono incompletos' });
    return;
  }
  const store = readStore();
  const index = store.payments.findIndex((p: any) => p.id === payment.id);
  if (index >= 0) {
    store.payments[index] = { ...store.payments[index], ...payment };
  } else {
    store.payments.push(payment);
  }
  writeStore(store);
  res.json({ success: true, payment });
});

// 6. Delete Payment
app.delete('/api/payments/:id', (req, res) => {
  const { id } = req.params;
  const store = readStore();
  store.payments = store.payments.filter((p: any) => p.id !== id);
  writeStore(store);
  res.json({ success: true });
});

// 7. Update Trip Settings
app.post('/api/settings', (req, res) => {
  const newSettings = req.body;
  const store = readStore();
  store.settings = { ...store.settings, ...newSettings };
  writeStore(store);
  res.json({ success: true, settings: store.settings });
});

// 8. Reset to default initial data
app.post('/api/reset', (_req, res) => {
  writeStore(INITIAL_DATA);
  res.json({ success: true, store: INITIAL_DATA });
});

// 9. Clear all data
app.post('/api/clear', (_req, res) => {
  const store = readStore();
  store.participants = [];
  store.payments = [];
  writeStore(store);
  res.json({ success: true, store });
});

// Vite Middleware for Dev / Static Files for Prod
async function startServer() {
  if (process.env.NODE_ENV === 'production' || (!process.env.DISABLE_HMR && fs.existsSync(path.join(__dirname, 'dist', 'index.html')) && process.env.FORCE_DIST === 'true')) {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn('Vite middleware could not start, falling back to dist', e);
      app.use(express.static(path.join(__dirname, 'dist')));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
