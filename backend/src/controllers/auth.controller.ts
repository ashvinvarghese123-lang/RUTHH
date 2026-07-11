import { Request, Response } from "express";
import { prisma } from "../config/db";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError, ok } from "../utils/apiResponse";
import { hashPassword, comparePassword } from "../utils/password";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { generateToken, expiryFromNow } from "../services/token.service";
import { emailService } from "../services/email.service";

const REFRESH_COOKIE = "ruth_refresh_token";
const isProd = process.env.NODE_ENV === "production";
const REFRESH_COOKIE_OPTS = {
  httpOnly: true,
  secure: isProd, // required whenever sameSite is "none"
  sameSite: (isProd ? "none" : "lax") as "none" | "lax",
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { email, username, password, displayName } = req.body;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    throw new ApiError(409, existing.email === email ? "That email is already registered." : "That username is taken.");
  }

  const passwordHash = await hashPassword(password);
  const emailVerifyToken = generateToken();

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      emailVerifyToken,
      emailVerifyExpiry: expiryFromNow(48),
      profile: { create: { displayName } },
      settings: { create: {} },
    },
    include: { profile: true },
  });

  await emailService.sendVerificationEmail(email, emailVerifyToken);

  const accessToken = signAccessToken({ userId: user.id, username: user.username });
  const refreshToken = signRefreshToken({ userId: user.id });
  await createSession(user.id, refreshToken, req);

  res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTS);
  return ok(res, { user: publicUser(user), accessToken }, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { identifier, password } = req.body;

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
    include: { profile: true },
  });

  if (!user || !(await comparePassword(password, user.passwordHash))) {
    throw new ApiError(401, "Incorrect email/username or password.");
  }

  const accessToken = signAccessToken({ userId: user.id, username: user.username });
  const refreshToken = signRefreshToken({ userId: user.id });
  await createSession(user.id, refreshToken, req);

  res.cookie(REFRESH_COOKIE, refreshToken, REFRESH_COOKIE_OPTS);
  return ok(res, { user: publicUser(user), accessToken });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (!token) throw new ApiError(401, "No active session.");

  let payload: { userId: string };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, "Session expired. Please sign in again.");
  }

  const session = await prisma.session.findUnique({ where: { refreshToken: token } });
  if (!session || session.expiresAt < new Date()) {
    throw new ApiError(401, "Session expired. Please sign in again.");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new ApiError(401, "Account no longer exists.");

  const accessToken = signAccessToken({ userId: user.id, username: user.username });
  return ok(res, { accessToken });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (token) {
    await prisma.session.deleteMany({ where: { refreshToken: token } });
  }
  res.clearCookie(REFRESH_COOKIE);
  return ok(res, { loggedOut: true });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;

  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token, emailVerifyExpiry: { gt: new Date() } },
  });
  if (!user) throw new ApiError(400, "This verification link is invalid or has expired.");

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, emailVerifyToken: null, emailVerifyExpiry: null },
  });

  return ok(res, { verified: true });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  // Always respond success to avoid leaking which emails are registered.
  if (user) {
    const resetToken = generateToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry: expiryFromNow(1) },
    });
    await emailService.sendPasswordResetEmail(email, resetToken);
  }

  return ok(res, { message: "If that email is registered, a reset link has been sent." });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
  });
  if (!user) throw new ApiError(400, "This reset link is invalid or has expired.");

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, resetToken: null, resetTokenExpiry: null },
  });

  // Invalidate all existing sessions on password change
  await prisma.session.deleteMany({ where: { userId: user.id } });

  return ok(res, { reset: true });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    include: { profile: true },
  });
  if (!user) throw new ApiError(404, "Account not found.");
  return ok(res, { user: publicUser(user) });
});

// ------------------------------------------------------------
// helpers
// ------------------------------------------------------------

async function createSession(userId: string, refreshToken: string, req: Request) {
  await prisma.session.create({
    data: {
      userId,
      refreshToken,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      expiresAt: expiryFromNow(24 * 30),
    },
  });
}

function publicUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    isEmailVerified: user.isEmailVerified,
    profile: user.profile,
  };
}
