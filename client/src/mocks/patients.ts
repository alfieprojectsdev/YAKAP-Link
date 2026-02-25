import { type PatientDocType } from '../db/schema';

/**
 * Mock Patient Data
 * Anonymized to comply with PII guidelines.
 */
export const MOCK_PATIENTS: (PatientDocType & { last_sync_date: string })[] = [
    { id: 'P1', name: 'Patient A', municipality: 'Tabuk', last_sync_date: new Date().toISOString() },
    { id: 'P2', name: 'Patient B', municipality: 'Lubuagan', last_sync_date: new Date().toISOString() }, // Visitor
    { id: 'P3', name: 'Patient C', municipality: 'Tabuk', last_sync_date: '2023-01-01T00:00:00Z' } // Stale
];

/**
 * PATIENTS_MAP for O(1) lookups by ID.
 */
export const PATIENTS_MAP = new Map(MOCK_PATIENTS.map(p => [p.id, p]));
