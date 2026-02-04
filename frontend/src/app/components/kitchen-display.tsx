import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Clock, ChefHat, AlertCircle, Package, LogOut, Shield, Delete, BarChart3, Activity, Utensils, User } from 'lucide-react';
import { ordersApi } from '@/utils/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { MOCK_CHEFS } from './kitchen-features/data';
import { ChefProfile, Station } from './kitchen-features/types';

interface Order {
  id: string;
  tableNumber?: number;
  items: Array<{
    name: string;
    quantity: number;
    customizations?: string[];
    // RMS does not natively have station/status per item, so we infer/mock locally for this view
    status?: 'PENDING' | 'PREPARING' | 'COMPLETED';
    station?: Station;
  }>;
  status: string;
  createdAt: string;
  type: string;
}

export function KitchenDisplay() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // New State for Mochakds Features
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeChef, setActiveChef] = useState<ChefProfile | null>(null);
  const [loginPin, setLoginPin] = useState('');
  const [activeTab, setActiveTab] = useState('board');

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 5000); // Refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]); // Only fetch if authenticated

  const handleLogin = (chefToLogin: ChefProfile | null = activeChef) => {
    if (!chefToLogin) {
      toast.error('Select a chef profile');
      return;
    }
    // Simple PIN logic mirroring Mochakds: 1 -> 1111, 2 -> 2222
    const id = chefToLogin.id;
    const validPin = id === '10' ? '1010' : `${id}${id}${id}${id}`;

    if (loginPin === validPin) {
      setActiveChef(chefToLogin);
      setIsAuthenticated(true);
      setLoginPin('');
      toast.success(`Welcome Chef ${chefToLogin.name}`);
    } else {
      toast.error('Invalid PIN');
      setLoginPin('');
    }
  };

  const handleKeypadPress = (num: string) => {
    if (loginPin.length < 4) setLoginPin(prev => prev + num);
  };

  const handleBackspace = () => {
    setLoginPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setLoginPin('');
  };


  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveChef(null);
  };

  const fetchOrders = async () => {
    try {
      const result = await ordersApi.list();
      const data = result.data || [];
      // Filter active orders
      const activeOrders = data.filter((order: Order) =>
        ['placed', 'preparing', 'ready'].includes(order.status)
      );

      // Augment orders with local state if needed (mocking item status/station since api doesn't return it yet)
      // In a real merge, we'd persist this. For now, we assume all items are PENDING unless order is READY
      const augmentedOrders = activeOrders.map((order: Order) => ({
        ...order,
        items: order.items.map(item => ({
          ...item,
          status: item.status || (order.status === 'ready' ? 'COMPLETED' : 'PENDING'),
          station: inferStation(item.name)
        }))
      }));

      setOrders(augmentedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const inferStation = (itemName: string): Station => {
    const lower = itemName.toLowerCase();
    if (lower.includes('curry') || lower.includes('paneer') || lower.includes('dal')) return 'CURRY';
    if (lower.includes('rice') || lower.includes('biryani')) return 'RICE';
    if (lower.includes('fry') || lower.includes('65') || lower.includes('manchurian')) return 'FRY';
    if (lower.includes('starter') || lower.includes('soup')) return 'STARTER';
    if (lower.includes('dessert') || lower.includes('sweet') || lower.includes('jamun') || lower.includes('cake')) return 'DESSERT';
    return 'ALL'; // Fallback
  };

  // Filter orders based on active chef's station
  const filteredOrders = orders.filter(order => {
    if (!activeChef || activeChef.station === 'ALL') return true;
    // Show order if it has ANY item for this station
    return order.items.some(item => item.station === activeChef.station || item.station === 'ALL');
  });

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const cleanId = orderId.replace('order:', '');
      await ordersApi.updateStatus(cleanId, newStatus);
      toast.success('Order updated!');

      if (newStatus === 'preparing') {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          window.dispatchEvent(new CustomEvent('kitchen:order-accepted', {
            detail: { items: order.items }
          }));
          toast.info("Inventory updated automatically");
        }
      }
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    }
  };

  // Mock item completion implementation
  const toggleItemStatus = async (orderId: string, itemIndex: number, currentStatus: string) => {
    // In a real app we would call ordersApi.updateItemStatus. 
    // For this demo/merge, we'll verify it visually and update order status if all done.
    const newStatus = currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED';

    // Optimistic update locally
    setOrders(prev => prev.map(o => {
      if (o.id !== orderId) return o;
      const newItems = [...o.items];
      newItems[itemIndex] = { ...newItems[itemIndex], status: newStatus };

      // Check if all items are completed
      const allCompleted = newItems.every(i => i.status === 'COMPLETED');
      if (allCompleted && o.status !== 'ready') {
        updateOrderStatus(orderId, 'ready');
      }

      return { ...o, items: newItems };
    }));

    // Attempt API call if exists, else silent catch
    try {
      await ordersApi.updateItemStatus(orderId.replace('order:', ''), itemIndex, newStatus);
    } catch (e) {
      // Ignore if API endpoint doesn't support it yet
    }
  };


  const getElapsedTime = (createdAt: string) => {
    const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
    return minutes;
  };

  const getPriorityColor = (minutes: number) => {
    if (minutes > 20) return 'text-red-600 font-bold';
    if (minutes > 10) return 'text-orange-600';
    return 'text-green-600';
  };

  const handleStockManagement = () => {
    window.dispatchEvent(new CustomEvent('navigate:stock-management'));
  };

  // NEW: Full Page Login View (Replacing Dialog)
  if (!isAuthenticated) {
    return (
      <div className="h-full w-full bg-background flex items-center justify-center p-8 animate-in fade-in duration-500">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left Column: Info & Stats */}
          <div className="space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-primary">
                <ChefHat className="h-8 w-8" />
                <h1 className="text-4xl font-bold tracking-tight">KitchenOS</h1>
              </div>
              <p className="text-xl text-muted-foreground">Premium Kitchen Display System</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-muted/50 border-none">
                <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                  <Activity className="h-8 w-8 text-green-500" />
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Efficiency</div>
                </CardContent>
              </Card>
              <Card className="bg-muted/50 border-none">
                <CardContent className="p-6 flex flex-col items-center text-center gap-2">
                  <BarChart3 className="h-8 w-8 text-blue-500" />
                  <div className="text-2xl font-bold">12m</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Avg Prep Time</div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active Stations</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg"><Utensils className="h-4 w-4 text-orange-500" /> <span className="text-sm font-medium">Fry Station</span></div>
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg"><Utensils className="h-4 w-4 text-yellow-500" /> <span className="text-sm font-medium">Curry Station</span></div>
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg"><Utensils className="h-4 w-4 text-green-500" /> <span className="text-sm font-medium">Rice Station</span></div>
                <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg"><Utensils className="h-4 w-4 text-purple-500" /> <span className="text-sm font-medium">Dessert Station</span></div>
              </div>
            </div>
          </div>

          {/* Right Column: Login Form */}
          <Card className="border-border/50 shadow-xl bg-card">
            <CardHeader className="space-y-1 text-center pb-8 border-b">
              <CardTitle className="text-2xl">Kitchen Login</CardTitle>
              <CardDescription>Identify yourself to access the terminal</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">

              <div className="space-y-4">
                <Label>Select Chef Profile</Label>
                <Select onValueChange={(val) => {
                  const c = MOCK_CHEFS.find(ch => ch.id === val);
                  setActiveChef(c || null);
                  setLoginPin('');
                }}>
                  <SelectTrigger className="h-12 text-lg">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-muted-foreground" />
                      <SelectValue placeholder="Select Identity" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_CHEFS.map(chef => (
                      <SelectItem key={chef.id} value={chef.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="w-8 justify-center">{chef.initials}</Badge>
                          <span className="font-medium">{chef.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">({chef.role})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center gap-4 mb-4">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`h-4 w-4 rounded-full border transition-all ${loginPin.length > i ? 'bg-primary border-primary scale-110' : 'bg-transparent border-input'}`} />
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-3 max-w-[280px] mx-auto">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                    <Button
                      key={num}
                      variant="outline"
                      className="h-16 text-2xl font-light hover:border-primary/50 hover:bg-primary/5"
                      onClick={() => handleKeypadPress(num.toString())}
                    >
                      {num}
                    </Button>
                  ))}
                  <Button variant="ghost" className="h-16 text-xs uppercase tracking-wider text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleClear}>Reset</Button>
                  <Button variant="outline" className="h-16 text-2xl font-light hover:border-primary/50 hover:bg-primary/5" onClick={() => handleKeypadPress('0')}>0</Button>
                  <Button variant="ghost" className="h-16" onClick={handleBackspace}>
                    <Delete className="h-6 w-6 text-muted-foreground" />
                  </Button>
                </div>

                <Button
                  className="w-full h-12 text-lg uppercase tracking-widest font-bold mt-4"
                  disabled={!activeChef || loginPin.length < 4}
                  onClick={() => handleLogin()}
                >
                  Access Terminal
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <ChefHat className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Kitchen Display System</h1>
            <p className="text-muted-foreground">Logged in as: <span className="font-semibold text-primary">{activeChef?.name}</span> ({activeChef?.station})</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
          <Button
            variant="outline"
            className="text-sm px-3 py-1.5"
            onClick={handleStockManagement}
          >
            <Package className="h-4 w-4 mr-2" />
            Stock
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList>
          <TabsTrigger value="board">Production Board</TabsTrigger>
          <TabsTrigger value="batch">Batch View</TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="flex-1 overflow-auto mt-4">
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground ">
              <ChefHat className="h-16 w-16 mb-4 opacity-20" />
              <p>No active orders for <span className="font-semibold">{activeChef?.station}</span> station.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 pb-20">
              {filteredOrders.map((order) => {
                const elapsedMinutes = getElapsedTime(order.createdAt);
                const isPriority = elapsedMinutes > 10;

                return (
                  <Card key={order.id} className={`${isPriority ? 'border-orange-500 border-2' : ''} flex flex-col`}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="secondary" className="text-xs">KOT</Badge>
                            <CardTitle className="text-lg">
                              {order.tableNumber ? `Table ${order.tableNumber}` : order.type.toUpperCase()}
                            </CardTitle>
                          </div>
                          <CardDescription className="text-xs">
                            #{order.id?.split('-')[1]?.slice(0, 6).toUpperCase() || 'UNKNOWN'}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={order.status === 'placed' ? 'default' : 'secondary'} className="uppercase text-[10px]">
                            {order.status}
                          </Badge>
                          {isPriority && <AlertCircle className="h-4 w-4 text-orange-600" />}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-4">
                      <div className="space-y-2 flex-1">
                        {order.items.map((item, idx) => {
                          // Opacity logic: Dim if not my station, or if completed
                          const isMyStation = activeChef?.station === 'ALL' || item.station === activeChef?.station;
                          const isCompleted = item.status === 'COMPLETED';

                          if (!isMyStation) return null; // Or render dimmed

                          return (
                            <div
                              key={idx}
                              onClick={() => toggleItemStatus(order.id, idx, item.status || 'PENDING')}
                              className={`p-2 rounded-md border text-sm cursor-pointer transition-colors 
                                        ${isCompleted ? 'bg-green-50 border-green-200 text-green-700 decoration-green-700' : 'bg-muted/50 border-transparent hover:bg-muted'}
                                    `}
                            >
                              <div className="flex justify-between items-start">
                                <span className="font-bold mr-2">{item.quantity}x</span>
                                <span className={`font-medium flex-1 ${isCompleted ? 'line-through' : ''}`}>{item.name}</span>
                                {item.station && activeChef?.station === 'ALL' && (
                                  <Badge variant="outline" className="text-[10px] h-4 ml-1">{item.station}</Badge>
                                )}
                              </div>
                              {item.customizations && item.customizations.length > 0 && (
                                <div className="text-xs text-muted-foreground ml-6 mt-1">
                                  {item.customizations.join(', ')}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="pt-2 border-t mt-auto">
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span className={getPriorityColor(elapsedMinutes)}>{elapsedMinutes}m</span>
                          </div>
                          <span className="text-[10px] text-muted-foreground">{new Date(order.createdAt).toLocaleTimeString()}</span>
                        </div>

                        {order.status === 'placed' ? (
                          <Button size="sm" className="w-full" onClick={() => updateOrderStatus(order.id, 'preparing')}>Start Order</Button>
                        ) : order.status === 'preparing' ? (
                          <Button size="sm" variant="secondary" className="w-full" onClick={() => updateOrderStatus(order.id, 'ready')}>Force Ready</Button>
                        ) : (
                          <Button size="sm" variant="outline" className="w-full" disabled>Completed</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="batch" className="flex-1 overflow-auto mt-4 px-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" /> Batch Production View
              </CardTitle>
              <CardDescription>Aggregated items for {activeChef?.station} station</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Total Quantity</TableHead>
                    <TableHead>Pending Orders</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Batch Logic: Aggregate items from all active orders */}
                  {Object.entries(
                    filteredOrders.flatMap(o => o.items)
                      .filter(i => (activeChef?.station === 'ALL' || i.station === activeChef?.station) && i.status !== 'COMPLETED')
                      .reduce((acc, item) => {
                        acc[item.name] = (acc[item.name] || 0) + item.quantity;
                        return acc;
                      }, {} as Record<string, number>)
                  ).map(([name, qty]) => (
                    <TableRow key={name}>
                      <TableCell className="font-medium">{name}</TableCell>
                      <TableCell className="text-lg font-bold">{qty}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {filteredOrders.filter(o => o.items.some(i => i.name === name)).length} tickets
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Top batch board empty</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
