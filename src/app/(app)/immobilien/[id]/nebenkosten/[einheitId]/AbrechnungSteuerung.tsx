"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Printer } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

/**
 * Zeitraum waehlen und drucken. Das PDF erzeugt der Browser selbst
 * ("Als PDF sichern" im Druckdialog) — damit bleibt die Abrechnung ein echtes
 * Dokument mit auswaehlbarem Text, ohne zusaetzliche Bibliothek.
 */
export function AbrechnungSteuerung({
  basisPfad,
  von,
  bis,
}: {
  basisPfad: string;
  von: string;
  bis: string;
}) {
  const router = useRouter();
  const [neuesVon, setNeuesVon] = useState(von);
  const [neuesBis, setNeuesBis] = useState(bis);

  const geaendert = neuesVon !== von || neuesBis !== bis;

  function uebernehmen(e: React.FormEvent) {
    e.preventDefault();
    router.push(`${basisPfad}?von=${neuesVon}&bis=${neuesBis}`);
  }

  return (
    <div data-drucken="aus" className="mb-8">
      <Card>
        <form onSubmit={uebernehmen} className="flex flex-wrap items-end gap-4">
          <Field
            label="Abrechnungszeitraum von"
            htmlFor="nk-von"
            className="w-44"
          >
            <Input
              id="nk-von"
              type="date"
              required
              value={neuesVon}
              onChange={(e) => setNeuesVon(e.target.value)}
            />
          </Field>
          <Field label="bis" htmlFor="nk-bis" className="w-44">
            <Input
              id="nk-bis"
              type="date"
              required
              value={neuesBis}
              onChange={(e) => setNeuesBis(e.target.value)}
            />
          </Field>

          <Button type="submit" variant="secondary" disabled={!geaendert}>
            Zeitraum übernehmen
          </Button>

          <Button
            type="button"
            onClick={() => window.print()}
            className="ml-auto"
          >
            <Printer className="h-4 w-4" strokeWidth={2.5} />
            Als PDF speichern
          </Button>
        </form>
      </Card>
    </div>
  );
}
