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

### Offene Schritte am Supabase-Projekt

1. Migration `supabase/migrations/20260828000000_freigabe_by_token_haerten.sql`
   einspielen (härtet `freigabe_by_token`, siehe Kommentar in der Datei).
2. Im Dashboard unter Authentication → Policies **Leaked Password Protection**
   aktivieren (Abgleich gegen HaveIBeenPwned); der Security Advisor meldet das
   sonst als Warnung.

### Zur Freigabe-Funktion und dem Security Advisor

`public.freigabe_by_token` ist bewusst für die Rolle `anon` ausführbar — genau
das ist das Feature: Ein nicht eingeloggter Empfänger öffnet den Link. Das
Sicherheitsmerkmal ist der Token selbst (zwei zusammengesetzte UUIDs = 256 Bit,
nicht erratbar); die Funktion prüft Ablauf und Widerruf und gibt ohne gültigen
Token nichts preis. Der Security Advisor markiert solche Funktionen generell —
diese Warnung ist hier also erwartet und kein Fehler. Eingeloggte Nutzer
brauchen die Funktion dagegen nicht: sie lesen die Freigabe über ihre eigenen
RLS-Rechte (`loadFreigabe.ts`), weshalb `authenticated` das EXECUTE-Recht
entzogen bekommt.

## Struktur

- `src/app/(app)/*` – eingeloggter Bereich (Sidebar-Layout)
- `src/app/login` – Anmelden/Registrieren
- `src/app/freigabe/[token]` – öffentliche, nicht eingeloggte Freigabe-Ansicht
- `src/lib/supabase` – Browser-/Server-Clients, Proxy-Session-Handling, DB-Typen
- `src/lib/budget.ts` – reine Budgetberechnung (Verplant/Bezahlt/Verfügbar/Einnahmen)
- `src/components/ui` – Design-System-Bausteine
