"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Link2, Ban, Check, Files, Folder } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Field, Input } from "@/components/ui/Field";
import { formatDate } from "@/lib/format";
import type { Tables } from "@/lib/supabase/database.types";
import { createFreigabe, revokeFreigabe, setFreigabeDokumente } from "../actions/freigaben";

export type FreigabeMitAuswahl = Tables<"freigaben"> & { documentIds: string[] };
export type FreigabeDokument = {
  id: string;
  name: string;
  kategorie: string;
  ordner_id: string | null;
};
export type FreigabeOrdner = { id: string; name: string };

export function FreigabenSection({
  projectId,
  freigaben,
  documents,
  ordner,
}: {
  projectId: string;
  freigaben: FreigabeMitAuswahl[];
  documents: FreigabeDokument[];
  ordner: FreigabeOrdner[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <NewFreigabeForm projectId={projectId} documents={documents} ordner={ordner} />

      {!freigaben.length ? (
        <EmptyState
          title="Noch keine Freigabe erstellt"
          description="Erstelle einen zeitlich befristeten Link, z. B. für deine Bank — und wähle dabei aus, welche Unterlagen er zeigt."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {freigaben.map((f) => (
            <FreigabeKarte
              key={f.id}
              freigabe={f}
              projectId={projectId}
              documents={documents}
              ordner={ordner}
            />
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

function FreigabeKarte({
  freigabe,
  projectId,
  documents,
  ordner,
}: {
  freigabe: FreigabeMitAuswahl;
  projectId: string;
  documents: FreigabeDokument[];
  ordner: FreigabeOrdner[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [copied, setCopied] = useState(false);
  const [bearbeiten, setBearbeiten] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);
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

  async function speichereAuswahl(ids: string[]) {
    setPending(true);
    setFehler(null);
    const ergebnis = await setFreigabeDokumente(freigabe.id, projectId, ids);
    setPending(false);

    if (ergebnis.status === "error") {
      setFehler(ergebnis.message);
      return;
    }
    setBearbeiten(false);
    router.refresh();
  }

  const anzahl = freigabe.documentIds.length;

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-4">
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
          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sunken hover:text-terracotta disabled:opacity-40"
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

      <div className="mt-4 border-t border-line pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm text-ink-soft">
            <Files className="h-4 w-4 shrink-0" />
            {anzahl === 0
              ? "Keine Unterlagen freigegeben — der Empfänger sieht nur die Zahlen."
              : anzahl === 1
                ? "1 Unterlage freigegeben"
                : `${anzahl} Unterlagen freigegeben`}
          </p>
          {active && !bearbeiten && (
            <Button variant="secondary" size="sm" onClick={() => setBearbeiten(true)}>
              Unterlagen ändern
            </Button>
          )}
        </div>

        {bearbeiten && (
          <div className="mt-4">
            <DokumentAuswahl
              documents={documents}
              ordner={ordner}
              initial={freigabe.documentIds}
              pending={pending}
              onAbbrechen={() => setBearbeiten(false)}
              onSpeichern={speichereAuswahl}
            />
            {fehler && <p className="mt-3 text-sm font-medium text-danger">{fehler}</p>}
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * Auswahlliste der Projektunterlagen, nach Ordnern gruppiert. Wird beim
 * Erstellen und beim nachtraeglichen Aendern einer Freigabe benutzt.
 */
function DokumentAuswahl({
  documents,
  ordner,
  initial,
  pending,
  onSpeichern,
  onAbbrechen,
}: {
  documents: FreigabeDokument[];
  ordner: FreigabeOrdner[];
  initial: string[];
  pending: boolean;
  onSpeichern: (ids: string[]) => void;
  onAbbrechen: () => void;
}) {
  const [ausgewaehlt, setAusgewaehlt] = useState<string[]>(initial);

  function umschalten(id: string) {
    setAusgewaehlt((vorher) =>
      vorher.includes(id) ? vorher.filter((v) => v !== id) : [...vorher, id]
    );
  }

  const gruppen = [
    { id: null as string | null, name: "Ohne Ordner" },
    ...ordner.map((o) => ({ id: o.id as string | null, name: o.name })),
  ].filter((gruppe) => documents.some((d) => (d.ordner_id ?? null) === gruppe.id));

  if (!documents.length) {
    return (
      <div className="rounded-xl border border-dashed border-line px-5 py-6 text-center text-sm text-ink-soft">
        Für dieses Projekt gibt es noch keine Unterlagen zum Freigeben.
        <div className="mt-3">
          <Button type="button" variant="secondary" size="sm" onClick={onAbbrechen}>
            Schließen
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-line bg-sunken p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">
          {ausgewaehlt.length} von {documents.length} ausgewählt
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAusgewaehlt(documents.map((d) => d.id))}
            className="text-xs font-bold text-terracotta hover:text-terracotta-hover"
          >
            Alle
          </button>
          <button
            type="button"
            onClick={() => setAusgewaehlt([])}
            className="text-xs font-bold text-ink-soft hover:text-ink"
          >
            Keine
          </button>
        </div>
      </div>

      <div className="flex max-h-72 flex-col gap-4 overflow-y-auto">
        {gruppen.map((gruppe) => (
          <div key={gruppe.id ?? "wurzel"}>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-soft">
              <Folder className="h-3.5 w-3.5" />
              {gruppe.name}
            </p>
            <div className="flex flex-col">
              {documents
                .filter((d) => (d.ordner_id ?? null) === gruppe.id)
                .map((doc) => (
                  <label
                    key={doc.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface"
                  >
                    <input
                      type="checkbox"
                      checked={ausgewaehlt.includes(doc.id)}
                      onChange={() => umschalten(doc.id)}
                      className="h-4 w-4 shrink-0 accent-[var(--bk-terracotta)]"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">{doc.name}</span>
                    <span className="shrink-0 text-xs text-ink-soft">{doc.kategorie}</span>
                  </label>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex gap-2">
        <Button type="button" size="sm" disabled={pending} onClick={() => onSpeichern(ausgewaehlt)}>
          {pending ? "Wird gespeichert…" : "Auswahl speichern"}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={onAbbrechen}>
          Abbrechen
        </Button>
      </div>
    </div>
  );
}

function NewFreigabeForm({
  projectId,
  documents,
  ordner,
}: {
  projectId: string;
  documents: FreigabeDokument[];
  ordner: FreigabeOrdner[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [empfaengerName, setEmpfaengerName] = useState("");
  const [empfaengerEmail, setEmpfaengerEmail] = useState("");
  const [gueltigkeitTage, setGueltigkeitTage] = useState("30");
  const [documentIds, setDocumentIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function reset() {
    setEmpfaengerName("");
    setEmpfaengerEmail("");
    setGueltigkeitTage("30");
    setDocumentIds([]);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await createFreigabe({
      projectId,
      empfaengerName,
      empfaengerEmail,
      gueltigkeitTage,
      documentIds,
    });
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

        <div className="sm:col-span-2">
          <p className="mb-1.5 text-sm font-semibold text-ink">Welche Unterlagen soll der Link zeigen?</p>
          <p className="mb-3 text-xs text-ink-soft">
            Nur was du hier ankreuzt, ist über den Link erreichbar. Ändern kannst du das später jederzeit.
          </p>
          {!documents.length ? (
            <p className="rounded-xl border border-dashed border-line px-5 py-4 text-sm text-ink-soft">
              Für dieses Projekt gibt es noch keine Unterlagen. Die Freigabe zeigt dann nur die Zahlen.
            </p>
          ) : (
            <DokumentCheckliste
              documents={documents}
              ordner={ordner}
              ausgewaehlt={documentIds}
              onAendern={setDocumentIds}
            />
          )}
        </div>

        {error && <p className="text-sm font-medium text-danger sm:col-span-2">{error}</p>}

        <Button type="submit" disabled={pending} className="sm:col-span-2 sm:w-fit">
          {pending ? "Wird erstellt…" : "Freigabe erstellen"}
        </Button>
      </form>
    </Card>
  );
}

/** Gesteuerte Variante der Auswahl — im Anlege-Formular gehoert der Stand dorthin. */
function DokumentCheckliste({
  documents,
  ordner,
  ausgewaehlt,
  onAendern,
}: {
  documents: FreigabeDokument[];
  ordner: FreigabeOrdner[];
  ausgewaehlt: string[];
  onAendern: (ids: string[]) => void;
}) {
  const gruppen = [
    { id: null as string | null, name: "Ohne Ordner" },
    ...ordner.map((o) => ({ id: o.id as string | null, name: o.name })),
  ].filter((gruppe) => documents.some((d) => (d.ordner_id ?? null) === gruppe.id));

  return (
    <div className="rounded-xl border border-line bg-sunken p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-ink">
          {ausgewaehlt.length} von {documents.length} ausgewählt
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onAendern(documents.map((d) => d.id))}
            className="text-xs font-bold text-terracotta hover:text-terracotta-hover"
          >
            Alle
          </button>
          <button
            type="button"
            onClick={() => onAendern([])}
            className="text-xs font-bold text-ink-soft hover:text-ink"
          >
            Keine
          </button>
        </div>
      </div>

      <div className="flex max-h-64 flex-col gap-4 overflow-y-auto">
        {gruppen.map((gruppe) => (
          <div key={gruppe.id ?? "wurzel"}>
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-soft">
              <Folder className="h-3.5 w-3.5" />
              {gruppe.name}
            </p>
            <div className="flex flex-col">
              {documents
                .filter((d) => (d.ordner_id ?? null) === gruppe.id)
                .map((doc) => (
                  <label
                    key={doc.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-surface"
                  >
                    <input
                      type="checkbox"
                      checked={ausgewaehlt.includes(doc.id)}
                      onChange={() =>
                        onAendern(
                          ausgewaehlt.includes(doc.id)
                            ? ausgewaehlt.filter((v) => v !== doc.id)
                            : [...ausgewaehlt, doc.id]
                        )
                      }
                      className="h-4 w-4 shrink-0 accent-[var(--bk-terracotta)]"
                    />
                    <span className="min-w-0 flex-1 truncate text-sm text-ink">{doc.name}</span>
                    <span className="shrink-0 text-xs text-ink-soft">{doc.kategorie}</span>
                  </label>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
