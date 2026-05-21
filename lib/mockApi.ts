import { sleep } from './utils'

// Simulates network delay for realistic UX
async function fakeRequest<T>(data: T, delay = 600): Promise<T> {
  await sleep(delay)
  return data
}

export const mockApi = {
  async getOrders() {
    const orders = (await import('@/data/orders.json')).default
    return fakeRequest(orders)
  },

  async getCustomers() {
    const customers = (await import('@/data/customers.json')).default
    return fakeRequest(customers)
  },

  async getProducts() {
    const products = (await import('@/data/products.json')).default
    return fakeRequest(products)
  },

  async getChats() {
    const messages = (await import('@/data/messages.json')).default
    return fakeRequest(messages)
  },

  async getAnalytics() {
    const analytics = (await import('@/data/analytics.json')).default
    return fakeRequest(analytics)
  },
}
