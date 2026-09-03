"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/types";
import type { Enums } from "@/lib/supabase/database.types";

export type EinheitEingabe = {
  propertyId: string;
  name: string;
  wohnflaeche: string;
  nutzung: Enums<"einheit_nutzung">;
  mieterName: string;
  notizen: string;
};

/** Wohnflaeche ist optional — leer heisst „noch nicht bekannt", nicht „0 qm". */
function leseWohnflaeche(wert: string): number | null | "ungueltig" {
  const getrimmt = wert.trim();
  if (!getrimmt) return null;
  const zahl = Number(getrimmt.replace(",", "."));
  if (Number.isNaN(zahl) || zahl <= 0) return "ungueltig";
  return zahl;
}

export async function createEinheit(input: EinheitEingabe): Promise<ActionResult> {
  const name = input.name.trim();
  if (!name) return { status: "error", message: "Bitte einen Namen für die Einheit angeben." };

  const wohnflaeche = leseWohnflaeche(input.wohnflaeche);
  if (wohnflaeche === "ungueltig") {
    return { status: "error", message: "Bitte eine gültige Wohnfläche in Quadratmetern angeben." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("einheiten")
    .insert({
      property_id: input.propertyId,
      name,
      wohnflaeche,
      nutzung: input.nutzung,
      mieter_name: input.mieterName.trim() || null,
      notizen: input.notizen.trim() || null,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { status: "error", message: "Die Wohneinheit konnte nicht gespeichert werden." };
  }

  revalidatePath(`/immobilien/${input.propertyId}`);
  return { status: "ok", id: data.id };
}

export async function updateEinheit(
  einheitId: string,
  input: EinheitEingabe
): Promise<ActionResult> {
  const name = input.name.trim();
  if (!name) return { status: "error", message: "Bitte einen Namen für die Einheit angeben." };

  const wohnflaeche = leseWohnflaeche(input.wohnflaeche);
  if (wohnflaeche === "ungueltig") {
    return { status: "error", message: "Bitte eine gültige Wohnfläche in Quadratmetern angeben." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("einheiten")
    .update({
      name,
      wohnflaeche,
      nutzung: input.nutzung,
      mieter_name: input.mieterName.trim() || null,
      notizen: input.notizen.trim() || null,
      geaendert_am: new Date().toISOString(),
    })
    .eq("id", einheitId);

  if (error) {
    return { status: "error", message: "Die Wohneinheit konnte nicht gespeichert werden." };
  }

  revalidatePath(`/immobilien/${input.propertyId}`);
  return { status: "ok", id: einheitId };
}

export async function deleteEinheit(
  einheitId: string,
  propertyId: string
): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("einheiten").delete().eq("id", einheitId);

  // Laufende Posten der Einheit bleiben erhalten (FK auf SET NULL) und gelten
  // danach fuer die ganze Immobilie — deshalb warnt die Oberflaeche vorher.
  if (error) {
    return { status: "error", message: "Die Wohneinheit konnte nicht gelöscht werden." };
  }

  revalidatePath(`/immobilien/${propertyId}`);
  return { status: "ok" };
}
