import React, { useState, useMemo, useEffect } from 'react';
import { Play, Plus, Info, Search, TrendingDown, AlertTriangle, Phone, Mail, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Label } from '@/app/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Ingredient {
  id: string;
  name: string;
  category: string;
  stockLevel: number;
  unit: string;
  minThreshold: number;
  maxThreshold: number;
  usageRate: number;
  lastOrderDate: string;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  status: 'Active' | 'Inactive';
}

interface SupplierItem {
  ingredientId: string;
  ingredientName: string;
  unitPrice: number;
  minOrderQuantity: number;
  avgDeliveryDays: number;
}

interface PurchaseRecord {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  cost: number;
  referenceId: string;
}

interface DeductionEvent {
  id: string;
  timestamp: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

const INGREDIENTS_DATA: Ingredient[] = [
  // Vegetables (10)
  { id: 'v1', name: 'Onion', category: 'Vegetables', stockLevel: 45, unit: 'kg', minThreshold: 10, maxThreshold: 100, usageRate: 8.5, lastOrderDate: '2026-02-03' },
  { id: 'v2', name: 'Tomato', category: 'Vegetables', stockLevel: 32, unit: 'kg', minThreshold: 15, maxThreshold: 80, usageRate: 6.2, lastOrderDate: '2026-02-03' },
  { id: 'v3', name: 'Potato', category: 'Vegetables', stockLevel: 78, unit: 'kg', minThreshold: 20, maxThreshold: 150, usageRate: 5.1, lastOrderDate: '2026-02-02' },
  { id: 'v4', name: 'Carrot', category: 'Vegetables', stockLevel: 22, unit: 'kg', minThreshold: 8, maxThreshold: 60, usageRate: 3.4, lastOrderDate: '2026-02-03' },
  { id: 'v5', name: 'Beans', category: 'Vegetables', stockLevel: 15, unit: 'kg', minThreshold: 5, maxThreshold: 50, usageRate: 2.1, lastOrderDate: '2026-02-03' },
  { id: 'v6', name: 'Cabbage', category: 'Vegetables', stockLevel: 28, unit: 'kg', minThreshold: 10, maxThreshold: 70, usageRate: 2.8, lastOrderDate: '2026-02-02' },
  { id: 'v7', name: 'Cauliflower', category: 'Vegetables', stockLevel: 8, unit: 'kg', minThreshold: 5, maxThreshold: 40, usageRate: 1.5, lastOrderDate: '2026-02-01' },
  { id: 'v8', name: 'Capsicum', category: 'Vegetables', stockLevel: 12, unit: 'kg', minThreshold: 5, maxThreshold: 35, usageRate: 2.3, lastOrderDate: '2026-02-03' },
  { id: 'v9', name: 'Green Chilli', category: 'Vegetables', stockLevel: 3, unit: 'kg', minThreshold: 1, maxThreshold: 15, usageRate: 0.8, lastOrderDate: '2026-02-03' },
  { id: 'v10', name: 'Ginger', category: 'Vegetables', stockLevel: 5, unit: 'kg', minThreshold: 2, maxThreshold: 20, usageRate: 1.2, lastOrderDate: '2026-02-02' },

  // Herbs & Spices (10)
  { id: 'h1', name: 'Garlic', category: 'Herbs & Spices', stockLevel: 8, unit: 'kg', minThreshold: 2, maxThreshold: 25, usageRate: 1.5, lastOrderDate: '2026-02-03' },
  { id: 'h2', name: 'Coriander Leaves', category: 'Herbs & Spices', stockLevel: 2, unit: 'kg', minThreshold: 1, maxThreshold: 10, usageRate: 0.6, lastOrderDate: '2026-02-03' },
  { id: 'h3', name: 'Mint Leaves', category: 'Herbs & Spices', stockLevel: 1.5, unit: 'kg', minThreshold: 1, maxThreshold: 8, usageRate: 0.4, lastOrderDate: '2026-02-02' },
  { id: 'h4', name: 'Curry Leaves', category: 'Herbs & Spices', stockLevel: 1, unit: 'kg', minThreshold: 0.5, maxThreshold: 5, usageRate: 0.3, lastOrderDate: '2026-02-01' },
  { id: 'h5', name: 'Turmeric Powder', category: 'Herbs & Spices', stockLevel: 4, unit: 'kg', minThreshold: 2, maxThreshold: 15, usageRate: 0.8, lastOrderDate: '2026-02-03' },
  { id: 'h6', name: 'Chilli Powder', category: 'Herbs & Spices', stockLevel: 3, unit: 'kg', minThreshold: 1, maxThreshold: 12, usageRate: 0.7, lastOrderDate: '2026-02-03' },
  { id: 'h7', name: 'Garam Masala', category: 'Herbs & Spices', stockLevel: 2, unit: 'kg', minThreshold: 1, maxThreshold: 10, usageRate: 0.5, lastOrderDate: '2026-02-02' },
  { id: 'h8', name: 'Cumin Seeds', category: 'Herbs & Spices', stockLevel: 5, unit: 'kg', minThreshold: 2, maxThreshold: 18, usageRate: 0.9, lastOrderDate: '2026-02-03' },
  { id: 'h9', name: 'Mustard Seeds', category: 'Herbs & Spices', stockLevel: 3, unit: 'kg', minThreshold: 1, maxThreshold: 10, usageRate: 0.4, lastOrderDate: '2026-02-02' },
  { id: 'h10', name: 'Pepper', category: 'Herbs & Spices', stockLevel: 2, unit: 'kg', minThreshold: 1, maxThreshold: 8, usageRate: 0.3, lastOrderDate: '2026-02-03' },

  // Dairy (5)
  { id: 'd1', name: 'Milk', category: 'Dairy', stockLevel: 25, unit: 'liter', minThreshold: 10, maxThreshold: 60, usageRate: 4.2, lastOrderDate: '2026-02-03' },
  { id: 'd2', name: 'Butter', category: 'Dairy', stockLevel: 12, unit: 'kg', minThreshold: 5, maxThreshold: 30, usageRate: 2.1, lastOrderDate: '2026-02-03' },
  { id: 'd3', name: 'Cheese', category: 'Dairy', stockLevel: 8, unit: 'kg', minThreshold: 3, maxThreshold: 25, usageRate: 1.8, lastOrderDate: '2026-02-03' },
  { id: 'd4', name: 'Paneer', category: 'Dairy', stockLevel: 15, unit: 'kg', minThreshold: 5, maxThreshold: 40, usageRate: 3.5, lastOrderDate: '2026-02-03' },
  { id: 'd5', name: 'Curd', category: 'Dairy', stockLevel: 18, unit: 'kg', minThreshold: 8, maxThreshold: 45, usageRate: 2.9, lastOrderDate: '2026-02-02' },

  // Grains & Flours (5)
  { id: 'g1', name: 'Rice', category: 'Grains & Flours', stockLevel: 95, unit: 'kg', minThreshold: 30, maxThreshold: 200, usageRate: 7.5, lastOrderDate: '2026-02-02' },
  { id: 'g2', name: 'Basmati Rice', category: 'Grains & Flours', stockLevel: 52, unit: 'kg', minThreshold: 15, maxThreshold: 100, usageRate: 4.2, lastOrderDate: '2026-02-03' },
  { id: 'g3', name: 'Wheat Flour', category: 'Grains & Flours', stockLevel: 48, unit: 'kg', minThreshold: 20, maxThreshold: 120, usageRate: 5.1, lastOrderDate: '2026-02-03' },
  { id: 'g4', name: 'Maida', category: 'Grains & Flours', stockLevel: 35, unit: 'kg', minThreshold: 15, maxThreshold: 80, usageRate: 3.8, lastOrderDate: '2026-02-03' },
  { id: 'g5', name: 'Corn Flour', category: 'Grains & Flours', stockLevel: 18, unit: 'kg', minThreshold: 8, maxThreshold: 45, usageRate: 1.6, lastOrderDate: '2026-02-02' },

  // Oils & Liquids (5)
  { id: 'o1', name: 'Sunflower Oil', category: 'Oils & Liquids', stockLevel: 42, unit: 'liter', minThreshold: 15, maxThreshold: 100, usageRate: 6.5, lastOrderDate: '2026-02-03' },
  { id: 'o2', name: 'Groundnut Oil', category: 'Oils & Liquids', stockLevel: 28, unit: 'liter', minThreshold: 10, maxThreshold: 70, usageRate: 4.3, lastOrderDate: '2026-02-03' },
  { id: 'o3', name: 'Olive Oil', category: 'Oils & Liquids', stockLevel: 8, unit: 'liter', minThreshold: 3, maxThreshold: 25, usageRate: 1.2, lastOrderDate: '2026-02-02' },
  { id: 'o4', name: 'Ghee', category: 'Oils & Liquids', stockLevel: 15, unit: 'kg', minThreshold: 5, maxThreshold: 40, usageRate: 2.4, lastOrderDate: '2026-02-03' },
  { id: 'o5', name: 'Vinegar', category: 'Oils & Liquids', stockLevel: 6, unit: 'liter', minThreshold: 2, maxThreshold: 15, usageRate: 0.8, lastOrderDate: '2026-02-02' },

  // Proteins (5)
  { id: 'p1', name: 'Chicken', category: 'Proteins', stockLevel: 35, unit: 'kg', minThreshold: 10, maxThreshold: 80, usageRate: 6.2, lastOrderDate: '2026-02-03' },
  { id: 'p2', name: 'Mutton', category: 'Proteins', stockLevel: 18, unit: 'kg', minThreshold: 5, maxThreshold: 50, usageRate: 2.8, lastOrderDate: '2026-02-02' },
  { id: 'p3', name: 'Fish', category: 'Proteins', stockLevel: 12, unit: 'kg', minThreshold: 5, maxThreshold: 40, usageRate: 2.1, lastOrderDate: '2026-02-03' },
  { id: 'p4', name: 'Egg', category: 'Proteins', stockLevel: 180, unit: 'pieces', minThreshold: 50, maxThreshold: 300, usageRate: 22.5, lastOrderDate: '2026-02-03' },
  { id: 'p5', name: 'Prawns', category: 'Proteins', stockLevel: 8, unit: 'kg', minThreshold: 3, maxThreshold: 25, usageRate: 1.5, lastOrderDate: '2026-02-02' },

  // Bakery (4)
  { id: 'b1', name: 'Bread', category: 'Bakery', stockLevel: 22, unit: 'pieces', minThreshold: 10, maxThreshold: 60, usageRate: 3.5, lastOrderDate: '2026-02-03' },
  { id: 'b2', name: 'Burger Bun', category: 'Bakery', stockLevel: 45, unit: 'pieces', minThreshold: 20, maxThreshold: 100, usageRate: 6.2, lastOrderDate: '2026-02-03' },
  { id: 'b3', name: 'Pizza Base', category: 'Bakery', stockLevel: 28, unit: 'pieces', minThreshold: 10, maxThreshold: 70, usageRate: 4.5, lastOrderDate: '2026-02-03' },
  { id: 'b4', name: 'Bread Crumbs', category: 'Bakery', stockLevel: 5, unit: 'kg', minThreshold: 2, maxThreshold: 15, usageRate: 0.7, lastOrderDate: '2026-02-02' },

  // Sauces & Condiments (5)
  { id: 's1', name: 'Tomato Ketchup', category: 'Sauces & Condiments', stockLevel: 12, unit: 'liter', minThreshold: 5, maxThreshold: 30, usageRate: 1.8, lastOrderDate: '2026-02-03' },
  { id: 's2', name: 'Soy Sauce', category: 'Sauces & Condiments', stockLevel: 8, unit: 'liter', minThreshold: 3, maxThreshold: 20, usageRate: 1.2, lastOrderDate: '2026-02-03' },
  { id: 's3', name: 'Chilli Sauce', category: 'Sauces & Condiments', stockLevel: 6, unit: 'liter', minThreshold: 2, maxThreshold: 18, usageRate: 0.9, lastOrderDate: '2026-02-02' },
  { id: 's4', name: 'Mayonnaise', category: 'Sauces & Condiments', stockLevel: 5, unit: 'kg', minThreshold: 2, maxThreshold: 15, usageRate: 0.8, lastOrderDate: '2026-02-03' },
  { id: 's5', name: 'Mustard Sauce', category: 'Sauces & Condiments', stockLevel: 3, unit: 'liter', minThreshold: 1, maxThreshold: 10, usageRate: 0.4, lastOrderDate: '2026-02-02' },

  // Others (5)
  { id: 'ot1', name: 'Sugar', category: 'Others', stockLevel: 32, unit: 'kg', minThreshold: 10, maxThreshold: 80, usageRate: 2.5, lastOrderDate: '2026-02-03' },
  { id: 'ot2', name: 'Salt', category: 'Others', stockLevel: 22, unit: 'kg', minThreshold: 8, maxThreshold: 60, usageRate: 1.8, lastOrderDate: '2026-02-03' },
  { id: 'ot3', name: 'Tea Powder', category: 'Others', stockLevel: 4, unit: 'kg', minThreshold: 2, maxThreshold: 12, usageRate: 0.6, lastOrderDate: '2026-02-02' },
  { id: 'ot4', name: 'Coffee Powder', category: 'Others', stockLevel: 6, unit: 'kg', minThreshold: 2, maxThreshold: 15, usageRate: 0.8, lastOrderDate: '2026-02-03' },
  { id: 'ot5', name: 'Ice Cubes', category: 'Others', stockLevel: 45, unit: 'kg', minThreshold: 15, maxThreshold: 100, usageRate: 5.2, lastOrderDate: '2026-02-03' },
];

const SUPPLIERS_DATA: Supplier[] = [
  {
    id: 's1',
    name: 'Fresh Produce Co.',
    contactPerson: 'Rajesh Kumar',
    phone: '+91-9876543210',
    email: 'rajesh@freshproduce.com',
    address: '123 Market Street, Food District, Mumbai',
    status: 'Active',
  },
  {
    id: 's2',
    name: 'Spice Master Trading',
    contactPerson: 'Priya Sharma',
    phone: '+91-8765432109',
    email: 'priya@spicemaster.com',
    address: '456 Spice Lane, Old City, Delhi',
    status: 'Active',
  },
  {
    id: 's3',
    name: 'Dairy Delights Ltd.',
    contactPerson: 'Amit Patel',
    phone: '+91-7654321098',
    email: 'amit@dairydelights.com',
    address: '789 Dairy Avenue, Farm Region, Gujarat',
    status: 'Active',
  },
  {
    id: 's4',
    name: 'Grain Wholesale Hub',
    contactPerson: 'Vikram Singh',
    phone: '+91-6543210987',
    email: 'vikram@grainwholesale.com',
    address: '321 Grain Market, Agricultural Zone, Punjab',
    status: 'Active',
  },
  {
    id: 's5',
    name: 'Premium Oil Suppliers',
    contactPerson: 'Neha Gupta',
    phone: '+91-5432109876',
    email: 'neha@premiumpmoil.com',
    address: '654 Oil Street, Industrial Area, Bangalore',
    status: 'Active',
  },
  {
    id: 's6',
    name: 'Protein Partners',
    contactPerson: 'Ravi Desai',
    phone: '+91-4321098765',
    email: 'ravi@proteinpartners.com',
    address: '987 Meat Market, Cold Storage Zone, Kolkata',
    status: 'Inactive',
  },
];

const SUPPLIER_ITEMS_MAPPING: Record<string, SupplierItem[]> = {
  's1': [
    { ingredientId: 'v1', ingredientName: 'Onion', unitPrice: 45, minOrderQuantity: 25, avgDeliveryDays: 1 },
    { ingredientId: 'v2', ingredientName: 'Tomato', unitPrice: 60, minOrderQuantity: 20, avgDeliveryDays: 1 },
    { ingredientId: 'v3', ingredientName: 'Potato', unitPrice: 35, minOrderQuantity: 50, avgDeliveryDays: 2 },
    { ingredientId: 'v4', ingredientName: 'Carrot', unitPrice: 55, minOrderQuantity: 20, avgDeliveryDays: 2 },
  ],
  's2': [
    { ingredientId: 'h1', ingredientName: 'Garlic', unitPrice: 120, minOrderQuantity: 5, avgDeliveryDays: 1 },
    { ingredientId: 'h5', ingredientName: 'Turmeric Powder', unitPrice: 380, minOrderQuantity: 2, avgDeliveryDays: 3 },
    { ingredientId: 'h6', ingredientName: 'Chilli Powder', unitPrice: 420, minOrderQuantity: 2, avgDeliveryDays: 3 },
  ],
  's3': [
    { ingredientId: 'd1', ingredientName: 'Milk', unitPrice: 55, minOrderQuantity: 10, avgDeliveryDays: 1 },
    { ingredientId: 'd2', ingredientName: 'Butter', unitPrice: 450, minOrderQuantity: 5, avgDeliveryDays: 2 },
    { ingredientId: 'd4', ingredientName: 'Paneer', unitPrice: 480, minOrderQuantity: 5, avgDeliveryDays: 1 },
  ],
  's4': [
    { ingredientId: 'g1', ingredientName: 'Rice', unitPrice: 65, minOrderQuantity: 50, avgDeliveryDays: 2 },
    { ingredientId: 'g2', ingredientName: 'Basmati Rice', unitPrice: 140, minOrderQuantity: 25, avgDeliveryDays: 2 },
    { ingredientId: 'g3', ingredientName: 'Wheat Flour', unitPrice: 35, minOrderQuantity: 50, avgDeliveryDays: 3 },
  ],
  's5': [
    { ingredientId: 'o1', ingredientName: 'Sunflower Oil', unitPrice: 95, minOrderQuantity: 20, avgDeliveryDays: 1 },
    { ingredientId: 'o2', ingredientName: 'Groundnut Oil', unitPrice: 110, minOrderQuantity: 20, avgDeliveryDays: 2 },
    { ingredientId: 'o4', ingredientName: 'Ghee', unitPrice: 680, minOrderQuantity: 5, avgDeliveryDays: 1 },
  ],
  's6': [
    { ingredientId: 'p1', ingredientName: 'Chicken', unitPrice: 380, minOrderQuantity: 10, avgDeliveryDays: 1 },
    { ingredientId: 'p3', ingredientName: 'Fish', unitPrice: 550, minOrderQuantity: 5, avgDeliveryDays: 1 },
    { ingredientId: 'p4', ingredientName: 'Egg', unitPrice: 6, minOrderQuantity: 100, avgDeliveryDays: 1 },
  ],
};

type TabType = 'dashboard' | 'ingredients' | 'deduction' | 'suppliers' | 'purchases';

export function InventoryManagementTable({ triggerStockManagement }: { triggerStockManagement?: () => void }) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [ingredients, setIngredients] = useState<Ingredient[]>(INGREDIENTS_DATA);
  const [deductionFeed, setDeductionFeed] = useState<DeductionEvent[]>([]);
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const [showAddPurchase, setShowAddPurchase] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    ingredientId: '',
    quantity: 0,
    supplierId: '',
    cost: 0,
  });

  // Load from localStorage on mount
  useEffect(() => {
    const savedPurchases = localStorage.getItem('inventoryPurchases');
    const savedDeductions = localStorage.getItem('inventoryDeductions');
    const savedIngredients = localStorage.getItem('inventoryLevels');

    if (savedPurchases) setPurchaseRecords(JSON.parse(savedPurchases));
    if (savedDeductions) setDeductionFeed(JSON.parse(savedDeductions));
    if (savedIngredients) setIngredients(JSON.parse(savedIngredients));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('inventoryPurchases', JSON.stringify(purchaseRecords));
  }, [purchaseRecords]);

  useEffect(() => {
    localStorage.setItem('inventoryDeductions', JSON.stringify(deductionFeed));
  }, [deductionFeed]);

  useEffect(() => {
    localStorage.setItem('inventoryLevels', JSON.stringify(ingredients));
  }, [ingredients]);

  // Calculate stock status
  const getStatus = (ingredient: Ingredient) => {
    if (ingredient.stockLevel === 0) return 'Out';
    if (ingredient.stockLevel <= ingredient.minThreshold) return 'Low';
    return 'In Stock';
  };

  // Get status color
  const getStatusColor = (status: string) => {
    if (status === 'In Stock') return 'bg-green-100 text-green-800';
    if (status === 'Low') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  // Get status icon color
  const getStatusIconColor = (status: string) => {
    if (status === 'In Stock') return 'text-green-600';
    if (status === 'Low') return 'text-yellow-600';
    return 'text-red-600';
  };

  // Get progress bar color
  const getProgressColor = (ingredient: Ingredient) => {
    const percentage = (ingredient.stockLevel / ingredient.maxThreshold) * 100;
    if (percentage > 50) return 'bg-green-500';
    if (percentage > 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Get unique categories
  const categories = Array.from(new Set(ingredients.map(i => i.category))).sort();

  // Calculate statistics
  const lowStockItems = useMemo(() => 
    ingredients.filter(i => i.stockLevel > 0 && i.stockLevel <= i.minThreshold),
    [ingredients]
  );

  const outOfStockItems = useMemo(() =>
    ingredients.filter(i => i.stockLevel === 0),
    [ingredients]
  );

  // Filter ingredients
  const filteredIngredients = useMemo(() => {
    return ingredients.filter(ingredient => {
      const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ingredient.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const status = getStatus(ingredient);
      const matchesStatus = statusFilter === 'all' || status === statusFilter;
      
      const matchesCategory = categoryFilter === 'all' || ingredient.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [ingredients, searchTerm, statusFilter, categoryFilter]);

  // Simulate live orders
  const handleSimulateOrders = () => {
    console.log('🎬 Simulate Orders clicked! Current ingredients:', ingredients.length);
    const newDeductions: DeductionEvent[] = [];
    
    const updatedIngredients = ingredients.map(ingredient => {
      const deduction = Math.floor(Math.random() * 5) + 1;
      const newStock = Math.max(0, ingredient.stockLevel - deduction);
      
      // Collect deduction event
      newDeductions.push({
        id: `deduction-${Date.now()}-${Math.random()}-${ingredient.id}`,
        timestamp: new Date().toLocaleTimeString(),
        ingredientName: ingredient.name,
        quantity: deduction,
        unit: ingredient.unit,
      });
      
      return {
        ...ingredient,
        stockLevel: newStock,
        lastOrderDate: new Date().toISOString().split('T')[0],
      };
    });
    
    console.log('📊 Deductions recorded:', newDeductions.length);
    console.log('📉 Updated ingredients:', updatedIngredients[0]);
    
    // Update all state at once
    setIngredients(updatedIngredients);
    setDeductionFeed(prev => {
      const updated = [...prev, ...newDeductions].slice(-50);
      console.log('✅ Deduction feed updated. Total:', updated.length);
      return updated;
    });
    
    // Show success notification
    toast.success('Orders Simulated', {
      description: `Deducted stock from ${newDeductions.length} ingredients. Check the Deduction Feed tab!`
    });
  };

  // Handle add purchase
  const handleAddPurchase = () => {
    if (!purchaseForm.ingredientId || purchaseForm.quantity <= 0 || !purchaseForm.supplierId) {
      alert('Please fill all fields');
      return;
    }

    const ingredient = ingredients.find(i => i.id === purchaseForm.ingredientId);
    const supplier = SUPPLIERS_DATA.find(s => s.id === purchaseForm.supplierId);

    if (!ingredient || !supplier) return;

    // Update stock
    const updatedIngredients = ingredients.map(i =>
      i.id === purchaseForm.ingredientId
        ? { ...i, stockLevel: i.stockLevel + purchaseForm.quantity }
        : i
    );
    setIngredients(updatedIngredients);

    // Create purchase record
    const newPurchase: PurchaseRecord = {
      id: `purchase-${Date.now()}`,
      ingredientId: purchaseForm.ingredientId,
      ingredientName: ingredient.name,
      quantity: purchaseForm.quantity,
      unit: ingredient.unit,
      supplierId: purchaseForm.supplierId,
      supplierName: supplier.name,
      purchaseDate: new Date().toISOString().split('T')[0],
      cost: purchaseForm.cost,
      referenceId: `PO-${Date.now()}`,
    };

    setPurchaseRecords(prev => [newPurchase, ...prev]);

    // Reset form
    setPurchaseForm({ ingredientId: '', quantity: 0, supplierId: '', cost: 0 });
    setShowAddPurchase(false);
  };

  return (
    <div className="w-full bg-white rounded-lg">
      {/* HEADER */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">System is running in strict Order-Driven mode.</span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleSimulateOrders}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <Play size={16} />
              Simulate Live Orders
            </Button>
            <Button
              onClick={handleAddPurchase}
              className="bg-gray-800 hover:bg-gray-900 text-white gap-2"
            >
              <Plus size={16} />
              Add Purchase
            </Button>
          </div>
        </div>
      </div>

      {/* INFO BANNER */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg m-6 p-4 flex gap-4">
        <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-blue-900">Stock Logic Active</h3>
          <p className="text-sm text-blue-800 mt-1">
            Inventory stock is automatically updated only from confirmed customer orders. Manual adjustments are disabled to prevent theft and mismanagement.
          </p>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="px-6 pt-4 flex gap-3 border-b border-gray-200">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: '📊' },
          { id: 'ingredients', label: 'Ingredients Stock', icon: '🥗' },
          { id: 'deduction', label: 'Deduction Feed', icon: '📉' },
          { id: 'suppliers', label: 'Suppliers', icon: '🚚' },
          { id: 'purchases', label: 'Purchase Records', icon: '📋' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`px-4 py-3 rounded-t-lg font-medium text-sm whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT - DASHBOARD */}
      {activeTab === 'dashboard' && (
        <div className="p-6 space-y-6">
          {/* KPI CARDS */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Stock Items</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{ingredients.length}</p>
                </div>
                <div className="text-4xl">📦</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Low Stock Items</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{lowStockItems.length}</p>
                </div>
                <div className="text-4xl">⚠️</div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Out of Stock Items</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{outOfStockItems.length}</p>
                </div>
                <div className="text-4xl">❌</div>
              </div>
            </div>
          </div>

          {/* LOW STOCK ALERTS */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={18} className="text-orange-600" />
              Low Stock Alerts
            </h3>

            {lowStockItems.length === 0 ? (
              <p className="text-gray-600 text-sm">All inventory levels are healthy</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {lowStockItems.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-600">Current: {item.stockLevel} {item.unit} | Min: {item.minThreshold} {item.unit}</p>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800">
                      {item.stockLevel} {item.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTENT */}
      {activeTab === 'ingredients' && (
        <div className="p-6">
          {/* FILTER BAR */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="In Stock">In Stock</SelectItem>
                <SelectItem value="Low">Low Stock</SelectItem>
                <SelectItem value="Out">Out of Stock</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* INGREDIENT TABLE */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ingredient Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Stock Level</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Usage Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {filteredIngredients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                        No ingredients found
                      </td>
                    </tr>
                  ) : (
                    filteredIngredients.map((ingredient) => {
                      const status = getStatus(ingredient);
                      const percentage = (ingredient.stockLevel / ingredient.maxThreshold) * 100;
                      return (
                        <tr key={ingredient.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{ingredient.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{ingredient.category}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                            {ingredient.stockLevel} {ingredient.unit}
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${getProgressColor(ingredient)}`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-500 mt-1 block">{Math.round(percentage)}%</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={getStatusColor(status)}>
                              {status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <TrendingDown size={14} className={getStatusIconColor(status)} />
                              {ingredient.usageRate} {ingredient.unit}/day
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{ingredient.lastOrderDate}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLE FOOTER */}
          <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
            <div>
              Showing <span className="font-medium">{filteredIngredients.length}</span> of <span className="font-medium">{ingredients.length}</span> ingredients
            </div>
            <div className="space-x-4">
              <span>✓ In Stock: <span className="font-medium">{filteredIngredients.filter(i => getStatus(i) === 'In Stock').length}</span></span>
              <span>⚠ Low Stock: <span className="font-medium">{filteredIngredients.filter(i => getStatus(i) === 'Low').length}</span></span>
              <span>✗ Out: <span className="font-medium">{filteredIngredients.filter(i => getStatus(i) === 'Out').length}</span></span>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT - DEDUCTION FEED */}
      {activeTab === 'deduction' && (
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Live Deduction Feed</h3>
          {deductionFeed.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No deductions recorded yet. Simulate orders to see live updates.</p>
          ) : (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={deductionFeed.map((event, idx) => ({
                  name: event.ingredientName,
                  quantity: event.quantity,
                  time: idx,
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="quantity" stroke="#ef4444" name="Quantity Deducted" />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Recent Deductions</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {[...deductionFeed].reverse().map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium text-gray-900">{event.ingredientName}</p>
                        <p className="text-xs text-gray-600">{event.timestamp}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">-{event.quantity} {event.unit}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENT - SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="p-6">
          <div className="space-y-4">
            {SUPPLIERS_DATA.map((supplier) => {
              const suppliedItems = SUPPLIER_ITEMS_MAPPING[supplier.id] || [];
              return (
                <div key={supplier.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-semibold text-gray-900">{supplier.name}</h4>
                        <Badge className={supplier.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {supplier.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{supplier.contactPerson}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-500" />
                      <span className="text-gray-700">{supplier.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      <span className="text-gray-700">{supplier.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-500" />
                      <span className="text-gray-700">{supplier.address}</span>
                    </div>
                  </div>

                  {suppliedItems.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h5 className="font-medium text-gray-900 mb-3">Supplied Items:</h5>
                      <div className="space-y-2">
                        {suppliedItems.map((item) => (
                          <div key={item.ingredientId} className="text-sm flex items-center justify-between p-2 bg-gray-50 rounded">
                            <span className="text-gray-900 font-medium">{item.ingredientName}</span>
                            <div className="flex gap-4 text-gray-600">
                              <span>₹{item.unitPrice}/unit</span>
                              <span>Min: {item.minOrderQuantity}</span>
                              <span>{item.avgDeliveryDays}d delivery</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CONTENT - PURCHASE RECORDS */}
      {activeTab === 'purchases' && (
        <div className="p-6">
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Reference ID</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Ingredient</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Supplier</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {purchaseRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No purchase records yet
                      </td>
                    </tr>
                  ) : (
                    purchaseRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{record.referenceId}</td>
                        <td className="px-4 py-3 text-gray-900">{record.ingredientName}</td>
                        <td className="px-4 py-3 text-gray-600">{record.quantity} {record.unit}</td>
                        <td className="px-4 py-3 text-gray-600">{record.supplierName}</td>
                        <td className="px-4 py-3 text-gray-600">{record.purchaseDate}</td>
                        <td className="px-4 py-3 font-medium text-gray-900">₹{record.cost}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {purchaseRecords.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600">
                Total Purchases: <span className="font-semibold text-gray-900">{purchaseRecords.length}</span>
              </p>
              <p className="text-sm text-gray-600">
                Total Cost: <span className="font-semibold text-gray-900">₹{purchaseRecords.reduce((sum, r) => sum + r.cost, 0)}</span>
              </p>
            </div>
          )}
        </div>
      )}

      {/* ADD PURCHASE MODAL */}
      <Dialog open={showAddPurchase} onOpenChange={setShowAddPurchase}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Purchase</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Ingredient</Label>
              <Select value={purchaseForm.ingredientId} onValueChange={(value) => setPurchaseForm({ ...purchaseForm, ingredientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ingredient" />
                </SelectTrigger>
                <SelectContent>
                  {ingredients.map(ing => (
                    <SelectItem key={ing.id} value={ing.id}>{ing.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={purchaseForm.quantity || ''}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: parseFloat(e.target.value) || 0 })}
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <Label>Supplier</Label>
              <Select value={purchaseForm.supplierId} onValueChange={(value) => setPurchaseForm({ ...purchaseForm, supplierId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select supplier" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPLIERS_DATA.filter(s => s.status === 'Active').map(sup => (
                    <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Cost (₹)</Label>
              <Input
                type="number"
                min="0"
                value={purchaseForm.cost || ''}
                onChange={(e) => setPurchaseForm({ ...purchaseForm, cost: parseFloat(e.target.value) || 0 })}
                placeholder="Enter total cost"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPurchase(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPurchase} className="bg-blue-600 hover:bg-blue-700">
              Add Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
