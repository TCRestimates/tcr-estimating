import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, generateProposalEmailHtml } from '@/lib/email'

/**
 * POST /api/proposals/:id/send
 * Send proposal to customer via email
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proposalId } = await params
    const body = await request.json()
    const {
      customer_email,
      customer_name = 'Valued Customer',
      proposal_number = `PROP-${proposalId}`,
      total_amount = '$0.00',
      deposit_amount = '$0.00',
      company_name = 'TCR Builders',
      message,
    } = body

    // Validate email
    if (!customer_email || !customer_email.includes('@')) {
      return NextResponse.json(
        { error: 'Invalid customer email' },
        { status: 400 }
      )
    }

    // Generate professional email HTML
    const emailHtml = generateProposalEmailHtml(
      proposal_number,
      customer_name,
      total_amount,
      deposit_amount,
      company_name
    )

    // Add custom message if provided
    const finalHtml = message
      ? emailHtml.replace(
          '<p>If you have any questions',
          `<p><strong>Additional Notes:</strong> ${message}</p>\n\n<p>If you have any questions`
        )
      : emailHtml

    // Send email
    const result = await sendEmail({
      to: customer_email,
      subject: `Your Project Proposal: ${proposal_number}`,
      html: finalHtml,
    })

    if (!result.success) {
      console.error('Email sending failed:', result.error)
      return NextResponse.json(
        { error: result.error || 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      proposal_id: proposalId,
      sent_to: customer_email,
      sent_at: new Date().toISOString(),
      message_id: result.messageId,
      message: 'Proposal sent successfully',
    })
  } catch (error) {
    console.error('Error sending proposal:', error)
    return NextResponse.json(
      { error: 'Failed to send proposal' },
      { status: 500 }
    )
  }
}
