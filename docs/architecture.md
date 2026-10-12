# Attendie: Architecture

> Version 1.0 | Last updated: 2026-10-12

## 1. Overview

Attendie is a Next.js application with its own Supabase project. It sits next to other apps behind the **EkLink** portal. EkLink handles identity. Attendie handles attendance notifications.

```
        Browser
           |
    +------v------+   login (Supabase Auth, owned by EkLink)
    |   EkLink    |
    |  (Vercel)   |   /authorize  /token  /token/refresh  /.well-known/jwks.json
    +------+------+
           | card click, redirect with ?code & state
    +------v----------------------+
    |        Attendie             |
    |      (Next.js, Vercel)      |
    |  Server: auth, policy, API  |
    +------+----------------------+
           | server-side only (service key)
    +------v------+
    |  Attendie   |   Postgres (RLS on), Storage (private)
    |  Supabase   |
    +-------------+

    Later:  TemplateOS  <--- Directory Picker API v1 ---  Attendie
```

Key points:

- EkLink and Attendie have **separate databases**. Attendie never reads EkLink's database.
- The browser never talks to Supabase. Only Attendie's server does.
- Moodle is not connected.

## 2. Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), React, TypeScript (strict) |
| Styling | Tailwind CSS |
| Hosting | Vercel |
| Database, Storage | Supabase (Postgres, private Storage bucket) |
| JWT verification | `jose` library with EkLink's JWKS |
| Session | Sealed, encrypted HttpOnly cookie |
| Email | Resend or Supabase SMTP (to decide in Phase 7) |
| Scheduled jobs | Vercel Cron or Supabase scheduled functions |
| Import and export | `xlsx`, `jspdf` (carried over) |

## 3. Authentication (EkLink SSO)

Follows the EkLink integration guide exactly.

**Environment variables (server only):**

```
EKLINK_URL=https://ek-link-nine.vercel.app
EKLINK_CLIENT_ID=...
EKLINK_CLIENT_SECRET=...
EKLINK_REDIRECT_URI=http://localhost:3000/auth/callback
```

**Flow**

```
1. User opens Attendie with no session.
2. Server creates random `state`, stores it in a short-lived HttpOnly cookie.
3. Redirect to {EKLINK_URL}/authorize?client_id&redirect_uri&state
4. EkLink checks login, user active, password change not forced,
   app live, redirect_uri exact, role allowed.
5. EkLink redirects to /auth/callback?code&state   (code valid 60s, single use)
6. Attendie verifies `state`.
7. Attendie server POSTs {EKLINK_URL}/token with code + client_secret.
8. Response: access_token (JWT, 900s).
9. Attendie verifies JWT: signature (JWKS), iss, aud, exp.
10. Attendie looks up the local user by `sub` (fallback login_id, then email).
11. Attendie loads the user's Attendie roles from its own database.
12. Attendie sets a sealed HttpOnly session cookie.
```

**Claims used:** `sub`, `login_id`, `email`, `name`, `role`, `department`, `batch`, `section`, `ver`. Semester is not in the token, so it comes from the imported directory.

**Session and refresh**

- Session lifetime is short and tied to the EkLink token (15 minutes).
- Server calls `/token/refresh` with the current access token before expiry. EkLink re-checks the user is active, password change not forced, role still allowed and `token_version` unchanged.
- If refresh fails, the session is cleared and the user is sent back to EkLink.
- If the token already expired while the user was idle, the user is redirected to EkLink. If their EkLink session is alive, they come straight back without typing anything.
- Logout clears Attendie's cookie. EkLink is the identity source, so deactivation blocks the next refresh.

**Logout limitation:** logging out of EkLink does not instantly end an Attendie session. Short sessions (15 minutes) limit the gap.

## 4. Authorization

Two layers: EkLink `role` gives broad entry. Attendie's own roles decide what a user can do.

### 4.1 Attendie roles

`student`, `faculty`, `faculty_in_charge`, `organisation_account`, `event_coordinator`, `attendie_admin`. Stored in `app_roles` with a scope (global, organisation, event). A person can hold several. Roles can exist before the person has ever signed in.

### 4.2 Policy module

All access decisions live in one server-side module, for example `lib/policy`. Every API route calls it. Examples:

