# Attendie: Plan

> Version 1.0 | Last updated: 2026-10-12

## 1. Summary

Rebuild the existing TrackMyAttendance app (React + Vite + Firebase) as **Attendie**: a Next.js app inside the EkLink portal, using its own Supabase database, with a new notification-based model. Work is done one phase at a time. Each phase has an exit checklist.

## 2. Decisions made

| # | Decision | Date |
|---|---|---|
| D1 | Moodle stays the official record. Attendie is a communication and proof layer. | 2026-10-12 |
| D2 | Stack: Next.js (App Router), TypeScript, Tailwind, deployed on Vercel. | 2026-10-12 |
| D3 | Sign-in only through EkLink SSO (authorization code flow). Old login, role switcher and localStorage session are removed. | 2026-10-12 |
| D4 | Attendie gets its **own Supabase project** (created later, after planning). | 2026-10-12 |
| D5 | Browser never calls Supabase directly. All database access is server-side. RLS is on for every table. | 2026-10-12 |
| D6 | Users map by EkLink `sub`, fallback `login_id`, then `email`. Directory is imported in advance. | 2026-10-12 |
| D7 | EkLink `role` gives broad access only. Attendie roles are stored locally and can be assigned before first sign-in. | 2026-10-12 |
| D8 | Attendie admin is assigned separately, not taken from the EkLink `admin` role. | 2026-10-12 |
| D9 | Faculty `login_id` in EkLink equals the employee ID in the Attendie directory. | 2026-10-12 |
| D10 | Approval workflow is out of scope (belongs to TemplateOS). | 2026-10-12 |
| D11 | Hierarchy: Director, Deputy Director, HOD, Senior Professor, Associate Faculty, Assistant Faculty, Non-teaching staff. Students: semester, section, PRN (roll number). | 2026-10-12 |
| D12 | Picker only lists present people, no headings or absent lists. Report author edits freely. | 2026-10-12 |
| D13 | Club work is sent from a separate **organisation account**, not a student account. | 2026-10-12 |
| D14 | Picker API is built connect-ready, but TemplateOS is connected only when its integration document arrives. | 2026-10-12 |
| D15 | Local development runs on port 3000 and uses the live EkLink at `https://ek-link-nine.vercel.app`. | 2026-10-12 |

## 3. Open decisions

| # | Question | Recommendation |
|---|---|---|
| O1 | Organisation accounts: separate chair and vice chair logins, or one shared login? | Separate logins linked to one organisation (better audit, safer) |
| O2 | Does EkLink add an `organisation` or `club` role, or do these accounts use an existing role? | New role; ask portal owner |
| O3 | Is a separate Event Coordinator role still needed? | Keep, but scoped to a single event |
| O4 | Faculty in-charge must confirm club and event requests, or only CC? | Confirm required |
| O5 | Is proof mandatory for club and event cases? | Mandatory |
| O6 | Retention period for requests and proof | One academic year, then archive |
| O7 | Authorization model: server-side policy layer only, or also mint a per-user Supabase token so RLS enforces access? | Start with server policy layer. Evaluate per-user token in Phase 9 |
| O8 | Number of clubs and organisations | Needed for directory import |

## 4. Versions and phases

| Version | Phase | Goal |
|---|---|---|
| v0.0 | Planning | Documents and decisions (this stage) |
| v0.1 | 1. Foundation and cleanup | Clean Next.js project with old code removed |
| v0.2 | 2. SSO login | Click card in EkLink, land in Attendie, see own name and role |
| v0.3 | 3. Database, directory, roles | Supabase schema, directory import, role assignment |
| v0.4 | 4. Port existing features | Masters, events and reports on the new stack |
| v0.5 | 5. Notification core | Cases 1 and 2, faculty inbox, proof upload |
| v0.6 | 6. Organisations and bulk | Organisation accounts, Cases 3, 4 and 5 |
| v0.7 | 7. Email, reminders, reports | Email, reminders, new reports, admin cleanup |
| v0.8 | 8. Directory Picker API | `/api/v1/directory` and `INTEGRATION.md` |
| v0.9 | 9. Hardening and pilot | Security review and a small pilot group |
| v1.0 | 10. Launch | Full rollout |
| v1.1+ | Later | TemplateOS connection, custom domain, push and WhatsApp, timetable picker, other apps |

