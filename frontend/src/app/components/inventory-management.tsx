import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  TrendingDown, 
  AlertTriangle, 
  ShoppingCart, 
  History, 
  FileText, 
  ShieldCheck, 
  Search, 
  Filter, 
  ArrowDown,
  Plus,
  RefreshCcw,
  MoreHorizontal,
  Truck,
  DollarSign,
  BarChart3,
  Lock,
  Eye,
  Archive,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Play
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/app/components/ui/dialog';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Progress } from "@/app/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Separator } from "@/app/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { toast } from 'sonner';

// --- Types ---

interface Ingredient {
  id: string;
  name: string;
  category: string;
  stockLevel: number;
  unit: string;
  minThreshold: number;
  costPerUnit: number;
  lastUpdated: string;
  supplierId: string;
  status: 'Good' | 'Low' | 'Critical' | 'Out';
  usageRate: 'High' | 'Medium' | 'Low';
}

interface DeductionLog {
  id: string;
  orderId: string;
  dishName: string;
  ingredients: { name: string; amount: number; unit: string }[];
  timestamp: string;
}

interface Supplier {
  id: string;
  name: string;
  rating: number;
  contact: string;
  suppliedItems: string[];
}

interface PurchaseRecord {
  id: string;
  ingredientName: string;
  supplierName: string;
  quantity: number;
  cost: number;
  date: string;
  status: 'Pending' | 'Completed';
}

// --- Mock Data ---

const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'Premium Basmati Rice', category: 'Grains', stockLevel: 45.5, unit: 'kg', minThreshold: 20, costPerUnit: 120, lastUpdated: '2024-01-29T10:00:00', supplierId: 's1', status: 'Good', usageRate: 'High' },
  { id: '2', name: 'Farm Fresh Tomatoes', category: 'Produce', stockLevel: 8.2, unit: 'kg', minThreshold: 10, costPerUnit: 40, lastUpdated: '2024-01-29T11:30:00', supplierId: 's2', status: 'Low', usageRate: 'High' },
  { id: '3', name: 'Organic Olive Oil', category: 'Oils', stockLevel: 12, unit: 'L', minThreshold: 5, costPerUnit: 850, lastUpdated: '2024-01-28T14:00:00', supplierId: 's3', status: 'Good', usageRate: 'Medium' },
  { id: '4', name: 'Mozzarella Cheese', category: 'Dairy', stockLevel: 2.5, unit: 'kg', minThreshold: 5, costPerUnit: 400, lastUpdated: '2024-01-29T09:15:00', supplierId: 's4', status: 'Critical', usageRate: 'High' },
  { id: '5', name: 'Chicken Breast', category: 'Meat', stockLevel: 0, unit: 'kg', minThreshold: 15, costPerUnit: 280, lastUpdated: '2024-01-29T08:00:00', supplierId: 's5', status: 'Out', usageRate: 'High' },
  { id: '6', name: 'Saffron', category: 'Spices', stockLevel: 0.05, unit: 'kg', minThreshold: 0.01, costPerUnit: 150000, lastUpdated: '2024-01-20T11:00:00', supplierId: 's6', status: 'Good', usageRate: 'Low' },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'Grain Masters', rating: 4.8, contact: '+91 98765 43210', suppliedItems: ['Rice', 'Flour'] },
  { id: 's2', name: 'Fresh Fields', rating: 4.5, contact: '+91 98765 12345', suppliedItems: ['Tomatoes', 'Onions', 'Potatoes'] },
  { id: 's3', name: 'Global Imports', rating: 4.9, contact: 'imports@global.com', suppliedItems: ['Olive Oil', 'Balsamic Vinegar'] },
  { id: 's4', name: 'Dairy Best', rating: 4.2, contact: 'orders@dairybest.com', suppliedItems: ['Cheese', 'Milk', 'Cream'] },
  { id: 's5', name: 'Poultry Plus', rating: 4.6, contact: '+91 99887 77665', suppliedItems: ['Chicken', 'Eggs'] },
];

