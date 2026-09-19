import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/estimates/:id/generate-proposal
 * Generate a customer-facing proposal from an estimate
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    // Generate proposal number
    const proposalNumber = `PROP-${Date.now()}`
    const depositPercent = body.deposit_percent || 25

    return NextResponse.json(
      {
        success: true,
        proposal: {
          id: `proposal-${Date.now()}`,
          proposal_number: proposalNumber,
          status: 'generated',
          estimate_id: id,
          deposit_percent: depositPercent,
        },
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
