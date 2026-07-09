import Link from "next/link";
import type { ReactNode } from "react";
import { signOutAdmin } from "@/app/admin/actions";
import { BrandLogo } from "@/components/brand-logo";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Templates" },
  { href: "/admin/files", label: "Upload Templates" },
  { href: "/admin/orders", label: "Orders" },
];

const comingSoonLinks = [
  "Categories",
  "Customers",
  "Downloads",
  "Payments",
  "Settings",
];

export function AdminShell({
  email,
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  email: string;
  eyebrow: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f6f4f1] text-[#111111]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-black/10 bg-[#111111] px-5 py-6 text-white xl:block">
        <BrandLogo light />
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffb06f]">
            Signed in
          </p>
          <p className="mt-2 break-all text-sm font-bold text-white/85">
            {email}
          </p>
        </div>
        <nav className="mt-8 grid gap-2">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-2xl px-4 py-3 text-sm font-black text-white/72 transition hover:bg-white/10 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8">
          <p className="px-4 text-xs font-black uppercase tracking-[0.18em] text-white/35">
            Coming soon
          </p>
          <div className="mt-3 grid gap-2">
            {comingSoonLinks.map((link) => (
              <span
                key={link}
                className="rounded-2xl px-4 py-3 text-sm font-bold text-white/35"
              >
                {link}
              </span>
            ))}
          </div>
        </div>
        <form action={signOutAdmin} className="absolute inset-x-5 bottom-6">
          <button
            type="submit"
            className="w-full rounded-2xl border border-white/15 px-4 py-3 text-sm font-black text-white/75 transition hover:border-[#ff6a00] hover:text-white"
          >
            Sign out
          </button>
        </form>
      </aside>

      <main className="xl:pl-72">
        <div className="sticky top-0 z-20 border-b border-black/10 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center justify-between gap-4 xl:hidden">
              <BrandLogo />
              <form action={signOutAdmin}>
                <button
                  type="submit"
                  className="rounded-full bg-[#111111] px-4 py-2 text-sm font-black text-white"
                >
                  Sign out
                </button>
              </form>
            </div>
            <nav className="flex gap-2 overflow-x-auto pb-1 xl:hidden">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="shrink-0 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-black text-[#111111]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="hidden xl:block">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
                {eyebrow}
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-[#111111]">
                {title}
              </h1>
            </div>
            <div className="hidden items-center gap-3 xl:flex">
              {actions}
              <div className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-bold text-[#55555c]">
                {email}
              </div>
            </div>
          </div>
        </div>

        <section className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
          <div className="mb-8 xl:hidden">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
              {eyebrow}
            </p>
            <h1 className="mt-2 text-4xl font-black tracking-tight">{title}</h1>
          </div>
          {description ? (
            <p className="mb-8 max-w-3xl text-sm leading-6 text-[#62626a]">
              {description}
            </p>
          ) : null}
          {children}
        </section>
      </main>
    </div>
  );
}
