import { createClient } from "@/lib/supabase/server";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import { BudgetCard } from "@/components/projects/BudgetCard";
import { ShieldCheck, FileText, Download, Ban, Clock } from "lucide-react";
import { berechneBudget } from "@/lib/budget";
import { formatBytes, formatDate } from "@/lib/format";
import { projektStatusLabel, projektStatusTone } from "@/lib/labels";
import { Badge } from "@/components/ui/Badge";
import type { Enums } from "@/lib/supabase/database.types";

type FreigabeData = {
  valid: true;
  freigabe: { empfaenger_name: string; laeuft_ab_am: string };
  property: { name: string; adresse: string };
  project: {
    id: string;
    name: string;
    beschreibung: string | null;
    status: Enums<"projekt_status">;
    zeitraum_von: string | null;
    zeitraum_bis: string | null;
    budget_gesamt: number;
  };
  ausgaben: { betrag: number; bezahlt: boolean }[];
  einnahmen: { betrag: number }[];
  documents: {
    id: string;
    name: string;
    kategorie: string;
    hochgeladen_am: string;
    datei_groesse_bytes: number | null;
  }[];
};

type FreigabeInvalid = { valid: false; reason: "not_found" | "revoked" | "expired" };

function BrandHeader() {
  return (
    <div className="mb-10 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta font-display text-lg font-extrabold text-white">
        B
      </span>
      <span className="font-display text-xl font-extrabold text-ink">Bauakte</span>
    </div>
  );
}

export default async function FreigabePage(props: PageProps<"/freigabe/[token]">) {
  const { token } = await props.params;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("freigabe_by_token", { p_token: token });

  const result = (data ?? { valid: false, reason: "not_found" }) as FreigabeData | FreigabeInvalid;

  if (error || !result.valid) {
    const reason = !error && "reason" in result ? result.reason : "not_found";
    const messages: Record<string, string> = {
      not_found: "Dieser Freigabe-Link ist ungültig.",
      revoked: "Diese Freigabe wurde widerrufen.",
      expired: "Diese Freigabe ist abgelaufen.",
    };

    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-6">
        <div className="w-full max-w-sm text-center">
          <BrandHeader />
          <Card className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
              <Ban className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <p className="font-display text-lg font-bold text-ink">Kein Zugriff</p>
            <p className="text-sm text-ink-soft">{messages[reason] ?? messages.not_found}</p>
          </Card>
        </div>
      </main>
    );
  }

  const functionsBase = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(".supabase.co", ".supabase.co/functions/v1");
  const summary = berechneBudget(result.project.budget_gesamt, result.ausgaben, result.einnahmen);

  return (
    <main className="min-h-screen bg-cream px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <BrandHeader />

        <div className="mb-6 flex items-center gap-2 rounded-xl bg-terracotta-soft px-4 py-3 text-sm text-terracotta-hover">
          <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={2.25} />
          Diese Ansicht ist nur lesbar und für {result.freigabe.empfaenger_name} freigegeben.
        </div>

        <Eyebrow>{result.property.name}</Eyebrow>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-extrabold text-ink">{result.project.name}</h1>
          <Badge tone={projektStatusTone[result.project.status]}>{projektStatusLabel[result.project.status]}</Badge>
        </div>
        <p className="mt-2 text-sm text-ink-soft">{result.property.adresse}</p>
        {result.project.beschreibung && <p className="mt-3 max-w-2xl text-sm text-ink-soft">{result.project.beschreibung}</p>}
        {(result.project.zeitraum_von || result.project.zeitraum_bis) && (
          <p className="mt-2 text-xs font-semibold text-ink-soft">
            Zeitraum: {formatDate(result.project.zeitraum_von)} – {formatDate(result.project.zeitraum_bis)}
          </p>
        )}

        <div className="mt-8">
          <BudgetCard summary={summary} />
        </div>

        <h2 className="font-display mb-4 text-xl font-bold text-ink">Unterlagen</h2>
        {result.documents.length === 0 ? (
          <Card>
            <p className="text-sm text-ink-soft">Für dieses Projekt wurden noch keine Unterlagen freigegeben.</p>
          </Card>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-card-border bg-white">
            {result.documents.map((doc, index) => (
              <a
                key={doc.id}
                href={`${functionsBase}/freigabe-datei?token=${encodeURIComponent(token)}&document_id=${doc.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-cream-soft ${
                  index !== result.documents.length - 1 ? "border-b border-card-border" : ""
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-soft text-ink-soft">
                  <FileText className="h-4 w-4" strokeWidth={2.25} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{doc.name}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">
                    {doc.kategorie} · {formatDate(doc.hochgeladen_am)} · {formatBytes(doc.datei_groesse_bytes)}
                  </p>
                </div>
                <Download className="h-4 w-4 shrink-0 text-ink-soft" />
              </a>
            ))}
          </div>
        )}

        <p className="mt-8 flex items-center gap-1.5 text-xs text-ink-soft">
          <Clock className="h-3.5 w-3.5" />
          Dieser Link ist gültig bis {formatDate(result.freigabe.laeuft_ab_am)}.
        </p>
      </div>
    </main>
  );
}
