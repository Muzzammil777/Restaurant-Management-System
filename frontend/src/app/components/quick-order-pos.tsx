import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/app/components/ui/card';
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
  ChevronUp, Tag as TagIcon, Flame, Package2, Clock, 
  AlertTriangle, ChefHat, Repeat, Volume2, VolumeX, 
  ArrowRight, ArrowLeft, Ban, Edit, Trash2, Check, 
  Timer, TrendingUp, Package
} from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/utils/supabase/info';
import { tablesApi } from '@/utils/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { restaurantState } from '@/app/services/restaurant-state';
import { useAuth } from '@/utils/auth-context';
import { Switch } from '@/app/components/ui/switch';
import { Progress } from '@/app/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/app/components/ui/collapsible';

// ==================== INTERFACES ====================

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

  export function QuickOrderPOS({ open, onOpenChange, onOrderCreated }: QuickOrderPOSProps) {
    const { user } = useAuth();
    // ...existing state and logic...

    // Step state
    const [step, setStep] = useState(1);
    // Reset step on open
    useEffect(() => { if (open) setStep(1); }, [open]);

    // Step navigation bar (theme-matched)
    const Stepper = () => (
      <div className="flex items-center justify-center gap-4 py-4 bg-[#F7F3EE]">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex flex-col items-center ${step === s ? 'font-bold text-[#8B5E34]' : 'text-muted-foreground'}`}> 
            <div className={`rounded-full flex items-center justify-center transition-all duration-200 border-2 ${step === s ? 'bg-[#8B5E34] text-white border-[#8B5E34]' : 'bg-white border-[#E5DDD3]'}`} style={{ width: 36, height: 36 }}>
              {s}
            </div>
            <span className="text-xs mt-1">{s === 1 ? 'Order Info' : s === 2 ? 'Items' : 'Review'}</span>
          </div>
        ))}
      </div>
    );

    // Step 1: Order Info Only
    const Step1 = () => (
      <Card className="shadow-md border-2 border-[#8B5E34]/10 max-w-[480px] mx-auto">
        <CardHeader className="bg-gradient-to-r from-[#F6F2ED] to-white pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-[#8B5E34]">
            <UtensilsCrossed className="h-5 w-5" /> Order Information
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          {/* Order Type */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Order Type *</Label>
            <Select value={orderType} onValueChange={(value: 'dine-in' | 'takeaway') => setOrderType(value)}>
              <SelectTrigger className="h-12 text-base font-medium border-2"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dine-in">🍽️ Dine-In</SelectItem>
                <SelectItem value="takeaway">📦 Takeaway</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Table Number (conditional) */}
          {orderType === 'dine-in' && (
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Select Table *</Label>
              <Select value={tableNumber} onValueChange={setTableNumber}>
                <SelectTrigger className="h-12 text-base font-medium border-2"><SelectValue placeholder={tablesLoading ? 'Loading tables...' : 'Select a table'} /></SelectTrigger>
                <SelectContent>
                  {availableTables.length === 0 ? (
                    <SelectItem value="no-tables" disabled>{tablesLoading ? 'Loading...' : 'No tables available'}</SelectItem>
                  ) : (
                    <>
                      {['VIP', 'Main Hall', 'AC Hall'].map(location => {
                        const locationTables = availableTables.filter(t => t.location === location);
                        if (locationTables.length === 0) return null;
                        return (
                          <div key={location}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">{location}</div>
                            {locationTables.map(table => (
                              <SelectItem key={table._id} value={table.displayNumber || table.name}>
                                <span className="flex items-center gap-2">
                                  <span className="font-bold">{table.displayNumber || table.name}</span>
                                  <span className="text-muted-foreground text-xs">({table.capacity} seats{table.status?.toLowerCase() === 'occupied' ? ', Occupied' : ''})</span>
                                  {table.status?.toLowerCase() === 'occupied' && table.waiterName && (<span className="text-xs text-emerald-600">• {table.waiterName}</span>)}
                                </span>
                              </SelectItem>
                            ))}
                          </div>
                        );
                      })}
                    </>
                  )}
                </SelectContent>
              </Select>
              {availableTables.length === 0 && !tablesLoading && (
                <p className="text-xs text-amber-600">All tables are currently occupied. Please wait or use takeaway.</p>
              )}
            </div>
          )}
          {/* Customer Name */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Customer Name</Label>
            <Input placeholder="Optional" value={customerName} onChange={e => setCustomerName(e.target.value)} className="h-12 border-2" />
          </div>
          {/* Add-on Instructions */}
          {!showSpecialInstructions ? (
            <Button variant="outline" onClick={() => setShowSpecialInstructions(true)} className="w-full h-11 gap-2 border-dashed border-2">
              <TagIcon className="h-4 w-4" /> Add special instructions <ChevronDown className="h-4 w-4 ml-auto" />
            </Button>
          ) : (
            <div className="space-y-4 pt-2 border-t-2 border-dashed">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Special Instructions</Label>
                <Button variant="ghost" size="sm" onClick={() => { setShowSpecialInstructions(false); setNotes(''); setTags([]); }} className="h-7 text-xs"><ChevronUp className="h-3 w-3 mr-1" />Hide</Button>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Tags</Label>
                <div className="flex flex-wrap gap-2">{QUICK_TAGS.map(tag => (<Button key={tag} size="sm" variant={tags.includes(tag) ? 'default' : 'outline'} onClick={() => toggleTag(tag)} className="h-8 text-xs">{tag}</Button>))}</div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium">Notes</Label>
                <Textarea placeholder="e.g., No onion, Extra spicy..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="resize-none border-2" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );

    // Step 2: Item Selection (70/30 layout, tabs swapped, no timeline/info)
    const Step2 = () => (
      <div className="flex flex-col lg:flex-row gap-6 max-w-[900px] mx-auto">
        {/* Items Section (70%) */}
        <div className="w-full lg:w-[70%]">
          <Card className="shadow-md border-2 border-[#8B5E34]/10 flex-1 flex flex-col">
            <CardHeader className="bg-gradient-to-r from-[#F6F2ED] to-white pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-[#8B5E34]">
                <ShoppingBag className="h-5 w-5" /> Select Items
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col overflow-hidden">
              {/* Tabs: Items | Combos | Recent (swapped) */}
              <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'combos' | 'items' | 'recent')} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3 h-12 mb-4">
                  <TabsTrigger value="items" className="text-sm font-semibold"><Package2 className="h-4 w-4 mr-2" />Items</TabsTrigger>
                  <TabsTrigger value="combos" className="text-sm font-semibold"><Sparkles className="h-4 w-4 mr-2" />Combos</TabsTrigger>
                  <TabsTrigger value="recent" className="text-sm font-semibold"><Repeat className="h-4 w-4 mr-2" />Recent</TabsTrigger>
                </TabsList>
                {/* ...existing TabsContent for items, combos, recent... */}
                {/* ...existing code for TabsContent (copy from original, unchanged)... */}
                {/* ...existing code... */}
                {/* Items Tab */}
                {/* ...existing code for Items Tab... */}
                {/* Combos Tab */}
                {/* ...existing code for Combos Tab... */}
                {/* Recent Tab */}
                {/* ...existing code for Recent Tab... */}
              </Tabs>
            </CardContent>
          </Card>
        </div>
        {/* Cart Section (30%) */}
        <div className="w-full lg:w-[30%]">
          <Card className="shadow-md border-2 border-[#8B5E34]/10 flex-1 flex flex-col">
            <CardHeader className="bg-gradient-to-r from-[#F6F2ED] to-white pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-[#8B5E34]">
                <Package className="h-5 w-5" /> Cart
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col">
              {/* ...existing code for cart/order items, groupedItems, etc. (from original right panel Order Preview Card, but without timeline, only cart) ... */}
              {/* ...existing code... */}
            </CardContent>
          </Card>
        </div>
      </div>
    );

    // Step 3: Order Review/Confirmation
    const Step3 = () => (
      <Card className="shadow-md border-2 border-[#8B5E34]/10 max-w-[480px] mx-auto">
        <CardHeader className="bg-gradient-to-r from-[#F6F2ED] to-white pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-[#8B5E34]">
            <CheckCircle className="h-5 w-5" /> Review Order
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-5">
          {/* Order Metadata */}
          <div className="mb-4">
            <div className="flex gap-4 mb-2">
              <span className="font-semibold text-[#8B5E34]">Order Type:</span>
              <span>{orderType === 'dine-in' ? 'Dine-In' : 'Takeaway'}</span>
            </div>
            {orderType === 'dine-in' && (
              <div className="flex gap-4 mb-2">
                <span className="font-semibold text-[#8B5E34]">Table:</span>
                <span>{tableNumber}</span>
              </div>
            )}
            {customerName && (
              <div className="flex gap-4 mb-2">
                <span className="font-semibold text-[#8B5E34]">Customer:</span>
                <span>{customerName}</span>
              </div>
            )}
            {(tags.length > 0 || notes) && (
              <div className="flex gap-4 mb-2">
                <span className="font-semibold text-[#8B5E34]">Instructions:</span>
                <span>{tags.join(', ')} {notes && `| ${notes}`}</span>
              </div>
            )}
          </div>
          {/* Items List */}
          <div className="mb-4">
            <div className="font-semibold text-[#8B5E34] mb-2">Items</div>
            {orderItems.length === 0 ? (
              <div className="text-muted-foreground">No items added.</div>
            ) : (
              <div className="space-y-2">
                {orderItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="flex items-center"><IndianRupee className="h-4 w-4" />{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Total */}
          <div className="flex justify-between items-center border-t pt-4">
            <span className="font-semibold text-[#8B5E34]">Total</span>
            <span className="text-xl font-bold flex items-center"><IndianRupee className="h-5 w-5" />{subtotal}</span>
          </div>
        </CardContent>
      </Card>
    );

    // Step action bar
    const StepActions = () => (
      <div className="flex justify-between items-center gap-4 mt-8 max-w-[480px] mx-auto">
        <Button variant="outline" size="lg" onClick={handleCancelOrder} className="h-12 px-6 border-2"><Ban className="h-5 w-5 mr-2" />Cancel</Button>
        <div className="flex gap-2">
          {step > 1 && <Button variant="secondary" size="lg" onClick={() => setStep(step - 1)} className="h-12 px-8">Back</Button>}
          {step < 3 && <Button size="lg" onClick={() => setStep(step + 1)} className="h-12 px-8 bg-[#8B5E34] hover:bg-[#8B5E34]/90 text-white">Next</Button>}
          {step === 3 && <Button size="lg" onClick={handleCreateOrder} disabled={!isOrderValid} className={`h-12 px-8 text-base font-semibold ${isOrderValid ? 'bg-[#8B5E34] hover:bg-[#8B5E34]/90 text-white' : 'bg-gray-300 cursor-not-allowed'}`}><CheckCircle className="h-5 w-5 mr-2" />Create Order</Button>}
        </div>
      </div>
    );

    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="max-w-[480px] w-full p-0 overflow-visible rounded-xl">
          {/* Header */}
          <div className="sticky top-0 z-20 bg-[#8B5E34] text-white px-8 py-6 shadow-lg rounded-t-xl">
            <SheetHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center"><Zap className="h-7 w-7 text-white" /></div>
                  <div>
                    <SheetTitle className="text-2xl text-white font-bold">Quick Order (POS Mode)</SheetTitle>
                    <SheetDescription className="text-white/80 text-base">Fast, flexible order creation</SheetDescription>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {currentRole === 'waiter' && (<Badge className="bg-green-500/20 text-white border-white/30"><Check className="h-3 w-3 mr-1" />Waiter Mode Active</Badge>)}
                  {currentRole === 'admin' && (<Badge className="bg-yellow-500/20 text-white border-white/30"><Check className="h-3 w-3 mr-1" />Admin Mode Active</Badge>)}
                  <Badge className="bg-blue-500/20 text-white border-white/30"><Check className="h-3 w-3 mr-1" />Menu Synced</Badge>
                  <Button variant="ghost" size="sm" onClick={() => setSoundEnabled(!soundEnabled)} className="text-white hover:bg-white/20">{soundEnabled ? (<Volume2 className="h-5 w-5" />) : (<VolumeX className="h-5 w-5" />)}</Button>
                </div>
              </div>
            </SheetHeader>
          </div>
          {/* Stepper */}
          <Stepper />
          {/* Step Content */}
          <div className="py-8 px-4">
            {step === 1 && <Step1 />}
            {step === 2 && <Step2 />}
            {step === 3 && <Step3 />}
            <StepActions />
          </div>
        </SheetContent>
      </Sheet>
      {/* ...existing rollback dialog code (unchanged)... */}
      {/* ...existing code... */}
    );
  }
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
                        Select Table *
                      </Label>
                      <Select
                        value={tableNumber}
                        onValueChange={(value) => setTableNumber(value)}
                      >
                        <SelectTrigger className="h-12 text-base font-medium border-2">
                          <SelectValue placeholder={tablesLoading ? "Loading tables..." : "Select a table"} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTables.length === 0 ? (
                            <SelectItem value="no-tables" disabled>
                              {tablesLoading ? "Loading..." : "No tables available"}
                            </SelectItem>
                          ) : (
                            <>
                              {/* Group tables by location */}
                              {['VIP', 'Main Hall', 'AC Hall'].map(location => {
                                const locationTables = availableTables.filter(t => t.location === location);
                                if (locationTables.length === 0) return null;
                                return (
                                  <div key={location}>
                                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted">
                                      {location}
                                    </div>
                                    {locationTables.map(table => (
                                      <SelectItem key={table._id} value={table.displayNumber || table.name}>
                                        <span className="flex items-center gap-2">
                                          <span className="font-bold">{table.displayNumber || table.name}</span>
                                          <span className="text-muted-foreground text-xs">
                                            ({table.capacity} seats{table.status?.toLowerCase() === 'occupied' ? ', Occupied' : ''})
                                          </span>
                                          {table.status?.toLowerCase() === 'occupied' && table.waiterName && (
                                            <span className="text-xs text-emerald-600">
                                              • {table.waiterName}
                                            </span>
                                          )}
                                        </span>
                                      </SelectItem>
                                    ))}
                                  </div>
                                );
                              })}
                            </>
                          )}
                        </SelectContent>
                      </Select>
                      {availableTables.length === 0 && !tablesLoading && (
                        <p className="text-xs text-amber-600">
                          All tables are currently occupied. Please wait or use takeaway.
                        </p>
                      )}
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

              {/* Item Selection Card */}
              <Card className="shadow-md border-2 border-[#8B5E34]/10 flex-1 flex flex-col">
                <CardHeader className="bg-gradient-to-r from-[#F6F2ED] to-white pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-[#8B5E34]">
                    <ShoppingBag className="h-5 w-5" />
                    Select Items
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 flex-1 flex flex-col overflow-hidden">
                  {/* Tabs: Combos | Individual Items | Recent Orders */}
                  <Tabs
                    value={activeTab}
                    onValueChange={(value) =>
                      setActiveTab(value as 'combos' | 'items' | 'recent')
                    }
                    className="flex-1 flex flex-col"
                  >
                    <TabsList className="grid w-full grid-cols-3 h-12 mb-4">
                      <TabsTrigger value="combos" className="text-sm font-semibold">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Combos
                      </TabsTrigger>
                      <TabsTrigger value="items" className="text-sm font-semibold">
                        <Package2 className="h-4 w-4 mr-2" />
                        Items
                      </TabsTrigger>
                      <TabsTrigger value="recent" className="text-sm font-semibold">
                        <Repeat className="h-4 w-4 mr-2" />
                        Recent
                      </TabsTrigger>
                    </TabsList>

                    {/* Combos Tab */}
                    <TabsContent value="combos" className="flex-1 overflow-hidden mt-0 space-y-2">
                      {/* Task 2: Show Total Combo Count */}
                      {!loading && comboMeals.length > 0 && (
                        <div className="flex items-center text-sm px-1">
                          <span className="text-muted-foreground">
                            <Sparkles className="inline h-4 w-4 mr-1" />
                            <strong className="text-[#8B5E34]">{comboMeals.length}</strong> combo meals available
                          </span>
                        </div>
                      )}
                      
                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="animate-spin h-8 w-8 border-4 border-[#8B5E34] border-t-transparent rounded-full mx-auto mb-3"></div>
                            <p className="text-sm text-muted-foreground">Loading combos...</p>
                          </div>
                        </div>
                      ) : comboMeals.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center max-w-sm">
                            <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No Combos Available</h3>
                            <p className="text-sm text-muted-foreground">
                              Create combo meals in Menu Management
                            </p>
                          </div>
                        </div>
                      ) : (
                        <ScrollArea className="h-[450px] pr-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                            {comboMeals.map((combo) => {
                              const savings = combo.originalPrice - combo.discountedPrice;
                              const discountPercent = Math.round(
                                (savings / combo.originalPrice) * 100
                              );
                              const isExpanded = expandedCombo === combo.id;

                              return (
                                <Card
                                  key={combo.id}
                                  className="cursor-pointer hover:shadow-lg transition-shadow duration-150 border-2 hover:border-[#8B5E34]/50 group active:scale-[0.98]"
                                >
                                  <CardContent className="p-4">
                                    <div className="flex gap-4">
                                      {/* Combo Image */}
                                      <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100 relative">
                                        <img
                                          src={combo.image}
                                          alt={combo.name}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                          style={{ aspectRatio: '1', objectFit: 'cover' }}
                                        />
                                        {combo.calories && (
                                          <div className="absolute bottom-1 right-1 bg-black/70 text-[#FF7F50] text-xs px-2 py-0.5 rounded">
                                            {combo.calories} cal
                                          </div>
                                        )}
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
                                          <span className="text-lg font-bold text-[#8B5E34] flex items-center">
                                            <IndianRupee className="h-4 w-4" />
                                            {combo.discountedPrice}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Feature #6: Split Select - Expand combo items */}
                                    <div className="mt-3 space-y-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleComboExpansion(combo.id)}
                                        className="w-full text-xs"
                                      >
                                        {isExpanded ? (
                                          <>
                                            <ChevronUp className="h-3 w-3 mr-1" />
                                            Hide Items
                                          </>
                                        ) : (
                                          <>
                                            <ChevronDown className="h-3 w-3 mr-1" />
                                            View Items ({(combo.items || []).length})
                                          </>
                                        )}
                                      </Button>

                                      <AnimatePresence>
                                        {isExpanded && (
                                          <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                          >
                                            <div className="border rounded p-2 space-y-1 text-xs bg-gray-50">
                                              {(combo.items || []).length === 0 ? (
                                                <p className="text-muted-foreground text-center py-1">
                                                  No items linked. Edit combo in Menu Management to add items.
                                                </p>
                                              ) : (
                                                (combo.items || []).map(itemId => {
                                                  const item = menuItems.find(mi => mi.id === itemId);
                                                  return item ? (
                                                    <div key={itemId} className="flex justify-between">
                                                      <span>• {item.name}</span>
                                                      <span className="text-muted-foreground flex items-center">
                                                        <IndianRupee className="h-3 w-3" />
                                                        {item.price}
                                                      </span>
                                                    </div>
                                                  ) : (
                                                    <div key={itemId} className="text-muted-foreground">
                                                      • Item not found (ID: {itemId.slice(0, 8)}...)
                                                    </div>
                                                  );
                                                })
                                              )}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>

                                      <Button
                                        size="sm"
                                        onClick={() => addComboToOrder(combo)}
                                        className="w-full h-9 gap-2 bg-[#8B5E34] hover:bg-[#8B5E34]/90"
                                      >
                                        <Plus className="h-4 w-4" />
                                        Add Combo
                                      </Button>
                                    </div>
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
                      {/* Feature #11: Inline Item Search */}
                      <div className="space-y-2">
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
                        
                        {/* Task 2: Show Total Menu Item Count */}
                        {!loading && (
                          <div className="flex items-center justify-between text-sm px-1">
                            <span className="text-muted-foreground">
                              {filteredMenuItems.length === menuItems.length ? (
                                <>
                                  <Package className="inline h-4 w-4 mr-1" />
                                  <strong className="text-[#8B5E34]">{menuItems.length}</strong> items available
                                </>
                              ) : (
                                <>
                                  Showing <strong className="text-[#8B5E34]">{filteredMenuItems.length}</strong> of{' '}
                                  <strong className="text-[#8B5E34]">{menuItems.length}</strong> items
                                </>
                              )}
                            </span>
                          </div>
                        )}
                      </div>

                      {loading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="animate-spin h-8 w-8 border-4 border-[#8B5E34] border-t-transparent rounded-full mx-auto mb-3"></div>
                            <p className="text-sm text-muted-foreground">Loading items...</p>
                          </div>
                        </div>
                      ) : filteredMenuItems.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center max-w-sm">
                            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No Items Found</h3>
                            <p className="text-sm text-muted-foreground">
                              Try adjusting your search or filters
                            </p>
                          </div>
                        </div>
                      ) : (
                        <ScrollArea className="h-[450px] pr-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                            {filteredMenuItems.map((item) => (
                              <Card
                                key={item.id}
                                className="cursor-pointer hover:shadow-lg transition-shadow duration-150 border-2 hover:border-[#8B5E34]/50 group active:scale-[0.98]"
                                onClick={() => addItemToOrder(item)}
                                onDoubleClick={() => handleDoubleTap(item)}
                                onTouchStart={() => handleLongPressStart(item)}
                                onTouchEnd={handleLongPressEnd}
                                onMouseDown={() => handleLongPressStart(item)}
                                onMouseUp={handleLongPressEnd}
                                onMouseLeave={handleLongPressEnd}
                              >
                                <CardContent className="p-4">
                                  <div className="flex gap-4">
                                    {/* Item Image */}
                                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100 relative">
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                        style={{ aspectRatio: '1', objectFit: 'cover' }}
                                      />
                                      {item.calories && (
                                        <div className="absolute bottom-1 right-1 bg-black/70 text-[#FF7F50] text-xs px-1.5 py-0.5 rounded">
                                          {item.calories} cal
                                        </div>
                                      )}
                                    </div>

                                    {/* Item Info */}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-semibold text-sm line-clamp-1">
                                          {item.name}
                                        </h4>
                                        {item.dietType && (
                                          <Badge
                                            variant="outline"
                                            className={`text-xs flex-shrink-0 ${
                                              item.dietType === 'veg'
                                                ? 'border-green-500 text-green-700'
                                                : 'border-red-500 text-red-700'
                                            }`}
                                          >
                                            {item.dietType === 'veg' ? '🌱' : '🍖'}
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                        {item.description}
                                      </p>
                                      <div className="flex items-center justify-between">
                                        <span className="text-base font-bold text-[#8B5E34] flex items-center">
                                          <IndianRupee className="h-4 w-4" />
                                          {item.price}
                                        </span>
                                        {item.preparationTime && (
                                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {item.preparationTime}m
                                          </span>
                                        )}
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

                    {/* Feature #8: Recent Orders Tab */}
                    <TabsContent value="recent" className="flex-1 overflow-hidden mt-0">
                      {recentOrders.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center max-w-sm">
                            <Repeat className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-semibold mb-2">No Recent Orders</h3>
                            <p className="text-sm text-muted-foreground">
                              Your recent orders will appear here
                            </p>
                          </div>
                        </div>
                      ) : (
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-4 pb-4">
                            {recentOrders.map((order) => (
                              <Card
                                key={order.id}
                                className="border-2 hover:border-[#8B5E34]/50 transition-colors"
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h4 className="font-semibold text-sm mb-1">
                                        {order.items.length} items
                                      </h4>
                                      <p className="text-xs text-muted-foreground">
                                        {new Date(order.timestamp).toLocaleTimeString()}
                                      </p>
                                    </div>
                                    <span className="text-base font-bold text-[#8B5E34] flex items-center">
                                      <IndianRupee className="h-4 w-4" />
                                      {order.total}
                                    </span>
                                  </div>
                                  
                                  <div className="space-y-1 mb-3">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="text-xs text-muted-foreground flex justify-between">
                                        <span>• {item.name} x{item.quantity}</span>
                                        <span className="flex items-center">
                                          <IndianRupee className="h-3 w-3" />
                                          {item.price * item.quantity}
                                        </span>
                                      </div>
                                    ))}
                                  </div>

                                  <Button
                                    size="sm"
                                    onClick={() => repeatOrder(order)}
                                    className="w-full h-9 gap-2 bg-[#8B5E34] hover:bg-[#8B5E34]/90"
                                  >
                                    <Repeat className="h-4 w-4" />
                                    Repeat Order
                                  </Button>
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

            {/* RIGHT PANEL: Live Order Preview + Timeline */}
            <div className="lg:col-span-5 space-y-6">
              {/* Feature #1: Live Order Timeline */}
              <Card className="shadow-md border-2 border-[#8B5E34]/10">
                <CardHeader className="bg-gradient-to-r from-[#F6F2ED] to-white pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-[#8B5E34]">
                    <Timer className="h-5 w-5" />
                    Order Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Progress Bar */}
                    <div className="relative">
                      <div className="flex justify-between mb-2">
                        {ORDER_STATUSES.map((status) => {
                          const statusIndex = ORDER_STATUSES.indexOf(status);
                          const currentIndex = ORDER_STATUSES.indexOf(currentStatus);
                          const isActive = statusIndex <= currentIndex;
                          
                          return (
                            <div key={status} className="flex flex-col items-center">
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                                  isActive
                                    ? STATUS_COLORS[status] + ' text-white scale-110'
                                    : 'bg-gray-200 text-gray-400'
                                }`}
                              >
                                {isActive && <CheckCircle className="h-5 w-5" />}
                              </div>
                              <span className="text-xs mt-1 capitalize">{status}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      <Progress
                        value={(ORDER_STATUSES.indexOf(currentStatus) / (ORDER_STATUSES.length - 1)) * 100}
                        className="h-2"
                      />
                    </div>

                    {/* Feature #2: Bottleneck Detection */}
                    {isBottleneck && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-center gap-3"
                      >
                        <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-red-900">
                            Bottleneck Detected
                          </p>
                          <p className="text-xs text-red-700">
                            Order has been in preparing for {preparingDuration} minutes
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Timeline Details */}
                    <div className="space-y-2">
                      {orderTimeline.map((tl, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                        >
                          <span className="capitalize font-medium">{tl.status}</span>
                          <span className="text-muted-foreground text-xs">
                            {tl.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Order Preview Card */}
              <Card className="shadow-md border-2 border-[#8B5E34]/10 flex-1 flex flex-col">
                <CardHeader className="bg-gradient-to-r from-[#F6F2ED] to-white pb-4">
                  <CardTitle className="text-lg flex items-center justify-between text-[#8B5E34]">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Order Items ({totalItems})
                    </div>
                    <span className="text-base flex items-center font-bold">
                      <IndianRupee className="h-5 w-5" />
                      {subtotal}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 flex-1 flex flex-col">
                  {orderItems.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center max-w-xs">
                        <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No Items Added</h3>
                        <p className="text-sm text-muted-foreground">
                          Start adding items to create an order
                        </p>
                      </div>
                    </div>
                  ) : (
                    <ScrollArea className="flex-1 pr-4 -mr-4">
                      {/* Feature #3: Smart KOT Grouping */}
                      <div className="space-y-4">
                        {Object.entries(groupedItems).map(([station, items]) => {
                          const stationInfo = COOKING_STATIONS[station as keyof typeof COOKING_STATIONS];
                          const isExpanded = expandedGroups.has(station);
                          const StationIcon = stationInfo?.icon || Package;

                          return (
                            <Collapsible
                              key={station}
                              open={isExpanded}
                              onOpenChange={(open) => {
                                const newExpanded = new Set(expandedGroups);
                                if (open) {
                                  newExpanded.add(station);
                                } else {
                                  newExpanded.delete(station);
                                }
                                setExpandedGroups(newExpanded);
                              }}
                            >
                              <Card className="border-2">
                                <CollapsibleTrigger asChild>
                                  <CardHeader className="pb-3 cursor-pointer hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded ${stationInfo?.color || 'text-gray-600 bg-gray-100'}`}>
                                          <StationIcon className="h-4 w-4" />
                                        </div>
                                        <div>
                                          <p className="text-sm font-semibold">
                                            {stationInfo?.label || station.toUpperCase()}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {items.length} items
                                          </p>
                                        </div>
                                      </div>
                                      <ChevronDown
                                        className={`h-5 w-5 transition-transform ${
                                          isExpanded ? 'rotate-180' : ''
                                        }`}
                                      />
                                    </div>
                                  </CardHeader>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <CardContent className="pt-0">
                                    <div className="space-y-3">
                                      {items.map((item) => (
                                        <div
                                          key={item.id}
                                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                          <div className="flex-1">
                                            <p className="font-medium text-sm">{item.name}</p>
                                            {item.isCombo && (
                                              <Badge className="mt-1 text-xs" variant="outline">
                                                Combo
                                              </Badge>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                              <IndianRupee className="h-3 w-3" />
                                              {item.price} x {item.quantity}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 border rounded-lg">
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => updateItemQuantity(item.id, -1)}
                                                className="h-8 w-8 p-0"
                                              >
                                                <Minus className="h-3 w-3" />
                                              </Button>
                                              <span className="text-sm font-semibold w-8 text-center">
                                                {item.quantity}
                                              </span>
                                              <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => updateItemQuantity(item.id, 1)}
                                                className="h-8 w-8 p-0"
                                              >
                                                <Plus className="h-3 w-3" />
                                              </Button>
                                            </div>
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              onClick={() => removeItemFromOrder(item.id)}
                                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </CollapsibleContent>
                              </Card>
                            </Collapsible>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  )}

                  {/* Feature #5: Drag Gesture Hint */}
                  {orderItems.length > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
                      <p className="text-xs text-blue-900">
                        💡 Swipe right to advance status, left to cancel
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Feature #9: Sticky Bottom Action Bar - Order Flow Restriction */}
          <div className="sticky bottom-0 z-20 bg-white border-t-2 border-[#8B5E34]/20 px-8 py-4 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <Button
                variant="outline"
                size="lg"
                onClick={handleCancelOrder}
                className="h-12 px-6 border-2"
              >
                <Ban className="h-5 w-5 mr-2" />
                Cancel
              </Button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-[#8B5E34] flex items-center justify-center">
                  <IndianRupee className="h-6 w-6" />
                  {subtotal}
                </p>
              </div>

              <Button
                size="lg"
                onClick={handleCreateOrder}
                disabled={!isOrderValid}
                className={`h-12 px-8 text-base font-semibold ${
                  isOrderValid
                    ? 'bg-[#8B5E34] hover:bg-[#8B5E34]/90'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <CheckCircle className="h-5 w-5 mr-2" />
                Create Order
                {!isOrderValid && (
                  <span className="ml-2 text-xs">
                    ({orderItems.length === 0 ? 'Add items' : 'Select table'})
                  </span>
                )}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Feature #4: Rollback Protection Dialog */}
      <Dialog open={rollbackDialog} onOpenChange={setRollbackDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Moving order to PREPARING. This action will send the order to the kitchen.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm">Would you like to:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setRollbackDialog(false);
                  // Open edit mode
                  toast.info('Edit order', { duration: 2000 });
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Order
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setRollbackDialog(false);
                  handleCancelOrder();
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Order
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setRollbackDialog(false)}
            >
              Go Back
            </Button>
            <Button
              onClick={() => {
                updateOrderStatus('preparing');
                setRollbackDialog(false);
              }}
              className="bg-[#8B5E34] hover:bg-[#8B5E34]/90"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Continue to Preparing
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
