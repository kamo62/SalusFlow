export interface SyncedRecord {
  id: string;
  [key: string]: any;
}

export interface SyncChange<T = any> {
  table_name: string;
  record_id: string;
  data: T;
}

export interface SyncResult<T> {
  success: boolean;
  data?: T;
  error?: SyncError;
}

export interface SyncOptions {
  batchSize?: number;
  tables?: string[];
  lastSync?: string;
}

export interface SyncState {
  lastSync: string | null;
  inProgress: boolean;
  conflicts: number;
  error?: SyncError;
}

export interface SyncConflict {
  sync_log_id: string;
  table_name: string;
  record_id: string;
  local_data: string;
  remote_data: string;
  created_at: string;
  resolved_at?: string;
  resolution_type?: 'LOCAL' | 'REMOTE';
  resolution_data?: string;
}

export class SyncError extends Error {
  constructor(
    public code: string,
    public operation: string,
    public originalError?: any,
    public table?: string
  ) {
    super(`Sync error: ${code} during ${operation}${table ? ` on ${table}` : ''}`);
    this.name = "SyncError";
  }
}

export interface SyncStats {
  pendingChanges: number;
  lastSync: string | null;
  conflicts: number;
}
 