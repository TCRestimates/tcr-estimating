import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/estimates/:id
 * Fetch an estimate by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: estimateId } = await params

    // Mock data for testing
    const mockData = {
      id: estimateId,
      quote_number: `EST-2024-${Math.random().toString().slice(2, 6)}`,
      status: 'draft',
      sections: [
        {
          id: 'section-1',
          trade_name: 'Bathroom Renovation',
          line_items: [
            {
              id: 'item-1',
              description: 'Demo existing bathtub and tile',
              quantity: 1,
              unit: 'job',
              material_cost: 0,
              labor_cost: 800,
              subcontractor_cost: 0,
              equipment_cost: 0,
              waste_percent: 0,
              selling_price: 1000,
              markup_percent: 25,
              needs_measurement: false,
              source_text: 'demo bathtub and tile',
              source_scope_item_id: 'item-1'
            },
            {
              id: 'item-2',
              description: 'Install walk-in shower with tile',
              quantity: 1,
              unit: 'job',
              material_cost: 2500,
              labor_cost: 1500,
              subcontractor_cost: 0,
              equipment_cost: 200,
              waste_percent: 10,
              selling_price: 5500,
              markup_percent: 25,
              needs_measurement: false,
              source_text: 'walk-in shower with new tile',
              source_scope_item_id: 'item-2'
            },
            {
              id: 'item-3',
              description: 'New vanity with sink',
              quantity: 1,
              unit: 'job',
              material_cost: 800,
              labor_cost: 400,
              subcontractor_cost: 0,
              equipment_cost: 0,
              waste_percent: 0,
              selling_price: 1500,
              markup_percent: 25,
              needs_measurement: false,
              source_text: 'new vanity',
              source_scope_item_id: 'item-3'
            }
          ],
          subtotal_selling: 8000
        },
        {
          id: 'section-2',
          trade_name: 'Fixtures & Finishes',
          line_items: [
            {
              id: 'item-4',
              description: 'Toilet installation',
              quantity: 1,
              unit: 'each',
              material_cost: 300,
              labor_cost: 200,
              subcontractor_cost: 0,
              equipment_cost: 0,
              waste_percent: 0,
              selling_price: 750,
              markup_percent: 25,
              needs_measurement: false,
              source_text: 'new toilet',
              source_scope_item_id: 'item-4'
            },
            {
              id: 'item-5',
              description: 'Lighting fixtures (3 units)',
              quantity: 3,
              unit: 'each',
              material_cost: 150,
              labor_cost: 100,
              subcontractor_cost: 0,
              equipment_cost: 0,
              waste_percent: 0,
              selling_price: 900,
              markup_percent: 25,
              needs_measurement: false,
              source_text: 'lighting fixtures',
              source_scope_item_id: 'item-5'
            },
            {
              id: 'item-6',
              description: 'Paint & finishes',
              quantity: 1,
              unit: 'job',
              material_cost: 400,
              labor_cost: 300,
              subcontractor_cost: 0,
              equipment_cost: 0,
              waste_percent: 0,
              selling_price: 1000,
              markup_percent: 25,
              needs_measurement: false,
              source_text: 'paint',
              source_scope_item_id: 'item-6'
            }
          ],
          subtotal_selling: 2650
        }
      ],
      totals: {
        estimated_cost: 7450,
        selling_price: 10650,
        profit: 3200,
        profit_margin_percent: 30
      }
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error('Error fetching estimate:', error)
    return NextResponse.json(
      { error: 'Failed to fetch estimate' },
      { status: 500 }
    )
  }
}
