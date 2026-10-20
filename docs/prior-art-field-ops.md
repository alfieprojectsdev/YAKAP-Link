# Prior art: the field-ops offline logsheets

The `movefaults` repo has a working offline-first PWA,
`services/field-ops/`. Observers use it to file station-visit logsheets
with photos from sites with no signal. It went from scaffold (2026-02-24)
to production use over about 80 commits; the last change to it was on
2026-09-17. Notes below are from commit `035f40b`.

This is a reference for Phase 2 (sync), written on 2026-10-20 while the
field questions in `docs/field-notes.md` are still open. Nothing here should
be built until those answers are in.

## How its sync works

It doesn't replicate a database. It's an outbox:

- Every record gets a `client_uuid` on the device before it is saved.
- Records sit in an IndexedDB store (`idb`, not RxDB) with a status:
  pending, synced or error (`frontend/src/hooks/useOfflineQueue.ts`).
- On the browser's `online` event, or a manual "Sync now", pending records
  go to the server as one batch POST.
- The server inserts with `ON CONFLICT (client_uuid) DO NOTHING`, then
  re-reads the rows by uuid and returns them
  (`src/field_ops/routers/logsheets.py:314`). A retry returns the existing
  row and never creates a second one.
- A record is marked synced only after the server has the text and every
  photo.

YAKAP-Link's `TransactionEvent` already has this shape: an `id` from
`crypto.randomUUID()` and a `sync_status` of PENDING or SYNCED. Ledger
events are append-only, so there is nothing to merge. Whether ADR-003's
RxDB incremental replication is needed at all is worth deciding against
this simpler pattern before Phase 2 starts.

## Lessons that hold whatever the field says

Each of these came from a failure in the field-ops code, recorded in its
comments.

1. Every IndexedDB call needs a timeout (`withTimeout`,
   `useOfflineQueue.ts:170`). An upgrade blocked by another open tab never
   fires success, and a multi-megabyte write on a low-memory phone can
   never settle. An observer saw the submit button stuck on "Saving…" with
   the sheet saved nowhere. A rejection can be retried; a hang can't.
2. Check storage before saving (`storageHeadroom`, line 270). It uses
   `navigator.storage.estimate()` and requires twice the incoming size
   free. A quota of zero means the browser didn't say, not that the
   device is full; treating it as full blocked every save on those
   devices.
3. One sync at a time, for the whole app (`flushQueue`, line 845). The
   hook was mounted by three components, and each one's `online` listener
   started its own flush, which uploaded the same photo three times. The
   lock and the listener live at module scope.
4. Separate "this record is wrong" from "the network is down"
   (`ApiError.isPermanent`, `frontend/src/services/api.ts:180`). A 4xx
   other than 401, 408 or 429 means the record itself was refused. The
   batch is then resent one record at a time (`flushIndividually`,
   line 637), so one bad record can't block the rest. The bad one is
   marked with the server's message, and the operator can retry it after
   fixing it. A network failure leaves everything pending, with no error
   shown on the record.
5. Hold records that name a code the server refused
   (`holdSheetsForUnsettledSites`, line 403). Station codes on logsheets
   are plain text with no foreign key. A sheet filed under a code the
   server had just rejected as already taken used to be sent anyway, which
   put a day's observations on someone else's station. The closest
   YAKAP-Link case is facility and product codes (handbook note 9). A
   transfer naming a facility code nobody recognises should wait rather
   than land on the wrong facility.
6. Storage migrations never delete unsynced records (`upgrade`, line 189).
   Old record shapes are read as they are and never rewritten.
7. Messages tell the user where the data is. The runbook
   (`FIELD_RUNBOOK.md`, section 4) maps each message to what it means and
   what to do. "Saved offline" and "saved on the server" are different
   sentences, and the app never claims a photo was sent when it wasn't.

## What may not transfer

The code assumes a staffed process. Field-ops observers have named
accounts, a runbook, and a routine:

- open the app on wifi before leaving
- sign in each morning (sessions last 8 hours)
- clear the queue before leaving coverage
- report problems on GitHub

That routine has an owner. The field contact says RHUs often have nobody
assigned to the data (`docs/field-notes.md`; handbook notes 8 and 14). The
sync code would carry over, but the routine around it may not have anyone
to follow it.

The runbook also lists one open risk that YAKAP-Link would share: opening
the installed app from the home screen with no signal depends on the
service worker and has not been tested on a real phone. Anything built
here should test install, then airplane mode, then open, before anyone
relies on it.

## An idea to test, not a conclusion

Field-ops stores photos with the record and uploads them one at a time,
picking up where it left off (`photo_progress` store, line 100). The same
mechanism would work for a photo of a paper stock card. If question 1 comes
back "paper", photographing the card at each delivery or each month may be
the smallest useful first version: it adds no encoding work at the RHU, in
line with handbook note 7 (start small, such as texting stock balances).
Someone would still have to read the photos, so it moves the encoding
rather than removing it.
