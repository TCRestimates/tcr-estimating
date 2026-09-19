'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Download, Send, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ProposalSection {
  trade_name: string
  items: Array<{
    description: string
    quantity: string
    unit: string
    selling_price: string
  }>
  subtotal: string
}

interface ProposalData {
  id: string
  proposal_number: string
  customer_name: string
  customer_email: string
  property_address: string
  total_amount: string
  deposit_amount: string
  deposit_percent: number
  sections: ProposalSection[]
  payment_schedule: Array<{
    order: number
    description: string
    percentage: number
    trigger_description: string
  }>
  proposal_html: string
  proposal_markdown: string
}

export default function ProposalPage() {
  const router = useRouter()
  const { projectId, proposalId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [proposal, setProposal] = useState<ProposalData | null>(null)
  const [customerEmail, setCustomerEmail] = useState('')
  const [viewMode, setViewMode] = useState<'form' | 'preview'>('form')

  // Fetch proposal data
  useEffect(() => {
    const fetchProposal = async () => {
      try {
        setLoading(true)
        // Fetch from API
        const response = await fetch(`/api/proposals/${proposalId}`)
        if (response.ok) {
          const data = await response.json()
          setProposal(data)
          setCustomerEmail(data.customer_email)
          setLoading(false)
          return
        }

        // Fallback to mock data if API fails
        const mockData: ProposalData = {
          id: proposalId as string,
          proposal_number: `PROP-${Date.now()}`,
          customer_name: 'Sarah Johnson',
          customer_email: 'sarah@example.com',
          property_address: '456 Oak Avenue, Somewhere CA 95000',
          total_amount: '$21,062.50',
          deposit_amount: '$5,265.63',
          deposit_percent: 25,
          sections: [
            {
              trade_name: 'Demolition',
              items: [
                {
                  description: 'Remove existing bathtub',
                  quantity: '1',
                  unit: 'EA',
                  selling_price: '$312.50',
                },
              ],
              subtotal: '$312.50',
            },
            {
              trade_name: 'Plumbing',
              items: [
                {
                  description: 'Walk-in shower installation',
                  quantity: '1',
                  unit: 'EA',
                  selling_price: '$6,250.00',
                },
              ],
              subtotal: '$6,250.00',
            },
            {
              trade_name: 'Tile',
              items: [
                {
                  description: 'Shower tile surround',
                  quantity: '100',
                  unit: 'SF',
                  selling_price: '$7,500.00',
                },
                {
                  description: 'Floor tile installation',
                  quantity: '80',
                  unit: 'SF',
                  selling_price: '$7,000.00',
                },
              ],
              subtotal: '$14,500.00',
            },
          ],
          payment_schedule: [
            {
              order: 1,
              description: 'Deposit',
              percentage: 25,
              trigger_description: 'Upon contract signing',
            },
            {
              order: 2,
              description: 'Final Payment',
              percentage: 75,
              trigger_description: 'Upon project completion',
            },
          ],
          proposal_html: '<html>...</html>',
          proposal_markdown: '# Proposal...',
        }

        setProposal(mockData)
        setCustomerEmail(mockData.customer_email)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load proposal')
      } finally {
        setLoading(false)
      }
    }

    fetchProposal()
  }, [proposalId])

  const handleSendEmail = async () => {
    if (!proposal || !customerEmail) return

    try {
      setSending(true)

      // In a real app, you'd call an API to send the email
      const response = await fetch(`/api/proposals/${proposal.id}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_email: customerEmail,
          message: 'Please review the attached proposal for your project.',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send proposal')
      }

      // Show success message
      alert('Proposal sent successfully!')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send proposal')
    } finally {
      setSending(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!proposal) return

    try {
      // In a real app, you'd call an API to generate and download PDF
      const response = await fetch(`/api/proposals/${proposal.id}/download-pdf`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to download PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${proposal.proposal_number}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading proposal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Proposal {proposal?.proposal_number}</h1>
        <p className="text-gray-600">For {proposal?.customer_name}</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {proposal && (
        <>
          {/* View Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={viewMode === 'form' ? 'default' : 'outline'}
              onClick={() => setViewMode('form')}
            >
              Proposal Details
            </Button>
            <Button
              variant={viewMode === 'preview' ? 'default' : 'outline'}
              onClick={() => setViewMode('preview')}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Preview
            </Button>
          </div>

          {viewMode === 'form' ? (
            <>
              {/* Customer & Property Info */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Customer Name
                      </label>
                      <p className="text-gray-900 font-medium">{proposal.customer_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-900 mb-1">
                        Property Address
                      </label>
                      <p className="text-gray-900 font-medium">{proposal.property_address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scope Summary */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Scope of Work</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {proposal.sections.map((section, idx) => (
                      <div key={idx}>
                        <h3 className="font-semibold text-gray-900 mb-3 text-lg">{section.trade_name}</h3>
                        <table className="w-full text-sm">
                          <tbody>
                            {section.items.map((item, itemIdx) => (
                              <tr key={itemIdx} className="border-b">
                                <td className="py-2 text-gray-900">{item.description}</td>
                                <td className="py-2 text-right text-gray-600">
                                  {item.quantity} {item.unit}
                                </td>
                                <td className="py-2 text-right font-semibold text-gray-900">
                                  {item.selling_price}
                                </td>
                              </tr>
                            ))}
                            <tr className="font-semibold">
                              <td colSpan={2} className="py-3 text-gray-900">
                                {section.trade_name} Subtotal
                              </td>
                              <td className="py-3 text-right text-gray-900">{section.subtotal}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Pricing Summary */}
              <Card className="mb-6 bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Project Cost</p>
                      <p className="text-3xl font-bold text-gray-900">{proposal.total_amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Deposit Required (25%)</p>
                      <p className="text-3xl font-bold text-orange-600">{proposal.deposit_amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Balance Due</p>
                      <p className="text-3xl font-bold text-gray-900">
                        ${(parseFloat(proposal.total_amount.replace(/[^0-9.-]/g, '')) - parseFloat(proposal.deposit_amount.replace(/[^0-9.-]/g, ''))).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Schedule */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Payment Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {proposal.payment_schedule.map((payment) => (
                      <div key={payment.order} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                        <div>
                          <p className="font-medium text-gray-900">{payment.description}</p>
                          <p className="text-sm text-gray-600">{payment.trigger_description}</p>
                        </div>
                        <Badge variant="outline">{payment.percentage}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4">
                <Button
                  onClick={handleSendEmail}
                  disabled={sending || !customerEmail}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
                >
                  {sending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send to Customer
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
                <Button variant="outline" onClick={() => router.back()}>
                  Back
                </Button>
              </div>
            </>
          ) : (
            // Preview Mode
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="bg-white border rounded-lg p-8 prose prose-sm max-w-none">
                  <h1>{proposal.proposal_number}</h1>
                  <p>
                    <strong>{proposal.customer_name}</strong>
                    <br />
                    {proposal.property_address}
                  </p>
                  <h2>Scope of Work</h2>
                  {proposal.sections.map((section) => (
                    <div key={section.trade_name}>
                      <h3>{section.trade_name}</h3>
                      <ul>
                        {section.items.map((item) => (
                          <li key={item.description}>
                            {item.description} - {item.quantity} {item.unit} @ {item.selling_price}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <h2>Total Cost</h2>
                  <p>
                    <strong>{proposal.total_amount}</strong> (Deposit: {proposal.deposit_amount})
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
