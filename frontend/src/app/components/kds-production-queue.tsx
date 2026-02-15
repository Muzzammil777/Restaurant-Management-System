import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/components/ui/utils";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  Users,
  Flame,
  Play,
  Check,
  X,
  ArrowRight,
  Timer,
} from "lucide-react";
import { toast } from "sonner";

type OrderStatus = "NEW" | "COOKING" | "READY" | "DELIVERED";
type StationType = "FRY" | "CURRY" | "RICE" | "PREP" | "GRILL" | "DESSERT" | "HEAD_CHEF";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  station: StationType;
  status: OrderStatus;
  specialInstructions?: string;
  preparationTime: number; // in seconds
  startedAt?: Date;
}

interface KitchenOrder {
  id: string;
  orderNumber: string;
  tableNumber: string;
  guestCount: number;
  items: OrderItem[];
  status: OrderStatus;
  priority: "normal" | "high" | "urgent";
  createdAt: Date;
  totalPrepTime: number;
}

interface KDSProductionQueueProps {
  station: StationType;
  onLogout: () => void;
}

// Mock Data Generator
const generateMockOrders = (station: StationType): KitchenOrder[] => {
  const now = new Date();
  
  const stationItems: Record<StationType, string[]> = {
    FRY: ["Vegetable Spring Rolls", "Paneer Tikka", "Chicken 65", "French Fries", "Onion Rings"],
    CURRY: ["Butter Chicken", "Paneer Butter Masala", "Dal Makhani", "Kadai Chicken"],
    RICE: ["Veg Biryani", "Chicken Biryani", "Jeera Rice", "Veg Fried Rice"],
    PREP: ["Green Salad", "Caesar Salad", "Raita", "Mint Chutney"],
    GRILL: ["Tandoori Chicken", "Paneer Tikka", "Seekh Kebab", "Grilled Fish"],
    DESSERT: ["Gulab Jamun", "Ice Cream", "Brownie", "Fruit Salad"],
    HEAD_CHEF: []
  };

  const tables = ["T-01", "T-02", "T-03", "T-04", "T-05", "T-06", "T-07", "T-08"];
  
  return [
    {
      id: "ORD-001",
      orderNumber: "#4521",
      tableNumber: tables[0],
      guestCount: 4,
      status: "NEW",
      priority: "high",
      createdAt: new Date(now.getTime() - 120000), // 2 mins ago
      totalPrepTime: 900,
      items: [
        {
          id: "ITM-001",
          name: stationItems[station][0],
          quantity: 2,
          station: station,
          status: "NEW",
          preparationTime: 450,
          specialInstructions: "Extra spicy"
        },
        {
          id: "ITM-002",
          name: stationItems[station][1],
          quantity: 1,
          station: station,
          status: "NEW",
          preparationTime: 450
        }
      ]
    },
    {
      id: "ORD-002",
      orderNumber: "#4522",
      tableNumber: tables[1],
      guestCount: 2,
      status: "COOKING",
      priority: "normal",
      createdAt: new Date(now.getTime() - 300000), // 5 mins ago
      totalPrepTime: 600,
      items: [
        {
          id: "ITM-003",
          name: stationItems[station][2] || stationItems[station][0],
          quantity: 3,
          station: station,
          status: "COOKING",
          preparationTime: 600,
          startedAt: new Date(now.getTime() - 180000)
        }
      ]
    },
    {
      id: "ORD-003",
      orderNumber: "#4523",
      tableNumber: tables[2],
      guestCount: 6,
      status: "NEW",
      priority: "urgent",
      createdAt: new Date(now.getTime() - 480000), // 8 mins ago
      totalPrepTime: 720,
      items: [
        {
          id: "ITM-004",
          name: stationItems[station][1],
          quantity: 2,
          station: station,
          status: "NEW",
          preparationTime: 360
        },
        {
          id: "ITM-005",
          name: stationItems[station][3] || stationItems[station][0],
          quantity: 4,
          station: station,
          status: "NEW",
          preparationTime: 360
        }
      ]
    },
    {
      id: "ORD-004",
      orderNumber: "#4524",
      tableNumber: tables[3],
      guestCount: 2,
      status: "COOKING",
      priority: "normal",
      createdAt: new Date(now.getTime() - 240000), // 4 mins ago
      totalPrepTime: 540,
      items: [
        {
          id: "ITM-006",
          name: stationItems[station][0],
          quantity: 2,
          station: station,
          status: "COOKING",
          preparationTime: 540,
          startedAt: new Date(now.getTime() - 120000)
        }
      ]
    }
  ];
};

