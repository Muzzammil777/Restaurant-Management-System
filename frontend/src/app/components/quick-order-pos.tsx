import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/app/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { 
  Plus, Minus, X, IndianRupee, UtensilsCrossed, Zap, 
  Search, Sparkles, ShoppingBag, CheckCircle, ChevronDown, 
  ChevronUp, Tag as TagIcon, Flame, Package2 
} from 'lucide-react';
import { toast } from 'sonner';
import { menuApi, ordersApi } from '@/utils/api';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  available: boolean;
  dietType?: 'veg' | 'non-veg';
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'extra-hot';
}

interface ComboMeal {
  id: string;
  name: string;
  description: string;
  items: string[]; // menu item IDs
  originalPrice: number;
  discountedPrice: number;
  image: string;
  available: boolean;
}

interface QuickOrderItem {
  id: string; // unique identifier for order item
  name: string;
  quantity: number;
  price: number;
  isCombo?: boolean;
  comboItems?: string[]; // for display purposes
}

interface QuickOrderPOSProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOrderCreated: () => void;
}

const QUICK_TAGS = ['Extra Spicy', 'No Onion', 'Priority', 'VIP'];

export function QuickOrderPOS({ open, onOpenChange, onOrderCreated }: QuickOrderPOSProps) {
  // Order Info State
  const [orderType, setOrderType] = useState<'dine-in' | 'takeaway'>('dine-in');
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');

  // Menu Data
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [comboMeals, setComboMeals] = useState<ComboMeal[]>([]);
  const [loading, setLoading] = useState(true);

  // Item Selection State
  const [activeTab, setActiveTab] = useState<'combos' | 'items'>('combos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Order Items State
  const [orderItems, setOrderItems] = useState<QuickOrderItem[]>([]);

  // Progressive Disclosure State
  const [showSpecialInstructions, setShowSpecialInstructions] = useState(false);
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  // Fetch menu items and combos from Menu Management
  useEffect(() => {
    if (open) {
      fetchMenuData();
    }
  }, [open]);

  const fetchMenuData = async () => {
    setLoading(true);
    
    // Mock data as fallback (will be replaced when backend APIs are ready)
    const mockMenuItems: MenuItem[] = [
      {
        id: '1',
        name: 'Paneer Tikka',
        category: 'appetizers',
        price: 280,
        description: 'Grilled cottage cheese with spices',
        image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400',
        available: true,
        dietType: 'veg',
        spiceLevel: 'medium'
      },
      {
        id: '2',
        name: 'Butter Chicken',
        category: 'main-course',
        price: 350,
        description: 'Creamy tomato-based chicken curry',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
        available: true,
        dietType: 'non-veg',
        spiceLevel: 'mild'
      },
      {
        id: '3',
        name: 'Dal Makhani',
        category: 'main-course',
        price: 220,
        description: 'Creamy black lentils',
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400',
        available: true,
        dietType: 'veg',
        spiceLevel: 'mild'
      },
      {
        id: '4',
        name: 'Butter Naan',
        category: 'breads',
        price: 50,
        description: 'Soft flatbread with butter',
        image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400',
        available: true,
        dietType: 'veg'
      },
      {
        id: '5',
        name: 'Gulab Jamun',
        category: 'desserts',
        price: 80,
        description: 'Sweet milk dumplings in syrup',
        image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=400',
        available: true,
        dietType: 'veg'
      },
      {
        id: '6',
        name: 'Biryani',
        category: 'main-course',
        price: 320,
        description: 'Fragrant rice with spices',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
        available: true,
        dietType: 'non-veg',
        spiceLevel: 'hot'
      }
    ];

    const mockCombos: ComboMeal[] = [
      {
        id: 'combo1',
        name: 'Family Feast',
        description: 'Butter Chicken + Biryani + 4 Naan + Gulab Jamun',
        items: ['2', '6', '4', '5'],
        originalPrice: 1200,
        discountedPrice: 999,
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
        available: true
      },
      {
        id: 'combo2',
        name: 'Veg Delight',
        description: 'Paneer Tikka + Dal Makhani + 3 Naan',
        items: ['1', '3', '4'],
        originalPrice: 700,
        discountedPrice: 599,
        image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400',
        available: true
      }
    ];

    try {
      // Try fetching from API first
      let menuFetched = false;
      let comboFetched = false;

      try {
        const menuResult = await menuApi.list();
        const data = menuResult.data || menuResult || [];
        if (data.length > 0) {
          const availableItems = data.filter((item: MenuItem) => item.available !== false);
          setMenuItems(availableItems);
          menuFetched = true;
        }
      } catch (menuError) {
        console.log('Menu API not available, using mock data');
      }

      try {
        // Combos API - fallback to mock if not available
        const comboResult = await fetch('http://localhost:8000/api/combos');
        if (comboResult.ok) {
          const comboData = await comboResult.json();
          const availableCombos = (comboData.data || comboData || []).filter((combo: ComboMeal) => combo.available !== false);
          setComboMeals(availableCombos);
          comboFetched = true;
        }
      } catch (comboError) {
        console.log('Combo API not available, using mock data');
      }

      // Use mock data if API fetch failed
      if (!menuFetched) {
        setMenuItems(mockMenuItems);
      }
      if (!comboFetched) {
        setComboMeals(mockCombos);
      }

    } catch (error) {
      console.error('Error fetching menu data:', error);
      // Fallback to mock data
      setMenuItems(mockMenuItems);
      setComboMeals(mockCombos);
      toast.info('Using sample menu data. Connect backend APIs for live data.');
    } finally {
      setLoading(false);
    }
  };

  // Add item to order
  const addItemToOrder = (item: MenuItem) => {
    const existingItem = orderItems.find(
      (oi) => oi.name === item.name && !oi.isCombo
    );

    if (existingItem) {
      setOrderItems(
        orderItems.map((oi) =>
          oi.id === existingItem.id
            ? { ...oi, quantity: oi.quantity + 1 }
            : oi
        )
      );
    } else {
      const newItem: QuickOrderItem = {
        id: `${Date.now()}-${Math.random()}`,
        name: item.name,
        quantity: 1,
        price: item.price,
        isCombo: false,
      };
      setOrderItems([...orderItems, newItem]);
    }

    // Micro-interaction: Toast notification
    toast.success(`${item.name} added!`, { duration: 1500 });
  };

  // Add combo to order
  const addComboToOrder = (combo: ComboMeal) => {
    const newCombo: QuickOrderItem = {
      id: `combo-${Date.now()}-${Math.random()}`,
      name: combo.name,
      quantity: 1,
      price: combo.discountedPrice,
      isCombo: true,
      comboItems: combo.items,
    };

    setOrderItems([...orderItems, newCombo]);
    toast.success(`${combo.name} combo added!`, { duration: 1500 });
  };

  // Update item quantity
  const updateItemQuantity = (itemId: string, delta: number) => {
    setOrderItems(
      orderItems
        .map((item) => {
          if (item.id === itemId) {
            const newQuantity = item.quantity + delta;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Remove item from order
  const removeItemFromOrder = (itemId: string) => {
    setOrderItems(orderItems.filter((item) => item.id !== itemId));
    toast.info('Item removed', { duration: 1500 });
  };

  // Toggle tag
  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Calculate totals
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

  // Validation
  const isOrderValid =
    orderItems.length > 0 &&
    (orderType === 'takeaway' || (orderType === 'dine-in' && tableNumber));

  // Reset form
  const resetForm = () => {
    setOrderType('dine-in');
    setTableNumber('');
    setCustomerName('');
    setOrderItems([]);
    setNotes('');
    setTags([]);
    setSearchQuery('');
    setShowSpecialInstructions(false);
    setActiveTab('combos');
  };

  // Create order
  const handleCreateOrder = async () => {
    if (!isOrderValid) {
      toast.error('Please complete required fields');
      return;
    }

    try {
      const orderData = {
        type: orderType,
        tableNumber: orderType === 'dine-in' ? parseInt(tableNumber) : undefined,
        customerName: customerName || undefined,
        items: orderItems.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        total: subtotal,
        status: 'placed',
        tags: tags.length > 0 ? tags : undefined,
        notes: notes || undefined,
      };

      await ordersApi.create(orderData);
      toast.success('Order created successfully!');
      onOrderCreated();
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    }
  };

  // Filter menu items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = [
    'all',
    ...Array.from(new Set(menuItems.map((item) => item.category))),
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[95vw] lg:max-w-[1400px] p-0 overflow-hidden"
      >
        {/* Header */}
        <div className="sticky top-0 z-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white px-8 py-6 shadow-lg">
          <SheetHeader>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <div>
                <SheetTitle className="text-2xl text-white font-bold">
                  Quick Order - POS Mode
                </SheetTitle>
                <SheetDescription className="text-indigo-100 text-base">
                  Fast, flexible, and professional order management
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>
        </div>

        {/* 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-8 h-[calc(100vh-160px)]">
          {/* LEFT COLUMN: Order Info */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="shadow-md border-2">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-indigo-600" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                {/* Order Type */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Order Type *
                  </Label>
                  <Select
                    value={orderType}
                    onValueChange={(value: 'dine-in' | 'takeaway') =>
                      setOrderType(value)
                    }
                  >
                    <SelectTrigger className="h-12 text-base font-medium border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dine-in">🍽️ Dine-In</SelectItem>
                      <SelectItem value="takeaway">📦 Takeaway</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Table Number (conditional) */}
                {orderType === 'dine-in' && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                      Table Number *
                    </Label>
                    <Input
                      type="number"
                      placeholder="Enter table #"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="h-12 text-lg font-semibold text-center border-2"
                    />
                  </div>
                )}

                {/* Customer Name */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Customer Name
                  </Label>
                  <Input
                    placeholder="Optional"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-12 border-2"
                  />
                </div>

                {/* Progressive Disclosure: Special Instructions */}
                {!showSpecialInstructions ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowSpecialInstructions(true)}
                    className="w-full h-11 gap-2 border-dashed border-2"
                  >
                    <TagIcon className="h-4 w-4" />
                    Add special instructions
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  </Button>
                ) : (
                  <div className="space-y-4 pt-2 border-t-2 border-dashed">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                        Special Instructions
                      </Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowSpecialInstructions(false);
                          setNotes('');
                          setTags([]);
                        }}
                        className="h-7 text-xs"
                      >
                        <ChevronUp className="h-3 w-3 mr-1" />
                        Hide
                      </Button>
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Tags</Label>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_TAGS.map((tag) => (
                          <Button
                            key={tag}
                            size="sm"
                            variant={tags.includes(tag) ? 'default' : 'outline'}
                            onClick={() => toggleTag(tag)}
                            className="h-8 text-xs"
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Notes</Label>
                      <Textarea
                        placeholder="e.g., No onion, Extra spicy..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="resize-none border-2"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* CENTER COLUMN: Item Selection */}
          <div className="lg:col-span-6 flex flex-col">
            <Card className="shadow-md border-2 flex-1 flex flex-col">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-purple-600" />
                  Select Items
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 flex-1 flex flex-col overflow-hidden">
                {/* Tabs: Combos | Individual Items */}
                <Tabs
                  value={activeTab}
                  onValueChange={(value) =>
                    setActiveTab(value as 'combos' | 'items')
                  }
                  className="flex-1 flex flex-col"
                >
                  <TabsList className="grid w-full grid-cols-2 h-12 mb-4">
                    <TabsTrigger value="combos" className="text-base font-semibold">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Combos
                    </TabsTrigger>
                    <TabsTrigger value="items" className="text-base font-semibold">
                      <Package2 className="h-4 w-4 mr-2" />
                      Individual Items
                    </TabsTrigger>
                  </TabsList>

                  {/* Combos Tab */}
                  <TabsContent value="combos" className="flex-1 overflow-hidden mt-0">
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                          <p className="text-sm text-muted-foreground">Loading combos...</p>
                        </div>
                      </div>
                    ) : comboMeals.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center max-w-sm">
                          <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">No Combos Available</h3>
                          <p className="text-sm text-muted-foreground">
                            Create combo meals in Menu Management to see them here
                          </p>
                        </div>
                      </div>
                    ) : (
                      <ScrollArea className="h-full pr-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                          {comboMeals.map((combo) => {
                            const savings = combo.originalPrice - combo.discountedPrice;
                            const discountPercent = Math.round(
                              (savings / combo.originalPrice) * 100
                            );

                            return (
                              <Card
                                key={combo.id}
                                className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-2 hover:border-purple-300 group"
                                onClick={() => addComboToOrder(combo)}
                              >
                                <CardContent className="p-4">
                                  <div className="flex gap-4">
                                    {/* Combo Image */}
                                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100">
                                      <img
                                        src={combo.image}
                                        alt={combo.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      />
                                    </div>

                                    {/* Combo Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2 mb-1">
                                        <h4 className="font-semibold text-base line-clamp-1">
                                          {combo.name}
                                        </h4>
                                        {discountPercent > 0 && (
                                          <Badge className="bg-green-100 text-green-700 text-xs flex-shrink-0">
                                            {discountPercent}% OFF
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                        {combo.description}
                                      </p>
                                      <div className="flex items-center gap-2">
                                        {combo.originalPrice > combo.discountedPrice && (
                                          <span className="text-xs text-muted-foreground line-through flex items-center">
                                            <IndianRupee className="h-3 w-3" />
                                            {combo.originalPrice}
                                          </span>
                                        )}
                                        <span className="text-lg font-bold text-purple-600 flex items-center">
                                          <IndianRupee className="h-4 w-4" />
                                          {combo.discountedPrice}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Add Button */}
                                  <Button
                                    size="sm"
                                    className="w-full mt-3 h-9 gap-2 bg-purple-600 hover:bg-purple-700"
                                  >
                                    <Plus className="h-4 w-4" />
                                    Add Combo
                                  </Button>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>

                  {/* Individual Items Tab */}
                  <TabsContent value="items" className="flex-1 overflow-hidden mt-0 space-y-4">
                    {/* Search & Category Filter */}
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search dishes..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-9 h-11 border-2"
                        />
                      </div>
                      <Select
                        value={selectedCategory}
                        onValueChange={setSelectedCategory}
                      >
                        <SelectTrigger className="w-[180px] h-11 border-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category === 'all'
                                ? 'All Categories'
                                : category.charAt(0).toUpperCase() + category.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Menu Items Grid */}
                    {loading ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                          <p className="text-sm text-muted-foreground">Loading menu...</p>
                        </div>
                      </div>
                    ) : filteredMenuItems.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center max-w-sm">
                          <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                          <h3 className="text-lg font-semibold mb-2">No Items Found</h3>
                          <p className="text-sm text-muted-foreground">
                            {searchQuery
                              ? 'Try adjusting your search or filters'
                              : 'Add menu items in Menu Management to see them here'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <ScrollArea className="h-[calc(100%-80px)] pr-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-4">
                          {filteredMenuItems.map((item) => (
                            <Card
                              key={item.id}
                              className="cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all duration-150 border group"
                              onClick={() => addItemToOrder(item)}
                            >
                              <CardContent className="p-3">
                                <div className="flex gap-3">
                                  {/* Item Image */}
                                  <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gradient-to-br from-orange-100 to-pink-100">
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                          'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
                                      }}
                                    />
                                  </div>

                                  {/* Item Info */}
                                  <div className="flex-1 min-w-0 flex flex-col">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-sm line-clamp-1">
                                          {item.name}
                                        </h4>
                                        <p className="text-xs text-muted-foreground capitalize">
                                          {item.category}
                                        </p>
                                      </div>
                                      {item.dietType && (
                                        <div
                                          className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center flex-shrink-0 ${
                                            item.dietType === 'veg'
                                              ? 'border-green-600'
                                              : 'border-red-600'
                                          }`}
                                        >
                                          <div
                                            className={`w-2 h-2 rounded-full ${
                                              item.dietType === 'veg'
                                                ? 'bg-green-600'
                                                : 'bg-red-600'
                                            }`}
                                          ></div>
                                        </div>
                                      )}
                                    </div>

                                    <div className="flex items-center justify-between mt-auto pt-2">
                                      <span className="text-base font-bold flex items-center text-orange-600">
                                        <IndianRupee className="h-3.5 w-3.5" />
                                        {item.price}
                                      </span>
                                      <Button
                                        size="sm"
                                        className="h-7 px-3 gap-1 text-xs"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          addItemToOrder(item);
                                        }}
                                      >
                                        <Plus className="h-3 w-3" />
                                        Add
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: Live Order Summary (Sticky) */}
          <div className="lg:col-span-3">
            <Card className="shadow-lg border-2 border-green-200 sticky top-0 h-fit max-h-[calc(100vh-200px)] flex flex-col">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package2 className="h-5 w-5 text-green-600" />
                  Live Order Summary
                </CardTitle>
                {totalItems > 0 && (
                  <Badge className="bg-green-600 text-white w-fit">
                    {totalItems} {totalItems === 1 ? 'item' : 'items'}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="pt-4 flex-1 flex flex-col overflow-hidden">
                {orderItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center flex-1">
                    <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4 opacity-30" />
                    <h3 className="text-base font-medium text-muted-foreground mb-1">
                      No items added yet
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Select items to get started
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Order Items List */}
                    <ScrollArea className="flex-1 pr-3 mb-4">
                      <div className="space-y-3">
                        {orderItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border hover:border-green-300 transition-colors group"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium line-clamp-1">
                                    {item.name}
                                  </h4>
                                  {item.isCombo && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs mt-1 bg-purple-50 text-purple-700 border-purple-300"
                                    >
                                      <Sparkles className="h-3 w-3 mr-1" />
                                      Combo
                                    </Badge>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeItemFromOrder(item.id)}
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>

                              {/* Quantity Controls */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateItemQuantity(item.id, -1)}
                                    className="h-7 w-7 p-0 rounded-full"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="text-base font-bold w-8 text-center">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => updateItemQuantity(item.id, 1)}
                                    className="h-7 w-7 p-0 rounded-full"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-muted-foreground flex items-center justify-end">
                                    <IndianRupee className="h-3 w-3" />
                                    {item.price} each
                                  </p>
                                  <p className="text-sm font-bold flex items-center justify-end">
                                    <IndianRupee className="h-3.5 w-3.5" />
                                    {(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

                    {/* Totals */}
                    <div className="pt-4 border-t-2 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Subtotal</span>
                        <span className="text-base font-medium flex items-center">
                          <IndianRupee className="h-4 w-4" />
                          {subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-base font-bold">Total Amount</span>
                        <span className="text-2xl font-bold text-green-600 flex items-center">
                          <IndianRupee className="h-5 w-5" />
                          {subtotal.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sticky Footer with Actions */}
        <div className="sticky bottom-0 bg-white border-t-2 px-8 py-5 shadow-lg">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              className="flex-1 h-12 text-base"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateOrder}
              disabled={!isOrderValid}
              className={`flex-1 h-12 text-base font-semibold gap-2 ${
                !isOrderValid
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
              }`}
            >
              <CheckCircle className="h-5 w-5" />
              {!isOrderValid
                ? orderItems.length === 0
                  ? 'Add items to create order'
                  : 'Enter table number'
                : `Create Order (${totalItems} ${totalItems === 1 ? 'item' : 'items'})`}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}