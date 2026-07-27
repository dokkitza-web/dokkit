import Link from "next/link";
import type { ReactNode } from "react";
import { CookieSettingsButton } from "@/components/cookie-settings-button";
import {
  POLICY_DISPLAY_VERSION,
  POLICY_EFFECTIVE_DATE,
  type LegalPolicy,
} from "@/data/legal-policies";

const linkPattern =
  /(https:\/\/inforegulator\.org\.za\/|https:\/\/dokkit\.co\.za|support@dokkit\.co\.za|elzano@dokkit\.co\.za|\/privacy)/g;

function renderLinkedText(text: string): ReactNode {
  return text.split(linkPattern).map((part, index) => {
    if (part === "support@dokkit.co.za" || part === "elzano@dokkit.co.za") {
      return (
        <Link
          key={`${part}-${index}`}
          href={`mailto:${part}`}
          className="font-semibold text-[#005f73] underline underline-offset-4"
        >
          {part}
        </Link>
      );
    }

    if (part === "/privacy") {
      return (
        <Link
          key={`${part}-${index}`}
          href={part}
          className="font-semibold text-[#005f73] underline underline-offset-4"
        >
          {part}
        </Link>
      );
    }

    if (part.startsWith("https://")) {
      return (
        <Link
          key={`${part}-${index}`}
          href={part}
          className="font-semibold text-[#005f73] underline underline-offset-4"
        >
          {part}
        </Link>
      );
    }

    return part;
  });
}

export function LegalPage({ policy }: { policy: LegalPolicy }) {
  return (
    <article className="legal-page bg-white">
      <header className="border-b border-black/10 bg-[#fff7f0]">
        <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8 lg:py-16">
          <p className="text-sm font-bold uppercase text-[#a63d00]">
            DokKit legal
          </p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-[#111111] sm:text-5xl">
            {policy.title}
          </h1>
          <p className="mt-4 text-sm font-semibold text-[#5f5f66]">
            Effective: {POLICY_EFFECTIVE_DATE} | Version:{" "}
            {POLICY_DISPLAY_VERSION}
          </p>
          <div className="mt-8 border-l-4 border-[#ff6a00] bg-white p-5">
            <p className="text-xs font-black uppercase text-[#a63d00]">
              {policy.summaryLabel}
            </p>
            <p className="mt-2 text-base leading-7 text-[#3f3f43]">
              {renderLinkedText(policy.summary)}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="legal-sections grid gap-10">
          {policy.sections.map((section, index) => (
            <section key={section.heading} aria-labelledby={`section-${index}`}>
              <h2
                id={`section-${index}`}
                className="text-2xl font-semibold leading-tight text-[#111111]"
              >
                {section.heading}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p
                  key={paragraph}
                  className="mt-3 text-base leading-7 text-[#3f3f43]"
                >
                  {renderLinkedText(paragraph)}
                </p>
              ))}
              {section.bullets?.length ? (
                <ul className="mt-4 list-disc space-y-2 pl-6 text-base leading-7 text-[#3f3f43]">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{renderLinkedText(bullet)}</li>
                  ))}
                </ul>
              ) : null}
              {policy.path === "/privacy" &&
              section.heading === "Your rights" ? (
                <CookieSettingsButton className="mt-5 rounded-md bg-[#005f73] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#004b5a] print:hidden" />
              ) : null}
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
