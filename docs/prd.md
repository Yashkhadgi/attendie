# Attendie: Product Requirements Document (PRD)

> Version 1.0 | Last updated: 2026-10-12 | Status: Draft, awaiting owner review

## 1. Problem statement

Attendance is taken in Moodle. Faculty mark it, and the college will not change that. When attendance is missed, there is no proper channel to fix it:

- A student who was present but not marked has no formal way to tell the faculty.
- A student at an event, or with another faculty member, cannot easily prove where they were.
- A club that needs 10 students for event prep from 9 to 2 has to message each faculty member separately.
- An event with 100 participants needs the same message sent to many faculty.
- When a faculty member misses a request, the student has no context-preserving way to follow up.
- There is no history, so disputes cannot be settled.

**Result:** lost attendance, wasted time, and arguments with no record.

## 2. Product summary

Attendie is a web app inside the EkLink portal. Users reach it with one click and no second login. It lets the right person send an **Attendance Notification** to the right faculty, with proof, and tracks it until a faculty member closes it.

Moodle is untouched. Faculty still mark attendance in Moodle, then confirm in Attendie.

## 3. Users and roles

### EkLink roles (broad access, from the portal)
`student`, `faculty`, `staff`, `hod`, `director`, `finance`, `admin`.

### Attendie roles (app-local, stored in Attendie's database, assigned by an Attendie admin)

| Role | Who | What they can do |
|---|---|---|
| Student | Any student | Send Case 1 and Case 2 notifications for **themselves only**. Track and escalate their own. |
| Faculty | Any faculty | See notifications addressed to them. Update status. Comment. |
| Faculty In-charge | Faculty linked to a club or event | Receives CC, can verify club and event requests. |
| Organisation account | A club's own account (chair, vice chair) | Send Case 3 and Case 4 notifications for chosen students. Cannot be used as a student account. |
| Event Coordinator | Assigned per event | Send bulk notification for that event's participants. |
| Attendie Admin | Assigned by owner (for example Academic Cell) | Manage masters, roles and reports. View audit. Cannot edit sent notifications. |

A person can hold several Attendie roles (for example faculty, plus in-charge of Coding Club, plus coordinator of one event).

> **Open decision:** whether chair and vice chair each get their own organisation login (recommended) or share one. See `plan.md` section 7.

## 4. Use cases

| Case | Who sends | For whom | To | CC | Proof |
|---|---|---|---|---|---|
| 1. Missed attendance | Student | Self | One faculty | None | Optional |
| 2. Event or with a faculty member | Student | Self | Related faculty | Coordinator or faculty | Event proof |
| 3. Club prep | Organisation account | About 10 chosen students, a time range (for example 9 to 2) | Faculty of those lectures (auto-calculated) | Faculty in-charge | Signed sheet |
| 4. Bulk event | Organisation account or Event Coordinator | Up to about 100 participants | All affected faculty (auto-split) | Faculty in-charge | Signed sheet or list |
| 5. Escalation | Student (or original sender) | Same request | A faculty member who has not acted | Original recipients | Carries original context |

## 5. Functional requirements

### 5.1 Authentication
- FR-A1: Sign-in only through EkLink SSO. No local passwords exist in Attendie.
- FR-A2: Attendie never accepts a request without a verified session.
- FR-A3: Session is short-lived and refreshed against EkLink. A deactivated user loses access at the next refresh.
- FR-A4: Logout clears Attendie's session.

### 5.2 Directory and roles
- FR-D1: Admin imports faculty, staff and students from Excel (name, login ID or PRN, designation, department, semester, section).
- FR-D2: On first sign-in, the EkLink `sub` is linked to the directory record using `login_id`, then `email` as fallback.
- FR-D3: Admin assigns Attendie roles and scopes. Roles can be assigned before the person first signs in.
- FR-D4: Faculty hierarchy: Director, Deputy Director, HOD, Senior Professor, Associate Faculty, Assistant Faculty, Non-teaching staff. Stored as a sortable rank.
- FR-D5: Student ordering: semester, then section, then PRN (roll number).

