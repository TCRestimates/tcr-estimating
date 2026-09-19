# TCR Builders - Construction Estimating Platform
## Module 1: Foundation (MVP)

A modern construction estimating web application built with Next.js, TypeScript, PostgreSQL, and Supabase.

---

## 📋 Project Overview

**Version**: 0.1.0 (Module 1 - Foundation)  
**Status**: In Development  
**Tech Stack**: Next.js 15 | TypeScript | PostgreSQL | Supabase | Tailwind CSS

This is the foundational module of a construction estimating system designed to eventually become an AI-powered platform that learns how contractors price their work.

### What's in Module 1

✅ **Authentication** - Supabase Auth (signup/login)  
✅ **Organizations** - Multi-tenant support with organization creation  
✅ **Customers** - Create and manage customer records  
✅ **Projects** - Project creation with detailed information  
✅ **Project Workspace** - Tab-based project interface  
✅ **Trade Library** - Pre-configured construction trade categories  
✅ **Cost Library** - Cost item management with demo pricing  
✅ **Database Schema** - Complete PostgreSQL schema with migrations  

### What's NOT in Module 1

❌ Walkthrough upload and processing  
❌ AI scope extraction  
❌ Estimate builder  
❌ Proposal generation  
❌ Audio/video transcription  
❌ External AI API integration  

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+ (or Supabase account)
- **Git**
- Environment variables (see below)

### Installation

1. **Clone the repository** (or set up from scratch)
   ```bash
   git clone <repo-url>
   cd tcr-estimating
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   DATABASE_URL=postgresql://user:password@localhost:5432/tcr_estimating
   ```

3. **Create Supabase project** (if needed)
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Copy the project URL and API keys
   - Enable email authentication (Settings → Authentication)

4. **Create PostgreSQL database** (if not using Supabase)
   ```bash
   createdb tcr_estimating
   ```

5. **Run database migrations**
   ```bash
   # Using Supabase: Run SQL manually in Supabase dashboard
   psql -h localhost -U postgres -d tcr_estimating -f database_schema.sql
   
   # Seed trades
   psql $DATABASE_URL -f migrations/002_seed_trades.sql
   
   # Seed demo cost data
   psql $DATABASE_URL -f migrations/003_seed_demo_costs.sql
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```
tcr-estimating/
├── app/                    # Next.js App Router
│   ├── api/               # REST API endpoints
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main application workspace
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
│   ├── ui/               # Basic UI components
│   ├── forms/            # Form components
│   └── sections/         # Feature-specific components
├── services/             # Business logic layer
│   ├── database/         # Database access
│   ├── ai/              # AI service abstractions (future)
│   └── estimation/      # Estimation engine (future)
├── lib/                 # Utilities and helpers
├── types/              # TypeScript types
├── migrations/         # Database migrations
├── public/            # Static assets
└── README.md          # This file
```

---

## 🗄️ Database Schema

The application uses a normalized PostgreSQL schema with the following main tables:

### Core Tables
- `organizations` - Company/tenant records
- `users` - User accounts (scoped to organization)
- `customers` - Customer records
- `projects` - Construction projects

### Pricing Tables
- `trades` - Construction trade categories
- `cost_items` - Cost library items
- `cost_item_history` - Price change tracking

### Estimation Tables
- `estimates` - Estimate records
- `estimate_versions` - Version history
- `estimate_sections` - Estimate organized by trade
- `estimate_line_items` - Individual line items

### Future Tables (Prepared)
- `walkthroughs` - Walkthrough recordings
- `transcripts` - Extracted transcripts
- `ai_extractions` - AI-detected scope items
- `proposals` - Customer-facing proposals
- `actual_costs` - Real costs vs estimated (for learning)

**See `database_schema.sql` for complete schema.**

---

## 🔐 Authentication

### How It Works
1. User signs up with email/password
2. Supabase creates user account
3. User can create organization (first org = admin)
4. Additional users invited to existing organization
5. All data scoped to `organization_id`

### User Roles
- **admin** - Full access, organization settings
- **estimator** - Can create projects, estimates, proposals
- **viewer** - Read-only access
- **manager** - Manages team, approves estimates

---

## 🌐 API Endpoints (Planned)

### Authentication
```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
```

### Organizations
```
POST   /api/organizations        # Create org
GET    /api/organizations/:id    # Get org settings
PUT    /api/organizations/:id    # Update org settings
```

### Customers
```
GET    /api/customers            # List customers
POST   /api/customers            # Create customer
GET    /api/customers/:id        # Get customer
PUT    /api/customers/:id        # Update customer
```

### Projects
```
GET    /api/projects             # List projects
POST   /api/projects             # Create project
GET    /api/projects/:id         # Get project
PUT    /api/projects/:id         # Update project
```

### Trades
```
GET    /api/trades               # List trades
POST   /api/trades               # Create trade
PUT    /api/trades/:id           # Update trade
```

### Cost Items
```
GET    /api/cost-items           # List cost items
POST   /api/cost-items           # Create cost item
PUT    /api/cost-items/:id       # Update cost item
GET    /api/cost-items/:id/history  # Price history
```

---

## 🎨 UI/UX Design

### Color Scheme
- **Primary Orange**: `#FF6B35` - Buttons, highlights, important actions
- **Secondary Blue**: `#1E3A8A` - Navigation, headers, secondary actions
- **White**: `#FFFFFF` - Clean backgrounds
- **Grays**: Borders, inactive elements, secondary text

