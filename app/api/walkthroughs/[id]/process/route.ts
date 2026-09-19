import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { getScopeExtractionService } from '@/services/ai/ScopeExtractionService'

/**
 * POST /api/walkthroughs/:id/process
 * Process a walkthrough: extract transcript, identify areas, extract scope
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    const walkthoughId = params.id
    const body = await request.json()

    // Fetch walkthrough
    const { data: walkthrough, error: wtError } = await supabase
      .from('walkthroughs')
      .select('*')
      .eq('id', walkthoughId)
      .single()

    if (wtError || !walkthrough) {
      return NextResponse.json(
        { error: 'Walkthrough not found' },
        { status: 404 }
      )
    }

    // Get or create transcript
    const { data: existingTranscript } = await supabase
      .from('transcripts')
      .select('*')
      .eq('walkthrough_id', walkthoughId)
      .single()

    let transcript: string

    if (existingTranscript && existingTranscript.full_text) {
      // Use existing transcript
      transcript = existingTranscript.full_text
    } else if (body.transcript_text) {
      // User provided transcript
      transcript = body.transcript_text

      // Save it
      await supabase.from('transcripts').insert({
        walkthrough_id: walkthoughId,
        full_text: transcript,
        transcription_source: 'manual',
        transcription_status: 'completed',
      })
    } else if (walkthrough.walkthrough_type === 'transcript') {
      return NextResponse.json(
        { error: 'No transcript provided for text-based walkthrough' },
        { status: 400 }
      )
    } else {
      // Would transcribe audio/video here in production
      return NextResponse.json(
        { error: 'Audio/video transcription not yet implemented' },
        { status: 501 }
      )
    }

    // Extract scope using AI
    const aiService = getScopeExtractionService(process.env.AI_PROVIDER)
    const extractionResult = await aiService.extract(transcript)

    // Save identified areas
    for (const areaName of extractionResult.identified_areas) {
      await supabase.from('identified_areas').insert({
        walkthrough_id: walkthoughId,
        area_name: areaName,
        confidence: 'high',
      })
    }

    // Get trades to link extractions
    const { data: trades } = await supabase
      .from('trades')
      .select('id, code, name')
      .eq('organization_id', body.organization_id || '')
      .limit(100)

    const tradeMap = new Map(trades?.map((t) => [t.name.toLowerCase(), t.id]) || [])

    // Save scope extractions
    const extractedIds = []
    for (const scopeItem of extractionResult.scope_items) {
      // Find matching trade
      const tradeId = tradeMap.get(scopeItem.trade_name.toLowerCase())

      const { data: extraction, error: extractError } = await supabase
        .from('ai_extractions')
        .insert({
          walkthrough_id: walkthoughId,
          project_id: walkthrough.project_id,
          trade_id: tradeId || null,
          area_name: scopeItem.area_name,
          description: scopeItem.description,
          quantity: scopeItem.quantity || null,
          unit: scopeItem.unit || null,
          confidence: scopeItem.confidence,
          source_text: scopeItem.source_text,
          needs_measurement: scopeItem.needs_measurement,
          needs_review: scopeItem.needs_review,
          extraction_status: 'pending',
        })
        .select()
        .single()

      if (!extractError && extraction) {
        extractedIds.push(extraction.id)
      }
    }

    return NextResponse.json(
      {
        success: true,
        walkthrough_id: walkthoughId,
        transcript_length: transcript.length,
        identified_areas: extractionResult.identified_areas,
        scope_items_extracted: extractionResult.scope_items.length,
        scope_items: extractionResult.scope_items,
        areas_needing_info: extractionResult.areas_needing_info,
        ai_provider: extractionResult.provider,
        extraction_confidence: extractionResult.extraction_confidence,
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
