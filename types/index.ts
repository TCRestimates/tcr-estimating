// Core database types

export interface Organization {
  id: string
  name: string
  company_name?: string
  logo_url?: string
  primary_color: string
  secondary_color: string
  accent_color: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  organization_id: string
  email: string
  full_name?: string
  role: 'admin' | 'estimator' | 'viewer' | 'manager'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  organization_id: string
  first_name: string
  last_name: string
  company_name?: string
  email?: string
  phone?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  organization_id: string
  customer_id: string
  name: string
  project_type?: 'residential' | 'commercial' | 'mixed_use' | 'other'
  construction_type?: 'renovation' | 'new_construction' | 'addition' | 'repair' | 'other'
  property_address?: string
  city?: string
  state?: string
  zip_code?: string
  square_footage?: number
  assigned_estimator_id?: string
  internal_notes?: string
  status: 'active' | 'on_hold' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface Trade {
  id: string
  organization_id: string
  name: string
  code: string
  description?: string
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CostItem {
  id: string
  organization_id: string
  trade_id: string
  description: string
  unit: string
  material_cost?: number
  labor_cost?: number
  subcontractor_cost?: number
  equipment_cost?: number
  waste_percent: number
  base_cost?: number
  markup_percent?: number
  waste_amount?: number
  selling_price?: number
  location?: string
  pricing_source: 'demo' | 'historical' | 'manual' | 'vendor_quote' | 'subcontractor_quote' | 'actual_cost' | 'ai_suggested'
  external_reference_id?: string
  notes?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Estimate {
  id: string
  organization_id: string
  project_id: string
  quote_number: string
  status: 'draft' | 'needs_review' | 'ready' | 'sent' | 'accepted' | 'rejected' | 'expired'
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Walkthrough {
  id: string
  project_id: string
  recorded_date?: string
  walkthrough_type: 'video' | 'audio' | 'transcript' | 'photos'
  duration_minutes?: number
  recorded_by?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface AIExtraction {
  id: string
  walkthrough_id: string
  project_id: string
  trade_id?: string
  area_name?: string
  description: string
  quantity?: number
  unit?: string
  confidence: 'high' | 'medium' | 'low' | 'needs_review'
  source_text?: string
  needs_measurement: boolean
  needs_review: boolean
  extraction_status: 'pending' | 'accepted' | 'rejected' | 'edited'
  created_at: string
  updated_at: string
}

export interface Proposal {
  id: string
  estimate_id: string
  proposal_number: string
  proposal_status: 'draft' | 'generated' | 'sent' | 'viewed' | 'accepted' | 'rejected'
  customer_name?: string
  customer_email?: string
  property_address?: string
  generated_at: string
  sent_at?: string
  expires_at?: string
  signed_at?: string
  signed_by?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface PaymentSchedule {
  id: string
  estimate_id: string
  total_contract_amount?: number
  schedule_type: 'percentage' | 'fixed' | 'milestone'
  created_at: string
  updated_at: string
}

export interface PaymentMilestone {
  id: string
  payment_schedule_id: string
  milestone_order: number
  description?: string
  milestone_type: 'percentage' | 'fixed' | 'milestone'
  amount?: number
  percentage?: number
  trigger_description?: string
  due_date?: string
  paid_date?: string
  is_deposit: boolean
  created_at: string
}
