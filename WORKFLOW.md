# TCR Builders - Walkthrough to Proposal Workflow

This document explains the complete workflow for converting a construction walkthrough into a customer-facing estimate and proposal.

## Complete Workflow Flow

```
1. UPLOAD WALKTHROUGH
   ↓
2. PROCESS WALKTHROUGH (Extract Scope)
   ↓
3. CREATE ESTIMATE (Price the Scope)
   ↓
4. REVIEW & EDIT ESTIMATE
   ↓
5. GENERATE PROPOSAL (Customer-Facing)
   ↓
6. SEND TO CUSTOMER
```

---

## Step-by-Step API Usage

### STEP 1: Upload Walkthrough

**Endpoint:** `POST /api/walkthroughs`

User uploads a video, audio recording, or transcript of a property walkthrough.

**Request:**
```json
{
  "project_id": "12345678-1234-5678-1234-567812345678",
  "walkthrough_type": "transcript",
  "recorded_date": "2026-09-18",
  "duration_minutes": 15,
  "notes": "Initial site visit - bathroom renovation",
  "transcript_text": "We're going to gut this bathroom. Remove the existing tub and tile. Install a walk-in shower. New vanity, toilet, tile floor, six recessed lights, move one outlet, paint the entire bathroom, and replace the window."
}
```

**Response:**
```json
{
  "success": true,
  "walkthrough": {
    "id": "wt-123456",
    "project_id": "12345678-1234-5678-1234-567812345678",
    "walkthrough_type": "transcript",
    "recorded_date": "2026-09-18",
    "created_at": "2026-09-18T21:30:00Z"
  }
}
```

---

### STEP 2: Process Walkthrough (Extract Scope)

**Endpoint:** `POST /api/walkthroughs/:id/process`

The system analyzes the transcript and extracts:
- Identified areas (kitchen, bathroom, exterior, etc.)
- Scope items (what work needs to be done)
- Trade classifications (demolition, plumbing, electrical, etc.)
- Quantities (when mentioned)
- Confidence scores (how sure the AI is)

**Request:**
```json
{
  "organization_id": "org-123456",
  "ai_provider": "anthropic"
}
```

**Response:**
```json
{
  "success": true,
  "walkthrough_id": "wt-123456",
  "transcript_length": 187,
  "identified_areas": ["bathroom"],
  "scope_items_extracted": 7,
  "scope_items": [
    {
      "trade_name": "Demolition",
      "area_name": "bathroom",
      "description": "Remove existing bathtub",
      "quantity": null,
      "unit": null,
      "confidence": "high",
      "source_text": "Remove the existing tub",
      "needs_measurement": true,
      "needs_review": false
    },
    {
      "trade_name": "Plumbing",
      "area_name": "bathroom",
      "description": "Plumbing modifications for walk-in shower",
      "quantity": null,
      "unit": null,
      "confidence": "high",
      "source_text": "Install a walk-in shower",
      "needs_measurement": true,
      "needs_review": false
    },
    ...
  ],
  "areas_needing_info": [
    {
      "area": "bathroom",
      "missing_info": ["bathroom square footage", "tile area dimensions"]
    }
  ],
  "ai_provider": "anthropic",
  "extraction_confidence": 0.87
}
```

**Key Points:**
- Items with `needs_measurement: true` require the estimator to provide quantity
- Items with `needs_review: true` should be manually verified
- Items with `confidence: "low"` or `"needs_review"` should be double-checked
- The system NEVER invents measurements - missing data is explicitly marked

---

### STEP 3: Review Extracted Scope

**Human Review Step** (No API call yet)

The estimator reviews the extracted scope items:
1. Verify each item matches what was discussed
2. Add any missing items
3. Update quantities where needed
4. Correct trade classifications if wrong
5. Mark items for deletion if not needed

This would typically happen in a UI where items can be edited inline.

---

### STEP 4: Create Estimate

**Endpoint:** `POST /api/estimates`

The system prices the scope items using the cost library and creates an estimate.

**Request:**
```json
{
  "project_id": "12345678-1234-5678-1234-567812345678",
  "organization_id": "org-123456",
  "scope_item_ids": [
    "ai-ext-001",
    "ai-ext-002",
    "ai-ext-003"
  ],
  "custom_items": [
    {
      "trade_name": "Electrical",
      "description": "New electrical panel upgrade",
      "quantity": 1,
      "unit": "EA",
      "needs_measurement": false
    }
  ],
  "default_markup_percent": 25
}
```

**Response:**
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
  },
  "sections_count": 6,
  "line_items_count": 12,
  "areas_needing_measurement": [
    {
      "area": "Tile",
      "items": ["Install shower tile surround", "Install bathroom floor tile"]
    }
  ]
}
```

**Pricing Calculation Example:**

For a single line item:
```
Material Cost: $100
Labor Cost: $80
Subcontractor Cost: $0
Equipment Cost: $0
Waste %: 5%

Quantity: 100 SF

