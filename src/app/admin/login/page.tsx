import { Suspense } from "react";
import { AdminLoginForm } from "@/app/admin/login/login-form";
import { BrandLogo } from "@/components/brand-logo";

export const metadata = {
  title: "Admin login | DokKit",
  description: "Sign in to the DokKit owner dashboard.",
};

export default function AdminLoginPage() {
  return (
    <section className="min-h-screen bg-[linear-gradient(135deg,#fffaf5_0%,#ffffff_45%,#fff0e3_100%)] px-6 py-14 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-7rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <BrandLogo />
          <p className="mt-10 w-fit rounded-full border border-[#ffcfaa] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-[#d95400] shadow-sm">
            Owner workspace
          </p>
          <h1 className="mt-5 max-w-2xl text-5xl font-black leading-[0.95] tracking-tight text-[#111111] sm:text-6xl">
            DokKit admin for catalogue and order control.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-[#5f5f66]">
            Manage template packs, product files, PayFast orders, customer
            activity, and secure downloads from one protected workspace.
          </p>
        </div>
        <div className="rounded-[2rem] border border-black/10 bg-white p-7 shadow-2xl shadow-black/10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
            Owner access
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight">
            Sign in to admin
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
            Use your registered DokKit admin account.
          </p>
          <Suspense>
            <AdminLoginForm />
          </Suspense>
        </div>
      </div>
    </section>
  );
}
