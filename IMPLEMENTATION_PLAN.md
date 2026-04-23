# Refrigest — Implementation Plan

> Web-first PWA for a solo refrigeration technician. Native port later. Spec in Spanish, plan in English. Caveman compressed.

## Context

New greenfield app for an **individual technician** (no multi-tenant). Automates:

- Service record capture (photos, checklist, voice notes, parts used)
- Client / branch / equipment hierarchy — **client = WhatsApp E.164 number (no signup)**
- PDF generation: Technical Assistance report OR Warranty Certificate
- One-tap WhatsApp send via `wa.me` deep link
- Tech inventory + per-equipment installed-parts inventory
- Maintenance reminders (+6mo since last service) + warranty expiry alerts
- Stats dashboard

Non-functional: **offline-first**. Techs work in basements / cold rooms / rural sites. No signal = no excuse. Sync when reconnected.

Ship web-first, architect for a later React Native port (keep domain logic framework-agnostic in `src/core/`).

## Confirmed Decisions

- **Target**: Web PWA first → Expo/RN port later
- **Backend**: Supabase
- **Tenancy**: Single user / single account (`tech_id = auth.uid()`)
- **Voice STT**: Hybrid — Web Speech API on device + Whisper API via Supabase Edge Function when online

## Stack

- **Next.js 15** (App Router) + TypeScript strict
- **pnpm** (per global rule)
- **Tailwind CSS 3.4** (ui-skills canonical)
- **shadcn/ui** (Radix primitives — ui-skills canonical)
- **motion/react** (was framer-motion) — ui-skills canonical
- **tw-animate-css** for entrance/micro animations
- **`cn`** util (`clsx` + `tailwind-merge`) per ui-skills
- **TanStack Query** (remote cache) + **Zustand** (client state)
- **Dexie.js** (IndexedDB typed wrapper) — offline local store
- **Supabase** (Auth, Postgres, Storage, Realtime, Edge Functions)
- **Drizzle ORM** (Supabase migrations + typed server queries)
- **next-pwa** (Workbox under the hood) — service worker + app shell caching
- **@react-pdf/renderer** — client-side PDF generation (works offline)
- **react-hook-form** + **zod**
- **date-fns**, **ulid** (warranty numbers)
- **Web APIs**: `navigator.geolocation`, `getUserMedia`, `MediaRecorder`, `navigator.serviceWorker`, `Web Speech API`, `Background Sync API`, `Web Push`, File System Access (export CSV)

ui-skills fits directly on this stack. No adaptations required.

## Architecture

```
src/
├─ app/              # Next.js App Router (UI pages, layouts, route handlers)
├─ core/             # Pure domain — zod schemas, business logic, invariants, pure fns
├─ lib/              # Infra: supabase client, dexie client, pdf renderer, whatsapp, voice, i18n, sync
├─ components/       # React components (shadcn in ui/, feature components in features/)
├─ hooks/            # Shared hooks (useOnline, useGeo, useVoice)
└─ theme/            # Tailwind tokens extension
```

**Layering rule**: `core/` imports nothing from Next.js, React, or Dexie. `lib/` can import `core/`. `app/` + `components/` can import anything. This keeps `core/` portable to an Expo app later.

### Data Model (Supabase Postgres, Dexie mirror)

Every row: `id uuid`, `tech_id uuid references auth.users`, `created_at`, `updated_at`, `deleted_at`, `sync_version int`. RLS: `tech_id = auth.uid()` on every table.

- `clients(whatsapp_e164 pk, tech_id, alias, legal_name)` — WA number = PK
- `branches(id, client_wa, tech_id, name, lat, lng, address)`
- `equipment(id, branch_id, tech_id, brand, model, refrigerant, placa_photo_url, tags text[])` — tags: `critical | preventive_pending | active_warranty`
- `services(id, equipment_id, tech_id, started_at, ended_at, checklist_jsonb, notes_text, voice_transcript, finalized bool)`
- `service_media(id, service_id, kind enum(photo_before,photo_after,video,audio), url, thumb_url)`
- `parts(id, tech_id, name, sku)`
- `tech_inventory(tech_id, part_id, qty)`
- `equipment_inventory(equipment_id, part_id, qty)` — parts installed in equipment
- `service_parts(service_id, part_id, qty)` — write triggers decrement `tech_inventory` + increment `equipment_inventory`
- `reports(id, service_id, tech_id, kind enum(asistencia,garantia), pdf_url, unique_number)`
- `warranties(id, report_id, tech_id, duration_days check in (30,90,180), coverage enum(labor,full), starts_at, expires_at)`
- `claims(id, warranty_id, tech_id, date, notes)`
- `reminders(id, equipment_id, tech_id, due_at, kind enum(preventive_6mo,warranty_expiry), delivered_at)`

