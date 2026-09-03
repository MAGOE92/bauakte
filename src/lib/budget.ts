export type BudgetAusgabe = { betrag: number; bezahlt: boolean };
export type BudgetEinnahme = { betrag: number };

export type BudgetSummary = {
  /** Obergrenze: was das Projekt kosten darf. Kein Guthaben. */
  budgetGesamt: number;
  /** Summe aller erfassten Ausgaben — beauftragt oder berechnet. */
  verplant: number;
  bezahlt: number;
  /** Verplant, aber noch nicht bezahlt: Rechnungen, die noch kommen. */
  offen: number;
  /** Rest im Kostenrahmen. Negativ heisst: Rahmen gesprengt. */
  nichtVerplant: number;
  einnahmen: number;
  fortschrittProzent: number;
};

export function berechneBudget(
  budgetGesamt: number,
  ausgaben: BudgetAusgabe[],
  einnahmen: BudgetEinnahme[]
): BudgetSummary {
  const verplant = ausgaben.reduce((summe, a) => summe + a.betrag, 0);
  const bezahlt = ausgaben
    .filter((a) => a.bezahlt)
    .reduce((summe, a) => summe + a.betrag, 0);
  const einnahmenSumme = einnahmen.reduce((summe, e) => summe + e.betrag, 0);
  const nichtVerplant = budgetGesamt - verplant;
  const fortschrittProzent =
    budgetGesamt > 0 ? Math.min(100, Math.max(0, (verplant / budgetGesamt) * 100)) : 0;

  return {
    budgetGesamt,
    verplant,
    bezahlt,
    offen: verplant - bezahlt,
    nichtVerplant,
    einnahmen: einnahmenSumme,
    fortschrittProzent,
  };
}
