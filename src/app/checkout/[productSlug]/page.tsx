import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckoutForm } from "@/components/checkout-form";
import { PaymentMethods } from "@/components/payment-methods";
import { formatPrice } from "@/data/catalogue";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type CheckoutPageProps = {
  params: Promise<{ productSlug: string }>;
};

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price_cents: number;
  document_count: number;
  workbook_count: number;
  pdf_count: number;
};

export const metadata: Metadata = {
  title: "Checkout | DokKit",
  description: "Start your DokKit document pack checkout.",
};

async function getLiveProduct(productSlug: string) {
  const supabase = createSupabaseAdminClient();
  const { data: product } = await supabase
    .from("products")
    .select(
      "id, slug, name, description, price_cents, document_count, workbook_count, pdf_count",
    )
    .eq("slug", productSlug)
    .eq("is_live", true)
    .single<ProductRow>();

  if (!product) {
    return null;
  }

  const { data: productFile } = await supabase
    .from("product_files")
    .select("id")
    .eq("product_id", product.id)
    .eq("file_kind", "zip")
    .eq("is_active", true)
    .limit(1)
    .maybeSingle();

  return productFile ? product : null;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { productSlug } = await params;
  const product = await getLiveProduct(productSlug);

  if (!product) {
    notFound();
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-6 py-14 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
      <div>
        <p className="text-sm font-bold uppercase text-[#f26a21]">
          DokKit checkout
        </p>
        <h1 className="mt-3 text-4xl font-black text-[#111111]">
          Complete your order
        </h1>
        <p className="mt-4 text-lg leading-8 text-[#5f5a54]">
          Enter your details and continue to PayFast. After payment is verified,
          DokKit will use your order record to deliver the private download.
        </p>

        <div className="mt-8 rounded-xl border border-[#eadfd4] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-[#111111]">
            What you are buying
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#5f5a54]">
            {product.description}
          </p>
          <div className="mt-5 grid gap-3 text-sm font-semibold text-[#5f5a54] sm:grid-cols-3">
            <span className="rounded-md bg-[#fbf8f5] px-3 py-2">
              {product.document_count} documents
            </span>
            <span className="rounded-md bg-[#fbf8f5] px-3 py-2">
              {product.workbook_count} workbook
            </span>
            <span className="rounded-md bg-[#fbf8f5] px-3 py-2">
              PDF coming soon
            </span>
          </div>
        </div>

        <div className="mt-6">
          <PaymentMethods />
        </div>
      </div>

      <CheckoutForm
        productSlug={product.slug}
        productName={product.name}
        priceLabel={formatPrice(product.price_cents)}
      />
    </section>
  );
}
