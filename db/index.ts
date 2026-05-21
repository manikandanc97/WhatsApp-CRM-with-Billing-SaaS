import Dexie, { Table } from 'dexie';
import { Customer, Product, Bill, SyncAction } from '@/types/db';

export class SweetFlowDatabase extends Dexie {
  customers!: Table<Customer, string>;
  products!: Table<Product, string>;
  bills!: Table<Bill, string>;
  syncQueue!: Table<SyncAction, string>;

  constructor() {
    super('SweetFlowDB');
    
    this.version(1).stores({
      customers: 'id, name, phone, isSynced, createdAt',
      products: 'id, name, category, isSynced, createdAt',
      bills: 'id, customerId, status, paymentMethod, isSynced, createdAt',
      syncQueue: 'id, status, entity, action, createdAt'
    });
  }
}

export const db = new SweetFlowDatabase();
