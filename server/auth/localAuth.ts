import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import bcrypt from "bcrypt";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "../storage";
import type { User } from "@shared/schema";

const SALT_ROUNDS = 10;

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
    }
  }
}

export function getSession(): RequestHandler {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  const isProduction = process.env.NODE_ENV === "production";
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: sessionTtl,
    },
  });
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          console.log("[PASSPORT] Looking up user:", email.toLowerCase());
          const user = await storage.getUserByEmail(email.toLowerCase());
          if (!user) {
            console.log("[PASSPORT] User not found");
            return done(null, false, { message: "Invalid email or password" });
          }
          console.log("[PASSPORT] User found:", user.id);
          if (!user.password) {
            console.log("[PASSPORT] User has no password set");
            return done(null, false, { message: "Invalid email or password" });
          }
          console.log("[PASSPORT] Verifying password");
          const isValid = await verifyPassword(password, user.password);
          console.log("[PASSPORT] Password valid:", isValid);
          if (!isValid) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, { id: user.id, email: user.email || "" });
        } catch (error) {
          console.error("[PASSPORT] Error:", error);
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user: Express.User, cb) => {
    cb(null, { id: user.id, email: user.email });
  });

  passport.deserializeUser(async (data: { id: string; email: string }, cb) => {
    try {
      cb(null, data);
    } catch (error) {
      cb(error);
    }
  });
}

export function registerAuthRoutes(app: Express) {
  app.post("/api/auth/signup", async (req, res) => {
    try {
      console.log("[SIGNUP] Starting signup process");
      const { email, password, fullName } = req.body;
      
      if (!email || !password) {
        console.log("[SIGNUP] Missing email or password");
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      if (password.length < 6) {
        console.log("[SIGNUP] Password too short");
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      
      const emailLower = email.toLowerCase();
      console.log("[SIGNUP] Checking for existing user:", emailLower);
      const existing = await storage.getUserByEmail(emailLower);
      if (existing) {
        console.log("[SIGNUP] User already exists");
        return res.status(400).json({ error: "An account with this email already exists" });
      }
      
      console.log("[SIGNUP] Hashing password");
      const hashedPassword = await hashPassword(password);
      console.log("[SIGNUP] Password hashed successfully");
      
      console.log("[SIGNUP] Creating user in database");
      const user = await storage.createUser({
        email: emailLower,
        password: hashedPassword,
        username: emailLower,
      });
      console.log("[SIGNUP] User created:", user.id);
      
      if (fullName) {
        await storage.updateUserProfile(user.id, { fullName });
      }
      
      req.login({ id: user.id, email: user.email || "" }, async (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to log in after signup" });
        }
        
        // Log signup event
        try {
          await storage.logUserEvent({
            userId: user.id,
            eventType: "signup",
            userEmail: user.email || undefined,
            userName: fullName || undefined,
          });
        } catch (e) {
          console.error("Failed to log signup event:", e);
        }
        
        res.json({ 
          id: user.id, 
          email: user.email,
          fullName: user.fullName,
        });
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    console.log("[LOGIN] Starting login process for:", req.body.email);
    passport.authenticate("local", (err: any, user: Express.User | false, info: { message: string }) => {
      if (err) {
        console.error("[LOGIN] Authentication error:", err);
        console.error("[LOGIN] Error stack:", err?.stack);
        return res.status(500).json({ error: "Authentication failed" });
      }
      if (!user) {
        console.log("[LOGIN] User not found or invalid credentials:", info?.message);
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      console.log("[LOGIN] User authenticated, establishing session:", user.id);
      req.login(user, async (err) => {
        if (err) {
          console.error("[LOGIN] Session error:", err);
          return res.status(500).json({ error: "Failed to establish session" });
        }
        console.log("[LOGIN] Session established successfully");
        
        // Log login event
        try {
          await storage.logUserEvent({
            userId: user.id,
            eventType: "login",
            userEmail: user.email || undefined,
          });
        } catch (e) {
          console.error("Failed to log login event:", e);
        }
        
        res.json({ id: user.id, email: user.email });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/user", async (req, res) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }
      res.json({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
        isOnboardingComplete: user.isOnboardingComplete,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
}

export function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  return res.status(401).json({ error: "Authentication required" });
}
