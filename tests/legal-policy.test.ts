import assert from "node:assert/strict";
import test from "node:test";
import {
  POLICY_BUNDLE_VERSION,
  POLICY_EFFECTIVE_DATE,
  legalPolicies,
  policyLinks,
  supplierIdentity,
} from "../src/data/legal-policies";

test("approved policy bundle exposes all five required policy routes", () => {
  assert.equal(POLICY_BUNDLE_VERSION, "dokkit-legal-2026-07-27-v1.0");
  assert.equal(POLICY_EFFECTIVE_DATE, "27 July 2026");
  assert.deepEqual(
    legalPolicies.map((policy) => policy.path),
    ["/terms", "/licence", "/digital-delivery", "/refunds", "/privacy"],
  );
  assert.deepEqual(
    policyLinks.map((link) => link.href),
    [
      "/terms",
      "/licence",
      "/digital-delivery",
      "/refunds",
      "/privacy",
      "/contact",
    ],
  );
});

test("approved public policies contain no unresolved publication markers", () => {
  const publicCopy = legalPolicies
    .flatMap((policy) => [
      policy.title,
      policy.summary,
      ...policy.sections.flatMap((section) => [
        section.heading,
        ...section.paragraphs,
        ...(section.bullets ?? []),
      ]),
    ])
    .join("\n");

  assert.doesNotMatch(
    publicCopy,
    /(?:\bDRAFT:|\bCONFIRM:|\bTODO:|\[(?:DRAFT|CONFIRM|TODO))/i,
  );
  assert.doesNotMatch(publicCopy, /\[[A-Z][A-Z _-]+\]/);
});

test("supplier identity matches the approved control sheet", () => {
  assert.equal(supplierIdentity.legalOperator, "DokKit (Pty) Ltd");
  assert.equal(supplierIdentity.registrationNumber, "2026/470231/07");
  assert.equal(supplierIdentity.director, "Mr Elzano André Cox");
  assert.equal(supplierIdentity.supportEmail, "support@dokkit.co.za");
  assert.equal(supplierIdentity.privacyEmail, "elzano@dokkit.co.za");
  assert.match(supplierIdentity.vatStatus, /not registered for VAT/i);
});

test("delivery and refund promises use the approved operational values", () => {
  const copy = legalPolicies
    .flatMap((policy) => [
      policy.summary,
      ...policy.sections.flatMap((section) => section.paragraphs),
    ])
    .join(" ");

  assert.match(copy, /seven days/i);
  assert.match(copy, /five successful download attempts/i);
  assert.match(copy, /up to 12 months after purchase/i);
  assert.match(copy, /within two business days/i);
  assert.match(copy, /within five business days/i);
});
