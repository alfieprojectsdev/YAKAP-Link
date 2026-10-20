# Notes from the JSI supply chain handbook

Source: *The Supply Chain Manager's Handbook: A Practical Guide to the
Management of Health Commodities*, JSI, 2019 (link in `docs/field-notes.md`;
the PDF is kept locally, not committed). Page numbers are the printed ones.

Read for this project: chapter 3 (information systems), chapter 7 (inventory
control), chapter 10 (workforce). Skimmed: chapter 9 (performance
indicators). Not read closely: product selection, quantification,
procurement, warehousing, financing, risk.

These notes are paraphrases, not quotations. Each one ends with what it may
mean for YAKAP-Link, checked against what the field contact said on
2026-10-20 (no system at many RHUs, no one assigned to the data).

## What to record

1. Collect only what someone will use. Health workers are already
   overloaded with data collection, so data that won't drive a supply
   decision shouldn't be collected at all (p. 30).
   At an RHU with no system, a long form is the fastest way
   to get nothing. Start from the smallest record that changes a decision.

2. Three items are essential: stock on hand (usable stock only), consumption
   (dispensed or used in the period), and losses and adjustments (expiry,
   theft, damage; transfers to or from other facilities; corrections after a
   count). Per product, per location, per period (pp. 31–32).
   The append-only ledger already fits this. Transfers
   between RHUs, which the Balancer would create, are "adjustments" in the
   handbook's terms, and should be recorded that way on both sides.

3. Supply data and patient data are different systems. Logistics data is
   about quantities of commodities; health information systems hold patient
   and service data (p. 30, table 3-1).
   The Protocol-20k guard and patient records belong to the
   patient side; stock visibility doesn't need them. Separating the two would
   shrink the privacy surface and the first build.

4. Three kinds of records: stock-keeping (stock or bin cards, ledgers),
   transactions (requisition, issue and receipt vouchers), and consumption
   (dispensing registers, tick sheets). They should cross-check: what the
   dispensing register shows should roughly match the issues on the stock
   card (p. 33).
   Ask which of these paper forms RHUs keep today, if any
   (open question 1). A tool that mirrors a form people already fill in is
   easier to adopt than a new one.

5. Consumption can be worked out from stock counts. One example from
   Zimbabwe: the delivery team counts stock when it arrives, software compares
   the count with the last one to get consumption, and the team tops the
   facility up to its maximum from the truck (p. 34).
   This is the strongest fit for "no one is assigned to the
   data". The people doing the counting are the ones delivering, so the RHU
   doesn't have to encode anything daily. Worth asking who delivers
   commodities to RHUs and how often.

## Moving the data

6. Reports go up, feedback comes down. Summary reports move the essential
   items to higher levels; feedback reports go back down, show facilities how
   they're doing, and keep them reporting (pp. 34–36). Tying reporting to
   ordering makes reports arrive on time (p. 41).
   The Balancer's transfer suggestions are a feedback
   report. An RHU should get something back for reporting, ideally its next
   resupply.

7. Going digital usually starts small, for example health workers texting
   stock balances, and grows from there (p. 28).
   A first version could be that small, not a full
   offline-first app.

8. Before building a digital system, four things should be in place:
   working processes (or a commitment to fix them first), a mixed team,
   long-term institutional backing, and money to keep it running. The
   suggested first phase is to map how information and products flow today,
   define the problem, and check that automating it would actually solve it
   (pp. 38–39).
   This is the field contact's point in the handbook's own
   terms. With no process and no owner, there's nothing yet to automate. The
   restart should begin with that mapping.

9. Systems should connect: to medical records for dispensing data, to
   suppliers' systems for orders, and to a shared list of facility codes so
   every system names a facility the same way (p. 38).
   The contact said suppliers' own systems work but other
   programs don't adopt them. Linking to those, or agreeing on shared
   facility and product codes, may be worth more than another separate app.

10. Data quality needs time and support, not just software: trained staff
    with time for the task, simple forms, on-the-job supervision, and checks
    against history or patient-side data (p. 41).

## Inventory control

11. Public health supply chains usually manage by months of supply, with a
    minimum and maximum. Three variants differ only in what triggers an order:
    the end of a review period, reaching the minimum, or the end of a review
    period for items already at the minimum (pp. 102–103).
    The Balancer's Days of Inventory is the same idea at a
    finer grain. Check which variant and which levels the DOH or the
    family-planning programs use, and match them rather than inventing
    thresholds.

12. Inventory aging (remaining shelf life of stock on hand) is the measure
    for spotting stock at risk of expiry; first-to-expire, first-out is the
    usual rule (p. 105). The handbook calls inventory accuracy, records
    matching what's on the shelf, the measure everything else depends on
    (p. 105).
    The Balancer's expiry pressure fits here, but only after
    counts are trustworthy.

13. In vendor-managed inventory, a supplier or NGO takes on keeping a
    facility stocked, with roles set in an agreement (p. 104).
    This is likely related to "suppliers build good systems because
    they need them". Ask whether any programs in Palawan already work this
    way.

## People

14. Every supply task needs an owner, even part-time. Where there's no
    dedicated staff, supply tasks go to people whose main job is something
    else, for example a family-planning counsellor keeping stock cards and
    placing orders. That combination should be checked for being realistic
    (p. 142).

15. Nurses and midwives already do supply work because trained supply staff
    are scarce. The handbook treats this task-shifting, moving routine tasks to
    less specialised cadres with training, as a recognised answer (p. 146).
    Design for a nurse or midwife doing this between
    patients, with minimal steps and no training assumed (open question 2).

## Measuring a restart

16. Process indicators such as reporting rates, and outcome indicators such
    as stockouts at facilities, are the usual measures (chapter 9, around
    p. 135).
    Judge a pilot by how many RHUs report on time and
    whether stockouts fall, not by installs.

## Questions this adds for the field

- Which paper forms (stock cards, registers, requisition vouchers) do RHUs
  keep now, if any?
- Who delivers commodities to RHUs, and how often? Could counts happen at
  delivery?
- Do the family-planning programs already use a months-of-stock minimum and
  maximum, and at what levels?
- Does any program run vendor-managed inventory in the province?
