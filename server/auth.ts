import { type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { storage } from "./storage";

const SALT_ROUNDS = 12;
const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
const COOKIE_NAME = "auth_token";

type AuthUser = Awaited<ReturnType<typeof storage.getUser>>;

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      userId?: string;
    }
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function getCookieOptions(isProduction: boolean) {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax" as const,
    maxAge: SESSION_TTL,
    path: "/",
  };
}

export async function createUserSession(userId: string, res: Response): Promise<string> {
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL);
  
  await storage.createSession({
    userId,
    token: tokenHash,
    expiresAt,
  });
  
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie(COOKIE_NAME, token, getCookieOptions(isProduction));
  
  return token;
}

export async function destroySession(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    const tokenHash = hashToken(token);
    await storage.deleteSession(tokenHash);
  }
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  
  if (!token) {
    return next();
  }
  
  try {
    const tokenHash = hashToken(token);
    const session = await storage.getSessionByToken(tokenHash);
    
    if (!session) {
      res.clearCookie(COOKIE_NAME, { path: "/" });
      return next();
    }
    
    const user = await storage.getUser(session.userId);
    
    if (!user) {
      await storage.deleteSession(tokenHash);
      res.clearCookie(COOKIE_NAME, { path: "/" });
      return next();
    }
    
    req.user = user;
    req.userId = user.id;
    next();
  } catch (error) {
    console.error("[AUTH] Error validating session:", error);
    next();
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }
  next();
}
