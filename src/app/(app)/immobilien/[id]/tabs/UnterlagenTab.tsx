import { createClient } from "@/lib/supabase/server";
import { DocumentUploader } from "@/components/documents/DocumentUploader";
import { DocumentList } from "@/components/documents/DocumentList";
import { dokumentKategorien } from "@/lib/labels";

export async function UnterlagenTab({ propertyId }: { propertyId: string }) {
  const supabase = await createClient();
  const { data: documents } = await supabase
    .from("documents")
    .select("id, name, kategorie, hochgeladen_am, datei_groesse_bytes, storage_pfad")
    .eq("property_id", propertyId)
    .is("project_id", null)
    .order("hochgeladen_am", { ascending: false });

  return (
    <div className="flex flex-col gap-5">
      <DocumentUploader
        propertyId={propertyId}
        projectId={null}
        categories={dokumentKategorien}
        revalidate={`/immobilien/${propertyId}`}
      />
      <DocumentList documents={documents ?? []} revalidate={`/immobilien/${propertyId}`} />
    </div>
  );
}
