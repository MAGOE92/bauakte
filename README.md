# Bauakte

Web-App für Bauherren/Immobilieneigentümer zur Verwaltung von Immobilien,
Bauprojekten, Unterlagen, Ausschreibungen, Budget und externen Freigaben.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase (Postgres, Auth, Storage, Row Level Security)
- Server Actions für alle Schreiboperationen

## Setup

```bash
npm install
cp .env.local.example .env.local
# NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY eintragen
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000).

## Supabase-Projekt

Das Supabase-Projekt ("Gebaeudeakte") enthält bereits:

- Schema für `properties`, `projects`, `firmen`, `documents`, `vergaben`,
  `vergabe_dokumente`, `angebote`, `projekt_firmen`, `ausgaben`, `einnahmen`,
  `freigaben` (siehe Migrationen im Projekt)
- Row Level Security auf allen Tabellen (Eigentümer sieht nur eigene Daten)
- Privaten Storage-Bucket `unterlagen` (Pfad-Konvention `<property_id>/<dateiname>`)
- RPC-Funktion `freigabe_by_token` für die öffentliche Freigabe-Ansicht
  (`/freigabe/[token]`)
- Edge Function `freigabe-datei`, die für einen gültigen Freigabe-Token
  signierte Download-Links für die freigegebenen Dokumente ausstellt

## Struktur

- `src/app/(app)/*` – eingeloggter Bereich (Sidebar-Layout)
- `src/app/login` – Anmelden/Registrieren
- `src/app/freigabe/[token]` – öffentliche, nicht eingeloggte Freigabe-Ansicht
- `src/lib/supabase` – Browser-/Server-Clients, Proxy-Session-Handling, DB-Typen
- `src/lib/budget.ts` – reine Budgetberechnung (Verplant/Bezahlt/Verfügbar/Einnahmen)
- `src/components/ui` – Design-System-Bausteine
