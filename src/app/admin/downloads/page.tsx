import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { formatPrice } from "@/data/catalogue";
import { requireAdmin } from "@/lib/supabase/admin";

export const metadata = {
  title: "Admin downloads | DokKit",
  description: "Review DokKit secure download activity.",
};

type DownloadEventRow = {
  id: string;
  download_link_id: string;
  order_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

type DownloadLinkRow = {
  id: string;
  product_file_id: string | null;
  expires_at: string;
  max_uses: number;
  used_count: number;
  revoked_at: string | null;
  created_at: string;
};

type OrderRow = {
  id: string;
  order_number: string;
  email: string;
  status: string;
  total_cents: number;
};

type ProductFileRow = {
  id: string;
  file_kind: string;
  version_label: string;
  storage_path: string;
  products:
    | {
        id: string;
        slug: string;
        name: string;
      }
    | {
        id: string;
        slug: string;
        name: string;
      }[]
    | null;
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

function getSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

function getProductName(product: ProductFileRow["products"]) {
  if (Array.isArray(product)) {
    return product[0]?.name ?? "Unknown product";
  }

  return product?.name ?? "Unknown product";
}

function getProductSlug(product: ProductFileRow["products"]) {
  if (Array.isArray(product)) {
    return product[0]?.slug ?? "-";
  }

  return product?.slug ?? "-";
}

function getLinkStatus(link?: DownloadLinkRow) {
  if (!link) {
    return "Missing link";
  }

  if (link.revoked_at) {
    return "Revoked";
  }

  if (new Date(link.expires_at).getTime() < Date.now()) {
    return "Expired";
  }

  if (link.used_count >= link.max_uses) {
    return "Used limit";
  }

  return "Active";
}

export default async function AdminDownloadsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const query = (getSearchParam(resolvedSearchParams, "q") ?? "")
    .trim()
    .toLowerCase();
  const { supabase, user } = await requireAdmin();
  const { data: events, error: eventsError } = await supabase
    .from("download_events")
    .select("id,download_link_id,order_id,ip_address,user_agent,created_at")
    .order("created_at", { ascending: false })
    .limit(100);
  const eventRows = (events ?? []) as DownloadEventRow[];
  const orderIds = [
    ...new Set(
      eventRows
        .map((event) => event.order_id)
        .filter((orderId): orderId is string => Boolean(orderId)),
    ),
  ];
  const linkIds = [...new Set(eventRows.map((event) => event.download_link_id))];
  const [
    { data: orders, error: ordersError },
    { data: links, error: linksError },
  ] = await Promise.all([
    orderIds.length
      ? supabase
          .from("orders")
          .select("id,order_number,email,status,total_cents")
          .in("id", orderIds)
      : Promise.resolve({ data: [], error: null }),
    linkIds.length
      ? supabase
          .from("download_links")
          .select(
            "id,product_file_id,expires_at,max_uses,used_count,revoked_at,created_at",
          )
          .in("id", linkIds)
      : Promise.resolve({ data: [], error: null }),
  ]);
  const linkRows = (links ?? []) as DownloadLinkRow[];
  const productFileIds = [
    ...new Set(
      linkRows
        .map((link) => link.product_file_id)
        .filter((fileId): fileId is string => Boolean(fileId)),
    ),
  ];
  const { data: productFiles, error: productFilesError } = productFileIds.length
    ? await supabase
        .from("product_files")
        .select("id,file_kind,version_label,storage_path,products(id,slug,name)")
        .in("id", productFileIds)
    : { data: [], error: null };
  const orderById = new Map(
    ((orders ?? []) as OrderRow[]).map((order) => [order.id, order]),
  );
  const linkById = new Map(linkRows.map((link) => [link.id, link]));
  const fileById = new Map(
    ((productFiles ?? []) as ProductFileRow[]).map((file) => [file.id, file]),
  );
  const filteredEvents = eventRows.filter((event) => {
    const order = event.order_id ? orderById.get(event.order_id) : null;
    const link = linkById.get(event.download_link_id);
    const file = link?.product_file_id
      ? fileById.get(link.product_file_id)
      : null;

    return query
      ? [
          order?.order_number ?? "",
          order?.email ?? "",
          file ? getProductName(file.products) : "",
          file ? getProductSlug(file.products) : "",
          file?.storage_path ?? "",
          event.ip_address ?? "",
          event.user_agent ?? "",
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;
  });
  const uniqueOrderCount = new Set(
    eventRows
      .map((event) => event.order_id)
      .filter((orderId): orderId is string => Boolean(orderId)),
  ).size;
  const uniqueFileCount = new Set(productFileIds).size;
  const latestEvent = eventRows[0];

  return (
    <AdminShell
      email={user.email ?? "Admin user"}
      eyebrow="Secure downloads"
      title="Downloads"
      description="Review recent secure download events, linked orders, template files, access limits, and device details."
      actions={
        <Link
          href="/admin/files"
          className="rounded-full bg-[#ff6a00] px-4 py-2 text-sm font-black text-white transition hover:bg-[#d95400]"
        >
          Manage files
        </Link>
      }
    >
      {[eventsError, ordersError, linksError, productFilesError].filter(Boolean)
        .length ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {[eventsError, ordersError, linksError, productFilesError]
            .map((error) => error?.message)
            .filter(Boolean)
            .join(" ")}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Download events", eventRows.length.toString()],
          ["Unique orders", uniqueOrderCount.toString()],
          ["Unique files", uniqueFileCount.toString()],
          ["Latest download", latestEvent ? formatDate(latestEvent.created_at) : "-"],
        ].map(([label, value]) => (
          <article
            key={label}
            className="rounded-[1.5rem] border border-black/10 bg-white p-5 shadow-sm"
          >
            <p className="text-sm font-bold text-[#5f5f66]">{label}</p>
            <p className="mt-3 text-2xl font-black text-[#111111]">{value}</p>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-[1.5rem] border border-black/10 bg-white shadow-sm">
        <form className="grid gap-3 border-b border-black/10 p-4 lg:grid-cols-[1fr_auto]">
          <label className="grid gap-2 text-sm font-bold text-[#111111]">
            Search downloads
            <input
              name="q"
              defaultValue={query}
              placeholder="Search order, email, product, path, IP, or browser"
              className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-full bg-[#111111] px-5 py-3 text-sm font-black text-white transition hover:bg-[#2b2b2b]"
            >
              Filter
            </button>
            <Link
              href="/admin/downloads"
              className="rounded-full border border-black/10 px-5 py-3 text-sm font-black text-[#111111] transition hover:border-[#ff6a00] hover:text-[#ff6a00]"
            >
              Reset
            </Link>
          </div>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-black/10 text-sm">
            <thead className="bg-[#111111] text-left text-xs font-black uppercase tracking-[0.14em] text-white/70">
              <tr>
                <th className="px-4 py-3">Downloaded</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Access</th>
                <th className="px-4 py-3">Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredEvents.map((event) => {
                const order = event.order_id ? orderById.get(event.order_id) : null;
                const link = linkById.get(event.download_link_id);
                const file = link?.product_file_id
                  ? fileById.get(link.product_file_id)
                  : null;

                return (
                  <tr key={event.id} className="transition hover:bg-[#fff4eb]">
                    <td className="px-4 py-3 text-xs text-[#5f5f66]">
                      {formatDate(event.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-black text-[#111111]">
                        {order?.order_number ?? "Unknown order"}
                      </p>
                      <p className="mt-1 break-all text-xs text-[#5f5f66]">
                        {order?.email ?? "-"}
                      </p>
                      <p className="mt-1 text-xs text-[#5f5f66]">
                        {order?.status ?? "-"} |{" "}
                        {formatPrice(order?.total_cents ?? 0)}
                      </p>
                    </td>
                    <td className="max-w-sm px-4 py-3">
                      <p className="font-black text-[#111111]">
                        {file ? getProductName(file.products) : "Unknown file"}
                      </p>
                      <p className="mt-1 text-xs text-[#5f5f66]">
                        {file
                          ? `${file.file_kind.toUpperCase()} ${file.version_label}`
                          : "-"}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#5f5f66]">
                        {file?.storage_path ?? "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-[#5f5f66]">
                      <p className="font-bold text-[#111111]">
                        {getLinkStatus(link)}
                      </p>
                      <p className="mt-1 text-xs">
                        {link ? `${link.used_count} / ${link.max_uses} uses` : "-"}
                      </p>
                      <p className="mt-1 text-xs">
                        Expires {formatDate(link?.expires_at)}
                      </p>
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <p className="text-xs font-bold text-[#111111]">
                        {event.ip_address ?? "No IP captured"}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[#5f5f66]">
                        {event.user_agent ?? "No browser details captured"}
                      </p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredEvents.length === 0 ? (
          <div className="p-8 text-sm font-bold text-[#5f5f66]">
            No download events match the selected filters.
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
