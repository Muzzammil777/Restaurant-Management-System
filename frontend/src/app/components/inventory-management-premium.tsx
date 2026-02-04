import { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Package, 
  AlertTriangle, 
  ShoppingCart, 
  Search, 
  Filter, 
  Plus, 
  RefreshCcw, 
  MoreHorizontal, 
  Info,
  History,
  TrendingDown,
  AlertOctagon,
  Download,
  Droplets,
  Beef,
  Leaf,
  Wheat,
  Flame,
  X,
  Check,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Progress } from "@/app/components/ui/progress";
import { Label } from "@/app/components/ui/label";
import { cn } from '@/app/components/ui/utils';
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
  supplierId: string;
  status: 'Healthy' | 'Low' | 'Critical' | 'Out';
  usageRate: 'High' | 'Medium' | 'Low';
  lastDeduction?: string;
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
  contact: string;
  email: string;
  status: 'Active' | 'Disabled';
  suppliedItems: string[];
}

interface PurchaseRecord {
  id: string;
  supplierName: string;
  ingredientName: string;
  quantity: number;
  cost: number;
  date: string;
}

// --- Utility Functions ---

function calculateStatus(stockLevel: number, minThreshold: number): Ingredient['status'] {
  if (stockLevel <= 0) return 'Out';
  if (stockLevel <= minThreshold * 0.5) return 'Critical';
  if (stockLevel <= minThreshold) return 'Low';
  return 'Healthy';
}

function updateIngredientStock(
  ingredients: Ingredient[],
  ingredientId: string,
  quantityDelta: number
): Ingredient[] {
  return ingredients.map(ing => {
    if (ing.id === ingredientId) {
      const newStock = Math.max(0, ing.stockLevel + quantityDelta);
      const newStatus = calculateStatus(newStock, ing.minThreshold);
      return { 
        ...ing, 
        stockLevel: newStock, 
        status: newStatus 
      };
    }
    return ing;
  });
}

// --- Mock Data (Same as original) ---
const INITIAL_INGREDIENTS: Ingredient[] = [
  { id: '1', name: 'Rice', category: 'Grains', stockLevel: 60, unit: 'kg', minThreshold: 50, costPerUnit: 80, supplierId: 's1', status: 'Healthy', usageRate: 'High' },
  { id: '2', name: 'Wheat Flour', category: 'Grains', stockLevel: 35, unit: 'kg', minThreshold: 30, costPerUnit: 35, supplierId: 's1', status: 'Healthy', usageRate: 'High' },
  { id: '3', name: 'Maida', category: 'Grains', stockLevel: 25, unit: 'kg', minThreshold: 20, costPerUnit: 45, supplierId: 's1', status: 'Healthy', usageRate: 'Medium' },
  { id: '4', name: 'Sugar', category: 'Pantry', stockLevel: 18, unit: 'kg', minThreshold: 15, costPerUnit: 50, supplierId: 's1', status: 'Healthy', usageRate: 'Medium' },
  { id: '5', name: 'Salt', category: 'Pantry', stockLevel: 12, unit: 'kg', minThreshold: 10, costPerUnit: 20, supplierId: 's1', status: 'Healthy', usageRate: 'High' },
  { id: '6', name: 'Cooking Oil', category: 'Oils', stockLevel: 30, unit: 'L', minThreshold: 25, costPerUnit: 120, supplierId: 's3', status: 'Healthy', usageRate: 'High' },
  { id: '7', name: 'Ghee', category: 'Oils', stockLevel: 12, unit: 'L', minThreshold: 10, costPerUnit: 450, supplierId: 's3', status: 'Healthy', usageRate: 'High' },
  { id: '8', name: 'Butter', category: 'Dairy', stockLevel: 6, unit: 'kg', minThreshold: 5, costPerUnit: 350, supplierId: 's4', status: 'Healthy', usageRate: 'Medium' },
  { id: '10', name: 'Milk', category: 'Dairy', stockLevel: 35, unit: 'L', minThreshold: 30, costPerUnit: 60, supplierId: 's4', status: 'Healthy', usageRate: 'High' },
  { id: '12', name: 'Paneer', category: 'Dairy', stockLevel: 10, unit: 'kg', minThreshold: 8, costPerUnit: 350, supplierId: 's4', status: 'Healthy', usageRate: 'High' },
  { id: '14', name: 'Eggs', category: 'Proteins', stockLevel: 60, unit: 'units', minThreshold: 50, costPerUnit: 6, supplierId: 's5', status: 'Healthy', usageRate: 'High' },
  { id: '15', name: 'Chicken', category: 'Proteins', stockLevel: 35, unit: 'kg', minThreshold: 30, costPerUnit: 250, supplierId: 's5', status: 'Healthy', usageRate: 'High' },
  { id: '19', name: 'Onions', category: 'Vegetables', stockLevel: 45, unit: 'kg', minThreshold: 40, costPerUnit: 30, supplierId: 's2', status: 'Healthy', usageRate: 'High' },
  { id: '20', name: 'Tomatoes', category: 'Vegetables', stockLevel: 35, unit: 'kg', minThreshold: 30, costPerUnit: 40, supplierId: 's2', status: 'Healthy', usageRate: 'High' },
  { id: '22', name: 'Ginger', category: 'Vegetables', stockLevel: 6, unit: 'kg', minThreshold: 5, costPerUnit: 60, supplierId: 's2', status: 'Healthy', usageRate: 'High' },
  { id: '50', name: 'Turmeric Powder', category: 'Spices', stockLevel: 2.5, unit: 'kg', minThreshold: 2, costPerUnit: 150, supplierId: 's7', status: 'Healthy', usageRate: 'High' },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  { id: 's1', name: 'General Supplies', contact: '+91 98765 43210', email: 'orders@generalsupplies.com', status: 'Active', suppliedItems: ['Rice', 'Flour', 'Maida'] },
  { id: 's2', name: 'Fresh Produce', contact: '+91 98765 12345', email: 'sales@freshproduce.com', status: 'Active', suppliedItems: ['Vegetables', 'Tomatoes', 'Onions'] },
  { id: 's3', name: 'Oils & Fats', contact: '+91 99887 76655', email: 'supplies@oilsfats.com', status: 'Active', suppliedItems: ['Cooking Oil', 'Ghee'] },
  { id: 's4', name: 'Dairy Best', contact: '+91 91234 56789', email: 'supply@dairybest.com', status: 'Active', suppliedItems: ['Milk', 'Paneer', 'Butter'] },
];

