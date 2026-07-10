"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export function AdminSettingsForm({
  currentEmail,
}: {
  currentEmail: string;
}) {
  const router = useRouter();
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    const cleanEmail = newEmail.trim().toLowerCase();
    const emailChanged = cleanEmail && cleanEmail !== currentEmail.toLowerCase();
    const passwordChanged = Boolean(newPassword);

    if (!emailChanged && !passwordChanged) {
      setError("Enter a new email address or new password to update.");
      return;
    }

    if (!currentPassword) {
      setError("Enter your current password before changing credentials.");
      return;
    }

    if (passwordChanged && newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (passwordChanged && newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createSupabaseBrowserClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: currentEmail,
      password: currentPassword,
    });

    if (signInError) {
      setIsSubmitting(false);
      setError("Current password could not be verified.");
      return;
    }

    const updates: { email?: string; password?: string } = {};

    if (emailChanged) {
      updates.email = cleanEmail;
    }

    if (passwordChanged) {
      updates.password = newPassword;
    }

    const { error: updateError } = await supabase.auth.updateUser(updates);
    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setNewEmail("");
    setMessage(
      emailChanged
        ? "Credential update submitted. Check the new email address for any confirmation email from Supabase."
        : "Password updated successfully.",
    );
    router.refresh();
  }

  return (
    <section className="rounded-[1.75rem] border border-black/10 bg-white p-6 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff6a00]">
        Update credentials
      </p>
      <h2 className="mt-3 text-2xl font-black">Change login details</h2>
      <p className="mt-2 text-sm leading-6 text-[#5f5f66]">
        Leave any field blank if you do not want to change it.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
        <label className="grid gap-2 text-sm font-bold text-[#111111]">
          New email address
          <input
            type="email"
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            autoComplete="email"
            placeholder={currentEmail}
            className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition placeholder:text-[#9b938b] focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold text-[#111111]">
          Current password
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            autoComplete="current-password"
            className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold text-[#111111]">
            New password
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
              className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
            />
          </label>

          <label className="grid gap-2 text-sm font-bold text-[#111111]">
            Confirm new password
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              className="rounded-2xl border border-[#cfc7bd] bg-white px-4 py-3 text-base outline-none transition focus:border-[#ff6a00] focus:ring-2 focus:ring-[#ffd8bd]"
            />
          </label>
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {message ? (
          <p className="rounded-2xl border border-[#ffd8bd] bg-[#fff4eb] px-4 py-3 text-sm font-bold text-[#d95400]">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-[#ff6a00] px-5 py-3 text-sm font-black text-white shadow-lg shadow-[#ff6a00]/20 transition hover:bg-[#d95400] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Updating..." : "Update credentials"}
        </button>
      </form>
    </section>
  );
}
