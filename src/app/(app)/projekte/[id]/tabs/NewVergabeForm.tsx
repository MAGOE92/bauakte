"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { createVergabe } from "../actions/vergaben";

type DocOption = { id: string; name: string; kategorie: string };

export function NewVergabeForm({ projectId, documents }: { projectId: string; documents: DocOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [titel, setTitel] = useState("");
  const [gewerk, setGewerk] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [bewerbungsfrist, setBewerbungsfrist] = useState("");
  const [dokumentIds, setDokumentIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function reset() {
    setTitel("");
    setGewerk("");
    setBeschreibung("");
    setBewerbungsfrist("");
    setDokumentIds([]);
    setError(null);
  }

  function toggleDoc(id: string) {
    setDokumentIds((prev) => (prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await createVergabe({ projectId, titel, gewerk, beschreibung, bewerbungsfrist, dokumentIds });
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
        Ausschreibung erstellen
      </Button>
    );
  }

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-lg font-bold text-ink">Neue Ausschreibung</p>
        <button type="button" onClick={() => { reset(); setOpen(false); }} className="text-ink-soft hover:text-ink">
          <X className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Titel" htmlFor="verg-titel">
          <Input id="verg-titel" required value={titel} onChange={(e) => setTitel(e.target.value)} placeholder="z. B. Dacheindeckung" />
        </Field>
        <Field label="Gewerk" htmlFor="verg-gewerk">
          <Input id="verg-gewerk" required value={gewerk} onChange={(e) => setGewerk(e.target.value)} placeholder="z. B. Dachdecker" />
        </Field>
        <Field label="Beschreibung" htmlFor="verg-beschreibung" hint="Optional" className="sm:col-span-2">
          <Textarea id="verg-beschreibung" value={beschreibung} onChange={(e) => setBeschreibung(e.target.value)} />
        </Field>
        <Field label="Bewerbungsfrist" htmlFor="verg-frist" hint="Optional">
          <Input id="verg-frist" type="date" value={bewerbungsfrist} onChange={(e) => setBewerbungsfrist(e.target.value)} />
        </Field>

        <div className="sm:col-span-2">
          <p className="mb-2 text-sm font-semibold text-ink">Unterlagen für Bewerber freigeben</p>
          {documents.length === 0 ? (
            <p className="text-xs text-ink-soft">Noch keine Unterlagen vorhanden.</p>
          ) : (
            <div className="flex max-h-40 flex-col gap-2 overflow-y-auto rounded-xl border border-card-border p-3">
              {documents.map((doc) => (
                <label key={doc.id} className="flex items-center gap-2 text-sm text-ink">
                  <input
                    type="checkbox"
                    checked={dokumentIds.includes(doc.id)}
                    onChange={() => toggleDoc(doc.id)}
                    className="h-4 w-4 rounded border-card-border accent-terracotta"
                  />
                  {doc.name}
                  <span className="text-xs text-ink-soft">({doc.kategorie})</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {error && <p className="text-sm font-medium text-danger sm:col-span-2">{error}</p>}

        <Button type="submit" disabled={pending} className="sm:col-span-2 sm:w-fit">
          {pending ? "Wird erstellt…" : "Ausschreibung erstellen"}
        </Button>
      </form>
    </Card>
  );
}
