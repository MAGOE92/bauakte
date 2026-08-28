"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Mail, Phone, Pencil, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { freigabestufeLabel, freigabestufeTone } from "@/lib/labels";
import type { Tables } from "@/lib/supabase/database.types";
import { updateFirma } from "../actions/firmen";

export function ProjektFirmaCard({
  projektFirma,
  firma,
  projectId,
}: {
  projektFirma: Tables<"projekt_firmen">;
  firma?: Tables<"firmen">;
  projectId: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(firma?.name ?? "");
  const [gewerk, setGewerk] = useState(firma?.gewerk ?? "");
  const [ansprechpartner, setAnsprechpartner] = useState(firma?.ansprechpartner ?? "");
  const [email, setEmail] = useState(firma?.email ?? "");
  const [telefon, setTelefon] = useState(firma?.telefon ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firma) return;
    setPending(true);
    setError(null);

    const result = await updateFirma({
      firmaId: firma.id,
      projectId,
      name,
      gewerk,
      ansprechpartner,
      email,
      telefon,
    });
    setPending(false);

    if (result.status === "error") {
      setError(result.message);
      return;
    }
    setEditing(false);
    router.refresh();
  }

  if (editing && firma) {
    return (
      <form
        onSubmit={handleSubmit}
        className="grid w-full grid-cols-1 gap-3 rounded-xl border border-card-border bg-white p-4 sm:grid-cols-2"
      >
        <div className="flex items-center justify-between sm:col-span-2">
          <p className="font-display text-sm font-bold text-ink">Firma bearbeiten</p>
          <button type="button" onClick={() => setEditing(false)} className="text-ink-soft hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <Field label="Name" htmlFor={`firma-name-${firma.id}`}>
          <Input id={`firma-name-${firma.id}`} required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Gewerk" htmlFor={`firma-gewerk-${firma.id}`} hint="Optional">
          <Input id={`firma-gewerk-${firma.id}`} value={gewerk} onChange={(e) => setGewerk(e.target.value)} />
        </Field>
        <Field label="Ansprechpartner" htmlFor={`firma-ap-${firma.id}`} hint="Optional">
          <Input id={`firma-ap-${firma.id}`} value={ansprechpartner} onChange={(e) => setAnsprechpartner(e.target.value)} />
        </Field>
        <Field label="Telefon" htmlFor={`firma-tel-${firma.id}`} hint="Optional">
          <Input id={`firma-tel-${firma.id}`} type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} />
        </Field>
        <Field label="E-Mail" htmlFor={`firma-email-${firma.id}`} hint="Optional" className="sm:col-span-2">
          <Input id={`firma-email-${firma.id}`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>

        {error && <p className="text-sm font-medium text-danger sm:col-span-2">{error}</p>}

        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Wird gespeichert…" : "Speichern"}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)}>
            Abbrechen
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-card-border bg-white px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta-soft text-terracotta-hover">
        <Users className="h-4 w-4" strokeWidth={2.25} />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink">{firma?.name ?? "Firma"}</p>
        <p className="text-xs text-ink-soft">
          {projektFirma.gewerk ?? "—"}
          {firma?.ansprechpartner ? ` · ${firma.ansprechpartner}` : ""}
        </p>
        {(firma?.telefon || firma?.email) && (
          <p className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-ink-soft">
            {firma.telefon && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {firma.telefon}
              </span>
            )}
            {firma.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {firma.email}
              </span>
            )}
          </p>
        )}
      </div>
      <Badge tone={freigabestufeTone[projektFirma.freigabestufe]}>
        {freigabestufeLabel[projektFirma.freigabestufe]}
      </Badge>
      {firma && (
        <button
          onClick={() => setEditing(true)}
          title="Firma bearbeiten"
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-cream-soft hover:text-terracotta"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
