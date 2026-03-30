import mysql from 'mysql2/promise';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let pool = null;
let sqlite = null;
let dbType = 'mysql';

async function initDB() {
  // Try MySQL first
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'fcth',
      port: parseInt(process.env.DB_PORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      charset: 'utf8mb4'
    });
    // Test connection
    const conn = await pool.getConnection();
    conn.release();
    dbType = 'mysql';
    console.log('[DB] MySQL connected successfully');
    return;
  } catch (err) {
    console.log('[DB] MySQL unavailable:', err.message);
    console.log('[DB] Falling back to SQLite...');
    pool = null;
  }

  // Fallback to SQLite
  const dbPath = path.join(__dirname, '..', 'db', 'fcth.sqlite');
  sqlite = new Database(dbPath);
  sqlite.pragma('journal_mode = WAL');
  sqlite.pragma('foreign_keys = ON');
  dbType = 'sqlite';
  console.log('[DB] SQLite connected at', dbPath);
}

async function query(sql, params = []) {
  if (dbType === 'mysql' && pool) {
    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  if (dbType === 'sqlite' && sqlite) {
    // Convert MySQL-style ? placeholders — SQLite uses the same
    // Handle INSERT/UPDATE/DELETE vs SELECT
    const trimmed = sql.trim().toUpperCase();
    if (trimmed.startsWith('SELECT') || trimmed.startsWith('SHOW') || trimmed.startsWith('DESCRIBE')) {
      return sqlite.prepare(sql).all(...params);
    } else {
      const result = sqlite.prepare(sql).run(...params);
      return { insertId: result.lastInsertRowid, affectedRows: result.changes };
    }
  }

  throw new Error('No database connection available');
}

function getType() {
  return dbType;
}

function getSqlite() {
  return sqlite;
}

function getPool() {
  return pool;
}

export { initDB, query, getType, getSqlite, getPool };
