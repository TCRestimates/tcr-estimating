// TypeScript types for Supabase database schema
// Auto-generated from database schema

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          company_name: string | null
          logo_url: string | null
          primary_color: string
          secondary_color: string
          accent_color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          company_name?: string | null
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          accent_color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          company_name?: string | null
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          accent_color?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          organization_id: string
          email: string
          full_name: string | null
          role: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          full_name?: string | null
          role?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          email?: string
          full_name?: string | null
          role?: string
          is_active?: boolean
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          organization_id: string
          first_name: string
          last_name: string
          company_name: string | null
          email: string | null
          phone: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          first_name: string
          last_name: string
          company_name?: string | null
          email?: string | null
          phone?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          first_name?: string
          last_name?: string
          company_name?: string | null
          email?: string | null
          phone?: string | null
          notes?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          organization_id: string
          customer_id: string
          name: string
          project_type: string | null
          construction_type: string | null
          property_address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          square_footage: number | null
          assigned_estimator_id: string | null
          internal_notes: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          customer_id: string
          name: string
          project_type?: string | null
          construction_type?: string | null
          property_address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          square_footage?: number | null
          assigned_estimator_id?: string | null
          internal_notes?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          project_type?: string | null
          construction_type?: string | null
          property_address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          square_footage?: number | null
          assigned_estimator_id?: string | null
          internal_notes?: string | null
          status?: string
          updated_at?: string
        }
      }
      trades: {
        Row: {
          id: string
          organization_id: string
          name: string
          code: string
          description: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          code: string
          description?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          code?: string
          description?: string | null
          sort_order?: number
          is_active?: boolean
          updated_at?: string
        }
      }
      cost_items: {
        Row: {
          id: string
          organization_id: string
          trade_id: string
          description: string
          unit: string
          material_cost: number | null
          labor_cost: number | null
          subcontractor_cost: number | null
          equipment_cost: number | null
          waste_percent: number
          base_cost: number | null
          markup_percent: number | null
          waste_amount: number | null
          selling_price: number | null
          location: string | null
          pricing_source: string
          external_reference_id: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          trade_id: string
          description: string
          unit: string
          material_cost?: number | null
          labor_cost?: number | null
          subcontractor_cost?: number | null
          equipment_cost?: number | null
          waste_percent?: number
          base_cost?: number | null
          markup_percent?: number | null
          waste_amount?: number | null
          selling_price?: number | null
          location?: string | null
          pricing_source?: string
          external_reference_id?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          description?: string
          unit?: string
          material_cost?: number | null
          labor_cost?: number | null
          subcontractor_cost?: number | null
          equipment_cost?: number | null
          waste_percent?: number
          base_cost?: number | null
          markup_percent?: number | null
          waste_amount?: number | null
          selling_price?: number | null
          location?: string | null
          pricing_source?: string
          notes?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      estimates: {
        Row: {
          id: string
          organization_id: string
          project_id: string
          quote_number: string
          status: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          project_id: string
          quote_number: string
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          status?: string
          updated_at?: string
        }
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
  }
}
