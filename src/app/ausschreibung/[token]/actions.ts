"use server";

import { createClient } from "@/lib/supabase/server";

export type AngebotEinreichenResult =
  | { status: "ok"; id: string }
  | { status: "error"; message: string };

export async function submitAngebotPerLink(input: {
  token: string;
  firmenname: string;
  ansprechpartner: string;
  email: string;
  telefon: string;
  betrag: string;
  notiz: string;
}): Promise<AngebotEinreichenResult> {
  const betrag = Number(input.betrag.replace(",", "."));
  if (Number.isNaN(betrag) || betrag < 0) {
    return { status: "error", message: "Bitte einen gültigen Betrag angeben." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("angebot_per_link_einreichen", {
    p_token: input.token,
    p_firmenname: input.firmenname,
    p_ansprechpartner: input.ansprechpartner,
    p_email: input.email,
    p_telefon: input.telefon,
    p_betrag: betrag,
    p_notiz: input.notiz,
  });

  if (error || !data) {
    return { status: "error", message: "Das Angebot konnte nicht übermittelt werden." };
  }

  return data as unknown as AngebotEinreichenResult;
}
