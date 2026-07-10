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
    <div className="min-h-screen bg-[linear-gradient(135deg,#fffaf5_0%,#ffffff_48%,#fff0e3_100%)] text-[#111111]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-80 border-r border-black/10 bg-white px-5 py-6 shadow-xl shadow-black/5 xl:block">
        <div className="flex items-center justify-between">
          <BrandLogo href="/admin" />
          <span className="rounded-full border border-[#ffcfaa] bg-[#fff4eb] px-3 py-1 text-xs font-black text-[#d95400]">
            Admin
          </span>
        </div>
        <div className="mt-8 rounded-[1.5rem] border border-black/10 bg-[#111111] p-5 text-white">
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
              className="rounded-2xl border border-transparent px-4 py-3 text-sm font-black text-[#55555c] transition hover:border-[#ffcfaa] hover:bg-[#fff4eb] hover:text-[#ff6a00]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8">
          <p className="px-4 text-xs font-black uppercase tracking-[0.18em] text-[#9b938b]">
            Coming soon
          </p>
          <div className="mt-3 grid gap-2">
            {comingSoonLinks.map((link) => (
              <span
                key={link}
                className="rounded-2xl px-4 py-3 text-sm font-bold text-[#9b938b]"
              >
                {link}
              </span>
            ))}
          </div>
        </div>
        <form action={signOutAdmin} className="absolute inset-x-5 bottom-6">
          <button
            type="submit"
            className="w-full rounded-full border border-black/10 bg-[#111111] px-4 py-3 text-sm font-black text-white transition hover:bg-[#2b2b2b]"
          >
            Sign out
          </button>
        </form>
      </aside>

      <main className="xl:pl-80">
        <div className="sticky top-0 z-20 border-b border-black/10 bg-white/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex items-center justify-between gap-4 xl:hidden">
              <BrandLogo href="/admin" />
              <form action={signOutAdmin}>
                <button
                  type="submit"
                  className="rounded-full bg-[#111111] px-4 py-2 text-sm font-black text-white shadow-sm"
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
                  className="shrink-0 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-black text-[#111111] transition hover:border-[#ff6a00] hover:text-[#ff6a00]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="hidden xl:block">
              <p className="text-sm font-black text-[#111111]">DokKit admin</p>
              <p className="mt-1 text-xs font-bold text-[#5f5f66]">
                Catalogue, payments, files, and orders
              </p>
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
          <div className="mb-8 rounded-[1.75rem] border border-black/10 bg-white/90 p-6 shadow-sm lg:p-8">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
              {eyebrow}
            </p>
            <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-[#111111] lg:text-5xl">
                  {title}
                </h1>
                {description ? (
                  <p className="mt-4 max-w-3xl text-sm leading-6 text-[#62626a]">
                    {description}
                  </p>
                ) : null}
              </div>
              {actions ? <div className="xl:hidden">{actions}</div> : null}
            </div>
          </div>
          {children}
        </section>
      </main>
    </div>
  );
}
