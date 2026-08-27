import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { NewProjectForm } from "./NewProjectForm";

export default async function NewProjectPage(props: PageProps<"/immobilien/[id]/projekte/neu">) {
  const { id } = await props.params;
  const supabase = await createClient();
  const { data: property } = await supabase.from("properties").select("id, name").eq("id", id).maybeSingle();
  if (!property) notFound();

  return (
    <div>
      <PageHeader eyebrow={property.name} title="Projekt anlegen" description="Lege einen Neubau oder eine Umbaumaßnahme für diese Immobilie an." />
      <NewProjectForm propertyId={id} />
    </div>
  );
}
