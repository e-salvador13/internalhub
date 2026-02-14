# InternalHub

Internal app hosting for the AI era. Deploy AI-generated tools, share with coworkers, zero security config.

## Concept

1. Admin connects Google Workspace
2. Employees sign in with work Google
3. Drag/drop deploy any static site
4. Draft → Publish workflow
5. Browse/search/star internal apps

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Auth:** NextAuth + Google Workspace
- **Database:** Supabase (Postgres)
- **Storage:** Supabase Storage (for app files)
- **Hosting:** Vercel (for the platform itself)
- **App Serving:** Cloudflare Workers or Vercel Edge (for deployed apps)

## MVP Scope

- [ ] Landing page
- [ ] Google Workspace OAuth
- [ ] File upload (drag/drop)
- [ ] Deploy to subdomain
- [ ] App directory with search
- [ ] Star/favorite
- [ ] Draft vs Published

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    InternalHub Platform                      │
├─────────────────────────────────────────────────────────────┤
│  internalhub.app (main platform)                            │
│  ├── /dashboard - browse apps, search, favorites            │
│  ├── /deploy - upload new app                               │
│  ├── /app/[id] - app settings, analytics                    │
│  └── /admin - workspace settings                            │
├─────────────────────────────────────────────────────────────┤
│  [app-slug].[company].internalhub.app (deployed apps)       │
│  └── Auth gate: only @company.com can access                │
└─────────────────────────────────────────────────────────────┘
```

## URL Structure

- Platform: `internalhub.app`
- Company apps: `expense-tracker.acme.internalhub.app`
- Auth: Google Workspace enforced at edge

