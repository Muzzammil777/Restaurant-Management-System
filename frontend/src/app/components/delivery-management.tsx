import { useState, useEffect, useMemo } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Truck, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  User, 
  Package, 
  Search, 
  Filter, 
  ChefHat, 
  Bike, 
  Map as MapIcon, 
  History, 
  BarChart3, 
  MoreHorizontal,
  Navigation,
  Flame,
  ChevronRight,
  TrendingUp,
  Calendar,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Progress } from '@/app/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Separator } from '@/app/components/ui/separator';
import { toast } from 'sonner';

// --- Types ---

type OrderStatus = 'cooking' | 'ready' | 'picked_up' | 'on_the_way' | 'delivered';

interface Rider {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  status: 'available' | 'busy' | 'offline';
  vehicleType: 'Bike' | 'Scooter' | 'Electric';
  rating: number;
  totalDeliveries: number;
  distanceFromStore: string; // e.g., "0.5 km"
  dailyDeliveries: number;
}

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerArea: string;
  address: string;
  items: string[];
  totalAmount: number;
  status: OrderStatus;
  riderId?: string;
  placedTime: string;
  estimatedDeliveryTime: string; // e.g., "14:30"
  prepProgress: number; // 0-100
  coordinates?: { x: number, y: number }; // For visual map simulation
}

// --- Mock Data ---

const MOCK_RIDERS: Rider[] = [
  { id: 'r1', name: 'Rahul Kumar', avatar: '', phone: '+91 98765 43210', status: 'available', vehicleType: 'Bike', rating: 4.8, totalDeliveries: 1240, distanceFromStore: '0.2 km', dailyDeliveries: 8 },
  { id: 'r2', name: 'Amit Singh', avatar: '', phone: '+91 98765 12345', status: 'busy', vehicleType: 'Scooter', rating: 4.6, totalDeliveries: 850, distanceFromStore: '2.5 km', dailyDeliveries: 12 },
  { id: 'r3', name: 'Vikram Malhotra', avatar: '', phone: '+91 91234 56789', status: 'available', vehicleType: 'Electric', rating: 4.9, totalDeliveries: 2100, distanceFromStore: '0.8 km', dailyDeliveries: 5 },
  { id: 'r4', name: 'Sneha Gupta', avatar: '', phone: '+91 88888 77777', status: 'offline', vehicleType: 'Scooter', rating: 4.7, totalDeliveries: 450, distanceFromStore: '-', dailyDeliveries: 0 },
];

const MOCK_ORDERS: DeliveryOrder[] = [
  { 
    id: 'o1', 
    orderNumber: '#ORD-8821', 
    customerName: 'Priya Sharma', 
    customerArea: 'Koramangala', 
    address: 'Flat 402, Green Heights, 5th Block', 
    items: ['Butter Chicken', 'Garlic Naan (2)', 'Jeera Rice'], 
    totalAmount: 650, 
    status: 'cooking', 
    placedTime: '12:15 PM', 
    estimatedDeliveryTime: '12:55 PM', 
    prepProgress: 65 
  },
  { 
    id: 'o2', 
    orderNumber: '#ORD-8822', 
    customerName: 'Arjun Reddy', 
    customerArea: 'Indiranagar', 
    address: '12, 100ft Road, Near Metro', 
    items: ['Veg Biryani', 'Raita'], 
    totalAmount: 340, 
    status: 'ready', 
    placedTime: '12:20 PM', 
    estimatedDeliveryTime: '12:50 PM', 
    prepProgress: 100 
  },
  { 
    id: 'o3', 
    orderNumber: '#ORD-8820', 
    customerName: 'Neha Kapoor', 
    customerArea: 'HSR Layout', 
    address: 'Sector 2, House 45', 
    items: ['Paneer Tikka', 'Tandoori Roti (4)'], 
    totalAmount: 480, 
    status: 'on_the_way', 
    riderId: 'r2', 
    placedTime: '12:00 PM', 
    estimatedDeliveryTime: '12:40 PM', 
    prepProgress: 100 
  },
  { 
    id: 'o4', 
    orderNumber: '#ORD-8819', 
    customerName: 'David John', 
    customerArea: 'Whitefield', 
    address: 'Prestige Shantiniketan, Tower 5', 
    items: ['Grilled Sandwich', 'Cold Coffee'], 
    totalAmount: 290, 
    status: 'delivered', 
    riderId: 'r1', 
    placedTime: '11:30 AM', 
    estimatedDeliveryTime: '12:10 PM', 
    prepProgress: 100 
  },
];

