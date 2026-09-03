import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { LinkButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TabNav, leseTab } from "@/components/ui/TabNav";
import { immobilieStatusLabel, immobilieStatusTone, gebaeudeTypLabel } from "@/lib/labels";
import { Plus, MapPin } from "lucide-react";
import { EditPropertyForm } from "./EditPropertyForm";
import { ProjekteTab } from "./tabs/ProjekteTab";
import { EinheitenTab } from "./tabs/EinheitenTab";
import { CashflowTab } from "./tabs/CashflowTab";
import { UnterlagenTab } from "./tabs/UnterlagenTab";

const TABS = [
  { key: "projekte", label: "Projekte" },
  { key: "einheiten", label: "Wohneinheiten" },
  { key: "cashflow", label: "Cashflow" },
  { key: "unterlagen", label: "Unterlagen" },
] as const;

export default async function ImmobilieDetailPage(props: PageProps<"/immobilien/[id]">) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const aktiverTab = leseTab(TABS, searchParams.tab);

  const jahrParam = Number(
    typeof searchParams.jahr === "string" ? searchParams.jahr : Number.NaN
  );
  const jahr = Number.isInteger(jahrParam) ? jahrParam : new Date().getFullYear();

  const supabase = await createClient();
  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!property) notFound();

  return (
    <div>
      <PageHeader
        eyebrow="Immobilie"
        title={property.name}
        action={
          <LinkButton href={`/immobilien/${id}/projekte/neu`}>
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            Projekt anlegen
          </LinkButton>
        }
      />

      <div className="-mt-6 mb-8 flex flex-wrap items-center gap-3">
        <p className="flex items-center gap-1.5 text-sm text-ink-soft">
          <MapPin className="h-4 w-4" />
          {property.adresse}
          {property.typ && <span>· {gebaeudeTypLabel[property.typ]}</span>}
        </p>
        <Badge tone={immobilieStatusTone[property.status]}>
          {immobilieStatusLabel[property.status]}
        </Badge>
        <EditPropertyForm property={property} />
      </div>

      <TabNav basePath={`/immobilien/${id}`} tabs={TABS} active={aktiverTab} />

      {aktiverTab === "projekte" && <ProjekteTab propertyId={id} />}
      {aktiverTab === "einheiten" && <EinheitenTab propertyId={id} />}
      {aktiverTab === "cashflow" && <CashflowTab propertyId={id} jahr={jahr} />}
      {aktiverTab === "unterlagen" && <UnterlagenTab propertyId={id} />}
    </div>
  );
}