### Phase 1: Foundation and cleanup (v0.1)

**Needs:** nothing external.

- Create the Next.js project (TypeScript, Tailwind, strict mode).
- Move reusable components and utilities from the zip.
- Remove: Firebase config and rules, `clear_database` script, hardcoded passwords and demo credentials, role switcher, localStorage session, Universal Student account, unused packages.
- Split `AdminPortal.tsx` into small components.
- Set up folder structure, linting, `.env.example`, `.gitignore`.

**Exit checklist**
- [ ] App builds and runs on `localhost:3000`.
- [ ] No Firebase or hardcoded password text remains in the repo.
- [ ] No file over about 400 lines without a reason.
- [ ] `.env.example` lists every variable and no real values.

### Phase 2: SSO login (v0.2)

**Needs:** `attendie-local` registered in EkLink, with `client_id` and `client_secret` placed in `.env.local` by the owner.

- `/auth/login`: create `state`, store it, redirect to `/authorize`.
- `/auth/callback`: verify `state`, exchange the code at `/token`, verify the JWT (JWKS, `iss`, `aud`, `exp`).
- Create a sealed, HttpOnly session cookie.
- Refresh through `/token/refresh` before expiry. On failure, send the user back to EkLink.
- Logout clears the session.
- Route guard: unauthenticated users go to EkLink.
- Show the signed-in user's name and role.

**Exit checklist** (from the EkLink guide)
- [ ] Expired token rejected.
- [ ] Reused code rejected.
- [ ] Wrong role gets a no-access page.
- [ ] Tampered `redirect_uri` rejected.
- [ ] Inactive user cannot sign in or refresh.
- [ ] Bad or missing `state` rejected.
- [ ] No token in `localStorage` or readable by JavaScript.

### Phase 3: Database, directory, roles (v0.3)

**Needs:** Attendie Supabase project and the owner's Excel data.

- Create the schema as migration files (see `architecture.md`).
- Turn on RLS for every table.
- Excel import for faculty, staff and students with validation.
- Link EkLink `sub` to directory records at first sign-in.
- Attendie admin screen to assign roles and scopes.
- Policy module (central access rules) with tests.

**Exit checklist**
- [ ] Every table has RLS on.
- [ ] Import rejects bad rows and shows clear errors.
- [ ] A person with a pre-assigned role gets it on first sign-in.
- [ ] Access tests pass.

### Phase 4: Port existing features (v0.4)

- Masters: students, faculty, subjects, clubs.
- Events and participants.
- Event attendance PDF.
- Reports and Excel/PDF export on the new data.

**Exit checklist**
- [ ] Each ported feature works on a phone-sized screen.
- [ ] Each feature goes through the policy module.

### Phase 5: Notification core (v0.5)

- Student creates Case 1 and Case 2 notifications for themselves.
- Faculty inbox: Seen, Marked in Moodle, Can't mark with reason.
- Comment thread.
- Proof upload to private storage with signed links.
- Append-only history, cancel and send-new-version.
- In-app unread badge.

**Exit checklist**
- [ ] Student A cannot see Student B's notification or file.
- [ ] Sent notification cannot be edited or deleted.
- [ ] Bad file type and oversize file rejected.
- [ ] A faculty member sees only their own notifications.

### Phase 6: Organisations and bulk (v0.6)

**Needs:** decisions O1, O2, O4, O5 and the EkLink organisation accounts.

- Organisation account type and link to clubs and faculty in-charge.
- Case 3 (club prep) and Case 4 (bulk event): select students, time range, auto-calculate affected faculty, auto-split.
- Faculty in-charge CC and confirmation.
- Case 5: pin and escalate with original context.
- Rate limits on bulk sends.

