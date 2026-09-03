import { createClient } from "@/lib/supabase/server";
import { FreigabenSection } from "./FreigabenSection";

export async function FreigabenTab({ projectId }: { projectId: string }) {
  const supabase = await createClient();

  const [{ data: freigaben }, { data: documents }, { data: ordner }] = await Promise.all([
    supabase
      .from("freigaben")
      .select("*, freigabe_dokumente(document_id)")
      .eq("project_id", projectId)
      .order("erstellt_am", { ascending: false }),
    supabase
      .from("documents")
      .select("id, name, kategorie, ordner_id")
      .eq("project_id", projectId)
      .order("hochgeladen_am", { ascending: false }),
    supabase.from("ordner").select("id, name").eq("project_id", projectId).order("name"),
  ]);

  const eintraege = (freigaben ?? []).map(({ freigabe_dokumente, ...freigabe }) => ({
    ...freigabe,
    documentIds: freigabe_dokumente.map((v) => v.document_id),
  }));

  return (
    <FreigabenSection
      projectId={projectId}
      freigaben={eintraege}
      documents={documents ?? []}
      ordner={ordner ?? []}
    />
  );
}
