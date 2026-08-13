import { db } from '../db'
import type { MessageRow } from '../db'

export interface NewMessage {
  name: string
  email: string
  message: string
  ip?: string
  userAgent?: string
}

const insertStmt = db.prepare(
  `INSERT INTO messages (name, email, message, ip, user_agent)
   VALUES (@name, @email, @message, @ip, @userAgent)`,
)

const listStmt = db.prepare(
  `SELECT * FROM messages ORDER BY datetime(created_at) DESC, id DESC LIMIT ?`,
)

const markReadStmt = db.prepare(`UPDATE messages SET read = ? WHERE id = ?`)
const deleteStmt = db.prepare(`DELETE FROM messages WHERE id = ?`)
const unreadStmt = db.prepare(`SELECT COUNT(*) AS n FROM messages WHERE read = 0`)

export function saveMessage(input: NewMessage): number {
  const result = insertStmt.run({
    name: input.name,
    email: input.email,
    message: input.message,
    ip: input.ip ?? null,
    userAgent: input.userAgent ?? null,
  })
  return Number(result.lastInsertRowid)
}

export function listMessages(limit = 200): MessageRow[] {
  return listStmt.all(limit) as MessageRow[]
}

export function countUnread(): number {
  return (unreadStmt.get() as { n: number }).n
}

/** @returns whether a row actually matched, so the route can 404 honestly. */
export function setRead(id: number, read: boolean): boolean {
  return markReadStmt.run(read ? 1 : 0, id).changes > 0
}

export function deleteMessage(id: number): boolean {
  return deleteStmt.run(id).changes > 0
}
