import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/walkthroughs
 * Create a new walkthrough record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      project_id,
      walkthrough_type,
    } = body

    // Validate required fields
    if (!project_id || !walkthrough_type) {
      return NextResponse.json(
        { error: 'Missing required fields: project_id, walkthrough_type' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        walkthrough: {
          id: `walkthrough-${Date.now()}`,
          project_id,
          walkthrough_type,
          recorded_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Walkthrough endpoint error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/walkthroughs?project_id=xxx
 * List walkthroughs for a project
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('project_id')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing project_id parameter' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      walkthroughs: [],
    })
  } catch (error) {
    console.error('Walkthroughs GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
