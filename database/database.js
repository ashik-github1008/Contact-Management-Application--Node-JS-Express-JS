const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// Ensure 'database' folder exists
const databaseFolder = path.join(__dirname);
if (!fs.existsSync(databaseFolder)) {
    fs.mkdirSync(databaseFolder, { recursive: true });
}

// Set database file path
const dbPath = path.join(__dirname, "contacts.db");

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Error opening database:", err.message);
  } else {
    console.log("✅ Connected to SQLite database.");
    db.run(`
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        phone TEXT NOT NULL UNIQUE,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `, (tableErr) => {
      if (tableErr) {
        console.error("❌ Error creating contacts table:", tableErr.message);
      } else {
        console.log("✅ Contacts table is ready.");
      }
    });
  }
});

module.exports = db;
