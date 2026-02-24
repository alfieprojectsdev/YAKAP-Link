import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkDispensingEligibility, type LocalSettings } from './dispensingGuard';
import { type PatientDocType } from '../db/schema';

describe('checkDispensingEligibility (Protocol-20k)', () => {
    // Mock Data Helpers
    const MUNICIPALITY_A = 'Lubuagan';
    const MUNICIPALITY_B = 'Tabuk';

    // We'll set the "current time" to a fixed point
    const NOW = new Date('2023-10-25T12:00:00Z').getTime();

    const mockSettings = (isOnline: boolean, municipality: string = MUNICIPALITY_A): LocalSettings => ({
        isOnline,
        municipality
    });

    const mockPatient = (municipality: string, lastSyncHoursAgo?: number): PatientDocType => {
        let last_sync_date = undefined;
        if (lastSyncHoursAgo !== undefined) {
            const syncTime = NOW - (lastSyncHoursAgo * 60 * 60 * 1000);
            last_sync_date = new Date(syncTime).toISOString();
        }

        return {
            id: 'p1',
            name: 'John Doe',
            municipality,
            last_sync_date
        } as PatientDocType;
    };

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(NOW);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('1. Strict Mode: Visitor Block', () => {
        it('should BLOCK visitor when OFFLINE', () => {
            const patient = mockPatient(MUNICIPALITY_B); // Visitor
            const settings = mockSettings(false, MUNICIPALITY_A); // Offline, Home is A

            const result = checkDispensingEligibility(patient, settings);

            expect(result.allowed).toBe(false);
            expect(result.reason).toContain('Protocol-20k Violation');
            expect(result.requires_override).toBe(true);
        });

        it('should ALLOW visitor when ONLINE', () => {
            const patient = mockPatient(MUNICIPALITY_B); // Visitor
            const settings = mockSettings(true, MUNICIPALITY_A); // Online

            const result = checkDispensingEligibility(patient, settings);

            expect(result.allowed).toBe(true);
            expect(result.reason).toContain('Online');
            expect(result.cap_limit).toBeNull();
        });

        it('should ALLOW home court patient when OFFLINE', () => {
            const patient = mockPatient(MUNICIPALITY_A); // Home Court
            const settings = mockSettings(false, MUNICIPALITY_A); // Offline

            const result = checkDispensingEligibility(patient, settings);

            expect(result.allowed).toBe(true);
            // This might trigger the Staleness Cap check if last_sync_date is old,
            // but our mockPatient doesn't set last_sync_date by default, so it skips staleness check.
            expect(result.reason).toContain('Offline Mode');
        });
    });

    describe('2. Staleness Cap (Offline > 72h)', () => {
        it('should CAP dispensing if offline and last sync was > 72h ago', () => {
            const patient = mockPatient(MUNICIPALITY_A, 73); // 73 hours ago
            const settings = mockSettings(false, MUNICIPALITY_A);

            const result = checkDispensingEligibility(patient, settings);

            expect(result.allowed).toBe(true);
            expect(result.cap_limit).toBe(7); // 7 days cap
            expect(result.reason).toContain('Offline > 72h');
        });

        it('should NOT CAP if offline and last sync was <= 72h ago', () => {
            const patient = mockPatient(MUNICIPALITY_A, 71); // 71 hours ago
            const settings = mockSettings(false, MUNICIPALITY_A);

            const result = checkDispensingEligibility(patient, settings);

            expect(result.allowed).toBe(true);
            expect(result.cap_limit).toBeNull();
            expect(result.reason).toContain('Offline Mode');
        });

        it('should NOT CAP if ONLINE, even if last sync was > 72h ago', () => {
            const patient = mockPatient(MUNICIPALITY_A, 100); // 100 hours ago
            const settings = mockSettings(true, MUNICIPALITY_A);

            const result = checkDispensingEligibility(patient, settings);

            expect(result.allowed).toBe(true);
            expect(result.cap_limit).toBeNull();
            expect(result.reason).toContain('Online');
        });

         it('should NOT CAP if offline but no last_sync_date (New Patient/Unsynced)', () => {
            // If patient has never synced (undefined last_sync_date), we assume it's fine
            // or at least not stale in a way that blocks.
            // The code only checks `if (isOffline && patient.last_sync_date)`.
            const patient = mockPatient(MUNICIPALITY_A, undefined);
            const settings = mockSettings(false, MUNICIPALITY_A);

            const result = checkDispensingEligibility(patient, settings);

            expect(result.allowed).toBe(true);
            expect(result.cap_limit).toBeNull();
        });
    });
});