// --- Simulation Helpers ---

const DISHES = [
  { name: 'Chicken Biryani', ingredients: [{ id: '1', amount: 0.2 }, { id: '5', amount: 0.25 }] },
  { name: 'Margherita Pizza', ingredients: [{ id: '4', amount: 0.15 }, { id: '2', amount: 0.1 }] },
  { name: 'Greek Salad', ingredients: [{ id: '2', amount: 0.2 }, { id: '3', amount: 0.05 }] },
  { name: 'Risotto', ingredients: [{ id: '1', amount: 0.15 }, { id: '4', amount: 0.05 }, { id: '6', amount: 0.001 }] },
];

export function InventoryManagement() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [deductionLogs, setDeductionLogs] = useState<DeductionLog[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Stats
  const stats = useMemo(() => ({
    total: ingredients.length,
    low: ingredients.filter(i => i.status === 'Low').length,
    critical: ingredients.filter(i => i.status === 'Critical').length,
    out: ingredients.filter(i => i.status === 'Out').length,
    value: ingredients.reduce((acc, i) => acc + (i.stockLevel * i.costPerUnit), 0)
  }), [ingredients]);

  // Simulation Logic
  useEffect(() => {
    let interval: any;
    if (isSimulating) {
      interval = setInterval(() => {
        const randomDish = DISHES[Math.floor(Math.random() * DISHES.length)];
        const orderId = `ORD-${Math.floor(Math.random() * 10000)}`;
        
        const usedIngredients: { name: string; amount: number; unit: string }[] = [];
        
        setIngredients(prev => prev.map(ing => {
          const required = randomDish.ingredients.find(ri => ri.id === ing.id);
          if (required) {
            // Check if stock is available
            const deductAmount = required.amount;
            if (ing.stockLevel > 0) {
              usedIngredients.push({ name: ing.name, amount: deductAmount, unit: ing.unit });
              const newLevel = Math.max(0, ing.stockLevel - deductAmount);
              
              // Update status
              let newStatus: Ingredient['status'] = 'Good';
              if (newLevel === 0) newStatus = 'Out';
              else if (newLevel <= ing.minThreshold / 2) newStatus = 'Critical';
              else if (newLevel <= ing.minThreshold) newStatus = 'Low';

              return { ...ing, stockLevel: newLevel, status: newStatus, lastUpdated: new Date().toISOString() };
            }
          }
          return ing;
        }));

        if (usedIngredients.length > 0) {
          const newLog: DeductionLog = {
            id: Date.now().toString(),
            orderId,
            dishName: randomDish.name,
            ingredients: usedIngredients,
            timestamp: new Date().toISOString()
          };
          setDeductionLogs(prev => [newLog, ...prev].slice(0, 50));
          
          // Auto scroll log
          if (scrollRef.current) {
            scrollRef.current.scrollTop = 0;
          }
        }

      }, 3000); // New order every 3 seconds
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Handlers
  const handleRestock = (id: string, amount: number) => {
    setIngredients(prev => prev.map(i => {
      if (i.id === id) {
        const newLevel = i.stockLevel + amount;
        let newStatus: Ingredient['status'] = 'Good';
        if (newLevel <= i.minThreshold / 2) newStatus = 'Critical';
        else if (newLevel <= i.minThreshold) newStatus = 'Low';
        
        return { ...i, stockLevel: newLevel, status: newStatus, lastUpdated: new Date().toISOString() };
      }
      return i;
    }));
    toast.success("Stock Replenished", { description: "Inventory levels updated manually." });
  };

  const handleCreatePurchaseRecord = (ingredient: Ingredient) => {
    const record: PurchaseRecord = {
      id: Date.now().toString(),
      ingredientName: ingredient.name,
      supplierName: INITIAL_SUPPLIERS.find(s => s.id === ingredient.supplierId)?.name || 'Unknown',
      quantity: ingredient.minThreshold * 2,
      cost: ingredient.minThreshold * 2 * ingredient.costPerUnit,
      date: new Date().toISOString(),
      status: 'Pending'
    };
    setPurchaseRecords(prev => [record, ...prev]);
    toast.info("Purchase Record Created", { description: "This is an accounting record only. Stock not updated." });
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1600px] mx-auto min-h-screen bg-gray-50/50 p-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
               <Lock className="h-3 w-3 mr-1" /> Order-Driven Logic Active
             </Badge>
             {isSimulating && (
               <Badge className="bg-green-100 text-green-700 animate-pulse border-none">
                 <RefreshCcw className="h-3 w-3 mr-1 animate-spin" /> Live Orders Incoming
               </Badge>
             )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Inventory Intelligence</h1>
          <p className="text-muted-foreground">Automated tracking driven purely by confirmed customer orders.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant={isSimulating ? "destructive" : "default"} 
            onClick={() => setIsSimulating(!isSimulating)}
            className="shadow-md"
          >
            {isSimulating ? <StopIcon className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isSimulating ? "Stop Simulation" : "Simulate Lunch Rush"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white p-1 rounded-xl border mb-6 w-full max-w-5xl grid grid-cols-6 h-auto">
          <TabsTrigger value="dashboard" className="rounded-lg py-2.5">Dashboard</TabsTrigger>
          <TabsTrigger value="inventory" className="rounded-lg py-2.5">Inventory</TabsTrigger>
          <TabsTrigger value="feed" className="rounded-lg py-2.5">Live Feed</TabsTrigger>
          <TabsTrigger value="suppliers" className="rounded-lg py-2.5">Suppliers</TabsTrigger>
          <TabsTrigger value="purchases" className="rounded-lg py-2.5">Purchases</TabsTrigger>
          <TabsTrigger value="audit" className="rounded-lg py-2.5">Audit Log</TabsTrigger>
        </TabsList>

        {/* 1. Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Ingredients" value={stats.total} icon={Package} trend="Stable" />
            <KPICard title="Running Low" value={stats.low} icon={AlertTriangle} color="text-yellow-600" bg="bg-yellow-50" />
            <KPICard title="Critical / Out" value={stats.critical + stats.out} icon={XCircle} color="text-red-600" bg="bg-red-50" />
            <KPICard title="Deductions Today" value={deductionLogs.length} icon={TrendingDown} color="text-blue-600" bg="bg-blue-50" subtext="Order-driven updates" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-none shadow-md">
              <CardHeader>
                <CardTitle>Real-Time Consumption Logic</CardTitle>
                <CardDescription>Visualizing how stock is deducted per order.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={deductionLogs.slice(0, 20).reverse().map((log, i) => ({ name: i, amount: log.ingredients.length }))}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <RechartsTooltip />
                    <Area type="monotone" dataKey="amount" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorAmount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-gray-900 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-green-400" /> System Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Order Logic</span>
                    <span className="text-green-400 font-medium">Active</span>
                  </div>
                  <Progress value={100} className="h-1 bg-gray-700" indicatorClassName="bg-green-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Stock Sync</span>
                    <span className="text-green-400 font-medium">Real-time</span>
                  </div>
                  <Progress value={100} className="h-1 bg-gray-700" indicatorClassName="bg-green-500" />
                </div>
                <div className="p-4 bg-gray-800 rounded-lg mt-4">
                  <p className="text-xs text-gray-400 mb-2">LAST SYSTEM AUDIT</p>
                  <p className="text-sm font-mono">Stock updates are automatically driven by confirmed customer orders. Manual overrides are logged.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. Inventory View */}
        <TabsContent value="inventory" className="space-y-6">
          <Card className="border-none shadow-md overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search ingredients..." className="bg-white w-64 border-none focus-visible:ring-0 shadow-sm" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="bg-white">
                  <Filter className="h-4 w-4 mr-2" /> Filter
                </Button>
                <Button variant="outline" size="sm" className="bg-white">
                  <ArrowDown className="h-4 w-4 mr-2" /> Export
                </Button>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Stock Level (Live)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Min Threshold</TableHead>
                  <TableHead>Consumption</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map(item => (
                  <TableRow key={item.id} className="group hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-lg">{item.stockLevel.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">{item.unit}</span>
                      </div>
                      <Progress 
                        value={(item.stockLevel / (item.minThreshold * 3)) * 100} 
                        className="h-1.5 w-24 mt-1 bg-gray-100" 
                        indicatorClassName={item.status === 'Critical' || item.status === 'Out' ? 'bg-red-500' : item.status === 'Low' ? 'bg-yellow-500' : 'bg-green-500'}
                      />
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono">
                      {item.minThreshold} {item.unit}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={item.usageRate === 'High' ? 'text-orange-600 bg-orange-50 border-orange-100' : 'text-gray-600'}>
                        {item.usageRate} Demand
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         {/* Hidden Replenish Trigger for Demo */}
                         <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600 hover:bg-green-50" onClick={() => handleRestock(item.id, 20)} title="Receive Shipment (Demo)">
                           <Plus className="h-4 w-4" />
                         </Button>
                         <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleCreatePurchaseRecord(item)}>
                           <FileText className="h-4 w-4" />
                         </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* 3. Live Feed */}
        <TabsContent value="feed" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            <Card className="lg:col-span-2 border-none shadow-md flex flex-col overflow-hidden bg-gray-900 text-white relative">
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-gray-900 to-transparent z-10 pointer-events-none" />
              <CardHeader className="z-20 bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
                <CardTitle className="flex items-center gap-2">
                  <ActivityIcon className="h-5 w-5 text-blue-500" />
                  Live Order Deduction Feed
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Real-time log of stock deducted as orders are confirmed in the kitchen.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden p-0 relative">
                 <div className="absolute inset-0 overflow-y-auto p-6 space-y-4" ref={scrollRef}>
                    <AnimatePresence initial={false}>
                      {deductionLogs.map((log) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-start gap-4 p-4 rounded-lg bg-gray-800/50 border border-gray-700/50"
                        >
                          <div className="p-2 rounded-full bg-blue-500/10 mt-1">
                            <ShoppingCart className="h-4 w-4 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-blue-200">{log.dishName}</h4>
                              <span className="text-xs font-mono text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-xs text-gray-400 mb-2">Order ID: {log.orderId}</p>
                            <div className="flex flex-wrap gap-2">
                              {log.ingredients.map((ing, i) => (
                                <Badge key={i} variant="outline" className="bg-gray-800 border-gray-600 text-gray-300 text-xs">
                                  {ing.name}: <span className="text-red-400 ml-1">-{ing.amount}{ing.unit}</span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      {deductionLogs.length === 0 && (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500">
                          <Clock className="h-10 w-10 mb-4 opacity-20" />
                          <p>Waiting for orders...</p>
                          <Button variant="link" className="text-blue-400" onClick={() => setIsSimulating(true)}>Start Simulation</Button>
                        </div>
                      )}
                    </AnimatePresence>
                 </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="border-none shadow-md h-full flex flex-col">
                <CardHeader>
                  <CardTitle>System Logic</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 space-y-4 text-sm text-muted-foreground">
                  <div className="p-4 bg-blue-50 text-blue-800 rounded-lg">
                    <p className="font-semibold mb-1 flex items-center gap-2"><Lock className="h-3 w-3" /> Locked Deduction</p>
                    <p>Inventory quantities are deducted ONLY when an order is confirmed. Predictive deduction is disabled to ensure accuracy.</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-semibold mb-1">Manual Edits</p>
                    <p>Direct edits to live stock values are disabled. Stock can only be updated via "Receive Shipment" workflows to maintain audit trails.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* 4. Suppliers */}
        <TabsContent value="suppliers" className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {INITIAL_SUPPLIERS.map(supplier => (
               <Card key={supplier.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                   <div className="flex items-center gap-3">
                     <Avatar className="h-10 w-10 border">
                       <AvatarFallback>{supplier.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                     </Avatar>
                     <div>
                       <CardTitle className="text-base">{supplier.name}</CardTitle>
                       <CardDescription className="text-xs">Rating: {supplier.rating}/5.0</CardDescription>
                     </div>
                   </div>
                   <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                 </CardHeader>
                 <CardContent className="pt-4 space-y-4">
                   <div className="text-sm space-y-1">
                     <p className="text-muted-foreground">Contact: <span className="text-foreground">{supplier.contact}</span></p>
                     <div className="flex flex-wrap gap-1 mt-2">
                       {supplier.suppliedItems.map(item => (
                         <Badge key={item} variant="secondary" className="text-[10px]">{item}</Badge>
                       ))}
                     </div>
                   </div>
                   <Separator />
                   <Button variant="outline" className="w-full">View Agreement</Button>
                 </CardContent>
               </Card>
             ))}
           </div>
        </TabsContent>

        {/* 5. Purchase Records */}
        <TabsContent value="purchases" className="space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>Purchase Records</CardTitle>
              <CardDescription>
                Accounting view only. Records do not automatically update stock unless received.
              </CardDescription>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Ingredient</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchaseRecords.length > 0 ? (
                    purchaseRecords.map(record => (
                      <TableRow key={record.id}>
                        <TableCell className="text-muted-foreground">{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{record.ingredientName}</TableCell>
                        <TableCell>{record.supplierName}</TableCell>
                        <TableCell>{record.quantity}</TableCell>
                        <TableCell>₹{record.cost.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">{record.status}</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No recent purchase records generated.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* 6. Audit */}
        <TabsContent value="audit" className="space-y-6">
           <Card className="border-none shadow-sm">
             <CardHeader>
               <CardTitle>Inventory Audit Trail</CardTitle>
               <CardDescription>Complete log of all system and manual actions.</CardDescription>
             </CardHeader>
             <CardContent>
               <div className="space-y-4">
                 {[1, 2, 3].map((_, i) => (
                   <div key={i} className="flex items-start gap-4 p-3 border-b last:border-0">
                     <div className="p-2 bg-gray-100 rounded text-gray-500">
                       <FileText className="h-4 w-4" />
                     </div>
                     <div>
                       <p className="text-sm font-medium">System Configuration Updated</p>
                       <p className="text-xs text-muted-foreground">Admin changed low stock threshold for "Basmati Rice" from 10kg to 20kg.</p>
                       <p className="text-[10px] text-gray-400 mt-1">{new Date().toLocaleDateString()} • Manual Configuration</p>
                     </div>
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}

// --- Sub Components ---

function KPICard({ title, value, icon: Icon, color = "text-gray-900", bg = "bg-gray-100", trend, subtext }: any) {
  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-6 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className={`text-2xl font-bold ${color}`}>{value}</h3>
          {trend && <p className="text-xs text-green-600 flex items-center mt-1"><CheckCircle2 className="h-3 w-3 mr-1" /> {trend}</p>}
          {subtext && <p className="text-xs text-muted-foreground mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-xl ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: Ingredient['status'] }) {
  const styles = {
    Good: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200",
    Low: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200",
    Critical: "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200",
    Out: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
  };

  const icons = {
    Good: CheckCircle2,
    Low: AlertTriangle,
    Critical: AlertCircle,
    Out: XCircle
  };

  const Icon = icons[status];

  return (
    <Badge variant="outline" className={`${styles[status]} pl-1.5 pr-2.5 py-0.5 gap-1`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}

function StopIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
    </svg>
  );
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}
