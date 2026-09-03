import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/lib/supabase/database.types";

export type VergabeData = {
  valid: true;
  vergabe: {
    id: string;
    titel: string;
    gewerk: string;
    beschreibung: string | null;
    status: Enums<"vergabe_status">;
    bewerbungsfrist: string | null;
  };
  property: { name: string; adresse: string };
  project: { name: string };
  kannBewerben: boolean;
  documents: { id: string; name: string; kategorie: string }[];
};

export type VergabeInvalid = {
  valid: false;
  reason: "not_found" | "verworfen";
};

/**
 * Laeuft immer ueber die SECURITY DEFINER RPC, auch fuer den eingeloggten
 * Eigentuemer selbst — die Funktion prueft Token und Status ohnehin serverseitig,
 * ein Sonderpfad ueber RLS wuerde hier keinen echten Vorteil bringen.
 */
export async function loadVergabe(token: string): Promise<VergabeData | VergabeInvalid> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("vergabe_by_token", { p_token: token });
  if (error || !data) return { valid: false, reason: "not_found" };

  const result = data as unknown as {
    valid: boolean;
    reason?: "not_found" | "verworfen";
    vergabe?: VergabeData["vergabe"];
    property?: VergabeData["property"];
    project?: VergabeData["project"];
    kann_bewerben?: boolean;
    documents?: VergabeData["documents"];
  };

  if (!result.valid || !result.vergabe || !result.property || !result.project) {
    return { valid: false, reason: result.reason ?? "not_found" };
  }

  return {
    valid: true,
    vergabe: result.vergabe,
    property: result.property,
    project: result.project,
    kannBewerben: result.kann_bewerben ?? false,
    documents: result.documents ?? [],
  };
}
