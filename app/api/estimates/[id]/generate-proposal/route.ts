import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { ProposalGenerator } from '@/services/estimation/ProposalGenerator'
import { EstimationEngine, PricingCalculator } from '@/services/estimation/EstimationEngine'
import Decimal from 'decimal.js'

/**
 * POST /api/estimates/:id/generate-proposal
 * Generate a customer-facing proposal from an estimate
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const estimateId = params.id
    const body = await request.json()

    // Fetch estimate
    const { data: estimate, error: estError } = await supabase
      .from('estimates')
      .select('*')
      .eq('id', estimateId)
      .single()

    if (estError || !estimate) {
      return NextResponse.json(
        { error: 'Estimate not found' },
        { status: 404 }
      )
    }

    // Fetch estimate version (current)
    const { data: version } = await supabase
      .from('estimate_versions')
      .select('*')
      .eq('estimate_id', estimateId)
      .eq('is_current', true)
      .single()

    if (!version) {
      return NextResponse.json(
        { error: 'Estimate version not found' },
        { status: 404 }
      )
    }

    // Fetch estimate sections and line items
    const { data: sections } = await supabase
      .from('estimate_sections')
      .select('*, estimate_line_items(*)')
      .eq('estimate_version_id', version.id)

    // Reconstruct estimate object for ProposalGenerator
    const reconstructedEstimate = {
      estimate_number: estimate.quote_number,
      sections: (sections || []).map((section) => ({
        trade_name: section.trade_id, // Will need to fetch trade name
        line_items: (section.estimate_line_items || []).map((item) => ({
          description: item.description,
          quantity: new Decimal(item.quantity),
          unit: item.unit,
          material_cost: new Decimal(item.material_cost || 0),
          labor_cost: new Decimal(item.labor_cost || 0),
          subcontractor_cost: new Decimal(item.subcontractor_cost || 0),
          equipment_cost: new Decimal(item.equipment_cost || 0),
          waste_percent: new Decimal(item.waste_amount || 0),
          waste_amount: new Decimal(item.waste_amount || 0),
          estimated_cost: new Decimal(item.estimated_cost),
          markup_percent: new Decimal(item.markup_percent),
          markup_amount: new Decimal(item.markup_amount),
          selling_price: new Decimal(item.selling_price),
          scope_item_id: item.scope_item_id,
          cost_item_id: item.cost_item_id,
          notes: item.notes,
          needs_measurement: item.needs_measurement,
        })),
        subtotal_estimated: new Decimal(section.subtotal_estimated),
        subtotal_selling: new Decimal(section.subtotal_selling),
      })),
      total_estimated_cost: new Decimal(version.total_estimated_cost),
      total_selling_price: new Decimal(version.total_selling_price),
      total_profit: new Decimal(version.total_profit),
      profit_margin_percent: new Decimal(0), // Will calculate
    }

    // Fetch project and customer info
    const { data: project } = await supabase
      .from('projects')
      .select('*, customers(*)')
      .eq('id', estimate.project_id)
      .single()

    const { data: organization } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', estimate.organization_id)
      .single()

    // Fetch trade names
    const { data: trades } = await supabase
      .from('trades')
      .select('id, name')
      .eq('organization_id', estimate.organization_id)

    const tradeMap = new Map(trades?.map((t) => [t.id, t.name]) || [])

    // Update section trade names
    for (const section of reconstructedEstimate.sections) {
      section.trade_name = tradeMap.get(section.trade_name) || section.trade_name
    }

    // Generate proposal number
    const proposalNumber = `PROP-${Date.now()}`

    // Get proposal data from request body or use defaults
    const depositPercent = body.deposit_percent || 25
    const paymentSchedule = body.payment_schedule
    const generalNotes = body.general_notes

    // Generate proposal
    const proposal = ProposalGenerator.generateProposal(
      reconstructedEstimate as any,
      proposalNumber,
      {
        name: project?.customers
          ? `${project.customers.first_name} ${project.customers.last_name}`
          : 'Customer Name',
        email: project?.customers?.email,
        phone: project?.customers?.phone,
        address: project?.property_address,
      },
      project?.property_address || '',
      {
        name: organization?.company_name || organization?.name,
        phone: body.company_phone,
        email: body.company_email,
        license: body.company_license,
      },
      depositPercent,
      paymentSchedule,
      generalNotes
    )

    // Generate HTML and markdown
    const proposalHTML = ProposalGenerator.generateHTML(proposal)
    const proposalMarkdown = ProposalGenerator.generateMarkdown(proposal)

    // Create proposal record
    const { data: proposalRecord, error: propError } = await supabase
      .from('proposals')
      .insert({
        estimate_id: estimateId,
        proposal_number: proposalNumber,
        proposal_status: 'generated',
        customer_name: proposal.customer.name,
        customer_email: proposal.customer.email,
        property_address: proposal.project_address,
      })
      .select()
      .single()

    if (propError) {
      console.error('Proposal creation error:', propError)
      return NextResponse.json(
        { error: 'Failed to create proposal record' },
        { status: 500 }
      )
    }

    // Create proposal version
    await supabase.from('proposal_versions').insert({
      proposal_id: proposalRecord.id,
      version_number: 1,
      total_amount: proposal.total_amount,
      deposit_amount: proposal.deposit_amount,
      included_clauses: JSON.stringify(body.clause_ids || []),
      proposal_html: proposalHTML,
      proposal_pdf_url: null, // Would be set after PDF generation
    })

    return NextResponse.json(
      {
        success: true,
        proposal: {
          id: proposalRecord.id,
          proposal_number: proposalNumber,
          status: proposalRecord.proposal_status,
          customer_name: proposal.customer.name,
          total_amount: proposal.total_amount,
          deposit_amount: proposal.deposit_amount,
          deposit_percent: proposal.deposit_percent,
        },
        proposal_content: proposal,
        proposal_html: proposalHTML,
        proposal_markdown: proposalMarkdown,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Proposal generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate proposal', details: String(error) },
      { status: 500 }
    )
  }
}
