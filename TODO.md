# InternalHub - Mission Control

## Vision
Internal app hosting for the AI era. Employees deploy AI-generated tools, share with coworkers, zero security config.

**Repo:** github.com/e-salvador13/internalhub

---

## Phase 1: Landing & Waitlist 🚧
- [x] Landing page with value prop
- [x] Waitlist signup form
- [x] API route for waitlist (`/api/waitlist`)
- [x] Supabase schema for waitlist
- [ ] Create Supabase project
- [ ] Add env vars to Vercel
- [ ] Deploy to Vercel
- [ ] Test waitlist flow end-to-end

---

## Phase 2: Auth & Workspace
- [ ] Set up NextAuth
- [ ] Google OAuth provider
- [ ] Workspace creation flow (first user from domain = admin)
- [ ] Domain verification
- [ ] User model + roles (admin/member)
- [ ] Protected routes middleware
- [ ] Dashboard layout

---

## Phase 3: App Deployment
- [ ] File upload component (drag & drop)
- [ ] Upload to Supabase Storage
- [ ] App creation API
- [ ] Subdomain routing: `[app].[company].internalhub.app`
- [ ] Auth gate middleware for app subdomains
- [ ] GitHub repo connection (stretch)
- [ ] Deploy preview before publish

---

## Phase 4: App Directory
- [ ] Dashboard home (app grid)
- [ ] Search component
- [ ] Filter by tags/categories
- [ ] Star/favorite API + UI
- [ ] "My Apps" section
- [ ] "Starred" section
- [ ] Recently added feed
- [ ] Most popular feed

---

## Phase 5: Draft & Publish
- [ ] Draft status (only creator sees)
- [ ] Publish button + confirmation
- [ ] Unpublish option
- [ ] App settings page
- [ ] Edit name/description/tags
- [ ] Delete app (with confirmation)

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
| Framework | Next.js 14 (App Router) |
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
**Focus:** Get landing page live with working waitlist

### In Progress
- [ ] Create Supabase project at supabase.com
- [ ] Run schema.sql in SQL editor
- [ ] Deploy to Vercel (connect GitHub)
- [ ] Add Supabase env vars in Vercel
- [ ] Test full waitlist flow

### Blocked
- Vercel deploy needs Eduardo to connect via dashboard

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
├── src/app/
│   ├── page.tsx         # Landing page
│   ├── api/waitlist/    # Waitlist API
│   └── (dashboard)/     # Protected routes (TODO)
├── .env.example         # Env template
└── package.json

supabase/
└── schema.sql           # Database schema
```

---

*Last updated: 2026-02-13*
