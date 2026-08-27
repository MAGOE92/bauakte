"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { signIn, signUp } from "./actions";

type Mode = "login" | "register";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setPending(true);

    const result = mode === "login" ? await signIn(email, password) : await signUp(email, password);

    setPending(false);

    if (result.status === "error") {
      setError(result.message);
      return;
    }
    if (result.status === "check-email") {
      setInfo("Fast geschafft! Wir haben dir einen Bestätigungslink per E-Mail geschickt.");
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta font-display text-lg font-extrabold text-white">
          B
        </span>
        <span className="font-display text-2xl font-extrabold text-ink">Bauakte</span>
      </div>

      <div className="mb-6 flex rounded-full border border-card-border bg-white p-1">
        <button
          type="button"
          onClick={() => {
            setMode("login");
            setError(null);
            setInfo(null);
          }}
          className={`flex-1 rounded-full py-2 text-sm font-bold transition-colors ${
            mode === "login" ? "bg-terracotta text-white" : "text-ink-soft"
          }`}
        >
          Anmelden
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("register");
            setError(null);
            setInfo(null);
          }}
          className={`flex-1 rounded-full py-2 text-sm font-bold transition-colors ${
            mode === "register" ? "bg-terracotta text-white" : "text-ink-soft"
          }`}
        >
          Registrieren
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="E-Mail-Adresse" htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
        <Field label="Passwort" htmlFor="password">
          <Input
            id="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {error && <p className="text-sm font-medium text-danger">{error}</p>}
        {info && <p className="text-sm font-medium text-success">{info}</p>}

        <Button type="submit" disabled={pending} className="mt-2 w-full">
          {pending ? "Einen Moment…" : mode === "login" ? "Anmelden" : "Konto erstellen"}
        </Button>
      </form>
    </div>
  );
}
