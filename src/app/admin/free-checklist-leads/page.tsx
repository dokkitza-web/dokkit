import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { requireAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Free checklist leads | DokKit admin",
  description: "Review free business administration checklist requests.",
};

type LeadRow = {
  id: string;
  full_name: string;
  business_name: string;
  email: string;
  province: string;
  industry: string;
  selected_format: "pdf" | "docx";
  marketing_consent: boolean;
  pdf_downloaded_at: string | null;
  docx_downloaded_at: string | null;
  created_at: string;
};

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function FreeChecklistLeadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = (getParam(resolvedSearchParams, "q") ?? "").toLowerCase();
  const consentFilter = getParam(resolvedSearchParams, "consent") ?? "all";
  const { supabase, user } = await requireAdmin();
  const { data, error } = await supabase
    .from("free_checklist_leads")
    .select(
      "id,full_name,business_name,email,province,industry,selected_format,marketing_consent,pdf_downloaded_at,docx_downloaded_at,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(500);
  const leads = (data ?? []) as LeadRow[];
  const filteredLeads = leads.filter((lead) => {
    const matchesQuery = query
      ? [
          lead.full_name,
          lead.business_name,
          lead.email,
          lead.province,
          lead.industry,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;
    const matchesConsent =
      consentFilter === "all"
        ? true
        : consentFilter === "yes"
          ? lead.marketing_consent
          : !lead.marketing_consent;

    return matchesQuery && matchesConsent;
  });
  const downloadCount = leads.filter(
    (lead) => lead.pdf_downloaded_at || lead.docx_downloaded_at,
  ).length;
  const marketingCount = leads.filter(
    (lead) => lead.marketing_consent,
  ).length;
  const uniqueBusinesses = new Set(
    leads.map((lead) => lead.business_name.trim().toLowerCase()),
  ).size;

  return (
    <AdminShell
      email={user.email ?? "Admin user"}
      eyebrow="Free resource"
      title="Checklist leads"
      description="Review the businesses that requested the free administration readiness checklist. Marketing permission is shown separately from delivery consent."
      actions={
        <Link
          href="/free-business-admin-checklist"
          className="rounded-full bg-[#ff6a00] px-4 py-2 text-sm font-black text-white transition hover:bg-[#d95400]"
        >
          View resource
        </Link>
      }
    >
      {error ? (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error.message}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Requests", leads.length.toString()],
          ["Unique businesses", uniqueBusinesses.toString()],
          ["Downloads started", downloadCount.toString()],
          ["Marketing opt-ins", marketingCount.toString()],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-md border border-black/10 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-bold text-[#5f5f66]">{label}</p>
            <p className="mt-3 text-3xl font-black text-[#111111]">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-md border border-black/10 bg-white shadow-sm">
        <form className="grid gap-3 border-b border-black/10 p-4 lg:grid-cols-[1fr_220px_auto]">
          <label className="grid gap-2 text-sm font-bold text-[#111111]">
            Search requests
            <input
              name="q"
              defaultValue={query}
              placeholder="Name, business, email, industry..."
              className="rounded-md border border-[#cfc7bd] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-[#111111]">
            Marketing permission
            <select
              name="consent"
              defaultValue={consentFilter}
              className="rounded-md border border-[#cfc7bd] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
            >
              <option value="all">All requests</option>
              <option value="yes">Opted in</option>
              <option value="no">Not opted in</option>
            </select>
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-md bg-[#111111] px-5 py-3 text-sm font-black text-white transition hover:bg-[#2b2b2b]"
            >
              Filter
            </button>
            <Link
              href="/admin/free-checklist-leads"
              className="rounded-md border border-black/10 px-5 py-3 text-sm font-black text-[#111111] transition hover:border-[#ff6a00] hover:text-[#ff6a00]"
            >
              Reset
            </Link>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-black/10 text-sm">
            <thead className="bg-[#111111] text-left text-xs font-black uppercase text-white/70">
              <tr>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Format</th>
                <th className="px-4 py-3">Downloaded</th>
                <th className="px-4 py-3">Marketing</th>
                <th className="px-4 py-3">Requested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="transition hover:bg-[#fff4eb]">
                  <td className="px-4 py-3">
                    <p className="font-black text-[#111111]">{lead.full_name}</p>
                    <a
                      href={`mailto:${lead.email}`}
                      className="mt-1 block text-xs text-[#a63d00] underline"
                    >
                      {lead.email}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-black text-[#111111]">
                      {lead.business_name}
                    </p>
                    <p className="mt-1 text-xs text-[#5f5f66]">
                      {lead.industry}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-[#5f5f66]">{lead.province}</td>
                  <td className="px-4 py-3 font-black uppercase text-[#111111]">
                    {lead.selected_format}
                  </td>
                  <td className="px-4 py-3 text-xs text-[#5f5f66]">
                    {lead.pdf_downloaded_at || lead.docx_downloaded_at
                      ? formatDate(
                          lead.pdf_downloaded_at ?? lead.docx_downloaded_at,
                        )
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
        {!filteredLeads.length ? (
          <div className="p-8 text-sm font-bold text-[#5f5f66]">
            No checklist requests match these filters.
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
