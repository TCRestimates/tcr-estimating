# Quick Start - AI Integrations

**Status**: ✅ Production Ready | **Date**: 2026-09-18

## 30 Second Setup

```bash
# 1. Add to .env.local
echo "ANTHROPIC_API_KEY=sk-ant-v1-xxxxx" >> .env.local
echo "OPENAI_API_KEY=sk-proj-xxxxx" >> .env.local

# 2. Get API keys (see below)

# 3. Test it
npm run test:integration
```

---

## Get API Keys

### Anthropic (2 minutes)
1. Go to https://console.anthropic.com
2. Sign in / Create account
3. Click "API Keys" → "Create Key"
4. Copy and paste into .env.local

### OpenAI (2 minutes)
1. Go to https://platform.openai.com/api-keys
2. Sign in / Create account  
3. Create API key
4. Copy and paste into .env.local

---

## What You Can Do Now

### 1. Transcribe Audio/Video
```typescript
import { getTranscriptionService } from '@/services/transcription/TranscriptionService'

const transcriber = getTranscriptionService('openai')
const result = await transcriber.transcribe(audioBuffer, 'audio')
// Returns: { transcript: string, confidence: number }
```

### 2. Extract Scope from Transcript
```typescript
import { getScopeExtractionService } from '@/services/ai/ScopeExtractionService'

const aiService = getScopeExtractionService('anthropic')
const result = await aiService.extract(transcript)
// Returns: { identified_areas: [], scope_items: [], confidence: 0.87 }
```

### 3. Create Estimate with Pricing
```typescript
import { EstimationEngine } from '@/services/estimation/EstimationEngine'

const engine = new EstimationEngine()
const estimate = engine.createEstimate(scopeItems, costItems, quoteNumber, markup)
// Returns: { sections: [], total_estimated_cost, total_selling_price }
```

### 4. Generate Customer Proposal
```typescript
import { ProposalGenerator } from '@/services/estimation/ProposalGenerator'

const proposal = ProposalGenerator.generateProposal(estimate, proposalNumber, ...)
// Returns: { proposal_number, sections, total_amount, deposit_amount }

// Get HTML for PDF
const html = ProposalGenerator.generateHTML(proposal)

// Get Markdown for email
const markdown = ProposalGenerator.generateMarkdown(proposal)
```

---

## API Endpoints Ready to Use

| Endpoint | Method | What It Does |
|----------|--------|-------------|
| `/api/walkthroughs` | POST | Create new walkthrough |
| `/api/walkthroughs` | GET | List walkthroughs |
| `/api/walkthroughs/:id/process` | POST | **Extract scope (calls real AI)** |
| `/api/estimates` | POST | Create estimate |
| `/api/estimates` | GET | List estimates |
| `/api/estimates/:id/generate-proposal` | POST | Generate proposal |

---

## Test Immediately

```bash
# Run complete end-to-end test
npm run test:integration

# Output shows:
# ✓ Scope extraction (real Anthropic API call)
# ✓ Estimate creation
# ✓ Proposal generation
# ✓ Complete workflow
```

---

## Configuration Options

### Minimal (Recommended)
```bash
# Use Anthropic for extraction, manual for transcription
ANTHROPIC_API_KEY=sk-ant-v1-xxxxx
```

### Complete (With Audio Support)
```bash
# Use Anthropic for extraction, OpenAI for transcription
ANTHROPIC_API_KEY=sk-ant-v1-xxxxx
OPENAI_API_KEY=sk-proj-xxxxx
AI_PROVIDER=anthropic
TRANSCRIPTION_PROVIDER=openai
```

### Alternative
```bash
# Use OpenAI for both
OPENAI_API_KEY=sk-proj-xxxxx
AI_PROVIDER=openai
TRANSCRIPTION_PROVIDER=openai
```

---

## Cost Per Walkthrough

| Task | Provider | Cost |
|------|----------|------|
| Scope Extraction | Anthropic | $0.003 |
| Scope Extraction | OpenAI | $0.010 |
| Transcription | OpenAI | $0.02/min |
| Manual Transcript | N/A | $0 |

**Cheapest combo**: Anthropic + Manual = $0.003/walkthrough

---

## Example Usage in API Route

```typescript
// app/api/walkthroughs/[id]/process/route.ts

import { getScopeExtractionService } from '@/services/ai/ScopeExtractionService'

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  
  // Get transcript (already in database or provided)
  const transcript = body.transcript_text
  
  // Call real AI (Anthropic or OpenAI)
  const aiService = getScopeExtractionService(process.env.AI_PROVIDER)
  const result = await aiService.extract(transcript)
  
  // Save extracted scope items to database
  // ...
  
  return NextResponse.json({
    success: true,
    scope_items: result.scope_items,
    identified_areas: result.identified_areas,
    extraction_confidence: result.extraction_confidence
  })
}
```

---

## Common Issues

### "API key not configured"
```bash
# Check .env.local has the key
grep ANTHROPIC_API_KEY .env.local

# Restart dev server
npm run dev
```

### Poor extraction quality
```bash
# Try with more detailed transcript
# Or switch to GPT-4 for higher accuracy
AI_PROVIDER=openai npm run test:integration
```

### "Anthropic does not provide transcription"
```bash
# Use OpenAI for transcription
TRANSCRIPTION_PROVIDER=openai
```

---

## Documentation

| File | What It Contains |
|------|------------------|
| **SETUP_INTEGRATIONS.md** | Complete setup guide, troubleshooting |
| **INTEGRATIONS_SUMMARY.md** | Full implementation details |
| **WORKFLOW.md** | API documentation with examples |
| **examples/complete-workflow.example.ts** | Code examples |
| **test/integration.test.ts** | Full integration test |

---

## Next Steps

1. ✅ Add API keys to `.env.local`
2. ✅ Run: `npm run test:integration`
3. ✅ Test API endpoints (curl or Postman)
4. ⬜ Build UI for walkthrough upload
5. ⬜ Build UI for scope review
6. ⬜ Build UI for estimate builder
7. ⬜ Build UI for proposal generation
8. ⬜ Implement PDF generation

---

## Support

- 📖 See SETUP_INTEGRATIONS.md for detailed setup
- 💻 See examples/complete-workflow.example.ts for code samples
- 🧪 Run npm run test:integration to verify everything works
- 📋 See WORKFLOW.md for complete API documentation

---

**Everything is ready to use. Get your API keys and test immediately!**

```bash
npm run test:integration
```
