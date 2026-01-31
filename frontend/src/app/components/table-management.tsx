import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/app/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { Separator } from '@/app/components/ui/separator';
import { cn } from '@/app/components/ui/utils';
import { 
  Armchair, Users, Clock, ArrowRight, CheckCircle, User, 
  UtensilsCrossed, IndianRupee, UserCheck, Trash2, Sparkles,
  Activity, TrendingUp, Search, MapPin
} from 'lucide-react';
import { toast } from 'sonner';

// Types
type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

interface TableData {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  location: string;
  currentGuests?: number;
  waiter?: {
    name: string;
    avatar?: string;
  };
  orders?: {
    item: string;
    price: number;
    status: 'served' | 'cooking';
  }[];
  totalBill?: number;
}

interface TransitionLog {
  id: string;
  time: string;
  tableId: string;
  fromStatus: TableStatus;
  toStatus: TableStatus;
  duration: string;
}

// Mock data
const initialMockTables: TableData[] = [
  { 
    id: 't1', 
    name: 'T-01', 
    capacity: 2, 
    status: 'available', 
    location: 'Main Hall',
  },
  { 
    id: 't2', 
    name: 'T-02', 
    capacity: 4, 
    status: 'available', 
    location: 'Main Hall',
  },
  { 
    id: 't3', 
    name: 'T-03', 
    capacity: 4, 
    status: 'occupied', 
    location: 'Main Hall',
    currentGuests: 4,
    waiter: { name: 'Rahul Sharma', avatar: '' },
    orders: [
      { item: 'Paneer Butter Masala', price: 280, status: 'served' },
      { item: 'Butter Naan (x4)', price: 160, status: 'served' },
      { item: 'Dal Makhani', price: 240, status: 'cooking' },
      { item: 'Gulab Jamun', price: 120, status: 'cooking' },
    ],
    totalBill: 800,
  },
  { 
    id: 't4', 
    name: 'T-04', 
    capacity: 6, 
    status: 'available', 
    location: 'Private Room',
  },
  { 
    id: 't5', 
    name: 'T-05', 
    capacity: 2, 
    status: 'reserved', 
    location: 'Window Side',
    currentGuests: 2,
  },
  { 
    id: 't6', 
    name: 'T-06', 
    capacity: 4, 
    status: 'available', 
    location: 'Main Hall',
  },
  { 
    id: 't7', 
    name: 'T-07', 
    capacity: 8, 
    status: 'cleaning', 
    location: 'Private Room',
  },
  { 
    id: 't8', 
    name: 'T-08', 
    capacity: 2, 
    status: 'occupied', 
    location: 'Window Side',
    currentGuests: 2,
    waiter: { name: 'Priya Singh' },
    orders: [
      { item: 'Chicken Biryani', price: 320, status: 'served' },
      { item: 'Raita', price: 80, status: 'served' },
    ],
    totalBill: 400,
  },
];

const mockTransitionLogs: TransitionLog[] = [
  {
    id: 'tl1',
    time: '14:32',
    tableId: 'T-03',
    fromStatus: 'available',
    toStatus: 'occupied',
    duration: '45m',
  },
  {
    id: 'tl2',
    time: '14:15',
    tableId: 'T-08',
    fromStatus: 'reserved',
    toStatus: 'occupied',
    duration: '30m',
  },
  {
    id: 'tl3',
    time: '13:55',
    tableId: 'T-07',
    fromStatus: 'occupied',
    toStatus: 'cleaning',
    duration: '1h 20m',
  },
  {
    id: 'tl4',
    time: '13:40',
    tableId: 'T-05',
    fromStatus: 'available',
    toStatus: 'reserved',
    duration: '15m',
  },
  {
    id: 'tl5',
    time: '13:20',
    tableId: 'T-01',
    fromStatus: 'cleaning',
    toStatus: 'available',
    duration: '10m',
  },
];

