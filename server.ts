import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import fs from "fs";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("database.db");

// Initialize database
const schema = fs.readFileSync("schema.sql", "utf8");
db.exec(schema);

// Add notes column to leads if it doesn't exist
try {
  db.exec("ALTER TABLE leads ADD COLUMN notes TEXT");
} catch (e) {
  // Column might already exist
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    try {
      const user = db.prepare("SELECT * FROM users WHERE email = ? AND password = ?").get(email, password);
      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      } else {
        res.status(401).json({ error: "Invalid credentials" });
      }
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/users", (req, res) => {
    try {
      const results = db.prepare("SELECT id, email, name, role FROM users").all();
      res.json(results);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/users", (req, res) => {
    const { email, password, name, role } = req.body;
    const id = randomUUID();
    try {
      db.prepare("INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)")
        .run(id, email, password, name, role || 'sales');
      res.status(201).json({ id, email, name, role });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/leads", (req, res) => {
    try {
      const results = db.prepare("SELECT * FROM leads ORDER BY created_at DESC").all();
      res.json(results);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/leads", (req, res) => {
    const { first_name, last_name, email, company, status, score, notes } = req.body;
    const id = randomUUID();
    try {
      db.prepare("INSERT INTO leads (id, first_name, last_name, email, company, status, score, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
        .run(id, first_name, last_name, email, company, status || 'lead', score || 0, notes || '');
      res.status(201).json({ id, first_name, last_name, email, company, status, score, notes });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.patch("/api/leads", (req, res) => {
    const { id, notes } = req.body;
    try {
      if (notes !== undefined) {
        db.prepare("UPDATE leads SET notes = ? WHERE id = ?").run(notes, id);
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/deals", (req, res) => {
    try {
      const results = db.prepare("SELECT * FROM deals ORDER BY updated_at DESC").all();
      res.json(results);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/deals", (req, res) => {
    const { lead_id, title, value, stage } = req.body;
    const id = randomUUID();
    try {
      db.prepare("INSERT INTO deals (id, lead_id, title, value, stage) VALUES (?, ?, ?, ?, ?)")
        .run(id, lead_id, title, value || 0, stage || 'discovery');
      res.status(201).json({ id, lead_id, title, value, stage });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.patch("/api/deals", (req, res) => {
    const { id, stage, value } = req.body;
    try {
      if (stage && value !== undefined) {
        db.prepare("UPDATE deals SET stage = ?, value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
          .run(stage, value, id);
      } else if (stage) {
        db.prepare("UPDATE deals SET stage = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
          .run(stage, id);
      } else if (value !== undefined) {
        db.prepare("UPDATE deals SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
          .run(value, id);
      }
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/tasks", (req, res) => {
    try {
      const results = db.prepare("SELECT * FROM tasks ORDER BY created_at DESC").all();
      res.json(results);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/tasks", (req, res) => {
    const { title, status, priority, due_date } = req.body;
    const id = randomUUID();
    try {
      db.prepare("INSERT INTO tasks (id, title, status, priority, due_date) VALUES (?, ?, ?, ?, ?)")
        .run(id, title, status || 'todo', priority || 'medium', due_date);
      res.status(201).json({ id, title, status });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.patch("/api/tasks", (req, res) => {
    const { id, status } = req.body;
    try {
      db.prepare("UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .run(status, id);
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/stats", (req, res) => {
    try {
      const leadsCount = db.prepare("SELECT COUNT(*) as count FROM leads").get().count;
      const pipelineValue = db.prepare("SELECT SUM(value) as sum FROM deals").get().sum || 0;
      const pendingTasks = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status != 'done'").get().count;
      res.json({
        leads: leadsCount,
        pipelineValue: pipelineValue,
        pendingTasks: pendingTasks
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
