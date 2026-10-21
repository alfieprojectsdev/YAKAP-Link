# Field notes

What people who work near rural health units have said about the problem this
project is meant to solve. Kept separate from the README so the problem
statement can be checked against it.

## 2026-10-20: a monitoring and evaluation contact at a family-planning NGO

Source: one conversation with someone who does monitoring and evaluation for a
sexual and reproductive health NGO, office in Palawan. Their work is making
sure family-planning commodities are stocked at municipalities and barangay
health stations. They said their view may only hold for commodities like
family planning.

### What they said

- The main gaps in data collection, the supply chain included, are that the
  RHU has no system, and that no one is assigned to manage the data. In
  4th-class municipalities especially, there's no supply-chain system at all.
- For some other commodities, suppliers build good systems of their own,
  because they need them. Other programs don't adopt those systems.
- They don't know yet how widespread the problem in the README is in the
  field, at least in Palawan, and offered to ask colleagues there.

### What it changes

The README's problem statement starts from connectivity: Class 4–5
municipalities have intermittent internet, so cloud-only EMRs fail and
encoding backs up. This conversation puts two gaps before that one. If an RHU
has no system and no one assigned to the data, there's nothing for offline
sync to keep running.

Hypotheses to test, not conclusions:

- A tool has to work for whoever is actually at the desk, part-time and
  without training, which probably means staying close to what they use now.
- Reading from, or feeding, the systems that programs and suppliers already
  have may matter more than adding another one.
- Offline-first may still be needed, but as a second requirement, not the
  first.

### Open questions

The contact is taking these to their partnerships team in Puerto Princesa on
Friday, 2026-10-23. Answers could come that weekend or early the week after.

Asked on 2026-10-20:

1. At RHUs without a system, how are stocks tracked now: paper, Excel, or not
   at all?
2. Who usually does the encoding (nurse, midwife, admin), and how often?
3. Which supplier systems exist, and why don't other programs adopt them?

Asked on 2026-10-21, after reviewing the Balancer spec:

4. Does stock move between RHUs today, for example near-expiry stock sent to
   a neighbouring municipality? If so, who decides, how is it carried, and
   how is it recorded? Does it differ for DOH-supplied program commodities,
   such as family planning, and for medicines the LGU buys itself?

   This would show whether redistribution already happens informally, and
   what the README's Balancer would have to fit into. If stock bought by one
   LGU can't easily move to another, the Balancer may only apply to program
   commodities.

Shared with the handbook notes by 2026-10-21 (from the end of
`docs/handbook-notes.md`):

5. Which paper forms (stock cards, registers, requisition vouchers) do RHUs
   keep now, if any?
6. Who delivers commodities to RHUs, and how often? Could counts happen at
   delivery?
7. Do the family-planning programs already use a months-of-stock minimum and
   maximum, and at what levels?
8. Does any program run vendor-managed inventory in the province?

Answers:

1.
2.
3.
4.
5.
6.
7.
8.

### Not checked yet

- The README says YAKAP/GAMOT require RHUs to submit real-time inventory and
  dispensing logs. Check that against the circular in this repo
  (`PC2025-0013.pdf`) before building on it.

## References

- *Supply Chain Managers' Handbook: A Practical Guide to the Management of
  Health Commodities*, JSI (John Snow, Inc.), 2019:
  <https://reliefweb.int/report/world/supply-chain-managers-handbook-practical-guide-management-health-commodities-enru>.
  Shared by the same contact on 2026-10-20, with the caveat that the field is
  nowhere near what it describes. Use it for the ideal; the field notes say
  where reality is. A local copy is kept in `docs/` and not committed.