const DISHES = [
  { name: 'Chicken Biryani', ingredients: [{ id: '1', amount: 0.2 }, { id: '5', amount: 0.25 }, { id: '8', amount: 0.1 }] },
];

// --- Premium Inventory Management Component ---

export function InventoryManagementPremium({ triggerStockManagement }: { triggerStockManagement?: boolean }) {
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [deductionLogs, setDeductionLogs] = useState<DeductionLog[]>([]);
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isSimulating, setIsSimulating] = useState(false);

  // Derived Stats
  const stats = useMemo(() => {
    return {
      total: ingredients.length,
      low: ingredients.filter(i => i.status === 'Low' || i.status === 'Critical').length,
      out: ingredients.filter(i => i.status === 'Out').length,
      totalValue: ingredients.reduce((acc, i) => acc + (i.stockLevel * i.costPerUnit), 0)
    };
  }, [ingredients]);

  const filteredIngredients = useMemo(() => {
    return ingredients.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [ingredients, searchQuery, statusFilter, categoryFilter]);

  const uniqueCategories = useMemo(() => Array.from(new Set(ingredients.map(i => i.category))), [ingredients]);

  // Simulation
  useEffect(() => {
    let interval: any;
    if (isSimulating) {
      interval = setInterval(() => {
        const randomDish = DISHES[Math.floor(Math.random() * DISHES.length)];
        const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
        
        const usedIngredients: { name: string; amount: number; unit: string }[] = [];
        let updatedIngs = ingredients;

        for (const required of randomDish.ingredients) {
          const ing = updatedIngs.find(i => i.id === required.id);
          if (ing && ing.stockLevel > 0) {
            const deduct = required.amount;
            usedIngredients.push({ name: ing.name, amount: deduct, unit: ing.unit });
            updatedIngs = updateIngredientStock(updatedIngs, required.id, -deduct);
          }
        }

        if (usedIngredients.length > 0) {
          setIngredients(updatedIngs);
          const newLog: DeductionLog = {
            id: Date.now().toString(),
            orderId,
            dishName: randomDish.name,
            ingredients: usedIngredients,
            timestamp: new Date().toISOString()
          };
          setDeductionLogs(prev => [newLog, ...prev].slice(0, 50));
        }
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isSimulating, ingredients]);

  // Actions
  const handleAddPurchase = (data: any) => {
    const updatedIngredients = updateIngredientStock(
      ingredients,
      data.ingredientId,
      data.quantity
    );
    setIngredients(updatedIngredients);

    const newRecord: PurchaseRecord = {
      id: `PUR-${Date.now()}`,
      supplierName: data.supplierName,
      ingredientName: data.ingredientName,
      quantity: data.quantity,
      cost: data.cost,
      date: new Date().toISOString()
    };
    setPurchaseRecords(prev => [newRecord, ...prev]);
    
    toast.success("✓ Stock Updated", { description: `${data.ingredientName}: +${data.quantity} ${ingredients.find(i => i.id === data.ingredientId)?.unit}` });
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: any } = {
      'Grains': Wheat,
      'Dairy': Droplets,
      'Proteins': Beef,
      'Vegetables': Leaf,
      'Oils': Droplets,
      'Spices': Flame,
      'Pantry': Package,
    };
    return icons[category] || Package;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF9F3' }}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold" style={{ color: '#2D2D2D' }}>Inventory Dashboard</h1>
              <p className="text-gray-600 mt-2 flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full" style={{ backgroundColor: '#4CAF50' }} />
                Live stock management system
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="rounded-12"
                onClick={() => setIsSimulating(!isSimulating)}
              >
                {isSimulating ? <Check className="mr-2 h-4 w-4" /> : <RefreshCcw className="mr-2 h-4 w-4" />}
                {isSimulating ? 'Stop Simulation' : 'Start Simulation'}
              </Button>
              <PremiumAddPurchaseDialog ingredients={ingredients} suppliers={suppliers} onSave={handleAddPurchase} />
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          <KPICard 
            icon={Package} 
            label="Total Ingredients" 
            value={stats.total} 
            color="#C9A27D"
          />
          <KPICard 
            icon={AlertTriangle} 
            label="Low Stock Items" 
            value={stats.low} 
            color="#FFA500"
          />
          <KPICard 
            icon={AlertOctagon} 
            label="Out of Stock" 
            value={stats.out} 
            color="#E74C3C"
          />
          <KPICard 
            icon={TrendingDown} 
            label="Total Stock Value" 
            value={`₹${(stats.totalValue / 1000).toFixed(1)}K`} 
            color="#3498DB"
          />
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="mb-8 p-6 rounded-[18px]" 
          style={{ backgroundColor: '#FFFFFF', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3 h-5 w-5" style={{ color: '#C9A27D' }} />
              <Input 
                placeholder="Search ingredients..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 border-0 bg-gray-50 rounded-12"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] rounded-12 border-0 bg-gray-50">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Healthy">Healthy</SelectItem>
                <SelectItem value="Low">Low Stock</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="Out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px] rounded-12 border-0 bg-gray-50">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Ingredient Cards Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05 }}
        >
          <AnimatePresence mode="popLayout">
            {filteredIngredients.map((ingredient, index) => (
              <PremiumIngredientCard 
                key={ingredient.id} 
                ingredient={ingredient} 
                getCategoryIcon={getCategoryIcon}
                index={index}
                onUpdate={() => {}}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredIngredients.length === 0 && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No ingredients found</p>
          </motion.div>
        )}

        {/* Deduction Activity */}
        {deductionLogs.length > 0 && (
          <motion.div 
            className="mt-16 p-8 rounded-[20px]" 
            style={{ backgroundColor: '#FFFFFF', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {deductionLogs.slice(0, 10).map((log) => (
                <motion.div 
                  key={log.id}
                  className="p-4 rounded-12" 
                  style={{ backgroundColor: '#F8F6F3' }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-semibold text-gray-800">{log.dishName}</p>
                    <span className="text-xs text-gray-500">{format(new Date(log.timestamp), 'HH:mm:ss')}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{log.orderId}</p>
                  <div className="flex flex-wrap gap-2">
                    {log.ingredients.map((ing, i) => (
                      <Badge key={i} variant="outline" className="rounded-8 text-xs">
                        {ing.name} <span style={{ color: '#E74C3C' }} className="ml-1">-{ing.amount} {ing.unit}</span>
                      </Badge>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// --- Sub Components ---

function KPICard({ icon: Icon, label, value, color }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="p-6 rounded-[18px] border-2"
      style={{ 
        backgroundColor: '#FFFFFF', 
        borderColor: 'rgba(201, 162, 125, 0.1)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div 
          className="p-3 rounded-12" 
          style={{ backgroundColor: color + '15' }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

function PremiumIngredientCard({ ingredient, getCategoryIcon, index }: any) {
  const CategoryIcon = getCategoryIcon(ingredient.category);
  const stockPercentage = (ingredient.stockLevel / (ingredient.minThreshold * 2)) * 100;
  
  const getStatusColor = () => {
    if (ingredient.status === 'Out') return '#E74C3C';
    if (ingredient.status === 'Critical') return '#FFA500';
    if (ingredient.status === 'Low') return '#FF9800';
    return '#4CAF50';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="p-6 rounded-[18px] border-2 transition-all"
      style={{ 
        backgroundColor: '#FFFFFF',
        borderColor: ingredient.status === 'Healthy' ? 'rgba(201, 162, 125, 0.1)' : 'rgba(255, 165, 0, 0.2)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderLeft: ingredient.status !== 'Healthy' ? `6px solid ${getStatusColor()}` : 'none'
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="p-3 rounded-12" 
            style={{ backgroundColor: '#C9A27D' + '15' }}
          >
            <CategoryIcon className="h-5 w-5" style={{ color: '#C9A27D' }} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{ingredient.name}</h3>
            <p className="text-xs text-gray-500">{ingredient.category}</p>
          </div>
        </div>
        <Badge 
          className="rounded-8 text-xs font-bold border-0"
          style={{ 
            backgroundColor: getStatusColor() + '20',
            color: getStatusColor()
          }}
        >
          {ingredient.status}
        </Badge>
      </div>

      {/* Stock Level */}
      <div className="mb-4">
        <div className="flex justify-between items-end mb-2">
          <p className="text-sm font-medium text-gray-700">Stock Level</p>
          <p className="text-lg font-bold text-gray-900">
            {ingredient.stockLevel.toFixed(1)} <span className="text-xs font-normal text-gray-500">{ingredient.unit}</span>
          </p>
        </div>
        <Progress 
          value={Math.min(100, stockPercentage)} 
          className="h-2 bg-gray-100"
        />
        <p className="text-xs text-gray-500 mt-1">Min: {ingredient.minThreshold} {ingredient.unit}</p>
      </div>

      {/* Usage Rate */}
      <div className="flex items-center justify-between mb-4 pb-4 border-t border-gray-100">
        <span className="text-xs text-gray-600">Usage Rate</span>
        <Badge 
          variant="outline" 
          className="rounded-8 text-xs"
          style={{ backgroundColor: '#F8F6F3', borderColor: '#C9A27D' }}
        >
          {ingredient.usageRate}
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <PremiumActionButton label="Add Purchase" icon={Plus} variant="primary" />
        <PremiumActionButton label="Update" icon={RefreshCcw} variant="secondary" />
      </div>
    </motion.div>
  );
}

function PremiumActionButton({ label, icon: Icon, variant }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`flex-1 py-2 px-3 rounded-12 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
        variant === 'primary'
          ? 'text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
      style={variant === 'primary' ? {
        background: 'linear-gradient(135deg, #C9A27D, #A68968)',
        boxShadow: '0 2px 8px rgba(201, 162, 125, 0.2)'
      } : {}}
    >
      <Icon className="h-4 w-4" />
      <span>{label}</span>
    </motion.button>
  );
}

function PremiumAddPurchaseDialog({ ingredients, suppliers, onSave }: any) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    ingredientId: '',
    ingredientName: '',
    supplierId: '',
    supplierName: '',
    quantity: '',
    cost: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.ingredientId || !formData.supplierId || !formData.quantity || !formData.cost) {
      toast.error("Missing Fields");
      return;
    }
    onSave({
      ingredientId: formData.ingredientId,
      ingredientName: formData.ingredientName,
      supplierId: formData.supplierId,
      supplierName: formData.supplierName,
      quantity: Number(formData.quantity),
      cost: Number(formData.cost)
    });
    setOpen(false);
    setFormData({ ingredientId: '', ingredientName: '', supplierId: '', supplierName: '', quantity: '', cost: '' });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="rounded-12"
          style={{ 
            background: 'linear-gradient(135deg, #C9A27D, #A68968)',
            boxShadow: '0 4px 12px rgba(201, 162, 125, 0.2)'
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Purchase
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[20px]" style={{ backgroundColor: '#FFFFFF' }}>
        <DialogHeader>
          <DialogTitle>Add Purchase Record</DialogTitle>
          <DialogDescription>Update inventory stock with new purchases</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Ingredient</Label>
            <Select onValueChange={(v) => {
              const selected = ingredients.find((i: any) => i.id === v);
              setFormData({...formData, ingredientId: v, ingredientName: selected?.name || ''});
            }}>
              <SelectTrigger className="rounded-12">
                <SelectValue placeholder="Select ingredient" />
              </SelectTrigger>
              <SelectContent>
                {ingredients.map((i: any) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Supplier</Label>
            <Select onValueChange={(v) => {
              const selected = suppliers.find((s: any) => s.id === v);
              setFormData({...formData, supplierId: v, supplierName: selected?.name || ''});
            }}>
              <SelectTrigger className="rounded-12">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input type="number" placeholder="0.00" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="rounded-12" />
            </div>
            <div className="space-y-2">
              <Label>Total Cost (₹)</Label>
              <Input type="number" placeholder="0.00" value={formData.cost} onChange={(e) => setFormData({...formData, cost: e.target.value})} className="rounded-12" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="rounded-12" style={{ background: 'linear-gradient(135deg, #C9A27D, #A68968)' }}>
              Add Purchase
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
