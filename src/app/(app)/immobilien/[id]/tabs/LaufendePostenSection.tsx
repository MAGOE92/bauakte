"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import {
  laufendKategorieLabel,
  laufendKategorienNachArt,
  postenArtLabel,
  turnusLabel,
  umlagefaehigVorschlag,
} from "@/lib/labels";
import { formatCurrency, formatDate } from "@/lib/format";
import { jahresbetrag } from "@/lib/cashflow";
import type { Enums, Tables } from "@/lib/supabase/database.types";
import {
  createLaufendenPosten,
  updateLaufendenPosten,
  deleteLaufendenPosten,
  type PostenEingabe,
} from "../actions/posten";

type Posten = Tables<"laufende_posten">;
type EinheitOption = { id: string; name: string };

export function LaufendePostenSection({
  propertyId,
  posten,
  einheiten,
}: {
  propertyId: string;
  posten: Posten[];
  einheiten: EinheitOption[];
}) {
  const [anlegen, setAnlegen] = useState(false);

  const einnahmen = posten.filter((p) => p.art === "einnahme");
  const kosten = posten.filter((p) => p.art === "ausgabe");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold text-ink">Laufende Posten</h2>
          <p className="mt-1 max-w-2xl text-sm text-ink-soft">
            Alles, was regelmäßig kommt: Miete, Grundsteuer, Versicherung, Darlehen. Einmalige
            Rechnungen erfasst du weiterhin im jeweiligen Projekt.
          </p>
        </div>
        {!anlegen && (
          <Button onClick={() => setAnlegen(true)} className="shrink-0">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Posten anlegen
          </Button>
        )}
      </div>

      {anlegen && (
        <PostenFormular
          titel="Neuer laufender Posten"
          propertyId={propertyId}
          einheiten={einheiten}
          onSpeichern={(eingabe) => createLaufendenPosten(eingabe)}
          onAbbrechen={() => setAnlegen(false)}
          onFertig={() => setAnlegen(false)}
        />
      )}

      {!posten.length ? (
        <EmptyState
          title="Noch keine laufenden Posten"
          description="Trage ein, was regelmäßig rein- und rausgeht. Daraus entsteht der Cashflow — und die Nebenkostenabrechnung."
        />
      ) : (
        <div className="flex flex-col gap-6">
          <PostenTabelle
            titel="Einnahmen"
            posten={einnahmen}
            propertyId={propertyId}
            einheiten={einheiten}
          />
          <PostenTabelle
            titel="Kosten"
            posten={kosten}
            propertyId={propertyId}
            einheiten={einheiten}
          />
        </div>
      )}
    </div>
  );
}

