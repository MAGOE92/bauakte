/**
 * Nur auf schmalen Bildschirmen sichtbar — auf groesseren traegt die
 * Sidebar die Marke. Ohne das hier fehlt oben jede Orientierung, sobald
 * die Sidebar weg ist.
 */
export function MobileTopBar() {
  return (
    <header
      data-drucken="aus"
      className="sticky top-0 z-30 flex items-center gap-2.5 border-b border-line bg-surface px-4 py-3 lg:hidden"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta font-display text-sm font-extrabold text-white">
        B
      </span>
      <span className="font-display text-base font-extrabold text-ink">Bauakte</span>
    </header>
  );
}
