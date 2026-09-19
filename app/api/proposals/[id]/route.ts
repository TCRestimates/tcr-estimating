import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/proposals/:id
 * Fetch a proposal by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proposalId } = await params

    // Mock data for testing
    const mockData = {
      id: proposalId,
      proposal_number: `PROP-2024-${Math.random().toString().slice(2, 6)}`,
      customer_name: 'John Smith',
      customer_email: 'john@example.com',
      property_address: '123 Oak Street, Denver, CO 80202',
      total_amount: '10,650',
      deposit_amount: '2,662.50',
      deposit_percent: 25,
      sections: [
        {
          id: 'section-1',
          trade_name: 'Bathroom Renovation',
          items: [
            {
              id: 'item-1',
              description: 'Demo existing bathtub and tile',
              quantity: '1',
              unit: 'job',
              selling_price: '1,000'
            },
            {
              id: 'item-2',
              description: 'Install walk-in shower with tile',
              quantity: '1',
              unit: 'job',
              selling_price: '5,500'
            },
            {
              id: 'item-3',
              description: 'New vanity with sink',
              quantity: '1',
              unit: 'job',
              selling_price: '1,500'
            }
          ],
          subtotal: '8,000'
        },
        {
          id: 'section-2',
          trade_name: 'Fixtures & Finishes',
          items: [
            {
              id: 'item-4',
              description: 'Toilet installation',
              quantity: '1',
              unit: 'each',
              selling_price: '750'
            },
            {
              id: 'item-5',
              description: 'Lighting fixtures (3 units)',
              quantity: '3',
              unit: 'each',
              selling_price: '900'
            },
            {
              id: 'item-6',
              description: 'Paint & finishes',
              quantity: '1',
              unit: 'job',
              selling_price: '1,000'
            }
          ],
          subtotal: '2,650'
        }
      ],
      payment_schedule: [
        {
          order: 1,
          description: 'Deposit due upon acceptance',
          percentage: 25,
          trigger_description: 'Upon contract signing'
        },
        {
          order: 2,
          description: 'Progress payment (50% complete)',
          percentage: 50,
          trigger_description: 'When work is 50% complete'
        },
        {
          order: 3,
          description: 'Final payment',
          percentage: 25,
          trigger_description: 'Upon completion and inspection'
        }
      ],
      proposal_html: '<div class="proposal">Mock proposal HTML content</div>',
      proposal_markdown: '# Proposal\n\nThis is a mock proposal in markdown format.'
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error('Error fetching proposal:', error)
    return NextResponse.json(
      { error: 'Failed to fetch proposal' },
      { status: 500 }
    )
  }
}
