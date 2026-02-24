import { type PatientDocType } from '../db/schema';

export const MOCK_PATIENTS: (PatientDocType & { last_sync_date: string })[] = [
    { id: 'P1', name: 'Patient A (Resident)', municipality: 'Tabuk', last_sync_date: new Date().toISOString() },
    { id: 'P2', name: 'Patient B (Visitor)', municipality: 'Lubuagan', last_sync_date: new Date().toISOString() }, // Visitor
    { id: 'P3', name: 'Patient C (Stale)', municipality: 'Tabuk', last_sync_date: '2023-01-01T00:00:00Z' } // Stale
];
