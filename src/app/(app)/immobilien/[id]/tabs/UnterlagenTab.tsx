import { createClient } from "@/lib/supabase/server";
import { DocumentBrowser } from "@/components/documents/DocumentBrowser";
import { dokumentKategorien } from "@/lib/labels";

export async function UnterlagenTab({ propertyId }: { propertyId: string }) {
  const supabase = await createClient();

  // Nur die Unterlagen der Immobilie selbst — Projektunterlagen stehen im Projekt.
  const [{ data: ordner }, { data: documents }] = await Promise.all([
    supabase
      .from("ordner")
      .select("id, name, parent_id")
      .eq("property_id", propertyId)
      .is("project_id", null)
      .order("name"),
    supabase
      .from("documents")
      .select("id, name, kategorie, hochgeladen_am, datei_groesse_bytes, storage_pfad, ordner_id")
      .eq("property_id", propertyId)
      .is("project_id", null)
      .order("hochgeladen_am", { ascending: false }),
  ]);

  return (
    <DocumentBrowser
      propertyId={propertyId}
      projectId={null}
      ordner={ordner ?? []}
      documents={documents ?? []}
      categories={dokumentKategorien}
      revalidate={`/immobilien/${propertyId}`}
      emptyDescription="Kaufvertrag, Grundbuchauszug, Versicherungspolice — und Ordner, um sie zu sortieren."
    />
  );
}
