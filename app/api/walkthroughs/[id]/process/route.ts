import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/walkthroughs/:id/process
 * Process a walkthrough: extract transcript, identify areas, extract scope
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const transcript = body.transcript_text || ''

    // Mock scope items for testing
    const mockScopeItems = [
      {
        id: 'item-1',
        trade_name: 'Framing',
        description: 'Interior wall framing and insulation',
        quantity: 150,
        unit: 'sq ft',
        estimated_cost: 1500,
        selling_price: 2250,
      },
      {
        id: 'item-2',
        trade_name: 'Drywall',
        description: 'Drywall installation and finishing',
        quantity: 150,
        unit: 'sq ft',
        estimated_cost: 1050,
        selling_price: 1575,
      },
      {
        id: 'item-3',
        trade_name: 'Painting',
        description: 'Interior painting - 2 coats',
        quantity: 150,
        unit: 'sq ft',
        estimated_cost: 450,
        selling_price: 675,
      },
      {
        id: 'item-4',
        trade_name: 'Flooring',
        description: 'Hardwood flooring installation',
        quantity: 150,
        unit: 'sq ft',
        estimated_cost: 2250,
        selling_price: 3375,
      },
      {
        id: 'item-5',
        trade_name: 'Electrical',
        description: 'Electrical wiring and outlets',
        quantity: 8,
        unit: 'outlets',
        estimated_cost: 800,
        selling_price: 1200,
      },
    ]

    return NextResponse.json(
      {
        success: true,
        walkthrough_id: id,
        transcript_length: transcript.length,
        identified_areas: ['Living Room', 'Master Bedroom', 'Kitchen'],
        scope_items_extracted: mockScopeItems.length,
        scope_items: mockScopeItems,
        areas_needing_info: [],
        ai_provider: 'mock',
        extraction_confidence: 0.85,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Walkthrough process error:', error)
    return NextResponse.json(
      { error: 'Failed to process walkthrough', details: String(error) },
      { status: 500 }
    )
  }
}
