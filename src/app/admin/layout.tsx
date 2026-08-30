// Admin pages read the authenticated Supabase session and must never be
// prerendered during a public production build.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