const ANALYTICS_DATA = [
  { name: 'Mon', deliveries: 45, avgTime: 32 },
  { name: 'Tue', deliveries: 52, avgTime: 28 },
  { name: 'Wed', deliveries: 48, avgTime: 30 },
  { name: 'Thu', deliveries: 61, avgTime: 35 },
  { name: 'Fri', deliveries: 75, avgTime: 40 },
  { name: 'Sat', deliveries: 89, avgTime: 45 },
  { name: 'Sun', deliveries: 82, avgTime: 42 },
];

// --- Components ---

export function DeliveryManagement() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState<DeliveryOrder[]>(MOCK_ORDERS);
  const [riders, setRiders] = useState<Rider[]>(MOCK_RIDERS);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [isRiderModalOpen, setIsRiderModalOpen] = useState(false);

  // Stats for dashboard
  const stats = useMemo(() => ({
    cooking: orders.filter(o => o.status === 'cooking').length,
    ready: orders.filter(o => o.status === 'ready').length,
    onWay: orders.filter(o => o.status === 'on_the_way').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }), [orders]);

  // Handlers
  const handleAssignRider = (orderId: string, riderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'picked_up', riderId } : o));
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, status: 'busy' } : r));
    setIsRiderModalOpen(false);
    toast.success("Rider Assigned Successfully", { description: "The delivery partner has been notified." });
  };

  const handleStatusUpdate = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (newStatus === 'delivered') {
      toast.success("Order Delivered!", { description: "The order has been marked as completed." });
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1600px] mx-auto min-h-screen bg-gray-50/50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Delivery Management</h1>
          <p className="text-muted-foreground mt-1">Real-time tracking and fleet orchestration.</p>
        </div>
        <div className="flex items-center gap-2">
           <Button variant="outline" className="bg-white">
             <History className="h-4 w-4 mr-2" />
             Past Orders
           </Button>
           <Button className="bg-primary hover:bg-primary/90">
             <Truck className="h-4 w-4 mr-2" />
             Track All
           </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white p-1 rounded-xl border mb-6 w-full max-w-4xl grid grid-cols-5 h-auto">
          <TabsTrigger value="dashboard" className="rounded-lg py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-primary font-medium">Dashboard</TabsTrigger>
          <TabsTrigger value="active" className="rounded-lg py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-primary font-medium">Active Orders</TabsTrigger>
          <TabsTrigger value="tracking" className="rounded-lg py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-primary font-medium">Live Map</TabsTrigger>
          <TabsTrigger value="partners" className="rounded-lg py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-primary font-medium">Fleet</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg py-2.5 data-[state=active]:bg-gray-100 data-[state=active]:text-primary font-medium">Analytics</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* 1. Dashboard */}
            <TabsContent value="dashboard" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardCard 
                  title="Being Cooked" 
                  count={stats.cooking} 
                  icon={ChefHat} 
                  color="text-orange-600" 
                  bgColor="bg-orange-50" 
                  borderColor="border-orange-100"
                />
                <DashboardCard 
                  title="Ready for Pickup" 
                  count={stats.ready} 
                  icon={Package} 
                  color="text-blue-600" 
                  bgColor="bg-blue-50" 
                  borderColor="border-blue-100"
                />
                <DashboardCard 
                  title="On the Way" 
                  count={stats.onWay} 
                  icon={Bike} 
                  color="text-purple-600" 
                  bgColor="bg-purple-50" 
                  borderColor="border-purple-100"
                  animate
                />
                <DashboardCard 
                  title="Delivered Today" 
                  count={stats.delivered} 
                  icon={CheckCircle} 
                  color="text-green-600" 
                  bgColor="bg-green-50" 
                  borderColor="border-green-100"
                />
              </div>

              {/* Recent Activity / Timeline Preview */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 border-none shadow-sm">
                  <CardHeader>
                    <CardTitle>Live Activity</CardTitle>
                    <CardDescription>Real-time updates from your fleet.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {orders.slice(0, 3).map((order, i) => (
                         <div key={order.id} className="flex items-start gap-4">
                           <div className="flex flex-col items-center">
                             <div className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-primary'}`} />
                             {i !== 2 && <div className="w-0.5 h-full bg-gray-100 min-h-[40px] mt-2" />}
                           </div>
                           <div className="flex-1 -mt-1.5">
                             <div className="flex justify-between">
                               <p className="font-medium text-sm">{order.status === 'cooking' ? 'Order Started Cooking' : order.status === 'on_the_way' ? 'Out for Delivery' : 'Order Status Updated'}</p>
                               <span className="text-xs text-muted-foreground">{order.placedTime}</span>
                             </div>
                             <p className="text-sm text-muted-foreground mt-0.5">
                               {order.customerName} • {order.orderNumber}
                             </p>
                           </div>
                         </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-600 to-violet-700 text-white">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-indigo-100 text-sm">Avg. Delivery Time</p>
                      <p className="text-3xl font-bold mt-1">32 <span className="text-lg font-normal text-indigo-200">min</span></p>
                    </div>
                    <div>
                      <p className="text-indigo-100 text-sm">Active Riders</p>
                      <p className="text-3xl font-bold mt-1">12 <span className="text-lg font-normal text-indigo-200">/ 15</span></p>
                    </div>
                    <div className="pt-4 border-t border-indigo-500/30">
                       <Button variant="secondary" className="w-full text-indigo-700 bg-white hover:bg-indigo-50">
                         View Full Report
                       </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 2. Active Orders (Advanced Cards) */}
            <TabsContent value="active" className="mt-0 space-y-6">
              <div className="flex items-center gap-4 bg-white p-2 rounded-lg border shadow-sm w-fit mb-4">
                <Search className="h-4 w-4 text-muted-foreground ml-2" />
                <Input className="border-none focus-visible:ring-0 w-64 h-8" placeholder="Search orders..." />
                <Separator orientation="vertical" className="h-6" />
                <Button variant="ghost" size="sm" className="h-8">
                  <Filter className="h-4 w-4 mr-2" /> Filter
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map(order => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    onAction={() => {
                      setSelectedOrder(order);
                      if (order.status === 'ready') setIsRiderModalOpen(true);
                      else if (order.status === 'on_the_way') setActiveTab('tracking');
                    }}
                  />
                ))}
              </div>
            </TabsContent>

            {/* 5. Visual Map Tracking */}
            <TabsContent value="tracking" className="mt-0">
               <Card className="h-[700px] overflow-hidden border-none shadow-md relative bg-blue-50/30">
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                    {/* Abstract Map Background Pattern */}
                    <svg width="100%" height="100%">
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                      </pattern>
                      <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>
                 </div>

                 {/* Simulated Map UI */}
                 <div className="absolute inset-0 p-8 flex flex-col items-center justify-center">
                    <div className="relative w-full max-w-4xl h-full max-h-[600px] bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
                       {/* Sidebar List */}
                       <div className="w-full md:w-80 bg-gray-50 border-r flex flex-col">
                         <div className="p-4 border-b bg-white">
                           <h3 className="font-semibold">Active Deliveries</h3>
                           <p className="text-xs text-muted-foreground">3 Riders on road</p>
                         </div>
                         <ScrollArea className="flex-1">
                           <div className="p-2 space-y-2">
                             {orders.filter(o => o.status === 'on_the_way').map(o => (
                               <div key={o.id} className="p-3 bg-white border rounded-lg shadow-sm cursor-pointer hover:border-primary transition-colors">
                                 <div className="flex justify-between items-start">
                                    <span className="font-medium text-sm">{o.orderNumber}</span>
                                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[10px]">On Way</Badge>
                                 </div>
                                 <p className="text-xs text-muted-foreground mt-1">{o.address}</p>
                               </div>
                             ))}
                             {orders.filter(o => o.status === 'on_the_way').length === 0 && (
                               <div className="p-8 text-center text-muted-foreground text-sm">
                                 No riders currently on the road.
                               </div>
                             )}
                           </div>
                         </ScrollArea>
                       </div>

                       {/* Map Area */}
                       <div className="flex-1 relative bg-[#eef2f6] p-6">
                         {/* Restaurant Marker */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                           <div className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-primary">
                             <ChefHat className="h-6 w-6 text-primary" />
                           </div>
                           <span className="bg-white px-2 py-1 rounded text-xs font-bold mt-2 shadow-sm">Restaurant</span>
                         </div>

                         {/* Moving Riders Simulation */}
                         {orders.filter(o => o.status === 'on_the_way').map((o, idx) => (
                           <motion.div
                             key={o.id}
                             className="absolute flex flex-col items-center z-20"
                             initial={{ top: '50%', left: '50%' }}
                             animate={{ 
                               top: `${20 + (idx * 15)}%`, 
                               left: `${20 + (idx * 20)}%` 
                             }}
                             transition={{ 
                               duration: 10, 
                               repeat: Infinity, 
                               repeatType: "reverse",
                               ease: "easeInOut"
                             }}
                           >
                             <div className="w-10 h-10 bg-purple-600 text-white rounded-full shadow-lg flex items-center justify-center transform -scale-x-100">
                               <Bike className="h-5 w-5" />
                             </div>
                             <div className="bg-white px-2 py-1 rounded text-[10px] font-bold mt-1 shadow-sm whitespace-nowrap">
                               {riders.find(r => r.id === o.riderId)?.name.split(' ')[0]}
                             </div>
                           </motion.div>
                         ))}

                         {/* Customer Locations */}
                         <div className="absolute top-[20%] left-[20%] opacity-50">
                            <MapPin className="h-6 w-6 text-gray-400" />
                         </div>
                         <div className="absolute bottom-[30%] right-[20%] opacity-50">
                            <MapPin className="h-6 w-6 text-gray-400" />
                         </div>
                       </div>
                    </div>
                 </div>
               </Card>
            </TabsContent>

            {/* 7. Delivery Partner Management */}
            <TabsContent value="partners" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {riders.map(rider => (
                  <RiderCard key={rider.id} rider={rider} />
                ))}
                <Card className="flex flex-col items-center justify-center border-dashed border-2 bg-transparent hover:bg-gray-50 cursor-pointer transition-colors h-[280px]">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                  <p className="font-medium text-gray-900">Add New Rider</p>
                  <p className="text-sm text-muted-foreground">Register a delivery partner</p>
                </Card>
              </div>
            </TabsContent>

            {/* 8. Analytics */}
            <TabsContent value="analytics" className="mt-0 space-y-6">
               <Card>
                 <CardHeader>
                   <CardTitle>Delivery Performance</CardTitle>
                   <CardDescription>Average delivery times over the last 7 days.</CardDescription>
                 </CardHeader>
                 <CardContent className="h-[400px]">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={ANALYTICS_DATA}>
                       <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                       <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}m`} />
                       <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                       />
                       <Bar dataKey="avgTime" name="Avg Time (min)" radius={[4, 4, 0, 0]}>
                         {ANALYTICS_DATA.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === 5 ? '#4f46e5' : '#e0e7ff'} />
                         ))}
                       </Bar>
                     </BarChart>
                   </ResponsiveContainer>
                 </CardContent>
               </Card>
            </TabsContent>

          </motion.div>
        </AnimatePresence>
      </Tabs>

      {/* Rider Assignment Modal */}
      <Dialog open={isRiderModalOpen} onOpenChange={setIsRiderModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Assign Delivery Partner</DialogTitle>
            <DialogDescription>
              Select a rider for Order <span className="font-medium text-foreground">{selectedOrder?.orderNumber}</span>
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {riders.filter(r => r.status === 'available').map(rider => (
                <div key={rider.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={rider.avatar} />
                      <AvatarFallback>{rider.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{rider.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center"><Bike className="h-3 w-3 mr-1" /> {rider.vehicleType}</span>
                        <span>•</span>
                        <span className="flex items-center text-green-600"><MapPin className="h-3 w-3 mr-1" /> {rider.distanceFromStore} away</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => selectedOrder && handleAssignRider(selectedOrder.id, rider.id)}>
                    Assign
                  </Button>
                </div>
              ))}
              {riders.filter(r => r.status === 'available').length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No riders currently available.
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// --- Sub Components ---

function DashboardCard({ title, count, icon: Icon, color, bgColor, borderColor, animate }: any) {
  return (
    <Card className={`border-l-4 ${borderColor} ${animate ? 'relative overflow-hidden' : ''} shadow-sm`}>
      {animate && (
        <motion.div 
          className="absolute inset-0 bg-white/30 z-10"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
        />
      )}
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className={`text-3xl font-bold ${color}`}>{count}</h3>
        </div>
        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${bgColor}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function OrderCard({ order, onAction }: { order: DeliveryOrder, onAction: () => void }) {
  const isCooking = order.status === 'cooking';
  const isReady = order.status === 'ready';
  const isOnWay = order.status === 'on_the_way';
  const isDelivered = order.status === 'delivered';

  return (
    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className={`h-1.5 w-full ${isCooking ? 'bg-orange-500' : isReady ? 'bg-blue-500' : isOnWay ? 'bg-purple-600' : 'bg-green-500'}`} />
      <CardHeader className="pb-3 bg-white">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground uppercase">{order.orderNumber}</Badge>
              <Badge 
                className={`
                  ${isCooking ? 'bg-orange-100 text-orange-700 hover:bg-orange-100' : ''}
                  ${isReady ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : ''}
                  ${isOnWay ? 'bg-purple-100 text-purple-700 hover:bg-purple-100' : ''}
                  ${isDelivered ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}
                  border-0
                `}
              >
                {isCooking && <Flame className="h-3 w-3 mr-1 animate-pulse" />}
                {isOnWay && <Bike className="h-3 w-3 mr-1" />}
                {order.status.replace('_', ' ')}
              </Badge>
            </div>
            <CardTitle className="text-lg">{order.customerName}</CardTitle>
            <CardDescription className="text-xs">{order.customerArea}</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold">₹{order.totalAmount}</p>
            <p className="text-xs text-muted-foreground">{order.items.length} Items</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-4 bg-white">
        <div className="space-y-4">
          {/* Prep Status */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Preparation</span>
              <span>{order.prepProgress}%</span>
            </div>
            <Progress value={order.prepProgress} className="h-1.5" />
          </div>

          <div className="flex items-center gap-3 text-sm border-t pt-3">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Est. Delivery</p>
              <p className="font-medium">{order.estimatedDeliveryTime}</p>
            </div>
          </div>
          
          {order.riderId && (
            <div className="flex items-center gap-3 text-sm bg-gray-50 p-2 rounded-lg">
              <User className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                 <p className="text-xs text-muted-foreground">Rider</p>
                 <p className="font-medium">{MOCK_RIDERS.find(r => r.id === order.riderId)?.name}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-gray-50/50 pt-3 pb-3 border-t">
        <Button 
          className={`w-full ${isCooking ? 'opacity-50 cursor-not-allowed' : ''}`} 
          variant={isOnWay ? "secondary" : "default"}
          onClick={onAction}
          disabled={isCooking || isDelivered}
        >
          {isCooking ? 'Waiting for Kitchen...' : isReady ? 'Assign Rider' : isOnWay ? 'Track Live' : 'Completed'}
          {!isCooking && !isDelivered && <ChevronRight className="h-4 w-4 ml-1" />}
        </Button>
      </CardFooter>
    </Card>
  );
}

function RiderCard({ rider }: { rider: Rider }) {
  return (
    <Card className="overflow-hidden group hover:border-primary/50 transition-colors">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
          <AvatarImage src={rider.avatar} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">{rider.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-base">{rider.name}</CardTitle>
          <div className="flex items-center gap-1 mt-1">
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{rider.vehicleType}</Badge>
            <span className="text-xs text-muted-foreground flex items-center">
              <AlertCircle className="h-3 w-3 mr-0.5 inline" /> {rider.distanceFromStore}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-center py-2 bg-gray-50/50 rounded-lg mb-3">
          <div>
            <p className="text-lg font-bold">{rider.rating}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Rating</p>
          </div>
          <div>
            <p className="text-lg font-bold">{rider.dailyDeliveries}</p>
            <p className="text-[10px] text-muted-foreground uppercase">Today</p>
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className={`flex items-center gap-1.5 ${
            rider.status === 'available' ? 'text-green-600' : rider.status === 'busy' ? 'text-orange-600' : 'text-gray-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              rider.status === 'available' ? 'bg-green-600' : rider.status === 'busy' ? 'bg-orange-600' : 'bg-gray-400'
            }`} />
            {rider.status.charAt(0).toUpperCase() + rider.status.slice(1)}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
