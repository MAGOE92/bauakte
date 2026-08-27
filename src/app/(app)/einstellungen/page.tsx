import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ShieldCheck, Link2 } from "lucide-react";
import { ProfileForm } from "./ProfileForm";

export default async function EinstellungenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const initialName = (user?.user_metadata?.full_name as string | undefined) ?? "";

  return (
    <div>
      <PageHeader eyebrow="Konto" title="Einstellungen" description="Verwalte dein Profil und erfahre, wie Bauakte deine Daten schützt." />

      <div className="flex flex-col gap-6">
        <ProfileForm initialName={initialName} email={user?.email ?? ""} />

        <Card className="max-w-lg">
          <div className="mb-2 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-terracotta" strokeWidth={2.25} />
            <p className="font-display text-sm font-bold text-ink">Externe Freigaben</p>
          </div>
          <p className="text-sm text-ink-soft">
            In jedem Projekt kannst du unter &bdquo;Freigaben&ldquo; einen zeitlich befristeten Link erstellen,
            z. B. für deine Bank. Der Link zeigt nur die freigegebenen Unterlagen, läuft automatisch
            ab und lässt sich jederzeit widerrufen.
          </p>
        </Card>

        <Card className="max-w-lg">
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-terracotta" strokeWidth={2.25} />
            <p className="font-display text-sm font-bold text-ink">Datenschutz</p>
          </div>
          <p className="text-sm text-ink-soft">
            Deine Immobilien, Projekte und Unterlagen sind nur für dich sichtbar. Firmen erhalten
            ausschließlich Zugriff auf Dokumente, die du im Rahmen einer Ausschreibung explizit
            freigibst.
          </p>
        </Card>
      </div>
    </div>
  );
}
