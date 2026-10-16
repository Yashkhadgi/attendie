import { z } from "zod";

export const allowedEklinkRoles = [
  "student",
  "faculty",
  "staff",
  "hod",
  "director",
  "finance",
  "admin",
] as const;

export const eklinkClaimsSchema = z.object({
  sub: z.string().min(1),
  login_id: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.string().min(1),
  department: z.string().nullable(),
  batch: z.string().nullable(),
  section: z.string().nullable(),
  ver: z.union([z.string(), z.number()]),
  exp: z.number().int().positive(),
});

export type EklinkClaims = z.infer<typeof eklinkClaimsSchema>;
export type AllowedEklinkRole = (typeof allowedEklinkRoles)[number];

export function isAllowedEklinkRole(role: string): role is AllowedEklinkRole {
  return allowedEklinkRoles.includes(role as AllowedEklinkRole);
}
