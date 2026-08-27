"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { gebaeudeTypLabel, immobilieStatusLabel } from "@/lib/labels";
import type { Enums, Tables } from "@/lib/supabase/database.types";
import { updateProperty } from "./actions";

export function EditPropertyForm({ property }: { property: Tables<"properties"> }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(property.name);
  const [adresse, setAdresse] = useState(property.adresse);
  const [typ, setTyp] = useState<Enums<"gebaeude_typ"> | "">(property.typ ?? "");
  const [status, setStatus] = useState<Enums<"immobilie_status">>(property.status);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await updateProperty({ propertyId: property.id, name, adresse, typ, status });
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
        title="Immobilie bearbeiten"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-card-border text-ink-soft transition-colors hover:border-terracotta hover:text-terracotta"
      >
        <Pencil className="h-4 w-4" strokeWidth={2.25} />
      </button>
    );
  }

  return (
    <Card className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-lg font-bold text-ink">Immobilie bearbeiten</p>
        <button type="button" onClick={() => setOpen(false)} className="text-ink-soft hover:text-ink">
          <X className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="edit-prop-name">
          <Input id="edit-prop-name" required value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Adresse" htmlFor="edit-prop-adresse">
          <Input id="edit-prop-adresse" required value={adresse} onChange={(e) => setAdresse(e.target.value)} />
        </Field>
        <Field label="Gebäudetyp" htmlFor="edit-prop-typ">
          <Select id="edit-prop-typ" value={typ} onChange={(e) => setTyp(e.target.value as Enums<"gebaeude_typ"> | "")}>
            <option value="">Nicht angegeben</option>
            {Object.entries(gebaeudeTypLabel).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Status" htmlFor="edit-prop-status">
          <Select id="edit-prop-status" value={status} onChange={(e) => setStatus(e.target.value as Enums<"immobilie_status">)}>
            {Object.entries(immobilieStatusLabel).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </Select>
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
    </Card>
  );
}
