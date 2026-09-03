import { Eyebrow } from "@/components/ui/Eyebrow";
import { Card } from "@/components/ui/Card";
import { Ban, FileText, Download, Clock, HardHat } from "lucide-react";
import { formatDate } from "@/lib/format";
import { loadVergabe } from "./loadVergabe";
import { AngebotForm } from "./AngebotForm";

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

export default async function AusschreibungPage(props: PageProps<"/ausschreibung/[token]">) {
  const { token } = await props.params;
  const result = await loadVergabe(token);

  if (!result.valid) {
    const messages: Record<string, string> = {
      not_found: "Dieser Ausschreibungs-Link ist ungültig.",
      verworfen: "Diese Ausschreibung wurde zurückgezogen.",
    };

    return (
      <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
        <div className="w-full max-w-sm text-center">
          <BrandHeader />
          <Card className="flex flex-col items-center gap-3 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger">
              <Ban className="h-5 w-5" strokeWidth={2.25} />
            </span>
            <p className="font-display text-lg font-bold text-ink">Kein Zugriff</p>
            <p className="text-sm text-ink-soft">{messages[result.reason] ?? messages.not_found}</p>
          </Card>
        </div>
      </main>
    );
  }

  const functionsBase = process.env.NEXT_PUBLIC_SUPABASE_URL!.replace(".supabase.co", ".supabase.co/functions/v1");

  return (
    <main className="min-h-screen bg-canvas px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <BrandHeader />

        <div className="mb-6 flex items-center gap-2 rounded-xl bg-terracotta-soft px-4 py-3 text-sm text-terracotta-hover">
          <HardHat className="h-4 w-4 shrink-0" strokeWidth={2.25} />
          Öffentliche Ausschreibung — jeder mit diesem Link kann die Unterlagen sehen und ein Angebot abgeben.
        </div>

        <Eyebrow>{result.property.name}</Eyebrow>
        <h1 className="font-display mt-1 text-3xl font-extrabold text-ink">{result.vergabe.titel}</h1>
        <p className="mt-1 text-sm font-semibold text-terracotta-hover">{result.vergabe.gewerk}</p>
        <p className="mt-2 text-sm text-ink-soft">{result.property.adresse}</p>
        {result.vergabe.beschreibung && (
          <p className="mt-3 max-w-2xl text-sm text-ink-soft">{result.vergabe.beschreibung}</p>
        )}
        {result.vergabe.bewerbungsfrist && (
          <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-ink-soft">
            <Clock className="h-3.5 w-3.5" />
            Bewerbungsfrist: {formatDate(result.vergabe.bewerbungsfrist)}
          </p>
        )}

        <h2 className="font-display mb-4 mt-8 text-xl font-bold text-ink">Unterlagen</h2>
        {result.documents.length === 0 ? (
          <Card className="mb-8">
            <p className="text-sm text-ink-soft">Für diese Ausschreibung wurden keine Unterlagen freigegeben.</p>
          </Card>
        ) : (
          <div className="mb-8 overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
            {result.documents.map((doc, index) => (
              <a
                key={doc.id}
                href={`${functionsBase}/vergabe-datei?token=${encodeURIComponent(token)}&document_id=${doc.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-4 px-5 py-4 transition-colors hover:bg-sunken ${
                  index !== result.documents.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sunken text-ink-soft">
                  <FileText className="h-4 w-4" strokeWidth={2.25} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{doc.name}</p>
                  <p className="mt-0.5 text-xs text-ink-soft">{doc.kategorie}</p>
                </div>
                <Download className="h-4 w-4 shrink-0 text-ink-soft" />
              </a>
            ))}
          </div>
        )}

        <h2 className="font-display mb-4 text-xl font-bold text-ink">Angebot abgeben</h2>
        {result.kannBewerben ? (
          <AngebotForm token={token} />
        ) : (
          <Card>
            <p className="text-sm text-ink-soft">
              Diese Ausschreibung nimmt aktuell keine neuen Angebote mehr an.
            </p>
          </Card>
        )}
      </div>
    </main>
  );
}
