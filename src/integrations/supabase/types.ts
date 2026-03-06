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
      cooperative_members: {
        Row: {
          area_ha: number | null
          cooperative_user_id: string
          created_at: string
          crop_type: string | null
          full_name: string
          id: string
          joined_date: string
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
          cooperative_user_id: string
          created_at?: string
          crop_type?: string | null
          full_name: string
          id?: string
          joined_date?: string
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
          cooperative_user_id?: string
          created_at?: string
          crop_type?: string | null
          full_name?: string
          id?: string
          joined_date?: string
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
      animal_sex: "male" | "femelle" | "inconnu"
      animal_species:
        | "bovin"
        | "caprin"
        | "porcin"
        | "volaille"
        | "pisciculture"
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
      animal_sex: ["male", "femelle", "inconnu"],
      animal_species: ["bovin", "caprin", "porcin", "volaille", "pisciculture"],
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
