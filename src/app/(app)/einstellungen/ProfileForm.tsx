"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { updateProfile } from "./actions";

export function ProfileForm({ initialName, email }: { initialName: string; email: string }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSaved(false);

    const result = await updateProfile(name);
    setPending(false);

    if (result.status === "error") {
      setError(result.message);
      return;
    }
    setSaved(true);
    router.refresh();
  }

  return (
    <Card className="max-w-lg">
      <p className="font-display mb-4 text-lg font-bold text-ink">Profil</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Name" htmlFor="settings-name">
          <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="E-Mail-Adresse" htmlFor="settings-email" hint="Kann nicht geändert werden">
          <Input id="settings-email" value={email} disabled className="cursor-not-allowed opacity-60" />
        </Field>

        {error && <p className="text-sm font-medium text-danger">{error}</p>}
        {saved && !error && <p className="text-sm font-medium text-success">Gespeichert.</p>}

        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Wird gespeichert…" : "Speichern"}
        </Button>
      </form>
    </Card>
  );
}
