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
  BarChart3, 
  Navigation,
  LayoutDashboard,
  Users,
  AlertTriangle,
  ArrowRight,
  Star,
  Dot
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
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Progress } from '@/app/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
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
  destinationId: number;
  distance?: number;
}

// --- Mock Data ---

const MOCK_RIDERS: Rider[] = [
  { id: 'r1', name: 'Rahul Kumar', avatar: '', phone: '+91 98765 43210', status: 'Available', vehicleNumber: 'KA-01-AB-1234', rating: 4.8, totalDeliveries: 1200 },
  { id: 'r2', name: 'Amit Singh', avatar: '', phone: '+91 98765 12345', status: 'On Delivery', vehicleNumber: 'KA-05-XY-9876', rating: 4.5, totalDeliveries: 850 },
  { id: 'r3', name: 'Vikram Malhotra', avatar: '', phone: '+91 91234 56789', status: 'Available', vehicleNumber: 'KA-53-ZZ-4567', rating: 4.9, totalDeliveries: 2100 },
];

const INITIAL_ORDERS: DeliveryOrder[] = [
  { id: 'o1', orderNumber: '#ORD-8821', customerName: 'Priya Sharma', customerAddress: 'Flat 402, Green Heights', totalAmount: 650, status: 'cooking', placedTime: '12:15 PM', eta: '12:55 PM', items: ['Butter Chicken', 'Naan'], destinationId: 1, distance: 3.2 },
  { id: 'o2', orderNumber: '#ORD-8822', customerName: 'Arjun Reddy', customerAddress: '12, 100ft Road', totalAmount: 340, status: 'ready', placedTime: '12:20 PM', eta: '12:50 PM', items: ['Veg Biryani'], destinationId: 2, distance: 2.8 },
  { id: 'o3', orderNumber: '#ORD-8820', customerName: 'Neha Kapoor', customerAddress: 'Sector 2, HSR Layout', totalAmount: 480, status: 'on_the_way', riderId: 'r2', placedTime: '12:00 PM', eta: '12:40 PM', items: ['Paneer Tikka'], destinationId: 3, distance: 1.5 },
  { id: 'o4', orderNumber: '#ORD-8825', customerName: 'David John', customerAddress: 'Whitefield', totalAmount: 1200, status: 'on_the_way', riderId: 'r3', placedTime: '12:30 PM', eta: '1:15 PM', items: ['Family Pack'], destinationId: 4, distance: 4.2 },
  { id: 'o5', orderNumber: '#ORD-8819', customerName: 'Sarah Williams', customerAddress: 'MG Road, Bangalore', totalAmount: 520, status: 'delivered', riderId: 'r1', placedTime: '11:45 AM', eta: '12:20 PM', items: ['Masala Dosa'], destinationId: 1, distance: 0 },
];

const ANALYTICS_DATA = [
  { name: 'Mon', time: 32 }, { name: 'Tue', time: 28 }, { name: 'Wed', time: 30 },
  { name: 'Thu', time: 35 }, { name: 'Fri', time: 40 }, { name: 'Sat', time: 45 }, { name: 'Sun', time: 42 },
];

// --- Premium Delivery Management Component ---

