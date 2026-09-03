"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input, Select } from "@/components/ui/Field";
import { formatCurrency, formatDate } from "@/lib/format";
import { ausgabeKategorieLabel, ausgabeArtLabel } from "@/lib/labels";
import type { Enums, Tables } from "@/lib/supabase/database.types";
import {
  createAusgabe,
  toggleAusgabeBezahlt,
  setzeBezahltAm,
  deleteAusgabe,
} from "../actions/ausgaben";

export function AusgabenSection({
  projectId,
  ausgaben,
}: {
  projectId: string;
  ausgaben: Tables<"ausgaben">[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <NewAusgabeForm projectId={projectId} />

      {!ausgaben.length ? (
        <EmptyState title="Noch keine Ausgaben erfasst" description="Erfasse Rechnungen und Kosten für dieses Projekt." />
      ) : (
        <>
          {/* Ab sm eine Tabelle; auf dem Handy laeuft eine breite Tabelle seitlich
              aus dem Bildschirm, deshalb darunter dieselben Zeilen als Karten. */}
          <div className="hidden overflow-x-auto rounded-2xl border border-line bg-surface shadow-card sm:block">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th className="px-5 py-3">Bezeichnung</th>
                  <th className="px-5 py-3">Kategorie</th>
                  <th className="px-5 py-3">Fällig</th>
                  <th className="px-5 py-3 text-right">Betrag</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {ausgaben.map((a) => (
                  <AusgabeZeile key={a.id} ausgabe={a} projectId={projectId} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 sm:hidden">
            {ausgaben.map((a) => (
              <AusgabeKarte key={a.id} ausgabe={a} projectId={projectId} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function useAusgabeAktionen(ausgabe: Tables<"ausgaben">, projectId: string) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggleBezahlt() {
    setPending(true);
    await toggleAusgabeBezahlt(ausgabe.id, projectId, !ausgabe.bezahlt);
    setPending(false);
    router.refresh();
  }

  async function setDatum(datum: string) {
    if (!datum) return;
    setPending(true);
    await setzeBezahltAm(ausgabe.id, projectId, datum);
    setPending(false);
    router.refresh();
  }

  async function loeschen() {
    if (!confirm(`"${ausgabe.bezeichnung}" wirklich löschen?`)) return;
    setPending(true);
    await deleteAusgabe(ausgabe.id, projectId);
    setPending(false);
    router.refresh();
  }

  return { pending, toggleBezahlt, setDatum, loeschen };
}

function BezahltAmFeld({
  ausgabe,
  pending,
  setDatum,
}: {
  ausgabe: Tables<"ausgaben">;
  pending: boolean;
  setDatum: (datum: string) => void;
}) {
  if (!ausgabe.bezahlt) return null;
  // Das Zahldatum bestimmt das Jahr — korrigierbar, falls spaeter abgehakt.
  return (
    <input
      type="date"
      aria-label="Bezahlt am"
      defaultValue={ausgabe.bezahlt_am ?? ""}
      onChange={(e) => setDatum(e.target.value)}
      disabled={pending}
      className="mt-1.5 block rounded-lg border border-line bg-surface px-2 py-1 text-xs text-ink-soft outline-none transition-colors focus:border-terracotta"
    />
  );
}

function AusgabeZeile({ ausgabe, projectId }: { ausgabe: Tables<"ausgaben">; projectId: string }) {
  const { pending, toggleBezahlt, setDatum, loeschen } = useAusgabeAktionen(ausgabe, projectId);

  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-5 py-3.5">
        <p className="font-semibold text-ink">{ausgabe.bezeichnung}</p>
        <p className="text-xs text-ink-soft">{ausgabeArtLabel[ausgabe.art]}</p>
      </td>
      <td className="px-5 py-3.5 text-ink-soft">{ausgabeKategorieLabel[ausgabe.kategorie]}</td>
      <td className="px-5 py-3.5 text-ink-soft">{formatDate(ausgabe.faellig_am)}</td>
      <td className="px-5 py-3.5 text-right font-semibold text-ink">{formatCurrency(ausgabe.betrag)}</td>
      <td className="px-5 py-3.5">
        <button onClick={toggleBezahlt} disabled={pending}>
          <Badge tone={ausgabe.bezahlt ? "success" : "warning"} className="cursor-pointer">
            {ausgabe.bezahlt ? "Bezahlt" : "Offen"}
          </Badge>
        </button>
        <BezahltAmFeld ausgabe={ausgabe} pending={pending} setDatum={setDatum} />
      </td>
      <td className="px-5 py-3.5 text-right">
        <button
          onClick={loeschen}
          disabled={pending}
          className="text-ink-soft transition-colors hover:text-danger"
          title="Löschen"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

function AusgabeKarte({ ausgabe, projectId }: { ausgabe: Tables<"ausgaben">; projectId: string }) {
  const { pending, toggleBezahlt, setDatum, loeschen } = useAusgabeAktionen(ausgabe, projectId);

  return (
    <div className="rounded-2xl border border-line bg-surface shadow-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{ausgabe.bezeichnung}</p>
          <p className="text-xs text-ink-soft">
            {ausgabeArtLabel[ausgabe.art]} · {ausgabeKategorieLabel[ausgabe.kategorie]}
          </p>
        </div>
        <button
          onClick={loeschen}
          disabled={pending}
          className="shrink-0 text-ink-soft transition-colors hover:text-danger"
          title="Löschen"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold text-ink">{formatCurrency(ausgabe.betrag)}</p>
          {ausgabe.faellig_am && (
            <p className="text-xs text-ink-soft">Fällig {formatDate(ausgabe.faellig_am)}</p>
          )}
        </div>
        <div className="text-right">
          <button onClick={toggleBezahlt} disabled={pending}>
            <Badge tone={ausgabe.bezahlt ? "success" : "warning"} className="cursor-pointer">
              {ausgabe.bezahlt ? "Bezahlt" : "Offen"}
            </Badge>
          </button>
          <BezahltAmFeld ausgabe={ausgabe} pending={pending} setDatum={setDatum} />
        </div>
      </div>
    </div>
  );
}

function NewAusgabeForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bezeichnung, setBezeichnung] = useState("");
  const [betrag, setBetrag] = useState("");
  const [kategorie, setKategorie] = useState<Enums<"ausgabe_kategorie">>("handwerker");
  const [art, setArt] = useState<Enums<"ausgabe_art">>("einzel");
  const [faelligAm, setFaelligAm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function reset() {
    setBezeichnung("");
    setBetrag("");
    setKategorie("handwerker");
    setArt("einzel");
    setFaelligAm("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await createAusgabe({ projectId, bezeichnung, betrag, kategorie, art, faelligAm });
    setPending(false);

    if (result.status === "error") {
      setError(result.message);
      return;
    }
    reset();
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="self-start">
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Ausgabe erfassen
      </Button>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-lg font-bold text-ink">Neue Ausgabe</p>
        <button type="button" onClick={() => { reset(); setOpen(false); }} className="text-ink-soft hover:text-ink">
          <X className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Bezeichnung" htmlFor="ausg-bezeichnung" className="sm:col-span-2">
          <Input id="ausg-bezeichnung" required value={bezeichnung} onChange={(e) => setBezeichnung(e.target.value)} placeholder="z. B. Abschlagsrechnung Dachdecker" />
        </Field>
        <Field label="Betrag" htmlFor="ausg-betrag" hint="In Euro">
          <Input id="ausg-betrag" type="number" min="0" step="0.01" required value={betrag} onChange={(e) => setBetrag(e.target.value)} />
        </Field>
        <Field label="Fällig am" htmlFor="ausg-faellig" hint="Optional">
          <Input id="ausg-faellig" type="date" value={faelligAm} onChange={(e) => setFaelligAm(e.target.value)} />
        </Field>
        <Field label="Kategorie" htmlFor="ausg-kategorie">
          <Select id="ausg-kategorie" value={kategorie} onChange={(e) => setKategorie(e.target.value as Enums<"ausgabe_kategorie">)}>
            {Object.entries(ausgabeKategorieLabel).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Art" htmlFor="ausg-art">
          <Select id="ausg-art" value={art} onChange={(e) => setArt(e.target.value as Enums<"ausgabe_art">)}>
            {Object.entries(ausgabeArtLabel).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </Field>

        {error && <p className="text-sm font-medium text-danger sm:col-span-2">{error}</p>}

        <Button type="submit" disabled={pending} className="sm:col-span-2 sm:w-fit">
          {pending ? "Wird gespeichert…" : "Ausgabe speichern"}
        </Button>
      </form>
    </Card>
  );
}