function PostenTabelle({
  titel,
  posten,
  propertyId,
  einheiten,
}: {
  titel: string;
  posten: Posten[];
  propertyId: string;
  einheiten: EinheitOption[];
}) {
  if (!posten.length) return null;

  return (
    <div>
      <h3 className="font-display mb-3 text-base font-bold text-ink">{titel}</h3>
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface shadow-card">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3">Posten</th>
              <th className="px-5 py-3">Einheit</th>
              <th className="px-5 py-3">Gültig</th>
              <th className="px-5 py-3 text-right">Betrag</th>
              <th className="px-5 py-3 text-right">Pro Jahr</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {posten.map((p) => (
              <PostenZeile
                key={p.id}
                posten={p}
                propertyId={propertyId}
                einheiten={einheiten}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PostenZeile({
  posten,
  propertyId,
  einheiten,
}: {
  posten: Posten;
  propertyId: string;
  einheiten: EinheitOption[];
}) {
  const router = useRouter();
  const [bearbeiten, setBearbeiten] = useState(false);
  const [pending, setPending] = useState(false);

  const einheitName = posten.einheit_id
    ? (einheiten.find((e) => e.id === posten.einheit_id)?.name ?? "Gelöschte Einheit")
    : "Ganze Immobilie";

  async function loeschen() {
    if (!confirm(`„${posten.bezeichnung}" wirklich löschen?`)) return;
    setPending(true);
    await deleteLaufendenPosten(posten.id, propertyId);
    setPending(false);
    router.refresh();
  }

  if (bearbeiten) {
    return (
      <tr>
        <td colSpan={6} className="p-4">
          <PostenFormular
            titel="Posten bearbeiten"
            propertyId={propertyId}
            einheiten={einheiten}
            posten={posten}
            onSpeichern={(eingabe) => updateLaufendenPosten(posten.id, eingabe)}
            onAbbrechen={() => setBearbeiten(false)}
            onFertig={() => setBearbeiten(false)}
          />
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-5 py-3.5">
        <p className="font-semibold text-ink">{posten.bezeichnung}</p>
        <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-ink-soft">
          <span>{laufendKategorieLabel[posten.kategorie]}</span>
          {posten.umlagefaehig && (
            <Badge tone="info" className="px-2 py-0.5 text-[11px]">
              umlagefähig
            </Badge>
          )}
        </p>
      </td>
      <td className="px-5 py-3.5 text-ink-soft">{einheitName}</td>
      <td className="px-5 py-3.5 text-ink-soft">
        {formatDate(posten.gilt_ab)}
        {posten.gilt_bis ? ` – ${formatDate(posten.gilt_bis)}` : ""}
      </td>
      <td className="px-5 py-3.5 text-right">
        <span className="font-semibold text-ink">{formatCurrency(posten.betrag)}</span>
        <span className="block text-xs text-ink-soft">{turnusLabel[posten.turnus]}</span>
      </td>
      <td className="px-5 py-3.5 text-right text-ink-soft">
        {posten.turnus === "einmalig" ? "–" : formatCurrency(jahresbetrag(posten.betrag, posten.turnus))}
      </td>
      <td className="px-5 py-3.5">
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setBearbeiten(true)}
            title="Bearbeiten"
            className="text-ink-soft transition-colors hover:text-terracotta"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={loeschen}
            disabled={pending}
            title="Löschen"
            className="text-ink-soft transition-colors hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function PostenFormular({
  titel,
  propertyId,
  einheiten,
  posten,
  onSpeichern,
  onAbbrechen,
  onFertig,
}: {
  titel: string;
  propertyId: string;
  einheiten: EinheitOption[];
  posten?: Posten;
  onSpeichern: (eingabe: PostenEingabe) => Promise<{ status: string; message?: string }>;
  onAbbrechen: () => void;
  onFertig: () => void;
}) {
  const router = useRouter();
  const [art, setArt] = useState<Enums<"posten_art">>(posten?.art ?? "ausgabe");
  const [kategorie, setKategorie] = useState<Enums<"laufend_kategorie">>(
    posten?.kategorie ?? "grundsteuer"
  );
  const [bezeichnung, setBezeichnung] = useState(posten?.bezeichnung ?? "");
  const [betrag, setBetrag] = useState(posten ? String(posten.betrag) : "");
  const [turnus, setTurnus] = useState<Enums<"turnus">>(posten?.turnus ?? "monatlich");
  const [einheitId, setEinheitId] = useState(posten?.einheit_id ?? "");
  const [umlagefaehig, setUmlagefaehig] = useState(posten?.umlagefaehig ?? true);
  const [giltAb, setGiltAb] = useState(
    posten?.gilt_ab ?? new Date().toISOString().slice(0, 10)
  );
  const [giltBis, setGiltBis] = useState(posten?.gilt_bis ?? "");
  const [notizen, setNotizen] = useState(posten?.notizen ?? "");
  const [fehler, setFehler] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const idPrefix = posten ? `posten-${posten.id}` : "posten-neu";

  /** Beim Wechsel der Art passt die Kategorie nicht mehr — also mitziehen. */
  function wechsleArt(neueArt: Enums<"posten_art">) {
    const neueKategorie = laufendKategorienNachArt[neueArt][0];
    setArt(neueArt);
    setKategorie(neueKategorie);
    setUmlagefaehig(umlagefaehigVorschlag[neueKategorie]);
  }

  /** Die Umlagefähigkeit folgt der Kategorie — überschreibbar bleibt sie trotzdem. */
  function wechsleKategorie(neueKategorie: Enums<"laufend_kategorie">) {
    setKategorie(neueKategorie);
    setUmlagefaehig(umlagefaehigVorschlag[neueKategorie]);
  }

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setFehler(null);

    const ergebnis = await onSpeichern({
      propertyId,
      einheitId,
      art,
      bezeichnung,
      betrag,
      turnus,
      kategorie,
      umlagefaehig,
      giltAb,
      giltBis,
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
        <Field label="Art" htmlFor={`${idPrefix}-art`}>
          <Select
            id={`${idPrefix}-art`}
            value={art}
            onChange={(e) => wechsleArt(e.target.value as Enums<"posten_art">)}
          >
            {Object.entries(postenArtLabel).map(([wert, beschriftung]) => (
              <option key={wert} value={wert}>
                {beschriftung}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Kategorie" htmlFor={`${idPrefix}-kategorie`}>
          <Select
            id={`${idPrefix}-kategorie`}
            value={kategorie}
            onChange={(e) => wechsleKategorie(e.target.value as Enums<"laufend_kategorie">)}
          >
            {laufendKategorienNachArt[art].map((wert) => (
              <option key={wert} value={wert}>
                {laufendKategorieLabel[wert]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Bezeichnung" htmlFor={`${idPrefix}-bezeichnung`} className="sm:col-span-2">
          <Input
            id={`${idPrefix}-bezeichnung`}
            required
            placeholder={art === "einnahme" ? "z. B. Kaltmiete Einliegerwohnung" : "z. B. Gebäudeversicherung"}
            value={bezeichnung}
            onChange={(e) => setBezeichnung(e.target.value)}
          />
        </Field>

        <Field label="Betrag" htmlFor={`${idPrefix}-betrag`} hint="In Euro, pro Turnus">
          <Input
            id={`${idPrefix}-betrag`}
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            required
            placeholder="0,00"
            value={betrag}
            onChange={(e) => setBetrag(e.target.value)}
          />
        </Field>
        <Field label="Turnus" htmlFor={`${idPrefix}-turnus`}>
          <Select
            id={`${idPrefix}-turnus`}
            value={turnus}
            onChange={(e) => setTurnus(e.target.value as Enums<"turnus">)}
          >
            {Object.entries(turnusLabel).map(([wert, beschriftung]) => (
              <option key={wert} value={wert}>
                {beschriftung}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label="Gehört zu"
          htmlFor={`${idPrefix}-einheit`}
          hint="Kosten der ganzen Immobilie werden nach Wohnfläche verteilt"
        >
          <Select
            id={`${idPrefix}-einheit`}
            value={einheitId}
            onChange={(e) => setEinheitId(e.target.value)}
          >
            <option value="">Ganze Immobilie</option>
            {einheiten.map((einheit) => (
              <option key={einheit.id} value={einheit.id}>
                {einheit.name}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Ab" htmlFor={`${idPrefix}-ab`}>
            <Input
              id={`${idPrefix}-ab`}
              type="date"
              required
              value={giltAb}
              onChange={(e) => setGiltAb(e.target.value)}
            />
          </Field>
          <Field label="Bis" htmlFor={`${idPrefix}-bis`} hint="Optional">
            <Input
              id={`${idPrefix}-bis`}
              type="date"
              value={giltBis}
              onChange={(e) => setGiltBis(e.target.value)}
            />
          </Field>
        </div>

        {art === "ausgabe" && (
          <label className="flex items-start gap-3 rounded-xl border border-line bg-sunken p-4 sm:col-span-2">
            <input
              type="checkbox"
              checked={umlagefaehig}
              onChange={(e) => setUmlagefaehig(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--bk-terracotta)]"
            />
            <span className="text-sm">
              <span className="font-semibold text-ink">Auf Mieter umlagefähig</span>
              <span className="mt-0.5 block text-ink-soft">
                Nur umlagefähige Kosten landen in der Nebenkostenabrechnung. Verwaltung,
                Instandhaltung und Darlehen gehören nicht dazu.
              </span>
            </span>
          </label>
        )}

        <Field label="Notizen" htmlFor={`${idPrefix}-notizen`} hint="Optional" className="sm:col-span-2">
          <Textarea
            id={`${idPrefix}-notizen`}
            placeholder="z. B. Vertragsnummer, Zahlungsweise"
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
