# OutYah — Investor wow features

OutYah already ships as a curated Jamaica outing platform: parish/category discovery, map explore, venue detail, favorites, outing planner, shareable plans, events, reviews, and admin moderation.

These four features are the next layer. They turn a strong directory into a product investors can demo in under a minute: **plan the night, see what’s on now, fill the group chat, and know the cost in JMD.**

**Demo order:** AI itinerary → Jamaica Pulse → group rooms → cost estimator.

**Stay out of this round:** native apps, video Reels, in-app payments. Those dilute the story.

---

## 1. “Build my outing” — AI itinerary

**The wow moment.** One prompt, one plan, using OutYah’s real catalog.

### Pitch

Google Maps cannot assemble a Jamaica night. ChatGPT cannot do it with OutYah’s curated venues, photos, and live events. This is the 20-second investor clip.

### Example prompt

> Saturday in Montego Bay, 4 friends, J$8,000 each, beach then jerk then nightlife.

### What it returns

A **timed, ordered outing**:

| Time  | Stop                         | Why it fits                          |
| ----- | ---------------------------- | ------------------------------------ |
| 2:00  | Beach / attraction           | Daylight, parish match               |
| 5:30  | Sunset viewpoint or bar      | Transition into evening              |
| 8:00  | Jerk / restaurant            | Budget-aware dinner                  |
| 10:30 | Nightlife venue              | Closes the night                     |

Each stop is a real OutYah place (id, photo, parish, category). Primary actions:

- **Add to my plan** — writes the ordered list into the planner
- **Get Directions** — existing multi-stop Google Maps URL
- **Share** — existing share-link flow (and later group rooms)

### Inputs

- Parish or town (e.g. Kingston, Montego Bay, Ocho Rios, Negril)
- Occasion / vibe (solo, date, friends, tourist day trip)
- Time window (afternoon, tonight, full Saturday)
- Budget per person (JMD)
- Must-haves (beach, food, nightlife, attraction) and avoids (optional)

### Rules

- Only **approved, live catalog** places — never invent venues
- Prefer **open / upcoming** when hours and events exist
- Respect parish unless the user asks island-wide
- Keep 3–6 stops; enough for a night, not a 12-hour grind
- Surface a short “why this stop” line so the plan feels curated, not random

### Where it lives

- Landing CTA: **Plan this weekend**
- Full-screen flow on `/plan` (or `/plan/build`)
- Optional shortcut on Explore when a parish is already selected

### Why investors care

It is the product, not a feature: OutYah becomes the **outing brain** for Jamaica, with a defensible data set underneath.

---

## 2. Jamaica Pulse — “what’s actually on tonight” ✅ SHIPPED

A live strip that makes the catalog feel **alive**, not like a brochure.

> **Status:** built and live on Landing, Explore, and Events.
> Logic in `src/lib/pulse.js` (pure, verified by `bun run verify:pulse` — 68 assertions),
> weather in `src/lib/weather.js`, UI in `src/components/JamaicaPulse.jsx`.

### Pitch

*This is Jamaica tonight* — events starting soon, places open now, parish weather as a go/no-go for outdoor plans.

### What it shows

- **On now** — events whose `starts_at` / `ends_at` cover the current time, with time remaining
- **Next 2 hrs** — next-up events in the selected parish or island-wide
- **Open now** — computed from each venue’s `hours` against Jamaica local time, including
  windows that run past midnight; venues closing within 90 minutes are flagged and sorted first.
  Venues with no `hours` fall back to the stored `open_now` flag
- **Later today** — the rest of today’s calendar, using the Jamaica-local date rather than UTC
- **Weekend vs weekday** — a one-line “vibe” read (e.g. *Peak weekend energy*, *Steady weeknight*)
  derived from Fri–Sun plus how much is actually on
- **Weather hint** — live conditions per parish via Open-Meteo (no API key), turned into a verdict:
  rain → “good call for indoor spots”, clear → “beach and outdoor weather”

### Surfaces

- Landing — strip lifted over the bottom of the hero
- Explore (`/explore`) — above the feed, below the search panel
- Events — “Tonight” chip alongside This weekend / Recurring / Past, plus a live count in the header

### Behaviour

