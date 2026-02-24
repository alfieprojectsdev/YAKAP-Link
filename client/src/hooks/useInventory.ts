import { useState, useEffect } from 'react';
import { getDatabase, type MyDatabase } from '../db/database';
import { type TransactionDocType } from '../db/schema';

export function useInventory(sku: string | null) {
    const [currentStock, setCurrentStock] = useState<number>(0);
    const [transactions, setTransactions] = useState<TransactionDocType[]>([]);
    const [db, setDb] = useState<MyDatabase | null>(null);

    useEffect(() => {
        getDatabase().then(setDb);
    }, []);

    useEffect(() => {
        if (!db || !sku) return;

        // The "Projector":
        // Subscribe to the query of all transactions for this SKU
        const query = db.transactions.find({
            selector: {
                sku: { $eq: sku }
            },
            sort: [{ timestamp: 'desc' }] // Show latest first
        });

        const subscription = query.$.subscribe(docs => {
            const txs = docs.map(d => d.toJSON());
            setTransactions(txs);

            // Reduce Logic: Calculate Stock
            const total = txs.reduce((acc, tx) => {
                // If it's a dispense, qty is likely negative or we handle logic here.
                // Requirement says: "Dispense | Receive | Adjust".
                // Let's assume the 'qty' field in the event is the delta.
                // e.g. DISPENSE of 5 -> qty: -5
                // e.g. RECEIVE of 10 -> qty: 10
                return acc + tx.qty;
            }, 0);

            setCurrentStock(total);
        });

        return () => subscription.unsubscribe();
    }, [db, sku]);

    const addTransaction = async (type: 'DISPENSE' | 'RECEIVE' | 'ADJUST', qty: number, batch_id: string) => {
        if (!db || !sku) return;

        // Ensure negative for Dispense if user passes positive
        let finalQty = qty;
        if (type === 'DISPENSE' && qty > 0) finalQty = -qty;
        if (type === 'RECEIVE' && qty < 0) finalQty = -qty; // Receive should be positive

        await db.transactions.insert({
            id: crypto.randomUUID(),
            type,
            sku,
            batch_id,
            qty: finalQty,
            timestamp: new Date().toISOString(),
            sync_status: 'PENDING'
        });
    };

    return {
        currentStock,
        transactions,
        addTransaction
    };
}
