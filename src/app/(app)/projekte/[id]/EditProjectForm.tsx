"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { projektStatusLabel } from "@/lib/labels";
import type { Enums, Tables } from "@/lib/supabase/database.types";
import { updateProject } from "./actions/projekt";

export function EditProjectForm({ project }: { project: Tables<"projects"> }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(project.name);
  const [beschreibung, setBeschreibung] = useState(project.beschreibung ?? "");
  const [zeitraumVon, setZeitraumVon] = useState(project.zeitraum_von ?? "");
  const [zeitraumBis, setZeitraumBis] = useState(project.zeitraum_bis ?? "");
  const [budgetGesamt, setBudgetGesamt] = useState(String(project.budget_gesamt));
  const [status, setStatus] = useState<Enums<"projekt_status">>(project.status);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await updateProject({
      projectId: project.id,
      propertyId: project.property_id,
      name,
      beschreibung,
      zeitraumVon,
      zeitraumBis,
      budgetGesamt,
      status,
    });
    setPending(false);

    if (result.status === "error") {
      setError(result.message);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-sm font-semibold text-ink-soft transition-colors hover:border-terracotta hover:text-terracotta"
      >
        <Pencil className="h-3.5 w-3.5" strokeWidth={2.25} />
        Bearbeiten
      </button>
    );
  }

  return (
    <Modal title="Projekt bearbeiten" onClose={() => setOpen(false)}>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="edit-proj-name">
          <Input id="edit-proj-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Status" htmlFor="edit-proj-status">
          <Select id="edit-proj-status" value={status} onChange={(e) => setStatus(e.target.value as Enums<"projekt_status">)}>
            {Object.entries(projektStatusLabel).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Beschreibung" htmlFor="edit-proj-beschreibung" hint="Optional" className="sm:col-span-2">
          <Textarea id="edit-proj-beschreibung" value={beschreibung} onChange={(e) => setBeschreibung(e.target.value)} />
        </Field>
        <Field label="Beginn" htmlFor="edit-proj-von" hint="Optional">
          <Input id="edit-proj-von" type="date" value={zeitraumVon} onChange={(e) => setZeitraumVon(e.target.value)} />
        </Field>
        <Field label="Ende" htmlFor="edit-proj-bis" hint="Optional">
          <Input id="edit-proj-bis" type="date" value={zeitraumBis} onChange={(e) => setZeitraumBis(e.target.value)} />
        </Field>
        <Field
          label="Kostenrahmen"
          htmlFor="edit-proj-budget"
          hint="Was das Projekt kosten darf, in Euro — kein Guthaben"
        >
          <Input id="edit-proj-budget" type="number" min="0" step="0.01" value={budgetGesamt} onChange={(e) => setBudgetGesamt(e.target.value)} />
        </Field>

        {error && <p className="text-sm font-medium text-danger sm:col-span-2">{error}</p>}

        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Wird gespeichert…" : "Speichern"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Abbrechen
          </Button>
        </div>
      </form>
    </Modal>
  );
}
