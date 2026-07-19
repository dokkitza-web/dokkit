import type { Metadata } from "next";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/cookie-settings-button";

export const metadata: Metadata = {
  title: "Privacy and cookies | DokKit",
  description:
    "How DokKit uses essential storage, Google Analytics 4 and Meta measurement tools.",
};

export default function PrivacyPage() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-4xl px-6 py-14 lg:px-8 lg:py-20">
        <p className="text-sm font-bold uppercase text-[#ff6a00]">
          Your information
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-[#111111]">
          Privacy and cookies
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[#5f5f66]">
          DokKit uses a small amount of browser storage to run the shop. Optional
          measurement tools only activate after you give permission.
        </p>

        <div className="mt-12 space-y-10 text-base leading-7 text-[#3f3f43]">
          <section>
            <h2 className="text-2xl font-semibold text-[#111111]">
              Essential services
            </h2>
            <p className="mt-3">
              Essential storage supports your cart, secure checkout, payment
              confirmation, downloads and saved privacy choice. DokKit and its
              payment and hosting providers also process the information needed
              to fulfil an order and protect the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#111111]">
              Google Analytics 4
            </h2>
            <p className="mt-3">
              When analytics is enabled, Google Analytics 4 records page views
              and shop events such as viewing a product, adding it to the cart,
              starting checkout and completing a purchase. This helps DokKit
              understand which products and pages are useful.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#111111]">
              Meta measurement
            </h2>
            <p className="mt-3">
              When marketing is enabled, Meta Pixel and Conversions API measure
              visits and shopping actions linked to Facebook and Instagram
              campaigns. Browser and server events use matching event IDs to
              reduce duplicate reporting.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#111111]">
              What is excluded
            </h2>
            <p className="mt-3">
              DokKit does not send customer document contents, checkout names,
              email addresses, phone numbers, secure download tokens or payment
              card details to Google Analytics or Meta through this setup.
              Technical identifiers such as browser cookies, IP address and user
              agent may be used for Meta measurement only when marketing consent
              is active.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#111111]">
              Change your choice
            </h2>
            <p className="mt-3">
              You can reopen the controls at any time. Turning an optional
              category off stops DokKit from sending new events in that
              category.
            </p>
            <CookieSettingsButton className="mt-5 rounded-md bg-[#005f73] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#004b5a]" />
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#111111]">Contact</h2>
            <p className="mt-3">
              Questions about DokKit privacy can be sent to{" "}
              <Link
                href="mailto:support@dokkit.co.za"
                className="font-semibold text-[#005f73] underline underline-offset-4"
              >
                support@dokkit.co.za
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </section>
  );
}
