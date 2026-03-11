export async function onRequestGet(context) {
  const { env } = context;
  
  // 运行初始化 SQL
  const sql = `
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      company TEXT,
      status TEXT DEFAULT 'lead',
      score INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS deals (
      id TEXT PRIMARY KEY,
      lead_id TEXT,
      title TEXT NOT NULL,
      value REAL DEFAULT 0,
      stage TEXT DEFAULT 'discovery',
      probability INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id)
    );
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      status TEXT DEFAULT 'todo',
      priority TEXT DEFAULT 'medium',
      due_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    INSERT OR IGNORE INTO users (id, email, password, name, role) 
    VALUES ('admin-1', 'admin@example.com', 'admin123', 'Super Admin', 'admin');
    INSERT OR IGNORE INTO users (id, email, password, name, role) 
    VALUES ('sales-1', 'sales@example.com', 'sales123', 'Sales Rep', 'sales');
  `;

  await env.DB.exec(sql);

  return new Response(JSON.stringify({ status: "Database initialized successfully" }), {
    headers: { "Content-Type": "application/json" }
  });
}
