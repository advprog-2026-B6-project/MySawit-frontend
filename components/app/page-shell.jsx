import { cn } from "@/lib/utils";
import Link from "next/link";

const moduleLinks = [
  { href: "/", label: "Beranda" },
  { href: "/admin", label: "Admin" },
  { href: "/kebun", label: "Kebun" },
  { href: "/buruh/hasil", label: "Hasil" },
  { href: "/buruh/riwayat", label: "Riwayat Buruh" },
  { href: "/mandor/riwayat", label: "Riwayat Mandor" },
  { href: "/pengiriman", label: "Pengiriman" },
  { href: "/pembayaran/me", label: "Pembayaran" },
];

function GlobalNavbar() {
  return (
    <header className="border-b border-green-100/80 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
        <Link
          href="/"
          className="text-xl font-black tracking-tight text-green-900"
        >
          MySawit
        </Link>
        <nav className="flex flex-wrap gap-2">
          {moduleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-green-100 bg-green-50 px-4 py-2 text-sm font-medium text-green-800 transition hover:border-green-300 hover:bg-green-100"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function PageShell({ children, className }) {
  return (
    <div
      className={cn(
        "min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.08),_transparent_32%),linear-gradient(180deg,#f8fcf8_0%,#f3f8f4_100%)]",
      )}
    >
      <GlobalNavbar />
      <div
        className={cn(
          "mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}

export function PageHero({ eyebrow, title, description, actions, className }) {
  return (
    <section
      className={cn(
        "mb-8 rounded-3xl border border-green-100 bg-linear-to-r from-green-50 via-emerald-50 to-lime-50 p-6 shadow-sm sm:p-8",
        className,
      )}
    >
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
          {eyebrow}
        </p>
      ) : null}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </section>
  );
}

export function SurfaceCard({ children, className }) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-green-100 bg-white p-6 shadow-sm sm:p-8",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function SectionHeader({ eyebrow, title, description, className }) {
  return (
    <div className={cn("mb-6", className)}>
      {eyebrow ? (
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="mt-2 text-2xl font-bold text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}

export function AlertMessage({ type = "error", children, className }) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-green-200 bg-green-50 text-green-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    info: "border-sky-200 bg-sky-50 text-sky-800",
  };

  return (
    <div
      className={cn(
        "rounded-2xl border px-4 py-3 text-sm",
        styles[type] || styles.info,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LoadingState({ label = "Memuat data...", className }) {
  return (
    <SurfaceCard
      className={cn(
        "flex items-center justify-center gap-3 py-16 text-sm text-slate-500",
        className,
      )}
    >
      <span className="size-4 animate-spin rounded-full border-2 border-green-200 border-t-green-700" />
      {label}
    </SurfaceCard>
  );
}

export function StatusBadge({ children, tone = "slate", className }) {
  const tones = {
    green: "border-green-200 bg-green-50 text-green-800",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
    red: "border-red-200 bg-red-50 text-red-800",
    sky: "border-sky-200 bg-sky-50 text-sky-800",
    violet: "border-violet-200 bg-violet-50 text-violet-800",
    slate: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        tones[tone] || tones.slate,
        className,
      )}
    >
      {children}
    </span>
  );
}

export function EmptyState({ title, description, actions, className }) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-dashed border-green-200 bg-green-50/60 p-8 text-center",
        className,
      )}
    >
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      ) : null}
      {actions ? <div className="mt-5 flex justify-center gap-3">{actions}</div> : null}
    </div>
  );
}
