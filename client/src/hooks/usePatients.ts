import { useState, useEffect } from 'react';
import { getDatabase, type MyDatabase } from '../db/database';
import { type PatientDocType } from '../db/schema';
import { MOCK_PATIENTS } from '../mocks/patients';

// Type that matches the component's expectations and the schema
export type PatientWithSync = PatientDocType & { last_sync_date: string };

export function usePatients() {
    // We use the intersection type to maintain compatibility with the previous mock-based implementation
    const [patients, setPatients] = useState<PatientWithSync[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [db, setDb] = useState<MyDatabase | null>(null);

    useEffect(() => {
        getDatabase().then(setDb);
    }, []);

    useEffect(() => {
        if (!db) return;

        const query = db.patients.find();
        const subscription = query.$.subscribe(async docs => {
            if (docs.length === 0) {
                // Seed if empty (Since we don't have a patient picker UI yet)
                try {
                    await db.patients.bulkInsert(MOCK_PATIENTS);
                } catch (err) {
                    console.error('Failed to seed mock patients:', err);
                }
            } else {
                // Map documents to plain objects and cast to the expected type
                // In this mock-heavy phase, we expect last_sync_date to be present
                setPatients(docs.map(d => d.toJSON() as PatientWithSync));
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [db]);

    return {
        patients,
        loading
    };
}
