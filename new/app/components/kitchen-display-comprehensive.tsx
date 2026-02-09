import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Checkbox } from '@/app/components/ui/checkbox';
import { cn } from '@/app/components/ui/utils';
import {
  ChefHat, Clock, Flame, CheckCircle, Package,
  AlertTriangle, Coffee, Zap, Users
} from 'lucide-react';
import { toast } from 'sonner';
import { mockApi, type MockOrder } from '@/app/services/mock-api';

// ============================================================================
// STATION ASSIGNMENT LOGIC
// ============================================================================

type Station = 'FRY' | 'CURRY' | 'GRILL' | 'COLD' | 'BEVERAGE';

function getStationForItem(itemName: string): Station {
  const name = itemName.toLowerCase();
  
  // FRY Station
  if (name.includes('fries') || name.includes('dosa') || name.includes('samosa') || 
      name.includes('pakora') || name.includes('vada')) {
    return 'FRY';
  }
  
  // CURRY Station
  if (name.includes('curry') || name.includes('paneer') || name.includes('dal') ||
      name.includes('chicken') && !name.includes('tikka') || name.includes('gravy')) {
    return 'CURRY';
  }
  
  // GRILL Station
  if (name.includes('tikka') || name.includes('kebab') || name.includes('tandoor') ||
      name.includes('grill') || name.includes('pizza')) {
    return 'GRILL';
  }
  
  // BEVERAGE Station
  if (name.includes('lassi') || name.includes('coffee') || name.includes('tea') ||
      name.includes('juice') || name.includes('shake')) {
    return 'BEVERAGE';
  }
  
  // COLD Station (desserts, salads)
  if (name.includes('gulab') || name.includes('ice cream') || name.includes('salad') ||
      name.includes('raita') || name.includes('kulfi')) {
    return 'COLD';
  }
  
  // Default to CURRY for misc items
  return 'CURRY';
}

function getStationColor(station: Station): string {
  switch (station) {
    case 'FRY': return 'bg-orange-900 text-orange-200 border-orange-600';
    case 'CURRY': return 'bg-yellow-900 text-yellow-200 border-yellow-600';
    case 'GRILL': return 'bg-red-900 text-red-200 border-red-600';
    case 'COLD': return 'bg-blue-900 text-blue-200 border-blue-600';
    case 'BEVERAGE': return 'bg-purple-900 text-purple-200 border-purple-600';
  }
}

// ============================================================================
// PRODUCTION TICKET COMPONENT
// ============================================================================

interface ProductionTicketProps {
  order: MockOrder;
  onItemToggle: (orderId: string, itemId: string, completed: boolean) => void;
  onMarkReady: (orderId: string) => void;
}

