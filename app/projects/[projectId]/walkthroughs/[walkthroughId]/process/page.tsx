'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, AlertCircle, Edit2, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface ExtractedScopeItem {
  trade_name: string
  area_name?: string
  description: string
  quantity?: number
  unit?: string
  confidence: 'high' | 'medium' | 'low' | 'needs_review'
  source_text: string
  needs_measurement: boolean
  needs_review: boolean
}

interface ProcessResponse {
  success: boolean
  walkthrough_id: string
  transcript_length: number
  identified_areas: string[]
  scope_items_extracted: number
  scope_items: ExtractedScopeItem[]
  areas_needing_info: Array<{
    area: string
    missing_info: string[]
  }>
  extraction_confidence: number
  ai_provider: string
}

export default function ScopeReviewPage() {
  const router = useRouter()
  const { projectId, walkthroughId } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [data, setData] = useState<ProcessResponse | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set())

  // Fetch walkthrough data and process
  useEffect(() => {
    const fetchAndProcess = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/walkthroughs/${walkthroughId}/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            organization_id: 'org-123', // In real app, get from session
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to process walkthrough')
        }

        const result: ProcessResponse = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAndProcess()
  }, [walkthroughId])

  const handleToggleItem = (index: number) => {
    setSelectedItems((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  const handleCreateEstimate = async () => {
    if (!data || selectedItems.size === 0) return

    try {
      setProcessing(true)

      // In a real app, you'd use the actual scope item IDs from extraction
      // For now, we'll create an estimate with these items
      const response = await fetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          organization_id: 'org-123',
          scope_item_ids: Array.from(selectedItems).map((i) => `scope-item-${i}`),
          default_markup_percent: 25,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create estimate')
      }

      const estimate = await response.json()
      router.push(`/projects/${projectId}/estimates/${estimate.estimate.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create estimate')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-600 mx-auto mb-4" />
          <p className="text-lg text-gray-600">Processing walkthrough...</p>
          <p className="text-sm text-gray-500">Extracting scope items with AI</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Extracted Scope</h1>
        <p className="text-gray-600">Review and confirm the scope items extracted from your walkthrough</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {data && (
        <>
          {/* Summary */}
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Areas Identified</p>
                  <p className="text-2xl font-bold text-gray-900">{data.identified_areas.length}</p>
                  <p className="text-xs text-gray-500">{data.identified_areas.join(', ')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Scope Items</p>
                  <p className="text-2xl font-bold text-gray-900">{data.scope_items_extracted}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Extraction Confidence</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {(data.extraction_confidence * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Provider</p>
                  <p className="text-2xl font-bold text-gray-900 capitalize">{data.ai_provider}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scope Items */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Scope Items</h2>
              <div className="text-sm text-gray-600">
                {selectedItems.size} of {data.scope_items.length} selected
              </div>
            </div>

            {data.scope_items.map((item, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.has(idx)}
                      onChange={() => handleToggleItem(idx)}
                      className="w-5 h-5 mt-1 accent-orange-600 cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{item.trade_name}</h3>
                        {item.area_name && (
                          <Badge variant="outline" className="text-xs">
                            {item.area_name}
                          </Badge>
                        )}
                        <Badge
                          className={
                            item.confidence === 'high'
                              ? 'bg-green-100 text-green-800'
                              : item.confidence === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }
                        >
                          {item.confidence}
                        </Badge>
                      </div>

                      <p className="text-gray-900 mb-2">{item.description}</p>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-600">Quantity</p>
                          <p className="text-sm font-medium text-gray-900">
                            {item.quantity ? `${item.quantity} ${item.unit || 'EA'}` : '(needs measurement)'}
                          </p>
                          {item.needs_measurement && (
                            <p className="text-xs text-amber-600">⚠️ Measurement needed</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Source</p>
                          <p className="text-sm text-gray-500 italic">"{item.source_text}"</p>
                        </div>
                      </div>

                      {item.needs_review && (
                        <Alert className="bg-amber-50 border-amber-200">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-amber-800">
                            This item needs manual review
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Areas Needing Info */}
          {data.areas_needing_info.length > 0 && (
            <Card className="mb-8 border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="text-amber-900">Missing Information</CardTitle>
                <CardDescription>These measurements should be verified on site</CardDescription>
              </CardHeader>
              <CardContent>
                {data.areas_needing_info.map((area, idx) => (
                  <div key={idx} className="mb-4 last:mb-0">
                    <h4 className="font-semibold text-gray-900 mb-2">{area.area}</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {area.missing_info.map((info, i) => (
                        <li key={i} className="text-sm text-gray-700">
                          {info}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              onClick={handleCreateEstimate}
              disabled={selectedItems.size === 0 || processing}
              className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Estimate...
                </>
              ) : (
                `Create Estimate (${selectedItems.size} items)`
              )}
            </Button>
            <Button variant="outline" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
