import { Resend } from "resend";

// Falls back to console.log when RESEND_API_KEY is missing (dev/test environments)
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function sendInterestNotification({
  toEmail,
  startupName,
  investorName,
  investorFirm,
  message,
}: {
  toEmail: string;
  startupName: string;
  investorName: string;
  investorFirm: string | null;
  message: string | null;
}) {
  if (!resend) {
    console.log("[Email] Would send interest notification to:", toEmail);
    return;
  }

  try {
    await resend.emails.send({
      from: "VultureX <notifications@vulturex.com>",
      to: toEmail,
      subject: `${investorName} is interested in ${startupName}`,
      html: `
      <h2>Great news! An investor wants to connect.</h2>
      <p><strong>${investorName}</strong>${investorFirm ? ` from ${investorFirm}` : ""} has expressed interest in ${startupName}.</p>
      ${message ? `<p><em>"${message}"</em></p>` : ""}
      <p>Log in to VultureX to view their profile and respond.</p>
    `,
    });
  } catch (err) {
    throw new Error(
      `Failed to send interest notification to "${toEmail}" for startup "${startupName}": ${err instanceof Error ? err.message : "unknown email error"}`,
    );
  }
}
