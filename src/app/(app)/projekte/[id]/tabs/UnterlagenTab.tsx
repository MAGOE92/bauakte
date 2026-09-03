import { createClient } from "@/lib/supabase/server";
import { DocumentBrowser } from "@/components/documents/DocumentBrowser";
import { dokumentKategorien } from "@/lib/labels";

export async function UnterlagenTab({ projectId, propertyId }: { projectId: string; propertyId: string }) {
  const supabase = await createClient();

  const [{ data: ordner }, { data: documents }] = await Promise.all([
    supabase
      .from("ordner")
      .select("id, name, parent_id")
      .eq("project_id", projectId)
      .order("name"),
    supabase
      .from("documents")
      .select("id, name, kategorie, hochgeladen_am, datei_groesse_bytes, storage_pfad, ordner_id")
      .eq("project_id", projectId)
      .order("hochgeladen_am", { ascending: false }),
  ]);

  return (
    <DocumentBrowser
      propertyId={propertyId}
      projectId={projectId}
      ordner={ordner ?? []}
      documents={documents ?? []}
      categories={dokumentKategorien}
      revalidate={`/projekte/${projectId}`}
      emptyDescription="Lade Angebote, Rechnungen oder Pläne für dieses Projekt hoch — und lege Ordner an, um sie zu sortieren."
    />
  );
}
