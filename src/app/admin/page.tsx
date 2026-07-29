import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Admin dashboard | DokKit",
  description: "Owner-only DokKit admin dashboard.",
};

const countCards = [
  { table: "industries", label: "Industries" },
  { table: "products", label: "Products" },
  { table: "orders", label: "Orders" },
  { table: "customers", label: "Customers" },
  { table: "product_files", label: "Product files" },
  { table: "payments", label: "Payments" },
  { table: "email_logs", label: "Email logs" },
  { table: "free_checklist_leads", label: "Free checklist leads" },
];

const launchTargets = [
  { key: "industries", label: "Live industries", expected: 8 },
  { key: "packageTiers", label: "Live package tiers", expected: 3 },
  { key: "industryProducts", label: "Live industry packages", expected: 24 },
  { key: "singleDocuments", label: "Live single templates", expected: 20 },
];

async function getCount(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  table: string,
) {
  const { count, error } = await supabase
    .from(table)
    .select("*", { count: "exact", head: true });

  if (error) {
    return {
      count: 0,
      error: error.message,
    };
  }

  return {
    count: count ?? 0,
    error: null,
  };
}

async function getLaunchReadiness(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
) {
  const [
    liveIndustries,
    livePackageTiers,
    liveIndustryProducts,
    liveSingleDocuments,
  ] = await Promise.all([
    supabase
      .from("industries")
      .select("id", { count: "exact", head: true })
      .eq("is_live", true),
    supabase
      .from("package_tiers")
      .select("id", { count: "exact", head: true })
      .eq("is_live", true),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_live", true)
      .eq("product_type", "industry_package"),
    supabase
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("is_live", true)
      .eq("product_type", "single_document"),
  ]);
  const countByKey = {
    industries: liveIndustries,
    packageTiers: livePackageTiers,
    industryProducts: liveIndustryProducts,
    singleDocuments: liveSingleDocuments,
  };

  return launchTargets.map((target) => {
    const result = countByKey[target.key as keyof typeof countByKey];
    const count = result.count ?? 0;

    return {
      ...target,
      count,
      missing: Math.max(target.expected - count, 0),
      error: result.error?.message ?? null,
    };
  });
}

