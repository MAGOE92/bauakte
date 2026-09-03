"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { submitAngebotPerLink } from "./actions";

export function AngebotForm({ token }: { token: string }) {
  const [firmenname, setFirmenname] = useState("");
  const [ansprechpartner, setAnsprechpartner] = useState("");
  const [email, setEmail] = useState("");
  const [telefon, setTelefon] = useState("");
  const [betrag, setBetrag] = useState("");
  const [notiz, setNotiz] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [abgeschickt, setAbgeschickt] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);

    const result = await submitAngebotPerLink({
      token,
      firmenname,
      ansprechpartner,
      email,
      telefon,
      betrag,
      notiz,
    });
    setPending(false);

    if (result.status === "error") {
      setError(result.message);
      return;
    }
    setAbgeschickt(true);
  }

  if (abgeschickt) {
    return (
      <Card className="flex flex-col items-center gap-2 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success">
          <Check className="h-5 w-5" strokeWidth={2.25} />
        </span>
        <p className="font-display text-lg font-bold text-ink">Angebot übermittelt</p>
        <p className="max-w-sm text-sm text-ink-soft">
          Vielen Dank. Der Bauherr sieht Ihr Angebot direkt im Projekt und meldet sich bei Ihnen zurück.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <p className="font-display mb-1 text-lg font-bold text-ink">Ihr Angebot</p>
      <p className="mb-4 text-sm text-ink-soft">
        Kein Login nötig — Ihr Angebot landet direkt und nachvollziehbar beim Bauherrn.
      </p>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Firma" htmlFor="ang-firma">
          <Input
            id="ang-firma"
            required
            value={firmenname}
            onChange={(e) => setFirmenname(e.target.value)}
            placeholder="Firmenname"
          />
        </Field>
        <Field label="Ansprechpartner" htmlFor="ang-ap" hint="Optional">
          <Input id="ang-ap" value={ansprechpartner} onChange={(e) => setAnsprechpartner(e.target.value)} />
        </Field>
        <Field label="E-Mail" htmlFor="ang-email">
          <Input
            id="ang-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Telefon" htmlFor="ang-tel" hint="Optional">
          <Input id="ang-tel" type="tel" value={telefon} onChange={(e) => setTelefon(e.target.value)} />
        </Field>
        <Field label="Angebotssumme" htmlFor="ang-betrag" hint="In Euro">
          <Input
            id="ang-betrag"
            type="number"
            min="0"
            step="0.01"
            required
            value={betrag}
            onChange={(e) => setBetrag(e.target.value)}
          />
        </Field>
        <Field label="Notiz" htmlFor="ang-notiz" hint="Optional" className="sm:col-span-2">
          <Textarea
            id="ang-notiz"
            value={notiz}
            onChange={(e) => setNotiz(e.target.value)}
            placeholder="z. B. Leistungsumfang, Ausführungszeitraum"
          />
        </Field>

        {error && <p className="text-sm font-medium text-danger sm:col-span-2">{error}</p>}

        <Button type="submit" disabled={pending} className="sm:col-span-2 sm:w-fit">
          {pending ? "Wird übermittelt…" : "Angebot absenden"}
        </Button>
      </form>
    </Card>
  );
}
