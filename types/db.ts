export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
  isSynced: boolean;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  isSynced: boolean;
}

export interface BillItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}



export interface Bill {
  id: string;
  customerId: string | null;
  customerName?: string;
  customerPhone?: string;
  items: BillItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED';
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'CREDIT';
  createdAt: string;
  updatedAt: string;
  isSynced: boolean;
}

export interface SyncAction {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: 'CUSTOMER' | 'PRODUCT' | 'BILL';
  entityId: string;
  payload: any;
  status: 'PENDING' | 'FAILED';
  retryCount: number;
  error?: string;
  createdAt: string;
}