function ProductionTicket({ order, onItemToggle, onMarkReady }: ProductionTicketProps) {
  const ageMinutes = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000 / 60);
  const isUrgent = ageMinutes > 15;

  // Add stations to items
  const itemsWithStations = order.items.map(item => ({
    ...item,
    station: getStationForItem(item.name),
    completed: item.completed || false
  }));

  // Group by station
  const itemsByStation = itemsWithStations.reduce((acc, item) => {
    if (!acc[item.station]) {
      acc[item.station] = [];
    }
    acc[item.station].push(item);
    return acc;
  }, {} as Record<Station, typeof itemsWithStations>);

  const allItemsCompleted = itemsWithStations.every(item => item.completed);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'bg-stone-800 border-2 rounded-lg overflow-hidden',
        isUrgent ? 'border-red-500 animate-pulse' : 'border-stone-600'
      )}
    >
      {/* Header */}
      <div className="bg-stone-900 p-4 border-b border-stone-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold text-white">{order.displayId}</h3>
          <div className="flex items-center gap-2">
            {isUrgent && (
              <Badge className="bg-red-900 text-red-100 border-red-600">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Urgent
              </Badge>
            )}
            <div className="flex items-center gap-1 text-gray-400">
              <Clock className="w-4 h-4" />
              <span className="text-sm">{ageMinutes}m</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">
            {order.tableNumber || 'Takeaway'} • {order.customerName}
          </span>
          <span className="text-amber-400 font-medium">
            {order.items.length} items
          </span>
        </div>
      </div>

      {/* Items by Station */}
      <div className="p-4 space-y-4">
        {Object.entries(itemsByStation).map(([station, items]) => (
          <div key={station} className="space-y-2">
            <Badge className={cn('text-sm font-bold border-2', getStationColor(station as Station))}>
              {station} STATION
            </Badge>
            <div className="space-y-2 pl-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded bg-stone-700/50 border border-stone-600',
                    item.completed && 'opacity-40 line-through'
                  )}
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) => 
                      onItemToggle(order.id, item.id, checked as boolean)
                    }
                    className="border-gray-400"
                  />
                  <span className="text-white font-medium">
                    {item.quantity}x {item.name}
                  </span>
                  {item.specialInstructions && (
                    <Badge variant="outline" className="text-xs border-amber-500 text-amber-400">
                      {item.specialInstructions}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      {order.customerNotes && (
        <div className="px-4 pb-3">
          <div className="bg-amber-900/30 border border-amber-700 rounded-lg p-3">
            <p className="text-xs text-amber-200">
              <strong className="text-amber-400">Special Note:</strong> {order.customerNotes}
            </p>
          </div>
        </div>
      )}

      {/* Action */}
      <div className="p-4 bg-stone-900 border-t border-stone-700">
        <Button
          className={cn(
            'w-full text-lg font-bold',
            allItemsCompleted
              ? 'bg-green-700 hover:bg-green-600 text-white'
              : 'bg-stone-600 text-stone-400 cursor-not-allowed'
          )}
          disabled={!allItemsCompleted}
          onClick={() => onMarkReady(order.id)}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Mark Ready
        </Button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// BATCH VIEW COMPONENT
// ============================================================================

interface BatchItem {
  name: string;
  totalQuantity: number;
  orderCount: number;
  station: Station;
}

function BatchView({ orders }: { orders: MockOrder[] }) {
  // Aggregate all items across all orders
  const batchItems: Record<string, BatchItem> = {};

  orders.forEach(order => {
    order.items.forEach(item => {
      if (!batchItems[item.name]) {
        batchItems[item.name] = {
          name: item.name,
          totalQuantity: 0,
          orderCount: 0,
          station: getStationForItem(item.name)
        };
      }
      batchItems[item.name].totalQuantity += item.quantity;
      batchItems[item.name].orderCount += 1;
    });
  });

  const sortedItems = Object.values(batchItems).sort((a, b) => 
    b.totalQuantity - a.totalQuantity
  );

  // Group by station
  const itemsByStation = sortedItems.reduce((acc, item) => {
    if (!acc[item.station]) {
      acc[item.station] = [];
    }
    acc[item.station].push(item);
    return acc;
  }, {} as Record<Station, BatchItem[]>);

  return (
    <div className="space-y-6 p-4">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Batch Production View</h2>
        <p className="text-gray-400">Aggregated items across all active orders</p>
      </div>

      {Object.entries(itemsByStation).map(([station, items]) => (
        <div key={station} className="space-y-3">
          <div className="flex items-center gap-3">
            <Badge className={cn('text-lg font-bold border-2 px-4 py-2', getStationColor(station as Station))}>
              <ChefHat className="w-5 h-5 mr-2" />
              {station} STATION
            </Badge>
            <span className="text-gray-400">
              {items.reduce((sum, item) => sum + item.totalQuantity, 0)} total items
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => (
              <Card key={item.name} className="bg-stone-800 border-stone-600">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-white text-lg">{item.name}</h4>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-amber-400">
                        {item.totalQuantity}
                      </div>
                      <div className="text-xs text-gray-400">
                        {item.orderCount} orders
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {sortedItems.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <Coffee className="w-20 h-20 mx-auto mb-4 opacity-30" />
          <p className="text-xl">No items to prepare</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function KitchenDisplayComprehensive() {
  const [orders, setOrders] = useState<MockOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'tickets' | 'batch'>('tickets');

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      const result = await mockApi.getOrders();
      if (result.success) {
        setOrders(result.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = async (orderId: string, itemId: string, completed: boolean) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedItems = order.items.map(item =>
      item.id === itemId ? { ...item, completed } : item
    );

    try {
      await mockApi.updateOrder(orderId, { items: updatedItems });
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update item');
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      await mockApi.updateOrderStatus(orderId, 'ready');
      
      // Also update table's kitchen status to 'Ready'
      const order = orders.find(o => o.id === orderId);
      if (order?.tableId) {
        await mockApi.updateTable(order.tableId, {
          kitchenStatus: 'Ready'
        });
      }

      toast.success('Order marked as ready!', {
        icon: <CheckCircle className="w-5 h-5 text-green-500" />
      });
      
      fetchOrders();
    } catch (error) {
      toast.error('Failed to mark order as ready');
    }
  };

  // Filter only preparing orders for kitchen
  const preparingOrders = orders.filter(o => 
    ['accepted', 'preparing'].includes(o.status)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-stone-900">
        <div className="text-center">
          <ChefHat className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-bounce" />
          <p className="text-gray-400 text-lg">Loading kitchen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900">
      {/* Header */}
      <div className="bg-stone-950 border-b border-stone-800 p-6 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-3">
              <ChefHat className="w-10 h-10 text-amber-500" />
              Kitchen Display System
            </h1>
            <p className="text-gray-400 mt-2">Production tracking and order management</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge className="text-lg px-4 py-2 bg-amber-900 text-amber-100 border-amber-600">
              <Flame className="w-5 h-5 mr-2" />
              {preparingOrders.length} Active Orders
            </Badge>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <Tabs value={view} onValueChange={(v) => setView(v as 'tickets' | 'batch')} className="p-6">
        <TabsList className="bg-stone-800 border border-stone-700">
          <TabsTrigger value="tickets" className="data-[state=active]:bg-amber-700 data-[state=active]:text-white">
            <Package className="w-4 h-4 mr-2" />
            Production Board
          </TabsTrigger>
          <TabsTrigger value="batch" className="data-[state=active]:bg-amber-700 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            Batch View
          </TabsTrigger>
        </TabsList>

        {/* Production Board (Ticket View) */}
        <TabsContent value="tickets" className="mt-6">
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
              <AnimatePresence>
                {preparingOrders.map(order => (
                  <ProductionTicket
                    key={order.id}
                    order={order}
                    onItemToggle={handleItemToggle}
                    onMarkReady={handleMarkReady}
                  />
                ))}
              </AnimatePresence>
            </div>
            
            {preparingOrders.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                <Coffee className="w-20 h-20 mx-auto mb-4 opacity-30" />
                <p className="text-2xl font-bold">No orders in production</p>
                <p className="text-gray-600 mt-2">All caught up!</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* Batch View */}
        <TabsContent value="batch" className="mt-6">
          <ScrollArea className="h-[calc(100vh-220px)]">
            <BatchView orders={preparingOrders} />
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
