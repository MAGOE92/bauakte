import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { BudgetCard } from "@/components/projects/BudgetCard";
import { TabNav, isTabKey } from "@/components/projects/TabNav";
import { berechneBudget } from "@/lib/budget";
import { projektStatusLabel, projektStatusTone } from "@/lib/labels";
import { UnterlagenTab } from "./tabs/UnterlagenTab";
import { BudgetTab } from "./tabs/BudgetTab";
import { AngeboteTab } from "./tabs/AngeboteTab";
import { FreigabenTab } from "./tabs/FreigabenTab";

export default async function ProjektWorkspacePage(props: PageProps<"/projekte/[id]">) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const tabParam = typeof searchParams.tab === "string" ? searchParams.tab : undefined;
  const activeTab = isTabKey(tabParam) ? tabParam : "unterlagen";

  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (!project) notFound();

  const { data: property } = await supabase
    .from("properties")
    .select("id, name")
    .eq("id", project.property_id)
    .maybeSingle();

  const [{ data: ausgaben }, { data: einnahmen }] = await Promise.all([
    supabase.from("ausgaben").select("betrag, bezahlt").eq("project_id", id),
    supabase.from("einnahmen").select("betrag").eq("project_id", id),
  ]);

  const summary = berechneBudget(project.budget_gesamt, ausgaben ?? [], einnahmen ?? []);

  return (
    <div>
      <PageHeader
        eyebrow={property?.name ?? "Projekt"}
        title={project.name}
        description={project.beschreibung ?? undefined}
        action={<Badge tone={projektStatusTone[project.status]}>{projektStatusLabel[project.status]}</Badge>}
      />

      <BudgetCard summary={summary} />

      <TabNav projectId={id} active={activeTab} />

      {activeTab === "unterlagen" && <UnterlagenTab projectId={id} propertyId={project.property_id} />}
      {activeTab === "budget" && <BudgetTab projectId={id} />}
      {activeTab === "angebote" && <AngeboteTab projectId={id} propertyId={project.property_id} />}
      {activeTab === "freigaben" && <FreigabenTab projectId={id} />}
    </div>
  );
}
