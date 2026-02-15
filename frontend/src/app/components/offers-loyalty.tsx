import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Badge } from "@/app/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Separator } from "@/app/components/ui/separator";
import { Switch } from "@/app/components/ui/switch";
import { Slider } from "@/app/components/ui/slider";
import {
  Tag,
  Percent,
  IndianRupee,
  Gift,
  Star,
  Trophy,
  Crown,
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Copy,
  Calendar,
  Check,
  X,
  TrendingUp,
  Users,
  ShoppingBag,
  Search,
  Ban,
  CheckCircle,
  Power,
  PowerOff,
  CreditCard,
  Zap,
  TrendingDown,
  RotateCcw,
  AlertCircle,
  Award,
  Target,
  Clock,
  Settings,
  Save,
  Info,
  MessageSquare,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/app/components/ui/utils";

interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "flat";
  value: number;
  min_order: number;
  max_discount?: number;
  valid_from: string;
  valid_to: string;
  usage_count: number;
  usage_limit: number;
  status: "active" | "expired" | "disabled";
}

interface MembershipPlan {
  id: string;
  name: string;
  tier: "silver" | "gold" | "platinum";
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  monthlyPrice: number;
  billingCycle: string;
  status: "active" | "inactive";
  benefits: {
    loyaltyBonus: number; // percentage
    exclusiveCoupons: boolean;
    freeDelivery: boolean;
    prioritySupport: boolean;
  };
}

interface LoyaltyConfig {
  pointsPerHundred: number;
  maxPointsPerOrder: number;
  loyaltyEnabled: boolean;
  pointsPerRupee: number; // Points required per ₹1 discount
  minRedeemablePoints: number;
  expiryMonths: number;
  autoExpiryEnabled: boolean;
}

interface Feedback {
  id: string;
  customerName: string;
  customerId: string;
  orderId: string;
  rating: number; // 1-5 stars
  comment: string;
  pointsAwarded: number;
  submittedAt: string;
}

