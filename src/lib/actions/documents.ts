"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/types";

export async function createDocument(input: {
  propertyId: string;
  projectId?: string | null;
  name: string;
  kategorie: string;
  storagePfad: string;
  dateiTyp: string | null;
  dateiGroesseBytes: number;
  revalidate: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Bitte melde dich erneut an." };

  const { data, error } = await supabase
    .from("documents")
    .insert({
      property_id: input.propertyId,
      project_id: input.projectId ?? null,
      name: input.name,
      kategorie: input.kategorie,
      datei_typ: input.dateiTyp,
      datei_groesse_bytes: input.dateiGroesseBytes,
      storage_pfad: input.storagePfad,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { status: "error", message: "Das Dokument konnte nicht gespeichert werden." };
  }

  revalidatePath(input.revalidate);
  return { status: "ok", id: data.id };
}

export async function deleteDocument(
  documentId: string,
  storagePfad: string,
  revalidate: string
): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  const supabase = await createClient();

  const { error: storageError } = await supabase.storage.from("unterlagen").remove([storagePfad]);
  if (storageError) {
    return { status: "error", message: "Die Datei konnte nicht gelöscht werden." };
  }

  const { error } = await supabase.from("documents").delete().eq("id", documentId);
  if (error) {
    return { status: "error", message: "Das Dokument konnte nicht gelöscht werden." };
  }

  revalidatePath(revalidate);
  return { status: "ok" };
}
