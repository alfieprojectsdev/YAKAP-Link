# YAKAP-Link Client (Local-First)

This is the frontend application for **YAKAP-Link**, built with **Vite + React + TypeScript**. It implements a "Local-First" architecture using **RxDB** to ensure 100% offline availability for rural health units.

## Key Features

-   **Zero-Latency Dispensing:** Writes to IndexedDB instantly; syncs in background.
-   **Protocol-20k Guard:** Enforces "Home Court" rules to prevent double-dipping of benefits while offline.
    -   *Visitor Block:* Cannot dispense to out-of-town patients without internet.
    -   *Staleness Cap:* Limits dispensing if device hasn't synced in >72 hours.
-   **Event Sourcing:** Calculates stock levels on-the-fly from a local ledger of transactions.

## Tech Stack

-   **Framework:** React 18 + Vite
-   **Database:** RxDB (with Dexie/IndexedDB adapter)
-   **State Management:** React Hooks + RxDB Observables
-   **Styling:** CSS Modules / Vanilla CSS (Migrating to Tailwind)

## Developer Guide

### Prerequisites
-   Node.js 18+
-   npm 9+

### Setup

```bash
cd client
npm install
npm run dev
```

### Project Structure

-   `src/db/`: Database initialization and Schema definitions (`TransactionEvent`, `InventoryItem`, `Patient`).
-   `src/hooks/`: Custom hooks like `useInventory` (The Projector).
-   `src/utils/`: Business logic validation (`dispensingGuard.ts`).
-   `src/components/`: UI Components (`TransactionForm`).
