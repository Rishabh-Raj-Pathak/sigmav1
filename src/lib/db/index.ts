import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { initializeSchema } from "./schema";

let _db: Database.Database | null = null;

function isVercelRuntime() {
  return (
    process.env.VERCEL === "1" ||
    process.env.VERCEL_ENV != null ||
    process.env.NOW_REGION != null
  );
}

function resolveDatabasePath(dbPath: string) {
  // On Vercel, the deployment filesystem (e.g. /var/task) is read-only.
  // Only /tmp is writable at runtime, so we store the SQLite DB there.
  if (isVercelRuntime()) {
    // If the user explicitly provided an absolute path, respect it.
    if (path.isAbsolute(dbPath)) return dbPath;

    // If they provided a relative path, rewrite it into /tmp to stay writable.
    const fileName = path.basename(dbPath) || "sigmav.db";
    return path.join("/tmp", fileName);
  }

  // Local/dev: resolve relative paths from the project root (cwd).
  return path.resolve(process.cwd(), dbPath);
}

export function getDb(): Database.Database {
  if (_db) return _db;

  const configuredPath = process.env.DATABASE_PATH;
  const dbPath =
    configuredPath || (isVercelRuntime() ? "/tmp/sigmav.db" : "./data/sigmav.db");

  let fullPath = resolveDatabasePath(dbPath);
  try {
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch {
    // Last-resort fallback for locked-down runtimes.
    fullPath = path.join("/tmp", path.basename(dbPath) || "sigmav.db");
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }

  _db = new Database(fullPath, { timeout: 10000 });
  _db.pragma("journal_mode = WAL");
  _db.pragma("synchronous = NORMAL");
  _db.pragma("cache_size = -64000");
  _db.pragma("foreign_keys = ON");
  _db.pragma("busy_timeout = 5000");

  initializeSchema(_db);
  return _db;
}
