import Link from "next/link";

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/notifications", label: "Notifications" },
  { href: "/inbox", label: "Inbox" },
  { href: "/events", label: "Events" },
  { href: "/organisations", label: "Organisations" },
  { href: "/reports", label: "Reports" },
] as const;

export function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/95">
      <div className="mx-auto flex min-h-16 w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link
          href="/dashboard"
          className="text-lg font-semibold tracking-normal text-slate-950"
        >
          Attendie
        </Link>
        <nav aria-label="Primary navigation" className="flex flex-wrap gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