### Offline Storage

- **Dexie** table layout mirrors Postgres schema (one IndexedDB table per Supabase table)
- Media blobs: dedicated `media_blobs` Dexie store keyed by temp UUID; upload to Supabase Storage on sync; replace local blob ref with remote URL
- `sync_outbox(id, table, op enum(insert,update,delete), row_id, payload_json, attempts, last_error)` — every mutation writes here

### Sync Strategy

- **Push**: outbox flushed on: (a) `online` event, (b) visibility change back to visible, (c) Background Sync API tag `flush-outbox` if supported. Flush is sequential, idempotent via `(table, row_id, sync_version)`. Retry with exponential backoff; dead-letter after 10 attempts with UI toast.
- **Pull**: cursor sync on app boot + when coming online — `SELECT * WHERE updated_at > cursor ORDER BY updated_at LIMIT 500`. Supabase Realtime subscription while tab visible + online.
- **Conflict**: LWW per row via `updated_at` comparison (single-user mostly avoids this, but covers multi-device case). Services become immutable after `finalized = true`.

### PDF Generation

- `@react-pdf/renderer` — React components → PDF Blob in-browser, works offline
- Two templates: `AsistenciaPdf.tsx`, `GarantiaPdf.tsx` in `src/components/pdf/`
- PDF saved locally via `FileSaver.js` or Blob URL, uploaded to Supabase Storage `reports/` bucket on sync (public signed URL 7 days)
- Warranty number: `RFG-{YYMMDD}-{ULID_SUFFIX8}` with Postgres unique index safety net

### WhatsApp Send

- Deep link: `https://wa.me/<e164>?text=<urlencoded-greeting+pdfUrl>`
- For offline case: queue send intent; auto-open `wa.me` after PDF uploads (when online)
- Web Share API (`navigator.share`) fallback for mobile browsers that support attaching PDF

### Voice Transcription

- **Record**: `MediaRecorder` API, Blob stored in Dexie `media_blobs`
- **Transcribe path 1 (online, device)**: Web Speech API (`SpeechRecognition`) — real-time, free, Chrome/Edge only
- **Transcribe path 2 (online, server)**: upload audio to Supabase Edge Function → OpenAI Whisper API → return transcript. Used when Web Speech unavailable (Firefox/Safari) or audio quality needs better accuracy.
- **Transcribe path 3 (offline)**: persist audio, mark transcript pending, transcribe via Edge Function on sync
- Transcript editable in `Textarea`

### Reminders

- **Client-side scheduling**: compute due dates on service finalize / warranty save, write `reminders` row
- **Delivery**: Web Push via `next-pwa` + Supabase Edge Function cron (every hour) → push via `web-push` lib using user's Push subscription endpoint
- In-app: Today/Agenda tab shows all reminders where `due_at <= now() + 7 days`

### Auth

- Supabase Auth — email + password, or magic link
- Single user per install. No org.
- RLS policies: `tech_id = auth.uid()` on every row-level policy

## Screens / Navigation

Tab-like bottom nav on mobile viewport; sidebar on desktop. Responsive shell `app/(app)/layout.tsx`.

1. **Today / Agenda** (`/today`) — upcoming visits, pending reminders, quick-start service
2. **Clients** (`/clients`) — list + search → `/clients/[wa]` detail (branches) → `/clients/[wa]/branches/[id]` (equipment list) → `/clients/[wa]/branches/[id]/equipment/[eid]` (Hoja de Vida + history)
3. **Warranties** (`/warranties`) — active + expiring-soon filter
4. **Inventory / Profile** (`/inventory`) — parts stock, settings, CSV export, role (owner only for this MVP)

Key flow — **New Service Wizard** (`/service/new`):

