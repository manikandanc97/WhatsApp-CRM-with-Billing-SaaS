import { db } from '@/db'
import { SyncAction } from '@/types/db'

const MAX_RETRIES = 3

/**
 * Simulates a cloud API push. In production, replace with real fetch() calls.
 */
async function pushToCloud(action: SyncAction): Promise<void> {
  // Simulate network latency
  await new Promise((res) => setTimeout(res, 200 + Math.random() * 300))

  // Simulate occasional failure (5% chance) for realism
  if (Math.random() < 0.05) {
    throw new Error('Simulated cloud sync error')
  }

  // In production:
  // const res = await fetch(`/api/${action.entity.toLowerCase()}s`, {
  //   method: action.action === 'CREATE' ? 'POST' : action.action === 'UPDATE' ? 'PUT' : 'DELETE',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(action.payload),
  // })
  // if (!res.ok) throw new Error(await res.text())
}

/**
 * Mark a specific entity as synced in its table.
 */
async function markEntitySynced(entity: SyncAction['entity'], id: string) {
  switch (entity) {
    case 'BILL':
      await db.bills.update(id, { isSynced: true, updatedAt: new Date().toISOString() })
      break
    case 'CUSTOMER':
      await db.customers.update(id, { isSynced: true, updatedAt: new Date().toISOString() })
      break
    case 'PRODUCT':
      await db.products.update(id, { isSynced: true, updatedAt: new Date().toISOString() })
      break
  }
}

/**
 * Process all pending items in the sync queue.
 * Returns the number of successfully synced items.
 */
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
      // Mark entity as synced in its table
      await markEntitySynced(action.entity, action.entityId)
      // Remove from queue on success
      await db.syncQueue.delete(action.id)
      synced++
    } catch (err) {
      const retryCount = (action.retryCount || 0) + 1
      if (retryCount >= MAX_RETRIES) {
        // Mark as permanently failed
        await db.syncQueue.update(action.id, {
          status: 'FAILED',
          retryCount,
          error: err instanceof Error ? err.message : 'Unknown error',
        })
        failed++
      } else {
        // Increment retry count, keep as PENDING for next attempt
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

/**
 * Queue an action in the sync queue for deferred cloud sync.
 */
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

/**
 * Get current pending sync count.
 */
export async function getPendingSyncCount(): Promise<number> {
  return db.syncQueue.where('status').equals('PENDING').count()
}
