import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/supabase/database.types";

export type FreigabeData = {
  valid: true;
  freigabe: { empfaenger_name: string; laeuft_ab_am: string };
  property: { name: string; adresse: string };
  project: {
    name: string;
    beschreibung: string | null;
    status: Enums<"projekt_status">;
    zeitraum_von: string | null;
    zeitraum_bis: string | null;
    budget_gesamt: number;
  };
  ausgaben: { betrag: number; bezahlt: boolean }[];
  einnahmen: { betrag: number }[];
  documents: {
    id: string;
    name: string;
    kategorie: string;
    hochgeladen_am: string;
    datei_groesse_bytes: number | null;
  }[];
};

export type FreigabeInvalid = {
  valid: false;
  reason: "not_found" | "revoked" | "expired";
};

const INVALID: FreigabeInvalid = { valid: false, reason: "not_found" };

/**
 * Signed-in visitors read the share through their own RLS grants, so the
 * SECURITY DEFINER RPC stays reachable by `anon` alone.
 */
async function loadAsSignedInUser(token: string): Promise<FreigabeData | FreigabeInvalid> {
  const supabase = await createClient();

  const { data: freigabe } = await supabase
    .from("freigaben")
    .select("project_id, empfaenger_name, laeuft_ab_am, widerrufen_am")
    .eq("token", token)
    .maybeSingle();

  if (!freigabe) return INVALID;
  if (freigabe.widerrufen_am) return { valid: false, reason: "revoked" };
  if (new Date(freigabe.laeuft_ab_am).getTime() < Date.now()) {
    return { valid: false, reason: "expired" };
  }

  const { data: project } = await supabase
    .from("projects")
    .select("name, beschreibung, status, zeitraum_von, zeitraum_bis, budget_gesamt, property_id")
    .eq("id", freigabe.project_id)
    .maybeSingle();

  if (!project) return INVALID;

  const [{ data: property }, { data: ausgaben }, { data: einnahmen }, { data: documents }] =
    await Promise.all([
      supabase.from("properties").select("name, adresse").eq("id", project.property_id).maybeSingle(),
      supabase.from("ausgaben").select("betrag, bezahlt").eq("project_id", freigabe.project_id),
      supabase.from("einnahmen").select("betrag").eq("project_id", freigabe.project_id),
      supabase
        .from("documents")
        .select("id, name, kategorie, hochgeladen_am, datei_groesse_bytes")
        .eq("project_id", freigabe.project_id)
        .order("hochgeladen_am", { ascending: false }),
    ]);

  if (!property) return INVALID;

  return {
    valid: true,
    freigabe: {
      empfaenger_name: freigabe.empfaenger_name,
      laeuft_ab_am: freigabe.laeuft_ab_am,
    },
    property,
    project: {
      name: project.name,
      beschreibung: project.beschreibung,
      status: project.status,
      zeitraum_von: project.zeitraum_von,
      zeitraum_bis: project.zeitraum_bis,
      budget_gesamt: project.budget_gesamt,
    },
    ausgaben: ausgaben ?? [],
    einnahmen: einnahmen ?? [],
    documents: documents ?? [],
  };
}

export async function loadFreigabe(token: string): Promise<FreigabeData | FreigabeInvalid> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) return loadAsSignedInUser(token);

  const { data, error } = await supabase.rpc("freigabe_by_token", { p_token: token });
  if (error || !data) return INVALID;

  return data as unknown as FreigabeData | FreigabeInvalid;
}
