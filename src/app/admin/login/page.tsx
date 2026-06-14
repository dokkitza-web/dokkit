import { Suspense } from "react";
import { AdminLoginForm } from "@/app/admin/login/login-form";

export const metadata = {
  title: "Admin login | DokKit",
  description: "Sign in to the DokKit owner dashboard.",
};

export default function AdminLoginPage() {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-180px)] max-w-7xl items-center px-6 py-14 lg:px-8">
      <div className="mx-auto w-full max-w-md rounded-lg border border-[#dfe7e2] bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#147d64]">
          Owner access
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          Sign in to DokKit admin
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#53615b]">
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
