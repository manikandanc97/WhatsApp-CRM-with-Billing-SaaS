import { db } from '@/db'
import { SyncAction } from '@/types/db'

const MAX_RETRIES = 3

async function pushToCloud(_action: SyncAction): Promise<void> {
  await new Promise((res) => setTimeout(res, 200 + Math.random() * 300))

  if (Math.random() < 0.05) {
    throw new Error('Simulated cloud sync error')
  }
}

async function markEntitySynced(entity: SyncAction['entity'], id: string) {
  if (entity === 'BILL') {
    await db.bills.update(id, { isSynced: true, updatedAt: new Date().toISOString() })
  }
}

export async function processSyncQueue(
  onProgress?: (synced: number, total: number) => void
): Promise<{ synced: number; failed: number }> {
  const pending = await db.syncQueue
    .where('status')
    .equals('PENDING')
    .sortBy('createdAt')

  if (pending.length === 0) return { synced: 0, failed: 0 }

  let synced = 0
  let failed = 0

  for (const action of pending) {
    try {
      await pushToCloud(action)
      
      await markEntitySynced(action.entity, action.entityId)
      
      await db.syncQueue.delete(action.id)
      synced++
    } catch (err) {
      const retryCount = (action.retryCount || 0) + 1
      if (retryCount >= MAX_RETRIES) {
        
        await db.syncQueue.update(action.id, {
          status: 'FAILED',
          retryCount,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
        failed++
      } else {
        
        await db.syncQueue.update(action.id, {
          retryCount,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }
    onProgress?.(synced, pending.length)
  }

  return { synced, failed }
}

export async function queueSyncAction(
  action: SyncAction['action'],
  entity: SyncAction['entity'],
  entityId: string,
  payload: any
): Promise<void> {
  const syncAction: SyncAction = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    entity,
    entityId,
    payload,
    status: 'PENDING',
    retryCount: 0,
    createdAt: new Date().toISOString(),
  }
  await db.syncQueue.add(syncAction)
}

export async function getPendingSyncCount(): Promise<number> {
  return db.syncQueue.where('status').equals('PENDING').count()
}
