# DVOTE Campaign Format v1

A campaign is a book-like content pack consumed by the DVOTE runtime.

The runtime owns interaction, receipts, inventory, recurrence, offline behavior, and reader-local progress.

The campaign owns language, sequence, doors, and optional presentation metadata.

## Smallest valid campaign

```json
{
  "schema": "dvote.campaign.v1",
  "id": "example",
  "title": "Example",
  "version": "1.0.0",
  "progression": {
    "mode": "daily",
    "after": "hold"
  },
  "encounters": [
    {
      "id": "day-1",
      "title": "A Door",
      "text": "One bounded encounter.",
      "carry": "One sentence worth carrying.",
      "doors": [
        {
          "id": "door-1",
          "title": "GO LOOK",
          "prompt": "Leave the page and do one concrete thing."
        }
      ]
    }
  ]
}
```

## Laws

1. **One encounter should fit the hand.** A campaign may be long; today's unit should remain bounded.
2. **Doors cross into life.** A door is an action, experiment, observation, practice, or deliberate non-action.
3. **Receipt is not interpretation.** Campaign text may invite reflection, but the runtime records what happened without declaring what it meant.
4. **Progress belongs to the reader.** A daily campaign begins when that reader first opens it.
5. **No sacred score.** The format has no XP, holiness, faith, virtue, or divine-favor field.
6. **Campaigns do not own memory.** Receipts remain reader-local and are namespaced by campaign.
7. **Content should survive export.** IDs are stable so receipts can later become portable MEMENTO bundles.

## Progression

`progression.mode`

- `daily` — advance one encounter per local calendar day since first open.

`progression.after`

- `hold` — remain on the final encounter after completion.
- `cycle` — begin again at encounter one.

Future modes may include deliberate/manual crossing, liturgical calendars, location-aware routes, and branching campaigns. They should be added without changing the meaning of v1.

## Reader state

Reader state is not stored in campaign JSON.

The runtime currently keeps, per campaign:

- first-open timestamp
- selected weather
- witness receipts
- carried inventory objects

This separation lets the same campaign be shared without sharing the reader's life.

## Loading

The current web runtime loads:

`campaigns/<campaign-id>/campaign.json`

The campaign can be selected with:

`?campaign=<campaign-id>`

Default: `field-notes-001`.

## Paula 42

The 42-day devotional is the natural first full-length campaign. Its source remains a book; conversion should preserve each day's devotional voice and scripture while composing bounded phone encounters and real-world doors rather than mechanically chopping pages into screens.