- `canCreateNotification(user, type, targetStudents)`
- `canViewNotification(user, notification)`
- `canUpdateRecipientStatus(user, recipient)`
- `canViewFile(user, attachment)`
- `canPickPeople(user, filters)`

Rules include: students only for themselves, bulk only from organisation accounts and event coordinators, faculty only see their own recipients.

### 4.3 Database layer (defence in depth)

- RLS is **ON** for every table, with no public policies. If the anon key ever leaks, nothing is readable.
- Attendie's server uses the Supabase service key, which bypasses RLS. So **the policy module is the real gate**, and it is covered by tests.
- Open decision O7: mint a short-lived per-user Supabase token so RLS policies also enforce access in the database. Evaluated in Phase 9.

## 5. Data model

All tables have `id`, `created_at`. Security-relevant tables are append-only where noted.

**Identity and roles**

| Table | Purpose |
|---|---|
| `people` | Directory: `login_id`, `eklink_sub` (set at first sign-in), name, email, kind (student, faculty, staff), department, designation, `rank_order`, semester, section, active |
| `app_roles` | `person_id`, role, scope_type, scope_id |
| `departments`, `designations` | Lookup tables (`designations.rank_order` drives hierarchy sort) |

**Organisations and events**

| Table | Purpose |
|---|---|
| `organisations` | Club or organisation, faculty in-charge |
| `organisation_accounts` | Logins that act for an organisation (chair, vice chair) linked to `people` |
| `organisation_members` | Members |
| `events` | Event details, organisation, date and time, venue |
| `event_roles` | Coordinators per event |
| `event_participants` | Participants (student, status) |

**Academic masters**

| Table | Purpose |
|---|---|
| `subjects` | Subject and semester |
| `timetable_slots` | Later phase |

**Notifications (core)**

| Table | Purpose |
|---|---|
| `notifications` | type (missed, event, club_prep, bulk_event), sender, acting organisation, event, reason, lecture date and time range, status, version, parent id |
| `notification_students` | Which students the notification covers |
| `notification_recipients` | Faculty To and CC. Status: sent, seen, marked, cannot_mark. Reason, timestamps |
| `attachments` | Storage path, type, size, uploader |
| `notification_comments` | Thread messages |
| `notification_escalations` | Pin and escalate records, link to original |
| `notification_history` | **Append-only** log of every status change |
| `inbox_items` | In-app notification with read flag |

**Picker and audit**

| Table | Purpose |
|---|---|
| `picker_snapshots` | Frozen selections: id, requester, app, list of people (ordered), created_at |
| `picker_codes` | One-time selection codes, hashed, with expiry and used_at |
| `audit_logs` | **Append-only**, written by the server. No update or delete |

**Append-only enforcement:** database triggers block UPDATE and DELETE on `notification_history`, `audit_logs` and `picker_snapshots`.

## 6. Notification lifecycle

```
Created ---> Sent ---> Seen ---> Marked in Moodle   (closed)
                  \         \--> Can't mark + reason (closed)
                   \--> Cancelled (by sender, logged)

Escalation: a new recipient is added, linked to the same notification
            with the original context and history.
Club and event types: Faculty in-charge confirmation step
            before reaching lecture faculty (open decision O4).
```

Rules:

- Sent notifications are never edited or deleted. Sender can cancel or create a new version linked to the old one.
- Every transition writes a row to `notification_history` and `audit_logs`.
- Reminder job nudges recipients who have not acted within the configured days.

### Who can send what

| Sender | Types allowed | Target |
|---|---|---|
| Student account | Missed (1), Event (2) | Self only |
| Organisation account | Club prep (3), Bulk event (4) | Chosen students |
| Event Coordinator | Bulk event (4) | That event's participants |
| Anyone else | None | |

### Auto-calculation for bulk requests

Given a student list and a time range, the server works out which lectures and faculty are affected (using entered lecture data now, timetable data later), groups students per faculty, and creates one recipient entry per faculty with their relevant student list.

## 7. Files and proof

- Private Supabase Storage bucket. No public URLs.
- Upload goes through the server: type allow-list (PDF, JPG, PNG), size limit, server-side check.
- Stored under an unguessable path. Access only through short-lived signed URLs, issued after a policy check (`canViewFile`).
- Allowed viewers: sender, covered students, recipients, faculty in-charge, Attendie admin.

