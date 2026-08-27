"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(
  fullName: string
): Promise<{ status: "ok" } | { status: "error"; message: string }> {
  const name = fullName.trim();
  if (!name) return { status: "error", message: "Bitte einen Namen angeben." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: { full_name: name } });

  if (error) return { status: "error", message: "Der Name konnte nicht gespeichert werden." };

  revalidatePath("/einstellungen");
  revalidatePath("/uebersicht");
  return { status: "ok" };
}
