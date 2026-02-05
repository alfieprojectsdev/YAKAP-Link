# Project YAKAP-Link: The "Local-First" Pharmaceutical Logistics Grid

**Status:** Technical Proposal / Proof of Concept **Core Philosophy:** "Equity through Engineering" — Solving the *Last Mile* connectivity gap in Philippine healthcare.

---

## 1\. Executive Summary

**The Problem:** PhilHealth's YAKAP/GAMOT mandates require Rural Health Units (RHUs) to submit real-time inventory and dispensing logs. However, Class 4-5 municipalities suffer from intermittent connectivity. Current "Cloud-Only" EMRs fail in these environments, leading to:

1. **Data Gaps:** Encoding backlogs when the internet is down.
2. **Stockouts & Waste:** Medicine expires in one clinic while a neighboring town is in critical shortage, due to a lack of visibility.

**The Solution:** **YAKAP-Link** is a **Local-First Progressive Web App (PWA)**. It treats the *local device* as the primary source of truth, ensuring 100% uptime for dispensing. It implements a **"Mesh Redistribution Engine"** that mathematically identifies and prevents waste before it happens.

---

## 2\. System Architecture

### 2.1 The "Offline-First" Core (ADR-001)

Unlike traditional web apps that read from a server, YAKAP-Link reads from the device's internal storage (IndexedDB).

- **Write Path:** Dispensing actions are written immediately to the local Ledger. The UI never "loads"; it is instant.
- **Sync Path:** A background Service Worker detects connectivity. When `Online = True`, it pushes a "Journal of Actions" to the Central Server.

### 2.2 Conflict Resolution: The "Append-Only" Ledger (ADR-002)

To prevent data corruption when multiple devices sync later, we do not store "Total Stock." We store **Transactions**.

- **Wrong Way:** Overwriting `Stock = 490` (Causes race conditions).
- **YAKAP-Link Way:** Recording `Action: DISPENSE, Qty: -10, Time: 10:00 AM`.

The server replays these logs to calculate the final state, ensuring mathematical consistency even if devices sync days apart.

- **Frontend:** Astro (Shell) + React (Interactive UI).
- **Local Database:** **RxDB** (IndexedDB wrapper for robust local storage & replication).
- **Styling:** **TailwindCSS**.
- **Backend:** Node.js / Python + PostgreSQL (NeonDB).

---

## 3\. "The Balancer": Intelligent Redistribution Engine

This module transforms the system from a simple logger into a **Waste Prevention Engine**. It runs nightly on the Central Server to optimize stock levels across the entire province/region.

### 3.1 The Logic: Days of Inventory (DOI)

We normalize stock levels based on consumption velocity, not just quantity.

$$
DOI=Average Daily Consumption (ADC)Current Stock Level​
$$

- **ADC:** Calculated using a 30-day rolling average to account for recent outbreaks (e.g., Dengue season).

### 3.2 The "Expiry Pressure" Variable (
$$
Texp​
$$
)

We implement a **FENO (First-Expired-Network-Out)** strategy. If stock is expiring, the "Overstock Threshold" tightens dynamically to force a transfer.

**The Formula:**

$$
Thresholddynamic​=Thresholdbase​×(12Months to Expiry​)
$$

- **Scenario:** If stock expires in 3 months, the system lowers the "Hoarding Limit" drastically. If an RHU holds more than 22 days of stock, it is flagged as **"Critical Surplus"** and routed to a high-volume hospital.

### 3.3 Offline Integrity: Protocol-20k-Guard (ADR-004)

To prevent "Double-Dipping" of benefits (₱20k ABL) while offline, we verify eligibility locally:

1.  **Home Court Rule:** Visitor patients (from other municipalities) are **blocked** from offline dispensing. They require an online verification.
2.  **Staleness Cap:** If the device hasn't synced in >72 hours, dispensing is capped at a 7-day emergency supply to limit liability.

---

## 4\. Operational Workflows

### 4.1 Field Usage (The Nurse's View)

1. **Login:** Offline auth using cached credentials.
2. **Dispense:** Nurse scans QR / selects med. Stock updates instantly (-1).
3. **Sync:** When the nurse travels to the town proper (or signal returns), the app auto-syncs in the background. Green checkmark appears.

### 4.2 The "Robin Hood" Alert (The Officer's View)

Instead of boring spreadsheets, the Municipal Health Officer receives actionable "Missions":

> ⚠️ **Waste Prevention Alert**
> 
> You have **500 vials of Insulin** expiring in **4 months**. Based on current usage, **350 vials** are at risk of expiration.
> 
> **Action:** A transfer order has been generated for **Provincial Hospital (20km away)**. **\[Click to Approve Transfer\]**

---

## 5\. Value Proposition

| Feature | Old System (Cloud-Based) | YAKAP-Link (Local-First) |
| --- | --- | --- |
| **Connectivity** | Requires 24/7 Internet | Works 100% Offline |
| **Speed** | Slow (Server Latency) | Instant (Zero Latency) |
| **Inventory** | Static Numbers | **Predictive Redistribution** |
| **Compliance** | "System Down" Excuses | **Audit-Ready Logs** |
| **Waste** | High (Expired in Warehouse) | **Near Zero (FENO Logic)** |

---

### 6\. Roadmap & Implementation

1. **Phase 1 (Core):** Build the Offline-First Dispensing App (PWA).
2. **Phase 2 (Sync):** Deploy the PostgreSQL backend and Sync Service.
3. **Phase 3 (Brain):** Activate "The Balancer" algorithm for automated redistribution recommendations.

---

*Authored by: Alfie* *Tech Stack Reference: FieldLogic Core*