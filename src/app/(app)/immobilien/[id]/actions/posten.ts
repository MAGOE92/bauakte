"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/types";
import type { Enums } from "@/lib/supabase/database.types";

export type PostenEingabe = {
  propertyId: string;
  einheitId: string;
  art: Enums<"posten_art">;
  bezeichnung: string;
  betrag: string;
  turnus: Enums<"turnus">;
  kategorie: Enums<"laufend_kategorie">;
  umlagefaehig: boolean;
  giltAb: string;
  giltBis: string;
  notizen: string;
};

type Geprueft = {
  bezeichnung: string;
  betrag: number;
  gilt_ab: string;
  gilt_bis: string | null;
};

function pruefe(input: PostenEingabe): Geprueft | { message: string } {
  const bezeichnung = input.bezeichnung.trim();
  if (!bezeichnung) return { message: "Bitte eine Bezeichnung angeben." };

  const betrag = Number(input.betrag.trim().replace(",", "."));
  if (Number.isNaN(betrag) || betrag <= 0) {
    return { message: "Bitte einen gültigen Betrag angeben." };
  }

  const gilt_ab = input.giltAb || new Date().toISOString().slice(0, 10);
  const gilt_bis = input.giltBis || null;
  if (gilt_bis && gilt_bis < gilt_ab) {
    return { message: "Das Enddatum liegt vor dem Startdatum." };
  }

  return { bezeichnung, betrag, gilt_ab, gilt_bis };
}

export async function createLaufendenPosten(input: PostenEingabe): Promise<ActionResult> {
  const geprueft = pruefe(input);
  if ("message" in geprueft) return { status: "error", message: geprueft.message };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("laufende_posten")
    .insert({
      property_id: input.propertyId,
      einheit_id: input.einheitId || null,
      art: input.art,
      turnus: input.turnus,
      kategorie: input.kategorie,
      umlagefaehig: input.art === "ausgabe" ? input.umlagefaehig : false,
      notizen: input.notizen.trim() || null,
      ...geprueft,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { status: "error", message: "Der Posten konnte nicht gespeichert werden." };
  }

  revalidatePath(`/immobilien/${input.propertyId}`);
  return { status: "ok", id: data.id };
}

export async function updateLaufendenPosten(
  postenId: string,
  input: PostenEingabe
): Promise<ActionResult> {
  const geprueft = pruefe(input);
  if ("message" in geprueft) return { status: "error", message: geprueft.message };

  const supabase = await createClient();
  const { error } = await supabase
    .from("laufende_posten")
    .update({
      einheit_id: input.einheitId || null,
      art: input.art,
      turnus: input.turnus,
      kategorie: input.kategorie,
      umlagefaehig: input.art === "ausgabe" ? input.umlagefaehig : false,
      notizen: input.notizen.trim() || null,
      geaendert_am: new Date().toISOString(),
      ...geprueft,
    })
    .eq("id", postenId);

  if (error) {
    return { status: "error", message: "Der Posten konnte nicht gespeichert werden." };
  }

  revalidatePath(`/immobilien/${input.propertyId}`);
  return { status: "ok", id: postenId };
}

export async function deleteLaufendenPosten(
  postenId: string,
  propertyId: string
): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("laufende_posten").delete().eq("id", postenId);
  if (error) return { status: "error", message: "Der Posten konnte nicht gelöscht werden." };

  revalidatePath(`/immobilien/${propertyId}`);
  return { status: "ok" };
}
