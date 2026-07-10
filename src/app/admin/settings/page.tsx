import { AdminSettingsForm } from "@/app/admin/settings/settings-form";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Admin settings | DokKit",
  description: "Update DokKit admin account settings.",
};

export default async function AdminSettingsPage() {
  const { user } = await requireAdmin();

  return (
    <AdminShell
      email={user.email ?? "Admin user"}
      eyebrow="Account settings"
      title="Login credentials"
      description="Update the email address or password used for your DokKit admin account."
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
            Current account
          </p>
          <h2 className="mt-3 text-2xl font-black">Admin sign-in</h2>
          <dl className="mt-6 grid gap-4 text-sm">
            <div className="rounded-2xl bg-[#f6f4f1] px-4 py-3">
              <dt className="font-bold text-[#5f5f66]">Current email</dt>
              <dd className="mt-1 break-all font-black text-[#111111]">
                {user.email ?? "-"}
              </dd>
            </div>
            <div className="rounded-2xl bg-[#f6f4f1] px-4 py-3">
              <dt className="font-bold text-[#5f5f66]">Admin access</dt>
              <dd className="mt-1 font-black text-[#111111]">
                Linked to your Supabase user ID
              </dd>
            </div>
          </dl>
        </section>

        <AdminSettingsForm currentEmail={user.email ?? ""} />
      </div>
    </AdminShell>
  );
}
