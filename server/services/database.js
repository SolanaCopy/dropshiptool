const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// Database path — gebruik DB_PATH env var voor Railway volume mount
const dbPath = process.env.DB_PATH || path.join(__dirname, "..", "dropship.db");

// Zorg dat de directory bestaat (voor Railway volume mounts)
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    plan TEXT DEFAULT 'starter',
    searchesToday INTEGER DEFAULT 0,
    lastSearchDate TEXT DEFAULT '',
    alertFrequency TEXT DEFAULT 'none',
    createdAt TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    productId TEXT NOT NULL,
    productName TEXT NOT NULL,
    productImage TEXT DEFAULT '',
    sellPrice REAL DEFAULT 0,
    supplierPrice REAL DEFAULT 0,
    source TEXT DEFAULT '',
    link TEXT DEFAULT '',
    category TEXT DEFAULT '',
    addedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id),
    UNIQUE(userId, productId)
  );

  CREATE TABLE IF NOT EXISTS search_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    query TEXT NOT NULL,
    resultCount INTEGER DEFAULT 0,
    searchedAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    email TEXT NOT NULL,
    frequency TEXT DEFAULT 'weekly',
    categories TEXT DEFAULT '',
    minScore INTEGER DEFAULT 50,
    active INTEGER DEFAULT 1,
    lastSentAt TEXT DEFAULT '',
    createdAt TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  -- Supplier searches column toevoegen als die niet bestaat
  -- SQLite heeft geen IF NOT EXISTS voor ALTER TABLE, dus via pragma
  CREATE INDEX IF NOT EXISTS idx_search_user ON search_history(userId);
  CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(userId);
  CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(userId);
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
`);

// Add supplierSearches column if it doesn't exist
try {
  db.exec("ALTER TABLE users ADD COLUMN supplierSearches INTEGER DEFAULT 0");
} catch (e) {
  // Column already exists
}

module.exports = db;
