import { createClient } from "@/lib/supabase/server";
import { FreigabenSection } from "./FreigabenSection";

export async function FreigabenTab({ projectId }: { projectId: string }) {
  const supabase = await createClient();
  const { data: freigaben } = await supabase
    .from("freigaben")
    .select("*")
    .eq("project_id", projectId)
    .order("erstellt_am", { ascending: false });

  return <FreigabenSection projectId={projectId} freigaben={freigaben ?? []} />;
}
