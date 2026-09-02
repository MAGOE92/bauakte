"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X as XIcon, Plus, Ban, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { formatCurrency, formatDate } from "@/lib/format";
import { vergabeStatusLabel, vergabeStatusTone, angebotStatusLabel, angebotStatusTone } from "@/lib/labels";
import type { Tables } from "@/lib/supabase/database.types";
import { createAngebot, acceptAngebot, rejectAngebot, deleteAngebot } from "../actions/angebote";
import { createFirma } from "../actions/firmen";
import { verwerfeVergabe } from "../actions/vergaben";

type Firma = Tables<"firmen">;

export function VergabeCard({
  vergabe,
  projectId,
  angebote,
  firmen,
  firmenById,
}: {
  vergabe: Tables<"vergaben">;
  projectId: string;
  angebote: Tables<"angebote">[];
  firmen: Firma[];
  firmenById: Map<string, Firma>;
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-bold text-ink">{vergabe.titel}</p>
          <p className="mt-1 text-sm text-ink-soft">{vergabe.gewerk}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={vergabeStatusTone[vergabe.status]}>{vergabeStatusLabel[vergabe.status]}</Badge>
          {vergabe.status === "offen" && <VerwerfenButton vergabeId={vergabe.id} projectId={projectId} />}
        </div>
      </div>

      {vergabe.beschreibung && <p className="mt-3 text-sm text-ink-soft">{vergabe.beschreibung}</p>}
      {vergabe.bewerbungsfrist && (
        <p className="mt-2 text-xs font-semibold text-ink-soft">
          Bewerbungsfrist: {formatDate(vergabe.bewerbungsfrist)}
        </p>
      )}

      <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5">
        {angebote.length === 0 ? (
          <p className="text-sm text-ink-soft">Noch keine Angebote erfasst.</p>
        ) : (
          angebote.map((angebot) => (
            <AngebotRow key={angebot.id} angebot={angebot} projectId={projectId} firma={firmenById.get(angebot.firma_id)} />
          ))
        )}

        <NewAngebotForm projectId={projectId} vergabeId={vergabe.id} firmen={firmen} />
      </div>
    </Card>
  );
}

function VerwerfenButton({ vergabeId, projectId }: { vergabeId: string; projectId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!confirm("Diese Ausschreibung wirklich verwerfen?")) return;
    setPending(true);
    await verwerfeVergabe(vergabeId, projectId);
    setPending(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title="Ausschreibung verwerfen"
      className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-50"
    >
      <Ban className="h-3.5 w-3.5" />
    </button>
  );
}

