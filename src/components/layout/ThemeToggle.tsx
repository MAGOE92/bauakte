"use client";

import { useSyncExternalStore } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

export type Farbschema = "hell" | "dunkel" | "system";

const OPTIONEN: { wert: Farbschema; label: string; Icon: typeof Sun }[] = [
  { wert: "hell", label: "Hell", Icon: Sun },
  { wert: "dunkel", label: "Dunkel", Icon: Moon },
  { wert: "system", label: "System", Icon: Monitor },
];

const SCHLUESSEL = "bauakte-farbschema";
const EREIGNIS = "bauakte-farbschema-geaendert";

/**
 * Die Wahl liegt im localStorage, also ausserhalb von React. Statt sie in
 * einen Effekt zu kopieren, wird sie hier als externe Quelle abonniert —
 * dadurch bleibt das Rendern auf dem Server (wo es keinen localStorage gibt)
 * sauber und es entstehen keine Folgerenderings.
 */
function abonniere(beiAenderung: () => void) {
  window.addEventListener(EREIGNIS, beiAenderung);
  // Damit ein zweiter Tab mitzieht.
  window.addEventListener("storage", beiAenderung);
  return () => {
    window.removeEventListener(EREIGNIS, beiAenderung);
    window.removeEventListener("storage", beiAenderung);
  };
}

function leseSchema(): Farbschema {
  try {
    const wert = localStorage.getItem(SCHLUESSEL);
    if (wert === "hell" || wert === "dunkel") return wert;
  } catch {
    // Privater Modus o. Ae.
  }
  return "system";
}

// Auf dem Server ist nichts bekannt; "system" ist die neutrale Ausgangslage.
const leseSchemaAufServer = (): Farbschema => "system";

function setzeSchema(schema: Farbschema) {
  const wurzel = document.documentElement;
  if (schema === "system") {
    wurzel.removeAttribute("data-theme");
  } else {
    wurzel.setAttribute("data-theme", schema === "dunkel" ? "dark" : "light");
  }

  try {
    if (schema === "system") localStorage.removeItem(SCHLUESSEL);
    else localStorage.setItem(SCHLUESSEL, schema);
  } catch {
    // Nicht speicherbar: die Wahl gilt dann nur für diese Sitzung.
  }

  window.dispatchEvent(new Event(EREIGNIS));
}

export function ThemeToggle() {
  const schema = useSyncExternalStore(abonniere, leseSchema, leseSchemaAufServer);

  return (
    <div className="flex gap-1 rounded-full bg-white/10 p-1" role="group" aria-label="Farbschema">
      {OPTIONEN.map(({ wert, label, Icon }) => {
        const aktiv = schema === wert;
        return (
          <button
            key={wert}
            type="button"
            onClick={() => setzeSchema(wert)}
            title={label}
            aria-label={label}
            aria-pressed={aktiv}
            className={`flex flex-1 items-center justify-center rounded-full py-1.5 transition-colors ${
              aktiv ? "bg-terracotta text-white" : "text-white/60 hover:text-white"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={2.25} />
          </button>
        );
      })}
    </div>
  );
}
