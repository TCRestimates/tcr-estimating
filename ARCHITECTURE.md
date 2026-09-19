# TCR Builders Construction Estimating Platform
## Architecture & Design Document

---

## 1. APPLICATION ARCHITECTURE OVERVIEW

### Core Principle
Build a modular, enterprise-capable construction estimating system with clear separation of concerns:
- **Project Management Layer** - Customer, project, and property information
- **Scope Extraction Layer** - Walkthrough processing, AI-assisted scope detection
- **Pricing Layer** - Cost database, pricing calculations, margin/markup logic
- **Estimate Assembly Layer** - Combining scope with pricing into professional estimates
- **Proposal Generation Layer** - Customer-facing estimates and contracts
- **Intelligence Layer** - Historical tracking, variance analysis, learning

### Architectural Principles
1. **Organization Multi-tenancy** - All data scoped to organization_id
2. **Data Integrity** - Versioning, audit trails, immutable snapshots
3. **Extensibility** - AI provider abstraction, payment schedule flexibility, template system
4. **Clean Business Logic** - Separation between database models, services, and API
5. **User Experience** - Minimize data entry, AI pre-fills with human review

---

## 2. CORE ENTITIES & RELATIONSHIPS

### User & Organization Layer
```
organizations
├── users (organization members)
├── user_roles (admin, estimator, viewer, etc.)
└── organization_settings (branding, defaults, preferences)

customers
├── customer_contacts
└── customer_notes

projects
├── project_files (PDFs, images, videos)
├── project_participants (which users are assigned)
└── project_phases (optional: for multi-phase projects)
```

### Scope & Extraction Layer
```
walkthroughs
├── walkthrough_files (video/audio/transcript uploads)
├── transcripts (extracted text)
├── ai_extractions (scope items extracted by AI)
├── extraction_feedback (human corrections/feedback)
└── identified_areas (kitchen, bathroom, exterior, etc.)

trades
└── trade_categories (hierarchical if needed later)

scope_items
├── source (walkthrough, manual entry, plan extraction)
└── confidence (high/medium/low/needs_review)
```

### Pricing Layer
```
cost_items (master cost library)
├── cost_item_history (price tracking)
└── cost_item_sources (demo, historical, manual, vendor_quote, etc.)

assemblies (bundled scope like "bathroom renovation")
└── assembly_items (components within assembly)

vendor_quotes
└── vendor_quote_items

subcontractors
└── subcontractor_quotes
```

### Estimate Layer
```
estimates
├── estimate_versions (support change history)
│   └── estimate_sections (grouped by trade)
│       └── estimate_line_items (individual priced scope items)
├── estimate_status (draft, needs_review, ready, sent, accepted, etc.)
└── estimate_metadata (status, visibility, dates)

pricing_rules (company-level defaults)
└── override_rules (per-estimate or per-item overrides)
```

### Proposal & Payment Layer
```
proposal_templates
├── proposal_sections (standard template structure)
├── template_clauses (which contract clauses included)
└── template_settings

contract_clauses (company standard legal/terms language)

proposals (customer-facing output)
├── proposal_versions (snapshots of exact terms issued)
└── proposal_pdf_artifacts

payment_schedules
└── payment_schedule_milestones
```

---

## 3. TECH STACK

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Supabase
- **Auth**: Supabase Auth
- **Styling**: Tailwind CSS + Shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide Icons
- **Utilities**: date-fns, decimal.js for pricing precision

---

## 4. MODULE 1 SCOPE (FOUNDATION)

### What MODULE 1 Will Include

1. **Database Schema & Migrations**
   - All essential tables created
   - Indexes optimized
   - Test data seeding (demo cost library, trades)

2. **Authentication**
   - User registration / login via Supabase Auth
   - Session management
   - Organization context

3. **Organization Setup**
   - Create organization
   - Organization settings defaults
   - User roles

4. **Customer Management**
   - Create customers
   - List customers
   - Customer detail page

5. **Project Management**
   - Create project with complete form
   - Project detail page
   - Project status tracking
   - Project workspace with tab structure

6. **Trade Library**
   - Pre-populated standard trades
   - Add/edit trades
   - Trade management UI

7. **Cost Library MVP**
   - List cost items by trade
   - Create cost items (with demo data)
   - Edit cost items
   - Mark pricing source (demo, historical, manual, etc.)
   - Cost item history tracking

