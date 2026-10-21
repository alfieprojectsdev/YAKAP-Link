# YAKAP-Link — medicine stock visibility for rural health units

Proof of concept, parked from 2026-02-05 to 2026-10-20. Being restarted on the
strength of field feedback (`docs/field-notes.md`). Read that file first: it
may change what this project should be.

## Status (2026-10-20)

- The README's problem statement is the original pitch: PhilHealth's
  YAKAP/GAMOT mandates require RHUs to submit real-time inventory and
  dispensing logs, Class 4–5 municipalities have intermittent internet, so
  cloud-only EMRs fail → encoding backlogs, and stock expires in one clinic
  while the next town runs short.
- Field feedback (one M&E contact at a family-planning NGO, office in Palawan)
  says the bigger gaps come first: many RHUs have NO system at all, and NO ONE
  is assigned to manage the data. Supplier/program systems exist but other
  programs don't adopt them. Offline-first may be a second-order requirement.
- Eight questions are out, listed in `docs/field-notes.md`: stock tracking
  today, who encodes, supplier systems, whether stock moves between RHUs, and
  four from the handbook notes. The contact meets their partnerships team on
  Friday 2026-10-23; answers could come that weekend or early the week after.
  Record them in `docs/field-notes.md`.
- Don't build further on the offline-sync premise until those answers are in.
  Re-check the problem statement against them first.
- Not checked yet: the README's "real-time logs" claim against the circular
  `docs/PC2025-0013.pdf`.

## Layout

- `README.md` — pitch: problem, architecture (local-first PWA, append-only
  ledger), "The Balancer", roadmap (Phase 1 dispensing app, 2 sync backend,
  3 balancer).
- `adr-techspec.md` — current ADRs: ADR-003 RxDB as the client store with
  incremental replication; ADR-004 "Protocol-20k-Offline-Guard" (₱20k Annual
  Benefit Limit: visitors from another municipality blocked offline; >72 h
  since sync caps dispensing at 7 days' supply). `adr-techspec.old.md` is the
  previous revision.
- `module-balancer.md` — Balancer spec: Days of Inventory (stock ÷ average
  daily consumption, 30–60 day rolling), expiry-tightened threshold (FENO,
  First-Expired-Network-Out), nightly server job.
- `client/` — Vite + React 19 + TypeScript, RxDB 16 on IndexedDB.
  `src/db/` schema (TransactionEvent, InventoryItem, Patient), `src/hooks/
  useInventory.ts` (stock projected from the ledger), `src/utils/
  dispensingGuard.ts` (ADR-004), `src/components/TransactionForm.tsx`.
  Tailwind is planned, not in yet. No sync backend exists yet (Phase 2).
- `balancer/` — Python: `core.py` (InventoryItem, Clinic, TransferOrder,
  DOI, dynamic threshold, `detect_imbalances`), `test_balancer.py` (pytest).
  Note `calculate_bmi` actually computes Days of Inventory; the name is a
  leftover (rename tracked in #44, with two bugs in `detect_imbalances`).
- `docs/field-notes.md` — what people near RHUs have said; open questions.
- `docs/handbook-notes.md` — 16 points from the JSI supply chain handbook
  (chapters 3, 7, 10), each with what it means here, plus questions for the
  field. Start there before redesigning: it argues for mapping the current
  flow first, the three essential data items, counting at delivery, and
  keeping supply data apart from patient data.
- `docs/prior-art-field-ops.md` — how the offline logsheets PWA in the
  `movefaults` repo syncs (client-uuid outbox, idempotent batch POST) and
  what it learned the hard way. Read before designing Phase 2 sync.
- `docs/PC2025-0013.pdf` — PhilHealth circular, tracked.
- `docs/JSI_LogisticHandbook_English_2019_combined_web.pdf` — JSI's supply
  chain managers' handbook, local copy only (gitignored: third-party PDF,
  public repo). Link is in `docs/field-notes.md`.

## Commands

- Client: `cd client; npm install; npm run dev` (also `build`, `lint`). No
  test script yet.
- Balancer: `cd balancer; python -m pytest` (tests import `core` directly).

## Data and privacy

- Patients are PhilHealth members; their records are health information,
  which RA 10173 (Data Privacy Act) treats as sensitive personal
  information. Never commit real patient, facility-staff or member data.
  Mock data only, clearly fake. The mock patients in `TransactionForm.tsx`
  are a placeholder name, a fictional character and a historical figure;
  neutral labels ("Patient A") would be safer if they're kept.
- Field contacts stay anonymous in this public repo ("an M&E contact at a
  family-planning NGO") unless they've agreed to be named. Ask first.

## Repo housekeeping

- 43 PRs (#1–#43) from an automated code-improvement agent (Feb 2026) were
  triaged on 2026-10-20 against the restart: 42 closed with a reason each,
  branches deleted. The closed diffs are still on GitHub if one is wanted.
  Still open: #14 (negative burn-rate fix, incomplete). Balancer bugs are in
  issue #44, on hold until the field answers are in.
- Carried over from the closed validation PRs (#1, #16, #31, #41) for the next
  form: quantity is a non-zero whole number; batch ID is required, at most 50
  characters. #39 (Vitest tests for the Protocol-20k guard) is worth reviving
  if the guard stays.
- Work on a branch and open a PR; review before merging.

## Writing

- The user's global CLAUDE.md writing rules apply to README, docs and PRs.
  The README's pitch voice ("Robin Hood alert", "Near Zero waste") predates
  them and is up for a rewrite once the problem is re-scoped.
