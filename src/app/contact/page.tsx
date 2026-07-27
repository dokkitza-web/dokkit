import type { Metadata } from "next";
import Link from "next/link";
import { policyLinks, supplierIdentity } from "@/data/legal-policies";

export const metadata: Metadata = {
  title: "Contact and supplier information | DokKit",
  description:
    "DokKit supplier identity, support contact and Information Officer details.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8 lg:py-16">
        <p className="text-sm font-bold uppercase text-[#a63d00]">
          Supplier and support
        </p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-[#111111] sm:text-5xl">
          Contact DokKit
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5f5f66]">
          Contact DokKit about an order, digital delivery, a refund or remedy,
          privacy, or the website.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <section className="border border-black/10 bg-[#fff7f0] p-6">
            <h2 className="text-2xl font-semibold">Supplier information</h2>
            <dl className="mt-5 grid gap-4 text-sm leading-6">
              <div>
                <dt className="font-semibold text-[#5f5f66]">Trading name</dt>
                <dd>{supplierIdentity.tradingName}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#5f5f66]">
                  Legal operator
                </dt>
                <dd>
                  {supplierIdentity.legalOperator}, a private company registered
                  in the Republic of South Africa
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#5f5f66]">
                  Registration number
                </dt>
                <dd>{supplierIdentity.registrationNumber}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#5f5f66]">
                  Director / office bearer
                </dt>
                <dd>{supplierIdentity.director}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#5f5f66]">
                  Physical address and address for legal service
                </dt>
                <dd>{supplierIdentity.address}</dd>
              </div>
              <div>
                <dt className="font-semibold text-[#5f5f66]">VAT status</dt>
                <dd>Not registered for VAT; no VAT is charged</dd>
              </div>
            </dl>
          </section>

          <section className="border border-black/10 p-6">
            <h2 className="text-2xl font-semibold">Contact details</h2>
            <dl className="mt-5 grid gap-4 text-sm leading-6">
              <div>
                <dt className="font-semibold text-[#5f5f66]">Support email</dt>
                <dd>
                  <Link
                    href={`mailto:${supplierIdentity.supportEmail}`}
                    className="font-semibold text-[#005f73] underline underline-offset-4"
                  >
                    {supplierIdentity.supportEmail}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#5f5f66]">Telephone</dt>
                <dd>
                  <Link
                    href="tel:+27839760291"
                    className="font-semibold text-[#005f73] underline underline-offset-4"
                  >
                    {supplierIdentity.telephone}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#5f5f66]">Website</dt>
                <dd>
                  <Link
                    href={supplierIdentity.website}
                    className="font-semibold text-[#005f73] underline underline-offset-4"
                  >
                    {supplierIdentity.website}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#5f5f66]">
                  Information Officer
                </dt>
                <dd>
                  {supplierIdentity.director}
                  <br />
                  <Link
                    href={`mailto:${supplierIdentity.privacyEmail}`}
                    className="font-semibold text-[#005f73] underline underline-offset-4"
                  >
                    {supplierIdentity.privacyEmail}
                  </Link>
                  <br />
                  {supplierIdentity.telephone}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#5f5f66]">
                  Industry / ADR code
                </dt>
                <dd>
                  DokKit does not currently subscribe to an industry ADR code
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="mt-10 border-l-4 border-[#ff6a00] bg-[#fff7f0] p-6">
          <h2 className="text-xl font-semibold">Order and service support</h2>
          <p className="mt-3 text-sm leading-6 text-[#3f3f43]">
            Send an order or service complaint to{" "}
            <Link
              href={`mailto:${supplierIdentity.supportEmail}`}
              className="font-semibold text-[#005f73] underline underline-offset-4"
            >
              {supplierIdentity.supportEmail}
            </Link>{" "}
            with your order number, payment email, a clear description and
            useful screenshots or error messages. We aim to acknowledge a
            complete request within two business days and resolve it within five
            business days after receiving the information needed to investigate.
          </p>
          <p className="mt-3 text-sm leading-6 text-[#3f3f43]">
            Never send full card details, passwords or one-time PINs.
          </p>
        </section>

        <nav
          aria-label="DokKit policies"
          className="mt-10 flex flex-wrap gap-x-5 gap-y-3 text-sm font-semibold"
        >
          {policyLinks.slice(0, 5).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[#005f73] underline underline-offset-4"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
