"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/supabase/database.types";
import type { ActionResult } from "@/lib/actions/types";

export type { ActionResult };

export async function createProperty(input: {
  name: string;
  adresse: string;
  typ: Enums<"gebaeude_typ"> | "";
}): Promise<ActionResult> {
  const name = input.name.trim();
  const adresse = input.adresse.trim();

  if (!name) return { status: "error", message: "Bitte einen Namen angeben." };
  if (!adresse) return { status: "error", message: "Bitte eine Adresse angeben." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Bitte melde dich erneut an." };

  const { data, error } = await supabase
    .from("properties")
    .insert({
      owner_id: user.id,
      name,
      adresse,
      typ: input.typ || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { status: "error", message: "Die Immobilie konnte nicht angelegt werden." };
  }

  revalidatePath("/immobilien");
  revalidatePath("/uebersicht");
  return { status: "ok", id: data.id };
}
