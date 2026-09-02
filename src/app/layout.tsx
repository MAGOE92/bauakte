import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Manrope } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Bauakte",
  description: "Die Bauakte für deine Immobilien, Projekte und Ausgaben.",
};

// Laeuft vor dem ersten Anzeigen und setzt die gespeicherte Wahl. Ohne das
// blitzt beim Laden kurz das helle Schema auf, bevor React uebernimmt.
// Ist nichts gespeichert, bleibt das Attribut weg und die Medienabfrage
// in globals.css entscheidet.
const FARBSCHEMA_SKRIPT = `
try {
  var s = localStorage.getItem("bauakte-farbschema");
  if (s === "hell") document.documentElement.setAttribute("data-theme", "light");
  else if (s === "dunkel") document.documentElement.setAttribute("data-theme", "dark");
} catch (e) {}
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${plusJakarta.variable} ${manrope.variable} h-full`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: FARBSCHEMA_SKRIPT }} />
      </head>
      <body className="min-h-full bg-canvas text-ink antialiased">{children}</body>
    </html>
  );
}
