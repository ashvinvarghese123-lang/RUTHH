import crypto from "crypto";

/** Generates a URL-safe random token, e.g. for email verification / reset / share links. */
export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function expiryFromNow(hours: number): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}
