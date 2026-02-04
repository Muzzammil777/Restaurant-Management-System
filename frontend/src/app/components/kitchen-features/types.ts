
export type Station = 'FRY' | 'CURRY' | 'RICE' | 'STARTER' | 'DESSERT' | 'PREP' | 'ALL';

export interface ChefProfile {
  id: string;
  name: string;
  role: string;
  station: Station;
  initials: string;
}

export interface KitchenStats {
  avgPrepTime: number;
  delayedOrders: number;
  totalOrdersToday: number;
  topDishes: { name: string; count: number }[];
  hourlyVolume: { hour: string; count: number }[];
}

// Extending RMS Order type locally if needed, or we can just use the RMS one and cast/extend in component
export interface KDSItemStatus {
    itemId: string; // generated if missing in RMS
    status: 'PENDING' | 'PREPARING' | 'COMPLETED';
}
