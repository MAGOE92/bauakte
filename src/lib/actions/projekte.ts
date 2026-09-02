"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/types";

export async function createProject(input: {
  propertyId: string;
  name: string;
  beschreibung: string;
  zeitraumVon: string;
  zeitraumBis: string;
  budgetGesamt: string;
}): Promise<ActionResult> {
  const name = input.name.trim();
  if (!name) return { status: "error", message: "Bitte einen Namen angeben." };

  const budget = input.budgetGesamt.trim() === "" ? 0 : Number(input.budgetGesamt.replace(",", "."));
  if (Number.isNaN(budget) || budget < 0) {
    return { status: "error", message: "Bitte ein gültiges Budget angeben." };
  }

  if (input.zeitraumVon && input.zeitraumBis && input.zeitraumVon > input.zeitraumBis) {
    return { status: "error", message: "Der Projektzeitraum ist ungültig (Ende vor Beginn)." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      property_id: input.propertyId,
      name,
      beschreibung: input.beschreibung.trim() || null,
      zeitraum_von: input.zeitraumVon || null,
      zeitraum_bis: input.zeitraumBis || null,
      budget_gesamt: budget,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { status: "error", message: "Das Projekt konnte nicht angelegt werden." };
  }

  revalidatePath(`/immobilien/${input.propertyId}`);
  revalidatePath("/projekte");
  revalidatePath("/uebersicht");
  return { status: "ok", id: data.id };
}
