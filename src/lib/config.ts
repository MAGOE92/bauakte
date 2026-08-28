/**
 * Steuert, ob sich neue Nutzer selbst ein Konto anlegen dürfen.
 *
 * Nicht gesetzt (Standard) = geschlossen: Die App ist privat, es kommt nur
 * hinein, wer bereits ein Konto hat. Neue Konten legt der Betreiber im
 * Supabase-Dashboard an (Authentication → Users → Add user, mit "Auto Confirm
 * User"); dabei wird keine E-Mail verschickt.
 *
 * Auf "true" gesetzt = offen: Die Registrierung erscheint in der App und jeder
 * kann sich anmelden. Vorher muss in Supabase ein echter E-Mail-Versand (SMTP)
 * eingerichtet sein, sonst kommen die Bestätigungslinks nicht an. Siehe README.
 *
 * Nur serverseitig lesen — der Wert ist bewusst nicht NEXT_PUBLIC_, damit die
 * Prüfung nicht im Browser umgangen werden kann.
 */
export function istRegistrierungOffen(): boolean {
  return process.env.REGISTRIERUNG_OFFEN === "true";
}
