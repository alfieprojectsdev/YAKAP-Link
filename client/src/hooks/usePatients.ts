import { useState, useEffect } from 'react';
import { Subscription } from 'rxjs';
import { getDatabase } from '../db/database';
import { type PatientDocType } from '../db/schema';
import { MOCK_PATIENTS } from '../mocks/patients';

export function usePatients() {
    const [patients, setPatients] = useState<PatientDocType[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let sub: Subscription | null = null;
        let isMounted = true;

        const init = async () => {
            const db = await getDatabase();

            // Seed if empty
            const existing = await db.patients.find().exec();
            if (existing.length === 0) {
                 await db.patients.bulkInsert(MOCK_PATIENTS);
            }

            if (!isMounted) return;

            // Subscribe to changes
            sub = db.patients.find().$.subscribe(docs => {
                if (isMounted) {
                    setPatients(docs.map(d => d.toJSON()));
                    setLoading(false);
                }
            });
        };

        init();

        return () => {
            isMounted = false;
            if (sub) sub.unsubscribe();
        };
    }, []);

    return { patients, loading };
}
