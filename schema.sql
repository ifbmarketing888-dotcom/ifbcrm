-- D1 Database Schema for EdgeCRM

-- Users & Permissions
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT,
    role TEXT DEFAULT 'user', -- 'super_admin', 'admin', 'sales', 'user'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Customers / Contacts
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    first_name TEXT,
    last_name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    company TEXT,
    source TEXT, -- 'web', 'referral', 'ads'
    status TEXT DEFAULT 'lead', -- 'lead', 'contact', 'customer'
    lead_score INTEGER DEFAULT 0,
    created_by TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Funnel / Deals
CREATE TABLE IF NOT EXISTS deals (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES customers(id),
    title TEXT NOT NULL,
    value REAL DEFAULT 0,
    stage TEXT DEFAULT 'discovery', -- 'discovery', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
    probability INTEGER DEFAULT 10,
    expected_close_date DATE,
    created_by TEXT REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATETIME,
    status TEXT DEFAULT 'todo', -- 'todo', 'in_progress', 'done'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    assigned_to TEXT REFERENCES users(id),
    created_by TEXT REFERENCES users(id),
    related_type TEXT, -- 'customer', 'deal'
    related_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#3b82f6'
);

-- Customer Tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS customer_tags (
    customer_id TEXT REFERENCES customers(id),
    tag_id TEXT REFERENCES tags(id),
    PRIMARY KEY (customer_id, tag_id)
);

-- Initial Data
INSERT OR IGNORE INTO tags (id, name, color) VALUES 
('1', 'High Value', '#ef4444'),
('2', 'Warm Lead', '#f59e0b'),
('3', 'Newsletter', '#10b981');
