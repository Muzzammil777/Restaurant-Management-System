import { useState, useEffect, useRef } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/app/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/app/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Clock, Package, CheckCircle, XCircle, Plus, CreditCard, Eye, IndianRupee, UtensilsCrossed, Zap, Minus, Search, Repeat, Flame, AlertCircle, TrendingUp, Activity, ChefHat, Coffee, Timer, Undo2, Gauge, MoveRight, MoveLeft, Ban, Sparkles, Pizza, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { ordersApi, menuApi } from '@/utils/api';
import { PaymentDialog } from '@/app/components/payment-dialog';
import { QuickOrderPOS } from '@/app/components/quick-order-pos';

interface Order {
  id: string;
  tableNumber?: number;
  customerName?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'placed' | 'preparing' | 'ready' | 'served' | 'completed' | 'cancelled';
  type: 'dine-in' | 'takeaway' | 'delivery';
  createdAt: string;
  paymentMethod?: 'cash' | 'upi' | 'card';
  tags?: string[];
  statusUpdatedAt?: string;
  notes?: string;
}

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  available: boolean;
}



// Innovation #6: Smart Notes Keywords
const SMART_NOTE_KEYWORDS = {
  'no onion': { icon: '🧅', color: 'text-orange-600', bg: 'bg-orange-50' },
  'no garlic': { icon: '🧄', color: 'text-orange-600', bg: 'bg-orange-50' },
  'extra spicy': { icon: '🌶', color: 'text-red-600', bg: 'bg-red-50' },
  'mild': { icon: '😊', color: 'text-green-600', bg: 'bg-green-50' },
  'urgent': { icon: '⚡', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  'allergy': { icon: '⚠️', color: 'text-red-600', bg: 'bg-red-50' },
  'vip': { icon: '👑', color: 'text-purple-600', bg: 'bg-purple-50' },
};

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterTable, setFilterTable] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Quick Order Panel State
  const [quickOrderOpen, setQuickOrderOpen] = useState(false);

  // Innovation #9: Undo Last Action State
  const [lastAction, setLastAction] = useState<{
    orderId: string;
    previousStatus: Order['status'];
    newStatus: Order['status'];
    timestamp: number;
  } | null>(null);
  const [undoCountdown, setUndoCountdown] = useState<number>(0);
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const normalizeOrder = (rawOrder: any): Order => {
    const rawItems = Array.isArray(rawOrder?.items) ? rawOrder.items : [];
    return {
      ...rawOrder,
      items: rawItems.map((item: any) => ({
        name: item?.name || 'Unknown Item',
        quantity: Number(item?.quantity) || 0,
        price: Number(item?.price) || 0,
      })),
      total: Number(rawOrder?.total) || 0,
      createdAt: rawOrder?.createdAt || new Date().toISOString(),
    };
  };

  useEffect(() => {
    fetchOrders();
    fetchMenuItems();
    const interval = setInterval(fetchOrders, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Innovation #9: Undo countdown effect
  useEffect(() => {
    if (lastAction && undoCountdown > 0) {
      undoTimerRef.current = setTimeout(() => {
        setUndoCountdown(prev => prev - 1);
      }, 1000);
    } else if (undoCountdown === 0 && lastAction) {
      setLastAction(null);
    }

    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, [undoCountdown, lastAction]);

  const fetchOrders = async () => {
    try {
      const result = await ordersApi.list();
      const rawOrders = (result as any)?.data || result || [];
      setOrders(Array.isArray(rawOrders) ? rawOrders.map(normalizeOrder) : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch orders. Please check your connection.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const data = await menuApi.list();
      const items = (data as any)?.data || data || [];
      setMenuItems(Array.isArray(items) ? items.filter((item: MenuItem) => item.available !== false) : []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status'], skipUndo: boolean = false) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      // Store for undo (Innovation #9)
      if (!skipUndo && order.status !== newStatus) {
        setLastAction({
          orderId,
          previousStatus: order.status,
          newStatus,
          timestamp: Date.now()
        });
        setUndoCountdown(10); // 10 second countdown
      }

      const cleanId = orderId.replace('order:', '');
      await ordersApi.updateStatus(cleanId, newStatus);
      const statusText = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
      toast.success(`Order marked as ${statusText}!`);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  // Innovation #9: Undo function
  const undoLastAction = async () => {
    if (!lastAction) return;

    try {
      await updateOrderStatus(lastAction.orderId, lastAction.previousStatus, true);
      setLastAction(null);
      setUndoCountdown(0);
      toast.success('Action undone successfully!');
    } catch (error) {
      console.error('Error undoing action:', error);
      toast.error('Failed to undo action');
    }
  };

  const duplicateOrder = (order: Order) => {
    // TODO: Implement duplicate order in QuickOrderPOS
    toast.info('Duplicate order feature coming soon!');
    setQuickOrderOpen(true);
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return <Clock className="h-4 w-4" />;
      case 'preparing':
        return <Package className="h-4 w-4" />;
      case 'ready':
      case 'served':
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return 'bg-blue-100 text-blue-700';
      case 'preparing':
        return 'bg-orange-100 text-orange-700';
      case 'ready':
        return 'bg-purple-100 text-purple-700';
      case 'served':
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
    }
  };

  const getOrderTypeBadge = (type: Order['type']) => {
    return type === 'dine-in' ? 'Dine-In' : type === 'takeaway' ? 'Takeaway' : 'Delivery';
  };

  const generateOrderDisplayId = (orderId: string | undefined) => {
    if (!orderId) return '#UNKNOWN';
    const parts = orderId.split('-');
    const hash = parts[parts.length - 1] || orderId;
    return '#' + hash.slice(0, 6).toUpperCase();
  };

  // Innovation #4: Calculate order aging
  const getOrderAge = (order: Order) => {
    const statusTime = order.statusUpdatedAt || order.createdAt;
    const ageInMinutes = Math.floor((Date.now() - new Date(statusTime).getTime()) / 60000);
    return ageInMinutes;
  };

  // Innovation #4 & #5: Get delay level for visual highlighting and bottleneck detection
  const getDelayLevel = (ageInMinutes: number, status: Order['status']) => {
    if (status === 'served' || status === 'completed' || status === 'cancelled') return null;
    
    // Innovation #5: Kitchen bottleneck - orders stuck in preparing
    if (status === 'preparing' && ageInMinutes > 20) return 'bottleneck';
    if (ageInMinutes > 30) return 'critical';
    if (ageInMinutes > 15) return 'warning';
    return null;
  };

  // Innovation #3: Auto-assign priority based on tags and waiting time
  const getOrderPriority = (order: Order) => {
    const ageInMinutes = getOrderAge(order);
    const hasPriorityTag = order.tags?.includes('Priority');
    const isVIP = order.notes?.toLowerCase().includes('vip');
    const isUrgent = order.notes?.toLowerCase().includes('urgent');

    if (hasPriorityTag || isVIP || isUrgent || ageInMinutes > 30) {
      return { level: 'high', badge: '🔴 Urgent', color: 'bg-red-500 text-white' };
    } else if (ageInMinutes > 15) {
      return { level: 'medium', badge: '🟡 Normal', color: 'bg-yellow-500 text-white' };
    }
    return { level: 'low', badge: '🟢 Low', color: 'bg-green-500 text-white' };
  };

  // Innovation #6: Parse and highlight smart notes
  const parseSmartNotes = (notes?: string) => {
    if (!notes) return null;

    const highlights: Array<{ text: string; keyword: string }> = [];
    const lowerNotes = notes.toLowerCase();

    Object.keys(SMART_NOTE_KEYWORDS).forEach(keyword => {
      if (lowerNotes.includes(keyword)) {
        highlights.push({ text: keyword, keyword });
      }
    });

    return highlights;
  };

  // Filter and search orders
  const filteredOrders = orders.filter(order => {
    if (filterStatus !== 'all' && order.status !== filterStatus) return false;
    if (filterType !== 'all' && order.type !== filterType) return false;
    if (filterTable !== 'all' && order.tableNumber?.toString() !== filterTable) return false;
    if (searchQuery && !generateOrderDisplayId(order.id).toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Sort orders: bottleneck orders first, then by age
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const aAge = getOrderAge(a);
    const bAge = getOrderAge(b);
    const aDelay = getDelayLevel(aAge, a.status);
    const bDelay = getDelayLevel(bAge, b.status);

    // Innovation #5: Bottleneck orders to top
    if (aDelay === 'bottleneck' && bDelay !== 'bottleneck') return -1;
    if (bDelay === 'bottleneck' && aDelay !== 'bottleneck') return 1;
    
    // Then critical delays
    if (aDelay === 'critical' && bDelay !== 'critical') return -1;
    if (bDelay === 'critical' && aDelay !== 'critical') return 1;
    
    // Then warnings
    if (aDelay === 'warning' && bDelay !== 'warning') return -1;
    if (bDelay === 'warning' && aDelay !== 'warning') return 1;

    return bAge - aAge; // Most recent first for same priority
  });

  // Calculate statistics
  const activeOrders = orders.filter(o => !['served', 'completed', 'cancelled'].includes(o.status)).length;
  const servedToday = orders.filter(o => {
    const orderDate = new Date(o.createdAt);
    const today = new Date();
    return o.status === 'served' && 
           orderDate.getDate() === today.getDate() &&
           orderDate.getMonth() === today.getMonth() &&
           orderDate.getFullYear() === today.getFullYear();
  }).length;
  
  const preparingOrders = orders.filter(o => o.status === 'preparing' || o.status === 'ready');
  const avgPrepTime = preparingOrders.length > 0
    ? Math.floor(preparingOrders.reduce((sum, o) => sum + getOrderAge(o), 0) / preparingOrders.length)
    : 0;

  // Innovation #8: Kitchen Load Meter calculation
  const getKitchenLoad = () => {
    const activeCount = activeOrders;
    if (activeCount === 0) return { level: 'low', label: 'Low', color: 'text-green-600', bgColor: 'bg-green-100', percentage: 0 };
    if (activeCount <= 5) return { level: 'low', label: 'Low', color: 'text-green-600', bgColor: 'bg-green-100', percentage: 33 };
    if (activeCount <= 10) return { level: 'medium', label: 'Medium', color: 'text-orange-600', bgColor: 'bg-orange-100', percentage: 66 };
    return { level: 'high', label: 'High', color: 'text-red-600', bgColor: 'bg-red-100', percentage: 100 };
  };

  const kitchenLoad = getKitchenLoad();

  // Get unique table numbers for filter
  const tableNumbers = Array.from(new Set(orders.map(o => o.tableNumber).filter(Boolean)));

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading orders...</div>;
  }

  return (
    <div className="bg-order-management-module min-h-screen p-6 space-y-6">
      {/* Header Section */}
      <div className="module-container flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">Orders</h1>
          <p className="text-gray-200">View, manage, and track all customer orders</p>
        </div>
        
        {/* Quick Order Button */}
        <Button onClick={() => setQuickOrderOpen(true)} size="lg" className="gap-2 shadow-md">
          <Zap className="h-5 w-5" />
          Quick Order
        </Button>
      </div>

      {/* Mini Order Insights */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold">{activeOrders}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Prep Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold">{avgPrepTime} min</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Served Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold">{servedToday}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Innovation #8: Kitchen Load Meter */}
      <Card className={`border-2 ${kitchenLoad.bgColor} border-opacity-50`}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gauge className={`h-6 w-6 ${kitchenLoad.color}`} />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Kitchen Load</p>
                <p className={`text-lg font-bold ${kitchenLoad.color}`}>
                  {kitchenLoad.label} ({activeOrders} active orders)
                </p>
              </div>
            </div>
            <div className="w-48 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  kitchenLoad.level === 'high' ? 'bg-red-500' :
                  kitchenLoad.level === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                }`}
                style={{ width: `${kitchenLoad.percentage}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="placed">Placed</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="served">Served</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Order Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="dine-in">Dine-In</SelectItem>
                <SelectItem value="takeaway">Takeaway</SelectItem>
                <SelectItem value="delivery">Delivery</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterTable} onValueChange={setFilterTable}>
              <SelectTrigger>
                <SelectValue placeholder="Table" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tables</SelectItem>
                {tableNumbers.map(table => (
                  <SelectItem key={table} value={table!.toString()}>
                    Table {table}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setFilterStatus('all');
                setFilterType('all');
                setFilterTable('all');
                setSearchQuery('');
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Innovation #9: Undo Last Action Toast */}
      {lastAction && undoCountdown > 0 && (
        <Card className="border-2 border-yellow-400 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">
                    Order status changed to <strong>{lastAction.newStatus}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Undo in {undoCountdown} second{undoCountdown !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={undoLastAction}
                className="gap-2 border-yellow-600 text-yellow-700 hover:bg-yellow-100"
              >
                <Undo2 className="h-4 w-4" />
                Undo
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Orders Grid */}
      {sortedOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No orders found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedOrders.map((order) => {
            const orderItems = Array.isArray(order.items) ? order.items : [];
            const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
            const ageInMinutes = getOrderAge(order);
            const delayLevel = getDelayLevel(ageInMinutes, order.status);
            const priority = getOrderPriority(order);
            const smartNotes = parseSmartNotes(order.notes);
            
            return (
              <Card 
                key={order.id} 
                className={`hover:shadow-lg transition-all duration-300 ${
                  delayLevel === 'bottleneck' ? 'border-red-500 border-2 shadow-lg shadow-red-200 ring-2 ring-red-200' :
                  delayLevel === 'critical' ? 'border-red-400 border-2 shadow-md shadow-red-100' :
                  delayLevel === 'warning' ? 'border-yellow-400 border-2' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg font-semibold">
                          {generateOrderDisplayId(order.id)}
                        </CardTitle>
                        {/* Innovation #3: Priority Badge */}
                        {!['served', 'completed', 'cancelled'].includes(order.status) && (
                          <Badge className={`text-xs ${priority.color}`}>
                            {priority.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {getOrderTypeBadge(order.type)}
                        </Badge>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                        {order.tags?.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Innovation #5: Bottleneck Alert */}
                  {delayLevel === 'bottleneck' && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="h-4 w-4 animate-pulse" />
                        <p className="text-xs font-medium">⚠️ Kitchen Bottleneck - Priority Attention Needed!</p>
                      </div>
                    </div>
                  )}

                  {/* Innovation #6: Smart Notes Highlighter */}
                  {smartNotes && smartNotes.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {smartNotes.map((note, idx) => {
                        const keyword = SMART_NOTE_KEYWORDS[note.keyword as keyof typeof SMART_NOTE_KEYWORDS];
                        return (
                          <Badge 
                            key={idx} 
                            className={`text-xs ${keyword.bg} ${keyword.color} border-0`}
                          >
                            <span className="mr-1">{keyword.icon}</span>
                            {note.text}
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {/* Smart Order Status Timeline */}
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex items-center justify-between text-xs">
                      <div className={`flex flex-col items-center gap-1 ${order.status === 'placed' ? 'text-foreground font-medium' : order.status === 'cancelled' ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
                        <Clock className="h-3.5 w-3.5" />
                        <span>Placed</span>
                      </div>
                      <div className="flex-1 h-0.5 mx-1 bg-muted" />
                      <div className={`flex flex-col items-center gap-1 ${order.status === 'preparing' ? 'text-foreground font-medium' : ['ready', 'served', 'completed'].includes(order.status) ? 'text-muted-foreground/50' : 'text-muted-foreground/30'}`}>
                        <Package className="h-3.5 w-3.5" />
                        <span>Preparing</span>
                      </div>
                      <div className="flex-1 h-0.5 mx-1 bg-muted" />
                      <div className={`flex flex-col items-center gap-1 ${order.status === 'ready' ? 'text-foreground font-medium' : ['served', 'completed'].includes(order.status) ? 'text-muted-foreground/50' : 'text-muted-foreground/30'}`}>
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>Ready</span>
                      </div>
                      <div className="flex-1 h-0.5 mx-1 bg-muted" />
                      <div className={`flex flex-col items-center gap-1 ${['served', 'completed'].includes(order.status) ? 'text-foreground font-medium' : 'text-muted-foreground/30'}`}>
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Served</span>
                      </div>
                    </div>
                  </div>

                  {/* Innovation #4: Order Aging Indicator */}
                  {!['served', 'completed', 'cancelled'].includes(order.status) && (
                    <div className={`mt-2 p-2 rounded-md text-xs font-medium flex items-center gap-2 ${
                      delayLevel === 'critical' ? 'bg-red-100 text-red-700' :
                      delayLevel === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      delayLevel === 'bottleneck' ? 'bg-red-200 text-red-800' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      <Timer className={`h-4 w-4 ${delayLevel ? 'animate-pulse' : ''}`} />
                      <span>⏱ Waiting {ageInMinutes} min{ageInMinutes !== 1 ? 's' : ''}</span>
                      {delayLevel && (
                        <AlertCircle className="h-4 w-4 ml-auto animate-pulse" />
                      )}
                    </div>
                  )}
                  
                  {/* Customer & Table Info */}
                  <div className="text-sm text-muted-foreground space-y-1 mt-2">
                    {order.type === 'dine-in' && order.tableNumber && (
                      <div className="flex items-center gap-1">
                        <UtensilsCrossed className="h-3.5 w-3.5" />
                        <span>Table {order.tableNumber}</span>
                      </div>
                    )}
                    {order.customerName && (
                      <div className="font-medium text-foreground">
                        {order.customerName}
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      ORDER ITEMS ({totalItems} {totalItems === 1 ? 'item' : 'items'})
                    </p>
                    <ul className="text-sm space-y-1.5">
                      {orderItems.map((item, idx) => (
                        <li key={idx} className="flex justify-between">
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="flex items-center gap-0.5 font-medium">
                            <IndianRupee className="h-3 w-3" />
                            {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Order Summary */}
                  <div className="pt-3 border-t space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold">Total Amount</span>
                      <span className="text-lg font-bold flex items-center gap-0.5">
                        <IndianRupee className="h-4 w-4" />
                        {order.total.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(order.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                      {order.paymentMethod && (
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {order.paymentMethod.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Innovation #7: Drag-to-Change Status Visual Cues */}
                  {!['served', 'completed', 'cancelled'].includes(order.status) && (
                    <div className="pt-2 pb-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <div className="flex items-center gap-1">
                          <MoveRight className="h-3 w-3" />
                          <span>Swipe right for next status</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Ban className="h-3 w-3" />
                          <span>Left to cancel</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Context-Aware Action Buttons */}
                  <div className="flex flex-col gap-2 pt-2">
                    {/* Primary Action */}
                    {order.status === 'placed' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="w-full gap-2"
                      >
                        <MoveRight className="h-4 w-4" />
                        Accept Order
                      </Button>
                    )}
                    {order.status === 'preparing' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="w-full gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Mark as Ready
                      </Button>
                    )}
                    {order.status === 'ready' && (
                      <Button
                        size="sm"
                        onClick={() => updateOrderStatus(order.id, 'served')}
                        className="w-full gap-2"
                      >
                        <UtensilsCrossed className="h-4 w-4" />
                        Mark as Served
                      </Button>
                    )}
                    
                    {/* Secondary Actions */}
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Order Details {generateOrderDisplayId(order.id)}</DialogTitle>
                            <DialogDescription>
                              Complete order information
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 mt-4">
                            <div>
                              <p className="text-sm font-medium mb-1">Order Type</p>
                              <p className="text-sm text-muted-foreground">{getOrderTypeBadge(order.type)}</p>
                            </div>
                            {order.tableNumber && (
                              <div>
                                <p className="text-sm font-medium mb-1">Table Number</p>
                                <p className="text-sm text-muted-foreground">Table {order.tableNumber}</p>
                              </div>
                            )}
                            {order.customerName && (
                              <div>
                                <p className="text-sm font-medium mb-1">Customer Name</p>
                                <p className="text-sm text-muted-foreground">{order.customerName}</p>
                              </div>
                            )}
                            {order.notes && (
                              <div>
                                <p className="text-sm font-medium mb-1">Notes</p>
                                <p className="text-sm text-muted-foreground">{order.notes}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium mb-1">Status</p>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-2">Items</p>
                              <ul className="space-y-2">
                                {(Array.isArray(order.items) ? order.items : []).map((item, idx) => (
                                  <li key={idx} className="flex justify-between text-sm">
                                    <span>{item.quantity}x {item.name}</span>
                                    <span className="flex items-center gap-0.5">
                                      <IndianRupee className="h-3 w-3" />
                                      {(item.price * item.quantity).toFixed(2)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="pt-3 border-t">
                              <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span className="flex items-center gap-0.5">
                                  <IndianRupee className="h-4 w-4" />
                                  {order.total.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {/* Duplicate Order Feature */}
                      {['served', 'completed'].includes(order.status) && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => duplicateOrder(order)}
                        >
                          <Repeat className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      
                      {order.status !== 'completed' && order.status !== 'cancelled' && order.status !== 'served' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        >
                          <Ban className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}</div>
      )}

      {/* Redesigned Quick Order (POS Mode) */}
      <QuickOrderPOS
        open={quickOrderOpen}
        onOpenChange={setQuickOrderOpen}
        onOrderCreated={fetchOrders}
      />

      {selectedOrder && (
        <PaymentDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          orderId={selectedOrder.id}
          amount={selectedOrder.total}
          onSuccess={fetchOrders}
        />
      )}
    </div>
  );
}