export function OffersLoyalty() {
  const [activeTab, setActiveTab] = useState("coupons");
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] =
    useState(false);
  const [editingCoupon, setEditingCoupon] =
    useState<Coupon | null>(null);
  const [editingPlan, setEditingPlan] =
    useState<MembershipPlan | null>(null);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);

  // Form states for Create/Edit Coupon
  const [formData, setFormData] = useState({
    code: "",
    type: "percentage" as "percentage" | "flat",
    value: "",
    min_order: "",
    max_discount: "",
    valid_from: "",
    valid_to: "",
    usage_limit: "",
  });

  // Membership Plan Form Data
  const [planFormData, setPlanFormData] = useState({
    name: "",
    tier: "silver" as "silver" | "gold" | "platinum",
    monthlyPrice: "",
    loyaltyBonus: "",
    exclusiveCoupons: false,
    freeDelivery: false,
    prioritySupport: false,
  });

  const [coupons, setCoupons] = useState<Coupon[]>([
    {
      id: "1",
      code: "SAVE20",
      type: "percentage",
      value: 20,
      min_order: 500,
      valid_from: "2026-01-01",
      valid_to: "2026-03-31",
      usage_count: 45,
      usage_limit: 100,
      status: "active",
    },
    {
      id: "2",
      code: "FLAT100",
      type: "flat",
      value: 100,
      min_order: 1000,
      valid_from: "2026-01-15",
      valid_to: "2026-02-28",
      usage_count: 23,
      usage_limit: 50,
      status: "active",
    },
    {
      id: "3",
      code: "WELCOME50",
      type: "flat",
      value: 50,
      min_order: 300,
      valid_from: "2025-12-01",
      valid_to: "2025-12-31",
      usage_count: 89,
      usage_limit: 100,
      status: "expired",
    },
  ]);

  // Membership Plans State
  const [membershipPlans, setMembershipPlans] = useState<
    MembershipPlan[]
  >([
    {
      id: "1",
      name: "Silver Plan",
      tier: "silver",
      icon: <Star className="h-6 w-6" />,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-300",
      monthlyPrice: 199,
      billingCycle: "/monthly",
      status: "active",
      benefits: {
        loyaltyBonus: 10,
        exclusiveCoupons: false,
        freeDelivery: false,
        prioritySupport: false,
      },
    },
    {
      id: "2",
      name: "Gold Plan",
      tier: "gold",
      icon: <Crown className="h-6 w-6" />,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-300",
      monthlyPrice: 499,
      billingCycle: "/monthly",
      status: "active",
      benefits: {
        loyaltyBonus: 25,
        exclusiveCoupons: true,
        freeDelivery: false,
        prioritySupport: false,
      },
    },
    {
      id: "3",
      name: "Platinum Plan",
      tier: "platinum",
      icon: <Trophy className="h-6 w-6" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-300",
      monthlyPrice: 999,
      billingCycle: "/monthly",
      status: "active",
      benefits: {
        loyaltyBonus: 50,
        exclusiveCoupons: true,
        freeDelivery: true,
        prioritySupport: true,
      },
    },
  ]);

  // Loyalty Configuration State
  const [loyaltyConfig, setLoyaltyConfig] =
    useState<LoyaltyConfig>({
      pointsPerHundred: 10,
      maxPointsPerOrder: 500,
      loyaltyEnabled: true,
      pointsPerRupee: 10,
      minRedeemablePoints: 100,
      expiryMonths: 12,
      autoExpiryEnabled: true,
    });

  // Feedback State
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: "1",
      customerName: "Rajesh Kumar",
      customerId: "CUST-001",
      orderId: "ORD-2026-1234",
      rating: 5,
      comment:
        "Excellent food quality and fast delivery! The biryani was amazing.",
      pointsAwarded: 0,
      submittedAt: "2026-02-08T14:30:00",
    },
    {
      id: "2",
      customerName: "Priya Singh",
      customerId: "CUST-002",
      orderId: "ORD-2026-1235",
      rating: 4,
      comment:
        "Good taste but delivery was a bit late. Overall satisfied with the meal.",
      pointsAwarded: 0,
      submittedAt: "2026-02-07T19:15:00",
    },
    {
      id: "3",
      customerName: "Amit Patel",
      customerId: "CUST-003",
      orderId: "ORD-2026-1236",
      rating: 5,
      comment:
        "Amazing pizza! Hot and fresh delivery. Will order again.",
      pointsAwarded: 0,
      submittedAt: "2026-02-06T20:45:00",
    },
  ]);

  // Feedback Form State
  const [feedbackFormData, setFeedbackFormData] = useState({
    customerName: "",
    customerId: "",
    orderId: "",
    rating: 5,
    comment: "",
  });

  // Check if coupon is expired based on date
  const isCouponExpired = (validTo: string): boolean => {
    return new Date(validTo) < new Date();
  };

  // Auto-update expired coupons
  const updateExpiredStatus = () => {
    setCoupons((prevCoupons) =>
      prevCoupons.map((coupon) => {
        if (
          isCouponExpired(coupon.valid_to) &&
          coupon.status === "active"
        ) {
          return { ...coupon, status: "expired" as const };
        }
        return coupon;
      }),
    );
  };

  // Run on mount and periodically
  useEffect(() => {
    updateExpiredStatus();
    const interval = setInterval(updateExpiredStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const resetForm = () => {
    setFormData({
      code: "",
      type: "percentage",
      value: "",
      min_order: "",
      max_discount: "",
      valid_from: "",
      valid_to: "",
      usage_limit: "",
    });
    setEditingCoupon(null);
  };

  const resetPlanForm = () => {
    setPlanFormData({
      name: "",
      tier: "silver",
      monthlyPrice: "",
      loyaltyBonus: "",
      exclusiveCoupons: false,
      freeDelivery: false,
      prioritySupport: false,
    });
    setEditingPlan(null);
  };

  const handleCreateCoupon = () => {
    if (
      !formData.code ||
      !formData.value ||
      !formData.min_order ||
      !formData.valid_from ||
      !formData.valid_to
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const newCoupon: Coupon = {
      id: Date.now().toString(),
      code: formData.code.toUpperCase(),
      type: formData.type,
      value: Number(formData.value),
      min_order: Number(formData.min_order),
      max_discount: formData.max_discount
        ? Number(formData.max_discount)
        : undefined,
      valid_from: formData.valid_from,
      valid_to: formData.valid_to,
      usage_count: 0,
      usage_limit: Number(formData.usage_limit) || 999,
      status: isCouponExpired(formData.valid_to)
        ? "expired"
        : "active",
    };

    setCoupons([...coupons, newCoupon]);
    toast.success(
      `Coupon ${newCoupon.code} created successfully!`,
    );
    setCreateDialogOpen(false);
    resetForm();
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      min_order: coupon.min_order.toString(),
      max_discount: coupon.max_discount?.toString() || "",
      valid_from: coupon.valid_from,
      valid_to: coupon.valid_to,
      usage_limit: coupon.usage_limit.toString(),
    });
    setCreateDialogOpen(true);
  };

  const handleUpdateCoupon = () => {
    if (!editingCoupon) return;

    setCoupons(
      coupons.map((coupon) => {
        if (coupon.id === editingCoupon.id) {
          return {
            ...coupon,
            code: formData.code.toUpperCase(),
            type: formData.type,
            value: Number(formData.value),
            min_order: Number(formData.min_order),
            max_discount: formData.max_discount
              ? Number(formData.max_discount)
              : undefined,
            valid_from: formData.valid_from,
            valid_to: formData.valid_to,
            usage_limit: Number(formData.usage_limit),
            status: isCouponExpired(formData.valid_to)
              ? "expired"
              : coupon.status,
          };
        }
        return coupon;
      }),
    );

    toast.success(
      `Coupon ${formData.code} updated successfully!`,
    );
    setCreateDialogOpen(false);
    resetForm();
  };

  const toggleCouponStatus = (couponId: string) => {
    setCoupons(
      coupons.map((coupon) => {
        if (coupon.id === couponId) {
          if (
            coupon.status === "expired" ||
            coupon.status === "disabled"
          ) {
            return { ...coupon, status: "active" };
          } else {
            return { ...coupon, status: "disabled" };
          }
        }
        return coupon;
      }),
    );
    toast.success("Coupon status updated");
  };

  const handleDeleteCoupon = (couponId: string) => {
    const coupon = coupons.find((c) => c.id === couponId);
    setCoupons(coupons.filter((c) => c.id !== couponId));
    toast.success(
      `Coupon ${coupon?.code} deleted successfully!`,
    );
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied!`);
  };

  // Membership Plan Functions
  const handleEditPlan = (plan: MembershipPlan) => {
    setEditingPlan(plan);
    setPlanFormData({
      name: plan.name,
      tier: plan.tier,
      monthlyPrice: plan.monthlyPrice.toString(),
      loyaltyBonus: plan.benefits.loyaltyBonus.toString(),
      exclusiveCoupons: plan.benefits.exclusiveCoupons,
      freeDelivery: plan.benefits.freeDelivery,
      prioritySupport: plan.benefits.prioritySupport,
    });
    setPlanDialogOpen(true);
  };

  const handleUpdatePlan = () => {
    if (!editingPlan) return;

    setMembershipPlans(
      membershipPlans.map((plan) => {
        if (plan.id === editingPlan.id) {
          return {
            ...plan,
            name: planFormData.name,
            monthlyPrice: Number(planFormData.monthlyPrice),
            benefits: {
              loyaltyBonus: Number(planFormData.loyaltyBonus),
              exclusiveCoupons: planFormData.exclusiveCoupons,
              freeDelivery: planFormData.freeDelivery,
              prioritySupport: planFormData.prioritySupport,
            },
          };
        }
        return plan;
      }),
    );

    toast.success(`${planFormData.name} updated successfully!`);
    setPlanDialogOpen(false);
    resetPlanForm();
  };

  const togglePlanStatus = (planId: string) => {
    setMembershipPlans(
      membershipPlans.map((plan) => {
        if (plan.id === planId) {
          return {
            ...plan,
            status:
              plan.status === "active" ? "inactive" : "active",
          };
        }
        return plan;
      }),
    );
    toast.success("Plan status updated");
  };

  // Loyalty Configuration Functions
  const handleSaveLoyaltyConfig = () => {
    toast.success(
      "Loyalty points configuration saved successfully!",
    );
  };

  // Feedback Functions
  const resetFeedbackForm = () => {
    setFeedbackFormData({
      customerName: "",
      customerId: "",
      orderId: "",
      rating: 5,
      comment: "",
    });
  };

  const handleCreateFeedback = () => {
    if (
      !feedbackFormData.customerName ||
      !feedbackFormData.customerId ||
      !feedbackFormData.orderId ||
      !feedbackFormData.comment
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const newFeedback: Feedback = {
      id: Date.now().toString(),
      customerName: feedbackFormData.customerName,
      customerId: feedbackFormData.customerId,
      orderId: feedbackFormData.orderId,
      rating: feedbackFormData.rating,
      comment: feedbackFormData.comment,
      pointsAwarded: 0,
      submittedAt: new Date().toISOString(),
    };

    setFeedbacks([newFeedback, ...feedbacks]);
    toast.success(
      `Feedback submitted successfully! Thank you ${feedbackFormData.customerName}!`,
    );
    resetFeedbackForm();
  };

  // Calculate feedback statistics
  const feedbackStats = {
    totalFeedback: feedbacks.length,
    averageRating:
      feedbacks.length > 0
        ? (
            feedbacks.reduce((sum, f) => sum + f.rating, 0) /
            feedbacks.length
          ).toFixed(1)
        : "0.0",
  };

  // Filter coupons by search query
  const filteredCoupons = coupons.filter((coupon) => {
    const query = searchQuery.toLowerCase();
    return (
      coupon.code.toLowerCase().includes(query) ||
      coupon.type.toLowerCase().includes(query) ||
      coupon.status.toLowerCase().includes(query)
    );
  });

  return (
    <div className="bg-offers-module min-h-screen p-6 space-y-6">
      {/* Header */}
      <div className="module-container flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            Offers & Loyalty
          </h1>
          <p className="text-gray-200 mt-1">
            Manage coupons, memberships, and loyalty programs
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="w-full overflow-x-auto pb-4">
        <nav className="flex gap-3 min-w-max p-1">
          {[
            {
              id: "coupons",
              label: "Coupons",
              icon: Tag,
              description: "Manage promo codes",
            },
            {
              id: "membership",
              label: "Membership Plans",
              icon: Crown,
              description: "Subscription tiers",
            },
            {
              id: "loyalty",
              label: "Loyalty Config",
              icon: Star,
              description: "Points & rewards",
            },
            {
              id: "feedback",
              label: "Feedback",
              icon: MessageSquare,
              description: "Customer reviews",
            },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg transition-colors text-left min-w-[200px]",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border hover:bg-muted shadow-sm",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 mt-0.5 flex-shrink-0",
                    isActive ? "" : "text-muted-foreground",
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isActive ? "" : "",
                    )}
                  >
                    {item.label}
                  </p>
                  <p
                    className={cn(
                      "text-xs mt-0.5",
                      isActive
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="mt-6"
      >
        {/* ==================== TAB 1: COUPONS (EXISTING) ==================== */}
        <TabsContent value="coupons" className="space-y-4">
          {/* Search & Create Button */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search coupons by code / type / status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Dialog
              open={createDialogOpen}
              onOpenChange={(open) => {
                setCreateDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Coupon
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingCoupon
                      ? "Modify Coupon"
                      : "Design Coupon"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingCoupon
                      ? "Refine your coupon details"
                      : "Craft a compelling promotional offer"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Coupon Code *</Label>
                    <Input
                      placeholder="e.g., SAVE20"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      className="uppercase font-mono"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Discount Type *</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(
                          value: "percentage" | "flat",
                        ) =>
                          setFormData({
                            ...formData,
                            type: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">
                            Percentage (%)
                          </SelectItem>
                          <SelectItem value="flat">
                            Flat Amount (₹)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Discount Value *</Label>
                      <Input
                        type="number"
                        placeholder={
                          formData.type === "percentage"
                            ? "e.g., 20"
                            : "e.g., 100"
                        }
                        value={formData.value}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            value: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Minimum Order Value (₹) *</Label>
                      <Input
                        type="number"
                        placeholder="e.g., 500"
                        value={formData.min_order}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            min_order: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Max Discount (₹)</Label>
                      <Input
                        type="number"
                        placeholder="Optional"
                        value={formData.max_discount}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            max_discount: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Valid From *</Label>
                      <Input
                        type="date"
                        value={formData.valid_from}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            valid_from: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Valid To *</Label>
                      <Input
                        type="date"
                        value={formData.valid_to}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            valid_to: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Usage Limit</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 100 (default: unlimited)"
                      value={formData.usage_limit}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          usage_limit: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCreateDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={
                      editingCoupon
                        ? handleUpdateCoupon
                        : handleCreateCoupon
                    }
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    {editingCoupon
                      ? "Update Coupon"
                      : "Create Coupon"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Coupons Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">
                      COUPON CODE
                    </TableHead>
                    <TableHead className="font-semibold">
                      DISCOUNT TYPE
                    </TableHead>
                    <TableHead className="font-semibold">
                      DISCOUNT VALUE
                    </TableHead>
                    <TableHead className="font-semibold">
                      MIN ORDER AMOUNT
                    </TableHead>
                    <TableHead className="font-semibold">
                      EXPIRY DATE
                    </TableHead>
                    <TableHead className="font-semibold">
                      STATUS
                    </TableHead>
                    <TableHead className="text-right font-semibold">
                      ACTIONS
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <Tag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No coupons found</p>
                        {searchQuery && (
                          <p className="text-sm mt-1">
                            Try adjusting your search
                          </p>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCoupons.map((coupon) => (
                      <TableRow
                        key={coupon.id}
                        className="hover:bg-muted/30"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span
                              className="font-mono font-bold text-orange-600 cursor-pointer hover:text-orange-700"
                              onClick={() =>
                                copyCouponCode(coupon.code)
                              }
                            >
                              {coupon.code}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() =>
                                copyCouponCode(coupon.code)
                              }
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">
                            {coupon.type}
                          </span>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {coupon.type === "percentage" ? (
                            <span>{coupon.value}%</span>
                          ) : (
                            <span className="flex items-center">
                              <IndianRupee className="h-3 w-3" />
                              {coupon.value}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center">
                            <IndianRupee className="h-3 w-3" />
                            {coupon.min_order}
                          </span>
                        </TableCell>
                        <TableCell>
                          {new Date(
                            coupon.valid_to,
                          ).toLocaleDateString("en-GB")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              coupon.status === "active"
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : coupon.status === "expired"
                                  ? "bg-red-100 text-red-700 hover:bg-red-100"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-100"
                            }
                          >
                            {coupon.status === "active"
                              ? "Active"
                              : coupon.status === "expired"
                                ? "Expired"
                                : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleEditCoupon(coupon)
                              }
                              className="h-8 gap-1"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Edit
                            </Button>

                            {coupon.status === "active" ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  toggleCouponStatus(coupon.id)
                                }
                                className="h-8 gap-1"
                              >
                                <Ban className="h-3.5 w-3.5" />
                                Disable
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() =>
                                  toggleCouponStatus(coupon.id)
                                }
                                className="h-8 gap-1 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Enable
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleDeleteCoupon(coupon.id)
                              }
                              className="h-8 gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Coupon Statistics */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Coupons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {coupons.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  All coupon codes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Coupons
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {
                    coupons.filter((c) => c.status === "active")
                      .length
                  }
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Currently active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {coupons.reduce(
                    (sum, c) => sum + c.usage_count,
                    0,
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Times redeemed
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================== TAB 2: MEMBERSHIP PLANS ==================== */}
        <TabsContent value="membership" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Membership Plans
              </h2>
              <p className="text-muted-foreground mt-1">
                Manage subscription plans for customers
              </p>
            </div>
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {membershipPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`border-2 ${plan.borderColor} ${plan.bgColor}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-3 bg-white rounded-full ${plan.color}`}
                      >
                        {plan.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          {plan.name}
                        </CardTitle>
                        <Badge
                          className={
                            plan.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }
                        >
                          {plan.status === "active"
                            ? "Active"
                            : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pricing */}
                  <div className="flex items-baseline gap-1">
                    <IndianRupee className="h-5 w-5 mt-1" />
                    <span className="text-3xl font-bold">
                      {plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">
                      {plan.billingCycle}
                    </span>
                  </div>

                  <Separator />

                  {/* Benefits */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">
                      Benefits
                    </p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">
                            Extra Loyalty Points
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="font-semibold"
                        >
                          +{plan.benefits.loyaltyBonus}%
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">
                            Exclusive Coupons
                          </span>
                        </div>
                        {plan.benefits.exclusiveCoupons ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-purple-500" />
                          <span className="text-sm">
                            Free Delivery
                          </span>
                        </div>
                        {plan.benefits.freeDelivery ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-green-500" />
                          <span className="text-sm">
                            Priority Support
                          </span>
                        </div>
                        {plan.benefits.prioritySupport ? (
                          <Check className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit className="h-4 w-4" />
                      Edit Plan
                    </Button>
                    <Button
                      variant={
                        plan.status === "active"
                          ? "destructive"
                          : "default"
                      }
                      className="flex-1 gap-2"
                      onClick={() => togglePlanStatus(plan.id)}
                    >
                      {plan.status === "active" ? (
                        <>
                          <Ban className="h-4 w-4" />
                          Disable
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Enable
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Edit Plan Dialog */}
          <Dialog
            open={planDialogOpen}
            onOpenChange={(open) => {
              setPlanDialogOpen(open);
              if (!open) resetPlanForm();
            }}
          >
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Membership Plan</DialogTitle>
                <DialogDescription>
                  Update plan details and benefits
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Plan Name *</Label>
                  <Input
                    placeholder="e.g., Gold Plan"
                    value={planFormData.name}
                    onChange={(e) =>
                      setPlanFormData({
                        ...planFormData,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Monthly Price (₹) *</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 499"
                      value={planFormData.monthlyPrice}
                      onChange={(e) =>
                        setPlanFormData({
                          ...planFormData,
                          monthlyPrice: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Loyalty Bonus (%) *</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 25"
                      value={planFormData.loyaltyBonus}
                      onChange={(e) =>
                        setPlanFormData({
                          ...planFormData,
                          loyaltyBonus: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Plan Benefits</Label>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">
                        Exclusive Coupons
                      </span>
                    </div>
                    <Switch
                      checked={planFormData.exclusiveCoupons}
                      onCheckedChange={(checked) =>
                        setPlanFormData({
                          ...planFormData,
                          exclusiveCoupons: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">
                        Free Delivery
                      </span>
                    </div>
                    <Switch
                      checked={planFormData.freeDelivery}
                      onCheckedChange={(checked) =>
                        setPlanFormData({
                          ...planFormData,
                          freeDelivery: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Priority Support
                      </span>
                    </div>
                    <Switch
                      checked={planFormData.prioritySupport}
                      onCheckedChange={(checked) =>
                        setPlanFormData({
                          ...planFormData,
                          prioritySupport: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPlanDialogOpen(false);
                    resetPlanForm();
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdatePlan}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* ==================== TAB 3: LOYALTY POINTS CONFIGURATION ==================== */}
        <TabsContent value="loyalty" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">
              Loyalty Points Configuration
            </h2>
            <p className="text-muted-foreground mt-1">
              Reward customers for repeat orders
            </p>
          </div>

          {/* Points Earning Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-500" />
                Points Earning Rules
              </CardTitle>
              <CardDescription>
                Configure how customers earn loyalty points
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Points Per ₹100 Spent</Label>
                  <Input
                    type="number"
                    value={loyaltyConfig.pointsPerHundred}
                    onChange={(e) =>
                      setLoyaltyConfig({
                        ...loyaltyConfig,
                        pointsPerHundred: Number(
                          e.target.value,
                        ),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Customers earn{" "}
                    {loyaltyConfig.pointsPerHundred} points for
                    every ₹100 spent
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Maximum Points Per Order</Label>
                  <Input
                    type="number"
                    value={loyaltyConfig.maxPointsPerOrder}
                    onChange={(e) =>
                      setLoyaltyConfig({
                        ...loyaltyConfig,
                        maxPointsPerOrder: Number(
                          e.target.value,
                        ),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Cap points earned at{" "}
                    {loyaltyConfig.maxPointsPerOrder} per single
                    order
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">
                      Enable Loyalty Program
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Allow customers to earn and redeem points
                    </p>
                  </div>
                </div>
                <Switch
                  checked={loyaltyConfig.loyaltyEnabled}
                  onCheckedChange={(checked) =>
                    setLoyaltyConfig({
                      ...loyaltyConfig,
                      loyaltyEnabled: checked,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Points Redemption Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-blue-500" />
                Points Redemption Rules
              </CardTitle>
              <CardDescription>
                Set rules for how customers can use their points
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Points Required Per ₹1 Discount</Label>
                  <Input
                    type="number"
                    value={loyaltyConfig.pointsPerRupee}
                    onChange={(e) =>
                      setLoyaltyConfig({
                        ...loyaltyConfig,
                        pointsPerRupee: Number(e.target.value),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {loyaltyConfig.pointsPerRupee} points = ₹1
                    discount
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Redeemable Points</Label>
                  <Input
                    type="number"
                    value={loyaltyConfig.minRedeemablePoints}
                    onChange={(e) =>
                      setLoyaltyConfig({
                        ...loyaltyConfig,
                        minRedeemablePoints: Number(
                          e.target.value,
                        ),
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Customers must have at least{" "}
                    {loyaltyConfig.minRedeemablePoints} points
                    to redeem
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Points Expiry Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-purple-500" />
                Points Expiry Settings
              </CardTitle>
              <CardDescription>
                Manage point expiration policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Points Expiry Duration (Months)</Label>
                <Input
                  type="number"
                  value={loyaltyConfig.expiryMonths}
                  onChange={(e) =>
                    setLoyaltyConfig({
                      ...loyaltyConfig,
                      expiryMonths: Number(e.target.value),
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Points will expire after{" "}
                  {loyaltyConfig.expiryMonths} months of
                  inactivity
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">
                      Enable Auto-Expiry
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Automatically expire points after set
                      duration
                    </p>
                  </div>
                </div>
                <Switch
                  checked={loyaltyConfig.autoExpiryEnabled}
                  onCheckedChange={(checked) =>
                    setLoyaltyConfig({
                      ...loyaltyConfig,
                      autoExpiryEnabled: checked,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuration Summary */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                Configuration Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">
                    Example Calculation:
                  </span>{" "}
                  A customer who spends ₹1,000 will earn{" "}
                  <span className="font-bold text-blue-600">
                    {Math.floor(
                      (1000 / 100) *
                        loyaltyConfig.pointsPerHundred,
                    )}{" "}
                    points
                  </span>
                  . To redeem ₹50 discount, they need{" "}
                  <span className="font-bold text-blue-600">
                    {50 * loyaltyConfig.pointsPerRupee} points
                  </span>
                  .
                </p>
                <p className="text-muted-foreground">
                  Points{" "}
                  {loyaltyConfig.autoExpiryEnabled
                    ? "will"
                    : "will not"}{" "}
                  expire after {loyaltyConfig.expiryMonths}{" "}
                  months. Loyalty program is currently{" "}
                  {loyaltyConfig.loyaltyEnabled
                    ? "enabled"
                    : "disabled"}
                  .
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleSaveLoyaltyConfig}
              className="gap-2"
            >
              <Save className="h-5 w-5" />
              Save Configuration
            </Button>
          </div>
        </TabsContent>

        {/* ==================== TAB 4: FEEDBACK MODULE ==================== */}
        <TabsContent value="feedback" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Customer Feedback
              </h2>
              <p className="text-muted-foreground mt-1">
                Collect and manage customer reviews
              </p>
            </div>
          </div>

          {/* Feedback Statistics */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Total Feedback
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {feedbackStats.totalFeedback}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Customer reviews received
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Average Rating
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-yellow-600">
                    {feedbackStats.averageRating}
                  </div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <=
                          parseFloat(
                            feedbackStats.averageRating,
                          )
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Overall customer satisfaction
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Information Panel */}
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                About Customer Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">
                      Instant Rewards
                    </p>
                    <p className="text-muted-foreground">
                      Customers automatically receive 10 loyalty
                      points when feedback is submitted
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">
                      Encourage Participation
                    </p>
                    <p className="text-muted-foreground">
                      No approval delays - points are awarded
                      immediately to motivate more customer
                      feedback
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-start gap-3">
                  <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">
                      Track Satisfaction
                    </p>
                    <p className="text-muted-foreground">
                      Monitor customer ratings and reviews to
                      identify areas of improvement and
                      celebrate successes
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedback Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Feedback</CardTitle>
              <CardDescription>
                Complete list of customer reviews and ratings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">
                      CUSTOMER
                    </TableHead>
                    <TableHead className="font-semibold">
                      ORDER ID
                    </TableHead>
                    <TableHead className="font-semibold">
                      RATING
                    </TableHead>
                    <TableHead className="font-semibold">
                      COMMENT
                    </TableHead>
                    <TableHead className="font-semibold">
                      DATE
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-12 text-muted-foreground"
                      >
                        <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No feedback received yet</p>
                        <p className="text-sm mt-1">
                          Encourage customers to share their
                          experience
                        </p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    feedbacks.map((feedback) => (
                      <TableRow
                        key={feedback.id}
                        className="hover:bg-muted/30"
                      >
                        <TableCell>
                          <div>
                            <p className="font-semibold">
                              {feedback.customerName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {feedback.customerId}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {feedback.orderId}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= feedback.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p
                            className="text-sm truncate"
                            title={feedback.comment}
                          >
                            {feedback.comment}
                          </p>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(
                            feedback.submittedAt,
                          ).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                      </TableRow>
                    ))
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