import sgMail from '@sendgrid/mail'

// Initialize SendGrid with API key
const initSendGrid = () => {
  const apiKey = process.env.SENDGRID_API_KEY
  if (
    !apiKey ||
    apiKey === 'SG.your_api_key_here' ||
    apiKey.startsWith('your_') ||
    !apiKey.startsWith('SG.')
  ) {
    console.warn('SENDGRID_API_KEY not configured or invalid. Email delivery will use mock mode.')
    return null
  }
  sgMail.setApiKey(apiKey)
  return sgMail
}

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
}

/**
 * Send email using SendGrid or mock mode
 */
export async function sendEmail(options: EmailOptions): Promise<{
  success: boolean
  messageId?: string
  error?: string
}> {
  const {
    to,
    subject,
    html,
    text,
    from = process.env.SENDGRID_FROM_EMAIL || 'noreply@tcrbuilders.com',
    replyTo = process.env.SENDGRID_REPLY_EMAIL || 'support@tcrbuilders.com',
  } = options

  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return {
        success: false,
        error: 'Invalid email address format',
      }
    }

    const sgMail = initSendGrid()

    if (!sgMail) {
      // Mock mode - email service not configured
      console.log('[MOCK EMAIL]', {
        to,
        subject,
        from,
      })
      return {
        success: true,
        messageId: `mock-${Date.now()}`,
      }
    }

    // Send real email via SendGrid
    const msg = {
      to,
      from,
      replyTo,
      subject,
      text: text || html.replace(/<[^>]*>/g, ''),
      html,
    }

    const response = await sgMail.send(msg)
    console.log('[SENDGRID] Email sent successfully', {
      to,
      subject,
      messageId: response[0].headers['x-message-id'],
    })

    return {
      success: true,
      messageId: response[0].headers['x-message-id'] as string,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[SENDGRID ERROR]', {
      to,
      subject,
      error: errorMessage,
    })

    return {
      success: false,
      error: errorMessage,
    }
  }
}

/**
 * Generate proposal email HTML
 */
export function generateProposalEmailHtml(
  proposalNumber: string,
  customerName: string,
  totalAmount: string,
  depositAmount: string,
  companyName: string = 'TCR Builders'
): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        color: #333;
        line-height: 1.6;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
      }
      .header {
        background-color: #FF6B35;
        color: white;
        padding: 30px;
        border-radius: 8px 8px 0 0;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
      }
      .content {
        background-color: #f9f9f9;
        padding: 30px;
        border-radius: 0 0 8px 8px;
        border: 1px solid #e0e0e0;
      }
      .proposal-details {
        background-color: white;
        padding: 20px;
        border-radius: 6px;
        margin: 20px 0;
        border-left: 4px solid #FF6B35;
      }
      .detail-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid #eee;
      }
      .detail-row:last-child {
        border-bottom: none;
      }
      .detail-label {
        font-weight: 600;
        color: #555;
      }
      .detail-value {
        color: #333;
      }
      .highlight {
        color: #FF6B35;
        font-weight: 700;
      }
      .cta-button {
        display: inline-block;
        background-color: #FF6B35;
        color: white;
        padding: 12px 30px;
        text-decoration: none;
        border-radius: 6px;
        margin-top: 20px;
        font-weight: 600;
      }
      .footer {
        text-align: center;
        color: #999;
        font-size: 12px;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e0e0e0;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Proposal Ready</h1>
      </div>

      <div class="content">
        <p>Hi <strong>${customerName}</strong>,</p>

        <p>Thank you for scheduling your project walkthrough with ${companyName}. We've prepared a detailed proposal for your review based on our discussion.</p>

        <div class="proposal-details">
          <div class="detail-row">
            <span class="detail-label">Proposal #:</span>
            <span class="detail-value">${proposalNumber}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Total Project Cost:</span>
            <span class="detail-value"><strong class="highlight">${totalAmount}</strong></span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Deposit Required:</span>
            <span class="detail-value"><strong>${depositAmount}</strong></span>
          </div>
        </div>

        <p>Please review the attached proposal document. It includes:</p>
        <ul>
          <li>Detailed scope of work</li>
          <li>Itemized pricing breakdown</li>
          <li>Payment schedule</li>
          <li>Project timeline</li>
        </ul>

        <p>If you have any questions about the proposal or would like to discuss any modifications, please don't hesitate to reach out. We're here to help!</p>

        <p>
          <a href="mailto:support@tcrbuilders.com" class="cta-button">Contact Us</a>
        </p>

        <div class="footer">
          <p>${companyName}</p>
          <p>Phone: (555) 123-4567 | Email: support@tcrbuilders.com</p>
          <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
</html>
  `.trim()
}
