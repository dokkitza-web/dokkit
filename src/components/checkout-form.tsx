"use client";

import { FormEvent, useState } from "react";

type CheckoutFormProps = {
  productSlug: string;
  productName: string;
  priceLabel: string;
};

type CheckoutResponse = {
  orderNumber: string;
  paymentUrl: string;
  fields: Record<string, string>;
  error?: string;
};

function submitToPayfast(paymentUrl: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = paymentUrl;
  form.style.display = "none";

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

export function CheckoutForm({
  productSlug,
  productName,
  priceLabel,
}: CheckoutFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productSlug,
          fullName,
          email,
          phone,
        }),
      });
      const result = (await response.json()) as CheckoutResponse;

      if (!response.ok) {
        throw new Error(result.error || "Checkout could not be started.");
      }

      submitToPayfast(result.paymentUrl, result.fields);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Checkout could not be started.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#eadfd4] bg-white p-6 shadow-sm"
    >
      <div className="rounded-lg bg-[#fbf8f5] p-4">
        <p className="text-xs font-bold uppercase text-[#f26a21]">
          Secure checkout
        </p>
        <h2 className="mt-2 text-2xl font-black text-[#111111]">
          {productName}
        </h2>
        <p className="mt-2 text-lg font-bold text-[#f26a21]">{priceLabel}</p>
      </div>

      <div className="mt-6 grid gap-4">
        <label className="grid gap-2 text-sm font-bold text-[#111111]">
          Full name
          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            className="rounded-md border border-[#d8d0c6] px-4 py-3 font-normal text-[#111111] outline-none transition focus:border-[#f26a21] focus:ring-2 focus:ring-[#f26a21]/20"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#111111]">
          Email address
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            maxLength={254}
            autoComplete="email"
            className="rounded-md border border-[#d8d0c6] px-4 py-3 font-normal text-[#111111] outline-none transition focus:border-[#f26a21] focus:ring-2 focus:ring-[#f26a21]/20"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold text-[#111111]">
          Phone or WhatsApp number optional
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            maxLength={40}
            autoComplete="tel"
            className="rounded-md border border-[#d8d0c6] px-4 py-3 font-normal text-[#111111] outline-none transition focus:border-[#f26a21] focus:ring-2 focus:ring-[#f26a21]/20"
          />
        </label>
      </div>

      {error ? (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-[#f26a21] px-5 py-3.5 text-sm font-black text-white transition hover:bg-[#d95816] disabled:cursor-not-allowed disabled:bg-[#d8d0c6]"
      >
        {isSubmitting ? "Redirecting to PayFast..." : "Continue to PayFast"}
      </button>

      <p className="mt-4 text-xs leading-5 text-[#6f6a64]">
        Your order will be created before you leave DokKit. Payment is completed
        securely through PayFast.
      </p>
    </form>
  );
}
