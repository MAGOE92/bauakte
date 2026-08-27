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
          dokument_id: string | null
          eingereicht_am: string
          firma_id: string
          id: string
          project_id: string
          status: Database["public"]["Enums"]["angebot_status"]
          vergabe_id: string | null
        }
        Insert: {
          betrag: number
          dokument_id?: string | null
          eingereicht_am?: string
          firma_id: string
          id?: string
          project_id: string
          status?: Database["public"]["Enums"]["angebot_status"]
          vergabe_id?: string | null
        }
        Update: {
          betrag?: number
          dokument_id?: string | null
          eingereicht_am?: string
          firma_id?: string
          id?: string
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
          erstellt_am: string
          faellig_am: string | null
          firma_id: string | null
          id: string
          kategorie: Database["public"]["Enums"]["ausgabe_kategorie"]
          project_id: string
        }
        Insert: {
          art?: Database["public"]["Enums"]["ausgabe_art"]
          betrag: number
          bezahlt?: boolean
          bezahlt_am?: string | null
          bezeichnung: string
          dokument_id?: string | null
          erstellt_am?: string
          faellig_am?: string | null
          firma_id?: string | null
          id?: string
          kategorie: Database["public"]["Enums"]["ausgabe_kategorie"]
          project_id: string
        }
        Update: {
          art?: Database["public"]["Enums"]["ausgabe_art"]
          betrag?: number
          bezahlt?: boolean
          bezahlt_am?: string | null
          bezeichnung?: string
          dokument_id?: string | null
          erstellt_am?: string
          faellig_am?: string | null
          firma_id?: string | null
          id?: string
          kategorie?: Database["public"]["Enums"]["ausgabe_kategorie"]
          project_id?: string
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
          project_id?: string | null
          property_id?: string
          storage_pfad?: string
        }
        Relationships: [
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
      einnahmen: {
        Row: {
          betrag: number
          bezeichnung: string
          datum: string
          erstellt_am: string
          id: string
          notizen: string | null
          project_id: string
        }
        Insert: {
          betrag: number
          bezeichnung: string
          datum?: string
          erstellt_am?: string
          id?: string
          notizen?: string | null
          project_id: string
        }
        Update: {
          betrag?: number
          bezeichnung?: string
          datum?: string
          erstellt_am?: string
          id?: string
          notizen?: string | null
          project_id?: string
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
      freigabe_by_token: {
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
      freigabestufe: "angefragt" | "im_gespraech" | "beauftragt"
      gebaeude_typ:
        | "einfamilienhaus"
        | "doppelhaushaelfte"
        | "reihenhaus"
        | "mehrfamilienhaus"
        | "eigentumswohnung"
        | "sonstiges"
      immobilie_status: "in_planung" | "aktiv" | "archiviert"
      projekt_status: "geplant" | "laufend" | "abgeschlossen" | "verworfen"
      tagebuch_zustand: "erfasst" | "kein_einsatz"
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
