"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Zentrierter Dialog mit abgedunkeltem Hintergrund. Fuer Formulare, die
 * sonst in einer Kopfzeile neben Titel/Badges haengen wuerden — dort
 * sprengt ein mehrzeiliges Formular das Zeilenlayout und reisst ein
 * leeres Feld neben sich auf.
 */
export function Modal({
  title,
  onClose,
  children,
  className,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      // Auf dem Handy ein Sheet vom unteren Rand — die Daumenzone. Ab sm eine
      // klassisch zentrierte Karte.
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-navy/50 sm:items-start sm:px-4 sm:py-10"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "max-h-[90vh] w-full overflow-y-auto rounded-t-2xl border border-line bg-surface shadow-card p-6 sm:max-w-xl sm:rounded-2xl",
          className
        )}
      >
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-lg font-bold text-ink">{title}</p>
          <button type="button" onClick={onClose} className="text-ink-soft hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
