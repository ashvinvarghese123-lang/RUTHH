import nodemailer from "nodemailer";
import { env } from "../config/env";
import { logger } from "../utils/logger";

const transporter = nodemailer.createTransport({
  host: env.smtp.host,
  port: env.smtp.port,
  secure: env.smtp.port === 465,
  auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined,
});

async function send(to: string, subject: string, html: string) {
  if (!env.smtp.host) {
    // No SMTP configured (e.g. local dev) — log instead of throwing so the
    // rest of the flow (signup, share invites, etc.) still completes.
    logger.warn(`[email:skip] SMTP not configured. Would have sent "${subject}" to ${to}`);
    return;
  }
  await transporter.sendMail({ from: env.smtp.from, to, subject, html });
}

export const emailService = {
  async sendVerificationEmail(to: string, token: string) {
    const link = `${env.clientUrl}/verify-email/${token}`;
    await send(
      to,
      "Verify your Ruth account",
      `<p>Welcome to Ruth — Document Yourself.</p>
       <p>Please confirm your email address to start journaling:</p>
       <p><a href="${link}">${link}</a></p>`
    );
  },

  async sendPasswordResetEmail(to: string, token: string) {
    const link = `${env.clientUrl}/reset-password/${token}`;
    await send(
      to,
      "Reset your Ruth password",
      `<p>We received a request to reset your password.</p>
       <p><a href="${link}">${link}</a></p>
       <p>If you didn't request this, you can safely ignore this email.</p>`
    );
  },

  async sendShareNotification(to: string, ownerDisplayName: string, entryTitle: string) {
    await send(
      to,
      `${ownerDisplayName} shared a journal page with you`,
      `<p>${ownerDisplayName} shared "${entryTitle}" with you on Ruth.</p>
       <p><a href="${env.clientUrl}/home">Open Ruth</a></p>`
    );
  },
};