- Parish-aware: Pulse follows the Explore parish filter
- Empty parish → island-wide Pulse with an explicit note, never a blank card
- Tapping a pulse item opens the place or event detail
- “Add to plan” directly from Pulse place cards
- Clock ticks every 60s and resyncs on tab focus, so “starts in 40 min” stays honest
- Tabs are derived, not stored — an emptied bucket can never stay selected

### Time correctness

Jamaica is UTC−5 with no DST. All comparisons run through `jamaicaClock()` so results are
identical for a visitor browsing from another timezone. Covered cases include overnight
closing times (11:00 AM → 2:00 AM), venues closed today whose window from last night is
still running, and midnight normalization.

### Why investors care

Directories go stale. Pulse is the proof that OutYah is **operational**, not a seeded screenshot. It also sets up venue partnerships (“featured tonight”).

---

## 3. Group outing rooms — network-effect story

Shareable plans already exist (`/plan/share/:id`). Group rooms turn a link into a **session friends actually use**.

> **Partly shipped:** RSVPs and a live **event chat room** are built — see §3a below. The
> plan-level room (voting, shared route) is still open.

### 3a. Event RSVP + live chat ✅ SHIPPED

Every event page has a chat that unlocks when you RSVP.

> Schema in `supabase/migrations/006_event_chat.sql`, data layer in `src/lib/eventChat.js`,
> hooks in `src/hooks/useEventChat.js`, UI in `src/components/EventChat.jsx`.

- **RSVP** — `going` / `interested`, one row per user per event, tap again to withdraw
- **Real attendee counts** — the event page now counts actual `event_rsvps` rows instead of
  the seeded `events.going` column, keeping the "no invented counts" rule intact
- **Chat unlocks on RSVP** — a signed-out visitor sees a sign-in prompt, a signed-in
  non-attendee sees a locked panel, an attendee sees the room
- **Supabase Realtime** — messages arrive without a refresh via Postgres Changes on
  `event_messages`, filtered to that event
- **Author-retractable** — you can delete your own message; admins can moderate; there is
  **no** update policy, so history cannot be rewritten

**The gate is enforced in the database, not the UI.** Reading `event_messages` requires
`public.has_rsvp(event_id)`, so a non-attendee cannot pull the room with the anon key even
though the panel is hidden. Display names are stamped by a trigger from `profiles` /
`auth.users`, so a hand-rolled insert cannot impersonate another member. Verified against a
scratch Postgres: an attendee sees the room, a non-attendee sees zero rows, cross-user
inserts and deletes are rejected, and an `UPDATE` is refused even when the grant allows it.

**Why it matters commercially:** the chat is the retention hook, and it only exists for people
who declared intent to attend — which is exactly the audience a venue would pay to reach.

### Pitch

Create “Saturday Ochi,” drop it in WhatsApp, friends join, vote on stops, RSVP. One Directions route for the whole crew.

### Core loop

1. Host creates or shares a plan → **group room**
2. Invite via **WhatsApp-first link** (preview image + deep link)
3. Friends **join** (guest can view; sign-in to vote / RSVP)
4. **Vote** on stops (keep / drop / add from catalog)
5. See **who’s in**
6. Host locks the order → **Get Directions** for the group

### Features

| Piece            | Detail                                                                 |
| ---------------- | ---------------------------------------------------------------------- |
| Room             | Named outing, date, parish, host                                       |
| Members          | Join via link; optional display name for guests                        |
| Voting           | Per-stop yes/no or ranked choice; host can override                    |
| RSVP             | Going / maybe / can’t                                                 |
| Live plan        | Same ordered stops as the planner; changes visible to everyone         |
| WhatsApp share   | Open Graph image of the route + “Send to the group chat”              |

### Jamaica-specific

Jamaica lives in **WhatsApp**, not email. Share cards should look good in chat (venue photos, stop count, date), not like a generic web URL.

### Why investors care

Retention and virality. A solo planner is a tool; a group room is a **habit**. It is also the cleanest story for later venue spend: featured slots inside rooms that are already deciding where to go.

---

## 4. JMD outing cost — practical closer ✅ SHIPPED

Every plan shows an estimated **total in Jamaican dollars**.

> **Status:** built on Planner, shared plans, and event detail.
> Model in `src/lib/costs.js` (pure, verified by `bun run verify:costs` — 84 assertions),
> UI in `src/components/CostEstimate.jsx`, party size persisted in `AppContext`.

