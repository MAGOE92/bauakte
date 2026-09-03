"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Folder,
  FolderPlus,
  FileText,
  Download,
  Trash2,
  Pencil,
  ChevronRight,
  FolderInput,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Field";
import { DocumentUploader } from "./DocumentUploader";
import { createClient } from "@/lib/supabase/client";
import { formatBytes, formatDate } from "@/lib/format";
import { deleteDocument } from "@/lib/actions/documents";
import { createOrdner, renameOrdner, deleteOrdner, moveDocument } from "@/lib/actions/ordner";

export type OrdnerRow = { id: string; name: string; parent_id: string | null };

export type DokumentRow = {
  id: string;
  name: string;
  kategorie: string;
  hochgeladen_am: string;
  datei_groesse_bytes: number | null;
  storage_pfad: string;
  ordner_id: string | null;
};

/**
 * Ordner und Dateien in einer Ansicht. Die Navigation laeuft im Browser, weil
 * alle Ordner und Dokumente eines Bereichs ohnehin geladen sind — das erspart
 * einen Serverbesuch pro Klick.
 */
export function DocumentBrowser({
  propertyId,
  projectId,
  ordner,
  documents,
  categories,
  revalidate,
  emptyDescription,
}: {
  propertyId: string;
  projectId?: string | null;
  ordner: OrdnerRow[];
  documents: DokumentRow[];
  categories: readonly string[];
  revalidate: string;
  emptyDescription: string;
}) {
  const [aktuell, setAktuell] = useState<string | null>(null);
  const [neuerOrdner, setNeuerOrdner] = useState(false);

  const ordnerById = new Map(ordner.map((o) => [o.id, o]));
  const unterordner = ordner.filter((o) => o.parent_id === aktuell);
  const dateien = documents.filter((d) => (d.ordner_id ?? null) === aktuell);

  // Pfad von der aktuellen Stelle nach oben, damit die Krumen stimmen.
  const pfad: OrdnerRow[] = [];
  let lauf = aktuell;
  while (lauf) {
    const o = ordnerById.get(lauf);
    if (!o) break;
    pfad.unshift(o);
    lauf = o.parent_id;
  }

  return (
    <div className="flex flex-col gap-5">
      <DocumentUploader
        propertyId={propertyId}
        projectId={projectId}
        ordnerId={aktuell}
        categories={categories}
        revalidate={revalidate}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          <button
            onClick={() => setAktuell(null)}
            className={`rounded-lg px-2 py-1 font-semibold transition-colors ${
              aktuell === null ? "text-ink" : "text-ink-soft hover:text-ink"
            }`}
          >
            Alle Unterlagen
          </button>
          {pfad.map((o, index) => (
            <span key={o.id} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-ink-soft" />
              <button
                onClick={() => setAktuell(o.id)}
                className={`rounded-lg px-2 py-1 font-semibold transition-colors ${
                  index === pfad.length - 1 ? "text-ink" : "text-ink-soft hover:text-ink"
                }`}
              >
                {o.name}
              </button>
            </span>
          ))}
        </nav>

        {!neuerOrdner && (
          <Button variant="secondary" size="sm" onClick={() => setNeuerOrdner(true)}>
            <FolderPlus className="h-4 w-4" strokeWidth={2.25} />
            Ordner anlegen
          </Button>
        )}
      </div>

      {neuerOrdner && (
        <NeuerOrdnerFormular
          propertyId={propertyId}
          projectId={projectId}
          parentId={aktuell}
          revalidate={revalidate}
          onFertig={() => setNeuerOrdner(false)}
        />
      )}

      {!unterordner.length && !dateien.length ? (
        <div className="rounded-2xl border border-dashed border-line bg-surface/60 px-6 py-14 text-center">
          <p className="font-display text-base font-bold text-ink">
            {aktuell === null ? "Noch keine Unterlagen" : "Dieser Ordner ist leer"}
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-ink-soft">{emptyDescription}</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
          {unterordner.map((o) => (
            <OrdnerZeile
              key={o.id}
              ordner={o}
              anzahl={
                ordner.filter((k) => k.parent_id === o.id).length +
                documents.filter((d) => d.ordner_id === o.id).length
              }
              revalidate={revalidate}
              onOeffnen={() => setAktuell(o.id)}
            />
          ))}
          {dateien.map((doc) => (
            <DateiZeile
              key={doc.id}
              doc={doc}
              ordner={ordner}
              revalidate={revalidate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NeuerOrdnerFormular({
  propertyId,
  projectId,
  parentId,
  revalidate,
  onFertig,
}: {
  propertyId: string;
  projectId?: string | null;
  parentId: string | null;
  revalidate: string;
  onFertig: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [fehler, setFehler] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function absenden(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setFehler(null);

    const ergebnis = await createOrdner({ propertyId, projectId, parentId, name, revalidate });
    setPending(false);

    if (ergebnis.status === "error") {
      setFehler(ergebnis.message);
      return;
    }
    onFertig();
    router.refresh();
  }

  return (
    <form
      onSubmit={absenden}
      className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-sunken px-5 py-4"
    >
      <Input
        autoFocus
        required
        placeholder="Ordnername, z. B. Angebote"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-64"
      />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Wird angelegt…" : "Anlegen"}
      </Button>
      <button type="button" onClick={onFertig} className="text-ink-soft hover:text-ink">
        <X className="h-5 w-5" />
      </button>
      {fehler && <p className="w-full text-sm font-medium text-danger">{fehler}</p>}
    </form>
  );
}

function OrdnerZeile({
  ordner,
  anzahl,
  revalidate,
  onOeffnen,
}: {
  ordner: OrdnerRow;
  anzahl: number;
  revalidate: string;
  onOeffnen: () => void;
}) {
  const router = useRouter();
  const [umbenennen, setUmbenennen] = useState(false);
  const [name, setName] = useState(ordner.name);
  const [pending, setPending] = useState(false);

  async function speichern(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    await renameOrdner(ordner.id, name, revalidate);
    setPending(false);
    setUmbenennen(false);
    router.refresh();
  }

  async function loeschen() {
    if (
      !confirm(
        `Ordner „${ordner.name}" löschen? Die Dateien darin bleiben erhalten und rutschen eine Ebene höher. Unterordner werden mit gelöscht.`
      )
    ) {
      return;
    }
    setPending(true);
    await deleteOrdner(ordner.id, revalidate);
    setPending(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-terracotta-soft text-terracotta-hover">
        <Folder className="h-4 w-4" strokeWidth={2.25} />
      </span>

      {umbenennen ? (
        <form onSubmit={speichern} className="flex flex-1 items-center gap-2">
          <Input autoFocus required value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" size="sm" disabled={pending}>
            Speichern
          </Button>
          <button
            type="button"
            onClick={() => {
              setName(ordner.name);
              setUmbenennen(false);
            }}
            className="text-ink-soft hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </form>
      ) : (
        <>
          <button onClick={onOeffnen} className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-semibold text-ink">{ordner.name}</p>
            <p className="mt-0.5 text-xs text-ink-soft">
              {anzahl === 0 ? "leer" : anzahl === 1 ? "1 Eintrag" : `${anzahl} Einträge`}
            </p>
          </button>
          <button
            onClick={() => setUmbenennen(true)}
            title="Umbenennen"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sunken hover:text-terracotta"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={loeschen}
            disabled={pending}
            title="Ordner löschen"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}

function DateiZeile({
  doc,
  ordner,
  revalidate,
}: {
  doc: DokumentRow;
  ordner: OrdnerRow[];
  revalidate: string;
}) {
  const router = useRouter();
  const [verschieben, setVerschieben] = useState(false);
  const [pending, setPending] = useState(false);

  async function herunterladen() {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from("unterlagen")
      .createSignedUrl(doc.storage_pfad, 60);
    if (!error && data) {
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    }
  }

  async function verschiebeNach(ordnerId: string) {
    setPending(true);
    await moveDocument(doc.id, ordnerId || null, revalidate);
    setPending(false);
    setVerschieben(false);
    router.refresh();
  }

  async function loeschen() {
    if (!confirm(`"${doc.name}" wirklich löschen?`)) return;
    setPending(true);
    await deleteDocument(doc.id, doc.storage_pfad, revalidate);
    setPending(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4 border-b border-line px-5 py-4 last:border-0">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sunken text-ink-soft">
        <FileText className="h-4 w-4" strokeWidth={2.25} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink">{doc.name}</p>
        <p className="mt-0.5 text-xs text-ink-soft">
          {formatDate(doc.hochgeladen_am)} · {formatBytes(doc.datei_groesse_bytes)}
        </p>
      </div>

      {verschieben ? (
        <Select
          autoFocus
          defaultValue={doc.ordner_id ?? ""}
          disabled={pending}
          onChange={(e) => verschiebeNach(e.target.value)}
          className="w-48 shrink-0 py-1.5 text-xs"
        >
          <option value="">Alle Unterlagen</option>
          {ordner.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </Select>
      ) : (
        <Badge tone="neutral" className="hidden shrink-0 sm:inline-flex">
          {doc.kategorie}
        </Badge>
      )}

      <button
        onClick={() => setVerschieben((v) => !v)}
        title="In Ordner verschieben"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sunken hover:text-terracotta"
      >
        <FolderInput className="h-4 w-4" />
      </button>
      <button
        onClick={herunterladen}
        title="Herunterladen"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sunken hover:text-terracotta"
      >
        <Download className="h-4 w-4" />
      </button>
      <button
        onClick={loeschen}
        disabled={pending}
        title="Löschen"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
