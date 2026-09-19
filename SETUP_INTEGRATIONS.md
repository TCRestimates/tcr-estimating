# API Integrations Setup Guide

This guide explains how to configure the real AI provider integrations for the TCR Builders platform.

## Overview

The platform supports multiple AI providers for two key functions:

1. **Transcription**: Convert audio/video walkthrough to text
   - OpenAI Whisper (recommended for audio/video)
   - Manual transcripts (provide transcript text directly)

2. **Scope Extraction**: Convert transcript to structured scope items
   - OpenAI GPT-4 (GPT-4 Turbo)
   - Anthropic Claude (Claude 3.5 Sonnet) - **Recommended**

## Prerequisites

Ensure you have the following environment variables in your `.env.local` file:

```bash
# Required for API calls
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Provider selection (defaults shown)
AI_PROVIDER=anthropic                    # 'anthropic' or 'openai'
TRANSCRIPTION_PROVIDER=manual            # 'openai', 'anthropic', or 'manual'
```

---

## Configuration Options

### 1. Scope Extraction Provider

Set `AI_PROVIDER` to choose which AI model processes walkthroughs:

#### Option A: Anthropic Claude (Recommended)

**Why Anthropic?**
- Claude 3.5 Sonnet is excellent at structured extraction
- Better at understanding construction terminology
- Lower cost than GPT-4
- Excellent instruction following

```bash
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-v1-xxxxxxxxxxxxxx
```

**Cost**: ~$0.003 per walkthrough transcript (input tokens cheaper than output)

#### Option B: OpenAI GPT-4

**Why GPT-4?**
- Extremely accurate for complex extractions
- Best performance on edge cases
- Larger context window (128K tokens)
- Good for enterprise use cases

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxx
```

**Cost**: ~$0.01 per walkthrough transcript

---

### 2. Transcription Provider

Set `TRANSCRIPTION_PROVIDER` to handle audio/video walkthrough files:

#### Option A: Manual Transcription (Default)

Users provide transcript text directly. No API calls needed.

```bash
TRANSCRIPTION_PROVIDER=manual
```

**Use Case**: Customer already has transcript or you prefer manual transcription.

#### Option B: OpenAI Whisper (Recommended for Audio/Video)

Automatically transcribes audio and video files.

```bash
TRANSCRIPTION_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxx
```

**Supported Formats**:
- Audio: MP3, MP4, MPEG, MPGA, M4A, WAV, WEBM
- Video: MP4 (video will be extracted)

**Cost**: ~$0.006 per minute of audio (currently $0.02/min with Whisper v3)

**Example Usage**:
```typescript
import { getTranscriptionService } from '@/services/transcription/TranscriptionService'

const transcriber = getTranscriptionService('openai')
const result = await transcriber.transcribe(audioBuffer, 'audio')
// Returns: { transcript: string, confidence: number, provider: 'openai' }
```

#### Option C: Anthropic (Not Available)

Anthropic does not currently offer transcription services. Use OpenAI Whisper or manual transcription instead.

---

## Workflow: End-to-End Example

### Step 1: Setup Environment

Create `.env.local`:

```bash
# Use Anthropic for scope extraction
AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-v1-xxxxx

# Use OpenAI for transcription
TRANSCRIPTION_PROVIDER=openai
OPENAI_API_KEY=sk-proj-xxxxx

# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 2: Upload Walkthrough

```bash
curl -X POST http://localhost:3000/api/walkthroughs \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "12345678-1234-5678-1234-567812345678",
    "walkthrough_type": "transcript",
    "recorded_date": "2026-09-18",
    "duration_minutes": 15,
    "notes": "Initial bathroom renovation walkthrough",
    "transcript_text": "We need to demo the bathroom and install a new walk-in shower with tile surround..."
  }'
```

Response:
```json
{
  "success": true,
  "walkthrough": {
    "id": "wt-123456",
    "project_id": "12345678-1234-5678-1234-567812345678",
    "created_at": "2026-09-18T21:30:00Z"
  }
}
```

### Step 3: Process Walkthrough (Extract Scope)

```bash
curl -X POST http://localhost:3000/api/walkthroughs/wt-123456/process \
  -H "Content-Type: application/json" \
  -d '{
    "organization_id": "org-123456",
    "ai_provider": "anthropic"
  }'
```

Response:
```json
{
  "success": true,
  "walkthrough_id": "wt-123456",
  "identified_areas": ["bathroom"],
  "scope_items_extracted": 7,
  "scope_items": [
    {
      "trade_name": "Demolition",
      "description": "Remove existing bathtub",
      "confidence": "high",
      "source_text": "Remove the existing tub",
      "needs_measurement": true,
      "needs_review": false
    }
    // ... more items
  ],
  "extraction_confidence": 0.87,
  "ai_provider": "anthropic"
}
```

### Step 4: Create Estimate

```bash
curl -X POST http://localhost:3000/api/estimates \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "12345678-1234-5678-1234-567812345678",
    "organization_id": "org-123456",
    "scope_item_ids": [
      "ai-ext-001",
      "ai-ext-002",
      "ai-ext-003"
    ],
    "default_markup_percent": 25
  }'
```

