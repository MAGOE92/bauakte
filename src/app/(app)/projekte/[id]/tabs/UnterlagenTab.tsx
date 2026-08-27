import { createClient } from "@/lib/supabase/server";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { DocumentList } from "@/components/documents/DocumentList";
import { dokumentKategorien } from "@/lib/labels";

export async function UnterlagenTab({ projectId, propertyId }: { projectId: string; propertyId: string }) {
  const supabase = await createClient();
  const { data: documents } = await supabase
    .from("documents")
    .select("id, name, kategorie, hochgeladen_am, datei_groesse_bytes, storage_pfad")
    .eq("project_id", projectId)
    .order("hochgeladen_am", { ascending: false });

  return (
    <div className="flex flex-col gap-5">
      <DocumentUploader
        propertyId={propertyId}
        projectId={projectId}
        categories={dokumentKategorien}
        revalidate={`/projekte/${projectId}`}
      />
      <DocumentList
        documents={documents ?? []}
        revalidate={`/projekte/${projectId}`}
        emptyTitle="Noch keine Unterlagen im Projekt"
        emptyDescription="Lade Angebote, Rechnungen oder Pläne für dieses Projekt hoch."
      />
    </div>
  );
}
