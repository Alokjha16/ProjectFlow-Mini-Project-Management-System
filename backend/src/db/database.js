const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../database.sqlite');

let db = null;
let saveTimer = null;

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }, 500);
}

async function getDB() {
  if (db) return db;
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }
  db.run(`PRAGMA foreign_keys = ON;`);
  db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT (datetime('now'))
  );`);
  db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo',
    priority TEXT NOT NULL DEFAULT 'medium',
    due_date DATE,
    created_at DATETIME DEFAULT (datetime('now')),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );`);
  scheduleSave();
  return db;
}

function dbRun(sql, params = []) {
  db.run(sql, params);
  scheduleSave();
  const meta = db.exec("SELECT last_insert_rowid() as id, changes() as ch");
  const row = meta[0].values[0];
  return { lastInsertRowid: row[0], changes: row[1] };
}

function dbGet(sql, params = []) {
  const res = db.exec(sql, params);
  if (!res.length || !res[0].values.length) return null;
  const { columns, values } = res[0];
  return Object.fromEntries(columns.map((c, i) => [c, values[0][i]]));
}

function dbAll(sql, params = []) {
  const res = db.exec(sql, params);
  if (!res.length) return [];
  const { columns, values } = res[0];
  return values.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
}

module.exports = { getDB, dbRun, dbGet, dbAll };
