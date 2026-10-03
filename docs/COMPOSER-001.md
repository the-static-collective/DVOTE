# Composer 001

Composer 001 is a recurrence advisory organ for DVOTE MEMENTO.

It does not interpret the reader's life. It surfaces bounded evidence from the receipt archive and proposes nearby doors.

## Governing laws

**RECOMMENDATION ≠ SELECTION**

**RECURRENCE ≠ AUTHORITY**

**OMISSION ≠ NONEXISTENCE**

Composer may say that something repeated. It may not say what the repetition means.

## Evidence sources

Composer currently detects three kinds of recurrence:

- repeated words in witness notes and deliberately carried objects
- repeated carried-object labels
- repeated crossed-door titles

A candidate must appear more than once before it can surface.

The recommendation card preserves:

- recurrence type
- literal label
- count
- source receipt IDs
- source campaign days

Candidates are ordered deterministically by evidence count, number of source days, type, then label. This is an ordering rule, not a significance ranking.

## Three nearby doors

Composer offers exactly three reader-owned selections.

### KEEP

Carry the recurrence forward as an unresolved thread.

KEEP adds no meaning and makes no claim that the recurrence is important.

### RELEASE

Stop surfacing that exact recurrence at its current evidence count.

RELEASE does not erase evidence. If new receipts increase the count, the recurrence may surface again because the evidence state changed.

### INVESTIGATE

Make one bounded observation related to the recurrence without trying to prove a pattern.

The prompt explicitly allows nothing happening to count as evidence.

## Decision receipts

Composer selections are stored separately from witness receipts under the current campaign.

A decision records:

- selected action
- recurrence fingerprint
- type and label
- count at selection
- source days
- source receipt IDs
- selection timestamp
- bounded prompt

Composer decisions are not campaign receipts because choosing a recommendation is not the same as witnessing a real-world crossing.

## MEMENTO relation

MEMENTO JSON exports now include Composer state under:

`composer`

Printable / HTML editions include a separate **Nearby Doors / Composer selections** page.

This page is intentionally separated from witnessed receipt pages.

## Architecture

**Campaign owns the book. Runtime owns the life. MEMENTO binds the traces. Composer proposes nearby doors. The reader selects.**

Composer never performs the selection on the reader's behalf.
