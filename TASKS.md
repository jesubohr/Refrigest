# Refrigest — Task Tracker

> Status legend: `[ ]` pending · `[x]` done · `[~]` in-progress · `[!]` blocked

---

## Phase 0 — Scaffold

### 0.1 Project Init
- [x] `pnpm create next-app@latest refrigest` (App Router, TS strict, Tailwind, src/)
- [x] Configure `tsconfig.json`: strict, paths alias `@/*` → `./src/*`
- [x] Install & configure Prettier (`.prettierrc`)
- [x] Install & configure ESLint (`eslint.config.mjs`)
- [x] Add ESLint `no-restricted-imports` rule for `src/core/` (forbid react, next, dexie)
- [ ] Init git repo + first commit

### 0.2 Tailwind + shadcn
- [x] Tailwind v4 installed (CSS-first config via `@import "tailwindcss"`)
- [x] `shadcn/ui` CLI init (Nova preset, Base UI primitives — no `asChild`, uses `render` prop)
- [x] Initial shadcn components installed (Button, Card, Dialog, AlertDialog, Badge, Input, etc.)

### 0.3 Theme & Utilities
- [x] `src/app/globals.css` — `.safe-bottom`, `.safe-top`, `.touch-target`, `.tabular` utilities
- [x] `src/lib/utils.ts` — `cn()` with clsx + tailwind-merge
- [x] `motion/react` installed
- [x] `date-fns`, `ulid`, `lucide-react` installed

### 0.4 Supabase Schema + Drizzle
- [x] `drizzle-orm`, `drizzle-kit`, `postgres` driver installed
- [x] `drizzle.config.ts` configured
- [x] `drizzle/schema.ts` — all tables + enums + relations + indexes
- [ ] `drizzle/migrations/` — generate first migration (`pnpm db:generate`)
- [ ] Apply migration to Supabase dev project
- [ ] Add RLS policies for every table (`tech_id = auth.uid()`)

### 0.5 Supabase Clients
- [x] `src/lib/supabase/client.ts` (browser client)
- [x] `src/lib/supabase/server.ts` (server component client with cookies)
- [x] `src/lib/supabase/admin.ts` (service role — server only, throws if called in browser)

### 0.6 Dexie Setup
- [x] `dexie`, `dexie-react-hooks` installed
- [x] `src/lib/dexie/schema.ts` — mirror Supabase tables + `sync_outbox` + `media_blobs`
- [x] `src/lib/dexie/db.ts` — `RefrigestDB` extends Dexie with all tables
- [x] `src/lib/dexie/media.ts` — canvas compression + blob helpers

### 0.7 PWA + next-pwa
- [x] `src/app/manifest.ts` — web app manifest
- [ ] Add public icons: `public/icons/192.png`, `512.png`, `maskable.png`
- [ ] Install & configure `@serwist/next` (deferred to Phase 8)
- [ ] Offline fallback page

### 0.8 Core Schemas (Zod)
- [x] `src/core/types.ts` — ULID, UUID, WaE164, SyncOp, MediaKind, tags, etc.
- [x] `src/core/schemas/client.ts`
- [x] `src/core/schemas/branch.ts`
- [x] `src/core/schemas/equipment.ts`
- [x] `src/core/schemas/service.ts`
- [x] `src/core/schemas/report.ts`
- [x] `src/core/schemas/warranty.ts`
- [x] `src/core/schemas/part.ts`
- [x] `src/core/schemas/reminder.ts`
- [x] `src/core/schemas/claim.ts`

### 0.9 Core Business Logic
- [x] `src/core/business/warrantyNumber.ts` — `RFG-YYMMDD-ULID8` generator
- [x] `src/core/business/reminderDueDate.ts` — +6mo preventive, -7 days warranty expiry
- [x] `src/core/business/inventoryDelta.ts` — decrement/increment + insufficient check
- [ ] `src/core/business/checklistValidator.ts` — validate checklist completeness

---

## Phase 1 — Auth + App Shell