### Typography
- Professional, clean, easy to read
- Desktop and tablet optimized
- Minimal, not flashy

---

## 🚧 Module 1 Deliverables

### Completed
- ✅ Database schema (PostgreSQL)
- ✅ Authentication flow (Supabase Auth)
- ✅ Organization management
- ✅ Customer CRUD
- ✅ Project creation and workspace
- ✅ Trade library management
- ✅ Cost library MVP
- ✅ Demo pricing data seeded
- ✅ Project structure and configuration

### TODO (Next Steps / Module 2)
- [ ] Build estimate creation interface
- [ ] Implement pricing calculations
- [ ] Create estimate sections and line items
- [ ] Add walkthrough upload architecture
- [ ] Implement AI service abstraction layer
- [ ] Create scope extraction UI

---

## 📝 Environment Variables

Required environment variables in `.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Database (for migrations)
DATABASE_URL=postgresql://user:password@localhost:5432/tcr_estimating

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Feature Flags (Module 1)
NEXT_PUBLIC_ENABLE_WALKTHROUGHS=false
NEXT_PUBLIC_ENABLE_AI_EXTRACTION=false
```

---

## 🔧 Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
npm start
```

### Code Style
- TypeScript strict mode enabled
- ESLint configuration (TBD)
- Prettier formatting (TBD)

---

## 📚 Architecture & Design

See `ARCHITECTURE.md` for:
- Complete system architecture
- Database relationship diagrams
- Service layer abstraction
- AI provider abstraction pattern
- Future module planning

---

## 🗺️ Roadmap

### Module 1 (Current) - Foundation
- Authentication, org setup, basic CRUD
- Trade and cost library
- Project workspace skeleton

### Module 2 - Estimate Builder
- Estimate creation and editing
- Line item management
- Pricing calculations
- Estimate versioning

### Module 3 - Walkthrough to Scope
- Walkthrough upload
- Transcript input
- AI scope extraction (abstracted)
- Human review interface

### Module 4 - Media Processing
- Audio/video upload
- Transcription abstraction layer
- Integration with AI providers

### Module 5 - Proposal Generation
- Proposal builder
- PDF generation
- Payment schedule management
- Email delivery

### Module 6 - Intelligence
- Historical tracking
- Actual vs estimated variance
- Learning from feedback
- Reporting and analytics

---

## 🤝 Contributing

For development:
1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit PR with description

---

## 📞 Support

For questions or issues:
- Check the ARCHITECTURE.md for design decisions
- Review database_schema.sql for data model
- Check environment variable setup

---

## 📄 License

TBD

---

## 👤 Created By

Claude Haiku 4.5  
September 18, 2026

---

**Module 1 Status**: Ready for Implementation
