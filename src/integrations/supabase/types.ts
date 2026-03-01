export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          cost: number | null
          created_at: string
          crop_cycle_id: string
          date: string
          description: string | null
          id: string
          performed_by: string | null
          quantity: number | null
          unit: string | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["activity_type"]
          cost?: number | null
          created_at?: string
          crop_cycle_id: string
          date?: string
          description?: string | null
          id?: string
          performed_by?: string | null
          quantity?: number | null
          unit?: string | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["activity_type"]
          cost?: number | null
          created_at?: string
          crop_cycle_id?: string
          date?: string
          description?: string | null
          id?: string
          performed_by?: string | null
          quantity?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_crop_cycle_id_fkey"
            columns: ["crop_cycle_id"]
            isOneToOne: false
            referencedRelation: "crop_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      climate_zones: {
        Row: {
          avg_rainfall_mm: number | null
          avg_temp_celsius: number | null
          climate_coefficient: number
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          avg_rainfall_mm?: number | null
          avg_temp_celsius?: number | null
          climate_coefficient?: number
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          avg_rainfall_mm?: number | null
          avg_temp_celsius?: number | null
          climate_coefficient?: number
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      cost_entries: {
        Row: {
          amount: number
          category: Database["public"]["Enums"]["cost_category"]
          created_at: string
          crop_cycle_id: string
          date: string
          description: string
          id: string
        }
        Insert: {
          amount?: number
          category: Database["public"]["Enums"]["cost_category"]
          created_at?: string
          crop_cycle_id: string
          date?: string
          description: string
          id?: string
        }
        Update: {
          amount?: number
          category?: Database["public"]["Enums"]["cost_category"]
          created_at?: string
          crop_cycle_id?: string
          date?: string
          description?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_entries_crop_cycle_id_fkey"
            columns: ["crop_cycle_id"]
            isOneToOne: false
            referencedRelation: "crop_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_cycles: {
        Row: {
          actual_revenue: number | null
          actual_yield_kg: number | null
          created_at: string
          crop_reference_id: string | null
          end_date: string | null
          expected_revenue: number | null
          expected_yield_kg: number | null
          id: string
          notes: string | null
          parcel_id: string
          season: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          actual_revenue?: number | null
          actual_yield_kg?: number | null
          created_at?: string
          crop_reference_id?: string | null
          end_date?: string | null
          expected_revenue?: number | null
          expected_yield_kg?: number | null
          id?: string
          notes?: string | null
          parcel_id: string
          season: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          actual_revenue?: number | null
          actual_yield_kg?: number | null
          created_at?: string
          crop_reference_id?: string | null
          end_date?: string | null
          expected_revenue?: number | null
          expected_yield_kg?: number | null
          id?: string
          notes?: string | null
          parcel_id?: string
          season?: string
          start_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crop_cycles_crop_reference_id_fkey"
            columns: ["crop_reference_id"]
            isOneToOne: false
            referencedRelation: "crop_references"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_cycles_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "parcels"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_references: {
        Row: {
          avg_price_per_kg: number | null
          avg_yield_per_ha: number | null
          created_at: string
          growth_duration_days: number | null
          id: string
          input_requirements: Json | null
          name: string
          plants_per_ha: number | null
          spacing_m: number | null
          type: string
          variety: string | null
        }
        Insert: {
          avg_price_per_kg?: number | null
          avg_yield_per_ha?: number | null
          created_at?: string
          growth_duration_days?: number | null
          id?: string
          input_requirements?: Json | null
          name: string
          plants_per_ha?: number | null
          spacing_m?: number | null
          type?: string
          variety?: string | null
        }
        Update: {
          avg_price_per_kg?: number | null
          avg_yield_per_ha?: number | null
          created_at?: string
          growth_duration_days?: number | null
          id?: string
          input_requirements?: Json | null
          name?: string
          plants_per_ha?: number | null
          spacing_m?: number | null
          type?: string
          variety?: string | null
        }
        Relationships: []
      }
      farms: {
        Row: {
          climate_zone_id: string | null
          created_at: string
          id: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          name: string
          total_area_ha: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          climate_zone_id?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          name: string
          total_area_ha?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          climate_zone_id?: string | null
          created_at?: string
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          name?: string
          total_area_ha?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farms_climate_zone_id_fkey"
            columns: ["climate_zone_id"]
            isOneToOne: false
            referencedRelation: "climate_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      parcels: {
        Row: {
          area_ha: number
          created_at: string
          farm_id: string
          id: string
          irrigation_type: string | null
          latitude: number | null
          longitude: number | null
          name: string
          soil_type: string | null
          status: string
          updated_at: string
        }
        Insert: {
          area_ha?: number
          created_at?: string
          farm_id: string
          id?: string
          irrigation_type?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          soil_type?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          area_ha?: number
          created_at?: string
          farm_id?: string
          id?: string
          irrigation_type?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          soil_type?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "parcels_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          locale: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          locale?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          locale?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_farm_owner_from_cycle: {
        Args: { _cycle_id: string }
        Returns: string
      }
      get_farm_owner_from_parcel: {
        Args: { _parcel_id: string }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      activity_type:
        | "labour"
        | "semis"
        | "irrigation"
        | "fertilisation"
        | "traitement"
        | "recolte"
        | "autre"
      app_role: "admin" | "manager" | "farmer" | "viewer"
      cost_category:
        | "intrant"
        | "main_oeuvre"
        | "equipement"
        | "transport"
        | "autre"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      activity_type: [
        "labour",
        "semis",
        "irrigation",
        "fertilisation",
        "traitement",
        "recolte",
        "autre",
      ],
      app_role: ["admin", "manager", "farmer", "viewer"],
      cost_category: [
        "intrant",
        "main_oeuvre",
        "equipement",
        "transport",
        "autre",
      ],
    },
  },
} as const
