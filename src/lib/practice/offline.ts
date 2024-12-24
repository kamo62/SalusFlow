import { getSQLite } from '../db'
import { Practice, SQLitePractice } from './types'

function fromSQLite(raw: SQLitePractice): Practice {
  return {
    id: raw.id,
    name: raw.name,
    practiceNumber: raw.practice_number,
    address: raw.address,
    phone: raw.phone,
    email: raw.email,
    settings: JSON.parse(raw.settings)
  }
}

export function getPractices(): Practice[] {
  const db = getSQLite()
  if (!db) {
    throw new Error('SQLite database not initialized')
  }

  const practices = db.prepare(`
    SELECT 
      id,
      name,
      practice_number,
      address,
      phone,
      email,
      settings
    FROM practices
  `).all() as SQLitePractice[]

  return practices.map(fromSQLite)
}

export function getPracticeById(id: string): Practice {
  const db = getSQLite()
  if (!db) {
    throw new Error('SQLite database not initialized')
  }

  const practice = db.prepare(`
    SELECT 
      id,
      name,
      practice_number,
      address,
      phone,
      email,
      settings
    FROM practices
    WHERE id = ?
  `).get(id) as SQLitePractice

  if (!practice) {
    throw new Error('Practice not found')
  }

  return fromSQLite(practice)
}

export function savePractice(practice: Practice): void {
  const db = getSQLite()
  if (!db) {
    throw new Error('SQLite database not initialized')
  }

  const sqlitePractice = {
    id: practice.id,
    name: practice.name,
    practice_number: practice.practiceNumber,
    address: practice.address,
    phone: practice.phone,
    email: practice.email,
    settings: JSON.stringify(practice.settings)
  }

  db.prepare(`
    INSERT OR REPLACE INTO practices (
      id,
      name,
      practice_number,
      address,
      phone,
      email,
      settings
    ) VALUES (
      @id,
      @name,
      @practice_number,
      @address,
      @phone,
      @email,
      @settings
    )
  `).run(sqlitePractice)
}

export function deletePractice(id: string): void {
  const db = getSQLite()
  if (!db) {
    throw new Error('SQLite database not initialized')
  }

  db.prepare('DELETE FROM practices WHERE id = ?').run(id)
} 