### 1.1 Auth Pages
- [x] `src/app/(auth)/login/page.tsx` — email/password + magic link tabs
- [x] `src/app/(auth)/layout.tsx` — centered card layout
- [x] `react-hook-form`, `zod`, `@hookform/resolvers` installed
- [x] Supabase Auth wired (signInWithPassword, signInWithOtp)
- [x] `src/middleware.ts` — protects all routes, redirects to `/login` if no session

### 1.2 App Shell
- [x] `src/app/(app)/layout.tsx` — shell with responsive nav
- [x] `src/components/features/shell/AppShell.tsx` — bottom tab nav (mobile) + sidebar (desktop)
- [x] `safe-bottom` padding for iOS PWA fixed nav
- [x] `h-dvh` root layout

### 1.3 Dark Mode
- [x] `next-themes` installed
- [x] `ThemeProvider`, `Toaster` (sonner) wired in root layout

### 1.4 Shared Hooks
- [x] `src/hooks/useSync.ts` — online/offline sync trigger
- [ ] `src/hooks/useOnline.ts` — standalone `navigator.onLine` wrapper
- [ ] `src/hooks/useGeo.ts` — `navigator.geolocation` wrapper
- [ ] `src/lib/i18n.ts` — Spanish locale strings (low priority, inline strings used)

---

## Phase 2 — Clients / Branches / Equipment CRUD

### 2.1 Clients
- [x] `src/app/(app)/clients/page.tsx` — list + search
- [x] `src/app/(app)/clients/[wa]/page.tsx` — detail (branches list)
- [x] `src/components/features/clients/ClientList.tsx`
- [x] `src/components/features/clients/ClientCard.tsx`
- [x] `src/components/features/clients/ClientDetail.tsx`
- [x] `src/components/features/clients/NewClientDialog.tsx`
- [x] Dexie-first CRUD with soft delete (`deleted_at`)

### 2.2 Branches
- [x] `src/app/(app)/clients/[wa]/branches/[id]/page.tsx` — branch detail
- [x] `src/components/features/branches/BranchCard.tsx`
- [x] `src/components/features/branches/BranchDetail.tsx`
- [x] `src/components/features/branches/NewBranchDialog.tsx`
- [x] Dexie-first CRUD

### 2.3 Equipment
- [x] Equipment detail page
- [x] `src/components/features/equipment/EquipmentCard.tsx`
- [x] `src/components/features/equipment/EquipmentForm.tsx` — brand, model, refrigerant, placa photo, tags
- [x] `src/components/features/equipment/EquipmentDetail.tsx` — hoja de vida + service history
- [x] `src/components/features/equipment/NewEquipmentDialog.tsx`
- [x] Placa photo capture (`<input capture="environment">` + preview)
- [x] Tags: `critical`, `preventive_pending`, `active_warranty` — Badge display
- [x] Dexie-first CRUD
- [ ] Upload placa photo to Supabase Storage (queued in `media_blobs` offline — upload not wired)

---

## Phase 3 — Service Wizard

### 3.1 Wizard Shell
- [x] `src/app/(app)/service/new/page.tsx` — multi-step wizard shell
- [x] `src/hooks/useServiceDraft.ts` — Zustand persisted store for wizard state
- [x] Step 1: ClientStep (WA input → find or create)
- [x] Step 2: BranchStep (list from client + create new)
- [x] Step 3: EquipmentStep (list from branch + create new)

### 3.2 Checklist + Readings
- [x] `src/components/features/services/wizard/ChecklistStep.tsx`
- [x] Checklist: pressures (high/low side), electrical (amperage/voltage), temperatures, visual inspection
- [x] `tabular` class on numeric readings

### 3.3 Media Capture
- [x] `src/components/features/services/wizard/PhotoStep.tsx` (or equivalent)
- [x] Canvas compress + quality 0.7, max 1600px before Dexie insert (`src/lib/dexie/media.ts`)

