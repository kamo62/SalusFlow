import { 
  SyncError, 
  SyncOptions, 
  SyncResult, 
  SyncState, 
  SyncedRecord,
  SyncErrorDetails,
  SyncChange
} from './types'
import { pushChanges, pullChanges, resolveConflict, syncTable } from './online'
import { SQLiteManager } from './offline'

export * from './types'
export * from './online'
export { SQLiteManager } from './offline'

export class SyncOrchestrator {
  private sqlite: SQLiteManager
  
  constructor() {
    this.sqlite = new SQLiteManager()
  }
  
  async sync<T extends SyncedRecord>(options: SyncOptions = {}): Promise<SyncResult<T[]>> {
    const state = this.sqlite.getState()
    if (state.status === 'syncing') {
      throw new SyncError('SYNC_IN_PROGRESS', 'sync')
    }
    
    try {
      // Update state to syncing
      state.status = 'syncing'
      
      // 1. Push local changes
      const unsynced = await this.sqlite.getUnsynced<T>()
      const pushResults = await pushChanges(unsynced)
      
      // 2. Handle push results
      for (const result of pushResults) {
        if (result.success && result.data) {
          const syncedData = result.data as T
          await this.sqlite.markAsSynced(syncedData.id)
        } else if (result.error) {
          await this.handleSyncError(result.error)
        }
      }
      
      // 3. Pull remote changes
      const stats = await this.sqlite.getSyncStats()
      const lastSync = stats.lastSync
      const tables = options.tables || await this.getActiveTables()
      const pullResults: T[] = []
      
      for (const table of tables) {
        const result = await pullChanges<T>(table, lastSync!)
        if (result.success && result.data) {
          pullResults.push(...(Array.isArray(result.data) ? result.data : [result.data]))
        } else if (result.error) {
          await this.handleSyncError(result.error)
        }
      }
      
      // 4. Update sync state
      state.status = 'idle'
      state.lastSync = new Date()
      state.pendingChanges = (await this.sqlite.getUnsynced()).length
      
      return {
        success: true,
        data: pullResults
      }
      
    } catch (err) {
      state.status = 'error'
      state.error = err as SyncError
      throw err
    }
  }
  
  private async handleSyncError(error: SyncError): Promise<void> {
    // Log error
    console.error('Sync error:', error)
    
    // Add to conflicts if needed
    if (error.code === 'CONFLICT' && error.details) {
      const details = error.details as SyncErrorDetails
      await this.sqlite.addConflict({
        sync_log_id: `${error.table}:${details.id}`,
        local_data: JSON.stringify(details.local),
        remote_data: JSON.stringify(details.remote)
      })
    }
  }
  
  private async getActiveTables(): Promise<string[]> {
    // This could be expanded to dynamically discover tables or read from config
    return ['practices', 'users', 'settings']
  }
  
  async queueChange<T extends SyncedRecord>(
    change: Omit<SyncChange<T>, 'id' | 'created_at' | 'synced'>
  ): Promise<void> {
    await this.sqlite.queueChange(change)
  }
  
  getState(): SyncState {
    return this.sqlite.getState()
  }
} 