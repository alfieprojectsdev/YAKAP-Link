import { type PatientDocType } from '../db/schema';

export interface GuardResult {
    allowed: boolean;
    reason: string;
    cap_limit: number | null; // Quantity or Days Supply limit
    requires_override?: boolean;
}

export interface LocalSettings {
    municipality: string;
    isOnline: boolean;
}

const HOURS_72 = 72 * 60 * 60 * 1000;
const DAY_7_SUPPLY_LIMIT = 7;

/**
 * Protocol-20k-Offline-Guard (ADR-004)
 * 
 * 1. Strict Mode: Visitor (Different Municipality) + Offline = BLOCKED.
 * 2. Staleness Cap: Last Sync > 72h = Capped at 7 Days Supply.
 * 3. Default: Allowed (Home Court or Online).
 */
export function checkDispensingEligibility(
    patient: PatientDocType,
    settings: LocalSettings
): GuardResult {
    const isVisitor = patient.municipality !== settings.municipality;
    const isOffline = !settings.isOnline;

    // 1. Strict Mode: Home Court Protocol
    if (isVisitor && isOffline) {
        return {
            allowed: false,
            reason: `Protocol-20k Violation: Cannot dispense to visitor (${patient.municipality}) while offline. Risk of double-dipping.`,
            cap_limit: 0,
            requires_override: true // In a real app, a medical officer override might be possible with authentication, but default is blocked.
        };
    }

    // 2. Staleness Cap
    if (isOffline && patient.last_sync_date) {
        const lastSync = new Date(patient.last_sync_date).getTime();
        const now = new Date().getTime();

        if ((now - lastSync) > HOURS_72) {
            return {
                allowed: true, // Allowed, but restricted
                reason: `Offline > 72h. Emergency Buffer Only (${DAY_7_SUPPLY_LIMIT} days). Facility assumes liability for excess.`,
                cap_limit: DAY_7_SUPPLY_LIMIT
            };
        }
    }

    // 3. Standard Success
    return {
        allowed: true,
        reason: isOffline
            ? 'Offline Mode: Home Court verified. Proceed with caution.'
            : 'Online: Eligibility verified via central server.',
        cap_limit: null
    };
}
