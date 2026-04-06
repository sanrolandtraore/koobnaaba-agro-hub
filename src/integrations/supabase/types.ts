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
      animal_feedings: {
        Row: {
          animal_id: string | null
          cost: number | null
          created_at: string
          farm_id: string
          feed_type: string
          feeding_date: string
          id: string
          notes: string | null
          quantity_kg: number
        }
        Insert: {
          animal_id?: string | null
          cost?: number | null
          created_at?: string
          farm_id: string
          feed_type: string
          feeding_date?: string
          id?: string
          notes?: string | null
          quantity_kg?: number
        }
        Update: {
          animal_id?: string | null
          cost?: number | null
          created_at?: string
          farm_id?: string
          feed_type?: string
          feeding_date?: string
          id?: string
          notes?: string | null
          quantity_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "animal_feedings_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_feedings_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      animal_health_events: {
        Row: {
          animal_id: string
          cost: number | null
          created_at: string
          description: string | null
          dosage: string | null
          event_date: string
          event_type: string
          id: string
          medication: string | null
          next_date: string | null
          notes: string | null
          vet_name: string | null
        }
        Insert: {
          animal_id: string
          cost?: number | null
          created_at?: string
          description?: string | null
          dosage?: string | null
          event_date?: string
          event_type?: string
          id?: string
          medication?: string | null
          next_date?: string | null
          notes?: string | null
          vet_name?: string | null
        }
        Update: {
          animal_id?: string
          cost?: number | null
          created_at?: string
          description?: string | null
          dosage?: string | null
          event_date?: string
          event_type?: string
          id?: string
          medication?: string | null
          next_date?: string | null
          notes?: string | null
          vet_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "animal_health_events_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      animal_reproductions: {
        Row: {
          actual_birth_date: string | null
          animal_id: string
          cost: number | null
          created_at: string
          event_date: string
          event_type: string
          expected_birth_date: string | null
          id: string
          notes: string | null
          offspring_alive: number | null
          offspring_count: number | null
          partner_id: string | null
        }
        Insert: {
          actual_birth_date?: string | null
          animal_id: string
          cost?: number | null
          created_at?: string
          event_date?: string
          event_type?: string
          expected_birth_date?: string | null
          id?: string
          notes?: string | null
          offspring_alive?: number | null
          offspring_count?: number | null
          partner_id?: string | null
        }
        Update: {
          actual_birth_date?: string | null
          animal_id?: string
          cost?: number | null
          created_at?: string
          event_date?: string
          event_type?: string
          expected_birth_date?: string | null
          id?: string
          notes?: string | null
          offspring_alive?: number | null
          offspring_count?: number | null
          partner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "animal_reproductions_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_reproductions_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      animals: {
        Row: {
          acquisition_cost: number | null
          acquisition_date: string | null
          birth_date: string | null
          breed: string | null
          created_at: string
          farm_id: string
          father_id: string | null
          id: string
          identification_number: string | null
          mother_id: string | null
          name: string | null
          notes: string | null
          sex: Database["public"]["Enums"]["animal_sex"]
          species: Database["public"]["Enums"]["animal_species"]
          status: string
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          acquisition_cost?: number | null
          acquisition_date?: string | null
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          farm_id: string
          father_id?: string | null
          id?: string
          identification_number?: string | null
          mother_id?: string | null
          name?: string | null
          notes?: string | null
          sex?: Database["public"]["Enums"]["animal_sex"]
          species: Database["public"]["Enums"]["animal_species"]
          status?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          acquisition_cost?: number | null
          acquisition_date?: string | null
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          farm_id?: string
          father_id?: string | null
          id?: string
          identification_number?: string | null
          mother_id?: string | null
          name?: string | null
          notes?: string | null
          sex?: Database["public"]["Enums"]["animal_sex"]
          species?: Database["public"]["Enums"]["animal_species"]
          status?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "animals_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animals_father_id_fkey"
            columns: ["father_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animals_mother_id_fkey"
            columns: ["mother_id"]
            isOneToOne: false
            referencedRelation: "animals"
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
      cooperative_collectes: {
        Row: {
          buyer: string | null
          collecte_date: string
          cooperative_user_id: string
          created_at: string
          id: string
          member_id: string | null
          notes: string | null
          product_name: string
          product_type: string
          quality_grade: string | null
          quantity_kg: number
          season: string | null
          status: string
          total_amount: number | null
          unit_price: number | null
          warehouse: string | null
        }
        Insert: {
          buyer?: string | null
          collecte_date?: string
          cooperative_user_id: string
          created_at?: string
          id?: string
          member_id?: string | null
          notes?: string | null
          product_name: string
          product_type?: string
          quality_grade?: string | null
          quantity_kg?: number
          season?: string | null
          status?: string
          total_amount?: number | null
          unit_price?: number | null
          warehouse?: string | null
        }
        Update: {
          buyer?: string | null
          collecte_date?: string
          cooperative_user_id?: string
          created_at?: string
          id?: string
          member_id?: string | null
          notes?: string | null
          product_name?: string
          product_type?: string
          quality_grade?: string | null
          quantity_kg?: number
          season?: string | null
          status?: string
          total_amount?: number | null
          unit_price?: number | null
          warehouse?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cooperative_collectes_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "cooperative_members"
            referencedColumns: ["id"]
          },
        ]
      }
      cooperative_cotisations: {
        Row: {
          amount: number
          cooperative_user_id: string
          cotisation_date: string
          created_at: string
          id: string
          member_id: string | null
          notes: string | null
          period: string
          status: string
        }
        Insert: {
          amount?: number
          cooperative_user_id: string
          cotisation_date?: string
          created_at?: string
          id?: string
          member_id?: string | null
          notes?: string | null
          period?: string
          status?: string
        }
        Update: {
          amount?: number
          cooperative_user_id?: string
          cotisation_date?: string
          created_at?: string
          id?: string
          member_id?: string | null
          notes?: string | null
          period?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cooperative_cotisations_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "cooperative_members"
            referencedColumns: ["id"]
          },
        ]
      }
      cooperative_distributions: {
        Row: {
          cooperative_user_id: string
          created_at: string
          id: string
          member_id: string | null
          member_share: number
          notes: string | null
          paid: boolean
          paid_date: string | null
          quantity_kg: number
          sale_id: string | null
        }
        Insert: {
          cooperative_user_id: string
          created_at?: string
          id?: string
          member_id?: string | null
          member_share?: number
          notes?: string | null
          paid?: boolean
          paid_date?: string | null
          quantity_kg?: number
          sale_id?: string | null
        }
        Update: {
          cooperative_user_id?: string
          created_at?: string
          id?: string
          member_id?: string | null
          member_share?: number
          notes?: string | null
          paid?: boolean
          paid_date?: string | null
          quantity_kg?: number
          sale_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cooperative_distributions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "cooperative_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cooperative_distributions_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "cooperative_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      cooperative_documents: {
        Row: {
          cooperative_user_id: string
          created_at: string
          description: string | null
          document_type: string
          file_url: string | null
          id: string
          title: string
        }
        Insert: {
          cooperative_user_id: string
          created_at?: string
          description?: string | null
          document_type?: string
          file_url?: string | null
          id?: string
          title: string
        }
        Update: {
          cooperative_user_id?: string
          created_at?: string
          description?: string | null
          document_type?: string
          file_url?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      cooperative_equipment_schedule: {
        Row: {
          cooperative_user_id: string
          created_at: string
          duration_hours: number
          equipment_name: string
          equipment_type: string
          id: string
          member_id: string | null
          notes: string | null
          parcel_id: string | null
          scheduled_date: string
          status: string
        }
        Insert: {
          cooperative_user_id: string
          created_at?: string
          duration_hours?: number
          equipment_name: string
          equipment_type?: string
          id?: string
          member_id?: string | null
          notes?: string | null
          parcel_id?: string | null
          scheduled_date: string
          status?: string
        }
        Update: {
          cooperative_user_id?: string
          created_at?: string
          duration_hours?: number
          equipment_name?: string
          equipment_type?: string
          id?: string
          member_id?: string | null
          notes?: string | null
          parcel_id?: string | null
          scheduled_date?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "cooperative_equipment_schedule_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "cooperative_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cooperative_equipment_schedule_parcel_id_fkey"
            columns: ["parcel_id"]
            isOneToOne: false
            referencedRelation: "cooperative_parcels"
            referencedColumns: ["id"]
          },
        ]
      }
      cooperative_expenses: {
        Row: {
          amount: number
          approved_by: string | null
          category: string
          cooperative_user_id: string
          created_at: string
          description: string
          expense_date: string
          id: string
          notes: string | null
        }
        Insert: {
          amount?: number
          approved_by?: string | null
          category?: string
          cooperative_user_id: string
          created_at?: string
          description: string
          expense_date?: string
          id?: string
          notes?: string | null
        }
        Update: {
          amount?: number
          approved_by?: string | null
          category?: string
          cooperative_user_id?: string
          created_at?: string
          description?: string
          expense_date?: string
          id?: string
          notes?: string | null
        }
        Relationships: []
      }
      cooperative_members: {
        Row: {
          area_ha: number | null
          cooperative_role: string
          cooperative_user_id: string
          created_at: string
          crop_type: string | null
          full_name: string
          id: string
          joined_date: string
          linked_user_id: string | null
          livestock_type: string | null
          location: string | null
          member_type: string
          notes: string | null
          phone: string | null
          status: string
          updated_at: string
        }
        Insert: {
          area_ha?: number | null
          cooperative_role?: string
          cooperative_user_id: string
          created_at?: string
          crop_type?: string | null
          full_name: string
          id?: string
          joined_date?: string
          linked_user_id?: string | null
          livestock_type?: string | null
          location?: string | null
          member_type?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          area_ha?: number | null
          cooperative_role?: string
          cooperative_user_id?: string
          created_at?: string
          crop_type?: string | null
          full_name?: string
          id?: string
          joined_date?: string
          linked_user_id?: string | null
          livestock_type?: string | null
          location?: string | null
          member_type?: string
          notes?: string | null
          phone?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      cooperative_parcels: {
        Row: {
          area_ha: number
          assigned_members: string[] | null
          cooperative_user_id: string
          created_at: string
          crop_type: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          season: string | null
          status: string
        }
        Insert: {
          area_ha?: number
          assigned_members?: string[] | null
          cooperative_user_id: string
          created_at?: string
          crop_type?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          season?: string | null
          status?: string
        }
        Update: {
          area_ha?: number
          assigned_members?: string[] | null
          cooperative_user_id?: string
          created_at?: string
          crop_type?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          season?: string | null
          status?: string
        }
        Relationships: []
      }
      cooperative_profiles: {
        Row: {
          address: string | null
          cooperative_user_id: string
          created_at: string
          creation_date: string | null
          description: string | null
          email: string | null
          id: string
          invite_code: string | null
          legal_status: string | null
          logo_url: string | null
          name: string
          phone: string | null
          region: string | null
          registration_number: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          cooperative_user_id: string
          created_at?: string
          creation_date?: string | null
          description?: string | null
          email?: string | null
          id?: string
          invite_code?: string | null
          legal_status?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          region?: string | null
          registration_number?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          cooperative_user_id?: string
          created_at?: string
          creation_date?: string | null
          description?: string | null
          email?: string | null
          id?: string
          invite_code?: string | null
          legal_status?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          region?: string | null
          registration_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cooperative_sales: {
        Row: {
          buyer: string | null
          cooperative_user_id: string
          created_at: string
          id: string
          notes: string | null
          payment_status: string
          product_name: string
          product_type: string
          quantity_kg: number
          sale_date: string
          total_amount: number
          unit_price: number
        }
        Insert: {
          buyer?: string | null
          cooperative_user_id: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_status?: string
          product_name: string
          product_type?: string
          quantity_kg?: number
          sale_date?: string
          total_amount?: number
          unit_price?: number
        }
        Update: {
          buyer?: string | null
          cooperative_user_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_status?: string
          product_name?: string
          product_type?: string
          quantity_kg?: number
          sale_date?: string
          total_amount?: number
          unit_price?: number
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
      crop_calendar_events: {
        Row: {
          completed: boolean
          completed_date: string | null
          created_at: string
          crop_cycle_id: string
          event_type: string
          id: string
          notes: string | null
          planned_date: string
          title: string
        }
        Insert: {
          completed?: boolean
          completed_date?: string | null
          created_at?: string
          crop_cycle_id: string
          event_type?: string
          id?: string
          notes?: string | null
          planned_date: string
          title: string
        }
        Update: {
          completed?: boolean
          completed_date?: string | null
          created_at?: string
          crop_cycle_id?: string
          event_type?: string
          id?: string
          notes?: string | null
          planned_date?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "crop_calendar_events_crop_cycle_id_fkey"
            columns: ["crop_cycle_id"]
            isOneToOne: false
            referencedRelation: "crop_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_cycle_inputs: {
        Row: {
          created_at: string
          crop_cycle_id: string
          id: string
          input_name: string
          quantity_per_ha: number
          total_cost: number | null
          total_quantity: number
          unit: string
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          crop_cycle_id: string
          id?: string
          input_name: string
          quantity_per_ha?: number
          total_cost?: number | null
          total_quantity?: number
          unit?: string
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          crop_cycle_id?: string
          id?: string
          input_name?: string
          quantity_per_ha?: number
          total_cost?: number | null
          total_quantity?: number
          unit?: string
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crop_cycle_inputs_crop_cycle_id_fkey"
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
          climate_coefficient: number | null
          created_at: string
          crop_reference_id: string | null
          end_date: string | null
          expected_revenue: number | null
          expected_yield_kg: number | null
          id: string
          notes: string | null
          parcel_id: string
          plant_count: number | null
          season: string
          start_date: string
          status: string
          updated_at: string
        }
        Insert: {
          actual_revenue?: number | null
          actual_yield_kg?: number | null
          climate_coefficient?: number | null
          created_at?: string
          crop_reference_id?: string | null
          end_date?: string | null
          expected_revenue?: number | null
          expected_yield_kg?: number | null
          id?: string
          notes?: string | null
          parcel_id: string
          plant_count?: number | null
          season: string
          start_date: string
          status?: string
          updated_at?: string
        }
        Update: {
          actual_revenue?: number | null
          actual_yield_kg?: number | null
          climate_coefficient?: number | null
          created_at?: string
          crop_reference_id?: string | null
          end_date?: string | null
          expected_revenue?: number | null
          expected_yield_kg?: number | null
          id?: string
          notes?: string | null
          parcel_id?: string
          plant_count?: number | null
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
      equipment: {
        Row: {
          created_at: string
          farm_id: string
          id: string
          name: string
          notes: string | null
          purchase_cost: number | null
          purchase_date: string | null
          status: string
          type: string
        }
        Insert: {
          created_at?: string
          farm_id: string
          id?: string
          name: string
          notes?: string | null
          purchase_cost?: number | null
          purchase_date?: string | null
          status?: string
          type?: string
        }
        Update: {
          created_at?: string
          farm_id?: string
          id?: string
          name?: string
          notes?: string | null
          purchase_cost?: number | null
          purchase_date?: string | null
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_bookings: {
        Row: {
          created_at: string
          deposit_amount: number
          deposit_paid: boolean
          end_date: string
          id: string
          listing_id: string
          notes: string | null
          payment_status: string
          renter_id: string
          start_date: string
          status: Database["public"]["Enums"]["booking_status"]
          stripe_payment_id: string | null
          total_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          deposit_amount?: number
          deposit_paid?: boolean
          end_date: string
          id?: string
          listing_id: string
          notes?: string | null
          payment_status?: string
          renter_id: string
          start_date: string
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_payment_id?: string | null
          total_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          deposit_amount?: number
          deposit_paid?: boolean
          end_date?: string
          id?: string
          listing_id?: string
          notes?: string | null
          payment_status?: string
          renter_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["booking_status"]
          stripe_payment_id?: string | null
          total_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_bookings_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "equipment_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_listings: {
        Row: {
          availability_end: string | null
          availability_start: string | null
          avg_rating: number | null
          brand: string | null
          created_at: string
          daily_rate: number
          deposit_amount: number
          description: string | null
          equipment_type: string
          id: string
          images: string[] | null
          latitude: number | null
          location_name: string | null
          longitude: number | null
          model: string | null
          owner_id: string
          review_count: number | null
          status: string
          title: string
          updated_at: string
          year: number | null
        }
        Insert: {
          availability_end?: string | null
          availability_start?: string | null
          avg_rating?: number | null
          brand?: string | null
          created_at?: string
          daily_rate?: number
          deposit_amount?: number
          description?: string | null
          equipment_type?: string
          id?: string
          images?: string[] | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          model?: string | null
          owner_id: string
          review_count?: number | null
          status?: string
          title: string
          updated_at?: string
          year?: number | null
        }
        Update: {
          availability_end?: string | null
          availability_start?: string | null
          avg_rating?: number | null
          brand?: string | null
          created_at?: string
          daily_rate?: number
          deposit_amount?: number
          description?: string | null
          equipment_type?: string
          id?: string
          images?: string[] | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          model?: string | null
          owner_id?: string
          review_count?: number | null
          status?: string
          title?: string
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      equipment_reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          listing_id: string
          rating: number
          reviewer_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          listing_id: string
          rating: number
          reviewer_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          listing_id?: string
          rating?: number
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "equipment_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_reviews_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "equipment_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_parcels: {
        Row: {
          area_ha: number | null
          center_lat: number | null
          center_lng: number | null
          client_name: string | null
          created_at: string
          geometry: Json | null
          id: string
          name: string
          notes: string | null
          perimeter_m: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          area_ha?: number | null
          center_lat?: number | null
          center_lng?: number | null
          client_name?: string | null
          created_at?: string
          geometry?: Json | null
          id?: string
          name: string
          notes?: string | null
          perimeter_m?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          area_ha?: number | null
          center_lat?: number | null
          center_lng?: number | null
          client_name?: string | null
          created_at?: string
          geometry?: Json | null
          id?: string
          name?: string
          notes?: string | null
          perimeter_m?: number | null
          updated_at?: string
          user_id?: string
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
      feed_stocks: {
        Row: {
          created_at: string
          farm_id: string
          feed_name: string
          id: string
          last_purchase_date: string | null
          notes: string | null
          quantity_kg: number
          supplier: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          farm_id: string
          feed_name: string
          id?: string
          last_purchase_date?: string | null
          notes?: string | null
          quantity_kg?: number
          supplier?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          farm_id?: string
          feed_name?: string
          id?: string
          last_purchase_date?: string | null
          notes?: string | null
          quantity_kg?: number
          supplier?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "feed_stocks_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      field_observations: {
        Row: {
          created_at: string
          description: string | null
          id: string
          latitude: number
          longitude: number
          observation_type: string
          parcel_name: string | null
          photo_urls: string[] | null
          severity: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          observation_type?: string
          parcel_name?: string | null
          photo_urls?: string[] | null
          severity?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          observation_type?: string
          parcel_name?: string | null
          photo_urls?: string[] | null
          severity?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      harvests: {
        Row: {
          buyer: string | null
          created_at: string
          crop_cycle_id: string
          date: string
          id: string
          lot_number: string
          notes: string | null
          quality_grade: string | null
          quantity_kg: number
          sold: boolean
          unit_price_kg: number | null
        }
        Insert: {
          buyer?: string | null
          created_at?: string
          crop_cycle_id: string
          date?: string
          id?: string
          lot_number: string
          notes?: string | null
          quality_grade?: string | null
          quantity_kg?: number
          sold?: boolean
          unit_price_kg?: number | null
        }
        Update: {
          buyer?: string | null
          created_at?: string
          crop_cycle_id?: string
          date?: string
          id?: string
          lot_number?: string
          notes?: string | null
          quality_grade?: string | null
          quantity_kg?: number
          sold?: boolean
          unit_price_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "harvests_crop_cycle_id_fkey"
            columns: ["crop_cycle_id"]
            isOneToOne: false
            referencedRelation: "crop_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_plans: {
        Row: {
          break_even_yield_kg: number | null
          created_at: string
          crop_cycle_id: string
          expected_revenue: number
          expected_roi_percent: number | null
          id: string
          total_equipment_cost: number
          total_input_cost: number
          total_investment: number
          total_labor_cost: number
          total_transport_cost: number
          updated_at: string
        }
        Insert: {
          break_even_yield_kg?: number | null
          created_at?: string
          crop_cycle_id: string
          expected_revenue?: number
          expected_roi_percent?: number | null
          id?: string
          total_equipment_cost?: number
          total_input_cost?: number
          total_investment?: number
          total_labor_cost?: number
          total_transport_cost?: number
          updated_at?: string
        }
        Update: {
          break_even_yield_kg?: number | null
          created_at?: string
          crop_cycle_id?: string
          expected_revenue?: number
          expected_roi_percent?: number | null
          id?: string
          total_equipment_cost?: number
          total_input_cost?: number
          total_investment?: number
          total_labor_cost?: number
          total_transport_cost?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_plans_crop_cycle_id_fkey"
            columns: ["crop_cycle_id"]
            isOneToOne: true
            referencedRelation: "crop_cycles"
            referencedColumns: ["id"]
          },
        ]
      }
      livestock_expenses: {
        Row: {
          amount: number
          animal_id: string | null
          category: string
          created_at: string
          description: string
          expense_date: string
          farm_id: string
          id: string
          notes: string | null
        }
        Insert: {
          amount?: number
          animal_id?: string | null
          category?: string
          created_at?: string
          description: string
          expense_date?: string
          farm_id: string
          id?: string
          notes?: string | null
        }
        Update: {
          amount?: number
          animal_id?: string | null
          category?: string
          created_at?: string
          description?: string
          expense_date?: string
          farm_id?: string
          id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "livestock_expenses_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "livestock_expenses_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      livestock_sales: {
        Row: {
          animal_id: string | null
          buyer: string | null
          created_at: string
          description: string
          farm_id: string
          id: string
          notes: string | null
          quantity: number
          sale_date: string
          sale_type: string
          total_amount: number
          unit_price: number
        }
        Insert: {
          animal_id?: string | null
          buyer?: string | null
          created_at?: string
          description: string
          farm_id: string
          id?: string
          notes?: string | null
          quantity?: number
          sale_date?: string
          sale_type?: string
          total_amount?: number
          unit_price?: number
        }
        Update: {
          animal_id?: string | null
          buyer?: string | null
          created_at?: string
          description?: string
          farm_id?: string
          id?: string
          notes?: string | null
          quantity?: number
          sale_date?: string
          sale_type?: string
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "livestock_sales_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "livestock_sales_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_orders: {
        Row: {
          amount: number
          client_id: string
          client_notes: string | null
          completed_at: string | null
          created_at: string
          escrow_status: string
          id: string
          provider_id: string
          provider_proof: string | null
          provider_proof_images: string[] | null
          released_at: string | null
          service_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          client_id: string
          client_notes?: string | null
          completed_at?: string | null
          created_at?: string
          escrow_status?: string
          id?: string
          provider_id: string
          provider_proof?: string | null
          provider_proof_images?: string[] | null
          released_at?: string | null
          service_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          client_id?: string
          client_notes?: string | null
          completed_at?: string | null
          created_at?: string
          escrow_status?: string
          id?: string
          provider_id?: string
          provider_proof?: string | null
          provider_proof_images?: string[] | null
          released_at?: string | null
          service_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_orders_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "marketplace_services"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_services: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean
          location_name: string | null
          phone: string | null
          price: number
          price_unit: string
          provider_id: string
          title: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          location_name?: string | null
          phone?: string | null
          price?: number
          price_unit?: string
          provider_id: string
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          location_name?: string | null
          phone?: string | null
          price?: number
          price_unit?: string
          provider_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      parcels: {
        Row: {
          area_ha: number
          calculated_area_ha: number | null
          created_at: string
          farm_id: string
          geometry: Json | null
          id: string
          irrigation_type: string | null
          latitude: number | null
          longitude: number | null
          name: string
          perimeter_m: number | null
          soil_type: string | null
          status: string
          updated_at: string
        }
        Insert: {
          area_ha?: number
          calculated_area_ha?: number | null
          created_at?: string
          farm_id: string
          geometry?: Json | null
          id?: string
          irrigation_type?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          perimeter_m?: number | null
          soil_type?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          area_ha?: number
          calculated_area_ha?: number | null
          created_at?: string
          farm_id?: string
          geometry?: Json | null
          id?: string
          irrigation_type?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          perimeter_m?: number | null
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
      partner_directory: {
        Row: {
          address: string | null
          category: Database["public"]["Enums"]["partner_category"]
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_verified: boolean
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          category: Database["public"]["Enums"]["partner_category"]
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_verified?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: Database["public"]["Enums"]["partner_category"]
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_verified?: boolean
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      plan_limits: {
        Row: {
          can_analytics: boolean | null
          can_export: boolean | null
          can_use_ai: boolean | null
          created_at: string
          id: string
          max_animals: number | null
          max_members: number | null
          max_parcels: number | null
          plan: string
        }
        Insert: {
          can_analytics?: boolean | null
          can_export?: boolean | null
          can_use_ai?: boolean | null
          created_at?: string
          id?: string
          max_animals?: number | null
          max_members?: number | null
          max_parcels?: number | null
          plan?: string
        }
        Update: {
          can_analytics?: boolean | null
          can_export?: boolean | null
          can_use_ai?: boolean | null
          created_at?: string
          id?: string
          max_animals?: number | null
          max_members?: number | null
          max_parcels?: number | null
          plan?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          locale: string | null
          phone: string | null
          preferences: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          locale?: string | null
          phone?: string | null
          preferences?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          locale?: string | null
          phone?: string | null
          preferences?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      scouting_sessions: {
        Row: {
          client_name: string | null
          created_at: string
          crop_type: string | null
          general_condition: string | null
          growth_stage: string | null
          id: string
          latitude: number | null
          longitude: number | null
          notes: string | null
          parcel_name: string | null
          photo_urls: string[] | null
          problems_identified: Json | null
          proposed_treatment: string | null
          recommendations: string | null
          report_shared_to: string[] | null
          updated_at: string
          user_id: string
          visit_date: string
        }
        Insert: {
          client_name?: string | null
          created_at?: string
          crop_type?: string | null
          general_condition?: string | null
          growth_stage?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          parcel_name?: string | null
          photo_urls?: string[] | null
          problems_identified?: Json | null
          proposed_treatment?: string | null
          recommendations?: string | null
          report_shared_to?: string[] | null
          updated_at?: string
          user_id: string
          visit_date?: string
        }
        Update: {
          client_name?: string | null
          created_at?: string
          crop_type?: string | null
          general_condition?: string | null
          growth_stage?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          notes?: string | null
          parcel_name?: string | null
          photo_urls?: string[] | null
          problems_identified?: Json | null
          proposed_treatment?: string | null
          recommendations?: string | null
          report_shared_to?: string[] | null
          updated_at?: string
          user_id?: string
          visit_date?: string
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          created_at: string
          description: string | null
          estimated_cost: number | null
          expert_notes: string | null
          farm_id: string | null
          id: string
          location: string | null
          phone: string | null
          preferred_date: string | null
          service_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          expert_notes?: string | null
          farm_id?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          preferred_date?: string | null
          service_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          estimated_cost?: number | null
          expert_notes?: string | null
          farm_id?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          preferred_date?: string | null
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
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
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          payment_method: string | null
          payment_reference: string | null
          plan: string
          started_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          plan?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          plan?: string
          started_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      workers: {
        Row: {
          created_at: string
          daily_rate: number | null
          farm_id: string
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          role: string
          status: string
        }
        Insert: {
          created_at?: string
          daily_rate?: number | null
          farm_id: string
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          role?: string
          status?: string
        }
        Update: {
          created_at?: string
          daily_rate?: number | null
          farm_id?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "workers_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_subscription_limit: {
        Args: { _resource: string; _user_id: string }
        Returns: undefined
      }
      generate_cooperative_invite_code: { Args: never; Returns: string }
      get_cooperative_owner_for_member: {
        Args: { _user_id: string }
        Returns: string
      }
      get_farm_owner_from_animal: {
        Args: { _animal_id: string }
        Returns: string
      }
      get_farm_owner_from_cycle: {
        Args: { _cycle_id: string }
        Returns: string
      }
      get_farm_owner_from_parcel: {
        Args: { _parcel_id: string }
        Returns: string
      }
      get_user_total_costs: { Args: { _user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_cooperative_admin: { Args: { _user_id: string }; Returns: boolean }
      join_cooperative_by_code: {
        Args: { _invite_code: string }
        Returns: Json
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
      animal_sex: "male" | "femelle" | "inconnu"
      animal_species:
        | "bovin"
        | "caprin"
        | "porcin"
        | "volaille"
        | "pisciculture"
        | "ovin"
      app_role:
        | "admin"
        | "manager"
        | "farmer"
        | "viewer"
        | "agriculteur"
        | "eleveur"
        | "cooperative"
        | "agent_technique"
        | "partenaire"
      booking_status:
        | "en_attente"
        | "confirmee"
        | "en_cours"
        | "terminee"
        | "annulee"
      cost_category:
        | "intrant"
        | "main_oeuvre"
        | "equipement"
        | "transport"
        | "autre"
      partner_category:
        | "credit_agricole"
        | "assurance_agricole"
        | "fournisseur_intrants"
        | "ministere_agriculture"
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
      animal_sex: ["male", "femelle", "inconnu"],
      animal_species: [
        "bovin",
        "caprin",
        "porcin",
        "volaille",
        "pisciculture",
        "ovin",
      ],
      app_role: [
        "admin",
        "manager",
        "farmer",
        "viewer",
        "agriculteur",
        "eleveur",
        "cooperative",
        "agent_technique",
        "partenaire",
      ],
      booking_status: [
        "en_attente",
        "confirmee",
        "en_cours",
        "terminee",
        "annulee",
      ],
      cost_category: [
        "intrant",
        "main_oeuvre",
        "equipement",
        "transport",
        "autre",
      ],
      partner_category: [
        "credit_agricole",
        "assurance_agricole",
        "fournisseur_intrants",
        "ministere_agriculture",
        "autre",
      ],
    },
  },
} as const