### 5.3 Notifications
- FR-N1: Create a notification of types 1 to 4 with the fields in section 4.
- FR-N2: Students can only create notifications for themselves. Bulk and club notifications only come from organisation accounts and event coordinators. Enforced on the server.
- FR-N3: Recipients are tracked individually with statuses: Sent, Seen, Marked in Moodle, Can't mark (with reason).
- FR-N4: Sent notifications cannot be edited or deleted. Sender can cancel (logged) or send a new version.
- FR-N5: Every status change is written to an append-only history.
- FR-N6: Comment thread on each notification between sender and recipients.
- FR-N7: Pin and escalate to another faculty member, linked to the original.
- FR-N8: Reminder if a recipient has not acted within a configured number of days.
- FR-N9: Faculty In-charge confirmation on club and event requests before they reach lecture faculty (exact rule is an open decision).

### 5.4 Proof
- FR-P1: Upload PDF, JPG or PNG, size limited, validated on the server.
- FR-P2: Files stored privately. Only the sender, covered students, recipients and admin can open them, through short-lived signed links.

### 5.5 Notifications to users
- FR-U1: In-app inbox with unread count.
- FR-U2: Email notification for new request, status change and reminder.

### 5.6 Reports and admin
- FR-R1: Reports on pending, closed, by faculty, by club, by event, by date range.
- FR-R2: Export to Excel and PDF (carried over from the existing app).
- FR-R3: Audit log viewer (read-only).

### 5.7 Directory Picker API (for other apps)
- FR-K1: Versioned API (`/api/v1/directory/...`) lets a connected app launch a picker, select faculty, staff or students, and receive a frozen snapshot.
- FR-K2: The picker only shows people the requesting user is allowed to see.
- FR-K3: Snapshot is immutable and ordered by hierarchy (faculty) or semester, section, PRN (students).
- FR-K4: Returns minimum data only: name, designation or section, ID.
- FR-K5: Not connected to TemplateOS until its integration document arrives.

## 6. Features from the existing app

| Existing feature | Decision |
|---|---|
| 3 role login with password | **Remove** (replaced by EkLink SSO) |
| Role switcher in navbar | **Remove** |
| localStorage session | **Remove** |
| Hardcoded and default passwords | **Remove** |
| Universal Student account | **Remove** (security risk) |
| `clear_database` script | **Remove** |
| Firebase and Firestore | **Replace** with Supabase |
| Unused packages (Gemini, express, dotenv) | **Remove** |
| Students, faculty and subjects master with Excel import and templates | **Keep**, rework onto new schema |
| Event creation, PRN search, draft and submit attendance | **Keep**, rework for organisation accounts and coordinators |
| Event attendance PDF | **Keep** |
| Student correction request (multi-date, multi-item) | **Rework** into the new notification model |
| Admin approve, reject, partial approve | **Replace** by faculty status flow |
| Admin reports with filters, export | **Keep**, adapt to new data |
| Audit log | **Keep**, make append-only and server-generated |
| AdminPortal in one 182 KB file | **Split** into small components |

## 7. Non-functional requirements

- **Security:** see `rules and regulations.md` and `architecture.md`.
- **Mobile first:** most students will use phones.
- **Performance:** a 100-student bulk request completes in a few seconds.
- **Availability:** hosted on Vercel and Supabase. Short downtime during pilot is acceptable.
- **Auditability:** all actions traceable to a person and a time.
- **Privacy:** minimum data collected and shared. Retention period to be decided.

## 8. Out of scope

Approval workflow, document templates, Moodle sync, attendance percentage, push and WhatsApp (later), timetable-based lecture picker (later).

## 9. Dependencies

| Dependency | Owner | Status |
|---|---|---|
| EkLink portal live | Portal owner | Live |
| `attendie-local` test app registered | Portal owner | Pending |
| Role for organisation accounts in EkLink | Portal owner | Pending (needs decision) |
| Faculty and student data (Excel) | Owner | Pending |
| Attendie Supabase project | Owner | Later, after planning |
| TemplateOS integration document | TemplateOS owner | Later |

## 10. Open questions

1. Organisation accounts: separate chair and vice chair logins (recommended), or one shared login?
2. How many clubs and organisations are there?
3. Is a separate Event Coordinator role still needed, or does an organisation account cover it?
4. Should club and event requests require faculty in-charge confirmation, or only a CC?
5. Is proof mandatory for club and event cases?
6. How long do requests and proof files stay stored?
7. Does the college have a policy on which student fields can be shown to whom?
