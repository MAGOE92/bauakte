"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Trash2, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Tables } from "@/lib/supabase/database.types";
import { createEinnahme, deleteEinnahme } from "../actions/einnahmen";

export function EinnahmenSection({
  projectId,
  einnahmen,
}: {
  projectId: string;
  einnahmen: Tables<"einnahmen">[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <NewEinnahmeForm projectId={projectId} />

      {!einnahmen.length ? (
        <EmptyState title="Noch keine Einnahmen erfasst" description="Erfasse z. B. Fördergelder oder Mieteinnahmen für dieses Projekt." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          {einnahmen.map((e, index) => (
            <EinnahmeRow key={e.id} einnahme={e} projectId={projectId} isLast={index === einnahmen.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function EinnahmeRow({
  einnahme,
  projectId,
  isLast,
}: {
  einnahme: Tables<"einnahmen">;
  projectId: string;
  isLast: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm(`"${einnahme.bezeichnung}" wirklich löschen?`)) return;
    setPending(true);
    await deleteEinnahme(einnahme.id, projectId);
    setPending(false);
    router.refresh();
  }

  return (
    <div className={`flex items-center gap-4 px-5 py-4 ${!isLast ? "border-b border-line" : ""}`}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
        <TrendingUp className="h-4 w-4" strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{einnahme.bezeichnung}</p>
        <p className="mt-0.5 text-xs text-ink-soft">
          {formatDate(einnahme.datum)}
          {einnahme.notizen ? ` · ${einnahme.notizen}` : ""}
        </p>
      </div>
      <p className="shrink-0 font-display font-bold text-success">{formatCurrency(einnahme.betrag)}</p>
      <button
        onClick={handleDelete}
        disabled={pending}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-50"
        title="Löschen"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function NewEinnahmeForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [bezeichnung, setBezeichnung] = useState("");
  const [betrag, setBetrag] = useState("");
  const [datum, setDatum] = useState("");
  const [notizen, setNotizen] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function reset() {
    setBezeichnung("");
    setBetrag("");
    setDatum("");
    setNotizen("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await createEinnahme({ projectId, bezeichnung, betrag, datum, notizen });
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
      <Button variant="secondary" onClick={() => setOpen(true)} className="self-start">
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Einnahme erfassen
      </Button>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-lg font-bold text-ink">Neue Einnahme</p>
        <button type="button" onClick={() => { reset(); setOpen(false); }} className="text-ink-soft hover:text-ink">
          <X className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Bezeichnung" htmlFor="einn-bezeichnung" className="sm:col-span-2">
          <Input id="einn-bezeichnung" required value={bezeichnung} onChange={(e) => setBezeichnung(e.target.value)} placeholder="z. B. KfW-Förderung" />
        </Field>
        <Field label="Betrag" htmlFor="einn-betrag" hint="In Euro">
          <Input id="einn-betrag" type="number" min="0" step="0.01" required value={betrag} onChange={(e) => setBetrag(e.target.value)} />
        </Field>
        <Field label="Datum" htmlFor="einn-datum" hint="Optional, sonst heute">
          <Input id="einn-datum" type="date" value={datum} onChange={(e) => setDatum(e.target.value)} />
        </Field>
        <Field label="Notizen" htmlFor="einn-notizen" hint="Optional" className="sm:col-span-2">
          <Textarea id="einn-notizen" value={notizen} onChange={(e) => setNotizen(e.target.value)} />
        </Field>

        {error && <p className="text-sm font-medium text-danger sm:col-span-2">{error}</p>}

        <Button type="submit" disabled={pending} className="sm:col-span-2 sm:w-fit">
          {pending ? "Wird gespeichert…" : "Einnahme speichern"}
        </Button>
      </form>
    </Card>
  );
}
