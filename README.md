# Refrigest

Field management app for refrigeration technicians. Automates service logging, inventory tracking, and professional report delivery via WhatsApp.

Clients never register. Their WhatsApp number is their unique ID.

## What It Does

### Client & Equipment Management

Data hierarchy: **Client → Branches → Equipment**

- Client identified by WhatsApp number. Technician sets a display alias (e.g. "Don Ricardo – Carnicería El Toro").
- Each client can have multiple branches, each with a GPS location.
- Equipment is registered the first time it's serviced. Each unit gets a profile: brand, model, nameplate photo, refrigerant type, and full service history.

### Field Operations

Large-button, simple-menu UI designed for use on-site.

- Pick equipment from a list or add a new one.
- Document the service: before/after photos, technical checklist (pressures, amperage, cleaning, leaks), voice notes with auto-transcription, written observations, and short video evidence.
- Parts used in the service are automatically deducted from the technician's stock inventory.

### Reports & Warranties

At the end of a job, the technician chooses:

- **Report only** — generates a "Technical Assistance" PDF.
- **Report + Warranty** — generates a "Warranty Certificate" PDF with a unique certificate number.

Warranty duration (30, 90, or 180 days) and coverage (labor only or full) are set manually by the technician.

### WhatsApp Integration

One tap at job completion: the app generates the PDFs and opens WhatsApp with a pre-written professional message and file links. No copy-paste.

### Reminders & Alerts

- Equipment that hasn't been serviced in 6 months triggers a technician notification.
- Upcoming warranty expirations are listed for follow-up.

### Inventory & Dashboard

- Stock control for parts and tools (vehicle and shop).
- Per-equipment inventory visible to technicians only.
- Dashboard: monthly revenue, most-repaired equipment, active warranties.
- Internal search: find clients, branches, or equipment fast.
- Claims history: past claims linked to the relevant equipment and warranty.
- Export clients, equipment, and warranties to Excel/CSV.

### Roles

- Principal technician, assistant, administrator.

### Technical Details

- Offline-first: all data recorded without a connection, synced when signal returns.
- Automatic cloud backup and basic encryption.
- High-contrast UI, large typography, tab navigation: Today/Schedule – Clients – Warranties – Inventory/Profile.
- Equipment tags: "critical", "preventive pending", "active warranty".
- In-app access to technical manuals and guides.
- Optional dark/light mode and multi-language support.

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) or [https://refrigest.localhost](https://refrigest.localhost).
