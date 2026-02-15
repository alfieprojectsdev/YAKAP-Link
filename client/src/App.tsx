import { useState } from 'react';
import { useInventory } from './hooks/useInventory';
import { TransactionForm } from './components/TransactionForm';

function App() {
  const [selectedSku, setSelectedSku] = useState<string>('MED-AMOX-500');
  const { currentStock, transactions, addTransaction } = useInventory(selectedSku);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333' }}>YAKAP-Link (Local Store)</h1>
        <p style={{ color: '#666' }}>Offline-First Pharmaceutical Logistics</p>
      </header>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Left Column: Selector and status */}
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select SKU:</label>
          <select
            value={selectedSku}
            onChange={e => setSelectedSku(e.target.value)}
            style={{ padding: '0.5rem', width: '100%', marginBottom: '2rem' }}
          >
            <option value="MED-AMOX-500">Amoxicillin 500mg</option>
            <option value="MED-PARA-500">Paracetamol 500mg</option>
            <option value="MED-DOXY-100">Doxycycline 100mg</option>
          </select>

          <div style={{
            backgroundColor: currentStock < 100 ? '#fff0f0' : '#f0fff4',
            padding: '2rem',
            borderRadius: '12px',
            textAlign: 'center',
            border: '1px solid',
            borderColor: currentStock < 100 ? '#ffcccc' : '#bbf7d0'
          }}>
            <h2 style={{ margin: 0, fontSize: '4rem', fontWeight: '900' }}>{currentStock}</h2>
            <p style={{ margin: 0, color: '#666', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>Current Stock</p>
          </div>

          <TransactionForm sku={selectedSku} onAdd={addTransaction} />
        </div>

        {/* Right Column: Ledger Activity */}
        <div style={{ flex: 1, backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '12px' }}>
          <h3 style={{ marginTop: 0 }}>Transaction Ledger</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {transactions.length === 0 ? (
              <p style={{ color: '#999', fontStyle: 'italic' }}>No transactions recorded.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {transactions.slice().reverse().map(tx => (
                  <li key={tx.id} style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{tx.type}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>
                        {new Date(tx.timestamp).toLocaleTimeString()} • {tx.batch_id}
                      </div>
                    </div>
                    <div style={{
                      fontWeight: 'bold',
                      color: tx.qty > 0 ? 'green' : (tx.qty < 0 ? 'red' : 'gray')
                    }}>
                      {tx.qty > 0 ? '+' : ''}{tx.qty}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