export function TableManagement() {
  const [tables, setTables] = useState<TableData[]>(initialMockTables);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Walk-in form state
  const [guestCount, setGuestCount] = useState(2);
  const [guestName, setGuestName] = useState('');
  const [selectedZone, setSelectedZone] = useState('main-hall');
  const [searchQuery, setSearchQuery] = useState('');

  // Get statistics
  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
  };

  // Get status config
  const getStatusConfig = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return { 
          label: 'Available', 
          color: 'text-emerald-600', 
          bg: 'bg-emerald-50', 
          border: 'border-emerald-200',
          glow: 'shadow-emerald-200/50'
        };
      case 'occupied':
        return { 
          label: 'Occupied', 
          color: 'text-red-600', 
          bg: 'bg-red-50', 
          border: 'border-red-200',
          glow: 'shadow-red-200/50'
        };
      case 'reserved':
        return { 
          label: 'Reserved', 
          color: 'text-orange-600', 
          bg: 'bg-orange-50', 
          border: 'border-orange-200',
          glow: 'shadow-orange-200/50'
        };
      case 'cleaning':
        return { 
          label: 'Cleaning', 
          color: 'text-blue-600', 
          bg: 'bg-blue-50', 
          border: 'border-blue-200',
          glow: 'shadow-blue-200/50'
        };
    }
  };

  // Open table details
  const openTableDetails = (table: TableData) => {
    setSelectedTable(table);
    setIsDetailsPanelOpen(true);
  };

  // Handle table status change
  const changeTableStatus = (tableId: string, newStatus: TableStatus) => {
    setTables(tables.map(t => t.id === tableId ? { ...t, status: newStatus } : t));
    toast.success(`Table status updated to ${newStatus}`);
  };

  // Filter available tables by zone
  const availableTablesByZone = tables.filter(
    t => t.status === 'available' && 
    (selectedZone === 'all' || 
     t.location.toLowerCase().replace(' ', '-') === selectedZone)
  );

  // Handle assign table
  const handleAssignTable = (table: TableData) => {
    if (!guestName) {
      toast.error('Please enter guest name');
      return;
    }
    changeTableStatus(table.id, 'occupied');
    toast.success(`Table ${table.name} assigned to ${guestName}`);
    setGuestName('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Floating Glass Header */}
      <div className="sticky top-0 z-40 mx-6 pt-6">
        <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-lg shadow-black/5 rounded-3xl px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200/50">
                <Armchair className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Table Management</h1>
                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  System Online
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="px-4 py-2 text-sm">
              <Activity className="h-4 w-4 mr-2" />
              Live Tracking
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 pb-6 mt-6">
        {/* Tab Navigation */}
        <div className="w-full overflow-x-auto pb-4">
          <nav className="flex gap-3 min-w-max p-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, description: 'Live overview & stats' },
              { id: 'entry', label: 'Entry Management', icon: Users, description: 'Guest seating & walk-ins' },
              { id: 'tables', label: 'All Tables', icon: Armchair, description: 'Detailed floor status' },
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
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'bg-white/70 backdrop-blur-md border border-white/50 hover:bg-white shadow-sm'
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* TabsList removed and replaced by horizontal nav above */}

          {/* Dashboard View */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stat Cards */}
            <div className="grid gap-5 md:grid-cols-4">
              {/* Total Tables */}
              <Card className="relative overflow-hidden bg-white/80 backdrop-blur-sm border-white/50 shadow-xl shadow-black/5 rounded-3xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-100/40 to-transparent rounded-full blur-2xl"></div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-gray-600">Total Tables</CardTitle>
                    <div className="p-3 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl">
                      <Armchair className="h-7 w-7 text-indigo-500 opacity-60" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-gray-900 mb-1">{stats.total}</div>
                  <p className="text-xs text-gray-500">Restaurant capacity</p>
                </CardContent>
              </Card>

              {/* Available */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50/80 to-white/80 backdrop-blur-sm border-emerald-100 shadow-xl shadow-emerald-100/20 rounded-3xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-transparent rounded-full blur-2xl"></div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-emerald-700">Available</CardTitle>
                    <div className="p-3 bg-emerald-100 rounded-2xl">
                      <CheckCircle className="h-7 w-7 text-emerald-500 opacity-60" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-emerald-600 mb-1">{stats.available}</div>
                  <p className="text-xs text-emerald-600">Ready to seat</p>
                </CardContent>
              </Card>

              {/* Occupied */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-red-50/80 to-white/80 backdrop-blur-sm border-red-100 shadow-xl shadow-red-100/20 rounded-3xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-200/30 to-transparent rounded-full blur-2xl"></div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-red-700">Occupied</CardTitle>
                    <div className="p-3 bg-red-100 rounded-2xl">
                      <Users className="h-7 w-7 text-red-500 opacity-60" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-red-600 mb-1">{stats.occupied}</div>
                  <p className="text-xs text-red-600">Currently dining</p>
                </CardContent>
              </Card>

              {/* Reserved */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50/80 to-white/80 backdrop-blur-sm border-orange-100 shadow-xl shadow-orange-100/20 rounded-3xl">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-transparent rounded-full blur-2xl"></div>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-orange-700">Reserved</CardTitle>
                    <div className="p-3 bg-orange-100 rounded-2xl">
                      <Clock className="h-7 w-7 text-orange-500 opacity-60" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-orange-600 mb-1">{stats.reserved}</div>
                  <p className="text-xs text-orange-600">Upcoming bookings</p>
                </CardContent>
              </Card>
            </div>

            {/* Lifecycle Monitor */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
              <CardHeader className="border-b bg-gradient-to-r from-gray-50/80 to-white/80">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                  Table Lifecycle Monitor
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="flex items-center justify-between max-w-4xl mx-auto">
                  {/* Available */}
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center ${stats.available > 0 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-300/50' : 'bg-gray-200'} transition-all duration-500`}>
                      <CheckCircle className={`h-12 w-12 ${stats.available > 0 ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">Available</p>
                      <p className="text-2xl font-bold text-emerald-600">{stats.available}</p>
                    </div>
                  </div>

                  <ArrowRight className="h-8 w-8 text-gray-300" />

                  {/* Reserved */}
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center ${stats.reserved > 0 ? 'bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-300/50' : 'bg-gray-200'} transition-all duration-500`}>
                      <Clock className={`h-12 w-12 ${stats.reserved > 0 ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">Reserved</p>
                      <p className="text-2xl font-bold text-orange-600">{stats.reserved}</p>
                    </div>
                  </div>

                  <ArrowRight className="h-8 w-8 text-gray-300" />

                  {/* Occupied */}
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center ${stats.occupied > 0 ? 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-300/50' : 'bg-gray-200'} transition-all duration-500`}>
                      <Users className={`h-12 w-12 ${stats.occupied > 0 ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">Occupied</p>
                      <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
                    </div>
                  </div>

                  <ArrowRight className="h-8 w-8 text-gray-300" />

                  {/* Cleaning */}
                  <div className="flex flex-col items-center gap-3">
                    <div className={`w-24 h-24 rounded-full flex items-center justify-center ${stats.cleaning > 0 ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-300/50' : 'bg-gray-200'} transition-all duration-500`}>
                      <Sparkles className={`h-12 w-12 ${stats.cleaning > 0 ? 'text-white' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-900">Cleaning</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.cleaning}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transition Log */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
              <CardHeader className="border-b bg-gradient-to-r from-gray-50/80 to-white/80">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-500" />
                  Transition Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                        <TableHead className="font-semibold">Time</TableHead>
                        <TableHead className="font-semibold">Table ID</TableHead>
                        <TableHead className="font-semibold">Transition</TableHead>
                        <TableHead className="font-semibold text-right">Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockTransitionLogs.map((log) => {
                        const fromConfig = getStatusConfig(log.fromStatus);
                        const toConfig = getStatusConfig(log.toStatus);
                        return (
                          <TableRow key={log.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell className="font-medium text-gray-900">{log.time}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="font-mono">
                                {log.tableId}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge className={`${fromConfig.bg} ${fromConfig.color} border-0`}>
                                  {fromConfig.label}
                                </Badge>
                                <ArrowRight className="h-4 w-4 text-gray-400" />
                                <Badge className={`${toConfig.bg} ${toConfig.color} border-0`}>
                                  {toConfig.label}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className="text-sm text-gray-600 font-medium">{log.duration}</span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Entry Management (Walk-In) View */}
          <TabsContent value="entry" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - Form */}
              <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm border-white/50 shadow-xl shadow-black/5 rounded-3xl">
                <CardHeader className="border-b bg-gradient-to-r from-gray-50/80 to-white/80">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-500" />
                    Walk-In Guest
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {/* Guest Count */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Guest Count</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-14 w-14 rounded-2xl"
                        onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                      >
                        -
                      </Button>
                      <div className="flex-1 h-20 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center border-2 border-indigo-100">
                        <span className="text-5xl font-bold text-indigo-600">{guestCount}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-14 w-14 rounded-2xl"
                        onClick={() => setGuestCount(guestCount + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  {/* Guest Name */}
                  <div className="space-y-3">
                    <Label htmlFor="guest-name" className="text-sm font-semibold text-gray-700">
                      Guest Name
                    </Label>
                    <Input
                      id="guest-name"
                      placeholder="Enter guest name"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="h-12 rounded-xl bg-white border-gray-200"
                    />
                  </div>

                  {/* Zone Preference */}
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700">Zone Preference</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'all', label: 'All Zones', icon: MapPin },
                        { value: 'main-hall', label: 'Main Hall', icon: Armchair },
                        { value: 'window-side', label: 'Window Side', icon: Sparkles },
                        { value: 'private-room', label: 'Private', icon: Users },
                      ].map((zone) => (
                        <Button
                          key={zone.value}
                          variant={selectedZone === zone.value ? 'default' : 'outline'}
                          size="sm"
                          className={`rounded-xl flex-1 min-w-[120px] ${
                            selectedZone === zone.value 
                              ? 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200' 
                              : ''
                          }`}
                          onClick={() => setSelectedZone(zone.value)}
                        >
                          <zone.icon className="h-4 w-4 mr-2" />
                          {zone.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Find Table Button */}
                  <Button 
                    size="lg" 
                    className="w-full h-14 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200/50"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    Find Available Table
                  </Button>
                </CardContent>
              </Card>

              {/* Right Panel - Available Tables Grid */}
              <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-white/50 shadow-xl shadow-black/5 rounded-3xl">
                <CardHeader className="border-b bg-gradient-to-r from-gray-50/80 to-white/80">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Armchair className="h-5 w-5 text-indigo-500" />
                      Available Tables
                    </CardTitle>
                    <Badge variant="secondary" className="px-3 py-1">
                      {availableTablesByZone.length} tables
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  {availableTablesByZone.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                      <Armchair className="h-16 w-16 mb-4 opacity-30" />
                      <p className="text-lg font-medium">No tables available in this zone</p>
                      <p className="text-sm">Try selecting a different zone</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {availableTablesByZone.map((table) => (
                        <Card
                          key={table.id}
                          className="relative group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer bg-gradient-to-br from-emerald-50/50 to-white border-emerald-100 rounded-2xl overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-200/20 rounded-full blur-2xl"></div>
                          <CardContent className="p-5 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="text-2xl font-bold text-gray-900">{table.name}</h3>
                              <Badge className="bg-emerald-100 text-emerald-700 border-0">
                                Available
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-2 text-gray-600">
                              <Users className="h-4 w-4" />
                              <span className="text-sm font-medium">Seats {table.capacity}</span>
                            </div>

                            <div className="flex items-center gap-2 text-gray-500">
                              <MapPin className="h-4 w-4" />
                              <span className="text-xs">{table.location}</span>
                            </div>

                            <Button
                              size="sm"
                              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-md"
                              onClick={() => handleAssignTable(table)}
                            >
                              Assign Table
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* All Tables View */}
          <TabsContent value="tables" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl shadow-black/5 rounded-3xl overflow-hidden">
              <CardHeader className="border-b bg-gradient-to-r from-gray-50/80 to-white/80">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Armchair className="h-5 w-5 text-indigo-500" />
                    All Tables Overview
                  </CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search tables..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64 rounded-xl"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {tables
                    .filter(t => 
                      searchQuery === '' || 
                      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.location.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((table) => {
                      const statusConfig = getStatusConfig(table.status);
                      return (
                        <Card
                          key={table.id}
                          className={`relative group hover:shadow-xl transition-all duration-300 cursor-pointer ${statusConfig.bg} ${statusConfig.border} border-2 rounded-2xl overflow-hidden`}
                          onClick={() => openTableDetails(table)}
                        >
                          <div className={`absolute top-0 right-0 w-24 h-24 ${statusConfig.bg} opacity-50 rounded-full blur-2xl`}></div>
                          <CardContent className="p-5 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="text-2xl font-bold text-gray-900">{table.name}</h3>
                              <Badge className={`${statusConfig.bg} ${statusConfig.color} border-0`}>
                                {statusConfig.label}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Users className="h-4 w-4" />
                                <span className="text-sm font-medium">Capacity: {table.capacity}</span>
                              </div>

                              <div className="flex items-center gap-2 text-gray-500">
                                <MapPin className="h-4 w-4" />
                                <span className="text-xs">{table.location}</span>
                              </div>

                              {table.currentGuests && (
                                <div className="flex items-center gap-2 text-gray-700">
                                  <UserCheck className="h-4 w-4" />
                                  <span className="text-sm font-semibold">{table.currentGuests} guests</span>
                                </div>
                              )}
                            </div>

                            {table.totalBill && (
                              <div className="pt-3 border-t border-gray-200">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500">Bill Amount</span>
                                  <span className="text-lg font-bold text-gray-900 flex items-center">
                                    <IndianRupee className="h-4 w-4" />
                                    {table.totalBill}
                                  </span>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Table Details Slide-over Panel */}
      <Sheet open={isDetailsPanelOpen} onOpenChange={setIsDetailsPanelOpen}>
        <SheetContent className="w-full sm:max-w-lg bg-white">
          {selectedTable && (
            <>
              <SheetHeader className="border-b pb-6">
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-4xl font-bold text-gray-900">
                    {selectedTable.name}
                  </SheetTitle>
                  <Badge 
                    className={`text-base px-4 py-2 ${getStatusConfig(selectedTable.status).bg} ${getStatusConfig(selectedTable.status).color} border-0`}
                  >
                    {getStatusConfig(selectedTable.status).label}
                  </Badge>
                </div>
                <SheetDescription className="text-base text-gray-600">
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Capacity: {selectedTable.capacity}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {selectedTable.location}
                    </span>
                  </div>
                </SheetDescription>
              </SheetHeader>

              <div className="py-6 space-y-6">
                {/* Waiter Section */}
                {selectedTable.waiter && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <UserCheck className="h-5 w-5 text-indigo-500" />
                      Assigned Staff
                    </h3>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                          {selectedTable.waiter.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">{selectedTable.waiter.name}</p>
                        <p className="text-sm text-gray-500">Server</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Orders Section */}
                {selectedTable.orders && selectedTable.orders.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <UtensilsCrossed className="h-5 w-5 text-indigo-500" />
                      Order Items
                    </h3>
                    <div className="space-y-2">
                      {selectedTable.orders.map((order, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{order.item}</p>
                            <Badge 
                              variant="outline" 
                              className={`mt-1 text-xs ${
                                order.status === 'served' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : 'bg-orange-50 text-orange-700 border-orange-200'
                              }`}
                            >
                              {order.status === 'served' ? 'Served' : 'Cooking'}
                            </Badge>
                          </div>
                          <span className="font-bold text-gray-900 flex items-center">
                            <IndianRupee className="h-4 w-4" />
                            {order.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Total Bill */}
                {selectedTable.totalBill && (
                  <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border-2 border-indigo-100">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-gray-700">Total Bill</span>
                      <span className="text-3xl font-bold text-indigo-600 flex items-center">
                        <IndianRupee className="h-7 w-7" />
                        {selectedTable.totalBill}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              {/* Action Buttons */}
              <SheetFooter className="flex-col gap-3 sm:flex-col">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 rounded-xl"
                    onClick={() => {
                      changeTableStatus(selectedTable.id, 'reserved');
                      setIsDetailsPanelOpen(false);
                    }}
                  >
                    <Clock className="h-5 w-5 mr-2" />
                    Reserve
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-14 rounded-xl"
                    onClick={() => {
                      changeTableStatus(selectedTable.id, 'occupied');
                      setIsDetailsPanelOpen(false);
                    }}
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Seat Guests
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    size="lg"
                    className="h-14 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800"
                    onClick={() => {
                      toast.success('Bill generated successfully');
                      setIsDetailsPanelOpen(false);
                    }}
                  >
                    <IndianRupee className="h-5 w-5 mr-2" />
                    Bill Order
                  </Button>
                  <Button
                    size="lg"
                    className="h-14 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    onClick={() => {
                      changeTableStatus(selectedTable.id, 'cleaning');
                      setIsDetailsPanelOpen(false);
                    }}
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Assign Cleaner
                  </Button>
                </div>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
