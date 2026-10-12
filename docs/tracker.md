# Attendie: Tracker

> Single place to see what was done, when and by whom. Update this file with every change.
> Current version: **v0.0 (Planning)** | Current phase: **Planning complete, Phase 1 not started** | Last updated: 2026-10-12

**Who column:** `Owner` = project owner, `Claude` = AI assistant, `Portal owner` = EkLink maintainer.

## 1. Status at a glance

| Phase | Version | Status | Started | Finished |
|---|---|---|---|---|
| Planning | v0.0 | Done | 2026-10-12 | 2026-10-12 |
| 1. Foundation and cleanup | v0.1 | Not started | | |
| 2. SSO login | v0.2 | Not started | | |
| 3. Database, directory, roles | v0.3 | Not started | | |
| 4. Port existing features | v0.4 | Not started | | |
| 5. Notification core | v0.5 | Not started | | |
| 6. Organisations and bulk | v0.6 | Not started | | |
| 7. Email, reminders, reports | v0.7 | Not started | | |
| 8. Directory Picker API | v0.8 | Not started | | |
| 9. Hardening and pilot | v0.9 | Not started | | |
| 10. Launch | v1.0 | Not started | | |

## 2. Work log

Newest at the bottom. Add a row for every piece of work.

| ID | Date | Who | Phase | What was done | Result |
|---|---|---|---|---|---|
| L001 | 2026-10-12 | Claude | Planning | Read and analysed `TrackMyAttendance-main.zip` (React 19, Vite, TypeScript, Tailwind, Firebase) | Feature inventory created (31 items) |
| L002 | 2026-10-12 | Claude | Planning | Found security problems in the zip: open Firestore rules, plaintext and hardcoded passwords, role switcher without auth, localStorage session, committed Firebase config of another person's project | Listed for removal in Phase 1 |
| L003 | 2026-10-12 | Owner + Claude | Planning | Defined the concept: Moodle stays, Attendie is a communication and proof layer. Defined 5 use cases | Recorded in `prd.md` |
| L004 | 2026-10-12 | Owner | Planning | Described TemplateOS and the attendance import feature (MoM and event reports) | Picker API designed, connection deferred |
| L005 | 2026-10-12 | Owner | Planning | Decided approval workflow is out of scope | Recorded as D10 |
| L006 | 2026-10-12 | Portal owner (via Owner) | Planning | Shared EkLink integration details and `integration-guide.md` | SSO design finalised |
| L007 | 2026-10-12 | Owner | Planning | Decided organisations get separate accounts from students | Recorded as D13 |
| L008 | 2026-10-12 | Claude | Planning | Wrote `goal.md`, `prd.md`, `rules and regulations.md`, `plan.md`, `architecture.md`, `tracker.md` | Planning documents complete |

## 3. Decisions log

| ID | Date | Decided by | Decision |
|---|---|---|---|
| D1 | 2026-10-12 | Owner | Moodle stays the official record. Attendie is a communication and proof layer |
| D2 | 2026-10-12 | Owner | Stack: Next.js (App Router), TypeScript, Tailwind, Vercel |
| D3 | 2026-10-12 | Owner | Sign-in only through EkLink SSO. Remove old login, role switcher, localStorage session |
| D4 | 2026-10-12 | Owner | Attendie gets its own Supabase project, created later |
| D5 | 2026-10-12 | Owner + Claude | Browser never calls Supabase directly. RLS on for every table |
| D6 | 2026-10-12 | Owner + Portal owner | Map users by `sub`, fallback `login_id`, then `email`. Directory imported in advance |
| D7 | 2026-10-12 | Owner | EkLink role = broad access. Attendie roles stored locally, per app |
| D8 | 2026-10-12 | Owner | Attendie admin assigned separately |
| D9 | 2026-10-12 | Owner | Faculty `login_id` equals employee ID |
| D10 | 2026-10-12 | Owner | Approval workflow out of scope (TemplateOS) |
| D11 | 2026-10-12 | Owner | Hierarchy: Director, Deputy Director, HOD, Senior Professor, Associate, Assistant, Non-teaching. Students: semester, section, PRN |
| D12 | 2026-10-12 | Owner | Picker lists present people only. Report author edits freely |
| D13 | 2026-10-12 | Owner | Club work from organisation accounts, not student accounts |
| D14 | 2026-10-12 | Owner | Picker connect-ready. TemplateOS connected later with its own document |
| D15 | 2026-10-12 | Portal owner | Local dev on port 3000 against live EkLink |

