import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { offersApi } from '@/utils/api';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Separator } from '@/app/components/ui/separator';
import { Switch } from '@/app/components/ui/switch';
import { Slider } from '@/app/components/ui/slider';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/app/components/ui/utils';

interface Coupon {
  id: string;
  _id?: string;
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  min_order: number;
  max_discount?: number;
  valid_from: string;
  valid_to: string;
  usage_count: number;
  usage_limit: number;
  status: 'active' | 'expired' | 'disabled';
}

interface MembershipPlan {
  id: string;
  _id?: string;
  name: string;
  tier: 'silver' | 'gold' | 'platinum';
  icon?: React.ReactNode;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  monthlyPrice: number;
  billingCycle?: string;
  status: 'active' | 'inactive';
  benefits: {
    loyaltyBonus: number;
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

export function OffersLoyalty() {
  const [activeTab, setActiveTab] = useState('coupons');
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [createPlanDialogOpen, setCreatePlanDialogOpen] = useState(false);
  
  // Form states for Create/Edit Coupon
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'flat',
    value: '',
    min_order: '',
    max_discount: '',
    valid_from: '',
    valid_to: '',
    usage_limit: '',
  });

  // Membership Plan Form Data
  const [planFormData, setPlanFormData] = useState({
    name: '',
    tier: 'silver' as 'silver' | 'gold' | 'platinum',
    monthlyPrice: '',
    loyaltyBonus: '',
    exclusiveCoupons: false,
    freeDelivery: false,
    prioritySupport: false,
  });

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Membership Plans State
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);

  // Loyalty Configuration State
  const [loyaltyConfig, setLoyaltyConfig] = useState<LoyaltyConfig>({
    pointsPerHundred: 10,
    maxPointsPerOrder: 500,
    loyaltyEnabled: true,
    pointsPerRupee: 10,
    minRedeemablePoints: 100,
    expiryMonths: 12,
    autoExpiryEnabled: true,
  });

  // Tier styling helpers
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'gold': return <Crown className="h-6 w-6" />;
      case 'platinum': return <Trophy className="h-6 w-6" />;
      default: return <Star className="h-6 w-6" />;
    }
  };

  const getTierColors = (tier: string) => {
    switch (tier) {
      case 'gold': return { color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-300' };
      case 'platinum': return { color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-300' };
      default: return { color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-300' };
    }
  };

  // Fetch coupons from API
  const fetchCoupons = useCallback(async () => {
    try {
      const data = await offersApi.listCoupons();
      setCoupons(data.map((c: any) => ({ ...c, id: c._id || c.id })));
    } catch (err) {
      console.error('Failed to fetch coupons', err);
      toast.error('Failed to load coupons');
    }
  }, []);

  // Fetch memberships from API
  const fetchMemberships = useCallback(async () => {
    try {
      const data = await offersApi.listMemberships();
      setMembershipPlans(data.map((p: any) => ({
        ...p,
        id: p._id || p.id,
        icon: getTierIcon(p.tier),
        ...getTierColors(p.tier),
        billingCycle: p.billingCycle || '/month',
        benefits: p.benefits || { loyaltyBonus: 0, exclusiveCoupons: false, freeDelivery: false, prioritySupport: false },
      })));
    } catch (err) {
      console.error('Failed to fetch memberships', err);
      toast.error('Failed to load membership plans');
    }
  }, []);

  // Fetch loyalty config from API
  const fetchLoyaltyConfig = useCallback(async () => {
    try {
      const data = await offersApi.getLoyaltyConfig();
      if (data) setLoyaltyConfig(data);
    } catch (err) {
      console.error('Failed to fetch loyalty config', err);
    }
  }, []);

  // Load all data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCoupons(), fetchMemberships(), fetchLoyaltyConfig()]);
      setLoading(false);
    };
    loadData();
  }, [fetchCoupons, fetchMemberships, fetchLoyaltyConfig]);

  // Check if coupon is expired based on date
  const isCouponExpired = (validTo: string): boolean => {
    return new Date(validTo) < new Date();
  };

  // Auto-update expired coupons
  const updateExpiredStatus = () => {
    setCoupons(prevCoupons => 
      prevCoupons.map(coupon => {
        if (isCouponExpired(coupon.valid_to) && coupon.status === 'active') {
          return { ...coupon, status: 'expired' as const };
        }
        return coupon;
      })
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
      code: '',
      type: 'percentage',
      value: '',
      min_order: '',
      max_discount: '',
      valid_from: '',
      valid_to: '',
      usage_limit: '',
    });
    setEditingCoupon(null);
  };

  const resetPlanForm = () => {
    setPlanFormData({
      name: '',
      tier: 'silver',
      monthlyPrice: '',
      loyaltyBonus: '',
      exclusiveCoupons: false,
      freeDelivery: false,
      prioritySupport: false,
    });
    setEditingPlan(null);
  };

  const handleCreateCoupon = async () => {
    if (!formData.code || !formData.value || !formData.min_order || !formData.valid_from || !formData.valid_to) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: Number(formData.value),
        min_order: Number(formData.min_order),
        max_discount: formData.max_discount ? Number(formData.max_discount) : undefined,
        valid_from: formData.valid_from,
        valid_to: formData.valid_to,
        usage_limit: Number(formData.usage_limit) || 999,
        status: isCouponExpired(formData.valid_to) ? 'expired' : 'active',
      };
      await offersApi.createCoupon(payload);
      toast.success(`Coupon ${payload.code} created successfully!`);
      setCreateDialogOpen(false);
      resetForm();
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create coupon');
    }
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      min_order: coupon.min_order.toString(),
      max_discount: coupon.max_discount?.toString() || '',
      valid_from: coupon.valid_from,
      valid_to: coupon.valid_to,
      usage_limit: coupon.usage_limit.toString(),
    });
    setCreateDialogOpen(true);
  };

  const handleUpdateCoupon = async () => {
    if (!editingCoupon) return;

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: Number(formData.value),
        min_order: Number(formData.min_order),
        max_discount: formData.max_discount ? Number(formData.max_discount) : undefined,
        valid_from: formData.valid_from,
        valid_to: formData.valid_to,
        usage_limit: Number(formData.usage_limit),
      };
      await offersApi.updateCoupon(editingCoupon.id, payload);
      toast.success(`Coupon ${formData.code} updated successfully!`);
      setCreateDialogOpen(false);
      resetForm();
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update coupon');
    }
  };

  const toggleCouponStatus = async (couponId: string) => {
    const coupon = coupons.find(c => c.id === couponId);
    if (!coupon) return;
    const newStatus = (coupon.status === 'active') ? 'disabled' : 'active';
    try {
      await offersApi.updateCoupon(couponId, { status: newStatus });
      toast.success('Coupon status updated');
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    const coupon = coupons.find(c => c.id === couponId);
    try {
      await offersApi.deleteCoupon(couponId);
      toast.success(`Coupon ${coupon?.code} deleted successfully!`);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete coupon');
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied!`);
  };

  // Membership Plan Functions
  const handleCreatePlan = async () => {
    try {
      const payload = {
        name: planFormData.name,
        tier: planFormData.tier,
        monthlyPrice: Number(planFormData.monthlyPrice),
        status: 'active',
        benefits: {
          loyaltyBonus: Number(planFormData.loyaltyBonus),
          exclusiveCoupons: planFormData.exclusiveCoupons,
          freeDelivery: planFormData.freeDelivery,
          prioritySupport: planFormData.prioritySupport,
        },
      };
      await offersApi.createMembership(payload);
      toast.success(`${planFormData.name} created successfully!`);
      setCreatePlanDialogOpen(false);
      resetPlanForm();
      fetchMemberships();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create plan');
    }
  };

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

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;

    try {
      const payload = {
        name: planFormData.name,
        monthlyPrice: Number(planFormData.monthlyPrice),
        benefits: {
          loyaltyBonus: Number(planFormData.loyaltyBonus),
          exclusiveCoupons: planFormData.exclusiveCoupons,
          freeDelivery: planFormData.freeDelivery,
          prioritySupport: planFormData.prioritySupport,
        },
      };
      await offersApi.updateMembership(editingPlan.id, payload);
      toast.success(`${planFormData.name} updated successfully!`);
      setPlanDialogOpen(false);
      resetPlanForm();
      fetchMemberships();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update plan');
    }
  };

  const togglePlanStatus = async (planId: string) => {
    const plan = membershipPlans.find(p => p.id === planId);
    if (!plan) return;
    const newStatus = plan.status === 'active' ? 'inactive' : 'active';
    try {
      await offersApi.updateMembership(planId, { status: newStatus });
      toast.success('Plan status updated');
      fetchMemberships();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  // Loyalty Configuration Functions
  const handleSaveLoyaltyConfig = async () => {
    try {
      await offersApi.updateLoyaltyConfig(loyaltyConfig);
      toast.success('Loyalty points configuration saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save configuration');
    }
  };

  // Filter coupons by search query
  const filteredCoupons = coupons.filter(coupon => {
    const query = searchQuery.toLowerCase();
    return (
      coupon.code.toLowerCase().includes(query) ||
      coupon.type.toLowerCase().includes(query) ||
      coupon.status.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Loading offers &amp; loyalty data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Offers & Loyalty</h1>
          <p className="text-muted-foreground mt-1">Manage coupons, memberships, and loyalty programs</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="w-full overflow-x-auto pb-4">
        <nav className="flex gap-3 min-w-max p-1">
          {[
            { id: 'coupons', label: 'Coupons', icon: Tag, description: 'Manage promo codes' },
            { id: 'membership', label: 'Membership Plans', icon: Crown, description: 'Subscription tiers' },
            { id: 'loyalty', label: 'Loyalty Config', icon: Star, description: 'Points & rewards' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg transition-colors text-left min-w-[200px]',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border hover:bg-muted shadow-sm'
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
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
            
            <Dialog open={createDialogOpen} onOpenChange={(open) => {
              setCreateDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2">
                  <Plus className="h-5 w-5" />
                  Create Coupon
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
                  <DialogDescription>
                    {editingCoupon ? 'Update coupon details' : 'Set up a new promotional coupon code'}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Coupon Code *</Label>
                    <Input 
                      placeholder="e.g., SAVE20" 
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                      className="uppercase font-mono"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Discount Type *</Label>
                      <Select 
                        value={formData.type}
                        onValueChange={(value: 'percentage' | 'flat') => setFormData({...formData, type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (%)</SelectItem>
                          <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Discount Value *</Label>
                      <Input 
                        type="number" 
                        placeholder={formData.type === 'percentage' ? 'e.g., 20' : 'e.g., 100'}
                        value={formData.value}
                        onChange={(e) => setFormData({...formData, value: e.target.value})}
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
                        onChange={(e) => setFormData({...formData, min_order: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Max Discount (₹)</Label>
                      <Input 
                        type="number" 
                        placeholder="Optional"
                        value={formData.max_discount}
                        onChange={(e) => setFormData({...formData, max_discount: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Valid From *</Label>
                      <Input 
                        type="date"
                        value={formData.valid_from}
                        onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Valid To *</Label>
                      <Input 
                        type="date"
                        value={formData.valid_to}
                        onChange={(e) => setFormData({...formData, valid_to: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Usage Limit</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g., 100 (default: unlimited)"
                      value={formData.usage_limit}
                      onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => {
                    setCreateDialogOpen(false);
                    resetForm();
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={editingCoupon ? handleUpdateCoupon : handleCreateCoupon}>
                    <Gift className="h-4 w-4 mr-2" />
                    {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
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
                    <TableHead className="font-semibold">COUPON CODE</TableHead>
                    <TableHead className="font-semibold">DISCOUNT TYPE</TableHead>
                    <TableHead className="font-semibold">DISCOUNT VALUE</TableHead>
                    <TableHead className="font-semibold">MIN ORDER AMOUNT</TableHead>
                    <TableHead className="font-semibold">EXPIRY DATE</TableHead>
                    <TableHead className="font-semibold">STATUS</TableHead>
                    <TableHead className="text-right font-semibold">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        <Tag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No coupons found</p>
                        {searchQuery && (
                          <p className="text-sm mt-1">Try adjusting your search</p>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCoupons.map((coupon) => (
                      <TableRow key={coupon.id} className="hover:bg-muted/30">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-orange-600 cursor-pointer hover:text-orange-700"
                                  onClick={() => copyCouponCode(coupon.code)}>
                              {coupon.code}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => copyCouponCode(coupon.code)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize">{coupon.type}</span>
                        </TableCell>
                        <TableCell className="font-semibold">
                          {coupon.type === 'percentage' ? (
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
                          {new Date(coupon.valid_to).toLocaleDateString('en-GB')}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              coupon.status === 'active' 
                                ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                                : coupon.status === 'expired'
                                ? 'bg-red-100 text-red-700 hover:bg-red-100'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-100'
                            }
                          >
                            {coupon.status === 'active' ? 'Active' : coupon.status === 'expired' ? 'Expired' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditCoupon(coupon)}
                              className="h-8 gap-1"
                            >
                              <Edit className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            
                            {coupon.status === 'active' ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => toggleCouponStatus(coupon.id)}
                                className="h-8 gap-1"
                              >
                                <Ban className="h-3.5 w-3.5" />
                                Disable
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => toggleCouponStatus(coupon.id)}
                                className="h-8 gap-1 bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Enable
                              </Button>
                            )}
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteCoupon(coupon.id)}
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
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Coupons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{coupons.length}</div>
                <p className="text-xs text-muted-foreground mt-1">All coupon codes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Coupons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {coupons.filter(c => c.status === 'active').length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Currently active</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {coupons.reduce((sum, c) => sum + c.usage_count, 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Times redeemed</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================== TAB 2: MEMBERSHIP PLANS ==================== */}
        <TabsContent value="membership" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Membership Plans</h2>
              <p className="text-muted-foreground mt-1">Manage subscription plans for customers</p>
            </div>
            <Button onClick={() => setCreatePlanDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Membership
            </Button>
          </div>

          {/* Plan Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {membershipPlans.map((plan) => (
              <Card key={plan.id} className={`border-2 ${plan.borderColor} ${plan.bgColor}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 bg-white rounded-full ${plan.color}`}>
                        {plan.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{plan.name}</CardTitle>
                        <Badge className={plan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {plan.status === 'active' ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Pricing */}
                  <div className="flex items-baseline gap-1">
                    <IndianRupee className="h-5 w-5 mt-1" />
                    <span className="text-3xl font-bold">{plan.monthlyPrice}</span>
                    <span className="text-muted-foreground">{plan.billingCycle}</span>
                  </div>

                  <Separator />

                  {/* Benefits */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold">Benefits</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-orange-500" />
                          <span className="text-sm">Extra Loyalty Points</span>
                        </div>
                        <Badge variant="outline" className="font-semibold">
                          +{plan.benefits.loyaltyBonus}%
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-2 bg-white rounded-lg">
                        <div className="flex items-center gap-2">
                          <Gift className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">Exclusive Coupons</span>
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
                          <span className="text-sm">Free Delivery</span>
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
                          <span className="text-sm">Priority Support</span>
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
                      variant={plan.status === 'active' ? 'destructive' : 'default'}
                      className="flex-1 gap-2"
                      onClick={() => togglePlanStatus(plan.id)}
                    >
                      {plan.status === 'active' ? (
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

          {/* Create Plan Dialog */}
          <Dialog open={createPlanDialogOpen} onOpenChange={(open) => {
            setCreatePlanDialogOpen(open);
            if (!open) resetPlanForm();
          }}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create Membership Plan</DialogTitle>
                <DialogDescription>
                  Add a new subscription plan for customers
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Plan Name *</Label>
                  <Input 
                    placeholder="e.g., Gold Plan" 
                    value={planFormData.name}
                    onChange={(e) => setPlanFormData({...planFormData, name: e.target.value})}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tier *</Label>
                    <Select 
                      value={planFormData.tier}
                      onValueChange={(value: 'silver' | 'gold' | 'platinum') => 
                        setPlanFormData({...planFormData, tier: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="silver">Silver</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="platinum">Platinum</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Monthly Price (₹) *</Label>
                    <Input 
                      type="number" 
                      placeholder="299" 
                      value={planFormData.monthlyPrice}
                      onChange={(e) => setPlanFormData({...planFormData, monthlyPrice: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Loyalty Bonus (%) *</Label>
                  <Input 
                    type="number" 
                    placeholder="10" 
                    value={planFormData.loyaltyBonus}
                    onChange={(e) => setPlanFormData({...planFormData, loyaltyBonus: e.target.value})}
                  />
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Benefits</Label>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Exclusive Coupons</span>
                    </div>
                    <Switch 
                      checked={planFormData.exclusiveCoupons}
                      onCheckedChange={(checked) => 
                        setPlanFormData({...planFormData, exclusiveCoupons: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Free Delivery</span>
                    </div>
                    <Switch 
                      checked={planFormData.freeDelivery}
                      onCheckedChange={(checked) => 
                        setPlanFormData({...planFormData, freeDelivery: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Priority Support</span>
                    </div>
                    <Switch 
                      checked={planFormData.prioritySupport}
                      onCheckedChange={(checked) => 
                        setPlanFormData({...planFormData, prioritySupport: checked})
                      }
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreatePlanDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreatePlan}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Plan
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Plan Dialog */}
          <Dialog open={planDialogOpen} onOpenChange={(open) => {
            setPlanDialogOpen(open);
            if (!open) resetPlanForm();
          }}>
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
                    onChange={(e) => setPlanFormData({...planFormData, name: e.target.value})}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Monthly Price (₹) *</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g., 499"
                      value={planFormData.monthlyPrice}
                      onChange={(e) => setPlanFormData({...planFormData, monthlyPrice: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Loyalty Bonus (%) *</Label>
                    <Input 
                      type="number" 
                      placeholder="e.g., 25"
                      value={planFormData.loyaltyBonus}
                      onChange={(e) => setPlanFormData({...planFormData, loyaltyBonus: e.target.value})}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Label>Plan Benefits</Label>
                  
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Gift className="h-4 w-4 text-blue-500" />
                      <span className="text-sm">Exclusive Coupons</span>
                    </div>
                    <Switch
                      checked={planFormData.exclusiveCoupons}
                      onCheckedChange={(checked) => setPlanFormData({...planFormData, exclusiveCoupons: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-purple-500" />
                      <span className="text-sm">Free Delivery</span>
                    </div>
                    <Switch
                      checked={planFormData.freeDelivery}
                      onCheckedChange={(checked) => setPlanFormData({...planFormData, freeDelivery: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Priority Support</span>
                    </div>
                    <Switch
                      checked={planFormData.prioritySupport}
                      onCheckedChange={(checked) => setPlanFormData({...planFormData, prioritySupport: checked})}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setPlanDialogOpen(false);
                  resetPlanForm();
                }}>
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
            <h2 className="text-2xl font-bold">Loyalty Points Configuration</h2>
            <p className="text-muted-foreground mt-1">Reward customers for repeat orders</p>
          </div>

          {/* Points Earning Rules */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-orange-500" />
                Points Earning Rules
              </CardTitle>
              <CardDescription>Configure how customers earn loyalty points</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Points Per ₹100 Spent</Label>
                  <Input
                    type="number"
                    value={loyaltyConfig.pointsPerHundred}
                    onChange={(e) => setLoyaltyConfig({...loyaltyConfig, pointsPerHundred: Number(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Customers earn {loyaltyConfig.pointsPerHundred} points for every ₹100 spent
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Maximum Points Per Order</Label>
                  <Input
                    type="number"
                    value={loyaltyConfig.maxPointsPerOrder}
                    onChange={(e) => setLoyaltyConfig({...loyaltyConfig, maxPointsPerOrder: Number(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Cap points earned at {loyaltyConfig.maxPointsPerOrder} per single order
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">Enable Loyalty Program</p>
                    <p className="text-xs text-muted-foreground">Allow customers to earn and redeem points</p>
                  </div>
                </div>
                <Switch
                  checked={loyaltyConfig.loyaltyEnabled}
                  onCheckedChange={(checked) => setLoyaltyConfig({...loyaltyConfig, loyaltyEnabled: checked})}
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
              <CardDescription>Set rules for how customers can use their points</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Points Required Per ₹1 Discount</Label>
                  <Input
                    type="number"
                    value={loyaltyConfig.pointsPerRupee}
                    onChange={(e) => setLoyaltyConfig({...loyaltyConfig, pointsPerRupee: Number(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">
                    {loyaltyConfig.pointsPerRupee} points = ₹1 discount
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Minimum Redeemable Points</Label>
                  <Input
                    type="number"
                    value={loyaltyConfig.minRedeemablePoints}
                    onChange={(e) => setLoyaltyConfig({...loyaltyConfig, minRedeemablePoints: Number(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">
                    Customers must have at least {loyaltyConfig.minRedeemablePoints} points to redeem
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
              <CardDescription>Manage point expiration policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Points Expiry Duration (Months)</Label>
                <Input
                  type="number"
                  value={loyaltyConfig.expiryMonths}
                  onChange={(e) => setLoyaltyConfig({...loyaltyConfig, expiryMonths: Number(e.target.value)})}
                />
                <p className="text-xs text-muted-foreground">
                  Points will expire after {loyaltyConfig.expiryMonths} months of inactivity
                </p>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium">Enable Auto-Expiry</p>
                    <p className="text-xs text-muted-foreground">Automatically expire points after set duration</p>
                  </div>
                </div>
                <Switch
                  checked={loyaltyConfig.autoExpiryEnabled}
                  onCheckedChange={(checked) => setLoyaltyConfig({...loyaltyConfig, autoExpiryEnabled: checked})}
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
                  <span className="font-semibold">Example Calculation:</span> A customer who spends ₹1,000 will earn{' '}
                  <span className="font-bold text-blue-600">
                    {Math.floor((1000 / 100) * loyaltyConfig.pointsPerHundred)} points
                  </span>
                  . To redeem ₹50 discount, they need{' '}
                  <span className="font-bold text-blue-600">
                    {50 * loyaltyConfig.pointsPerRupee} points
                  </span>
                  .
                </p>
                <p className="text-muted-foreground">
                  Points {loyaltyConfig.autoExpiryEnabled ? 'will' : 'will not'} expire after {loyaltyConfig.expiryMonths} months.
                  Loyalty program is currently {loyaltyConfig.loyaltyEnabled ? 'enabled' : 'disabled'}.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button size="lg" onClick={handleSaveLoyaltyConfig} className="gap-2">
              <Save className="h-5 w-5" />
              Save Configuration
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
