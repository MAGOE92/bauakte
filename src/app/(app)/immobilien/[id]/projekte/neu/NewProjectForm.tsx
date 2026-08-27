"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { createProject } from "./actions";

export function NewProjectForm({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [zeitraumVon, setZeitraumVon] = useState("");
  const [zeitraumBis, setZeitraumBis] = useState("");
  const [budgetGesamt, setBudgetGesamt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await createProject({
      propertyId,
      name,
      beschreibung,
      zeitraumVon,
      zeitraumBis,
      budgetGesamt,
    });

    setPending(false);

    if (result.status === "error") {
      setError(result.message);
      return;
    }
    router.push(`/projekte/${result.id}`);
  }

  return (
    <Card className="max-w-xl">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <Field label="Name" htmlFor="proj-name">
          <Input
            id="proj-name"
            required
            placeholder="z. B. Dachsanierung"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field label="Beschreibung" htmlFor="proj-beschreibung" hint="Optional">
          <Textarea
            id="proj-beschreibung"
            placeholder="Worum geht es in diesem Projekt?"
            value={beschreibung}
            onChange={(e) => setBeschreibung(e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Beginn" htmlFor="proj-von" hint="Optional">
            <Input
              id="proj-von"
              type="date"
              value={zeitraumVon}
              onChange={(e) => setZeitraumVon(e.target.value)}
            />
          </Field>
          <Field label="Ende" htmlFor="proj-bis" hint="Optional">
            <Input
              id="proj-bis"
              type="date"
              value={zeitraumBis}
              onChange={(e) => setZeitraumBis(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Budget" htmlFor="proj-budget" hint="In Euro">
          <Input
            id="proj-budget"
            type="number"
            min="0"
            step="0.01"
            inputMode="decimal"
            placeholder="0,00"
            value={budgetGesamt}
            onChange={(e) => setBudgetGesamt(e.target.value)}
          />
        </Field>

        {error && <p className="text-sm font-medium text-danger">{error}</p>}

        <Button type="submit" disabled={pending} className="mt-1">
          {pending ? "Wird angelegt…" : "Projekt anlegen"}
        </Button>
      </form>
    </Card>
  );
}
