/**
 * HTML to PDF conversion options
 */
export interface PDFOptions {
  format?: 'A4' | 'Letter'
  margin?: {
    top?: string
    bottom?: string
    left?: string
    right?: string
  }
  displayHeaderFooter?: boolean
  headerTemplate?: string
  footerTemplate?: string
  printBackground?: boolean
}

/**
 * Generate PDF from HTML content
 * Returns HTML with print styles for browser-based PDF generation
 */
export async function generatePDFFromHTML(
  html: string,
  options: PDFOptions = {}
): Promise<Buffer> {
  try {
    // Return HTML with embedded print styles
    // Browsers can use print-to-PDF functionality to save as PDF
    const htmlWithStyles = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
${html}
</body>
</html>
    `

    return Buffer.from(htmlWithStyles, 'utf-8')
  } catch (error) {
    console.error('PDF generation error:', error)
    // Return HTML as fallback even on error
    return Buffer.from(html, 'utf-8')
  }
}

/**
 * Generate proposal PDF HTML
 */
export function generateProposalHTML(data: {
  proposalNumber: string
  customerName: string
  customerEmail: string
  propertyAddress: string
  totalAmount: string
  depositAmount: string
  depositPercent: number
  sections: Array<{
    tradeName: string
    items: Array<{
      description: string
      quantity: string
      unit: string
      sellingPrice: string
    }>
    subtotal: string
  }>
  paymentSchedule: Array<{
    order: number
    description: string
    percentage: number
    triggerDescription: string
  }>
  companyName?: string
  companyPhone?: string
  companyEmail?: string
  companyLicense?: string
  notes?: string[]
}): string {
  const company = {
    name: data.companyName || 'TCR Builders',
    phone: data.companyPhone || '(555) 123-4567',
    email: data.companyEmail || 'support@tcrbuilders.com',
    license: data.companyLicense || 'CSLB #1234567',
  }

  const paymentScheduleHTML = data.paymentSchedule
    .map(
      (payment) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
        <strong>${payment.description}</strong><br>
        <small style="color: #666;">${payment.triggerDescription}</small>
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0; text-align: right;">
        <strong>${payment.percentage}%</strong>
      </td>
    </tr>
  `
    )
    .join('')

  const notesHTML = data.notes
    ? `
    <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-left: 4px solid #FF6B35; border-radius: 4px;">
      <h3 style="margin-top: 0; color: #333;">Notes</h3>
      <ul style="color: #666;">
        ${data.notes.map((note) => `<li>${note}</li>`).join('')}
      </ul>
    </div>
  `
    : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #333;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 8.5in;
      margin: 0 auto;
      padding: 0.5in;
    }
    .header {
      border-bottom: 3px solid #FF6B35;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .company-info {
      float: left;
    }
    .company-info h1 {
      margin: 0;
      color: #FF6B35;
      font-size: 28px;
    }
    .company-info p {
      margin: 5px 0;
      font-size: 12px;
      color: #666;
    }
    .proposal-number {
      float: right;
      text-align: right;
      font-size: 14px;
    }
    .proposal-number .number {
      font-size: 20px;
      font-weight: bold;
      color: #FF6B35;
    }
    .clearfix {
      clear: both;
    }
    .customer-info {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 30px;
    }
    .customer-info h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 14px;
    }
    .customer-info p {
      margin: 5px 0;
      font-size: 13px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      color: #333;
      font-size: 16px;
      margin: 20px 0 10px 0;
      padding-bottom: 10px;
      border-bottom: 2px solid #e0e0e0;
    }
    .trade-section {
      margin-bottom: 20px;
    }
    .trade-name {
      font-size: 14px;
      font-weight: bold;
      color: #1E3A8A;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #ddd;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
      font-size: 13px;
    }
    th {
      background-color: #f0f0f0;
      padding: 10px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #ddd;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #e0e0e0;
    }
    .price-col {
      text-align: right;
    }
    .qty-col {
      text-align: center;
      width: 80px;
    }
    .subtotal-row {
      font-weight: bold;
      background-color: #f9f9f9;
    }
    .summary-box {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      margin: 30px 0;
    }
    .summary-item {
      padding: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 4px;
      text-align: center;
    }
    .summary-item .label {
      font-size: 12px;
      color: #666;
      margin-bottom: 5px;
    }
    .summary-item .value {
      font-size: 20px;
      font-weight: bold;
      color: #FF6B35;
    }
    .deposit-highlight {
      background-color: #fff3f0;
      border: 2px solid #FF6B35;
    }
    .payment-schedule {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 4px;
    }
    .payment-schedule h3 {
      margin-top: 0;
      color: #333;
    }
    .payment-schedule table {
      margin: 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e0e0e0;
      font-size: 11px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="company-info">
        <h1>${company.name}</h1>
        <p>📞 ${company.phone}</p>
        <p>📧 ${company.email}</p>
        <p>${company.license}</p>
      </div>
      <div class="proposal-number">
        <div>Proposal</div>
        <div class="number">${data.proposalNumber}</div>
      </div>
      <div class="clearfix"></div>
    </div>

    <div class="customer-info">
      <h3>Customer Information</h3>
      <p><strong>${data.customerName}</strong></p>
      <p>${data.propertyAddress}</p>
      <p>Email: ${data.customerEmail}</p>
    </div>

    <div class="section">
      <h2>Scope of Work</h2>
      ${data.sections
        .map(
          (section) => `
        <div class="trade-section">
          <div class="trade-name">${section.tradeName}</div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="qty-col">Quantity</th>
                <th class="price-col">Price</th>
              </tr>
            </thead>
            <tbody>
              ${section.items
                .map(
                  (item) => `
                <tr>
                  <td>${item.description}</td>
                  <td class="qty-col">${item.quantity} ${item.unit}</td>
                  <td class="price-col">${item.sellingPrice}</td>
                </tr>
              `
                )
                .join('')}
              <tr class="subtotal-row">
                <td colspan="2">Subtotal</td>
                <td class="price-col">${section.subtotal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      `
        )
        .join('')}
    </div>

    <div class="summary-box">
      <div class="summary-item">
        <div class="label">Total Project Cost</div>
        <div class="value">${data.totalAmount}</div>
      </div>
      <div class="summary-item deposit-highlight">
        <div class="label">Deposit Required (${data.depositPercent}%)</div>
        <div class="value">${data.depositAmount}</div>
      </div>
      <div class="summary-item">
        <div class="label">Balance Due</div>
        <div class="value">\$${(parseFloat(data.totalAmount.replace(/[^0-9.]/g, '')) - parseFloat(data.depositAmount.replace(/[^0-9.]/g, ''))).toFixed(2)}</div>
      </div>
    </div>

    <div class="payment-schedule">
      <h3>Payment Schedule</h3>
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th class="price-col">Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${paymentScheduleHTML}
        </tbody>
      </table>
    </div>

    ${notesHTML}

    <div class="footer">
      <p>This proposal is valid for 30 days from the date issued.</p>
      <p>Thank you for your business!</p>
    </div>
  </div>
</body>
</html>
  `.trim()
}
