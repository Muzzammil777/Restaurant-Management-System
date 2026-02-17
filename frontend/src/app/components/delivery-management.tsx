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
  Flame,
  ArrowRight,
  Timer,
  Navigation,
  LayoutDashboard,
  Users
} from 'lucide-react';
import { cn } from '@/app/components/ui/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid
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
import { Separator } from '@/app/components/ui/separator';
import { toast } from 'sonner';

// --- Types ---

type OrderStatus = 'cooking' | 'ready' | 'on_the_way' | 'delivered';

interface Rider {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  status: 'Available' | 'On Delivery' | 'Offline';
  vehicleNumber: string;
  rating: number;
  totalDeliveries: number;
}

interface DeliveryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerAddress: string;
  totalAmount: number;
  status: OrderStatus;
  riderId?: string;
  placedTime: string;
  eta: string;
  items: string[];
  destinationId: number; // 1-4 for map simulation
}

// --- Mock Data ---

const MOCK_RIDERS: Rider[] = [
  { id: 'r1', name: 'Rahul Kumar', avatar: '', phone: '+91 98765 43210', status: 'Available', vehicleNumber: 'KA-01-AB-1234', rating: 4.8, totalDeliveries: 1200 },
  { id: 'r2', name: 'Amit Singh', avatar: '', phone: '+91 98765 12345', status: 'On Delivery', vehicleNumber: 'KA-05-XY-9876', rating: 4.5, totalDeliveries: 850 },
  { id: 'r3', name: 'Vikram Malhotra', avatar: '', phone: '+91 91234 56789', status: 'Available', vehicleNumber: 'KA-53-ZZ-4567', rating: 4.9, totalDeliveries: 2100 },
  { id: 'r4', name: 'Sneha Gupta', avatar: '', phone: '+91 88888 77777', status: 'Offline', vehicleNumber: 'KA-03-MN-1122', rating: 4.7, totalDeliveries: 450 },
];

const INITIAL_ORDERS: DeliveryOrder[] = [
  { id: 'o1', orderNumber: '#ORD-8821', customerName: 'Priya Sharma', customerAddress: 'Flat 402, Green Heights', totalAmount: 650, status: 'cooking', placedTime: '12:15 PM', eta: '12:55 PM', items: ['Butter Chicken', 'Naan'], destinationId: 1 },
  { id: 'o2', orderNumber: '#ORD-8822', customerName: 'Arjun Reddy', customerAddress: '12, 100ft Road', totalAmount: 340, status: 'ready', placedTime: '12:20 PM', eta: '12:50 PM', items: ['Veg Biryani'], destinationId: 2 },
  { id: 'o3', orderNumber: '#ORD-8820', customerName: 'Neha Kapoor', customerAddress: 'Sector 2, HSR Layout', totalAmount: 480, status: 'on_the_way', riderId: 'r2', placedTime: '12:00 PM', eta: '12:40 PM', items: ['Paneer Tikka'], destinationId: 3 },
  { id: 'o4', orderNumber: '#ORD-8825', customerName: 'David John', customerAddress: 'Whitefield', totalAmount: 1200, status: 'on_the_way', riderId: 'r3', placedTime: '12:30 PM', eta: '1:15 PM', items: ['Family Pack'], destinationId: 4 },
];

const ANALYTICS_DATA = [
  { name: 'Mon', time: 32 }, { name: 'Tue', time: 28 }, { name: 'Wed', time: 30 },
  { name: 'Thu', time: 35 }, { name: 'Fri', time: 40 }, { name: 'Sat', time: 45 }, { name: 'Sun', time: 42 },
];

