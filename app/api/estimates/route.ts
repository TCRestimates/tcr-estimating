import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/estimates
 * Create an estimate from extracted scope items
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      project_id,
      organization_id,
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

    return NextResponse.json(
      {
        success: true,
        estimate: {
          id: `estimate-${Date.now()}`,
          quote_number: quoteNumber,
          status: 'draft',
        },
        totals: {
          estimated_cost: 0,
          selling_price: 0,
          profit: 0,
          profit_margin_percent: default_markup_percent,
        },
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
