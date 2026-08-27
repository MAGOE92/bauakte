"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field, Input, Select } from "@/components/ui/Field";
import { gebaeudeTypLabel } from "@/lib/labels";
import type { Enums } from "@/lib/supabase/database.types";
import { createProperty } from "./actions";

export function NewPropertyForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [adresse, setAdresse] = useState("");
  const [typ, setTyp] = useState<Enums<"gebaeude_typ"> | "">("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function reset() {
    setName("");
    setAdresse("");
    setTyp("");
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const result = await createProperty({ name, adresse, typ });
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
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Immobilie anlegen
      </Button>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <div className="mb-4 flex items-center justify-between">
        <p className="font-display text-lg font-bold text-ink">Neue Immobilie</p>
        <button
          type="button"
          onClick={() => {
            reset();
            setOpen(false);
          }}
          className="text-ink-soft hover:text-ink"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Name" htmlFor="prop-name">
          <Input
            id="prop-name"
            required
            placeholder="z. B. Haus Musterweg"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Adresse" htmlFor="prop-adresse">
          <Input
            id="prop-adresse"
            required
            placeholder="Straße, PLZ, Ort"
            value={adresse}
            onChange={(e) => setAdresse(e.target.value)}
          />
        </Field>
        <Field label="Gebäudetyp" htmlFor="prop-typ">
          <Select
            id="prop-typ"
            value={typ}
            onChange={(e) => setTyp(e.target.value as Enums<"gebaeude_typ"> | "")}
          >
            <option value="">Nicht angegeben</option>
            {Object.entries(gebaeudeTypLabel).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        {error && <p className="text-sm font-medium text-danger">{error}</p>}

        <Button type="submit" disabled={pending} className="mt-1">
          {pending ? "Wird angelegt…" : "Immobilie speichern"}
        </Button>
      </form>
    </Card>
  );
}