export function DeliveryManagement() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState<DeliveryOrder[]>(INITIAL_ORDERS);
  const [riders, setRiders] = useState<Rider[]>(MOCK_RIDERS);
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch riders and orders from MongoDB via backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ridersRes, ordersRes] = await Promise.all([
          fetch('http://localhost:8000/api/delivery/riders'),
          fetch('http://localhost:8000/api/delivery/orders'),
        ]);

        if (ridersRes.ok) {
          const ridersData = await ridersRes.json();
          if (ridersData.length > 0) {
            setRiders(ridersData.map((r: any) => ({
              id: r._id,
              name: r.name,
              avatar: r.avatar || '',
              phone: r.phone || '',
              status: r.status || 'Available',
              vehicleNumber: r.vehicleNumber || 'N/A',
              rating: r.rating || 5.0,
              totalDeliveries: r.totalDeliveries || 0,
            })));
          }
        }

        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          if (ordersData.length > 0) {
            setOrders(ordersData.map((o: any) => ({
              id: o._id,
              orderNumber: o.orderNumber || '#ORD-' + o._id?.substring(0, 4).toUpperCase(),
              customerName: o.customerName || 'Customer',
              customerAddress: o.customerAddress || 'Address pending',
              totalAmount: o.totalAmount || 0,
              status: o.deliveryStatus || 'cooking',
              riderId: o.riderId,
              placedTime: new Date(o.createdAt).toLocaleTimeString() || '12:00 PM',
              eta: o.eta || '1:00 PM',
              items: o.items || ['Item'],
              destinationId: Math.floor(Math.random() * 4) + 1,
            })));
          }
        }
      } catch (error) {
        console.error('Failed to fetch delivery data:', error);
        toast.error("Failed to load delivery data. Using demo data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Stats
  const stats = useMemo(() => ({
    cooking: orders.filter(o => o.status === 'cooking').length,
    ready: orders.filter(o => o.status === 'ready').length,
    out: orders.filter(o => o.status === 'on_the_way').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
  }), [orders]);

  // Actions
  const handleAssignRider = async (riderId: string) => {
    if (!selectedOrder) return;
    
    try {
      const res = await fetch(`http://localhost:8000/api/delivery/orders/${selectedOrder.id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rider_id: riderId }),
      });

      if (res.ok) {
        setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'on_the_way', riderId } : o));
        setRiders(prev => prev.map(r => r.id === riderId ? { ...r, status: 'On Delivery' } : r));
        toast.success("Rider Assigned", { description: `${riders.find(r => r.id === riderId)?.name} is now delivering Order ${selectedOrder.orderNumber}` });
      } else {
        toast.error("Failed to assign rider");
      }
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error("Error assigning rider");
    }
    setIsAssignModalOpen(false);
  };

  return (
    <div className="bg-delivery-module min-h-screen pb-20">
      <div className="max-w-[1800px] mx-auto p-6 space-y-8">
        
        {/* Header */}
        <div className="module-container flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-lg">Delivery Management</h1>
            <p className="text-gray-200 mt-1">Live fleet orchestration and order tracking.</p>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="bg-white" onClick={() => setIsReportOpen(true)}>
               <BarChart3 className="h-4 w-4 mr-2" /> View Full Report
             </Button>
             <Button onClick={() => setActiveTab('tracking')} className="bg-indigo-600 hover:bg-indigo-700 text-white">
               <MapIcon className="h-4 w-4 mr-2" /> Live Map View
             </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="w-full overflow-x-auto pb-4">
          <nav className="flex gap-3 min-w-max p-1">
            {[
              { id: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard, description: 'Live fleet metrics' },
              { id: 'active', label: 'Active Deliveries', icon: Bike, description: 'Track ongoing orders' },
              { id: 'tracking', label: 'Live Tracking Map', icon: MapIcon, description: 'Real-time geography' },
              { id: 'riders', label: 'Rider Fleet', icon: Users, description: 'Manage delivery partners' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg transition-colors text-left min-w-[220px]',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-white border border-border hover:bg-muted shadow-sm'
                  )}
                >
                  <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', isActive ? '' : 'text-muted-foreground')} />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium', isActive ? '' : '')}>
                      {item.label}
                    </p>
                    <p className={cn('text-xs mt-0.5', isActive ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* TabsList removed and replaced by horizontal nav above */}

          {/* DASHBOARD */}
          <TabsContent value="dashboard" className="space-y-6 animate-in fade-in-50">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <DashboardCard title="Cooking Now" count={stats.cooking} icon={ChefHat} color="text-orange-600" bg="bg-orange-50" />
               <DashboardCard title="Ready for Pickup" count={stats.ready} icon={Package} color="text-blue-600" bg="bg-blue-50" />
               <DashboardCard title="Out for Delivery" count={stats.out} icon={Bike} color="text-purple-600" bg="bg-purple-50" animate />
               <DashboardCard title="Delivered Today" count={stats.delivered} icon={CheckCircle} color="text-green-600" bg="bg-green-50" />
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-sm">
                  <CardHeader>
                    <CardTitle>Delivery Timeline</CardTitle>
                    <CardDescription>Real-time status of recent orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {orders.map((order, i) => (
                        <div key={order.id} className="relative pl-8 border-l-2 border-gray-100 last:border-0 pb-6 last:pb-0">
                          <div className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-white shadow-sm 
                            ${order.status === 'delivered' ? 'bg-green-500' : 
                              order.status === 'on_the_way' ? 'bg-purple-500' : 
                              order.status === 'ready' ? 'bg-blue-500' : 'bg-orange-500'}`} 
                          />
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 p-3 bg-gray-50 rounded-lg -mt-2">
                             <div>
                               <p className="font-semibold text-sm">{order.orderNumber} • {order.customerName}</p>
                               <p className="text-xs text-muted-foreground">{order.items.join(', ')}</p>
                             </div>
                             <div className="flex items-center gap-3">
                               <Badge variant="outline" className="bg-white">
                                 {order.status === 'cooking' && <Flame className="h-3 w-3 mr-1 text-orange-500" />}
                                 {order.status === 'on_the_way' && <Bike className="h-3 w-3 mr-1 text-purple-500" />}
                                 {order.status.replace(/_/g, ' ')}
                               </Badge>
                               <span className="text-xs font-mono text-muted-foreground">{order.eta}</span>
                             </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <CookingStatusView orders={orders} />
             </div>
          </TabsContent>

          {/* ACTIVE ORDERS */}
          <TabsContent value="active" className="space-y-6 animate-in fade-in-50">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
               <div className="flex items-center gap-3 w-full max-w-md">
                 <Search className="h-4 w-4 text-muted-foreground" />
                 <Input placeholder="Search active orders..." className="border-none shadow-none focus-visible:ring-0" />
               </div>
               <Button variant="ghost"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {orders.map(order => (
                <Card key={order.id} className="border-none shadow-md hover:shadow-lg transition-all group">
                   <div className={`h-1 w-full 
                     ${order.status === 'cooking' ? 'bg-orange-500' : 
                       order.status === 'ready' ? 'bg-blue-500' : 
                       order.status === 'on_the_way' ? 'bg-purple-600' : 'bg-green-500'}`} 
                   />
                   <CardHeader className="pb-2">
                     <div className="flex justify-between items-start">
                       <div>
                         <Badge variant="secondary" className="mb-2">{order.orderNumber}</Badge>
                         <CardTitle className="text-lg">{order.customerName}</CardTitle>
                         <CardDescription>{order.customerAddress}</CardDescription>
                       </div>
                       <div className="text-right">
                         <p className="font-bold">₹{order.totalAmount}</p>
                         <p className="text-xs text-muted-foreground">{order.items?.length || 0} Items</p>
                       </div>
                     </div>
                   </CardHeader>
                   <CardContent className="py-4 space-y-4">
                     <div className="flex items-center justify-between text-sm">
                       <span className="text-muted-foreground flex items-center"><Clock className="h-3 w-3 mr-1" /> ETA</span>
                       <span className="font-medium">{order.eta}</span>
                     </div>
                     
                     {order.riderId && (
                       <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                         <Avatar className="h-8 w-8">
                           <AvatarFallback>RK</AvatarFallback>
                         </Avatar>
                         <div className="flex-1 overflow-hidden">
                           <p className="text-xs font-semibold truncate">{riders.find(r => r.id === order.riderId)?.name}</p>
                           <p className="text-[10px] text-muted-foreground">Rider Assigned</p>
                         </div>
                         <Button size="icon" variant="ghost" className="h-6 w-6"><Phone className="h-3 w-3" /></Button>
                       </div>
                     )}
                   </CardContent>
                   <CardFooter className="pt-2">
                     {order.status === 'ready' ? (
                       <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => { setSelectedOrder(order); setIsAssignModalOpen(true); }}>
                         <Bike className="h-4 w-4 mr-2" /> Assign Rider
                       </Button>
                     ) : order.status === 'on_the_way' ? (
                       <Button className="w-full" variant="secondary" onClick={() => setActiveTab('tracking')}>
                         <MapIcon className="h-4 w-4 mr-2" /> Track Live
                       </Button>
                     ) : (
                       <Button className="w-full" variant="outline" disabled>
                         <Clock className="h-4 w-4 mr-2" /> Cooking...
                       </Button>
                     )}
                   </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* LIVE TRACKING MAP */}
          <TabsContent value="tracking" className="animate-in fade-in-50">
             <Card className="h-[750px] border-none shadow-lg bg-[#f0f4f8] relative overflow-hidden flex">
               {/* Side Panel */}
               <div className="w-80 bg-white border-r z-20 flex flex-col shadow-xl">
                 <div className="p-4 border-b">
                   <h3 className="font-bold flex items-center gap-2"><Navigation className="h-5 w-5 text-indigo-600" /> Active Fleet</h3>
                   <p className="text-xs text-muted-foreground mt-1">
                     {orders.filter(o => o.status === 'on_the_way').length} riders currently on road
                   </p>
                 </div>
                 <ScrollArea className="flex-1 p-4">
                   <div className="space-y-3">
                     {orders.filter(o => o.status === 'on_the_way').map(order => (
                       <div key={order.id} className="p-3 border rounded-xl bg-white shadow-sm hover:border-indigo-500 cursor-pointer transition-all">
                         <div className="flex justify-between items-start mb-2">
                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-none text-[10px]">ON WAY</Badge>
                            <span className="text-xs font-mono text-gray-500">{order.eta}</span>
                         </div>
                         <h4 className="font-medium text-sm">{order.customerName}</h4>
                         <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                           <Bike className="h-3 w-3" />
                           {riders.find(r => r.id === order.riderId)?.name}
                         </div>
                       </div>
                     ))}
                   </div>
                 </ScrollArea>
               </div>

               {/* Map Area */}
               <div className="flex-1 relative overflow-hidden">
                  <LiveTrackingMap orders={orders} riders={riders} />
               </div>
             </Card>
          </TabsContent>

          {/* RIDERS FLEET */}
          <TabsContent value="riders" className="space-y-6 animate-in fade-in-50">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {riders.map(rider => (
                  <Card key={rider.id} className="border-none shadow-md overflow-hidden">
                    <div className={`h-2 w-full ${rider.status === 'Available' ? 'bg-green-500' : rider.status === 'Offline' ? 'bg-gray-300' : 'bg-orange-500'}`} />
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                       <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                         <AvatarFallback>{rider.name.charAt(0)}</AvatarFallback>
                       </Avatar>
                       <div>
                         <CardTitle className="text-base">{rider.name}</CardTitle>
                         <p className="text-xs text-muted-foreground">{rider.vehicleNumber}</p>
                       </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="flex justify-between text-sm border-b pb-2">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant={rider.status === 'Available' ? 'default' : 'secondary'} className={rider.status === 'Available' ? 'bg-green-600' : ''}>
                            {rider.status}
                          </Badge>
                       </div>
                       <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Rating</span>
                          <span className="font-bold flex items-center text-yellow-600">★ {rider.rating}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Deliveries</span>
                          <span className="font-bold">{rider.totalDeliveries}</span>
                       </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">Manage Profile</Button>
                    </CardFooter>
                  </Card>
                ))}
             </div>
          </TabsContent>

        </Tabs>

        {/* Modals */}
        <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Assign Delivery Partner</DialogTitle>
              <DialogDescription>
                Select an available rider for order <span className="font-bold text-foreground">{selectedOrder?.orderNumber}</span>.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2 mt-2">
                {riders.filter(r => r.status === 'Available').map(rider => (
                  <div key={rider.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{rider.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{rider.name}</p>
                        <div className="flex gap-2 text-xs text-muted-foreground">
                          <span className="flex items-center"><Bike className="h-3 w-3 mr-1" /> Bike</span>
                          <span>★ {rider.rating}</span>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleAssignRider(rider.id)}>Assign</Button>
                  </div>
                ))}
                {riders.filter(r => r.status === 'Available').length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">No riders available right now.</div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Analytics Report Modal */}
        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Delivery Performance Report</DialogTitle>
              <DialogDescription>Weekly analysis of delivery times and rider efficiency.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
               <Card className="border-none shadow-none bg-gray-50">
                 <CardHeader>
                   <CardTitle className="text-base">Average Delivery Time (mins)</CardTitle>
                 </CardHeader>
                 <CardContent className="h-[250px]">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={ANALYTICS_DATA}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} />
                       <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                       <YAxis axisLine={false} tickLine={false} fontSize={12} />
                       <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                       <Bar dataKey="time" fill="#4f46e5" radius={[4,4,0,0]} barSize={30} />
                     </BarChart>
                   </ResponsiveContainer>
                 </CardContent>
               </Card>
               <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <h4 className="font-semibold text-green-900">On-Time Rate</h4>
                    <p className="text-3xl font-bold text-green-700">94.2%</p>
                    <p className="text-xs text-green-600 mt-1">Top 5% in your area</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="font-semibold text-blue-900">Total Deliveries (Week)</h4>
                    <p className="text-3xl font-bold text-blue-700">1,245</p>
                    <p className="text-xs text-blue-600 mt-1">+12% from last week</p>
                  </div>
               </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsReportOpen(false)}>Close Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}

// --- Sub-Components ---

function DashboardCard({ title, count, icon: Icon, color, bg, animate }: any) {
  return (
    <Card className={`border-none shadow-sm ${bg} bg-opacity-30 relative overflow-hidden`}>
      {animate && (
         <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]" />
      )}
      <CardContent className="p-6 flex items-center justify-between relative z-10">
        <div>
           <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
           <h3 className={`text-4xl font-bold ${color}`}>{count}</h3>
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center bg-white shadow-sm`}>
           <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function CookingStatusView({ orders }: { orders: DeliveryOrder[] }) {
  const cookingOrders = orders.filter(o => o.status === 'cooking');
  
  return (
    <Card className="border-none shadow-md bg-gradient-to-br from-orange-500 to-red-600 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 p-10 opacity-10">
        <ChefHat className="w-40 h-40" />
      </div>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 animate-bounce" /> Kitchen Live Status
        </CardTitle>
        <CardDescription className="text-orange-100">
          Orders currently being prepared. Rider assignment is locked until 'Ready'.
        </CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="space-y-4 mt-2">
          {cookingOrders.length > 0 ? cookingOrders.map(order => (
            <div key={order.id} className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20">
               <div className="flex justify-between items-center mb-2">
                 <span className="font-bold text-sm">{order.orderNumber}</span>
                 <span className="text-xs bg-black/20 px-2 py-0.5 rounded text-orange-100">Prep: 65%</span>
               </div>
               <Progress value={65} className="h-1.5 bg-black/20" indicatorClassName="bg-white" />
               <p className="text-xs mt-2 text-orange-50">Est. Ready in 12 mins</p>
            </div>
          )) : (
            <div className="text-center py-8 text-orange-100 opacity-70">
              No orders in cooking stage.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Custom Visual Map Component
function LiveTrackingMap({ orders, riders }: { orders: DeliveryOrder[], riders: Rider[] }) {
  // SVG Paths for 4 directions
  const paths = {
    1: "M 400 300 Q 600 300 700 100", // Top Right
    2: "M 400 300 Q 200 300 100 100", // Top Left
    3: "M 400 300 Q 600 500 700 500", // Bottom Right
    4: "M 400 300 Q 200 500 100 500"  // Bottom Left
  };

  return (
    <div className="w-full h-full bg-[#eef2f6] relative">
       {/* Background Grid Pattern */}
       <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
            style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
       />

       {/* Map Canvas */}
       <svg className="w-full h-full absolute inset-0 pointer-events-none" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          {/* Roads */}
          {Object.entries(paths).map(([key, d]) => (
            <path key={key} d={d} fill="none" stroke="white" strokeWidth="20" strokeLinecap="round" className="drop-shadow-sm" />
          ))}
          {/* Road Borders */}
          {Object.entries(paths).map(([key, d]) => (
            <path key={`b-${key}`} d={d} fill="none" stroke="#cbd5e1" strokeWidth="22" strokeLinecap="round" className="z-[-1]" style={{opacity: 0.5}} />
          ))}
       </svg>

       {/* Restaurant Center */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-indigo-600 relative">
             <div className="absolute inset-0 rounded-full border border-indigo-100 animate-ping opacity-20" />
             <ChefHat className="h-8 w-8 text-indigo-600" />
          </div>
          <Badge className="mt-2 bg-indigo-900 text-white border-none shadow-lg z-30">Central Kitchen</Badge>
       </div>

       {/* Customer Houses */}
       <div className="absolute top-[15%] right-[10%] flex flex-col items-center">
          <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-green-600"><MapPin className="h-5 w-5" /></div>
          <span className="text-[10px] font-bold text-gray-500 bg-white/80 px-1 rounded mt-1">Area 1</span>
       </div>
       <div className="absolute top-[15%] left-[10%] flex flex-col items-center">
          <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-green-600"><MapPin className="h-5 w-5" /></div>
          <span className="text-[10px] font-bold text-gray-500 bg-white/80 px-1 rounded mt-1">Area 2</span>
       </div>
       <div className="absolute bottom-[15%] right-[10%] flex flex-col items-center">
          <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-green-600"><MapPin className="h-5 w-5" /></div>
          <span className="text-[10px] font-bold text-gray-500 bg-white/80 px-1 rounded mt-1">Area 3</span>
       </div>
       <div className="absolute bottom-[15%] left-[10%] flex flex-col items-center">
          <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center text-green-600"><MapPin className="h-5 w-5" /></div>
          <span className="text-[10px] font-bold text-gray-500 bg-white/80 px-1 rounded mt-1">Area 4</span>
       </div>

       {/* Moving Bikes */}
       {orders.filter(o => o.status === 'on_the_way').map((order, i) => {
         // Determine animation path coordinates based on destinationId
         // Simplified animation using CSS keyframes or motion values
         // For a truly complex path animation we would use motion offset-path, but simple linear interpolation works for 'dummy'
         
         const dest = order.destinationId;
         const start = { x: '50%', y: '50%' };
         const end = 
            dest === 1 ? { x: '85%', y: '20%' } :
            dest === 2 ? { x: '15%', y: '20%' } :
            dest === 3 ? { x: '85%', y: '80%' } :
            { x: '15%', y: '80%' };

         return (
           <motion.div
             key={order.id}
             className="absolute z-40 flex flex-col items-center"
             initial={start}
             animate={end}
             transition={{ 
               duration: 15 + i * 2, // Different speeds
               repeat: Infinity,
               repeatType: "reverse",
               ease: "linear"
             }}
           >
             <div className="w-10 h-10 bg-purple-600 text-white rounded-full shadow-lg border-2 border-white flex items-center justify-center transform hover:scale-110 transition-transform">
               <Bike className="h-5 w-5" />
             </div>
             <div className="bg-white/90 backdrop-blur px-2 py-0.5 rounded text-[9px] font-bold mt-1 shadow-sm border border-purple-100 whitespace-nowrap">
               {riders.find(r => r.id === order.riderId)?.name.split(' ')[0] || 'Rider'}
             </div>
           </motion.div>
         );
       })}
    </div>
  );
}