export function DeliveryManagementPremium() {
  const [orders, setOrders] = useState<DeliveryOrder[]>(INITIAL_ORDERS);
  const [riders, setRiders] = useState<Rider[]>(MOCK_RIDERS);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Stats
  const stats = useMemo(() => ({
    cooking: orders.filter(o => o.status === 'cooking').length,
    ready: orders.filter(o => o.status === 'ready').length,
    onWay: orders.filter(o => o.status === 'on_the_way').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    avgTime: Math.round(ANALYTICS_DATA.reduce((a, b) => a + b.time, 0) / ANALYTICS_DATA.length),
  }), [orders]);

  // Actions
  const handleAssignRider = (riderId: string) => {
    if (!selectedOrder) return;
    
    setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'on_the_way', riderId } : o));
    setRiders(prev => prev.map(r => r.id === riderId ? { ...r, status: 'On Delivery' } : r));
    
    const riderName = riders.find(r => r.id === riderId)?.name || 'Rider';
    toast.success("✓ Rider Assigned", { description: `${riderName} is now delivering ${selectedOrder.orderNumber}` });
    setIsAssignModalOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9F3' }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold" style={{ color: '#2D2D2D' }}>Delivery Management</h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <Dot className="h-2 w-2" style={{ fill: '#4CAF50' }} />
                Real-time fleet orchestration
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="rounded-12" onClick={() => setIsReportOpen(true)}>
                <BarChart3 className="h-4 w-4 mr-2" /> Reports
              </Button>
              <Button className="rounded-12" style={{ background: 'linear-gradient(135deg, #C9A27D, #A68968)' }} onClick={() => setActiveTab('tracking')}>
                <MapIcon className="h-4 w-4 mr-2" /> Live Map
              </Button>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          <PremiumKPICard label="Cooking" value={stats.cooking} color="#FF9800" icon={ChefHat} />
          <PremiumKPICard label="Ready" value={stats.ready} color="#3498DB" icon={Package} />
          <PremiumKPICard label="On Way" value={stats.onWay} color="#9B59B6" icon={Bike} />
          <PremiumKPICard label="Delivered" value={stats.delivered} color="#4CAF50" icon={CheckCircle} />
          <PremiumKPICard label="Avg Time" value={`${stats.avgTime}m`} color="#C9A27D" icon={Clock} />
        </motion.div>

        {/* Tab Navigation */}
        <motion.div 
          className="flex gap-3 mb-8 overflow-x-auto pb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'active', label: 'Active Orders', icon: Truck },
            { id: 'tracking', label: 'Live Tracking', icon: MapIcon },
            { id: 'riders', label: 'Riders', icon: Users },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-12 font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-gray-600 hover:text-gray-900 border border-gray-200 bg-white'
              }`}
              style={activeTab === tab.id ? {
                background: 'linear-gradient(135deg, #C9A27D, #A68968)',
                boxShadow: '0 4px 12px rgba(201, 162, 125, 0.2)'
              } : {}}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </motion.button>
          ))}
        </motion.div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Order Timeline */}
            <motion.div 
              className="p-8 rounded-[20px]" 
              style={{ backgroundColor: '#FFFFFF', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-2xl font-bold mb-8">Order Timeline</h2>
              <div className="space-y-6">
                {orders.filter(o => o.status !== 'delivered').map((order, idx) => (
                  <TimelineItem key={order.id} order={order} index={idx} totalOrders={orders.length} />
                ))}
              </div>
            </motion.div>

            {/* Kitchen Status */}
            <KitchenStatusSection orders={orders} />
          </motion.div>
        )}

        {/* Active Orders Tab */}
        {activeTab === 'active' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Search/Filter */}
            <div className="flex gap-4 p-6 rounded-[18px]" style={{ backgroundColor: '#FFFFFF' }}>
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                <Input placeholder="Search orders..." className="pl-12 border-0 bg-gray-50 rounded-12" />
              </div>
              <Button variant="outline" className="rounded-12">
                <Filter className="h-4 w-4 mr-2" /> Filter
              </Button>
            </div>

            {/* Order Cards */}
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
            >
              {orders.map((order, idx) => (
                <PremiumOrderCard 
                  key={order.id} 
                  order={order} 
                  rider={riders.find(r => r.id === order.riderId)}
                  onAssign={() => { setSelectedOrder(order); setIsAssignModalOpen(true); }}
                  index={idx}
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Tracking Map Tab */}
        {activeTab === 'tracking' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="rounded-[20px] overflow-hidden" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}>
              <PremiumLiveMap orders={orders} riders={riders} />
            </div>
          </motion.div>
        )}

        {/* Riders Tab */}
        {activeTab === 'riders' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {riders.map((rider, idx) => (
              <PremiumRiderCard key={rider.id} rider={rider} index={idx} />
            ))}
          </motion.div>
        )}

        {/* Assign Rider Modal */}
        <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
          <DialogContent className="rounded-[20px]">
            <DialogHeader>
              <DialogTitle>Assign Delivery Partner</DialogTitle>
              <DialogDescription>
                Select an available rider for order <span className="font-bold">{selectedOrder?.orderNumber}</span>
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {riders.filter(r => r.status === 'Available').map((rider) => (
                  <motion.div 
                    key={rider.id} 
                    whileHover={{ scale: 1.02 }}
                    className="p-4 rounded-12 border border-gray-200 hover:border-[#C9A27D] transition-all cursor-pointer"
                    style={{ backgroundColor: '#FFFFFF' }}
                    onClick={() => handleAssignRider(rider.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{rider.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-gray-900">{rider.name}</p>
                          <p className="text-xs text-gray-500">{rider.vehicleNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-[#C9A27D]">★ {rider.rating}</p>
                        <p className="text-xs text-gray-500">{rider.totalDeliveries} deliveries</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
                {riders.filter(r => r.status === 'Available').length === 0 && (
                  <p className="text-center py-8 text-gray-500">No available riders</p>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Reports Modal */}
        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <DialogContent className="max-w-2xl rounded-[20px]">
            <DialogHeader>
              <DialogTitle>Delivery Performance Report</DialogTitle>
              <DialogDescription>Weekly analysis of delivery metrics</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              <div className="p-6 rounded-[16px]" style={{ backgroundColor: '#F8F6F3' }}>
                <h3 className="font-semibold text-gray-900 mb-4">Avg. Delivery Time (mins)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={ANALYTICS_DATA}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{fill: 'rgba(201, 162, 125, 0.1)'}} />
                    <Bar dataKey="time" fill="#C9A27D" radius={[8,8,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                <div className="p-6 rounded-[16px]" style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
                  <p className="text-sm font-medium text-gray-600 mb-2">On-Time Rate</p>
                  <p className="text-3xl font-bold" style={{ color: '#4CAF50' }}>94.2%</p>
                  <p className="text-xs text-gray-600 mt-2">Top 5% in your area</p>
                </div>
                <div className="p-6 rounded-[16px]" style={{ backgroundColor: 'rgba(52, 152, 219, 0.1)' }}>
                  <p className="text-sm font-medium text-gray-600 mb-2">Total Deliveries (Week)</p>
                  <p className="text-3xl font-bold" style={{ color: '#3498DB' }}>1,245</p>
                  <p className="text-xs text-gray-600 mt-2">+12% from last week</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => setIsReportOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}

// --- Sub Components ---

function PremiumKPICard({ label, value, color, icon: Icon }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="p-6 rounded-[16px]" 
      style={{ 
        backgroundColor: '#FFFFFF',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderLeft: `6px solid ${color}`
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className="h-6 w-6" style={{ color, opacity: 0.2 }} />
      </div>
    </motion.div>
  );
}

function TimelineItem({ order, index }: any) {
  const stages = [
    { status: 'cooking', label: 'Order Confirmed', icon: ChefHat },
    { status: 'ready', label: 'Kitchen Ready', icon: CheckCircle },
    { status: 'on_the_way', label: 'On the Way', icon: Truck },
    { status: 'delivered', label: 'Delivered', icon: CheckCircle },
  ];

  const currentStageIndex = stages.findIndex(s => s.status === order.status);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="pb-8"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-semibold text-gray-900">{order.orderNumber} • {order.customerName}</p>
          <p className="text-sm text-gray-600 mt-1">{order.customerAddress}</p>
        </div>
        <Badge style={{ backgroundColor: '#C9A27D', color: 'white' }} className="rounded-8">₹{order.totalAmount}</Badge>
      </div>

      {/* Timeline */}
      <div className="flex gap-2">
        {stages.map((stage, idx) => (
          <div key={stage.status} className="flex-1">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`w-full py-3 px-4 rounded-12 text-center text-xs font-bold transition-all ${
                idx <= currentStageIndex
                  ? 'text-white'
                  : 'bg-gray-100 text-gray-600'
              }`}
              style={idx <= currentStageIndex ? {
                background: 'linear-gradient(135deg, #C9A27D, #A68968)',
                boxShadow: '0 2px 8px rgba(201, 162, 125, 0.2)'
              } : {}}
            >
              {stage.label}
            </motion.div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function KitchenStatusSection({ orders }: any) {
  const cookingOrders = orders.filter((o: any) => o.status === 'cooking');

  return (
    <motion.div 
      className="p-8 rounded-[20px] border-2"
      style={{ 
        backgroundColor: '#FFF8F3',
        borderColor: '#FFB89C',
        boxShadow: '0 4px 16px rgba(255, 152, 0, 0.1)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <ChefHat className="h-6 w-6" style={{ color: '#FF9800' }} />
        <span style={{ color: '#FF6F00' }}>Kitchen Live Status</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cookingOrders.length > 0 ? cookingOrders.map((order: any) => (
          <motion.div 
            key={order.id}
            className="p-4 rounded-12" 
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex justify-between items-start mb-3">
              <p className="font-semibold text-gray-900">{order.orderNumber}</p>
              <Badge style={{ backgroundColor: '#FF9800', color: 'white' }} className="rounded-8 text-xs">
                Prep: 65%
              </Badge>
            </div>
            <Progress value={65} className="h-2 mb-2 bg-gray-200" />
            <p className="text-xs text-gray-600">Est. Ready in 12 mins</p>
          </motion.div>
        )) : (
          <p className="col-span-full text-center py-8 text-gray-500">No orders in cooking stage</p>
        )}
      </div>
    </motion.div>
  );
}

function PremiumOrderCard({ order, rider, onAssign, index }: any) {
  const getStatusColor = (status: OrderStatus) => {
    if (status === 'cooking') return '#FF9800';
    if (status === 'ready') return '#3498DB';
    if (status === 'on_the_way') return '#9B59B6';
    return '#4CAF50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="p-6 rounded-[18px] border-2 border-gray-200"
      style={{ 
        backgroundColor: '#FFFFFF',
        borderLeft: `6px solid ${getStatusColor(order.status)}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <Badge variant="outline" className="rounded-8 text-xs mb-2">{order.orderNumber}</Badge>
          <h3 className="font-bold text-gray-900">{order.customerName}</h3>
          <p className="text-xs text-gray-600 mt-1">{order.customerAddress}</p>
        </div>
        <p className="text-lg font-bold text-[#C9A27D]">₹{order.totalAmount}</p>
      </div>

      {/* Items */}
      <div className="mb-4 pb-4 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-600 mb-2">Items</p>
        <p className="text-sm text-gray-700">{order.items.join(', ')}</p>
      </div>

      {/* Distance & ETA */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">{order.distance} km</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-gray-600">{order.eta}</span>
        </div>
      </div>

      {/* Rider Info */}
      {rider && (
        <div className="p-3 rounded-12 mb-4" style={{ backgroundColor: '#F8F6F3' }}>
          <p className="text-xs font-medium text-gray-600 mb-2">Rider Assigned</p>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{rider.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900">{rider.name}</p>
              <p className="text-xs text-gray-600">{rider.vehicleNumber}</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAssign}
        className={`w-full py-2 px-3 rounded-12 text-sm font-medium transition-all ${
          order.status === 'ready'
            ? 'text-white'
            : 'bg-gray-100 text-gray-700'
        }`}
        style={order.status === 'ready' ? {
          background: 'linear-gradient(135deg, #C9A27D, #A68968)',
          boxShadow: '0 2px 8px rgba(201, 162, 125, 0.2)'
        } : {}}
        disabled={order.status === 'cooking'}
      >
        {order.status === 'ready' && <><Bike className="h-4 w-4 mr-2 inline" /> Assign Rider</>}
        {order.status === 'on_the_way' && <><MapIcon className="h-4 w-4 mr-2 inline" /> Track Live</>}
        {order.status === 'cooking' && <>Cooking...</>}
      </motion.button>
    </motion.div>
  );
}

function PremiumRiderCard({ rider, index }: any) {
  const getStatusColor = (status: string) => {
    if (status === 'Available') return '#4CAF50';
    if (status === 'On Delivery') return '#FF9800';
    return '#999999';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="p-6 rounded-[18px] border-2"
      style={{ 
        backgroundColor: '#FFFFFF',
        borderColor: `${getStatusColor(rider.status)}40`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <Avatar className="h-16 w-16 border-4" style={{ borderColor: '#C9A27D' }}>
          <AvatarFallback className="text-lg">{rider.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: getStatusColor(rider.status) }}
        />
      </div>

      <h3 className="font-bold text-gray-900 text-lg">{rider.name}</h3>
      <p className="text-xs text-gray-600 font-mono mt-1">{rider.vehicleNumber}</p>

      <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Status</span>
          <Badge style={{ backgroundColor: getStatusColor(rider.status) + '20', color: getStatusColor(rider.status) }} className="rounded-8 text-xs">
            {rider.status}
          </Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Rating</span>
          <span className="text-sm font-bold text-[#C9A27D]">★ {rider.rating}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Deliveries</span>
          <span className="text-sm font-bold text-gray-900">{rider.totalDeliveries}</span>
        </div>
      </div>

      <Button className="w-full mt-4 rounded-12" variant="outline">
        View Profile
      </Button>
    </motion.div>
  );
}

function PremiumLiveMap({ orders, riders }: any) {
  return (
    <div className="w-full h-[600px] bg-[#EEF2F6] relative overflow-hidden flex">
      {/* Side Panel */}
      <div className="w-80 bg-white border-r flex flex-col shadow-lg z-20">
        <div className="p-6 border-b">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Navigation className="h-5 w-5" style={{ color: '#C9A27D' }} />
            Active Deliveries
          </h3>
          <p className="text-xs text-gray-600 mt-2">
            {orders.filter((o: any) => o.status === 'on_the_way').length} riders on road
          </p>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-3">
            {orders.filter((o: any) => o.status === 'on_the_way').map((order: any) => (
              <motion.div 
                key={order.id}
                whileHover={{ scale: 1.02 }}
                className="p-4 rounded-12 border-2 border-gray-200 hover:border-[#C9A27D] transition-all"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <Badge style={{ backgroundColor: '#9B59B6', color: 'white' }} className="rounded-8 text-xs mb-2">
                  ON WAY
                </Badge>
                <h4 className="font-semibold text-gray-900">{order.customerName}</h4>
                <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {order.distance} km away
                </p>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Map SVG */}
      <div className="flex-1 relative">
        <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
          {/* Roads */}
          <path d="M 400 300 Q 600 300 700 100" fill="none" stroke="white" strokeWidth="20" strokeLinecap="round" />
          <path d="M 400 300 Q 200 300 100 100" fill="none" stroke="white" strokeWidth="20" strokeLinecap="round" />
          <path d="M 400 300 Q 600 500 700 500" fill="none" stroke="white" strokeWidth="20" strokeLinecap="round" />
          <path d="M 400 300 Q 200 500 100 500" fill="none" stroke="white" strokeWidth="20" strokeLinecap="round" />
        </svg>

        {/* Restaurant */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 rounded-full flex items-center justify-center border-4 shadow-lg"
            style={{ backgroundColor: 'white', borderColor: '#C9A27D' }}
          >
            <ChefHat className="h-8 w-8" style={{ color: '#C9A27D' }} />
          </motion.div>
          <Badge className="mt-2 mx-auto block text-xs" style={{ backgroundColor: '#C9A27D', color: 'white' }}>
            Restaurant
          </Badge>
        </div>

        {/* Customer Locations */}
        {[
          { x: '85%', y: '20%', label: 'Area 1' },
          { x: '15%', y: '20%', label: 'Area 2' },
          { x: '85%', y: '80%', label: 'Area 3' },
          { x: '15%', y: '80%', label: 'Area 4' },
        ].map((loc, i) => (
          <div key={i} className="absolute flex flex-col items-center" style={{ left: loc.x, top: loc.y, transform: 'translate(-50%, -50%)' }}>
            <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
              <MapPin className="h-5 w-5 text-green-600" />
            </div>
            <Badge variant="outline" className="mt-2 text-xs rounded-8">{loc.label}</Badge>
          </div>
        ))}

        {/* Moving Delivery Bikes */}
        {orders.filter((o: any) => o.status === 'on_the_way').map((order: any, idx: number) => {
          const positions: any = {
            1: { x: '85%', y: '20%' },
            2: { x: '15%', y: '20%' },
            3: { x: '85%', y: '80%' },
            4: { x: '15%', y: '80%' },
          };
          const pos = positions[order.destinationId] || positions[1];

          return (
            <motion.div
              key={order.id}
              className="absolute z-40 flex flex-col items-center"
              initial={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
              animate={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
              transition={{ duration: 15 + idx * 2, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
            >
              <motion.div 
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white"
                style={{ backgroundColor: '#9B59B6' }}
              >
                <Bike className="h-5 w-5" />
              </motion.div>
              <Badge className="mt-2 text-xs rounded-8 bg-white text-gray-900 border-0">
                {riders.find((r: any) => r.id === order.riderId)?.name.split(' ')[0] || 'Rider'}
              </Badge>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
