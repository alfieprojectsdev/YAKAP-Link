import { type PatientDocType } from '../db/schema';

// Mock Patient Data
export const MOCK_PATIENTS: PatientDocType[] = [
    { id: 'P1', name: 'Juan Dela Cruz', municipality: 'Tabuk', last_sync_date: new Date().toISOString() },
    { id: 'P2', name: 'Maria Clara', municipality: 'Lubuagan', last_sync_date: new Date().toISOString() }, // Visitor
    { id: 'P3', name: 'Jose Rizal', municipality: 'Tabuk', last_sync_date: '2023-01-01T00:00:00Z' } // Stale
];