## 8. Directory Picker API (connect-ready)

Built for other apps such as TemplateOS. Not connected until their integration document arrives.

**Endpoints (versioned)**

```
GET  /picker                     Picker UI (launched from another app)
GET  /api/v1/directory/faculty   Faculty and staff list (policy-filtered)
GET  /api/v1/directory/students  Students by semester and section (policy-filtered)
GET  /api/v1/events/:id/participants
POST /api/v1/picker/snapshot     Create immutable snapshot, returns id
GET  /api/v1/picker/snapshot/:id Fetch snapshot (server to server)
```

**Flow**

```
1. Calling app saves its draft, then redirects the user to Attendie /picker
   with a signed request (who, which report, return URL).
2. SSO means no second login.
3. User picks faculty or staff, or semester then section then students.
4. Attendie creates a snapshot (ordered) and a one-time selection code.
5. User returns to the calling app with the snapshot ID and code.
6. Calling app server fetches the snapshot server to server.
```

**Rules**

- Return URLs use an allow-list.
- Selection codes are short-lived and single use.
- The picker only lists people the user may see.
- Snapshot is immutable. Later changes to a student's section do not alter it.
- Data returned: name, designation or section, ID. No email, phone or attendance percentage.
- Faculty order: Director, Deputy Director, HOD, Senior Professor, Associate Faculty, Assistant Faculty, Non-teaching staff. Student order: semester, section, PRN.
- Guests can be added manually by the calling app and are labelled as guests.
- Every import is audited.
- A short `INTEGRATION.md` documents this contract.

## 9. Security architecture

| Threat | Control |
|---|---|
| Stolen or forged token | JWKS signature, `iss`, `aud`, `exp` checks. Short sessions |
| CSRF on login | `state` generation and verification |
| Code interception or replay | Single-use 60s code, server-side exchange |
| Open redirect | Exact `redirect_uri` match in EkLink, allow-lists in Attendie |
| XSS stealing session | HttpOnly Secure SameSite cookie, no tokens in JavaScript, CSP |
| Secret leak | Server-only env vars, `.gitignore`, rotation policy |
| One user reading another's data | Policy module on every route, tests, RLS deny-all |
| Direct database access from browser | Not possible, no client-side Supabase |
| False or edited requests | Append-only history, cancel or new version, audit, faculty in-charge confirm |
| Spam | Rate limits on bulk sends, uploads and callbacks |
| Malicious files | Type and size checks, private storage, signed links |
| Bulk data scraping through picker | Policy-filtered lists, minimum fields, audit |
| Deactivated user keeps access | Refresh re-check, short session |

Headers: CSP, `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options` or `frame-ancestors`, HSTS on production.

## 10. Project structure (planned)

```
attendie/
  app/
    (auth)/auth/login, auth/callback, auth/logout
    (app)/dashboard, notifications, inbox, events, organisations, reports
    (admin)/admin/people, roles, masters, audit
    picker/
    api/v1/...
  lib/
    eklink/        token exchange, JWKS verification, refresh
    session/       sealed cookie
    policy/        all access rules
    db/            Supabase server client, queries
    notifications/ business logic
    validation/    input schemas
  components/
  supabase/migrations/
  tests/           security and access tests
  docs/            goal, prd, plan, architecture, rules, tracker
```

## 11. Environments

| Environment | Where | EkLink app slug |
|---|---|---|
| Local | `http://localhost:3000` | `attendie-local` |
| Production | Vercel URL (custom domain later) | `attendie` |

Separate Supabase keys for local and production. Secrets set in `.env.local` and Vercel only.

## 12. Moving to a custom domain (later)

Change the production URL and callback in EkLink. Attendie's design does not depend on shared cookies, so no architectural change is needed.

## 13. Methodology

1. **One phase at a time,** each with an exit checklist (see `plan.md`).
2. **One feature at a time,** on its own branch, merged only after tests pass.
3. **Security tests alongside features,** not at the end.
4. **Migrations in git,** no manual database edits.
5. **Documents stay current:** `tracker.md` updated for every change, other documents when a decision changes.
6. **Connect-ready, not connected:** Picker API is designed for TemplateOS now, connected later.
