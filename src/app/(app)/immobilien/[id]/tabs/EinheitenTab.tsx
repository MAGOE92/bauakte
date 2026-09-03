import { createClient } from "@/lib/supabase/server";
import { EinheitenSection } from "./EinheitenSection";

export async function EinheitenTab({ propertyId }: { propertyId: string }) {
  const supabase = await createClient();
  const { data: einheiten } = await supabase
    .from("einheiten")
    .select("*")
    .eq("property_id", propertyId)
    .order("name");

  return <EinheitenSection propertyId={propertyId} einheiten={einheiten ?? []} />;
}
