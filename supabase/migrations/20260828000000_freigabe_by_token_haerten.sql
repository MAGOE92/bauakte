-- Härtet die öffentliche Freigabe-Funktion (Security-Advisor-Warnungen).
--
-- Die Funktion MUSS von `anon` aufrufbar bleiben: genau das ist das Produkt-
-- Feature — ein nicht eingeloggter Empfänger (z. B. die Bank) öffnet den Link.
-- Das Sicherheitsmerkmal ist der Token selbst (2x gen_random_uuid = 256 Bit).
--
-- Reduziert wird hier alles, was darüber hinaus geht:
--   1. `authenticated` verliert EXECUTE. Eingeloggte Nutzer lesen die Freigabe
--      über ihre eigenen RLS-Rechte (siehe loadFreigabe.ts), brauchen also
--      keinen Zugriff auf eine SECURITY-DEFINER-Funktion.
--   2. Token-Format wird geprüft, bevor die Tabelle angefasst wird.
--   3. Die interne project-UUID wird nicht mehr nach außen gegeben.

create or replace function public.freigabe_by_token(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_freigabe freigaben%rowtype;
  v_project projects%rowtype;
  v_property properties%rowtype;
  v_result jsonb;
begin
  -- Token wird aus zwei UUIDs ohne Bindestriche erzeugt: exakt 64 Hex-Zeichen.
  if p_token is null or p_token !~ '^[0-9a-f]{64}$' then
    return jsonb_build_object('valid', false, 'reason', 'not_found');
  end if;

  select * into v_freigabe from freigaben where token = p_token;

  if not found then
    return jsonb_build_object('valid', false, 'reason', 'not_found');
  end if;

  if v_freigabe.widerrufen_am is not null then
    return jsonb_build_object('valid', false, 'reason', 'revoked');
  end if;

  if v_freigabe.laeuft_ab_am < now() then
    return jsonb_build_object('valid', false, 'reason', 'expired');
  end if;

  select * into v_project from projects where id = v_freigabe.project_id;
  select * into v_property from properties where id = v_project.property_id;

  select jsonb_build_object(
    'valid', true,
    'freigabe', jsonb_build_object(
      'empfaenger_name', v_freigabe.empfaenger_name,
      'laeuft_ab_am', v_freigabe.laeuft_ab_am
    ),
    'property', jsonb_build_object('name', v_property.name, 'adresse', v_property.adresse),
    'project', jsonb_build_object(
      'name', v_project.name,
      'beschreibung', v_project.beschreibung,
      'status', v_project.status,
      'zeitraum_von', v_project.zeitraum_von,
      'zeitraum_bis', v_project.zeitraum_bis,
      'budget_gesamt', v_project.budget_gesamt
    ),
    'ausgaben', coalesce((select jsonb_agg(jsonb_build_object('betrag', betrag, 'bezahlt', bezahlt)) from ausgaben where project_id = v_project.id), '[]'::jsonb),
    'einnahmen', coalesce((select jsonb_agg(jsonb_build_object('betrag', betrag)) from einnahmen where project_id = v_project.id), '[]'::jsonb),
    'documents', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'kategorie', kategorie, 'hochgeladen_am', hochgeladen_am, 'datei_groesse_bytes', datei_groesse_bytes) order by hochgeladen_am desc) from documents where project_id = v_project.id), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.freigabe_by_token(text) from public;
revoke all on function public.freigabe_by_token(text) from authenticated;
grant execute on function public.freigabe_by_token(text) to anon;
