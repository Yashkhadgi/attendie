# Attendie: Goal

> Version 1.0 | Last updated: 2026-10-12

## One-line goal

Give students, clubs and faculty one trusted place to **notify faculty about missed attendance, attach proof, and track it until it is marked in Moodle**, without replacing Moodle.

## Why this exists

Attendance is recorded in Moodle, and the college will not break that contract. Moodle has no way for a student, a club or an event coordinator to say: *"My attendance was missed because I was at an event, here is the proof, please fix it."* Today that happens over WhatsApp, on paper and in corridors, with no record and no follow-up.

Attendie is the **communication and proof layer** around Moodle. Moodle stays the official record.

## Final goal (what "done" looks like)

1. A student who missed attendance can notify the right faculty in under a minute, with proof if needed.
2. A club (through its own organisation account) can notify faculty about many students at once, with the faculty in-charge in the loop.
3. Faculty see every request in one inbox and mark each one **Seen**, **Marked in Moodle** or **Can't mark (reason)**. The loop always closes.
4. If a faculty member misses a request, the student can **pin and escalate** it with full context.
5. Every request has a permanent, append-only history. Nobody can quietly edit or delete it.
6. Nobody can see or act on another person's data. Access is enforced on the server and in the database, not just hidden in the UI.
7. Attendie works as one app inside the **EkLink** portal. The user logs in once and never signs in again.
8. Attendie exposes a safe **directory picker** so other apps (starting with TemplateOS) can import faculty, staff and student lists into reports.

## Success measures

| Measure | Target (pilot) |
|---|---|
| Time for a student to send a notification | under 60 seconds |
| Requests that reach a final status (Marked or Can't mark) | 90% or more |
| Cross-user data leaks found in testing | 0 |
| Sign-ins needing a second login after EkLink | 0 |
| Faculty who use the inbox weekly in the pilot | most of the pilot group |

## Non-goals (we are NOT doing these)

- Replacing or integrating with Moodle's database or API.
- The **approval workflow** (hackathon NOC, 70% attendance check, HOD/Director chain). That belongs to **TemplateOS**.
- Document generation and templates. That belongs to **TemplateOS**.
- Building the portal. **EkLink** is already live and owned by another person.
- Moodle attendance percentage calculation.

## Guiding principles

1. **Security before features.** This is a college platform. No one gets into anyone else's account or data.
2. **Moodle stays the source of truth.** We never claim an attendance is officially fixed. Faculty confirm it.
3. **Close the loop.** A notification that nobody acts on is just another WhatsApp message.
4. **Keep it simple.** Build one feature at a time, test it, then move on.
5. **Connect-ready, not connected.** Design for TemplateOS now, connect only when its integration document arrives.