### 3.4 Voice + Text Notes
- [x] `src/lib/voice/recorder.ts` — MediaRecorder, pause/resume/stop → Blob
- [x] `src/lib/voice/webSpeech.ts` — SpeechRecognition real-time transcript (Chrome/Edge)
- [x] `src/lib/voice/whisper.ts` — upload blob → `/api/transcribe` → transcript
- [x] `src/hooks/useVoice.ts` — hybrid: webSpeech first, Whisper fallback
- [x] `src/components/features/services/wizard/VoiceNoteStep.tsx`

### 3.5 Parts Picker
- [x] `src/components/features/services/wizard/PartsStep.tsx`
- [x] Search parts from Dexie, add/remove with quantity
- [x] Show current `tech_inventory` stock
- [ ] Validate: prevent using more than in stock (show warning, not hard block)

### 3.6 Finalize Service
- [x] `src/app/(app)/service/[id]/finalize/page.tsx`
- [x] `src/components/features/services/FinalizeService.tsx` — summary + AlertDialog confirmation
- [x] Set `finalized = true` in Dexie
- [x] Inventory delta (`tech_inventory` decrement + `equipment_inventory` increment)
- [x] "Reporte de Asistencia" | "Reporte + Garantía (90 días)" options

### 3.7 Whisper Edge Function
- [x] `src/app/api/transcribe/route.ts` — proxies audio → OpenAI Whisper
- [ ] `supabase/functions/transcribe/index.ts` — Supabase Edge Function alternative (optional)

---

## Phase 4 — PDF + WhatsApp + Offline Queue

### 4.1 PDF Templates
- [x] `@react-pdf/renderer` v4 installed
- [x] `src/lib/pdf/AsistenciaPdf.tsx` — Technical Assistance report (A4, client/equipment/checklist/parts)
- [x] `src/lib/pdf/GarantiaPdf.tsx` — Warranty Certificate (90 días, coverage labels in Spanish)

### 4.2 Report Creation
- [x] Report record created in Dexie (`reports` table) on finalize
- [x] Unique warranty number via `generateWarrantyNumber()` core fn
- [x] `pdf_pending: true` flag for upload queue
- [ ] Wire PDF generation + Blob URL download in UI
- [ ] Upload PDF to Supabase Storage `reports/` bucket on sync
- [ ] Update row with final `pdf_url`

### 4.3 WhatsApp Send
- [ ] `src/lib/whatsapp.ts` — deep link builder `wa.me/<e164>?text=...`
- [ ] Open `wa.me` link after PDF ready
- [ ] Web Share API fallback (`navigator.share` with PDF Blob) for mobile

---

## Phase 5 — Warranties + Reminders + Claims

### 5.1 Warranties
- [x] `src/app/(app)/warranties/page.tsx` — active + expiring-soon tabs
- [x] `src/components/features/warranties/WarrantyList.tsx`
- [x] Warranty record created in Dexie on finalize with warranty
- [x] Equipment tagged with `active_warranty` on warranty create

### 5.2 Reminders + Web Push
- [x] `src/lib/notifications/subscribe.ts` — subscribe/unsubscribe to Web Push
- [x] `src/app/api/push/subscribe/route.ts` — save push subscription to Supabase user metadata
- [x] `src/app/api/reminders/cron/route.ts` — hourly cron via Vercel Cron, `CRON_SECRET` auth
- [x] In-app agenda (TodayAgenda): `due_at` within 7 days shown on Today tab
- [ ] `supabase/functions/push-dispatch/index.ts` — send Web Push via `web-push` package
- [ ] Web Push subscription UI toggle in settings
- [ ] Reminder rows created in Dexie on service finalize (preventive 6mo) and warranty save

### 5.3 Claims
- [ ] `src/components/features/claims/ClaimForm.tsx`
- [ ] `src/components/features/claims/ClaimList.tsx`
- [ ] Linked to warranty, shown on warranty detail

---

## Phase 6 — Inventory + Stats + CSV Export

### 6.1 Inventory Screen
- [x] `src/app/(app)/inventory/page.tsx` — parts stock list
- [x] `src/components/features/inventory/InventoryScreen.tsx`
- [ ] Adjust stock manually (add/subtract form)
- [ ] Color badge: ok (green) / low (amber) / zero (red)
- [ ] Add Part form / dialog