8. **Project Workspace**
   - Tab navigation (Overview, Walkthrough, Plans & Files, Scope, Estimate, Proposal, History)
   - Placeholder pages for future modules

### What MODULE 1 Will NOT Include
- Walkthrough upload & processing
- AI scope extraction
- Estimate builder
- Proposal generation
- Transcription
- Any external AI API calls

---

## 5. FOLDER STRUCTURE (Next.js)

```
tcr-estimating/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx (overview)
│   │   │       ├── walkthrough/page.tsx
│   │   │       ├── files/page.tsx
│   │   │       ├── scope/page.tsx
│   │   │       ├── estimate/page.tsx
│   │   │       ├── proposal/page.tsx
│   │   │       └── history/page.tsx
│   │   ├── customers/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   ├── cost-library/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   ├── trades/
│   │   │   ├── page.tsx
│   │   │   └── new/page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── organizations/
│   │   ├── customers/
│   │   ├── projects/
│   │   ├── trades/
│   │   ├── cost-items/
│   │   ├── estimates/
│   │   └── walkthroughs/
│   └── auth/
│       ├── login/page.tsx
│       ├── register/page.tsx
│       └── callback/page.tsx
│
├── components/
│   ├── ui/                    -- Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Form.tsx
│   │   ├── Table.tsx
│   │   └── Input.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── ProjectTabs.tsx
│   ├── forms/
│   │   ├── ProjectForm.tsx
│   │   ├── CustomerForm.tsx
│   │   ├── CostItemForm.tsx
│   │   └── TradeForm.tsx
│   └── sections/
│       ├── ProjectOverview.tsx
│       └── CostLibraryTable.tsx
│
├── services/
│   ├── ai/
│   │   ├── AIService.ts
│   │   ├── TranscriptionService.ts
│   │   └── ScopeExtractionService.ts
│   ├── estimation/
│   │   ├── EstimationEngine.ts
│   │   ├── PricingCalculator.ts
│   │   └── ProposalGenerator.ts
│   ├── database/
│   │   ├── DatabaseService.ts
│   │   ├── CustomerService.ts
│   │   ├── ProjectService.ts
│   │   ├── CostLibraryService.ts
│   │   └── TradeService.ts
│   └── auth/
│       └── AuthService.ts
│
├── lib/
│   ├── auth.ts
│   ├── supabase.ts
│   ├── utils.ts
│   └── types.ts
│
├── types/
│   ├── index.ts
│   ├── database.ts
│   ├── api.ts
│   └── models.ts
│
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_seed_trades.sql
│   └── 003_seed_demo_costs.sql
│
├── public/
├── styles/
│   ├── globals.css
│   └── layout.module.css
│
├── .env.example
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── package.json
└── README.md
```

---

## 6. DATABASE SCHEMA (PostgreSQL)

See `database/schema.sql` for the complete schema definition.

Key tables:
- organizations, users
- customers, projects, project_files
- trades, cost_items, cost_item_history
- walkthroughs, transcripts, ai_extractions
- estimates, estimate_versions, estimate_sections, estimate_line_items
- proposals, proposal_templates, contract_clauses, payment_schedules

---

## 7. FIRST-DAY DEVELOPMENT PLAN

**Goals:**
1. ✅ Set up Next.js project structure
2. ✅ Configure Supabase (database + auth)
3. ✅ Create database schema + migrations
4. ✅ Seed initial data (trades, demo cost library)
5. ✅ Implement authentication (login/register)
6. ✅ Build organization creation + onboarding
7. ✅ Create customer CRUD + UI
8. ✅ Build project CRUD + workspace tabs
9. ✅ Create trade library management
10. ✅ Build cost library MVP

**Deliverable:**
- Running Next.js app with auth
- Can create organization & customers
- Can create projects with workspace tabs
- Can view/edit trades and cost items
- Database migrations documented

---

## 8. SUMMARY

This architecture provides:
- ✅ **Modularity**: Each feature isolated and buildable independently
- ✅ **Extensibility**: AI services abstracted and swappable
- ✅ **Data Integrity**: Versioning and audit trails built in
- ✅ **Multi-tenancy**: All data scoped to organization
- ✅ **Clean Separation**: UI, services, database layers distinct
- ✅ **Scalability**: Ready for future features (actuals, learning, plan reading)
- ✅ **User-Focused**: Minimal data entry, AI-assisted with human review

Next: Implement MODULE 1 foundation.
