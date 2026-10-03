# Artifact Layer 001

DVOTE should feel like an object carried into life, not a dashboard about life.

This layer adds three reader-facing surfaces around the existing campaign runtime.

## 1. The Threshold

Opening a campaign is not the same action as beginning it.

A first-time reader sees a book-like cover with campaign title, subtitle, author, mark, and the line:

> Day 1 begins when you cross.

The campaign clock starts only when the reader presses **ENTER**.

This preserves a useful distinction:

**DOOR ≠ CROSSING**

A URL can present a door. The reader begins the campaign by crossing it.

## 2. The Campaign Shelf

DVOTE now has a small catalog at `campaigns/catalog.json`.

Playable books:
- Paula King — *42-Day Devotional Guide: A Journey of Hope and Restoration*
- The Static Collective — *Field Notes 001*

Nearby doors:
- REVIVAL
- National Treasure
- The Golden Promise

Nearby doors are visible but non-interactive until a real campaign exists. The shelf can therefore show the shape of the library without pretending unfinished work is playable.

## 3. Field Receipts

Witness records are rendered as collectible field cards.

A receipt shows:
- serial number
- campaign day
- encounter
- door crossed
- witness note
- carried object, when present
- weather
- calendar date

The visual card does not alter the underlying receipt semantics.

**Receipt = what happened, not what DVOTE claims it meant.**

## Runtime law

**Campaign owns the book. Runtime owns the life.**

Campaign content proposes bounded encounters and doors.

The reader supplies:
- crossing
- witness
- carried objects
- recurrence
- consequence

DVOTE preserves those traces without assigning sacred scores or authoritative interpretations.

## Offline behavior

The application shell, campaign catalog, Paula 42, and Field Notes are cached by the service worker after installation.

## Next seams

Likely follow-ons:
- MEMENTO export from selected receipts
- 7 / 21 / 42-day compiled booklets
- photo/audio witness attachments
- a Composer that can recommend nearby doors from recurrence without selecting for the reader
- public deployment / install-to-home-screen polish
