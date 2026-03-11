import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbFile = "crm.db";
const db = new Database(dbFile);

// Initialize DB if empty
const schema = fs.readFileSync("schema.sql", "utf8");
db.exec(schema);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/stats", (req, res) => {
    const leadCount = db.prepare("SELECT COUNT(*) as count FROM customers WHERE status = 'lead'").get() as any;
    const dealValue = db.prepare("SELECT SUM(value) as total FROM deals WHERE stage != 'closed_lost'").get() as any;
    const taskCount = db.prepare("SELECT COUNT(*) as count FROM tasks WHERE status != 'done'").get() as any;
    
    res.json({
      leads: leadCount.count,
      pipelineValue: dealValue.total || 0,
      pendingTasks: taskCount.count
    });
  });

  app.get("/api/leads", (req, res) => {
    const leads = db.prepare("SELECT * FROM customers ORDER BY created_at DESC LIMIT 50").all();
    res.json(leads);
  });

  app.get("/api/deals", (req, res) => {
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
