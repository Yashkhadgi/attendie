const SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i;

export function sanitizeNextPath(value: string | null | undefined): string {
  if (!value) {
    return "/dashboard";
  }

  const nextPath = value.trim();
  if (
    !nextPath.startsWith("/") ||
    nextPath.startsWith("//") ||
    nextPath.includes("\\") ||
    SCHEME_PATTERN.test(nextPath)
  ) {
    return "/dashboard";
  }

  return nextPath;
}

export function authErrorUrl(reason: string): string {
  return `/auth/error?reason=${encodeURIComponent(reason)}`;
}
