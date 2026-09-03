"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil, Trash2, Ruler, User, FileText } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { einheitNutzungLabel, einheitNutzungTone } from "@/lib/labels";
import { formatFlaeche, formatProzent } from "@/lib/format";
import type { Enums, Tables } from "@/lib/supabase/database.types";
import {
  createEinheit,
  updateEinheit,
  deleteEinheit,
  type EinheitEingabe,
} from "../actions/einheiten";

type Einheit = Tables<"einheiten">;

export function EinheitenSection({
  propertyId,
  einheiten,
}: {
  propertyId: string;
  einheiten: Einheit[];
}) {
  const [anlegen, setAnlegen] = useState(false);
  const gesamtflaeche = einheiten.reduce((summe, e) => summe + (e.wohnflaeche ?? 0), 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          Teile die Immobilie in Wohneinheiten auf — zum Beispiel Hauptwohnung und
          Einliegerwohnung. Die Wohnfläche ist der Schlüssel für die
          Nebenkostenabrechnung.
        </p>
        {!anlegen && (
          <Button onClick={() => setAnlegen(true)} className="shrink-0">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Wohneinheit anlegen
          </Button>
        )}
      </div>

      {anlegen && (
        <EinheitFormular
          titel="Neue Wohneinheit"
          propertyId={propertyId}
          onAbbrechen={() => setAnlegen(false)}
          onSpeichern={(eingabe) => createEinheit(eingabe)}
          onFertig={() => setAnlegen(false)}
        />
      )}

      {!einheiten.length ? (
        <EmptyState
          title="Noch keine Wohneinheiten"
          description="Ohne Wohneinheiten rechnet die App die Immobilie als Ganzes. Für eine Einliegerwohnung oder ein Mehrfamilienhaus lohnt sich die Aufteilung."
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {einheiten.map((einheit) => (
            <EinheitKarte
              key={einheit.id}
              einheit={einheit}
              propertyId={propertyId}
              gesamtflaeche={gesamtflaeche}
            />
          ))}
        </div>
      )}

      {einheiten.length > 0 && (
        <p className="text-sm text-ink-soft">
          Gesamtwohnfläche: <span className="font-semibold text-ink">{formatFlaeche(gesamtflaeche)}</span>
        </p>
      )}
    </div>
  );
}

