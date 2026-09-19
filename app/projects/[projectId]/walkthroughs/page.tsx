'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react'

interface WalkthroughUploadState {
  walkthrough_type: 'transcript' | 'audio' | 'video'
  transcript_text?: string
  audioFile?: File
  notes?: string
}

interface WalkthroughResponse {
  success: boolean
  walkthrough: {
    id: string
    project_id: string
    walkthrough_type: string
    recorded_date: string
    created_at: string
  }
}

export default function WalkthroughUploadPage() {
  const router = useRouter()
  const { projectId } = useParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [state, setState] = useState<WalkthroughUploadState>({
    walkthrough_type: 'transcript',
  })

  const handleTypeChange = (type: 'transcript' | 'audio' | 'video') => {
    setState((prev) => ({ ...prev, walkthrough_type: type }))
    setError(null)
  }

  const handleTranscriptChange = (text: string) => {
    setState((prev) => ({ ...prev, transcript_text: text }))
  }

  const handleAudioSelect = (file: File | undefined) => {
    setState((prev) => ({ ...prev, audioFile: file }))
  }

  const handleNotesChange = (text: string) => {
    setState((prev) => ({ ...prev, notes: text }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate input
      if (state.walkthrough_type === 'transcript' && !state.transcript_text?.trim()) {
        throw new Error('Please provide a transcript')
      }

      if ((state.walkthrough_type === 'audio' || state.walkthrough_type === 'video') && !state.audioFile) {
        throw new Error(`Please select an ${state.walkthrough_type} file`)
      }

      // Create walkthrough
      const response = await fetch('/api/walkthroughs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          walkthrough_type: state.walkthrough_type,
          recorded_date: new Date().toISOString().split('T')[0],
          notes: state.notes,
          transcript_text: state.walkthrough_type === 'transcript' ? state.transcript_text : undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create walkthrough')
      }

      const data: WalkthroughResponse = await response.json()
      setSuccess(`✓ Walkthrough created successfully!`)

      // Redirect to scope review page
      setTimeout(() => {
        router.push(`/projects/${projectId}/walkthroughs/${data.walkthrough.id}/process`)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Walkthrough</h1>
        <p className="text-gray-600">Create a new construction walkthrough for project {projectId}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Walkthrough Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Input Type</CardTitle>
            <CardDescription>How do you want to provide the walkthrough?</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => handleTypeChange('transcript')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  state.walkthrough_type === 'transcript'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900">Transcript</div>
                <div className="text-sm text-gray-600">Paste text</div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('audio')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  state.walkthrough_type === 'audio'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900">Audio</div>
                <div className="text-sm text-gray-600">Upload MP3</div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('video')}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  state.walkthrough_type === 'video'
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold text-gray-900">Video</div>
                <div className="text-sm text-gray-600">Upload MP4</div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Transcript Input */}
        {state.walkthrough_type === 'transcript' && (
          <Card>
            <CardHeader>
              <CardTitle>Paste Transcript</CardTitle>
              <CardDescription>Paste the text of your construction walkthrough</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="We're going to renovate the bathroom. Remove the existing bathtub and tile. Install a walk-in shower with new tile surround..."
                value={state.transcript_text || ''}
                onChange={(e) => handleTranscriptChange(e.target.value)}
                rows={8}
                className="w-full"
              />
              <p className="text-sm text-gray-500 mt-2">
                {state.transcript_text?.length || 0} characters
              </p>
            </CardContent>
          </Card>
        )}

        {/* Audio/Video Upload */}
        {(state.walkthrough_type === 'audio' || state.walkthrough_type === 'video') && (
          <Card>
            <CardHeader>
              <CardTitle>Upload {state.walkthrough_type === 'audio' ? 'Audio' : 'Video'} File</CardTitle>
              <CardDescription>
                {state.walkthrough_type === 'audio'
                  ? 'MP3, WAV, or other audio format'
                  : 'MP4 or other video format'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                <label className="cursor-pointer">
                  <span className="text-blue-600 font-medium hover:underline">Click to upload</span>
                  <input
                    type="file"
                    accept={
                      state.walkthrough_type === 'audio' ? 'audio/*' : 'video/mp4,video/*'
                    }
                    onChange={(e) => handleAudioSelect(e.target.files?.[0])}
                    className="hidden"
                  />
                </label>
                {state.audioFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {state.audioFile.name}
                  </p>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Note: Audio/video will be transcribed using OpenAI Whisper
              </p>
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Notes (Optional)</CardTitle>
            <CardDescription>Add any context about this walkthrough</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Master bathroom renovation, initial site visit..."
              value={state.notes || ''}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={3}
              className="w-full"
            />
          </CardContent>
        </Card>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Upload Walkthrough'
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