## 4. Open items

### Questions (waiting for an answer)

| ID | Question | Who answers | Raised |
|---|---|---|---|
| O1 | Chair and vice chair: separate logins or one shared login? (recommended: separate) | Owner | 2026-10-12 |
| O2 | Will EkLink add an `organisation` or `club` role, and allow custom `login_id` for these accounts? | Portal owner | 2026-10-12 |
| O3 | Is a separate Event Coordinator role still needed? | Owner | 2026-10-12 |
| O4 | Faculty in-charge must confirm, or only CC? | Owner | 2026-10-12 |
| O5 | Is proof mandatory for club and event cases? | Owner | 2026-10-12 |
| O6 | Retention period for requests and proof files | Owner | 2026-10-12 |
| O7 | Per-user Supabase token for RLS, or server policy layer only? | Claude and Owner, Phase 9 | 2026-10-12 |
| O8 | Number of clubs and organisations | Owner | 2026-10-12 |

### Blockers and inputs needed

| ID | Needed | From | Needed by | Status |
|---|---|---|---|---|
| B1 | Register `attendie-local` in EkLink (command in `plan.md` section 5) | Portal owner | Phase 2 | Pending |
| B2 | `client_id` and `client_secret` placed in `.env.local` by the owner (never in chat) | Owner | Phase 2 | Pending |
| B3 | Attendie Supabase project | Owner | Phase 3 | Pending (after planning) |
| B4 | Faculty, staff and student Excel data | Owner | Phase 3 | Pending |
| B5 | Tell the previous owner to lock or rotate the exposed Firebase project | Owner | Soon | Pending |
| B6 | TemplateOS integration document | TemplateOS owner | After v1.0 | Later |

## 5. Risks watch list

| ID | Risk | Status |
|---|---|---|
| R1 | False notifications | Mitigation planned (Phase 6) |
| R2 | Shared organisation login hides who sent | Open, depends on O1 |
| R3 | Authorization only in server code | Mitigation planned (policy module, tests, O7) |
| R4 | Faculty not using the inbox | Mitigation planned (email, reminders, pilot) |
| R5 | `login_id` mismatch in directory | Mitigation planned (import validation) |
| R6 | Exposed Firebase key of the original project | Open, see B5 |

## 6. Incidents and security notes

| Date | Who | Note |
|---|---|---|
| 2026-10-12 | Claude | The original zip contains a committed Firebase config and API key, and an open Firestore rule set. The config is removed from this project in Phase 1. The previous owner should lock the database |

## 7. How to add an entry

**Work log row:**

```
| L0NN | YYYY-MM-DD | Owner / Claude / Portal owner | Phase | What was done | Result |
```

Rules:

1. One row per piece of work, never delete rows. Correct with a new row.
2. Use the next free ID (L009, L010, ...).
3. When a decision is made, add it to section 3 and update `plan.md`.
4. When an open question is answered, move it to section 3 and remove it from section 4.
5. When a phase starts or finishes, update section 1 and the header.
6. Any secret exposure goes in section 6 immediately.

## 8. Next steps

1. Owner reviews the six documents and answers the open questions.
2. Claude starts **Phase 1: Foundation and cleanup** (needs no external input).
3. In parallel, Owner asks the portal owner for B1 and O2.
4. Owner prepares the Excel data (B4) and the Supabase project (B3) before Phase 3.
