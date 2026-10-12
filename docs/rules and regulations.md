# Attendie: Rules and Regulations

> Version 1.0 | Last updated: 2026-10-12

These rules apply to everyone and everything on this project, including the owner, collaborators and Claude. If a rule has to be broken, record why in `tracker.md` first.

## 1. Security rules (non-negotiable)

1. **Authorization is enforced on the server.** Hiding a button is never security. Every API route checks who the user is and what they may do.
2. **No local passwords.** Sign-in happens only through EkLink SSO.
3. **No role comes from the browser.** Roles and scopes are read from Attendie's database, keyed on the verified EkLink `sub`.
4. **Verify every EkLink token** before using any claim: signature (JWKS), `iss`, `aud`, `exp`.
5. **Tokens never touch `localStorage`, `sessionStorage` or JavaScript-readable cookies.** The session lives in an HttpOnly, Secure, SameSite cookie.
6. **`client_secret` and the Supabase service key exist only in server environment variables.** Never in browser code, never in git, never pasted in chat.
7. **The browser never talks to Supabase directly.** All database access goes through Attendie's server.
8. **Row Level Security is ON for every table.** No table is ever left open.
9. **Students act only for themselves.** Bulk and club notifications come only from organisation accounts or event coordinators.
10. **Sent notifications cannot be edited or deleted.** Cancel or send a new version. History is append-only.
11. **Audit logs are written by the server, cannot be edited and cannot be deleted by users.**
12. **Files are private.** Access only through short-lived signed links to people involved in that request.
13. **Validate all input on the server,** including file type and size, even if the UI already validates.
14. **Redirects use an exact allow-list.** No open redirects.
15. **No destructive "clear database" tools** anywhere near production.
16. **Rate limit** sign-in callbacks, notification creation and file uploads.
17. **Least data:** share and store only what is needed.

## 2. Secrets and credentials

1. Secrets live in `.env.local` (local) and Vercel environment variables (deployed). `.env*` files are in `.gitignore`.
2. **Never paste keys, secrets, passwords or tokens in chat.** Claude will tell you the file and variable name. You fill it in yourself.
3. If a secret is exposed, treat it as compromised: rotate it immediately and log it in `tracker.md`.
4. The Firebase config and API key in the original zip belong to someone else's project. They are removed from this project and not reused. The previous owner should lock or rotate them.
5. Separate keys for local development and production.

## 3. Scope rules

1. **Moodle is untouched.** We never read from or write to Moodle.
2. **No approval workflow.** That belongs to TemplateOS. Do not build it here.
3. **No connection to TemplateOS** until the TemplateOS owner provides their integration document.
4. **Portal (EkLink) is not changed** by this project. Anything needed from it is requested from its owner.
5. New features need a line in `plan.md` and `tracker.md` before work starts.

## 4. Development rules

1. **One feature at a time.** Finish, test and log it before starting the next.
2. **Branch per feature.** `main` stays deployable. Merge after tests pass.
3. **TypeScript strict mode.** No `any` unless justified in a comment.
4. **Small components.** No file over about 400 lines without a reason.
5. **Business rules live in one place** (a server-side policy module), not scattered across components.
6. **Database changes use migration files,** committed to git. No manual edits in the Supabase dashboard that are not captured in a migration.
7. **Every security-relevant rule has a test** (see section 5).
8. **No dead code and no unused packages.**
9. **Naming:** app name is `Attendie`. Portal is `EkLink`.

## 5. Testing rules

Minimum tests before any release:

1. **SSO (from the EkLink guide):** expired token rejected, reused code rejected, wrong role gets no access, tampered `redirect_uri` rejected, inactive user cannot sign in or refresh, bad `state` rejected.
2. **Access control:** Student A cannot read Student B's notification, file or comment. Student cannot create a bulk or club notification. Faculty cannot see notifications addressed to other faculty.
3. **Immutability:** sent notification cannot be edited or deleted. Audit rows cannot be updated or deleted.
4. **Files:** wrong type or oversize file rejected. Signed link expires. Uninvolved user cannot open a file.
5. **Picker:** user can only see people they are allowed to see. Snapshot does not change after creation.

## 6. Data and privacy rules

1. Only college users enrolled through the directory import can sign in.
2. Do not use real student data in screenshots, chats or public repos.
3. Test data is fake. Real data is loaded only into the live database by the owner.
4. Retention: requests and proof files are kept for a fixed period (to be decided, see `prd.md`), then archived or deleted.
5. Picker responses return only name, designation or section, and ID.

## 7. Process rules

1. Every decision, change and incident is recorded in `tracker.md` with date and person.
2. Documents (`goal.md`, `prd.md`, `plan.md`, `architecture.md`) are updated when a decision changes them, in the same session.
3. Open questions stay in `prd.md` until answered, then move to the decisions log.
4. A phase is "done" only when its exit checklist in `plan.md` is fully ticked.
5. Security issues found are fixed before any new feature work.

## 8. Roles and responsibilities

| Person | Responsibility |
|---|---|
| **Owner** | Product decisions, Supabase account, data, Vercel, secrets, final approval |
| **Portal owner** | EkLink: app registration, roles, user accounts |
| **TemplateOS owner** | TemplateOS integration document, later |
| **Claude** | Planning, code, documentation, tests, keeping `tracker.md` and documents up to date |

## 9. Definition of done (for any feature)

- Code merged to `main` through a branch.
- Security tests for that feature pass.
- Works on a phone-sized screen.
- `tracker.md` updated. `plan.md` and `architecture.md` updated if anything changed.
- No new secrets in the repo.
