import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { config } from './config'

mkdirSync(dirname(config.dbFile), { recursive: true })

export const db = new Database(config.dbFile)

// WAL survives an unclean container stop far better than the default journal,
// and lets the admin read while a submission is being written.
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    email      TEXT    NOT NULL,
    message    TEXT    NOT NULL,
    ip         TEXT,
    user_agent TEXT,
    read       INTEGER NOT NULL DEFAULT 0,
    created_at TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
`)

export interface MessageRow {
  id: number
  name: string
  email: string
  message: string
  ip: string | null
  user_agent: string | null
  read: number
  created_at: string
}