**Exit checklist**
- [ ] Student account cannot create a bulk or club notification (server rejects).
- [ ] Organisation account cannot be used for personal student requests.
- [ ] Audit shows who sent each notification.
- [ ] 100-student request completes in a few seconds.

### Phase 7: Email, reminders, reports (v0.7)

- Email for new request, status change and reminder.
- Reminder job for unactioned requests.
- Reports: pending, by faculty, by club, by event.
- Attendie admin screen reduced to masters, roles, reports, audit.

**Exit checklist**
- [ ] Emails send and contain no sensitive extra data.
- [ ] Reminders fire once per rule.
- [ ] Audit log is read-only in the UI.

### Phase 8: Directory Picker API (v0.8)

- `/api/v1/directory/...` and the picker pages.
- Faculty, staff and students tabs. Students go semester, then section, then selection.
- Ordering: hierarchy for faculty, semester, section and PRN for students.
- Immutable snapshot with an ID, short-lived selection code, redirect allow-list.
- Access rules so users only see people they may see.
- Audit of every import.
- `INTEGRATION.md` describing the contract.

**Exit checklist**
- [ ] User cannot list people outside their allowed scope.
- [ ] Snapshot does not change after creation.
- [ ] Reused or expired selection code rejected.
- [ ] `INTEGRATION.md` written.

### Phase 9: Hardening and pilot (v0.9)

- Security review against `rules and regulations.md`.
- Security headers, CSP, CSRF review, dependency audit.
- Decide open question O7 (per-user RLS tokens).
- Mobile and performance checks.
- Pilot with one class and a few faculty and one club.

**Exit checklist**
- [ ] All tests in the rules document pass.
- [ ] No high-severity findings open.
- [ ] Pilot feedback recorded in `tracker.md`.

### Phase 10: Launch (v1.0)

- Register live `attendie` slug in EkLink with the production URL.
- Production Supabase and Vercel environment.
- Rollout and short training notes for faculty and clubs.

### Later (v1.1+)

- Connect to TemplateOS using its integration document.
- Custom domain.
- Push and WhatsApp notifications.
- Timetable-based lecture picker.
- Retention and archival jobs.

## 5. What we need from other people

| From | What | Needed by |
|---|---|---|
| Portal owner | Register `attendie-local` and give `client_id` and `client_secret` (to the owner, not in chat) | Phase 2 |
| Portal owner | Role and accounts for organisations | Phase 6 |
| Owner | Faculty, staff and student Excel data | Phase 3 |
| Owner | Attendie Supabase project | Phase 3 |
| Owner | Answers to O1, O3 to O6, O8 | Phase 3 to 6 |
| TemplateOS owner | Integration document | After v1.0 |

Command for the portal owner:

```bash
node --env-file=.env.local scripts/register-app.mjs \
  --slug attendie-local \
  --name "Attendie Local" \
  --url http://localhost:3000 \
  --callback http://localhost:3000/auth/callback \
  --roles student,faculty,staff,hod,director,finance,admin \
  --icon user-check \
  --description "Local Attendie development app" \
  --status live \
  --rotate-secret
```

## 6. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| False notifications ("was at event" but wasn't) | Loss of trust | Faculty in-charge confirmation, proof, audit, rate limits |
| Shared organisation login | Cannot tell who sent | Separate logins (O1) |
| Authorization only in server code | One missed check leaks data | Central policy module, tests, consider per-user RLS tokens (O7) |
| Faculty do not use the inbox | Loop never closes | Email, reminders, simple UI, pilot feedback |
| `login_id` mismatch between EkLink and directory | Roles do not attach | Validate on import, report mismatches |
| EkLink token expired while idle | User sent back to sign in | Seamless re-redirect when portal session exists |
| Exposed Firebase key from original zip | Others' database is open | Removed here, previous owner told to lock it |
| Scope creep into approval workflow | Delays | Scope rules, `plan.md` check before new work |
