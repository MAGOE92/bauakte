import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { NewProjectForm } from "@/components/projects/NewProjectForm";

export default async function NeuesProjektPage() {
  const supabase = await createClient();
  const { data: properties } = await supabase
    .from("properties")
    .select("id, name")
    .order("name");

  return (
    <div>
      <PageHeader
        eyebrow="Neues Projekt"
        title="Projekt anlegen"
        description="Wähle die Immobilie, zu der das Projekt gehört."
      />

      {!properties?.length ? (
        // Ein Projekt braucht immer eine Immobilie — ohne die geht es nicht weiter.
        <EmptyState
          title="Zuerst eine Immobilie anlegen"
          description="Projekte gehören immer zu einer Immobilie. Lege zuerst eine an."
          action={
            <Link
              href="/immobilien"
              className="text-sm font-bold text-terracotta hover:text-terracotta-hover"
            >
              Zu den Immobilien →
            </Link>
          }
        />
      ) : (
        <NewProjectForm properties={properties} />
      )}
    </div>
  );
}