### 6.2 Stats Dashboard
- [ ] Install `recharts`
- [ ] Services per month (bar chart)
- [ ] Parts consumed (pie chart)
- [ ] Warranty conversion rate
- [ ] Most serviced equipment

### 6.3 CSV Export
- [ ] `src/lib/export.ts` — CSV from Dexie data
- [ ] File System Access API (`showSaveFilePicker`) + Blob download fallback
- [ ] Export: services, parts usage, equipment list

### 6.4 Settings
- [ ] Settings section (`/settings` or inside inventory)
- [ ] Push notification permission toggle
- [ ] Storage usage estimate (`navigator.storage.estimate()`)

---

## Phase 7 — Sync Hardening + Empty States + Error Boundaries

### 7.1 Sync Engine
- [x] `src/lib/sync/outbox.ts` — `enqueue()` writes to `sync_outbox` Dexie table
- [x] `src/lib/sync/push.ts` — flush outbox: sequential, idempotent, exponential backoff, dead-letter after 10 attempts
- [x] `src/lib/sync/pull.ts` — cursor-based pull (`updated_at > cursor LIMIT 500`)
- [x] `src/hooks/useSync.ts` — flushes on `isOnline` change, `visibilitychange`, Background Sync tag
- [x] `src/components/features/shell/SyncStatusBar.tsx` — offline/syncing/dead-letter states
- [ ] `src/lib/sync/conflict.ts` — LWW via `updated_at`; finalized services = immutable
- [ ] Supabase Realtime subscription while tab visible + online → merge into Dexie
- [ ] Media upload pipeline: `pending_upload = true` → upload blob → update URL

### 7.2 Empty States
- [x] ClientList empty state
- [x] EquipmentList empty state
- [x] PartsList empty state
- [x] Today/Agenda empty state
- [x] WarrantiesList empty state

### 7.3 Error Boundaries + Suspense
- [x] `src/components/ErrorBoundary.tsx` — React class error boundary with retry
- [ ] Wrap route segments in `<Suspense>` with Skeleton fallbacks
- [ ] Offline auth: expired token → read-only mode banner

---

## Phase 8 — PWA Polish + Lighthouse + Deploy

### 8.1 PWA
- [ ] Install & configure `@serwist/next` (service worker + precache)
- [ ] Offline fallback page
- [ ] Install prompt (`beforeinstallprompt`) — "Add to home screen" banner
- [ ] Test install on Android (Chrome) + iOS 16.4+ (Safari)

### 8.2 Accessibility + Performance
- [x] Icon-only buttons have `aria-label` (enforced in components)
- [x] Min tap target 44px via `.touch-target` utility
- [x] `text-balance` on headings, `text-pretty` on paragraphs
- [ ] WCAG AA contrast audit
- [ ] `prefers-reduced-motion` in all motion/react animations

### 8.3 Lighthouse
- [ ] PWA score ≥ 90
- [ ] Performance score ≥ 90
- [ ] Accessibility score ≥ 95

### 8.4 Vercel Deploy
- [ ] Set env vars in Vercel (Supabase URL, anon key, service key, OpenAI key, VAPID keys)
- [ ] Configure Vercel Cron for `/api/reminders/cron` (hourly)
- [ ] Preview deploy → install to home screen → validate offline
- [ ] Production deploy

---

## Cross-Cutting Concerns

- [x] All mutations go through Dexie first, then outbox → no direct Supabase writes from client
- [x] `sync_version` field on every synced entity
- [x] Photo compression before any Dexie insert (canvas, quality 0.7, max 1600px)
- [x] ESLint boundary: `no-restricted-imports` in `src/core/` (forbids react/dexie/next)
- [ ] `pnpm lint` — ensure zero ESLint errors
- [ ] Prettier format pass on every file
- [ ] `pnpm exec tsc --noEmit` — zero TS errors ✅ (done as of Phase 3 fixes)
