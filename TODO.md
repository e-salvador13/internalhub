# InternalHub - Mission Control

## Vision
Internal app hosting for the AI era. Employees deploy AI-generated tools, share with coworkers, zero security config.

**Repo:** github.com/e-salvador13/internalhub

---

## Phase 1: Landing & Waitlist ✅
- [x] Landing page with value prop
- [x] Waitlist signup form
- [x] API route for waitlist (`/api/waitlist`)
- [x] Supabase schema for waitlist
- [ ] Create Supabase project
- [ ] Add env vars to Vercel
- [ ] Deploy to Vercel
- [ ] Test waitlist flow end-to-end

---

## Phase 2: Auth & Workspace 🚧
- [x] Set up NextAuth
- [x] Google OAuth provider
- [ ] Workspace creation flow (first user from domain = admin)
- [ ] Domain verification
- [x] User model + roles (admin/member)
- [ ] Protected routes middleware
- [x] Dashboard layout

---

## Phase 3: App Deployment ✅
- [x] File upload component (drag & drop)
- [x] Upload to Supabase Storage
- [x] App creation API
- [ ] Subdomain routing: `[app].[company].internalhub.app`
- [ ] Auth gate middleware for app subdomains
- [ ] GitHub repo connection (stretch)
- [ ] Deploy preview before publish

---

## Phase 4: App Directory ✅
- [x] Dashboard home (app grid)
- [x] Search component
- [x] Filter tabs (All / My Apps / Starred)
- [x] Star/favorite API + UI
- [x] "My Apps" section
- [x] "Starred" section
- [x] Sort by: recent, popular, name
- [ ] Filter by tags/categories
- [ ] Most popular feed (needs view tracking)

---

## Phase 5: Draft & Publish ✅
- [x] Draft status (stored in DB)
- [x] Publish button
- [ ] Unpublish option
- [ ] App settings page
- [ ] Edit name/description/tags
- [x] Delete app (with confirmation)

---

## Phase 6: Polish & Analytics
- [ ] App view tracking
- [ ] Analytics dashboard per app
- [ ] Notifications (new apps in org)
- [ ] Search improvements (fuzzy)
- [ ] Categories taxonomy
- [ ] Custom domains (stretch)
- [ ] Teams within orgs (stretch)

---

## Tech Stack
| Layer | Tech |
|-------|------|
| Framework | Next.js 16 (App Router) |
| Auth | NextAuth + Google |
| Database | Supabase Postgres |
| Storage | Supabase Storage |
| Hosting | Vercel |
| Styling | Tailwind CSS |

---

## Database Schema
See `supabase/schema.sql` for full schema.

Tables:
- `waitlist` - Early access signups
- `workspaces` - Company workspaces
- `users` - Workspace members
- `apps` - Deployed applications
- `stars` - User favorites
- `app_views` - Analytics

---

## Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

---

## Current Sprint
**Focus:** Get Supabase connected and test full flow

### In Progress
- [ ] Create Supabase project at supabase.com
- [ ] Run schema.sql in SQL editor
- [ ] Create storage bucket "apps" with public access
- [ ] Add Supabase env vars in Vercel
- [ ] Test full upload → app creation flow

### Blocked
- OAuth callback error (Eduardo debugging)

---

## Recent Changes (2025-02-15)
- Added `/api/apps` route (list, create, filter, search)
- Added `/api/apps/[id]` route (get, update, delete)
- Added `/api/apps/[id]/star` route (toggle star)
- Updated upload API to save app metadata to database
- Created reusable components: AppCard, SearchBar, FilterTabs, EmptyState, LoadingSpinner
- Improved dashboard with app grid, search, tabs, sorting
- Added star/favorite functionality
- Added delete with confirmation
- Build passes ✅

---

## Ideas Backlog
- [ ] CLI tool for deploying (`ih deploy`)
- [ ] VS Code extension
- [ ] Slack integration (notify on new apps)
- [ ] App templates gallery
- [ ] One-click clone of public apps
- [ ] Embed apps in Notion/docs
- [ ] Mobile app for browsing
- [ ] AI-powered app discovery

---

## Key Files
```
web/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Landing page
│   │   ├── dashboard/page.tsx    # Main dashboard
│   │   ├── login/page.tsx        # Login page
│   │   ├── api/
│   │   │   ├── apps/route.ts     # Apps CRUD
│   │   │   ├── apps/[id]/route.ts
│   │   │   ├── apps/[id]/star/route.ts
│   │   │   ├── upload/route.ts   # File upload
│   │   │   ├── waitlist/route.ts
│   │   │   └── auth/[...nextauth]/route.ts
│   ├── components/               # Reusable UI
│   │   ├── AppCard.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterTabs.tsx
│   │   ├── EmptyState.tsx
│   │   └── LoadingSpinner.tsx
│   └── lib/
│       ├── supabase.ts           # Supabase client
│       └── types.ts              # TypeScript types
├── .env.example
└── package.json

supabase/
└── schema.sql
```

---

*Last updated: 2025-02-15*
