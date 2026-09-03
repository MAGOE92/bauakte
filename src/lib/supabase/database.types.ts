export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      angebote: {
        Row: {
          betrag: number
          direkt_von_firma: boolean
          dokument_id: string | null
          eingereicht_am: string
          firma_id: string
          id: string
          notiz: string | null
          project_id: string
          status: Database["public"]["Enums"]["angebot_status"]
          vergabe_id: string | null
        }
        Insert: {
          betrag: number
          direkt_von_firma?: boolean
          dokument_id?: string | null
          eingereicht_am?: string
          firma_id: string
          id?: string
          notiz?: string | null
          project_id: string
          status?: Database["public"]["Enums"]["angebot_status"]
          vergabe_id?: string | null
        }
        Update: {
          betrag?: number
          direkt_von_firma?: boolean
          dokument_id?: string | null
          eingereicht_am?: string
          firma_id?: string
          id?: string
          notiz?: string | null
          project_id?: string
          status?: Database["public"]["Enums"]["angebot_status"]
          vergabe_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "angebote_dokument_id_fkey"
            columns: ["dokument_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "angebote_firma_id_fkey"
            columns: ["firma_id"]
            isOneToOne: false
            referencedRelation: "firmen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "angebote_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "angebote_vergabe_id_fkey"
            columns: ["vergabe_id"]
            isOneToOne: false
            referencedRelation: "vergaben"
            referencedColumns: ["id"]
          },
        ]
      }
      ausgaben: {
        Row: {
          art: Database["public"]["Enums"]["ausgabe_art"]
          betrag: number
          bezahlt: boolean
          bezahlt_am: string | null
          bezeichnung: string
          dokument_id: string | null
          einheit_id: string | null
          erstellt_am: string
          faellig_am: string | null
          firma_id: string | null
          id: string
          kategorie: Database["public"]["Enums"]["ausgabe_kategorie"]
          project_id: string | null
          property_id: string
        }
        Insert: {
          art?: Database["public"]["Enums"]["ausgabe_art"]
          betrag: number
          bezahlt?: boolean
          bezahlt_am?: string | null
          bezeichnung: string
          dokument_id?: string | null
          einheit_id?: string | null
          erstellt_am?: string
          faellig_am?: string | null
          firma_id?: string | null
          id?: string
          kategorie: Database["public"]["Enums"]["ausgabe_kategorie"]
          project_id?: string | null
          property_id: string
        }
        Update: {
          art?: Database["public"]["Enums"]["ausgabe_art"]
          betrag?: number
          bezahlt?: boolean
          bezahlt_am?: string | null
          bezeichnung?: string
          dokument_id?: string | null
          einheit_id?: string | null
          erstellt_am?: string
          faellig_am?: string | null
          firma_id?: string | null
          id?: string
          kategorie?: Database["public"]["Enums"]["ausgabe_kategorie"]
          project_id?: string | null
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ausgaben_dokument_id_fkey"
            columns: ["dokument_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ausgaben_firma_id_fkey"
            columns: ["firma_id"]
            isOneToOne: false
            referencedRelation: "firmen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ausgaben_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          datei_groesse_bytes: number | null
          datei_typ: string | null
          hochgeladen_am: string
          hochgeladen_von: string
          id: string
          kategorie: string
          name: string
          ordner_id: string | null
          project_id: string | null
          property_id: string
          storage_pfad: string
        }
        Insert: {
          datei_groesse_bytes?: number | null
          datei_typ?: string | null
          hochgeladen_am?: string
          hochgeladen_von?: string
          id?: string
          kategorie: string
          name: string
          ordner_id?: string | null
          project_id?: string | null
          property_id: string
          storage_pfad: string
        }
        Update: {
          datei_groesse_bytes?: number | null
          datei_typ?: string | null
          hochgeladen_am?: string
          hochgeladen_von?: string
          id?: string
          kategorie?: string
          name?: string
          ordner_id?: string | null
          project_id?: string | null
          property_id?: string
          storage_pfad?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_ordner_id_fkey"
            columns: ["ordner_id"]
            isOneToOne: false
            referencedRelation: "ordner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      einheiten: {
        Row: {
          erstellt_am: string
          geaendert_am: string
          id: string
          mieter_name: string | null
          name: string
          notizen: string | null
          nutzung: Database["public"]["Enums"]["einheit_nutzung"]
          property_id: string
          wohnflaeche: number | null
        }
        Insert: {
          erstellt_am?: string
          geaendert_am?: string
          id?: string
          mieter_name?: string | null
          name: string
          notizen?: string | null
          nutzung?: Database["public"]["Enums"]["einheit_nutzung"]
          property_id: string
          wohnflaeche?: number | null
        }
        Update: {
          erstellt_am?: string
          geaendert_am?: string
          id?: string
          mieter_name?: string | null
          name?: string
          notizen?: string | null
          nutzung?: Database["public"]["Enums"]["einheit_nutzung"]
          property_id?: string
          wohnflaeche?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "einheiten_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      einnahmen: {
        Row: {
          betrag: number
          bezeichnung: string
          datum: string
          einheit_id: string | null
          erstellt_am: string
          id: string
          notizen: string | null
          project_id: string | null
          property_id: string
        }
        Insert: {
          betrag: number
          bezeichnung: string
          datum?: string
          einheit_id?: string | null
          erstellt_am?: string
          id?: string
          notizen?: string | null
          project_id?: string | null
          property_id: string
        }
        Update: {
          betrag?: number
          bezeichnung?: string
          datum?: string
          einheit_id?: string | null
          erstellt_am?: string
          id?: string
          notizen?: string | null
          project_id?: string | null
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "einnahmen_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      laufende_posten: {
        Row: {
          art: Database["public"]["Enums"]["posten_art"]
          betrag: number
          bezeichnung: string
          einheit_id: string | null
          erstellt_am: string
          geaendert_am: string
          gilt_ab: string
          gilt_bis: string | null
          id: string
          kategorie: Database["public"]["Enums"]["laufend_kategorie"]
          notizen: string | null
          property_id: string
          turnus: Database["public"]["Enums"]["turnus"]
          umlagefaehig: boolean
        }
        Insert: {
          art: Database["public"]["Enums"]["posten_art"]
          betrag: number
          bezeichnung: string
          einheit_id?: string | null
          erstellt_am?: string
          geaendert_am?: string
          gilt_ab?: string
          gilt_bis?: string | null
          id?: string
          kategorie: Database["public"]["Enums"]["laufend_kategorie"]
          notizen?: string | null
          property_id: string
          turnus?: Database["public"]["Enums"]["turnus"]
          umlagefaehig?: boolean
        }
        Update: {
          art?: Database["public"]["Enums"]["posten_art"]
          betrag?: number
          bezeichnung?: string
          einheit_id?: string | null
          erstellt_am?: string
          geaendert_am?: string
          gilt_ab?: string
          gilt_bis?: string | null
          id?: string
          kategorie?: Database["public"]["Enums"]["laufend_kategorie"]
          notizen?: string | null
          property_id?: string
          turnus?: Database["public"]["Enums"]["turnus"]
          umlagefaehig?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "laufende_posten_einheit_id_fkey"
            columns: ["einheit_id"]
            isOneToOne: false
            referencedRelation: "einheiten"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "laufende_posten_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      firmen: {
        Row: {
          ansprechpartner: string | null
          email: string | null
          erstellt_am: string
          gewerk: string | null
          id: string
          name: string
          notizen: string | null
          owner_id: string
          telefon: string | null
        }
        Insert: {
          ansprechpartner?: string | null
          email?: string | null
          erstellt_am?: string
          gewerk?: string | null
          id?: string
          name: string
          notizen?: string | null
          owner_id: string
          telefon?: string | null
        }
        Update: {
          ansprechpartner?: string | null
          email?: string | null
          erstellt_am?: string
          gewerk?: string | null
          id?: string
          name?: string
          notizen?: string | null
          owner_id?: string
          telefon?: string | null
        }
        Relationships: []
      }
      freigabe_dokumente: {
        Row: {
          document_id: string
          freigabe_id: string
        }
        Insert: {
          document_id: string
          freigabe_id: string
        }
        Update: {
          document_id?: string
          freigabe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freigabe_dokumente_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "freigabe_dokumente_freigabe_id_fkey"
            columns: ["freigabe_id"]
            isOneToOne: false
            referencedRelation: "freigaben"
            referencedColumns: ["id"]
          },
        ]
      }
      ordner: {
        Row: {
          erstellt_am: string
          id: string
          name: string
          parent_id: string | null
          project_id: string | null
          property_id: string
        }
        Insert: {
          erstellt_am?: string
          id?: string
          name: string
          parent_id?: string | null
          project_id?: string | null
          property_id: string
        }
        Update: {
          erstellt_am?: string
          id?: string
          name?: string
          parent_id?: string | null
          project_id?: string | null
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ordner_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ordner"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordner_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordner_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      freigaben: {
        Row: {
          empfaenger_email: string | null
          empfaenger_name: string
          erstellt_am: string
          id: string
          laeuft_ab_am: string
          project_id: string
          token: string
          widerrufen_am: string | null
        }
        Insert: {
          empfaenger_email?: string | null
          empfaenger_name: string
          erstellt_am?: string
          id?: string
          laeuft_ab_am: string
          project_id: string
          token?: string
          widerrufen_am?: string | null
        }
        Update: {
          empfaenger_email?: string | null
          empfaenger_name?: string
          erstellt_am?: string
          id?: string
          laeuft_ab_am?: string
          project_id?: string
          token?: string
          widerrufen_am?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "freigaben_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          beschreibung: string | null
          budget_gesamt: number
          erstellt_am: string
          geaendert_am: string
          id: string
          name: string
          property_id: string
          status: Database["public"]["Enums"]["projekt_status"]
          zeitraum_bis: string | null
          zeitraum_von: string | null
        }
        Insert: {
          beschreibung?: string | null
          budget_gesamt?: number
          erstellt_am?: string
          geaendert_am?: string
          id?: string
          name: string
          property_id: string
          status?: Database["public"]["Enums"]["projekt_status"]
          zeitraum_bis?: string | null
          zeitraum_von?: string | null
        }
        Update: {
          beschreibung?: string | null
          budget_gesamt?: number
          erstellt_am?: string
          geaendert_am?: string
          id?: string
          name?: string
          property_id?: string
          status?: Database["public"]["Enums"]["projekt_status"]
          zeitraum_bis?: string | null
          zeitraum_von?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      projekt_firmen: {
        Row: {
          erstellt_am: string
          firma_id: string
          freigabestufe: Database["public"]["Enums"]["freigabestufe"]
          gewerk: string | null
          id: string
          notizen: string | null
          project_id: string
          vergabe_id: string | null
          vertragsart: Database["public"]["Enums"]["vertragsart"] | null
        }
        Insert: {
          erstellt_am?: string
          firma_id: string
          freigabestufe?: Database["public"]["Enums"]["freigabestufe"]
          gewerk?: string | null
          id?: string
          notizen?: string | null
          project_id: string
          vergabe_id?: string | null
          vertragsart?: Database["public"]["Enums"]["vertragsart"] | null
        }
        Update: {
          erstellt_am?: string
          firma_id?: string
          freigabestufe?: Database["public"]["Enums"]["freigabestufe"]
          gewerk?: string | null
          id?: string
          notizen?: string | null
          project_id?: string
          vergabe_id?: string | null
          vertragsart?: Database["public"]["Enums"]["vertragsart"] | null
        }
        Relationships: [
          {
            foreignKeyName: "projekt_firmen_firma_id_fkey"
            columns: ["firma_id"]
            isOneToOne: false
            referencedRelation: "firmen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projekt_firmen_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projekt_firmen_vergabe_id_fkey"
            columns: ["vergabe_id"]
            isOneToOne: false
            referencedRelation: "vergaben"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          adresse: string
          erstellt_am: string
          geaendert_am: string
          id: string
          name: string
          owner_id: string
          status: Database["public"]["Enums"]["immobilie_status"]
          typ: Database["public"]["Enums"]["gebaeude_typ"] | null
        }
        Insert: {
          adresse: string
          erstellt_am?: string
          geaendert_am?: string
          id?: string
          name: string
          owner_id: string
          status?: Database["public"]["Enums"]["immobilie_status"]
          typ?: Database["public"]["Enums"]["gebaeude_typ"] | null
        }
        Update: {
          adresse?: string
          erstellt_am?: string
          geaendert_am?: string
          id?: string
          name?: string
          owner_id?: string
          status?: Database["public"]["Enums"]["immobilie_status"]
          typ?: Database["public"]["Enums"]["gebaeude_typ"] | null
        }
        Relationships: []
      }
      vergabe_dokumente: {
        Row: {
          document_id: string
          vergabe_id: string
        }
        Insert: {
          document_id: string
          vergabe_id: string
        }
        Update: {
          document_id?: string
          vergabe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vergabe_dokumente_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vergabe_dokumente_vergabe_id_fkey"
            columns: ["vergabe_id"]
            isOneToOne: false
            referencedRelation: "vergaben"
            referencedColumns: ["id"]
          },
        ]
      }
      vergaben: {
        Row: {
          beschreibung: string | null
          bewerbungsfrist: string | null
          erstellt_am: string
          gewerk: string
          id: string
          project_id: string
          status: Database["public"]["Enums"]["vergabe_status"]
          titel: string
          token: string
        }
        Insert: {
          beschreibung?: string | null
          bewerbungsfrist?: string | null
          erstellt_am?: string
          gewerk: string
          id?: string
          project_id: string
          status?: Database["public"]["Enums"]["vergabe_status"]
          titel: string
          token?: string
        }
        Update: {
          beschreibung?: string | null
          bewerbungsfrist?: string | null
          erstellt_am?: string
          gewerk?: string
          id?: string
          project_id?: string
          status?: Database["public"]["Enums"]["vergabe_status"]
          titel?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "vergaben_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      angebot_per_link_einreichen: {
        Args: {
          p_ansprechpartner: string
          p_betrag: number
          p_email: string
          p_firmenname: string
          p_notiz: string
          p_telefon: string
          p_token: string
        }
        Returns: Json
      }
      freigabe_by_token: {
        Args: { p_token: string }
        Returns: Json
      }
      vergabe_by_token: {
        Args: { p_token: string }
        Returns: Json
      }
    }
    Enums: {
      angebot_status: "eingegangen" | "abgelehnt" | "angenommen"
      ausgabe_art: "abschlag" | "schluss" | "einzel" | "beleg"
      ausgabe_kategorie:
        | "handwerker"
        | "material"
        | "miete"
        | "gebuehr"
        | "honorar"
        | "versicherung"
        | "sonstiges"
      einheit_nutzung: "eigengenutzt" | "vermietet" | "leerstand"
      freigabestufe: "angefragt" | "im_gespraech" | "beauftragt"
      gebaeude_typ:
        | "einfamilienhaus"
        | "doppelhaushaelfte"
        | "reihenhaus"
        | "mehrfamilienhaus"
        | "eigentumswohnung"
        | "sonstiges"
      immobilie_status: "in_planung" | "aktiv" | "archiviert"
      laufend_kategorie:
        | "miete"
        | "nebenkosten_vorauszahlung"
        | "sonstige_einnahme"
        | "grundsteuer"
        | "versicherung"
        | "heizung_energie"
        | "wasser_abwasser"
        | "muellabfuhr"
        | "strassenreinigung"
        | "schornsteinfeger"
        | "hausreinigung"
        | "gartenpflege"
        | "allgemeinstrom"
        | "aufzug"
        | "kabel_internet"
        | "verwaltung"
        | "instandhaltung"
        | "ruecklage"
        | "darlehen_zins"
        | "darlehen_tilgung"
        | "sonstige_ausgabe"
      posten_art: "einnahme" | "ausgabe"
      projekt_status: "geplant" | "laufend" | "abgeschlossen" | "verworfen"
      tagebuch_zustand: "erfasst" | "kein_einsatz"
      turnus:
        | "monatlich"
        | "quartalsweise"
        | "halbjaehrlich"
        | "jaehrlich"
        | "einmalig"
      vergabe_status: "offen" | "vergeben" | "verworfen"
      vertragsart: "bgb" | "vob"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database["public"]

export type Tables<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof DefaultSchema["Tables"]> =
  DefaultSchema["Tables"][T]["Update"]
export type Enums<T extends keyof DefaultSchema["Enums"]> =
  DefaultSchema["Enums"][T]