type ChecklistLead = {
  id: string;
  full_name: string;
  business_name: string;
  email: string;
  industry: string;
  marketing_consent: boolean;
  pdf_downloaded_at: string | null;
  docx_downloaded_at: string | null;
  created_at: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminDashboardPage() {
  const { supabase, user } = await requireAdmin();
  const [counts, launchReadiness, checklistLeadResult] = await Promise.all([
    Promise.all(
      countCards.map(async (card) => ({
        ...card,
        ...(await getCount(supabase, card.table)),
      })),
    ),
    getLaunchReadiness(supabase),
    supabase
      .from("free_checklist_leads")
      .select(
        "id,full_name,business_name,email,industry,marketing_consent,pdf_downloaded_at,docx_downloaded_at,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  const recentChecklistLeads =
    (checklistLeadResult.data as ChecklistLead[] | null) ?? [];
  const readinessIssues = launchReadiness.filter(
    (item) => item.error || item.missing > 0,
  );
  const catalogueReady = readinessIssues.length === 0;

  return (
    <AdminShell
      email={user.email ?? "Admin user"}
      eyebrow="Owner dashboard"
      title="Admin overview"
      description="Monitor live DokKit catalogue, orders, product files, payments, and customer activity from one protected workspace."
      actions={
        <Link
          href="/admin/files"
          className="rounded-full bg-[#ff6a00] px-4 py-2 text-sm font-black text-white transition hover:bg-[#d95400]"
        >
          Upload template
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {counts.map((card) => (
          <article
            key={card.table}
            className="rounded-[1.75rem] border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-[#ffcfaa] hover:shadow-xl"
          >
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm font-bold text-[#5f5f66]">{card.label}</p>
              <span className="h-3 w-3 rounded-full bg-[#ff6a00]" />
            </div>
            <p className="mt-5 text-4xl font-black text-[#111111]">
              {card.count}
            </p>
            {card.error ? (
              <p className="mt-3 text-xs text-red-700">{card.error}</p>
            ) : null}
          </article>
        ))}
      </div>

      <section className="mt-8 overflow-hidden rounded-md border border-black/10 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-black/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase text-[#a63d00]">
              Free checklist activity
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#111111]">
              Recent download requests
            </h2>
          </div>
          <Link
            href="/admin/free-checklist-leads"
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#111111] px-4 py-2 text-sm font-black text-white transition hover:bg-[#c24100]"
          >
            View all free leads
          </Link>
        </div>

        {checklistLeadResult.error ? (
          <p className="p-5 text-sm font-bold text-red-700">
            {checklistLeadResult.error.message}
          </p>
        ) : recentChecklistLeads.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-black/10 text-sm">
              <thead className="bg-[#f6f4f1] text-left text-xs font-black uppercase text-[#5f5f66]">
                <tr>
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Industry</th>
                  <th className="px-4 py-3">Download</th>
                  <th className="px-4 py-3">Marketing</th>
                  <th className="px-4 py-3">Requested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {recentChecklistLeads.map((lead) => (
                  <tr key={lead.id} className="transition hover:bg-[#fff4eb]">
                    <td className="px-4 py-3">
                      <p className="font-black text-[#111111]">
                        {lead.business_name}
                      </p>
                      <p className="mt-1 text-xs text-[#5f5f66]">
                        {lead.full_name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={`mailto:${lead.email}`}
                        className="text-[#a63d00] underline underline-offset-2"
                      >
                        {lead.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-[#5f5f66]">
                      {lead.industry}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-[#5f5f66]">
                      {lead.pdf_downloaded_at || lead.docx_downloaded_at
                        ? "Started"
                        : "Not yet"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-black ${
                          lead.marketing_consent
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-[#f1f0ee] text-[#5f5f66]"
                        }`}
                      >
                        {lead.marketing_consent ? "Opted in" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#5f5f66]">
                      {formatDate(lead.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-5 text-sm font-bold text-[#5f5f66]">
            No free checklist requests have been submitted yet.
          </p>
        )}
      </section>

      <div
        className={`mt-8 rounded-[1.75rem] border p-6 shadow-sm ${
          catalogueReady
            ? "border-[#ffd8bd] bg-white"
            : "border-amber-200 bg-amber-50"
        }`}
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
              Launch readiness
            </p>
            <h2 className="mt-2 text-xl font-black">
              Live catalogue against local seed targets
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[#5f5f66]">
              The approved launch catalogue expects 8 ready industries, 3
              package tiers, 24 industry package products, and 20 single
              templates to be live.
            </p>
          </div>
          <span
            className={`w-fit rounded-full px-4 py-2 text-sm font-black ${
              catalogueReady
                ? "bg-[#fff4eb] text-[#ff6a00]"
                : "bg-white text-amber-800"
            }`}
          >
            {catalogueReady ? "Ready" : `${readinessIssues.length} issue(s)`}
          </span>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {launchReadiness.map((item) => (
            <article
              key={item.key}
              className="rounded-2xl border border-black/10 bg-[#fffaf5] p-4"
            >
              <p className="text-sm font-bold text-[#5f5f66]">{item.label}</p>
              <p className="mt-2 text-2xl font-black text-[#111111]">
                {item.count} / {item.expected}
              </p>
              {item.error ? (
                <p className="mt-2 text-xs text-red-700">{item.error}</p>
              ) : item.missing ? (
                <p className="mt-2 text-xs font-bold text-amber-800">
                  {item.missing} missing from live catalogue
                </p>
              ) : (
                <p className="mt-2 text-xs font-bold text-[#ff6a00]">
                  Target met
                </p>
              )}
            </article>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-[1.75rem] bg-[#111111] p-6 text-white shadow-xl shadow-black/10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ffb06f]">
          Workspace
        </p>
        <h2 className="mt-3 text-2xl font-black">Admin modules</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {[
            "Product editing and pricing",
            "Template upload, activation, and deletion",
            "Order, payment, email, and download review",
            "Refund and cancellation workflows",
            "Customer account access",
          ].map((item) => (
            <div
              key={item}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white/70"
            >
              {item}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/admin/orders"
            className="inline-flex rounded-full bg-[#ff6a00] px-5 py-3 text-sm font-black text-white transition hover:bg-[#d95400]"
          >
            Review orders
          </Link>
          <Link
            href="/admin/products"
            className="inline-flex rounded-full border border-white/20 px-5 py-3 text-sm font-black text-white transition hover:border-[#ff6a00]"
          >
            Review products
          </Link>
        </div>
      </div>
    </AdminShell>
  );
}
