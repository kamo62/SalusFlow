import { Database } from 'better-sqlite3'
import { getSQLite } from '../db'
import { 
  SyncChange, 
  SyncConflict, 
  SyncError, 
  SyncResult, 
  SyncStats, 
  SyncState,
  SyncedRecord 
} from './types'

export class SQLiteManager {
  private db: Database
  private state: SyncState = {
    status: 'idle',
    lastSync: null,
    pendingChanges: 0,
    conflicts: 0
  }

  constructor() {
    const db = getSQLite()
    if (!db) {
      throw new SyncError('DB_NOT_INITIALIZED', 'SQLiteManager.constructor')
    }
    this.db = db
    this.initTables()
  }

  private initTables(): void {
    try {
      this.db.transaction(() => {
        this.db.prepare(`
          CREATE TABLE IF NOT EXISTS sync_queue (
            id TEXT PRIMARY KEY,
            record_id TEXT NOT NULL,
            table_name TEXT NOT NULL,
            operation TEXT NOT NULL,
            data TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            synced BOOLEAN DEFAULT 0
          )
        `).run()

        this.db.prepare(`
          CREATE TABLE IF NOT EXISTS sync_conflicts (
            id TEXT PRIMARY KEY,
            sync_log_id TEXT NOT NULL,
            local_data TEXT NOT NULL,
            remote_data TEXT NOT NULL,
            resolution_type TEXT,
            resolution_data TEXT,
            resolved_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `).run()

        this.db.prepare(`
          CREATE TABLE IF NOT EXISTS sync_status (
            table_name TEXT PRIMARY KEY,
            last_sync DATETIME,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `).run()
      })()
    } catch (err) {
      throw new SyncError('INIT_TABLES_FAILED', 'initTables', err)
    }
  }

  async getUnsynced<T extends SyncedRecord>(): Promise<SyncChange<T>[]> {
    try {
      const changes = this.db.prepare(`
        SELECT * FROM sync_queue
        WHERE synced = 0
        ORDER BY created_at ASC
      `).all() as Array<Omit<SyncChange<T>, 'data'> & { data: string }>

      return changes.map(change => ({
        ...change,
        data: JSON.parse(change.data) as T
      }))
    } catch (err) {
      throw new SyncError('GET_UNSYNCED_FAILED', 'getUnsynced', err)
    }
  }

  async markAsSynced(changeId: string): Promise<void> {
    try {
      this.db.prepare(`
        UPDATE sync_queue
        SET synced = 1
        WHERE id = ?
      `).run(changeId)
    } catch (err) {
      throw new SyncError('MARK_SYNCED_FAILED', 'markAsSynced', err)
    }
  }

  async addConflict(conflict: Omit<SyncConflict, 'id' | 'created_at'>): Promise<void> {
    try {
      this.db.prepare(`
        INSERT INTO sync_conflicts (
          id,
          sync_log_id,
          local_data,
          remote_data,
          resolution_type,
          resolution_data
        ) VALUES (
          @id,
          @sync_log_id,
          @local_data,
          @remote_data,
          @resolution_type,
          @resolution_data
        )
      `).run({
        id: crypto.randomUUID(),
        ...conflict
      })

      this.state.conflicts++
    } catch (err) {
      throw new SyncError('ADD_CONFLICT_FAILED', 'addConflict', err)
    }
  }

  async getSyncStats(): Promise<SyncStats> {
    try {
      const pending = this.db.prepare(`
        SELECT COUNT(*) as count
        FROM sync_queue
        WHERE synced = 0
      `).get() as { count: number }

      const lastSync = this.db.prepare(`
        SELECT MAX(last_sync) as last_sync
        FROM sync_status
      `).get() as { last_sync: string | null }

      const conflicts = this.db.prepare(`
        SELECT COUNT(*) as count
        FROM sync_conflicts
        WHERE resolved_at IS NULL
      `).get() as { count: number }

      return {
        pendingChanges: pending.count,
        lastSync: lastSync.last_sync,
        conflicts: conflicts.count,
      }
    } catch (err) {
      throw new SyncError('GET_STATS_FAILED', 'getSyncStats', err)
    }
  }

  async queueChange<T extends SyncedRecord>(
    change: Omit<SyncChange<T>, 'id' | 'created_at' | 'synced'>
  ): Promise<void> {
    try {
      if (!this.validateChangeData(change)) {
        throw new SyncError('INVALID_CHANGE_DATA', 'queueChange', change)
      }

      this.db.prepare(`
        INSERT INTO sync_queue (
          id,
          record_id,
          table_name,
          operation,
          data
        ) VALUES (
          @id,
          @record_id,
          @table_name,
          @operation,
          @data
        )
      `).run({
        id: crypto.randomUUID(),
        ...change,
        data: JSON.stringify(change.data)
      })

      this.state.pendingChanges++
    } catch (err) {
      throw new SyncError('QUEUE_CHANGE_FAILED', 'queueChange', err)
    }
  }

  private validateChangeData<T extends SyncedRecord>(
    change: Omit<SyncChange<T>, 'id' | 'created_at' | 'synced'>
  ): boolean {
    return (
      change &&
      typeof change.record_id === 'string' &&
      typeof change.table_name === 'string' &&
      ['INSERT', 'UPDATE', 'DELETE'].includes(change.operation) &&
      change.data !== undefined &&
      typeof change.data.id === 'string'
    )
  }

  getState(): SyncState {
    return { ...this.state }
  }
} 