import { Suspense } from "react";
import { AdminLoginForm } from "@/app/admin/login/login-form";
import { BrandLogo } from "@/components/brand-logo";

export const metadata = {
  title: "Admin login | DokKit",
  description: "Sign in to the DokKit owner dashboard.",
};

export default function AdminLoginPage() {
  return (
    <section className="flex min-h-screen items-center bg-[linear-gradient(135deg,#111111_0%,#191919_45%,#ff6a00_160%)] px-6 py-14 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/15 bg-white p-7 shadow-2xl shadow-black/25">
        <BrandLogo />
        <p className="mt-8 text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
          Owner access
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">
          Sign in to DokKit admin
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#5f5f66]">
          Use the admin account created in Supabase Auth and registered in
          `public.admin_users`.
        </p>
        <Suspense>
          <AdminLoginForm />
        </Suspense>
      </div>
    </section>
  );
}
