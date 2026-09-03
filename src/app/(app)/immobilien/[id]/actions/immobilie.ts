"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/types";
import type { Enums } from "@/lib/supabase/database.types";

export async function updateProperty(input: {
  propertyId: string;
  name: string;
  adresse: string;
  typ: Enums<"gebaeude_typ"> | "";
  status: Enums<"immobilie_status">;
}): Promise<ActionResult> {
  const name = input.name.trim();
  const adresse = input.adresse.trim();

  if (!name) return { status: "error", message: "Bitte einen Namen angeben." };
  if (!adresse) return { status: "error", message: "Bitte eine Adresse angeben." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("properties")
    .update({
      name,
      adresse,
      typ: input.typ || null,
      status: input.status,
      geaendert_am: new Date().toISOString(),
    })
    .eq("id", input.propertyId);

  if (error) {
    return { status: "error", message: "Die Immobilie konnte nicht gespeichert werden." };
  }

  revalidatePath(`/immobilien/${input.propertyId}`);
  revalidatePath("/immobilien");
  revalidatePath("/uebersicht");
  return { status: "ok", id: input.propertyId };
}
