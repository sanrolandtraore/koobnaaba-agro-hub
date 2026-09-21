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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      field_agents: {
        Row: {
          active_villages: number
          assigned_operators: number
          created_at: string
          id: string
          is_active: boolean
          languages: string[]
          name: string
          phone: string | null
          updated_at: string
          user_id: string
          whatsapp: string | null
          zone: string | null
        }
        Insert: {
          active_villages?: number
          assigned_operators?: number
          created_at?: string
          id?: string
          is_active?: boolean
          languages?: string[]
          name: string
          phone?: string | null
          updated_at?: string
          user_id: string
          whatsapp?: string | null
          zone?: string | null
        }
        Update: {
          active_villages?: number
          assigned_operators?: number
          created_at?: string
          id?: string
          is_active?: boolean
          languages?: string[]
          name?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
          whatsapp?: string | null
          zone?: string | null
        }
        Relationships: []
      }
      mechanization_jobs: {
        Row: {
          area_ha: number
          created_at: string
          deposit_amount: number
          duration_hours: number | null
          engine_hours_end: number | null
          engine_hours_start: number | null
          escrow_status: string
          farmer_phone: string | null
          field_agent_id: string | null
          field_agent_name: string | null
          field_agent_phone: string | null
          fuel_liters: number | null
          id: string
          job_status: string
          machine_id: string | null
          machine_name: string | null
          notes: string | null
          operator_name: string | null
          operator_phone: string | null
          parcel_id: string | null
          parcel_name: string
          partner_id: string | null
          payment_method: string
          requester_id: string
          scheduled_date: string
          service_id: string | null
          service_type: string
          soil_type: string | null
          total_cost: number
          updated_at: string
        }
        Insert: {
          area_ha: number
          created_at?: string
          deposit_amount?: number
          duration_hours?: number | null
          engine_hours_end?: number | null
          engine_hours_start?: number | null
          escrow_status?: string
          farmer_phone?: string | null
          field_agent_id?: string | null
          field_agent_name?: string | null
          field_agent_phone?: string | null
          fuel_liters?: number | null
          id?: string
          job_status?: string
          machine_id?: string | null
          machine_name?: string | null
          notes?: string | null
          operator_name?: string | null
          operator_phone?: string | null
          parcel_id?: string | null
          parcel_name: string
          partner_id?: string | null
          payment_method: string
          requester_id: string
          scheduled_date: string
          service_id?: string | null
          service_type: string
          soil_type?: string | null
          total_cost: number
          updated_at?: string
        }
        Update: {
          area_ha?: number
          created_at?: string
          deposit_amount?: number
          duration_hours?: number | null
          engine_hours_end?: number | null
          engine_hours_start?: number | null
          escrow_status?: string
          farmer_phone?: string | null
          field_agent_id?: string | null
          field_agent_name?: string | null
          field_agent_phone?: string | null
          fuel_liters?: number | null
          id?: string
          job_status?: string
          machine_id?: string | null
          machine_name?: string | null
          notes?: string | null
          operator_name?: string | null
          operator_phone?: string | null
          parcel_id?: string | null
          parcel_name?: string
          partner_id?: string | null
          payment_method?: string
          requester_id?: string
          scheduled_date?: string
          service_id?: string | null
          service_type?: string
          soil_type?: string | null
          total_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mechanization_jobs_field_agent_id_fkey"
            columns: ["field_agent_id"]
            isOneToOne: false
            referencedRelation: "field_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mechanization_jobs_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "mechanization_machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mechanization_jobs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "mechanization_services"
            referencedColumns: ["id"]
          },
        ]
      }
      mechanization_machines: {
        Row: {
          brand_model: string
          category: string
          completed_jobs: number
          created_at: string
          daily_capacity_ha: number | null
          engine_hours: number | null
          fuel_type: string
          hourly_rate: number | null
          id: string
          image_url: string | null
          implements_included: string[]
          is_active: boolean
          latitude: number | null
          location: string | null
          longitude: number | null
          operator_included: boolean
          partner_id: string
          power_hp: number | null
          price_per_ha: number | null
          rating: number | null
          region: string | null
          status: string
          title: string
          transmission: string | null
          updated_at: string
          verified: boolean
          year: number | null
        }
        Insert: {
          brand_model: string
          category: string
          completed_jobs?: number
          created_at?: string
          daily_capacity_ha?: number | null
          engine_hours?: number | null
          fuel_type?: string
          hourly_rate?: number | null
          id?: string
          image_url?: string | null
          implements_included?: string[]
          is_active?: boolean
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          operator_included?: boolean
          partner_id: string
          power_hp?: number | null
          price_per_ha?: number | null
          rating?: number | null
          region?: string | null
          status?: string
          title: string
          transmission?: string | null
          updated_at?: string
          verified?: boolean
          year?: number | null
        }
        Update: {
          brand_model?: string
          category?: string
          completed_jobs?: number
          created_at?: string
          daily_capacity_ha?: number | null
          engine_hours?: number | null
          fuel_type?: string
          hourly_rate?: number | null
          id?: string
          image_url?: string | null
          implements_included?: string[]
          is_active?: boolean
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          operator_included?: boolean
          partner_id?: string
          power_hp?: number | null
          price_per_ha?: number | null
          rating?: number | null
          region?: string | null
          status?: string
          title?: string
          transmission?: string | null
          updated_at?: string
          verified?: boolean
          year?: number | null
        }
        Relationships: []
      }
      mechanization_services: {
        Row: {
          base_rate_per_ha: number
          category: string
          created_at: string
          description: string | null
          fuel_per_ha_liters: number
          hours_per_ha: number
          icon_name: string | null
          id: string
          is_active: boolean
          name: string
          partner_id: string
          rate_unit: string
          updated_at: string
        }
        Insert: {
          base_rate_per_ha: number
          category: string
          created_at?: string
          description?: string | null
          fuel_per_ha_liters?: number
          hours_per_ha?: number
          icon_name?: string | null
          id?: string
          is_active?: boolean
          name: string
          partner_id: string
          rate_unit: string
          updated_at?: string
        }
        Update: {
          base_rate_per_ha?: number
          category?: string
          created_at?: string
          description?: string | null
          fuel_per_ha_liters?: number
          hours_per_ha?: number
          icon_name?: string | null
          id?: string
          is_active?: boolean
          name?: string
          partner_id?: string
          rate_unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      service_offers: {
        Row: {
          category: string
          created_at: string
          currency: string
          description: string | null
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          partner_id: string
          price: number | null
          service_area: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          partner_id: string
          price?: number | null
          service_area?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          partner_id?: string
          price?: number | null
          service_area?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
