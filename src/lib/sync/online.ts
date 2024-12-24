import { supabase } from '../db'
import { SyncChange, SyncConflict, SyncError, SyncOptions, SyncResult } from './types'

export async function pushChanges<T>(changes: SyncChange<T>[]): Promise<SyncResult<T>[]> {
  const BATCH_SIZE = 50
  const results: SyncResult<T>[] = []
  
  try {
    // Process in batches
    for (let i = 0; i < changes.length; i += BATCH_SIZE) {
      const batch = changes.slice(i, i + BATCH_SIZE)
      const batchPromises = batch.map(async (change) => {
        try {
          const { data, error } = await supabase
            .from(change.table_name)
            .upsert(change.data)
          
          return {
            success: !error,
            data: data?.[0] as T,
            error: error ? new SyncError('PUSH_FAILED', 'upsert', error, change.table_name) : undefined
          }
        } catch (err) {
          return {
            success: false,
            error: new SyncError('PUSH_ERROR', 'upsert', err, change.table_name)
          }
        }
      })
      
      results.push(...(await Promise.all(batchPromises)))
    }
    
    return results
  } catch (err) {
    throw new SyncError('BATCH_PUSH_FAILED', 'pushChanges', err)
  }
}

export async function pullChanges<T>(
  tableName: string,
  lastSync: string
): Promise<SyncResult<T[]>> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .gt('updated_at', lastSync)

    if (error) {
      return {
        success: false,
        error: new SyncError('PULL_FAILED', 'select', error, tableName)
      }
    }

    return {
      success: true,
      data: data as T[]
    }
  } catch (err) {
    return {
      success: false,
      error: new SyncError('PULL_ERROR', 'select', err, tableName)
    }
  }
}

export async function resolveConflict<T>(
  conflict: SyncConflict,
  resolution: 'LOCAL' | 'REMOTE'
): Promise<SyncResult<T>> {
  try {
    const data = resolution === 'LOCAL' 
      ? JSON.parse(conflict.local_data)
      : JSON.parse(conflict.remote_data)

    const { data: result, error } = await supabase
      .from(conflict.table_name)
      .upsert(data)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: new SyncError('RESOLVE_FAILED', 'upsert', error, conflict.table_name)
      }
    }

    return {
      success: true,
      data: result as T
    }
  } catch (err) {
    return {
      success: false,
      error: new SyncError('RESOLVE_ERROR', 'resolveConflict', err)
    }
  }
}

export async function syncTable<T>(
  tableName: string,
  options: SyncOptions = {}
): Promise<SyncResult<T[]>> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(options.batchSize || 100)

    if (error) {
      return {
        success: false,
        error: new SyncError('SYNC_TABLE_FAILED', 'select', error, tableName)
      }
    }

    return {
      success: true,
      data: data as T[]
    }
  } catch (err) {
    return {
      success: false,
      error: new SyncError('SYNC_TABLE_ERROR', 'syncTable', err, tableName)
    }
  }
} 