import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { initializeSchema } from './schema'

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db

  const dbPath = process.env.DATABASE_PATH || './data/sigmav.db'
  const fullPath = path.resolve(process.cwd(), dbPath)

  const dir = path.dirname(fullPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  _db = new Database(fullPath, { timeout: 10000 })
  _db.pragma('journal_mode = WAL')
  _db.pragma('synchronous = NORMAL')
  _db.pragma('cache_size = -64000')
  _db.pragma('foreign_keys = ON')
  _db.pragma('busy_timeout = 5000')

  initializeSchema(_db)
  return _db
}