Estimated Cost = (100 + 80) * 100 * 1.05 = $18,900
Markup 25% = $18,900 * 0.25 = $4,725
Selling Price = $18,900 + $4,725 = $23,625
```

---

### STEP 5: Review & Edit Estimate

**Human Review Step** (UI-based)

The estimator can:
1. Add/remove line items
2. Override quantities
3. Override pricing
4. Change markup percentages
5. Add trade-specific notes
6. Review items with missing measurements

Once satisfied, the estimate is marked as `ready`.

---

### STEP 6: Generate Proposal

**Endpoint:** `POST /api/estimates/:id/generate-proposal`

Converts the internal estimate into a customer-facing proposal.

**Request:**
```json
{
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
  ],
  "general_notes": [
    "This estimate is valid for 30 days from the date above.",
    "Estimate does not include items not explicitly listed above.",
    "Changes to the scope of work will require a change order.",
    "Timeline is an estimate and subject to unforeseen conditions."
  ]
}
```

**Response:**
```json
{
  "success": true,
  "proposal": {
    "id": "prop-123456",
    "proposal_number": "PROP-1234567890",
    "status": "generated",
    "customer_name": "John Smith",
    "total_amount": "$10,625.00",
    "deposit_amount": "$2,656.25",
    "deposit_percent": 25
  },
  "proposal_content": {
    "proposal_number": "PROP-1234567890",
    "date": "2026-09-18",
    "customer": {
      "name": "John Smith",
      "email": "john@example.com",
      "phone": "(555) 987-6543",
      "address": "123 Main St, Anytown CA 90000"
    },
    "sections": [
      {
        "trade_name": "Demolition",
        "items": [
          {
            "description": "Remove existing bathtub",
            "quantity": "1",
            "unit": "EA",
            "selling_price": "$350.00"
          }
        ],
        "subtotal": "$350.00"
      },
      ...
    ],
    "total_amount": "$10,625.00",
    "deposit_amount": "$2,656.25",
    "payment_schedule": [...]
  },
  "proposal_html": "<html>...</html>",
  "proposal_markdown": "# PROPOSAL..."
}
```

**What Customer Sees:**
- ✅ Scope of work
- ✅ Price by trade
- ✅ Total cost
- ✅ Deposit required
- ✅ Payment schedule
- ✅ General terms

**What Customer Does NOT See:**
- ❌ Material costs
- ❌ Labor costs
- ❌ Subcontractor costs
- ❌ Profit/margin
- ❌ Markup percentages
- ❌ Internal notes

---

## Data Relationships

```
Project
  ├── Walkthrough
  │   ├── Transcript
  │   └── AI Extractions
  │       └── Extraction Feedback (human corrections)
  │
  ├── Estimate (v1, v2, v3...)
  │   ├── Estimate Sections (grouped by trade)
  │   │   └── Estimate Line Items
  │   │       ├── References AI Extraction (optional)
  │   │       └── References Cost Item (from library)
  │   │
  │   └── Proposal
  │       └── Proposal Versions (immutable snapshots)
```

---

## Key Features Explained

### 1. Confidence Scores
Each extracted item has a confidence level:
- **high** - The AI is very confident
- **medium** - Somewhat confident, worth verifying
- **low** - Low confidence, needs human review
- **needs_review** - Should definitely be reviewed

### 2. Needs Measurement
When the transcript mentions work but not quantities:
```
Transcript: "We're going to tile the floor"
Extraction: quantity = null, needs_measurement = true
```

The estimator must provide measurements before pricing.

### 3. Multiple Versions
Every estimate can have multiple versions:
- EST-001 Version 1
- EST-001 Version 2
- EST-001 Version 3

Each version is immutable. Proposals always reference a specific version.

### 4. Pricing Hierarchy
```
Cost Item (from library) 
  ↓ (if overridden)
Estimate Line Item
  ↓ (results in)
Proposal (customer sees final price only)
```

---

## Error Handling

### Common Issues

**Missing Walkthrough**
```json
{ "error": "Walkthrough not found", "status": 404 }
```

**No Transcript Available**
```json
{ 
  "error": "Audio/video transcription not yet implemented",
  "status": 501 
}
```

**No Scope Items**
```json
{ "error": "No scope items provided", "status": 400 }
```

**Missing Measurements**
```json
{
  "warning": "Items need measurement before proposal",
  "areas_needing_measurement": [
    { "area": "Tile", "items": ["Install floor tile"] }
  ]
}
```

---

## Future Enhancements

1. **PDF Generation** - Generate downloadable PDF proposals
2. **Email Delivery** - Send proposals directly to customers
3. **Digital Signatures** - Customer signature capture
4. **Change Orders** - Handle scope changes after proposal
5. **Actual Cost Tracking** - Compare estimated vs actual
6. **Plan Reading** - Extract scope from architectural drawings
7. **Historical Learning** - Learn from past estimates

---

## Environment Variables Required

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# AI Providers
AI_PROVIDER=anthropic  # or "openai"
ANTHROPIC_API_KEY=your_key
OPENAI_API_KEY=your_key

# Transcription
TRANSCRIPTION_PROVIDER=manual  # or "openai", "anthropic"
```

---

## Testing the Workflow

See `/test/workflow.test.ts` for complete end-to-end tests.

Quick test:
```bash
npm run test:workflow
```

---

## Performance Expectations

| Step | Time | Notes |
|------|------|-------|
| Upload Walkthrough | <1s | File upload |
| Extract Scope | 5-30s | Depends on transcript length and AI provider |
| Create Estimate | 1-2s | Calculation and DB operations |
| Generate Proposal | <1s | Template rendering |
| Total | ~10-35s | Mostly waiting for AI |

---

**Module: Walkthrough → Estimate → Proposal**  
**Status: Core workflow implemented, ready for testing**
