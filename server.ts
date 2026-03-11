import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const dbFile = "crm.db";
const db = new Database(dbFile);
const JWT_SECRET = "edge-crm-secret-key-12345"; // In production, use process.env.JWT_SECRET

// Initialize DB if empty
const schema = fs.readFileSync("schema.sql", "utf8");
db.exec(schema);

// Migration: Ensure password_hash column exists
try {
  db.prepare("SELECT password_hash FROM users LIMIT 1").get();
} catch (e) {
  console.log("Adding password_hash column to users table...");
  db.prepare("ALTER TABLE users ADD COLUMN password_hash TEXT").run();
}

// Seed Super Admin
const seedSuperAdmin = () => {
  const email = "ifbmarketing888@gmail.com";
  const password = "Ifb@888!";
  const hash = bcrypt.hashSync(password, 10);
  const existing = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
  
  if (!existing) {
    db.prepare("INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)")
      .run(Math.random().toString(36).substring(7), email, hash, "Super Admin", "super_admin");
    console.log("Super Admin created successfully.");
  } else {
    // Force update password and role to ensure access
    db.prepare("UPDATE users SET password_hash = ?, role = 'super_admin' WHERE email = ?")
      .run(hash, email);
    console.log("Super Admin credentials verified/updated.");
  }
};
seedSuperAdmin();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (e) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== "super_admin" && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    next();
  };

  // Auth Routes
  app.post("/api/login", (req, res) => {
    const { email, password } = req.body;
    console.log(`Login attempt for: ${email}`);
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user) {
      console.log(`User not found: ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      console.log(`Password mismatch for: ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    console.log(`Login successful for: ${email}`);
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: "24h" });
    res.cookie("token", token, { httpOnly: true, sameSite: "strict" });
    res.json({ id: user.id, email: user.email, role: user.role, name: user.name });
  });

  app.post("/api/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true });
  });

  app.get("/api/me", authenticate, (req: any, res) => {
    res.json(req.user);
  });

  // User Management (Admin only)
  app.get("/api/admin/users", authenticate, isAdmin, (req: any, res) => {
    const users = db.prepare("SELECT id, email, name, role, created_at FROM users").all();
    res.json(users);
  });

  app.post("/api/admin/users", authenticate, isAdmin, (req: any, res) => {
    const { email, password, name, role } = req.body;
    const hash = bcrypt.hashSync(password, 10);
    try {
      db.prepare("INSERT INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)")
        .run(crypto.randomUUID(), email, hash, name, role);
      res.json({ success: true });
    } catch (e) {
      res.status(400).json({ error: "User already exists" });
    }
  });

  // CRM API Routes
  app.get("/api/stats", authenticate, (req: any, res) => {
    const leadCount = db.prepare("SELECT COUNT(*) as count FROM customers WHERE status = 'lead'").get() as any;
    const dealValue = db.prepare("SELECT SUM(value) as total FROM deals WHERE stage != 'closed_lost'").get() as any;
    const taskCount = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status != 'done'").get() as any;
    
    res.json({
      leads: leadCount.count,
      pipelineValue: dealValue.total || 0,
      pendingTasks: taskCount.count
    });
  });

  app.get("/api/leads", authenticate, (req: any, res) => {
    const leads = db.prepare("SELECT * FROM customers ORDER BY created_at DESC LIMIT 50").all();
    res.json(leads);
  });

  app.get("/api/deals", authenticate, (req: any, res) => {
    const deals = db.prepare(`
      SELECT d.*, c.first_name, c.last_name, c.company 
      FROM deals d 
      JOIN customers c ON d.customer_id = c.id 
      ORDER BY d.updated_at DESC
    `).all();
    res.json(deals);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EdgeCRM running at http://localhost:${PORT}`);
  });
}

startServer();