pick client (or `+` new w/ WA#) → branch (or `+` new w/ GPS) → equipment (or `+` new w/ placa photo) → checklist + readings (pressures, amperage) → photos before/after → voice/text notes → parts used → finalize → `Reporte` | `Reporte + Garantía` → generate PDF → share via WA.

## UI / UX (ui-skills enforced)

- **Components**: shadcn only. `@/components/ui/*` for primitives. Never mix primitive systems.
- **Icons**: Lucide. Always `aria-label` on icon-only buttons.
- **Dialog types**: `AlertDialog` for destructive (delete client, finalize service, cancel draft with unsaved data).
- **Loading**: Skeleton components (never spinners in lists).
- **Empty states**: one clear primary CTA (e.g., "+ Add Client").
- **Errors**: inline next to action (toast only for async side effects like sync).
- **Typography**: `text-balance` on headings, `text-pretty` on paragraphs, `tabular-nums` for readings/prices/stats, `line-clamp` for notes.
- **Layout**: `h-dvh` for full-height; `safe-area-inset-*` for fixed bottom nav on iOS PWA.
- **Z-index**: fixed scale in `theme/z.ts` (`overlay`, `modal`, `popover`, `toast`).
- **Size utils**: `size-*` for square icons/avatars.
- **Color**: one accent per view. No gradients. No glow. Default Tailwind shadow scale.
- **Animation**: motion/react only on `transform` + `opacity`, ≤200ms, `ease-out` entrance. Respect `prefers-reduced-motion`. Pause off-screen loops. `tw-animate-css` for simple entrances.
- **Dark mode**: `next-themes` with system default.
- **Contrast**: WCAG AA minimum; tech gloves-friendly (min tap target 44px).

## Phases (est. ~3.5 weeks, 1 dev)

| Phase | Scope | Days |
| --- | --- | --- |
| 0 | Scaffold: `create-next-app` + Tailwind + shadcn init + Supabase schema + Drizzle + ESLint/Prettier + `next-pwa` + manifest + pnpm | 1 |
| 1 | Auth (email/password + magic link) + app shell (tabs/sidebar) + dark mode + safe areas | 1.5 |
| 2 | Clients / branches / equipment CRUD (Dexie-first, sync later) + GPS capture + placa photo upload | 3 |
| 3 | Service wizard — camera (`getUserMedia` or `<input capture>`), voice record + transcribe (hybrid), checklist component, parts picker, inventory decrement | 4 |
| 4 | PDF templates with `@react-pdf/renderer` + Storage upload + WA deep link + offline queue for WA send | 2 |
| 5 | Warranties + unique numbers + reminders (Web Push) + claims | 2 |
| 6 | Inventory screens + stats dashboard (recharts) + CSV export (File System Access API) | 3 |
| 7 | Sync outbox hardening (retry, dead-letter, conflict cases) + empty states + error boundary + Suspense | 2 |
| 8 | PWA polish (install prompt, offline fallback, icon set) + Lighthouse pass + Vercel deploy | 2 |

## Critical Files

```
refrigest/
├─ src/
│  ├─ app/
│  │  ├─ (auth)/login/page.tsx
│  │  ├─ (app)/layout.tsx                    # app shell + nav
│  │  ├─ (app)/today/page.tsx
│  │  ├─ (app)/clients/page.tsx
│  │  ├─ (app)/clients/[wa]/page.tsx
│  │  ├─ (app)/clients/[wa]/branches/[id]/page.tsx
│  │  ├─ (app)/clients/[wa]/branches/[id]/equipment/[eid]/page.tsx
│  │  ├─ (app)/warranties/page.tsx
│  │  ├─ (app)/inventory/page.tsx
│  │  ├─ (app)/service/new/page.tsx
│  │  ├─ (app)/service/[id]/finalize/page.tsx
│  │  ├─ api/transcribe/route.ts             # Whisper proxy
│  │  ├─ api/push/subscribe/route.ts
│  │  ├─ api/reminders/cron/route.ts         # hourly via Vercel Cron or Edge Fn
│  │  ├─ manifest.ts
│  │  └─ sw.ts                               # service worker (next-pwa)
│  ├─ core/
│  │  ├─ schemas/                            # zod: Client, Branch, Equipment, Service, Report, Warranty, Part, Reminder, Claim
│  │  ├─ business/                           # pure fns: warrantyNumber, reminderDueDate, inventoryDelta, checklistValidator
│  │  └─ types.ts
│  ├─ lib/
│  │  ├─ supabase/{client.ts, server.ts, admin.ts}
│  │  ├─ dexie/{db.ts, schema.ts, media.ts}
│  │  ├─ sync/{outbox.ts, pull.ts, push.ts, conflict.ts, status.ts}
│  │  ├─ pdf/{AsistenciaPdf.tsx, GarantiaPdf.tsx, shared.tsx}
│  │  ├─ whatsapp.ts                         # deep link builder
│  │  ├─ voice/{recorder.ts, webSpeech.ts, whisper.ts}
│  │  ├─ notifications/{push.ts, subscribe.ts}
│  │  ├─ i18n.ts                             # es default
│  │  ├─ utils/cn.ts
│  │  └─ permissions.ts                      # role gates (future-proof)
│  ├─ components/
│  │  ├─ ui/                                 # shadcn primitives
│  │  ├─ features/{clients,branches,equipment,services,parts,reports,warranties,claims}/
│  │  ├─ pdf/                                # @react-pdf components
│  │  └─ forms/                              # rhf + zod fields
│  ├─ hooks/{useOnline, useGeo, useVoice, useServiceDraft, useSync}.ts
│  └─ theme/{tokens.ts, z.ts}
├─ drizzle/
│  ├─ schema.ts
│  └─ migrations/
├─ supabase/
│  ├─ migrations/                            # mirror drizzle
│  └─ functions/{transcribe, reminders, push-dispatch}
├─ public/
│  ├─ icons/{192.png, 512.png, maskable.png}
│  └─ manifest.webmanifest                   # or via app/manifest.ts
├─ drizzle.config.ts
├─ next.config.mjs
├─ tailwind.config.ts
├─ components.json                           # shadcn
├─ tsconfig.json
└─ package.json
```

## Risks / Gotchas

- **Web Speech API browser support** — Chrome/Edge only. Firefox/Safari fall back to Whisper. Detect via `'SpeechRecognition' in window` and show fallback path.
- **iOS PWA limitations** — no Web Push until iOS 16.4+ (installed PWA only), no Background Sync. Fallback: check for reminders on app open + periodic visibility poll. Document for user.
- **Background Sync API** — Chrome only. Progressive enhancement. Fallback: flush on `online` event + visibilitychange.
- **IndexedDB storage quota** — ~50MB–60% of free disk. Monitor via `navigator.storage.estimate()`. Compress photos (`canvas` + `toBlob` quality 0.7, max 1600px) before Dexie insert.
- **PDF photo bloat** — same compression rule; `@react-pdf/renderer` embeds Base64 so every extra MB costs.
- **WA deep link can't attach PDFs** — must host URL in Supabase Storage with signed public link.
- **Spanish voice accuracy** — regional accents PE/CO/AR/MX. Whisper handles well; Web Speech depends on locale (`es-PE`, `es-CO`, etc.).
- **Offline auth** — Supabase session in localStorage; access token expires. Refresh token works while offline within expiry window. After that: read-only mode until reconnect.
- **Warranty # collision** — ULID-suffixed format + Postgres `UNIQUE` index → retry on conflict.
- **Sync races on media** — upload before row insert, or insert row with `pending_upload=true`, update with final URL after upload. Pick the latter — simpler.
- **CSV export** — File System Access API (Chrome) + Blob download fallback (other browsers).
- **Future RN port risk** — discipline on `core/` boundary. Add ESLint rule `no-restricted-imports` to forbid `react`/`next`/`dexie` imports inside `src/core/`.

## Verification

1. **Install**: `pnpm install`
2. **Dev**: `pnpm dev` → `http://localhost:3000`
3. **DB migrate**: `pnpm drizzle-kit push` (dev) / `pnpm drizzle-kit generate` + Supabase SQL editor (prod)
4. **Offline path**: DevTools → Network → Offline → create client + branch + equipment + service → back online → confirm rows in Supabase studio + empty `sync_outbox`
5. **PDF path**: finalize service → preview PDF in-browser → share via WA deep link → verify signed URL opens
6. **Dexie inspection**: DevTools → Application → IndexedDB
7. **Service worker**: DevTools → Application → Service Workers → confirm active + precache populated
8. **Lighthouse**: PWA ≥ 90, Performance ≥ 90, Accessibility ≥ 95
9. **Reminders**: finalize service → inspect `reminders` row with `due_at` = now + 6mo
10. **Whisper fallback**: disable `SpeechRecognition` in dev → record audio → confirm Edge Function transcribes
11. **CSV export**: Inventory → Export → open in Excel → schema correct
12. **Deploy**: Vercel preview → install to home screen on Android/iOS → validate tab nav + offline
13. **Lint boundary**: `pnpm lint` fails on any `react`/`dexie` import inside `src/core/`

## ui-skills Quick-Reference Cheatsheet

- `cn()` for all class concat
- `size-*` for squares (avatar, icon button)
- `h-dvh` not `h-screen`
- `text-balance` headings, `text-pretty` body, `tabular-nums` numbers
- `accessibilityLabel` → use `aria-label`; icon-only buttons must have one
- `AlertDialog` on destructive ops
- Skeleton on list load
- No arbitrary `z-*` values; use scale tokens
- motion/react only on `transform`/`opacity`, ≤200ms, `ease-out`
- Respect `prefers-reduced-motion`
- One accent color per view
- No gradients, no glow, default shadow scale

## Future Native Port

When ready to port to React Native:

1. Move `src/core/` → `packages/core/` in a pnpm workspace
2. `apps/web/` stays, `apps/mobile/` scaffolds with Expo SDK 52
3. Swap `lib/dexie` → `lib/sqlite` (WatermelonDB or expo-sqlite + Drizzle), same interface
4. Swap `components/ui` shadcn → `@rn-primitives/*`
5. Swap `motion/react` → Reanimated 3
6. `lib/supabase`, `lib/whatsapp`, `lib/pdf` (port to `expo-print`), `lib/voice` (port to `expo-speech-recognition`) rewritten per platform; contracts unchanged because `core/` types are shared

The web app ships first, and the `core/` boundary keeps the port from being a rewrite.