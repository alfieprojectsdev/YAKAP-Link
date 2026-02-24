import { useState, useEffect } from 'react';
import { getDatabase } from '../db/database';
import { type PatientDocType } from '../db/schema';
import { MOCK_PATIENTS } from '../mocks/patients';
import { Subscription } from 'rxjs';

export function usePatients() {
    const [patients, setPatients] = useState<PatientDocType[]>([]);

    useEffect(() => {
        let subscription: Subscription | null = null;
        let isMounted = true;

        const init = async () => {
            const db = await getDatabase();
            if (!isMounted) return;

            try {
                const foundDocs = await db.patients.find().exec();
                if (foundDocs.length === 0) {
                    // Seed if empty
                    console.log('Seeding patients database...');
                    await db.patients.bulkInsert(MOCK_PATIENTS);
                }
            } catch (error) {
                console.error('Error checking/seeding patients:', error);
            }

            // Subscribe to changes
            const sub = db.patients.find().$.subscribe(docs => {
                if (isMounted) {
                    setPatients(docs.map(d => d.toJSON()));
                }
            });

            if (isMounted) {
                subscription = sub;
            } else {
                sub.unsubscribe();
            }
        };

        init();

        return () => {
            isMounted = false;
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, []);

    return { patients };
}
