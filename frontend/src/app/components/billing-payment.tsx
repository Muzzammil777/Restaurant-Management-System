import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Separator } from '@/app/components/ui/separator';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { 
  CreditCard, 
  Wallet, 
  Smartphone, 
  Banknote, 
  Receipt, 
  Download, 
  Printer,
  Plus,
  Minus,
  RefreshCcw,
  CheckCircle,
  IndianRupee,
  Calculator,
  ArrowRight,
  FileText,
  History
} from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { USE_MOCK_DATA, mockOrders } from '@/utils/mock-data';

// --- Interfaces ---

interface Order {
  id: string;
  table_number: number;
  customer_name: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: string;
}

interface BillItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  table_number: number;
  items: BillItem[];
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_type: 'flat' | 'percentage';
  discount_value: number;
  discount_amount: number;
  grand_total: number;
  payment_mode: string;
  status: 'paid' | 'refunded' | 'partially_refunded';
  created_at: string;
}

interface Refund {
  id: string;
  invoice_number: string;
  amount: number;
  type: 'full' | 'partial';
  reason: string;
  status: 'processed';
  date: string;
}

// --- Component ---

export function BillingPayment() {
  const [activeTab, setActiveTab] = useState('generate');
  
  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);

  // ... (rest of states)
  
  // Bill Generation State
  const [billStatus, setBillStatus] = useState<'idle' | 'selected' | 'generated'>('idle');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  
  // Calculation State
  const [taxRate, setTaxRate] = useState(5);
  const [discountType, setDiscountType] = useState<'flat' | 'percentage'>('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  
  // Payment State
  const [paymentMode, setPaymentMode] = useState('cash');
  
  // Invoice Preview State
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  // Refund State
  const [refundInvoiceId, setRefundInvoiceId] = useState<string>('');
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [refundAmount, setRefundAmount] = useState<string>('');
  const [refundReason, setRefundReason] = useState('');

  // --- Effects ---

  useEffect(() => {
    fetchOrders();
    fetchInvoices();
  }, []);

  // Update refund amount automatically if full refund is selected
  useEffect(() => {
    if (refundType === 'full' && refundInvoiceId) {
      const invoice = invoices.find(inv => inv.invoice_number === refundInvoiceId);
      if (invoice) {
        setRefundAmount(invoice.grand_total.toString());
      }
    }
  }, [refundType, refundInvoiceId, invoices]);

  // --- Data Fetching ---

  const fetchOrders = async () => {
    if (USE_MOCK_DATA) {
      const transformedOrders = mockOrders.map(o => ({
        id: o.id,
        table_number: o.tableNumber,
        customer_name: o.customerName,
        items: o.items,
        total: o.total,
        status: o.status
      })) as Order[];
      setOrders(transformedOrders);
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d0ba2a2/orders`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        }
      );
      const result = await response.json();
      if (result.success) {
        const completedOrders = result.data.filter((order: any) => 
          order.status === 'completed' || order.status === 'ready' || order.status === 'served'
        ).map((o: any) => ({
          id: o.id,
          table_number: o.tableNumber || 0,
          customer_name: o.customerName || 'Guest',
          items: o.items || [],
          total: o.total || 0,
          status: o.status
        }));
        setOrders(completedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchInvoices = async () => {
    // Mock existing invoices
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        invoice_number: 'INV-2026-0001',
        customer_name: 'Amit Kumar',
        table_number: 5,
        items: [
          { id: '1', name: 'Butter Chicken', quantity: 1, price: 320, total: 320 },
          { id: '2', name: 'Garlic Naan', quantity: 2, price: 50, total: 100 },
        ],
        subtotal: 420,
        tax_rate: 5,
        tax_amount: 21,
        discount_type: 'flat',
        discount_value: 0,
        discount_amount: 0,
        grand_total: 441,
        payment_mode: 'UPI',
        status: 'paid',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    setInvoices(mockInvoices);
  };

  // --- Logic Helpers ---

  const calculateTotals = () => {
    const subtotal = billItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = (subtotal * taxRate) / 100;
    
    let discountAmount = 0;
    if (discountType === 'flat') {
      discountAmount = discountValue;
    } else {
      discountAmount = (subtotal * discountValue) / 100;
    }

    // Ensure discount doesn't exceed total
    const maxDiscount = subtotal + taxAmount;
    discountAmount = Math.min(discountAmount, maxDiscount);

    const grandTotal = Math.max(0, subtotal + taxAmount - discountAmount);
    
    return {
      subtotal,
      taxAmount,
      discountAmount,
      grandTotal,
    };
  };

  // --- Actions ---

  const loadOrderIntoBill = (order: Order) => {
    if (billStatus === 'generated') {
      if (!confirm("A bill is currently generated but not paid. Discard it to load a new order?")) {
        return;
      }
    }
    
    setSelectedOrder(order);
    const items: BillItem[] = order.items.map((item, idx) => ({
      id: `item-${idx}`,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price,
    }));
    setBillItems(items);
    setBillStatus('selected');
    setDiscountValue(0);
    setTaxRate(5);
    toast.success(`Order from Table ${order.table_number} loaded`);
  };

  const updateItemQuantity = (itemId: string, delta: number) => {
    if (billStatus === 'generated') return; // Locked

    setBillItems(items =>
      items.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity + delta);
          return {
            ...item,
            quantity: newQuantity,
            total: newQuantity * item.price,
          };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const generateBill = () => {
    if (billItems.length === 0) {
      toast.error('Cannot generate bill with no items');
      return;
    }
    setBillStatus('generated');
    toast.success('Bill generated! Proceed to payment.');
  };

  const processPayment = () => {
    const totals = calculateTotals();
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(4, '0')}`;

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoice_number: invoiceNumber,
      customer_name: selectedOrder?.customer_name || 'Walk-in Customer',
      table_number: selectedOrder?.table_number || 0,
      items: [...billItems], // Clone items
      subtotal: totals.subtotal,
      tax_rate: taxRate,
      tax_amount: totals.taxAmount,
      discount_type: discountType,
      discount_value: discountValue,
      discount_amount: totals.discountAmount,
      grand_total: totals.grandTotal,
      payment_mode: paymentMode,
      status: 'paid',
      created_at: new Date().toISOString(),
    };

    // 1. Add to invoices
    setInvoices([invoice, ...invoices]);
    
    // 2. Reset bill state
    setBillItems([]);
    setSelectedOrder(null);
    setBillStatus('idle');
    setDiscountValue(0);

    // 3. Show preview/confirmation
    setPreviewInvoice(invoice);
    setShowInvoicePreview(true);
    
    toast.success('Payment successful! Invoice created.');
    
    // 4. Update order status in backend (mock)
    if (selectedOrder) {
      setOrders(orders.filter(o => o.id !== selectedOrder.id));
    }
  };

  const processRefund = () => {
    if (!refundInvoiceId || !refundAmount || !refundReason) {
      toast.error('Please fill all refund details');
      return;
    }

    const amount = parseFloat(refundAmount);
    const invoice = invoices.find(inv => inv.invoice_number === refundInvoiceId);
    
    if (!invoice) return;
    if (amount > invoice.grand_total) {
      toast.error('Refund amount cannot exceed invoice total');
      return;
    }

    // Update invoice status
    const updatedInvoices = invoices.map(inv => {
      if (inv.invoice_number === refundInvoiceId) {
        return {
          ...inv,
          status: (amount === inv.grand_total ? 'refunded' : 'partially_refunded') as any
        };
      }
      return inv;
    });
    setInvoices(updatedInvoices);

    // Add to refund history
    const newRefund: Refund = {
      id: Date.now().toString(),
      invoice_number: refundInvoiceId,
      amount: amount,
      type: refundType,
      reason: refundReason,
      status: 'processed',
      date: new Date().toISOString()
    };
    setRefunds([newRefund, ...refunds]);

    // Reset form
    setRefundInvoiceId('');
    setRefundAmount('');
    setRefundReason('');
    
    toast.success('Refund processed successfully');
  };

  const downloadInvoice = (invoice: Invoice) => {
    toast.success(`Downloading Invoice ${invoice.invoice_number}...`);
    // Logic for PDF download would go here
  };

  const printInvoice = (invoice: Invoice) => {
    toast.success(`Printing Invoice ${invoice.invoice_number}...`);
    // Logic for printing would go here
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto p-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Billing & Payment</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Generate bills, process payments, and manage invoices
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchOrders} variant="outline" size="sm">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Refresh Orders
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
          <TabsTrigger value="generate">Bill Generation</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="refunds">Refunds</TabsTrigger>
        </TabsList>

        {/* --- Tab 1: Bill Generation --- */}
        <TabsContent value="generate" className="space-y-6 mt-6">
          <div className="grid lg:grid-cols-12 gap-6">
            
            {/* Left Column: Order Selection */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-muted-foreground" />
                    Select Order
                  </CardTitle>
                  <CardDescription>Choose a ready order to bill</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full px-6 pb-6">
                    <div className="space-y-3 pt-2">
                      {orders.map(order => (
                        <div
                          key={order.id}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                            selectedOrder?.id === order.id 
                              ? 'border-primary bg-primary/5 ring-1 ring-primary/20' 
                              : 'border-muted bg-card hover:border-primary/50'
                          }`}
                          onClick={() => loadOrderIntoBill(order)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant={selectedOrder?.id === order.id ? "default" : "secondary"}>
                              Table {order.table_number}
                            </Badge>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              {order.status}
                            </span>
                          </div>
                          <div className="font-medium truncate">{order.customer_name}</div>
                          <div className="flex justify-between items-center mt-3 text-sm">
                            <span className="text-muted-foreground">{order.items.length} Items</span>
                            <span className="font-bold text-primary">₹{order.total}</span>
                          </div>
                        </div>
                      ))}
                      {orders.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-center">
                          <CheckCircle className="h-10 w-10 mb-3 opacity-20" />
                          <p>No completed orders pending billing</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Billing & Payment */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3 border-b">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Billing Details</CardTitle>
                      <CardDescription>
                        {selectedOrder 
                          ? `Processing bill for Table ${selectedOrder.table_number}` 
                          : 'Select an order to view details'}
                      </CardDescription>
                    </div>
                    {billStatus === 'generated' && (
                       <Badge className="bg-green-600 hover:bg-green-700 animate-pulse">Bill Generated</Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-0">
                  <div className="grid md:grid-cols-2 h-full divide-x">
                    
                    {/* Bill Items List */}
                    <div className="p-6 flex flex-col h-full">
                      <ScrollArea className="flex-1 pr-4 max-h-[400px]">
                        {billItems.length > 0 ? (
                          <div className="space-y-4">
                            {billItems.map(item => (
                              <div key={item.id} className="flex justify-between items-start group">
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{item.name}</div>
                                  <div className="text-xs text-muted-foreground">₹{item.price} x {item.quantity}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {billStatus === 'selected' && (
                                    <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5">
                                      <Button
                                        size="icon" variant="ghost" className="h-6 w-6"
                                        onClick={() => updateItemQuantity(item.id, -1)}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="w-4 text-center text-xs font-medium">{item.quantity}</span>
                                      <Button
                                        size="icon" variant="ghost" className="h-6 w-6"
                                        onClick={() => updateItemQuantity(item.id, 1)}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  )}
                                  <div className="text-sm font-semibold w-16 text-right">₹{item.total}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                            <Calculator className="h-12 w-12 mb-2" />
                            <p>Bill items will appear here</p>
                          </div>
                        )}
                      </ScrollArea>
                    </div>

                    {/* Calculation & Payment Section */}
                    <div className="p-6 bg-muted/30 flex flex-col">
                      <div className="space-y-4 flex-1">
                        
                        {/* Summary */}
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₹{totals.subtotal.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-1">
                              GST <span className="text-xs bg-muted px-1 rounded">{taxRate}%</span>
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {billStatus === 'selected' ? (
                                <Select value={taxRate.toString()} onValueChange={(v) => setTaxRate(Number(v))}>
                                  <SelectTrigger className="h-6 w-16 text-xs">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="5">5%</SelectItem>
                                    <SelectItem value="12">12%</SelectItem>
                                    <SelectItem value="18">18%</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                `₹${totals.taxAmount.toFixed(2)}`
                              )}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                             <span className="text-muted-foreground">Discount</span>
                             <div className="flex items-center gap-2">
                               {billStatus === 'selected' && (
                                 <>
                                  <Select value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
                                    <SelectTrigger className="h-6 w-12 text-xs p-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="percentage">%</SelectItem>
                                      <SelectItem value="flat">₹</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input 
                                    className="h-6 w-16 text-xs text-right" 
                                    type="number" 
                                    value={discountValue} 
                                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                                  />
                                 </>
                               )}
                               <span className="text-green-600 font-medium">-₹{totals.discountAmount.toFixed(2)}</span>
                             </div>
                          </div>

                          <Separator className="my-2" />
                          <div className="flex justify-between text-lg font-bold">
                            <span>Total Payable</span>
                            <span>₹{totals.grandTotal.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Payment Mode (Only visible if generated) */}
                        {billStatus === 'generated' && (
                          <div className="pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <Label className="text-xs uppercase text-muted-foreground tracking-wider mb-3 block">Select Payment Mode</Label>
                            <RadioGroup value={paymentMode} onValueChange={setPaymentMode} className="grid grid-cols-2 gap-2">
                              {['cash', 'card', 'upi', 'wallet'].map((mode) => (
                                <Label
                                  key={mode}
                                  htmlFor={mode}
                                  className={`flex flex-col items-center justify-center p-3 border rounded-lg cursor-pointer transition-all hover:bg-accent ${
                                    paymentMode === mode ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary' : 'border-input'
                                  }`}
                                >
                                  <RadioGroupItem value={mode} id={mode} className="sr-only" />
                                  {mode === 'cash' && <Banknote className="h-5 w-5 mb-1" />}
                                  {mode === 'card' && <CreditCard className="h-5 w-5 mb-1" />}
                                  {mode === 'upi' && <Smartphone className="h-5 w-5 mb-1" />}
                                  {mode === 'wallet' && <Wallet className="h-5 w-5 mb-1" />}
                                  <span className="text-xs font-medium capitalize">{mode}</span>
                                </Label>
                              ))}
                            </RadioGroup>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="pt-6 mt-auto">
                        {billStatus === 'selected' ? (
                          <Button className="w-full" size="lg" onClick={generateBill}>
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Bill
                          </Button>
                        ) : billStatus === 'generated' ? (
                          <Button className="w-full" size="lg" onClick={processPayment} variant="default">
                            Confirm Payment & Create Invoice
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        ) : (
                          <Button className="w-full" disabled variant="secondary">
                            Select an Order to Start
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* --- Tab 2: Invoices --- */}
        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice History</CardTitle>
              <CardDescription>View, download and print past invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No.</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map(invoice => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium font-mono">{invoice.invoice_number}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{invoice.customer_name}</span>
                          <span className="text-xs text-muted-foreground">Table {invoice.table_number}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(invoice.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase text-xs">{invoice.payment_mode}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ₹{invoice.grand_total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'} className="capitalize">
                          {invoice.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="icon" variant="ghost" className="h-8 w-8"
                            onClick={() => {
                              setPreviewInvoice(invoice);
                              setShowInvoicePreview(true);
                            }}
                          >
                            <Receipt className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => downloadInvoice(invoice)}>
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {invoices.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                        No invoices generated yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- Tab 3: Refunds --- */}
        <TabsContent value="refunds" className="space-y-4">
          <div className="grid md:grid-cols-12 gap-6">
            <div className="md:col-span-4">
              <Card>
                <CardHeader>
                  <CardTitle>Process Refund</CardTitle>
                  <CardDescription>Issue full or partial refunds</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Invoice</Label>
                    <Select value={refundInvoiceId} onValueChange={setRefundInvoiceId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Search invoice..." />
                      </SelectTrigger>
                      <SelectContent>
                        {invoices.filter(i => i.status === 'paid').map(invoice => (
                          <SelectItem key={invoice.invoice_number} value={invoice.invoice_number}>
                            {invoice.invoice_number} (₹{invoice.grand_total})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Refund Type</Label>
                    <RadioGroup 
                      value={refundType} 
                      onValueChange={(v: 'full' | 'partial') => setRefundType(v)} 
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="full" id="r-full" />
                        <Label htmlFor="r-full">Full Refund</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="partial" id="r-partial" />
                        <Label htmlFor="r-partial">Partial</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label>Refund Amount (₹)</Label>
                    <Input 
                      type="number" 
                      value={refundAmount} 
                      onChange={(e) => setRefundAmount(e.target.value)}
                      disabled={refundType === 'full'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Input 
                      placeholder="e.g., Wrong item served, Customer complaint" 
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                    />
                  </div>

                  <Button className="w-full" onClick={processRefund} disabled={!refundInvoiceId}>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Process Refund
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-8">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Refund History</CardTitle>
                  <CardDescription>Log of all processed refunds</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Invoice</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {refunds.map(refund => (
                        <TableRow key={refund.id}>
                          <TableCell className="text-sm">{new Date(refund.date).toLocaleDateString()}</TableCell>
                          <TableCell className="font-mono">{refund.invoice_number}</TableCell>
                          <TableCell>{refund.reason}</TableCell>
                          <TableCell className="capitalize">{refund.type}</TableCell>
                          <TableCell className="text-right font-medium text-destructive">-₹{refund.amount}</TableCell>
                        </TableRow>
                      ))}
                      {refunds.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                            <History className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            No refunds processed yet
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Invoice Preview Dialog */}
      <Dialog open={showInvoicePreview} onOpenChange={setShowInvoicePreview}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Invoice Created Successfully</DialogTitle>
            <DialogDescription>
              Invoice {previewInvoice?.invoice_number} has been generated.
            </DialogDescription>
          </DialogHeader>
          
          {previewInvoice && (
            <div className="space-y-6 py-2">
              <div className="bg-muted/30 p-6 rounded-lg border text-sm space-y-4">
                <div className="flex justify-between items-start border-b pb-4">
                  <div>
                    <h3 className="font-bold text-lg">Movicloud Bistro</h3>
                    <p className="text-muted-foreground">123 Food Street, Tech Park</p>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-medium">{previewInvoice.invoice_number}</div>
                    <div className="text-muted-foreground">{new Date(previewInvoice.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between font-medium">
                    <span>Customer</span>
                    <span>{previewInvoice.customer_name}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Payment Mode</span>
                    <span className="capitalize">{previewInvoice.payment_mode}</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  {previewInvoice.items.map(item => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{item.total}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 pt-4 border-t font-medium">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{previewInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax ({previewInvoice.tax_rate}%)</span>
                    <span>₹{previewInvoice.tax_amount.toFixed(2)}</span>
                  </div>
                  {previewInvoice.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-₹{previewInvoice.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total Paid</span>
                    <span>₹{previewInvoice.grand_total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => printInvoice(previewInvoice)} className="flex-1" variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Print Invoice
                </Button>
                <Button onClick={() => setShowInvoicePreview(false)} className="flex-1">
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
