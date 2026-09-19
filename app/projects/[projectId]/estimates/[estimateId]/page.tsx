'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Plus, Edit2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface EstimateLineItem {
  id: string
  description: string
  quantity: number
  unit: string
  material_cost: number
  labor_cost: number
  subcontractor_cost: number
  equipment_cost: number
  estimated_cost: number
  markup_percent: number
  selling_price: number
  needs_measurement: boolean
}

interface EstimateSection {
  trade_name: string
  line_items: EstimateLineItem[]
  subtotal_selling: number
}

interface EstimateData {
  id: string
  quote_number: string
  status: string
  sections: EstimateSection[]
  totals: {
    estimated_cost: number
    selling_price: number
    profit: number
    profit_margin_percent: number
  }
}

export default function EstimateBuilderPage() {
  const router = useRouter()
  const { projectId, estimateId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [estimate, setEstimate] = useState<EstimateData | null>(null)
  const [editingMarkup, setEditingMarkup] = useState<string>('25')

  // Fetch estimate data
  useEffect(() => {
    const fetchEstimate = async () => {
      try {
        setLoading(true)
        // Fetch from API
        const response = await fetch(`/api/estimates/${estimateId}`)
        if (response.ok) {
          const data = await response.json()
          setEstimate(data)
          setLoading(false)
          return
        }

        // Fallback to mock data if API fails
        const mockData: EstimateData = {
          id: estimateId as string,
          quote_number: `EST-${Date.now()}`,
          status: 'draft',
          sections: [
            {
              trade_name: 'Demolition',
              line_items: [
                {
                  id: '1',
                  description: 'Remove existing bathtub',
                  quantity: 1,
                  unit: 'EA',
                  material_cost: 0,
                  labor_cost: 250,
                  subcontractor_cost: 0,
                  equipment_cost: 0,
                  estimated_cost: 250,
                  markup_percent: 25,
                  selling_price: 312.5,
                  needs_measurement: false,
                },
              ],
              subtotal_selling: 312.5,
            },
            {
              trade_name: 'Plumbing',
              line_items: [
                {
                  id: '2',
                  description: 'Walk-in shower installation',
                  quantity: 1,
                  unit: 'EA',
                  material_cost: 2500,
                  labor_cost: 2000,
                  subcontractor_cost: 500,
                  equipment_cost: 0,
                  estimated_cost: 5000,
                  markup_percent: 25,
                  selling_price: 6250,
                  needs_measurement: true,
                },
              ],
              subtotal_selling: 6250,
            },
            {
              trade_name: 'Tile',
              line_items: [
                {
                  id: '3',
                  description: 'Shower tile surround',
                  quantity: 100,
                  unit: 'SF',
                  material_cost: 3500,
                  labor_cost: 2500,
                  subcontractor_cost: 0,
                  equipment_cost: 0,
                  estimated_cost: 6000,
                  markup_percent: 25,
                  selling_price: 7500,
                  needs_measurement: true,
                },
                {
                  id: '4',
                  description: 'Floor tile installation',
                  quantity: 80,
                  unit: 'SF',
                  material_cost: 3200,
                  labor_cost: 2400,
                  subcontractor_cost: 0,
                  equipment_cost: 0,
                  estimated_cost: 5600,
                  markup_percent: 25,
                  selling_price: 7000,
                  needs_measurement: false,
                },
              ],
              subtotal_selling: 14500,
            },
          ],
          totals: {
            estimated_cost: 16850,
            selling_price: 21062.5,
            profit: 4212.5,
            profit_margin_percent: 19.98,
          },
        }

        setEstimate(mockData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load estimate')
      } finally {
        setLoading(false)
      }
    }

    fetchEstimate()
  }, [estimateId])

  const handleGenerateProposal = async () => {
    if (!estimate) return

    try {
      setProcessing(true)

      const response = await fetch(`/api/estimates/${estimate.id}/generate-proposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deposit_percent: 25,
          company_phone: '(555) 123-4567',
          company_email: 'estimates@tcrbuilders.com',
          company_license: 'CSLB #1234567',
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
          general_notes: [
            'This estimate is valid for 30 days.',
            'Price subject to site verification.',
            'Changes to scope require a change order.',
          ],
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate proposal')
      }

      const result = await response.json()
      router.push(`/projects/${projectId}/proposals/${result.proposal.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate proposal')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Loading estimate...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Estimate Builder</h1>
        <p className="text-gray-600">Review and adjust pricing for {estimate?.quote_number}</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {estimate && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Estimated Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${estimate.totals.estimated_cost.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Selling Price</p>
                <p className="text-2xl font-bold text-orange-600">
                  ${estimate.totals.selling_price.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Profit</p>
                <p className="text-2xl font-bold text-green-600">
                  ${estimate.totals.profit.toFixed(2)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-gray-600 mb-1">Margin</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estimate.totals.profit_margin_percent.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Markup Control */}
          <Card className="mb-8 bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Markup Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Default Markup Percentage
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={editingMarkup}
                      onChange={(e) => setEditingMarkup(e.target.value)}
                      className="max-w-xs"
                    />
                    <Button variant="outline">Apply to All</Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Current Average</p>
                  <p className="text-lg font-semibold text-gray-900">25%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Line Items by Trade */}
          <div className="space-y-6 mb-8">
            {estimate.sections.map((section, sectionIdx) => (
              <Card key={sectionIdx}>
                <CardHeader className="bg-gray-50 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>{section.trade_name}</CardTitle>
                      <CardDescription>
                        {section.line_items.length} item{section.line_items.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Subtotal</p>
                      <p className="text-lg font-bold text-gray-900">
                        ${section.subtotal_selling.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-0">Description</th>
                        <th className="text-center py-3">Qty</th>
                        <th className="text-right py-3">Material</th>
                        <th className="text-right py-3">Labor</th>
                        <th className="text-right py-3">Markup</th>
                        <th className="text-right py-3">Price</th>
                        <th className="text-center py-3 w-16">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {section.line_items.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-0">
                            <div>
                              <p className="font-medium text-gray-900">{item.description}</p>
                              {item.needs_measurement && (
                                <p className="text-xs text-amber-600">⚠️ Verify quantity</p>
                              )}
                            </div>
                          </td>
                          <td className="text-center py-3">
                            {item.quantity} {item.unit}
                          </td>
                          <td className="text-right py-3 text-gray-600">
                            ${item.material_cost.toFixed(0)}
                          </td>
                          <td className="text-right py-3 text-gray-600">
                            ${item.labor_cost.toFixed(0)}
                          </td>
                          <td className="text-right py-3">
                            <Input
                              type="number"
                              defaultValue={item.markup_percent}
                              className="w-16 text-right"
                            />
                            %
                          </td>
                          <td className="text-right py-3 font-semibold text-gray-900">
                            ${item.selling_price.toFixed(2)}
                          </td>
                          <td className="text-center py-3">
                            <div className="flex gap-1 justify-center">
                              <Button size="sm" variant="ghost">
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-600">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Plus className="h-4 w-4 mr-1" />
                    Add Line Item
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleGenerateProposal}
              disabled={processing}
              className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Proposal...
                </>
              ) : (
                'Generate Proposal'
              )}
            </Button>
            <Button variant="outline">Save as Draft</Button>
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
