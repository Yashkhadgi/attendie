<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Attendie: project rules for coding agents

Read these before any work, in this order:
1. docs/rules and regulations.md  (must follow)
2. docs/plan.md  (current phase and exit checklist)
3. docs/architecture.md
4. docs/prd.md and docs/goal.md

Rules in short:
- One feature at a time, one branch per feature.
- Authorization only on the server, through lib/policy.
- No local passwords. Sign-in only through EkLink SSO.
- Never put secrets in code, git or chat. Use .env.local.
- Browser never talks to Supabase.
- Do not build the approval workflow. Do not connect TemplateOS.
- After each change, update docs/tracker.md.
- The reference/ folder is the old app, for reading only. Never commit it and never copy Firebase config from it.
