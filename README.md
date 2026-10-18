# SaafSpot — Spot it. Document it. Track what changes.

A community civic-tech web app for documenting recurring garbage hotspots in one
Lahore neighborhood (Gulberg/Liberty area). Built for **Neighborhood Hacks 2026**.

SaafSpot helps residents log observations of waste issues, group nearby
same-category reports into community cases, corroborate them, track whether
issues come back after a cleanup, and prepare a printable action brief for
manual handoff to official sanitation channels.

> **SaafSpot is an independent community tool, NOT a government service.** It is
> not affiliated with, endorsed by, or connected to any government body. It does
> not submit complaints on your behalf. Statuses (Reported, Community
> corroborated, Brief prepared, Cleanup observed, Recurring) are
> community-evidence states, not official service statuses.

## Stack

- React + TypeScript + Vite
- Tailwind CSS
- Supabase (Postgres, RLS, Storage)
- Leaflet + OpenStreetMap (no API key required)

## Features

- **Home dashboard** — live counts derived from stored records, filters
  (category, status, active/demo/real), list and map views.
- **New report** — category, public location label (never a home address),
  approximate coordinates with a map picker or "use my location", observed
  date/time, description, optional photo (JPG/PNG, max 5 MB). Field-level
  validation + a review preview before submission.
- **Duplicate suggestions** — when a new report's category matches and the
  location is within ~100 m OR the location label strongly matches an existing
  hotspot, the user is shown the candidate and asked whether to add their
  observation to it or create a new separate hotspot. Reports are **never**
  automatically merged and always stay distinct.
- **Hotspot detail** — observations list, evidence gallery, community
  confirmation count (one per device identity), first/latest observation,
  recurrence history after a cleanup, and an append-only auditable status
  timeline (history is never deleted).
- **Action brief** — a printable, downloadable, copyable summary of the stored
  case: title, category, public location, actual observation dates, evidence
  references, number of independent confirmations, full timeline, recommended
  next action, and official handoff links. The brief is generated from real
  stored data, not hardcoded.
- **Official handoff** — obvious "Get official help" link to
  https://suthra.punjab.gov.pk/complaint.php and a "Call 1139" action. Users can
  record their official complaint reference (stored locally in the browser). The
  app never claims to submit, partner, or receive acknowledgement.
- **English / Urdu** language switching with correct RTL layout for Urdu.
- **Demo mode** — when Supabase is not configured, the app runs on labeled
  fictional demo data stored in memory. A clear badge indicates demo vs live
  mode, and demo hotspots are visibly labeled "Demo".

## Privacy

SaafSpot never asks for a home address, email, or phone number. It stores only
an opaque random per-device identity (in `localStorage`) used to prevent
duplicate confirmations and tag a reporter's own observations. Photo uploads
should not include identifiable faces. Uploaded JPEG/PNG photos are re-encoded
through a browser canvas before upload, which strips EXIF metadata (including
any embedded GPS coordinates) so that only the image pixels reach public storage.

## Database setup

The Supabase schema and RLS policies are in
`supabase/migrations/`. They were applied via the Supabase migration tool and
create four tables:

- `hotspots` — community cases grouping nearby same-category reports
- `reports` — individual observations (always distinct even when grouped)
- `confirmations` — one-per-identity corroboration (`UNIQUE(hotspot_id, identity)`)
- `activity_events` — append-only auditable timeline per hotspot

RLS is enabled on every table. Because this is a no-auth, single-tenant public
evidence app, SELECT and INSERT policies use `TO anon, authenticated` with
`USING (true)` — the data is intentionally shared. `reports`, `confirmations`,
and `activity_events` have NO UPDATE or DELETE policy, so RLS denies those
operations: they are append-only for normal clients. `hotspots` has a
column-level UPDATE grant on ONLY the `status` column, constrained by a
`WITH CHECK` to the five valid community-evidence states, so clients can update
the community status (via the app's recompute/brief flows) but cannot falsify
`is_demo`, move the public pin, edit the location label, or delete a hotspot.
No email, phone, home address, or service-role credentials are stored or
exposed. A public `reports` storage bucket holds evidence photos.

To apply the schema to a fresh Supabase project, run the two SQL files in
`supabase/migrations/` in order (via the Supabase SQL editor or `supabase db
push`).

## Local development

```bash
npm install
cp .env.example .env   # then fill in your Supabase URL + anon key
npm run dev
```

If `.env` is missing or the Supabase vars are absent, the app automatically
falls back to **local demo mode** with a visible badge. In demo mode, new
reports are held in memory only and are lost on refresh — nothing is claimed to
be shared or submitted officially.

## Build & typecheck

```bash
npm run build       # vite build
npm run typecheck   # tsc --noEmit
```

## AI coding assistance & third-party tools

- Significant portions of this codebase were generated with AI coding
  assistance (Bolt). All generated code was reviewed and adapted for this
  project.
- Third-party tools and services: React, TypeScript, Vite, Tailwind CSS,
  Supabase (Postgres + Storage + RLS), Leaflet, OpenStreetMap, lucide-react,
  Inter & Noto Nastaliq Urdu (Google Fonts).
- Map data © OpenStreetMap contributors.

SaafSpot does not claim any official partnership, government endorsement, or
automated integration with any sanitation authority. The official handoff is
manual: the app links to the public Suthra Punjab complaint page and the 1139
helpline and lets users record the reference they receive.
