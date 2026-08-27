"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, FileText } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/client";
import { formatBytes, formatDate } from "@/lib/format";
import { deleteDocument } from "@/lib/actions/documents";

export type DocumentRowData = {
  id: string;
  name: string;
  kategorie: string;
  hochgeladen_am: string;
  datei_groesse_bytes: number | null;
  storage_pfad: string;
};

export function DocumentList({
  documents,
  revalidate,
  emptyTitle = "Noch keine Unterlagen",
  emptyDescription = "Lade Grundrisspläne, Verträge oder Rechnungen hoch.",
}: {
  documents: DocumentRowData[];
  revalidate: string;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (!documents.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-card-border bg-white">
      {documents.map((doc, index) => (
        <DocumentRow key={doc.id} doc={doc} revalidate={revalidate} isLast={index === documents.length - 1} />
      ))}
    </div>
  );
}

function DocumentRow({
  doc,
  revalidate,
  isLast,
}: {
  doc: DocumentRowData;
  revalidate: string;
  isLast: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDownload() {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("unterlagen")
      .createSignedUrl(doc.storage_pfad, 60);
    if (!error && data) {
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    }
  }

  async function handleDelete() {
    if (!confirm(`"${doc.name}" wirklich löschen?`)) return;
    setPending(true);
    await deleteDocument(doc.id, doc.storage_pfad, revalidate);
    setPending(false);
    router.refresh();
  }

  return (
    <div
      className={`flex items-center gap-4 px-5 py-4 ${!isLast ? "border-b border-card-border" : ""}`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream-soft text-ink-soft">
        <FileText className="h-4 w-4" strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{doc.name}</p>
        <p className="mt-0.5 text-xs text-ink-soft">
          {formatDate(doc.hochgeladen_am)} · {formatBytes(doc.datei_groesse_bytes)}
        </p>
      </div>
      <Badge tone="neutral" className="hidden shrink-0 sm:inline-flex">
        {doc.kategorie}
      </Badge>
      <button
        onClick={handleDownload}
        title="Herunterladen"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-cream-soft hover:text-terracotta"
      >
        <Download className="h-4 w-4" />
      </button>
      <button
        onClick={handleDelete}
        disabled={pending}
        title="Löschen"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
