import * as brevo from "@getbrevo/brevo";

import env from "../lib/env";
import { getBrevo } from "../lib/brevo";

type SendTeamInvitationEmailParams = {
  to: string;
  teamName: string;
  teamCode: string;
  invitationToken: string;
};

export async function sendTeamInvitationEmail({
  to,
  teamName,
  teamCode,
  invitationToken,
}: SendTeamInvitationEmailParams): Promise<void> {
  const joinUrl = `${env.frontendUrl}/invite?token=${encodeURIComponent(invitationToken)}`;

  const email = new brevo.SendSmtpEmail();
  email.sender = { name: env.brevoFromName, email: env.brevoFromEmail };
  email.to = [{ email: to }];
  email.subject = `You've been invited to join ${teamName} on Sprintify`;
  email.htmlContent = `
    <div style="font-family: sans-serif; line-height: 1.6; color: #0f172a;">
      <h1 style="font-size: 20px; margin-bottom: 16px;">You're invited to ${teamName}</h1>
      <p>You have been invited to collaborate on Sprintify.</p>
      <p>
        <a href="${joinUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 9999px; font-weight: 600;">
          Accept invitation
        </a>
      </p>
      <p style="color: #64748b; font-size: 14px;">This invitation expires in 7 days.</p>
    </div>
  `;

  try {
    await getBrevo().sendTransacEmail(email);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";
    throw new Error(`Failed to send invitation email: ${message}`);
  }
}
