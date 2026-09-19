import { NextRequest, NextResponse } from 'next/server'
import { generatePDFFromHTML, generateProposalHTML } from '@/lib/pdf'

/**
 * POST /api/proposals/:id/download-pdf
 * Generate and download proposal as PDF
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: proposalId } = await params
    const body = await request.json().catch(() => ({}))

    // Extract proposal data from request body
    const {
      proposalNumber = `PROP-${proposalId}`,
      customerName = 'Valued Customer',
      customerEmail = 'customer@example.com',
      propertyAddress = 'Property Address',
      totalAmount = '$0.00',
      depositAmount = '$0.00',
      depositPercent = 25,
      sections = [],
      paymentSchedule = [
        {
          order: 1,
          description: 'Deposit',
          percentage: 25,
          triggerDescription: 'Upon contract signing',
        },
        {
          order: 2,
          description: 'Final Payment',
          percentage: 75,
          triggerDescription: 'Upon project completion',
        },
      ],
      companyName = 'TCR Builders',
      companyPhone = '(555) 123-4567',
      companyEmail = 'estimates@tcrbuilders.com',
      companyLicense = 'CSLB #1234567',
      notes = [
        'This estimate is valid for 30 days.',
        'Price subject to site verification.',
        'Changes to scope require a change order.',
      ],
    } = body

    // Generate proposal HTML
    const html = generateProposalHTML({
      proposalNumber,
      customerName,
      customerEmail,
      propertyAddress,
      totalAmount,
      depositAmount,
      depositPercent,
      sections: sections.map((section: any) => ({
        tradeName: section.trade_name || section.tradeName,
        items: (section.items || []).map((item: any) => ({
          description: item.description,
          quantity: item.quantity?.toString() || '1',
          unit: item.unit || 'EA',
          sellingPrice: item.selling_price || item.sellingPrice || '$0.00',
        })),
        subtotal: section.subtotal || section.subtotalSelling || '$0.00',
      })),
      paymentSchedule,
      companyName,
      companyPhone,
      companyEmail,
      companyLicense,
      notes,
    })

    // Generate PDF
    console.log(`[PDF] Generating PDF for proposal ${proposalId}`)
    const pdfBuffer = await generatePDFFromHTML(html)

    // Return PDF as file download
    const response = new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${proposalNumber}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    })

    console.log(`[PDF] PDF generated successfully for proposal ${proposalId}`)
    return response
  } catch (error) {
    console.error('Error generating PDF:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    // Return error response
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
