import { prisma, supabase, getSQLite } from '../db'
import { createHash } from 'crypto'

interface SyncOptions {
  force?: boolean
  tables?: string[]
  batchSize?: number
  onProgress?: (progress: number) => void
}

// Tables that need to be synced in order
const SYNC_TABLES = [
  'users',
  'doctors',
  'consultation_types',
  'doctor_consultation_fees',
  'patients',
  'appointments',
  'consultations',
  'medical_history',
]

// Calculate checksum for a record
const calculateChecksum = (data: any): string => {
  return createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex')
}

// Handle conflicts
const handleConflict = async (
  table: string,
  localData: any,
  remoteData: any,
  syncLogId: string
) => {
  const sqlite = getSQLite()

  // Default to keeping local version
  const resolution = {
    type: 'local',
    data: localData,
  }

  // Store conflict for later review
  sqlite.prepare(`
    INSERT INTO sync_conflicts (
      sync_log_id, local_data, remote_data, resolution_data
    ) VALUES (?, ?, ?, ?)
  `).run(
    syncLogId,
    JSON.stringify(localData),
    JSON.stringify(remoteData),
    JSON.stringify(resolution)
  )

  return resolution
}

// Sync a single table
const syncTable = async (
  table: string,
  options: SyncOptions = {}
): Promise<void> => {
  const sqlite = getSQLite()
  const { batchSize = 100 } = options

  // Get unsynced changes
  const unsynced = sqlite
    .prepare(`SELECT * FROM sync_log WHERE table_name = ? AND synced = 0`)
    .all(table)

  for (const change of unsynced) {
    try {
      // Get local record
      const localRecord = sqlite
        .prepare(`SELECT * FROM ${table} WHERE id = ?`)
        .get(change.record_id)

      // Get remote record
      const { data: remoteRecord } = await supabase
        .from(table)
        .select('*')
        .eq('id', change.record_id)
        .single()

      // Calculate checksums
      const localChecksum = calculateChecksum(localRecord)
      const remoteChecksum = remoteRecord ? calculateChecksum(remoteRecord) : null

      if (localChecksum !== remoteChecksum) {
        // Handle conflict
        const resolution = await handleConflict(
          table,
          localRecord,
          remoteRecord,
          change.id
        )

        // Update remote if keeping local version
        if (resolution.type === 'local') {
          await supabase
            .from(table)
            .upsert(resolution.data)
        }
      }

      // Mark as synced
      sqlite
        .prepare(`UPDATE sync_log SET synced = 1 WHERE id = ?`)
        .run(change.id)
    } catch (error) {
      console.error(`Sync failed for ${table}:`, error)
      throw error
    }
  }
}

// Main sync function
export const sync = async (options: SyncOptions = {}): Promise<void> => {
  const { force = false, tables = SYNC_TABLES } = options

  try {
    // Check if sync is needed
    if (!force) {
      const lastSync = getSQLite()
        .prepare(`SELECT MAX(created_at) as last_sync FROM sync_log WHERE synced = 1`)
        .get()

      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      if (lastSync.last_sync && new Date(lastSync.last_sync) > oneWeekAgo) {
        console.log('Sync not needed yet')
        return
      }
    }

    // Sync each table in order
    for (const table of tables) {
      await syncTable(table, options)
      options.onProgress?.(((tables.indexOf(table) + 1) / tables.length) * 100)
    }

    console.log('Sync completed successfully')
  } catch (error) {
    console.error('Sync failed:', error)
    throw error
  }
}

// Check if sync is needed
export const needsSync = async (): Promise<boolean> => {
  const sqlite = getSQLite()
  
  const unsynced = sqlite
    .prepare(`SELECT COUNT(*) as count FROM sync_log WHERE synced = 0`)
    .get()

  return unsynced.count > 0
}

// Get sync status
export const getSyncStatus = async () => {
  const sqlite = getSQLite()

  const status = {
    pendingChanges: 0,
    lastSync: null as string | null,
    conflicts: 0,
  }

  try {
    const pending = sqlite
      .prepare(`SELECT COUNT(*) as count FROM sync_log WHERE synced = 0`)
      .get()
    
    const lastSync = sqlite
      .prepare(`SELECT MAX(created_at) as last_sync FROM sync_log WHERE synced = 1`)
      .get()

    const conflicts = sqlite
      .prepare(`SELECT COUNT(*) as count FROM sync_conflicts WHERE resolved_at IS NULL`)
      .get()

    status.pendingChanges = pending.count
    status.lastSync = lastSync.last_sync
    status.conflicts = conflicts.count
  } catch (error) {
    console.error('Failed to get sync status:', error)
  }

  return status
}

// Resolve a conflict
export const resolveConflict = async (
  conflictId: string,
  resolution: 'local' | 'remote' | 'manual',
  manualData?: any
): Promise<void> => {
  const sqlite = getSQLite()

  try {
    const conflict = sqlite
      .prepare(`SELECT * FROM sync_conflicts WHERE id = ?`)
      .get(conflictId)

    const resolutionData = resolution === 'manual' ? manualData :
      resolution === 'local' ? JSON.parse(conflict.local_data) :
      JSON.parse(conflict.remote_data)

    // Update the record
    await supabase
      .from(conflict.table_name)
      .upsert(resolutionData)

    // Mark conflict as resolved
    sqlite.prepare(`
      UPDATE sync_conflicts 
      SET resolved_at = datetime('now'), 
          resolution_data = ?
      WHERE id = ?
    `).run(JSON.stringify(resolutionData), conflictId)

  } catch (error) {
    console.error('Failed to resolve conflict:', error)
    throw error
  }
} 