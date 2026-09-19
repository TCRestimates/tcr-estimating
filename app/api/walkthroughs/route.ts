import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

/**
 * POST /api/walkthroughs
 * Create a new walkthrough record
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    const body = await request.json()

    const {
      project_id,
      recorded_date,
      walkthrough_type,
      duration_minutes,
      notes,
      transcript_text, // If user provides transcript directly
    } = body

    // Validate required fields
    if (!project_id || !walkthrough_type) {
      return NextResponse.json(
        { error: 'Missing required fields: project_id, walkthrough_type' },
        { status: 400 }
      )
    }

    // Create walkthrough record
    const { data: walkthrough, error: wtError } = await supabase
      .from('walkthroughs')
      .insert({
        project_id,
        recorded_date: recorded_date || new Date().toISOString(),
        walkthrough_type,
        duration_minutes: duration_minutes || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (wtError) {
      console.error('Walkthrough creation error:', wtError)
      return NextResponse.json(
        { error: 'Failed to create walkthrough' },
        { status: 500 }
      )
    }

    // If transcript provided, save it
    if (transcript_text) {
      const { error: transcriptError } = await supabase.from('transcripts').insert({
        walkthrough_id: walkthrough.id,
        full_text: transcript_text,
        transcription_source: 'manual',
        transcription_status: 'completed',
      })

      if (transcriptError) {
        console.error('Transcript creation error:', transcriptError)
      }
    }

    return NextResponse.json(
      {
        success: true,
        walkthrough: {
          id: walkthrough.id,
          project_id: walkthrough.project_id,
          walkthrough_type: walkthrough.walkthrough_type,
          recorded_date: walkthrough.recorded_date,
          created_at: walkthrough.created_at,
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
    const supabase = createServerSupabaseClient()
    const searchParams = request.nextUrl.searchParams
    const projectId = searchParams.get('project_id')

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing project_id parameter' },
        { status: 400 }
      )
    }

    const { data: walkthroughs, error } = await supabase
      .from('walkthroughs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Walkthroughs fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch walkthroughs' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      walkthroughs,
    })
  } catch (error) {
    console.error('Walkthroughs GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
