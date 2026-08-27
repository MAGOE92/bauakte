"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/actions/types";
import type { Enums } from "@/lib/supabase/database.types";

export async function updateProject(input: {
  projectId: string;
  propertyId: string;
  name: string;
  beschreibung: string;
  zeitraumVon: string;
  zeitraumBis: string;
  budgetGesamt: string;
  status: Enums<"projekt_status">;
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
  const { error } = await supabase
    .from("projects")
    .update({
      name,
      beschreibung: input.beschreibung.trim() || null,
      zeitraum_von: input.zeitraumVon || null,
      zeitraum_bis: input.zeitraumBis || null,
      budget_gesamt: budget,
      status: input.status,
      geaendert_am: new Date().toISOString(),
    })
    .eq("id", input.projectId);

  if (error) {
    return { status: "error", message: "Das Projekt konnte nicht gespeichert werden." };
  }

  revalidatePath(`/projekte/${input.projectId}`);
  revalidatePath(`/immobilien/${input.propertyId}`);
  revalidatePath("/projekte");
  revalidatePath("/uebersicht");
  return { status: "ok", id: input.projectId };
}