export function KDSProductionQueue({ station, onLogout }: KDSProductionQueueProps) {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setOrders(generateMockOrders(station));
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [station]);

  const getElapsedTime = (createdAt: Date): string => {
    const elapsed = Math.floor((currentTime.getTime() - createdAt.getTime()) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPreparationTime = (item: OrderItem): string => {
    if (!item.startedAt) return "Not started";
    const elapsed = Math.floor((currentTime.getTime() - item.startedAt.getTime()) / 1000);
    const remaining = Math.max(0, item.preparationTime - elapsed);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return remaining > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : "Ready!";
  };

  const getTimeColor = (createdAt: Date): string => {
    const elapsed = Math.floor((currentTime.getTime() - createdAt.getTime()) / 1000);
    if (elapsed < 300) return "#4CAF50"; // Green < 5 mins
    if (elapsed < 600) return "#FFA500"; // Orange < 10 mins
    return "#E63946"; // Red >= 10 mins
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "urgent": return "#E63946";
      case "high": return "#FFA500";
      default: return "#4CAF50";
    }
  };

  const handleStartCooking = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          status: "COOKING" as OrderStatus,
          items: order.items.map(item => ({
            ...item,
            status: "COOKING" as OrderStatus,
            startedAt: new Date()
          }))
        };
      }
      return order;
    }));
    toast.success("Order Started", {
      description: `Now cooking order ${orders.find(o => o.id === orderId)?.orderNumber}`
    });
  };

  const handleMarkReady = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setOrders(prev => prev.map(o => 
      o.id === orderId 
        ? { ...o, status: "READY" as OrderStatus, items: o.items.map(i => ({ ...i, status: "READY" as OrderStatus })) }
        : o
    ));
    toast.success("Items Ready!", {
      description: `Order ${order?.orderNumber} completed at ${station} station`
    });
  };

  const handleRejectOrder = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setOrders(prev => prev.filter(o => o.id !== orderId));
    toast.error("Order Rejected", {
      description: `Order ${order?.orderNumber} has been rejected`
    });
  };

  const newOrders = orders.filter(o => o.status === "NEW");
  const cookingOrders = orders.filter(o => o.status === "COOKING");
  const readyOrders = orders.filter(o => o.status === "READY");

  const stationColors: Record<StationType, string> = {
    FRY: "#FF6B35",
    CURRY: "#D4A574",
    RICE: "#8B7355",
    PREP: "#4CAF50",
    GRILL: "#E63946",
    DESSERT: "#F4A261",
    HEAD_CHEF: "#8B5A2B"
  };

  return (
    <div className="min-h-screen bg-kitchen-display-module">
      <style>{`
        @keyframes pulse-border {
          0%, 100% { border-color: rgba(230, 57, 70, 0.5); }
          50% { border-color: rgba(230, 57, 70, 1); }
        }
        .urgent-pulse {
          animation: pulse-border 1.5s ease-in-out infinite;
        }
        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0.3; }
        }
        .blink {
          animation: blink 2s infinite;
        }
      `}</style>

      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div 
                className="p-3 rounded-xl flex items-center justify-center" 
                style={{ backgroundColor: stationColors[station] }}
              >
                <ChefHat className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {station} STATION
                </h1>
                <p className="text-sm text-[#6B6B6B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Production Queue • Live Orders
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Stats */}
              <div className="flex items-center gap-6 px-6 py-3 bg-gray-100 rounded-lg">
                <div>
                  <p className="text-xs text-[#6B6B6B] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>NEW</p>
                  <p className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{newOrders.length}</p>
                </div>
                <div className="w-px h-10 bg-gray-300" />
                <div>
                  <p className="text-xs text-[#6B6B6B] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>COOKING</p>
                  <p className="text-2xl font-bold text-orange-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{cookingOrders.length}</p>
                </div>
                <div className="w-px h-10 bg-gray-300" />
                <div>
                  <p className="text-xs text-[#6B6B6B] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>READY</p>
                  <p className="text-2xl font-bold text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{readyOrders.length}</p>
                </div>
              </div>

              {/* Logout */}
              <Button 
                onClick={onLogout}
                variant="outline"
                className="h-11 px-6 border-2 border-gray-300 hover:border-red-500 hover:bg-red-50 hover:text-red-600"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Columns */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          
          {/* NEW ORDERS */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#2D2D2D]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                New Orders
              </h2>
              <Badge className="bg-blue-600 text-white">{newOrders.length}</Badge>
            </div>
            <div className="space-y-4">
              {newOrders.map((order) => (
                <Card 
                  key={order.id} 
                  className={cn(
                    "border-l-4 shadow-md hover:shadow-lg transition-all duration-200",
                    order.priority === "urgent" && "urgent-pulse border-l-red-600"
                  )}
                  style={{ 
                    borderLeftColor: order.priority !== "urgent" ? getPriorityColor(order.priority) : undefined
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge 
                          className="text-white font-bold"
                          style={{ backgroundColor: stationColors[station] }}
                        >
                          {order.orderNumber}
                        </Badge>
                        {order.priority === "urgent" && (
                          <Badge className="bg-red-600 text-white blink">
                            URGENT
                          </Badge>
                        )}
                        {order.priority === "high" && (
                          <Badge className="bg-orange-600 text-white">
                            HIGH
                          </Badge>
                        )}
                      </div>
                      <div 
                        className="flex items-center gap-1 font-bold text-sm"
                        style={{ color: getTimeColor(order.createdAt) }}
                      >
                        <Clock className="h-4 w-4" />
                        {getElapsedTime(order.createdAt)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-[#6B6B6B]">
                      <span className="flex items-center gap-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <Users className="h-4 w-4" />
                        {order.tableNumber}
                      </span>
                      <span style={{ fontFamily: 'Inter, sans-serif' }}>
                        {order.guestCount} guests
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-semibold text-[#2D2D2D]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {item.quantity}x {item.name}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {Math.floor(item.preparationTime / 60)} min
                          </Badge>
                        </div>
                        {item.specialInstructions && (
                          <p className="text-xs text-amber-700 flex items-center gap-1 mt-1">
                            <AlertCircle className="h-3 w-3" />
                            {item.specialInstructions}
                          </p>
                        )}
                      </div>
                    ))}

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => handleStartCooking(order.id)}
                        className="flex-1 bg-[#8B5A2B] hover:bg-[#6D421E] text-white"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Start Cooking
                      </Button>
                      <Button
                        onClick={() => handleRejectOrder(order.id)}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {newOrders.length === 0 && (
                <Card className="p-8 text-center border-dashed">
                  <p className="text-[#6B6B6B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    No new orders
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* COOKING */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#2D2D2D]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                In Progress
              </h2>
              <Badge className="bg-orange-600 text-white">{cookingOrders.length}</Badge>
            </div>
            <div className="space-y-4">
              {cookingOrders.map((order) => (
                <Card key={order.id} className="border-l-4 border-l-orange-600 shadow-md">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge 
                        className="text-white font-bold"
                        style={{ backgroundColor: stationColors[station] }}
                      >
                        {order.orderNumber}
                      </Badge>
                      <div 
                        className="flex items-center gap-1 font-bold text-sm"
                        style={{ color: getTimeColor(order.createdAt) }}
                      >
                        <Flame className="h-4 w-4" />
                        {getElapsedTime(order.createdAt)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-[#6B6B6B]">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {order.tableNumber}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-semibold text-[#2D2D2D]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {item.quantity}x {item.name}
                          </p>
                          <div className="flex items-center gap-1 text-orange-700 font-bold text-sm">
                            <Timer className="h-4 w-4" />
                            {getPreparationTime(item)}
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-600 h-2 rounded-full transition-all duration-1000"
                            style={{ 
                              width: item.startedAt 
                                ? `${Math.min(100, ((currentTime.getTime() - item.startedAt.getTime()) / 1000 / item.preparationTime) * 100)}%`
                                : '0%'
                            }}
                          />
                        </div>
                      </div>
                    ))}

                    <Button
                      onClick={() => handleMarkReady(order.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Mark as Ready
                    </Button>
                  </CardContent>
                </Card>
              ))}
              
              {cookingOrders.length === 0 && (
                <Card className="p-8 text-center border-dashed">
                  <p className="text-[#6B6B6B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    No orders in progress
                  </p>
                </Card>
              )}
            </div>
          </div>

          {/* READY */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#2D2D2D]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Ready to Serve
              </h2>
              <Badge className="bg-green-600 text-white">{readyOrders.length}</Badge>
            </div>
            <div className="space-y-4">
              {readyOrders.map((order) => (
                <Card key={order.id} className="border-l-4 border-l-green-600 shadow-md bg-green-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge 
                        className="text-white font-bold"
                        style={{ backgroundColor: stationColors[station] }}
                      >
                        {order.orderNumber}
                      </Badge>
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-[#6B6B6B]">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {order.tableNumber}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="p-3 bg-white rounded-lg border border-green-200">
                        <p className="font-semibold text-[#2D2D2D] flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          <Check className="h-4 w-4 text-green-600" />
                          {item.quantity}x {item.name}
                        </p>
                      </div>
                    ))}

                    <div className="pt-2 text-center">
                      <p className="text-sm font-semibold text-green-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                        ✓ Waiting for service
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {readyOrders.length === 0 && (
                <Card className="p-8 text-center border-dashed">
                  <p className="text-[#6B6B6B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    No ready orders
                  </p>
                </Card>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
