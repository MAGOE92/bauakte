"use server";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/types";

export async function createFirma(input: {
  name: string;
  gewerk: string;
  ansprechpartner: string;
  email: string;
  telefon: string;
}): Promise<ActionResult> {
  const name = input.name.trim();
  if (!name) return { status: "error", message: "Bitte einen Firmennamen angeben." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "error", message: "Bitte melde dich erneut an." };

  const { data, error } = await supabase
    .from("firmen")
    .insert({
      owner_id: user.id,
      name,
      gewerk: input.gewerk.trim() || null,
      ansprechpartner: input.ansprechpartner.trim() || null,
      email: input.email.trim() || null,
      telefon: input.telefon.trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { status: "error", message: "Die Firma konnte nicht angelegt werden." };
  }

  return { status: "ok", id: data.id };
}
