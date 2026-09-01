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

## Zugang: privat jetzt, öffentlich später

Die App läuft in zwei Betriebsarten, umgeschaltet über die Umgebungsvariable
`REGISTRIERUNG_OFFEN`. Standard ist **privat**.

### Privat (Standard, `REGISTRIERUNG_OFFEN` nicht gesetzt)

Die Anmeldeseite zeigt nur „Anmelden", es gibt keine Registrierung, und
`signUp` weist Aufrufe serverseitig ab. Es kommt nur hinein, wer schon ein
Konto hat. In dieser Betriebsart wird **nie eine E-Mail verschickt** — es
braucht also keinen Mailversand.

Konten legt der Betreiber im Supabase-Dashboard an:
Authentication → Users → **Add user** → **Create new user** → E-Mail und
Passwort eintragen, Haken bei **Auto Confirm User** setzen. Danach meldet sich
der Nutzer in der App mit genau diesen Daten an.

### Öffentlich (`REGISTRIERUNG_OFFEN=true`)

Die Registrierung erscheint wieder in der App und jeder kann sich ein Konto
anlegen. Reihenfolge beim Umstellen:

1. **E-Mail-Versand in Supabase einrichten.** Der eingebaute Versand ist nur
   zum Ausprobieren gedacht und stark limitiert; für echte Nutzer einen
   SMTP-Anbieter hinterlegen (z. B. Resend, Postmark, SendGrid) unter
   Project Settings → Authentication → SMTP Settings. Ohne diesen Schritt
   kommen die Bestätigungslinks nicht an und niemand kann sich anmelden.
2. **Redirect-URL eintragen** unter Authentication → URL Configuration: die
   Domain der App, sonst führt der Link aus der Bestätigungsmail ins Leere.
3. **`REGISTRIERUNG_OFFEN=true`** setzen (in Vercel unter Settings →
   Environment Variables) und neu deployen.

Noch zu bauen, bevor die App wirklich für alle offen ist: eine
„Passwort vergessen"-Funktion. Solange nur der Betreiber Konten anlegt, setzt
er ein Passwort im Dashboard zurück; für Selbstbedienung fehlt der Ablauf noch.

## Supabase-Projekt

Die App läuft auf dem Supabase-Projekt **"Bau App"** (`kdqkowfnqdickisrfwsg`).

> Zur Vorgeschichte: Ursprünglich lag das Schema im Projekt "Gebaeudeakte".
> Auf das hatte am Ende niemand mehr administrativen Zugriff — dort liessen
> sich also weder Nutzer anlegen noch Fehler beheben. Deshalb wurde die
> Bauakte in "Bau App" neu aufgebaut (Migrationen `bauakte_01` bis `04`).
>
> In diesem Projekt lag bereits eine ältere "Bauhelfer"-Idee mit Katalogdaten
> (Gewerke, Arbeitsschritte). Die ist unangetastet geblieben: Ihre leere
> Tabelle `projects` wurde nur zu `bauhelfer_projects` umbenannt, weil der
> Name kollidierte, und `private.ist_projektmitglied` entsprechend
> nachgezogen. Die Bauakte nutzt eigene Helfer mit `bauakte_`-Präfix.

Das Projekt enthält:

- Schema für `properties`, `projects`, `firmen`, `documents`, `vergaben`,
  `vergabe_dokumente`, `angebote`, `projekt_firmen`, `ausgaben`, `einnahmen`,
  `freigaben` (siehe Migrationen im Projekt)
- Row Level Security auf allen Tabellen (Eigentümer sieht nur eigene Daten)
- Privaten Storage-Bucket `unterlagen` (Pfad-Konvention `<property_id>/<dateiname>`)
- RPC-Funktion `freigabe_by_token` für die öffentliche Freigabe-Ansicht
  (`/freigabe/[token]`)
- Edge Function `freigabe-datei`, die für einen gültigen Freigabe-Token
  signierte Download-Links für die freigegebenen Dokumente ausstellt

### Offener Schritt am Supabase-Projekt

Im Dashboard unter Authentication → Policies **Leaked Password Protection**
aktivieren (Abgleich gegen HaveIBeenPwned); der Security Advisor meldet das
sonst als Warnung.

Die Härtung von `freigabe_by_token` (EXECUTE nur für `anon`) ist in "Bau App"
bereits Teil von Migration `bauakte_04` und muss nicht mehr nachgezogen werden.

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
- `src/app/login` – Anmelden (Registrierung je nach `REGISTRIERUNG_OFFEN`)
- `src/lib/config.ts` – der Schalter privat/öffentlich
- `src/app/freigabe/[token]` – öffentliche, nicht eingeloggte Freigabe-Ansicht
- `src/lib/supabase` – Browser-/Server-Clients, Proxy-Session-Handling, DB-Typen
- `src/lib/budget.ts` – reine Budgetberechnung (Verplant/Bezahlt/Verfügbar/Einnahmen)
- `src/components/ui` – Design-System-Bausteine
