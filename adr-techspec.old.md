# Project Name: YAKAP-Link (Local-First Inventory Module)

## 1. Executive Summary

**Problem:** PhilHealth's YAKAP/GAMOT program requires Rural Health Units (RHUs) to submit inventory and dispensing logs to the central server. However, many RHUs in remote municipalities have intermittent internet. Current "Cloud-Only" EMRs fail here—when the internet cuts out, the staff reverts to paper, leading to encoding backlogs, inventory mismatch, and failed claims.

**Solution:** A **"Local-First" Progressive Web App (PWA)**. The app treats the *local device* (clinic laptop/tablet) as the primary database. It functions 100% perfectly without internet. When a connection is detected (e.g., once a week when staff travels to the town proper), it automatically "syncs" the accumulated transaction logs to the Central Server.

---

## 2. Architecture Decision Record (ADR)

### ADR-001: Local-First Data Strategy (The "Optimistic UI" Pattern)

* **Context:** The "Real-Time" requirement of PhilHealth is impossible in Class 4-5 municipalities. Forcing a live connection results in "System Down" errors and patient rejection.
* **Decision:** We will implement an **Offline-First Architecture**.
* **Write Path:** All inventory subtractions (dispensing) are written *immediately* to the browser's **IndexedDB**.
* **Sync Path:** A background service worker monitors network status. When `Online = True`, it pushes a "Journal of Actions" (not just the final state) to the cloud.


* **Consequences:**
* *Positive:* Zero downtime. Staff can dispense meds even during a blackout.
* *Positive:* No "loading spinners." The UI is instant because it talks to the local disk.
* *Negative:* "Central Inventory" view is eventually consistent, not real-time (lag is equal to the sync interval).
* *Mitigation:* The "Local" inventory is always accurate for that specific clinic, which is what matters for dispensing.



### ADR-002: Conflict Resolution via "Append-Only Logs"

* **Context:** If two devices in the same clinic try to update the stock of "Amoxicillin" while offline, a simple "overwrite" will cause data loss.
* **Decision:** We will not store just the "Total Count" (e.g., `500 boxes`). We will store a **Ledger of Transactions**.
* *Bad:* `Update Stock = 499`
* *Good:* `Action: DISPENSE, Qty: 1, Ref: Patient_ID_123, Time: 10:00AM`


* **Consequences:**
* The server replays these logs to calculate the true total. If Device A dispenses 5 and Device B dispenses 3, the server calculates `-5` and `-3`, resulting in `-8`. No conflict exists.



---

## 3. Technical Specification (The "Mechanic's View")

### 3.1 The Tech Stack (Lightweight & robust)

* **Frontend:** **Astro** (for static shell) + **React** (for interactivity).
* **Local Database:** **RxDB** or **Dexie.js** (Wrappers for IndexedDB). These libraries handle the "Save to Browser" logic.
* **Sync Engine:** **TanStack Query** (React Query) with `persist-client`. It handles the "Retry if failed" logic automatically.
* **Backend:** **PostgreSQL** (NeonDB) to receive the logs.

### 3.2 Data Structure (JSON Schema)

**The Inventory Item (Local State):**

```json
{
  "sku": "MED-AMOX-500",
  "name": "Amoxicillin 500mg",
  "local_stock": 145,  // Calculated from local ledger
  "last_synced_stock": 150, // Snapshot from server
  "last_sync_time": "2026-01-29T08:00:00Z"
}

```

**The Transaction Log (The "Queue"):**
This is what gets stored in `localStorage` / `IndexedDB` and pushed to the server later.

```json
{
  "transaction_id": "uuid-v4-generated-locally",
  "type": "DISPENSE",
  "sku": "MED-AMOX-500",
  "qty": -12,
  "recipient": "PhilHealth_ID_9999",
  "timestamp": "2026-01-29T14:30:00Z",
  "sync_status": "PENDING" // Changes to "SYNCED" after upload
}

```

### 3.3 The Sync Workflow (Step-by-Step)

1. **Dispense Action:**
* Nurse clicks "Dispense 10 Tablets".
* App writes to **IndexedDB**: `transactions_table`.
* App updates UI immediately: `Stock: 135`. (User sees success instantly).


2. **Background Sync (Service Worker):**
* *Scenario A (No Signal):* The worker sleeps. Data stays safe on the tablet.
* *Scenario B (Signal Detected):*
1. Worker fetches all records where `sync_status == "PENDING"`.
2. sends `POST /api/sync/batch` with the JSON payload.
3. Server responds `200 OK`.
4. Worker updates local records to `sync_status = "SYNCED"`.




3. **Conflict Handling (The Edge Case):**
* *Problem:* What if the server says stock is 0, but the local tablet thought it was 10?
* *Resolution:* The Server response includes a `stock_correction`. The app displays a "Stock Adjustment Alert" to the nurse: *"Server indicates stock is depleted. Please verify physical count."*



### 3.4 Hardware Requirements (Low Barrier)

* **Existing Devices:** Works on the generic Android tablets or Windows 7/10 laptops usually found in RHUs.
* **Browser:** Chrome 80+ or Edge (Standard).
* **Storage:** Needs ~50MB of disk space (Text data is tiny).

---

## 4. Why This Solves the "PhilHealth Bottleneck"

> "Unlike the current system that demands a live connection (which fails in Kalinga or Palawan), this system mimics the **Physical Logbook**. You write in the logbook regardless of the internet. When the 'auditor' comes (the internet connects), they just photocopy your logbook."

This approach respects the reality of Philippine infrastructure while satisfying the government's need for digital data.
