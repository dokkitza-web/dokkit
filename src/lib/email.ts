import { getEmailEnv } from "@/lib/env";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type ResendResponse = {
  id?: string;
  message?: string;
};

export async function sendEmail(input: SendEmailInput) {
  const env = getEmailEnv();
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.resendFromEmail,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });
  const result = (await response.json().catch(() => ({}))) as ResendResponse;

  if (!response.ok) {
    throw new Error(result.message || "Resend email request failed.");
  }

  return result.id || null;
}
