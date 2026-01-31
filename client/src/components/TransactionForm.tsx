import React, { useState } from 'react';

interface TransactionFormProps {
    onAdd: (type: 'DISPENSE' | 'RECEIVE' | 'ADJUST', qty: number, batchId: string) => void;
    sku: string;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, sku }) => {
    const [qty, setQty] = useState<number>(0);
    const [batchId, setBatchId] = useState<string>('BATCH-001');

    return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem', borderRadius: '8px' }}>
            <h3>Actions for {sku}</h3>
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
                    onClick={() => { onAdd('DISPENSE', qty, batchId); setQty(0); }}
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