Response:
```json
{
  "success": true,
  "estimate": {
    "id": "est-123456",
    "quote_number": "EST-1234567890",
    "status": "draft"
  },
  "totals": {
    "estimated_cost": 8500.00,
    "selling_price": 10625.00,
    "profit": 2125.00,
    "profit_margin_percent": 20.0
  }
}
```

### Step 5: Generate Customer Proposal

```bash
curl -X POST http://localhost:3000/api/estimates/est-123456/generate-proposal \
  -H "Content-Type: application/json" \
  -d '{
    "deposit_percent": 25,
    "company_phone": "(555) 123-4567",
    "company_email": "estimates@tcrbuilders.com",
    "company_license": "CSLB #1234567",
    "payment_schedule": [
      {
        "order": 1,
        "description": "Deposit",
        "percentage": 25,
        "trigger_description": "Upon contract signing"
      },
      {
        "order": 2,
        "description": "Final Payment",
        "percentage": 75,
        "trigger_description": "Upon project completion"
      }
    ]
  }'
```

Response:
```json
{
  "success": true,
  "proposal": {
    "id": "prop-123456",
    "proposal_number": "PROP-1234567890",
    "total_amount": "$10,625.00",
    "deposit_amount": "$2,656.25"
  },
  "proposal_html": "<html>... complete HTML proposal ...</html>",
  "proposal_markdown": "# PROPOSAL..."
}
```

---

## Cost Comparison

| Provider | Task | Cost | Notes |
|----------|------|------|-------|
| Anthropic | Scope Extraction | $0.003 | Per transcript ~200 tokens |
| OpenAI GPT-4 | Scope Extraction | $0.010 | More expensive but reliable |
| OpenAI Whisper | Transcription | $0.020/min | Best for audio/video walkthrough |
| Manual | Transcription | $0 | User provides transcript |

**Recommended Combination**:
- Anthropic for scope extraction (best balance of cost and quality)
- OpenAI Whisper for audio/video transcription
- **Monthly cost for 100 walkthroughs**: ~$30 + transcription costs

---

## Getting API Keys

### Anthropic API Key

1. Go to [https://console.anthropic.com](https://console.anthropic.com)
2. Sign in or create an account
3. Click "API Keys" in the sidebar
4. Create a new API key
5. Copy the key and add to `.env.local`:

```bash
ANTHROPIC_API_KEY=sk-ant-v1-xxxxxxxxxxxxxx
```

### OpenAI API Key

1. Go to [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys)
2. Sign in or create an account
3. Create a new API key
4. Copy the key and add to `.env.local`:

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxx
```

### Add Usage Limits (Optional but Recommended)

In both provider dashboards, set monthly usage limits to avoid unexpected costs:

**Anthropic**: Dashboard → Settings → Usage Limits
**OpenAI**: Billing → Usage Limits

---

## Testing the Integrations

### Run Integration Test

```bash
npm run test:integration
```

This runs the complete workflow test with sample data.

### Test Individual Services

```bash
# Test scope extraction only
npx ts-node test/integration.test.ts --scope-only

# Test transcription only
npx ts-node test/integration.test.ts --transcribe-only

# Test with specific provider
AI_PROVIDER=openai npx ts-node test/integration.test.ts
TRANSCRIPTION_PROVIDER=openai npx ts-node test/integration.test.ts
```

---

## Troubleshooting

### "API key not configured"

**Error**: `Anthropic API key not configured`

**Solution**: 
1. Check `.env.local` has `ANTHROPIC_API_KEY` set
2. Restart the dev server: `npm run dev`
3. Check API key format starts with `sk-ant-v1-`

### "API error: unauthorized"

**Error**: `Anthropic API error: unauthorized`

**Solution**:
1. Verify API key is correct (copy/paste from console)
2. Check API key hasn't been revoked
3. Ensure API key is for the correct organization

### "Connection timeout"

**Error**: `fetch failed` or `ECONNREFUSED`

**Solution**:
1. Check internet connection
2. Verify proxy settings if behind corporate firewall
3. Try with different provider to isolate issue
4. Check API service status pages

### Extraction quality is poor

**Solutions**:
1. Provide more detailed walkthrough transcript
2. Ask estimator to be specific about quantities
3. Try switching to GPT-4 for higher accuracy
4. Add clarifying notes in walkthrough to guide AI

### Transcription quality is poor

**Solutions**:
1. Ensure audio quality is high (minimal background noise)
2. Speak clearly during walkthrough
3. Provide optional transcript prompt in extraction API call
4. Consider providing manual transcript for better results

---

## Rate Limits & Quotas

### Anthropic
- **Rate Limit**: 40,000 requests/day (standard tier)
- **Context Window**: 200,000 tokens
- **Message Size**: Up to 100,000 tokens per request

### OpenAI
- **Rate Limit**: Depends on plan tier (check dashboard)
- **Context Window**: 128,000 tokens for GPT-4 Turbo
- **Message Size**: Up to 128,000 tokens per request

---

## Next Steps

1. ✅ Configure environment variables
2. ✅ Get API keys from providers
3. ✅ Test with `npm run test:integration`
4. ✅ Build UI for walkthrough upload/processing
5. ✅ Connect API endpoints to frontend
6. ✅ Implement PDF proposal generation
7. ✅ Add email delivery integration

See [WORKFLOW.md](./WORKFLOW.md) for complete API documentation.
See [ARCHITECTURE.md](./ARCHITECTURE.md) for system design details.
