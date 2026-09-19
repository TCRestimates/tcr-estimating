import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { EstimationEngine } from '@/services/estimation/EstimationEngine'
import Decimal from 'decimal.js'

/**
 * POST /api/estimates
 * Create an estimate from extracted scope items
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const {
      project_id,
      organization_id,
      scope_item_ids, // AI extracted scope item IDs to include
      custom_items, // Manual scope items to add
      default_markup_percent = 25,
    } = body

    if (!project_id || !organization_id) {
      return NextResponse.json(
        { error: 'Missing required fields: project_id, organization_id' },
        { status: 400 }
      )
    }

    // Generate quote number
    const quoteNumber = `EST-${Date.now()}`

    // Create estimate record
    const { data: estimate, error: estError } = await supabase
      .from('estimates')
      .insert({
        organization_id,
        project_id,
        quote_number: quoteNumber,
        status: 'draft',
      })
      .select()
      .single()

    if (estError) {
      console.error('Estimate creation error:', estError)
      return NextResponse.json(
        { error: 'Failed to create estimate' },
        { status: 500 }
      )
    }

    // Fetch extracted scope items
    let scopeItems: any[] = []

    if (scope_item_ids && scope_item_ids.length > 0) {
      const { data: extracted } = await supabase
        .from('ai_extractions')
        .select('*')
        .in('id', scope_item_ids)

      if (extracted) {
        scopeItems = extracted.map((item) => ({
          id: item.id,
          trade_name: item.trade_id || 'Other',
          description: item.description,
          quantity: item.quantity,
          unit: item.unit,
          confidence: item.confidence,
          needs_measurement: item.needs_measurement,
        }))
      }
    }

    // Add custom items
    if (custom_items && custom_items.length > 0) {
      scopeItems = [...scopeItems, ...custom_items]
    }

    if (scopeItems.length === 0) {
      return NextResponse.json(
        { error: 'No scope items provided' },
        { status: 400 }
      )
    }

    // Fetch cost library
    const { data: costItems } = await supabase
      .from('cost_items')
      .select('*')
      .eq('organization_id', organization_id)
      .eq('is_active', true)

    // Create estimate using EstimationEngine
    const engine = new EstimationEngine()
    const estimateData = engine.createEstimate(
      scopeItems,
      costItems || [],
      quoteNumber,
      new Decimal(default_markup_percent)
    )

    // Create estimate version
    const { data: version, error: versionError } = await supabase
      .from('estimate_versions')
      .insert({
        estimate_id: estimate.id,
        version_number: 1,
        total_estimated_cost: estimateData.total_estimated_cost.toNumber(),
        total_selling_price: estimateData.total_selling_price.toNumber(),
        total_profit: estimateData.total_profit.toNumber(),
        is_current: true,
      })
      .select()
      .single()

    if (versionError) {
      console.error('Version creation error:', versionError)
      return NextResponse.json(
        { error: 'Failed to create estimate version' },
        { status: 500 }
      )
    }

    // Create estimate sections and line items
    for (const section of estimateData.sections) {
      const { data: sectionData, error: sectionError } = await supabase
        .from('estimate_sections')
        .insert({
          estimate_version_id: version.id,
          trade_id: '00000000-0000-0000-0000-000000000000', // Will be updated with actual trade ID
          section_order: estimateData.sections.indexOf(section),
          section_notes: null,
          subtotal_estimated: section.subtotal_estimated.toNumber(),
          subtotal_selling: section.subtotal_selling.toNumber(),
        })
        .select()
        .single()

      if (sectionError) {
        console.error('Section creation error:', sectionError)
        continue
      }

      // Create line items
      for (const lineItem of section.line_items) {
        await supabase.from('estimate_line_items').insert({
          estimate_section_id: sectionData.id,
          scope_item_id: lineItem.scope_item_id || null,
          cost_item_id: lineItem.cost_item_id || null,
          description: lineItem.description,
          quantity: lineItem.quantity.toNumber(),
          unit: lineItem.unit,
          line_order: section.line_items.indexOf(lineItem),
          material_cost: lineItem.material_cost.toNumber(),
          labor_cost: lineItem.labor_cost.toNumber(),
          subcontractor_cost: lineItem.subcontractor_cost.toNumber(),
          equipment_cost: lineItem.equipment_cost.toNumber(),
          waste_amount: lineItem.waste_amount.toNumber(),
          estimated_cost: lineItem.estimated_cost.toNumber(),
          markup_percent: lineItem.markup_percent.toNumber(),
          markup_amount: lineItem.markup_amount.toNumber(),
          selling_price: lineItem.selling_price.toNumber(),
          needs_measurement: lineItem.needs_measurement,
        })
      }
    }

    return NextResponse.json(
      {
        success: true,
        estimate: {
          id: estimate.id,
          quote_number: estimate.quote_number,
          status: estimate.status,
        },
        totals: {
          estimated_cost: estimateData.total_estimated_cost.toNumber(),
          selling_price: estimateData.total_selling_price.toNumber(),
          profit: estimateData.total_profit.toNumber(),
          profit_margin_percent: estimateData.profit_margin_percent.toNumber(),
        },
        sections_count: estimateData.sections.length,
        line_items_count: estimateData.sections.reduce((sum, s) => sum + s.line_items.length, 0),
        areas_needing_measurement: estimateData.areas_needing_measurement,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Estimate creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create estimate', details: String(error) },
      { status: 500 }
    )
  }
}

/**
 * GET /api/estimates?project_id=xxx
 * List estimates for a project
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('project_id')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing project_id parameter' },
        { status: 400 }
      )
    }

    const { data: estimates, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Estimates fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch estimates' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      estimates,
    })
  } catch (error) {
    console.error('Estimates GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
