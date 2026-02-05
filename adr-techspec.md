# Architecture Decision Record (ADR) - REVISION 2

## ADR-003: "Replicated Database" Pattern (Replacing Cache-First)
* **Context:** Managing offline mutations with generic "Retry" logic (TanStack Query) is fragile. We need to guarantee that *every* dispensing action eventually reaches the server, even if the device restarts or clears the browser cache.
* **Decision:** We will use **RxDB** as the primary client-side data store with **Incremental Replication**.
* **Rationale:**
    * **Observability:** The UI "observes" the local DB. When we dispense, we write to RxDB. The UI updates *instantly* (0ms latency).
    * **Background Sync:** RxDB handles the "Push/Pull" replication in a Web Worker. It manages "Checkpoints" (e.g., "I last synced at Sequence #105").
    * **Deltas:** If the internet is slow (common in Kalinga), we only download the *new* prescriptions, not the whole database.

## ADR-004: The "Home Court" Protocol for ABL Protection
* **Context:** Preventing "Double-Dipping" of the ₱20,000 Annual Benefit Limit (ABL) in an eventually consistent system.
* **Decision:** Implement `Protocol-20k-Offline-Guard`.
* **Logic:**
    1.  **Strict Mode:** If the patient belongs to a different Municipality (Visitor), dispensing is **blocked** while offline (requires override).
    2.  **Staleness Cap:** If `Last_Sync_Date` > 72 hours, limit dispensing to **7 days supply** (Emergency Buffer).
    3.  **Liability:** The app forces the user to acknowledge: *"Warning: Device is offline. Facility assumes risk for non-reimbursable amounts if limit is exceeded."*
