export interface MockOrderItem {
  name: string
  variant: string
  qty: number
  price: number
}

export interface MockOrder {
  id: string
  placedAt: string
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled'
  items: MockOrderItem[]
  total: number
}

export const mockCustomer = {
  name: 'Ananya Sharma',
  email: 'ananya.sharma@example.com',
  phone: '+91 98765 43210',
  memberSince: '2024-11-02',
}

export const mockAddresses = [
  {
    id: 'addr-1',
    label: 'Home',
    name: 'Ananya Sharma',
    line1: 'B-204, Lotus Residency',
    line2: 'Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400069',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Office',
    name: 'Ananya Sharma',
    line1: '4th Floor, Prestige Towers',
    line2: 'Bandra Kurla Complex',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400051',
    isDefault: false,
  },
]

export const mockOrders: MockOrder[] = [
  {
    id: 'ORD-8841',
    placedAt: '2026-08-24',
    status: 'delivered',
    items: [
      { name: 'Sun-Dried Turmeric Powder', variant: '500 g', qty: 1, price: 342 },
      { name: 'Signature Garam Masala', variant: '250 g', qty: 2, price: 260 },
    ],
    total: 862,
  },
  {
    id: 'ORD-8790',
    placedAt: '2026-08-11',
    status: 'shipped',
    items: [{ name: 'Wood-Pressed Groundnut Oil', variant: '1 kg', qty: 1, price: 936 }],
    total: 936,
  },
  {
    id: 'ORD-8654',
    placedAt: '2026-07-19',
    status: 'delivered',
    items: [
      { name: 'The Everyday Essentials Set', variant: 'Gift box (5 jars)', qty: 1, price: 1450 },
    ],
    total: 1450,
  },
  {
    id: 'ORD-8502',
    placedAt: '2026-06-30',
    status: 'cancelled',
    items: [{ name: 'Virgin Coconut Oil', variant: '250 g', qty: 1, price: 300 }],
    total: 300,
  },
]
