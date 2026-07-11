import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { fail } from "../utils/apiResponse";

/**
 * Requires a valid `Authorization: Bearer <token>` header.
 * Populates req.user with { userId, username }.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return fail(res, "Authentication required.", 401);
  }

  const token = header.slice("Bearer ".length);

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch {
    return fail(res, "Invalid or expired session. Please sign in again.", 401);
  }
}

/**
 * Attaches req.user if a valid token is present, but does not
 * reject the request otherwise. Useful for endpoints like the
 * shared-link view, which behaves differently for logged-in owners.
 */
export function attachUserIfPresent(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      req.user = verifyAccessToken(header.slice("Bearer ".length));
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}
