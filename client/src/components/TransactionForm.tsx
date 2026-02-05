import React, { useState } from 'react';
import { checkDispensingEligibility, type LocalSettings, type GuardResult } from '../utils/dispensingGuard';
import { type PatientDocType } from '../db/schema';

// Mock Patient Data (Since we don't have a patient picker UI yet)
const MOCK_PATIENTS: (PatientDocType & { last_sync_date: string })[] = [
    { id: 'P1', name: 'Juan Dela Cruz', municipality: 'Tabuk', last_sync_date: new Date().toISOString() },
    { id: 'P2', name: 'Maria Clara', municipality: 'Lubuagan', last_sync_date: new Date().toISOString() }, // Visitor
    { id: 'P3', name: 'Jose Rizal', municipality: 'Tabuk', last_sync_date: '2023-01-01T00:00:00Z' } // Stale
];

const LOCAL_SETTINGS: LocalSettings = {
    municipality: 'Tabuk',
    isOnline: false // Simulating Offline Mode
};

interface TransactionFormProps {
    onAdd: (type: 'DISPENSE' | 'RECEIVE' | 'ADJUST', qty: number, batchId: string) => void;
    sku: string;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, sku }) => {
    const [qty, setQty] = useState<number>(0);
    const [batchId, setBatchId] = useState<string>('BATCH-001');
    const [selectedPatientId, setSelectedPatientId] = useState<string>('P1');
    const [guardResult, setGuardResult] = useState<GuardResult | null>(null);

    const handleDispense = () => {
        const patient = MOCK_PATIENTS.find(p => p.id === selectedPatientId);
        if (!patient) return;

        // Run Protocol-20k Check
        const result = checkDispensingEligibility(patient, LOCAL_SETTINGS);
        setGuardResult(result);

        if (result.allowed) {
            onAdd('DISPENSE', qty, batchId);
            setQty(0);
        }
    };

    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
            <h3>Actions for {sku}</h3>

            <div style={{ marginBottom: '1rem', padding: '0.5rem', backgroundColor: '#f0f9ff', borderRadius: '4px' }}>
                <label style={{ display: 'block', fontWeight: 'bold' }}>Select Patient (Mock):</label>
                <select
                    value={selectedPatientId}
                    onChange={e => { setSelectedPatientId(e.target.value); setGuardResult(null); }}
                    style={{ width: '100%', padding: '0.5rem' }}
                >
                    {MOCK_PATIENTS.map(p => (
                        <option key={p.id} value={p.id}>
                            {p.name} ({p.municipality}) - {new Date(p.last_sync_date).toLocaleDateString()}
                        </option>
                    ))}
                </select>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
                    Context: Offline Mode. Home: Tabuk.
                </div>
            </div>

            {guardResult && !guardResult.allowed && (
                <div style={{ padding: '0.5rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #f87171' }}>
                    <strong>🚫 Transaction Blocked</strong>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>{guardResult.reason}</p>
                </div>
            )}

            {guardResult && guardResult.allowed && guardResult.cap_limit && (
                <div style={{ padding: '0.5rem', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '4px', marginBottom: '1rem', border: '1px solid #fcd34d' }}>
                    <strong>⚠️ Liability Warning</strong>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>{guardResult.reason}</p>
                </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <label>
                    Batch ID:
                    <input
                        value={batchId}
                        onChange={e => setBatchId(e.target.value)}
                        style={{ marginLeft: '5px' }}
                    />
                </label>
                <label>
                    Quantity:
                    <input
                        type="number"
                        value={qty}
                        onChange={e => setQty(Number(e.target.value))}
                        style={{ marginLeft: '5px', width: '80px' }}
                    />
                </label>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <button
                    onClick={handleDispense}
                    style={{ backgroundColor: '#ffcccc', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Dispense ( - )
                </button>
                <button
                    onClick={() => { onAdd('RECEIVE', qty, batchId); setQty(0); }}
                    style={{ backgroundColor: '#ccffcc', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Receive ( + )
                </button>
                <button
                    onClick={() => { onAdd('ADJUST', qty, batchId); setQty(0); }}
                    style={{ backgroundColor: '#ffffcc', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Adjust ( +/- )
                </button>
            </div>
        </div>
    );
};