### Pitch

Tourists and students both ask “how much is this night?” OutYah answers in JMD, per person and for the group.

### What it shows

- **Per stop** — typical spend band, widened by category volatility: a bar swings far more
  than a cinema, so the band reflects that instead of applying one flat percentage
- **Per person** — sum of stop bands, with a midpoint headline figure
- **For the group** — per person × party size, adjustable inline and remembered across visits
- **Budget check** — against a target when one is passed in; within 10% either way reads
  as “on budget” rather than a miss

### Example

> This outing is about **J$29,100** for 3 people (~J$9,700 each).
> *(café → dinner → rooftop bar, from the live catalog)*

### Data

`price_range` already stores **typical spend per person in JMD** (J$1,000–50,000, with legacy
tiers 1–4 mapping to J$1,000–4,000), so estimates lean on real per-venue data rather than a
`$$$` guess. Precedence:

1. **`venue`** — the venue’s own `price_range` figure
2. **`event`** — parsed from a published event price: `Free`, `Free before 7 PM`,
   `J$2,000 entry`, `US$25` (converted), and ranges like `J$2,000–3,000`
3. **`category`** — a default, used *only* when a venue carries no figure

Every stop reports which source it used. Category fallbacks are marked with `*` in the
breakdown and counted in the footnote, so a soft number never passes as a hard one.

`normalizePriceRange()` clamps missing values up to `PRICE_MIN`, which would disguise “no data”
as “J$1,000 venue” — the model checks the raw field instead, so absent data correctly falls
through to the category default.

Labelled **estimate** everywhere, with “pay at the venue”. No payments this round — **call to
book** stays on venue detail.

### Surfaces

- **Planner** — sidebar card above the route map
- **Shared plan** — “What this night costs”, so a recipient sees the damage before importing
- **Event detail** — group total beside entry price, plus a warning when free entry is
  time-limited (`Free before 7 PM` implies a later cover)
- **AI itinerary / group rooms** — not yet built; `estimatePlan()` already accepts a `budget`
  so the budget check drops straight in

### Not built (deliberately)

- **Slots as a price source.** Movie showtimes and gaming stations carry `time`/`label` but no
  prices, so there is nothing to read; those fall back to `price_range`.
- **Live FX.** `USD_TO_JMD` is a constant, used only to fold the occasional USD-priced event
  into a JMD estimate. Worth a live rate before any figure becomes a real transaction.

### Why investors care

Cost makes the plan **real**. It also opens a monetization line without building payments yet: featured venues, later a booking take-rate once estimates are trusted.

---

## Build sequence

| Order | Feature              | Investor job                         | Effort (rough)      |
| ----- | -------------------- | ------------------------------------ | ------------------- |
| 1     | AI itinerary         | 20-second wow demo                   | 1–2 focused sprints |
| 2     | ~~Jamaica Pulse~~ ✅ | Product looks live                   | **Shipped**         |
| 3     | Group rooms + WA     | Network effects + Jamaica PMF        | RSVP + chat shipped; rooms open |
| 4     | ~~JMD cost estimator~~ ✅ | Practical closer on every plan  | **Shipped**         |

WhatsApp share previews should ship **with** group rooms, not as a fifth product.

---

## What we already have (do not rebuild)

These are the floor the wow layer stands on:

- Curated island catalog (places, photos, parish, category)
- Explore + map + landing
- Outing planner (order, reorder, Get Directions)
- Shareable plan links
- Events with `starts_at` / `ends_at`
- Venue hours, phone, booking contact
- Reviews (Google + OutYah)
- Jamaica Pulse live strip (see §2)
- Shelf-row Explore layout with live open/closed badges
- JMD outing cost estimates with party size (see §4)
- Event RSVPs + RSVP-gated realtime chat (see §3a)
- Admin CRUD + photo approval queue

---

## Monetization (say this after the demo)

1. **Featured tonight** — Pulse and itinerary can boost partner venues  
2. **Group rooms** — high-intent audiences for local brands  
3. **Later:** booking or ticket take-rate once cost estimates and venue contacts are trusted  

Do not lead with ads. Lead with “we plan the night; venues want to be in that plan.”
