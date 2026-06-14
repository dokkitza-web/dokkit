import Link from "next/link";
import { signOutAdmin } from "@/app/admin/actions";

const adminLinks = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
];

export function AdminNav({ email }: { email: string }) {
  return (
    <div className="mb-8 rounded-lg border border-[#dfe7e2] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#15201c]">DokKit Admin</p>
          <p className="mt-1 text-sm text-[#53615b]">{email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md border border-[#dfe7e2] px-4 py-2 text-sm font-semibold text-[#15201c] transition hover:border-[#147d64]"
            >
              {link.label}
            </Link>
          ))}
          <form action={signOutAdmin}>
            <button
              type="submit"
              className="rounded-md bg-[#15201c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#26352f]"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
