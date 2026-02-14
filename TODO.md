# InternalHub - Mission Control

## Vision
Internal app hosting for the AI era. Employees deploy AI-generated tools, share with coworkers, zero security config.

---

## Phase 1: Landing & Waitlist ✅
- [x] Landing page with value prop
- [x] Waitlist signup form
- [ ] Connect waitlist to Supabase or email service
- [ ] Deploy to Vercel

---

## Phase 2: Auth & Workspace
- [ ] Set up Supabase (database + storage)
- [ ] Google OAuth with NextAuth
- [ ] Workspace domain verification
- [ ] User model (email, workspace, role)
- [ ] Admin vs Member roles

---

## Phase 3: App Deployment
- [ ] File upload UI (drag & drop)
- [ ] Upload to Supabase Storage
- [ ] Static file serving with auth gate
- [ ] Subdomain routing: `[app].[company].internalhub.app`
- [ ] GitHub repo connection (optional)

---

## Phase 4: App Directory
- [ ] List all published apps
- [ ] Search by name, creator, tags
- [ ] Star/favorite functionality
- [ ] Creator profiles
- [ ] Categories/tags

---

## Phase 5: Draft & Publish
- [ ] Draft mode (only creator can see)
- [ ] Publish flow
- [ ] Unpublish option
- [ ] Version history (stretch)

---

## Phase 6: Polish
- [ ] App analytics (views, unique visitors)
- [ ] Notifications (new apps in your org)
- [ ] Custom domains (stretch)
- [ ] Teams within orgs (stretch)

---

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Auth:** NextAuth + Google Workspace
- **Database:** Supabase Postgres
- **Storage:** Supabase Storage
- **Hosting:** Vercel
- **App Serving:** Vercel Edge Functions with auth middleware

---

## Current Sprint
**Focus:** Deploy landing page, set up waitlist

### Tasks
- [ ] Deploy to Vercel
- [ ] Set up Supabase project
- [ ] Connect waitlist form to database
- [ ] Add email notification on signup

---

*Last updated: 2026-02-13*