function EinheitKarte({
  einheit,
  propertyId,
  gesamtflaeche,
}: {
  einheit: Einheit;
  propertyId: string;
  gesamtflaeche: number;
}) {
  const router = useRouter();
  const [bearbeiten, setBearbeiten] = useState(false);
  const [pending, setPending] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  const anteil =
    einheit.wohnflaeche !== null && gesamtflaeche > 0 ? einheit.wohnflaeche / gesamtflaeche : null;

  async function loeschen() {
    if (
      !confirm(
        `„${einheit.name}" wirklich löschen? Laufende Posten dieser Einheit bleiben erhalten und gelten danach für die ganze Immobilie.`
      )
    ) {
      return;
    }
    setPending(true);
    const ergebnis = await deleteEinheit(einheit.id, propertyId);
    setPending(false);
    if (ergebnis.status === "error") {
      setFehler(ergebnis.message);
      return;
    }
    router.refresh();
  }

  if (bearbeiten) {
    return (
      <EinheitFormular
        titel="Wohneinheit bearbeiten"
        propertyId={propertyId}
        einheit={einheit}
        onAbbrechen={() => setBearbeiten(false)}
        onSpeichern={(eingabe) => updateEinheit(einheit.id, eingabe)}
        onFertig={() => setBearbeiten(false)}
      />
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold text-ink">{einheit.name}</p>
          <div className="mt-2">
            <Badge tone={einheitNutzungTone[einheit.nutzung]}>
              {einheitNutzungLabel[einheit.nutzung]}
            </Badge>
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            onClick={() => setBearbeiten(true)}
            title="Bearbeiten"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-terracotta hover:text-terracotta"
          >
            <Pencil className="h-4 w-4" strokeWidth={2.25} />
          </button>
          <button
            onClick={loeschen}
            disabled={pending}
            title="Löschen"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-danger hover:text-danger"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>
      </div>

      <dl className="mt-5 flex flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 text-ink-soft">
          <Ruler className="h-4 w-4 shrink-0" />
          <dt className="sr-only">Wohnfläche</dt>
          <dd>
            {einheit.wohnflaeche === null ? (
              <span className="text-warning">Wohnfläche fehlt</span>
            ) : (
              <>
                <span className="font-semibold text-ink">{formatFlaeche(einheit.wohnflaeche)}</span>
                {anteil !== null && <span> · {formatProzent(anteil * 100)} der Fläche</span>}
              </>
            )}
          </dd>
        </div>
        {einheit.mieter_name && (
          <div className="flex items-center gap-2 text-ink-soft">
            <User className="h-4 w-4 shrink-0" />
            <dt className="sr-only">Mieter</dt>
            <dd className="text-ink">{einheit.mieter_name}</dd>
          </div>
        )}
      </dl>

      {einheit.notizen && <p className="mt-3 text-sm text-ink-soft">{einheit.notizen}</p>}

      {fehler && <p className="mt-3 text-sm font-medium text-danger">{fehler}</p>}

      {einheit.nutzung === "vermietet" && (
        <Link
          href={`/immobilien/${propertyId}/nebenkosten/${einheit.id}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-terracotta hover:text-terracotta-hover"
        >
          <FileText className="h-4 w-4" strokeWidth={2.25} />
          Nebenkostenabrechnung
        </Link>
      )}
    </Card>
  );
}

function EinheitFormular({
  titel,
  propertyId,
  einheit,
  onSpeichern,
  onAbbrechen,
  onFertig,
}: {
  titel: string;
  propertyId: string;
  einheit?: Einheit;
  onSpeichern: (eingabe: EinheitEingabe) => Promise<{ status: string; message?: string }>;
  onAbbrechen: () => void;
  onFertig: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState(einheit?.name ?? "");
  const [wohnflaeche, setWohnflaeche] = useState(
    einheit?.wohnflaeche !== null && einheit?.wohnflaeche !== undefined
      ? String(einheit.wohnflaeche)
      : ""
  );
  const [nutzung, setNutzung] = useState<Enums<"einheit_nutzung">>(
    einheit?.nutzung ?? "eigengenutzt"
  );
  const [mieterName, setMieterName] = useState(einheit?.mieter_name ?? "");
  const [notizen, setNotizen] = useState(einheit?.notizen ?? "");
  const [fehler, setFehler] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const idPrefix = einheit ? `einheit-${einheit.id}` : "einheit-neu";

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setFehler(null);

    const ergebnis = await onSpeichern({
      propertyId,
      name,
      wohnflaeche,
      nutzung,
      mieterName,
      notizen,
    });
    setPending(false);

    if (ergebnis.status === "error") {
      setFehler(ergebnis.message ?? "Es ist ein Fehler aufgetreten.");
      return;
    }
    onFertig();
    router.refresh();
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-lg font-bold text-ink">{titel}</p>
        <button type="button" onClick={onAbbrechen} className="text-ink-soft hover:text-ink">
          <X className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={absenden} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Bezeichnung" htmlFor={`${idPrefix}-name`}>
          <Input
            id={`${idPrefix}-name`}
            required
            placeholder="z. B. Einliegerwohnung DG"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field
          label="Wohnfläche"
          htmlFor={`${idPrefix}-flaeche`}
          hint="In m² — Grundlage für die Nebenkostenabrechnung"
        >
          <Input
            id={`${idPrefix}-flaeche`}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="z. B. 62"
            value={wohnflaeche}
            onChange={(e) => setWohnflaeche(e.target.value)}
          />
        </Field>
        <Field label="Nutzung" htmlFor={`${idPrefix}-nutzung`}>
          <Select
            id={`${idPrefix}-nutzung`}
            value={nutzung}
            onChange={(e) => setNutzung(e.target.value as Enums<"einheit_nutzung">)}
          >
            {Object.entries(einheitNutzungLabel).map(([wert, beschriftung]) => (
              <option key={wert} value={wert}>
                {beschriftung}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Mieter" htmlFor={`${idPrefix}-mieter`} hint="Optional">
          <Input
            id={`${idPrefix}-mieter`}
            placeholder="Name des Mieters"
            value={mieterName}
            onChange={(e) => setMieterName(e.target.value)}
          />
        </Field>
        <Field label="Notizen" htmlFor={`${idPrefix}-notizen`} hint="Optional" className="sm:col-span-2">
          <Textarea
            id={`${idPrefix}-notizen`}
            placeholder="z. B. eigener Zähler, separater Eingang"
            value={notizen}
            onChange={(e) => setNotizen(e.target.value)}
          />
        </Field>

        {fehler && <p className="text-sm font-medium text-danger sm:col-span-2">{fehler}</p>}

        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Wird gespeichert…" : "Speichern"}
          </Button>
          <Button type="button" variant="secondary" onClick={onAbbrechen}>
            Abbrechen
          </Button>
        </div>
      </form>
    </Card>
  );
}
