"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Link2, Ban, Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input } from "@/components/ui/Field";
import { formatDate } from "@/lib/format";
import type { Tables } from "@/lib/supabase/database.types";
import { createFreigabe, revokeFreigabe } from "../actions/freigaben";

export function FreigabenSection({
  projectId,
  freigaben,
}: {
  projectId: string;
  freigaben: Tables<"freigaben">[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <NewFreigabeForm projectId={projectId} />

      {!freigaben.length ? (
        <EmptyState
          title="Noch keine Freigabe erstellt"
          description="Erstelle einen zeitlich befristeten Link, z. B. für deine Bank."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-card-border bg-white">
          {freigaben.map((f, index) => (
            <FreigabeRow key={f.id} freigabe={f} projectId={projectId} isLast={index === freigaben.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function freigabeStatus(freigabe: Tables<"freigaben">) {
  if (freigabe.widerrufen_am) return { label: "Widerrufen", tone: "danger" as const };
  if (new Date(freigabe.laeuft_ab_am).getTime() < Date.now()) return { label: "Abgelaufen", tone: "neutral" as const };
  return { label: "Aktiv", tone: "success" as const };
}

function FreigabeRow({
  freigabe,
  projectId,
  isLast,
}: {
  freigabe: Tables<"freigaben">;
  projectId: string;
  isLast: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const status = freigabeStatus(freigabe);
  const active = status.label === "Aktiv";

  async function handleCopy() {
    const url = `${window.location.origin}/freigabe/${freigabe.token}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRevoke() {
    if (!confirm(`Freigabe für "${freigabe.empfaenger_name}" wirklich widerrufen?`)) return;
    setPending(true);
    await revokeFreigabe(freigabe.id, projectId);
    setPending(false);
    router.refresh();
  }

  return (
    <div className={`flex flex-wrap items-center gap-4 px-5 py-4 ${!isLast ? "border-b border-card-border" : ""}`}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{freigabe.empfaenger_name}</p>
        <p className="mt-0.5 text-xs text-ink-soft">
          {freigabe.empfaenger_email && `${freigabe.empfaenger_email} · `}
          Gültig bis {formatDate(freigabe.laeuft_ab_am)}
        </p>
      </div>
      <Badge tone={status.tone}>{status.label}</Badge>
      <button
        onClick={handleCopy}
        disabled={!active}
        title="Link kopieren"
        className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-cream-soft hover:text-terracotta disabled:opacity-40"
      >
        {copied ? <Check className="h-4 w-4 text-success" /> : <Link2 className="h-4 w-4" />}
      </button>
      <button
        onClick={handleRevoke}
        disabled={!active || pending}
        title="Widerrufen"
        className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-40"
      >
        <Ban className="h-4 w-4" />
      </button>
    </div>
  );
}

function NewFreigabeForm({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [empfaengerName, setEmpfaengerName] = useState("");
  const [empfaengerEmail, setEmpfaengerEmail] = useState("");
  const [gueltigkeitTage, setGueltigkeitTage] = useState("30");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function reset() {
    setEmpfaengerName("");
    setEmpfaengerEmail("");
    setGueltigkeitTage("30");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await createFreigabe({ projectId, empfaengerName, empfaengerEmail, gueltigkeitTage });
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
        Freigabe erstellen
      </Button>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-lg font-bold text-ink">Neue Freigabe</p>
        <button type="button" onClick={() => { reset(); setOpen(false); }} className="text-ink-soft hover:text-ink">
          <X className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Empfänger" htmlFor="frg-name">
          <Input id="frg-name" required value={empfaengerName} onChange={(e) => setEmpfaengerName(e.target.value)} placeholder="z. B. Sparkasse Fulda" />
        </Field>
        <Field label="E-Mail" htmlFor="frg-email" hint="Optional">
          <Input id="frg-email" type="email" value={empfaengerEmail} onChange={(e) => setEmpfaengerEmail(e.target.value)} />
        </Field>
        <Field label="Gültig für (Tage)" htmlFor="frg-tage">
          <Input id="frg-tage" type="number" min="1" required value={gueltigkeitTage} onChange={(e) => setGueltigkeitTage(e.target.value)} />
        </Field>

        {error && <p className="text-sm font-medium text-danger sm:col-span-2">{error}</p>}

        <Button type="submit" disabled={pending} className="sm:col-span-2 sm:w-fit">
          {pending ? "Wird erstellt…" : "Freigabe erstellen"}
        </Button>
      </form>
    </Card>
  );
}
