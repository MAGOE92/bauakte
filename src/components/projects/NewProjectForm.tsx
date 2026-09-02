"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Field";
import { createProject } from "@/lib/actions/projekte";

type ImmobilienOption = { id: string; name: string };

/**
 * Wird aus zwei Richtungen benutzt:
 *   - aus einer Immobilie heraus: die Immobilie steht fest (propertyId)
 *   - aus der Projektliste heraus: der Nutzer waehlt sie erst aus (properties)
 * Deshalb die Union — beides gleichzeitig ergaebe keinen Sinn.
 */
type Props =
  | { propertyId: string; properties?: never }
  | { properties: ImmobilienOption[]; propertyId?: never };

export function NewProjectForm(props: Props) {
  const router = useRouter();
  const auswahlNoetig = props.propertyId === undefined;

  const [propertyId, setPropertyId] = useState(
    props.propertyId ?? props.properties?.[0]?.id ?? ""
  );
  const [name, setName] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [zeitraumVon, setZeitraumVon] = useState("");
  const [zeitraumBis, setZeitraumBis] = useState("");
  const [budgetGesamt, setBudgetGesamt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!propertyId) {
      setError("Bitte eine Immobilie auswählen.");
      return;
    }

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
        {auswahlNoetig && (
          <Field label="Immobilie" htmlFor="proj-immobilie">
            <Select
              id="proj-immobilie"
              required
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            >
              {props.properties.map((immobilie) => (
                <option key={immobilie.id} value={immobilie.id}>
                  {immobilie.name}
                </option>
              ))}
            </Select>
          </Field>
        )}

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
