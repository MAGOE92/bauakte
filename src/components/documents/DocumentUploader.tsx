"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { createClient } from "@/lib/supabase/client";
import { sanitizeFileName } from "@/lib/utils";
import { createDocument } from "@/lib/actions/documents";

export function DocumentUploader({
  propertyId,
  projectId,
  categories,
  revalidate,
}: {
  propertyId: string;
  projectId?: string | null;
  categories: readonly string[];
  revalidate: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [category, setCategory] = useState(categories[0] ?? "Sonstiges");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Bitte wähle eine Datei aus.");
      return;
    }

    setPending(true);
    setError(null);

    const supabase = createClient();
    const path = `${propertyId}/${crypto.randomUUID()}-${sanitizeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage.from("unterlagen").upload(path, file, {
      contentType: file.type || undefined,
    });

    if (uploadError) {
      setPending(false);
      setError("Die Datei konnte nicht hochgeladen werden.");
      return;
    }

    const result = await createDocument({
      propertyId,
      projectId,
      name: file.name,
      kategorie: category,
      storagePfad: path,
      dateiTyp: file.type || null,
      dateiGroesseBytes: file.size,
      revalidate,
    });

    setPending(false);

    if (result.status === "error") {
      await supabase.storage.from("unterlagen").remove([path]);
      setError(result.message);
      return;
    }

    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-2xl border border-dashed border-card-border bg-white p-5 sm:flex-row sm:items-end sm:gap-3"
    >
      <Field label="Kategorie" htmlFor="doc-kategorie" className="sm:w-48">
        <Select id="doc-kategorie" value={category} onChange={(e) => setCategory(e.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Datei" htmlFor="doc-datei" className="flex-1" error={error ?? undefined}>
        <Input
          id="doc-datei"
          ref={inputRef}
          type="file"
          required
          className="cursor-pointer file:mr-3 file:rounded-full file:border-0 file:bg-terracotta-soft file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-terracotta-hover"
        />
      </Field>

      <Button type="submit" disabled={pending} className="shrink-0">
        <Upload className="h-4 w-4" strokeWidth={2.5} />
        {pending ? "Lädt hoch…" : "Hochladen"}
      </Button>
    </form>
  );
}
