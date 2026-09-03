"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Field, Input, Select } from "@/components/ui/Field";
import { EmptyState } from "@/components/ui/EmptyState";
import { ausgabeKategorieLabel, ausgabeArtLabel } from "@/lib/labels";
import type { Enums } from "@/lib/supabase/database.types";
import { createAusgabe } from "@/app/(app)/projekte/[id]/actions/ausgaben";

type ImmobilieOption = { id: string; name: string };
type ProjektOption = { id: string; name: string; property_id: string };

/**
 * Erfasst eine Ausgabe direkt von der Uebersicht — ohne den Umweg
 * Immobilie -> Projekt -> Reiter -> "+". Genau der Weg, den man auf der
 * Baustelle mit einer Rechnung in der Hand nicht gehen will.
 */
export function QuickAusgabeButton({
  properties,
  projects,
}: {
  properties: ImmobilieOption[];
  projects: ProjektOption[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const projekteDerImmobilie = projects.filter((p) => p.property_id === propertyId);
  const [projectId, setProjectId] = useState(projekteDerImmobilie[0]?.id ?? "");

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

  function wechsleImmobilie(neueId: string) {
    setPropertyId(neueId);
    setProjectId(projects.find((p) => p.property_id === neueId)?.id ?? "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId) {
      setError("Bitte zuerst ein Projekt auswählen.");
      return;
    }

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

  if (!properties.length) return null;

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" variant="secondary">
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Ausgabe erfassen
      </Button>

      {open && (
        <Modal title="Ausgabe erfassen" onClose={() => setOpen(false)}>
          {!projects.length ? (
            <EmptyState
              title="Noch kein Projekt angelegt"
              description="Eine Ausgabe gehört immer zu einem Projekt — lege zuerst eins an."
            />
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Immobilie" htmlFor="qa-immobilie">
                <Select
                  id="qa-immobilie"
                  value={propertyId}
                  onChange={(e) => wechsleImmobilie(e.target.value)}
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Projekt" htmlFor="qa-projekt">
                {projekteDerImmobilie.length ? (
                  <Select id="qa-projekt" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                    {projekteDerImmobilie.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <p className="rounded-xl border border-line bg-sunken px-4 py-2.5 text-sm text-ink-soft">
                    Kein Projekt für diese Immobilie
                  </p>
                )}
              </Field>

              <Field label="Bezeichnung" htmlFor="qa-bezeichnung" className="sm:col-span-2">
                <Input
                  id="qa-bezeichnung"
                  required
                  value={bezeichnung}
                  onChange={(e) => setBezeichnung(e.target.value)}
                  placeholder="z. B. Abschlagsrechnung Dachdecker"
                />
              </Field>
              <Field label="Betrag" htmlFor="qa-betrag" hint="In Euro">
                <Input
                  id="qa-betrag"
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={betrag}
                  onChange={(e) => setBetrag(e.target.value)}
                />
              </Field>
              <Field label="Fällig am" htmlFor="qa-faellig" hint="Optional">
                <Input id="qa-faellig" type="date" value={faelligAm} onChange={(e) => setFaelligAm(e.target.value)} />
              </Field>
              <Field label="Kategorie" htmlFor="qa-kategorie">
                <Select
                  id="qa-kategorie"
                  value={kategorie}
                  onChange={(e) => setKategorie(e.target.value as Enums<"ausgabe_kategorie">)}
                >
                  {Object.entries(ausgabeKategorieLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Art" htmlFor="qa-art">
                <Select id="qa-art" value={art} onChange={(e) => setArt(e.target.value as Enums<"ausgabe_art">)}>
                  {Object.entries(ausgabeArtLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Select>
              </Field>

              {error && <p className="text-sm font-medium text-danger sm:col-span-2">{error}</p>}

              <Button type="submit" disabled={pending || !projectId} className="sm:col-span-2 sm:w-fit">
                {pending ? "Wird gespeichert…" : "Ausgabe speichern"}
              </Button>
            </form>
          )}
        </Modal>
      )}
    </>
  );
}