function AngebotRow({
  angebot,
  projectId,
  firma,
}: {
  angebot: Tables<"angebote">;
  projectId: string;
  firma?: Firma;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleAccept() {
    setPending(true);
    await acceptAngebot(angebot.id, projectId);
    setPending(false);
    router.refresh();
  }

  async function handleReject() {
    setPending(true);
    await rejectAngebot(angebot.id, projectId);
    setPending(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Angebot von "${firma?.name ?? "dieser Firma"}" wirklich löschen?`)) return;
    setPending(true);
    await deleteAngebot(angebot.id, projectId);
    setPending(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl bg-sunken px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{firma?.name ?? "Unbekannte Firma"}</p>
        <p className="text-xs text-ink-soft">{formatCurrency(angebot.betrag)}</p>
      </div>
      <Badge tone={angebotStatusTone[angebot.status]}>{angebotStatusLabel[angebot.status]}</Badge>
      <div className="flex gap-2">
        {angebot.status === "eingegangen" && (
          <>
            <button
              onClick={handleAccept}
              disabled={pending}
              title="Annehmen"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-success-soft text-success transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={handleReject}
              disabled={pending}
              title="Ablehnen"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-danger-soft text-danger transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </>
        )}
        <button
          onClick={handleDelete}
          disabled={pending}
          title="Angebot löschen"
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function NewAngebotForm({
  projectId,
  vergabeId,
  firmen,
}: {
  projectId: string;
  vergabeId: string;
  firmen: Firma[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [creatingFirma, setCreatingFirma] = useState(false);
  const [firmaId, setFirmaId] = useState("");
  const [neueFirmaName, setNeueFirmaName] = useState("");
  const [neueFirmaGewerk, setNeueFirmaGewerk] = useState("");
  const [neueFirmaAnsprechpartner, setNeueFirmaAnsprechpartner] = useState("");
  const [neueFirmaEmail, setNeueFirmaEmail] = useState("");
  const [neueFirmaTelefon, setNeueFirmaTelefon] = useState("");
  const [betrag, setBetrag] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function reset() {
    setFirmaId("");
    setCreatingFirma(false);
    setNeueFirmaName("");
    setNeueFirmaGewerk("");
    setNeueFirmaAnsprechpartner("");
    setNeueFirmaEmail("");
    setNeueFirmaTelefon("");
    setBetrag("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    let resolvedFirmaId = firmaId;

    if (creatingFirma) {
      const firmaResult = await createFirma({
        name: neueFirmaName,
        gewerk: neueFirmaGewerk,
        ansprechpartner: neueFirmaAnsprechpartner,
        email: neueFirmaEmail,
        telefon: neueFirmaTelefon,
      });
      if (firmaResult.status === "error") {
        setPending(false);
        setError(firmaResult.message);
        return;
      }
      resolvedFirmaId = firmaResult.id;
    }

    const result = await createAngebot({ projectId, vergabeId, firmaId: resolvedFirmaId, betrag });
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
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)} className="self-start">
        <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
        Angebot erfassen
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-line p-4">
      {!creatingFirma ? (
        <Field label="Firma" htmlFor={`firma-${vergabeId}`}>
          <div className="flex gap-2">
            <Select
              id={`firma-${vergabeId}`}
              required
              value={firmaId}
              onChange={(e) => setFirmaId(e.target.value)}
              className="flex-1"
            >
              <option value="">Firma wählen…</option>
              {firmen.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </Select>
            <Button type="button" variant="secondary" size="sm" onClick={() => setCreatingFirma(true)}>
              Neu
            </Button>
          </div>
        </Field>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Neue Firma" htmlFor={`neue-firma-${vergabeId}`}>
            <Input
              id={`neue-firma-${vergabeId}`}
              required
              placeholder="Firmenname"
              value={neueFirmaName}
              onChange={(e) => setNeueFirmaName(e.target.value)}
            />
          </Field>
          <Field label="Gewerk" htmlFor={`neue-firma-gewerk-${vergabeId}`} hint="Optional">
            <Input
              id={`neue-firma-gewerk-${vergabeId}`}
              value={neueFirmaGewerk}
              onChange={(e) => setNeueFirmaGewerk(e.target.value)}
            />
          </Field>
          <Field label="Ansprechpartner" htmlFor={`neue-firma-ap-${vergabeId}`} hint="Optional">
            <Input
              id={`neue-firma-ap-${vergabeId}`}
              value={neueFirmaAnsprechpartner}
              onChange={(e) => setNeueFirmaAnsprechpartner(e.target.value)}
            />
          </Field>
          <Field label="Telefon" htmlFor={`neue-firma-tel-${vergabeId}`} hint="Optional">
            <Input
              id={`neue-firma-tel-${vergabeId}`}
              type="tel"
              value={neueFirmaTelefon}
              onChange={(e) => setNeueFirmaTelefon(e.target.value)}
            />
          </Field>
          <Field label="E-Mail" htmlFor={`neue-firma-email-${vergabeId}`} hint="Optional" className="sm:col-span-2">
            <Input
              id={`neue-firma-email-${vergabeId}`}
              type="email"
              value={neueFirmaEmail}
              onChange={(e) => setNeueFirmaEmail(e.target.value)}
            />
          </Field>
          <button
            type="button"
            onClick={() => setCreatingFirma(false)}
            className="text-left text-xs font-semibold text-terracotta hover:text-terracotta-hover sm:col-span-2"
          >
            Stattdessen bestehende Firma wählen
          </button>
        </div>
      )}

      <Field label="Betrag" htmlFor={`betrag-${vergabeId}`} hint="In Euro">
        <Input
          id={`betrag-${vergabeId}`}
          type="number"
          min="0"
          step="0.01"
          required
          value={betrag}
          onChange={(e) => setBetrag(e.target.value)}
        />
      </Field>

      {error && <p className="text-sm font-medium text-danger">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Wird gespeichert…" : "Angebot speichern"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => { reset(); setOpen(false); }}>
          Abbrechen
        </Button>
      </div>
    </form>
  );
}
