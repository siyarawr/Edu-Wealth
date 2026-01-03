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
          const user = await storage.getUserByEmail(email.toLowerCase());
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }
          if (!user.password) {
            return done(null, false, { message: "Invalid email or password" });
          }
          const isValid = await verifyPassword(password, user.password);
          if (!isValid) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, { id: user.id, email: user.email || "" });
        } catch (error) {
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
      const { email, password, fullName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      
      const emailLower = email.toLowerCase();
      const existing = await storage.getUserByEmail(emailLower);
      if (existing) {
        return res.status(400).json({ error: "An account with this email already exists" });
      }
      
      const hashedPassword = await hashPassword(password);
      
      const user = await storage.createUser({
        email: emailLower,
        password: hashedPassword,
        username: emailLower,
      });
      
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
    passport.authenticate("local", (err: any, user: Express.User | false, info: { message: string }) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Authentication failed" });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      req.login(user, async (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to establish session" });
        }
        
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
