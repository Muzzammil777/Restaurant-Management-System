import { useState, useEffect, useMemo } from 'react';
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
  History, 
  Search,
  Filter,
  AlertCircle,
  ChevronRight,
  MoreHorizontal,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

import { cn } from '@/app/components/ui/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/app/components/ui/radio-group';
import { Separator } from '@/app/components/ui/separator';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/app/components/ui/dropdown-menu';

// --- Types ---

interface Order {
  id: string;
  orderNumber: string;
  tableNumber: number;
  customerName: string;
  items: CartItem[];
  totalAmount: number;
  status: 'READY' | 'COMPLETED';
  timestamp: string;
}

interface CartItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  orderId: string;
  customerName: string;
  items: CartItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  paymentMode: 'Cash' | 'Card' | 'UPI' | 'Wallet';
  status: 'Paid' | 'Refunded' | 'Partially Refunded';
}

interface Refund {
  id: string;
  invoiceId: string;
  invoiceNumber: string; // Helper for display
  amount: number;
  type: 'Full' | 'Partial';
  reason: string;
  date: string;
}

// --- Mock Data ---

const MOCK_ORDERS: Order[] = [
  {
    id: 'ord_1',
    orderNumber: 'ORD-001',
    tableNumber: 4,
    customerName: 'Rahul Sharma',
    items: [
      { id: 'i1', name: 'Butter Chicken', quantity: 1, price: 320 },
      { id: 'i2', name: 'Garlic Naan', quantity: 2, price: 60 }
    ],
    totalAmount: 440,
    status: 'READY',
    timestamp: new Date().toISOString()
  },
  {
    id: 'ord_2',
    orderNumber: 'ORD-002',
    tableNumber: 7,
    customerName: 'Priya Patel',
    items: [
      { id: 'i3', name: 'Masala Dosa', quantity: 2, price: 120 },
      { id: 'i4', name: 'Filter Coffee', quantity: 2, price: 40 }
    ],
    totalAmount: 320,
    status: 'COMPLETED',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'ord_3',
    orderNumber: 'ORD-003',
    tableNumber: 2,
    customerName: 'Amit Singh',
    items: [
      { id: 'i5', name: 'Veg Biryani', quantity: 1, price: 250 },
      { id: 'i6', name: 'Raita', quantity: 1, price: 50 }
    ],
    totalAmount: 300,
    status: 'READY',
    timestamp: new Date(Date.now() - 1800000).toISOString()
  }
];

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv_1',
    invoiceNumber: 'INV-2026-001',
    date: new Date(Date.now() - 86400000).toISOString(),
    orderId: 'ORD-000',
    customerName: 'John Doe',
    items: [{ id: 'i0', name: 'Pasta Alfredo', quantity: 1, price: 350 }],
    subtotal: 350,
    taxAmount: 17.5,
    discountAmount: 0,
    grandTotal: 367.5,
    paymentMode: 'Card',
    status: 'Paid'
  }
];

const MOCK_REFUNDS: Refund[] = [];

// --- Component ---

export function BillingPayment() {
  const [activeTab, setActiveTab] = useState('generate');
  
  // State
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [refunds, setRefunds] = useState<Refund[]>(MOCK_REFUNDS);

  // Handlers
  const handleInvoiceGenerated = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
    // Remove order from ready list if needed, or just keep it for history
    setOrders(prev => prev.filter(o => o.orderNumber !== invoice.orderId));
  };

  const handleRefundProcessed = (refund: Refund) => {
    setRefunds(prev => [refund, ...prev]);
    // Update invoice status
    setInvoices(prev => prev.map(inv => {
      if (inv.id === refund.invoiceId) {
        return {
          ...inv,
          status: refund.type === 'Full' ? 'Refunded' : 'Partially Refunded'
        };
      }
      return inv;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-[1600px] mx-auto p-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Billing & Payment</h1>
            <p className="text-muted-foreground mt-1">Admin Dashboard / Billing Module</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="w-full overflow-x-auto pb-4">
          <nav className="flex gap-3 min-w-max p-1">
            {[
              { id: 'generate', label: 'Bill Generation', icon: Calculator, description: 'Create new bills' },
              { id: 'invoices', label: 'Invoices', icon: FileText, description: 'Billing history' },
              { id: 'refunds', label: 'Refunds', icon: RotateCcw, description: 'Process returns' },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg transition-colors text-left min-w-[220px]',
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* TabsList removed and replaced by horizontal nav above */}

          <TabsContent value="generate" className="mt-0 outline-none">
            <BillGenerationTab orders={orders} onInvoiceGenerated={handleInvoiceGenerated} />
          </TabsContent>

          <TabsContent value="invoices" className="mt-0 outline-none">
            <InvoicesTab invoices={invoices} />
          </TabsContent>

          <TabsContent value="refunds" className="mt-0 outline-none">
            <RefundsTab invoices={invoices} refunds={refunds} onRefundProcessed={handleRefundProcessed} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// --- Tab Components ---

function BillGenerationTab({ orders, onInvoiceGenerated }: { orders: Order[], onInvoiceGenerated: (inv: Invoice) => void }) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Calculation State
  const [taxPercent, setTaxPercent] = useState(5);
  const [discountValue, setDiscountValue] = useState(0);
  const [discountType, setDiscountType] = useState<'percent' | 'flat'>('percent');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Card' | 'UPI' | 'Wallet'>('Cash');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generatedInvoice, setGeneratedInvoice] = useState<Invoice | null>(null);

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => 
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.tableNumber.toString().includes(searchTerm)
    );
  }, [orders, searchTerm]);

  // Derived Totals
  const totals = useMemo(() => {
    if (!selectedOrder) return { subtotal: 0, tax: 0, discount: 0, total: 0 };
    
    const subtotal = selectedOrder.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = (subtotal * taxPercent) / 100;
    
    let discount = 0;
    if (discountType === 'percent') {
      discount = (subtotal * discountValue) / 100;
    } else {
      discount = discountValue;
    }

    // Ensure discount doesn't exceed total
    discount = Math.min(discount, subtotal + tax);

    return {
      subtotal,
      tax,
      discount,
      total: subtotal + tax - discount
    };
  }, [selectedOrder, taxPercent, discountValue, discountType]);

  const handlePayment = () => {
    if (!selectedOrder) return;
    
    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
      date: new Date().toISOString(),
      orderId: selectedOrder.orderNumber,
      customerName: selectedOrder.customerName,
      items: selectedOrder.items,
      subtotal: totals.subtotal,
      taxAmount: totals.tax,
      discountAmount: totals.discount,
      grandTotal: totals.total,
      paymentMode,
      status: 'Paid'
    };

    setGeneratedInvoice(newInvoice);
    setPreviewOpen(true);
    onInvoiceGenerated(newInvoice);
    toast.success("Payment successful! Invoice created.");
    
    // Reset
    setSelectedOrder(null);
    setDiscountValue(0);
    setTaxPercent(5);
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
      
      {/* Left Panel: Order Selection */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <Card className="flex-1 flex flex-col border-none shadow-md overflow-hidden">
          <CardHeader className="pb-3 bg-white border-b sticky top-0 z-10">
            <CardTitle>Select Order</CardTitle>
            <div className="relative mt-2">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search Table or Order ID..." 
                className="pl-9 bg-gray-50 border-gray-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0 bg-gray-50/50">
             <div className="p-3 space-y-3">
               {filteredOrders.map(order => (
                 <motion.div 
                   key={order.id} 
                   whileHover={{ scale: 1.01 }}
                   onClick={() => setSelectedOrder(order)}
                   className={`p-4 rounded-xl border cursor-pointer transition-all ${
                     selectedOrder?.id === order.id 
                       ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20' 
                       : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm'
                   }`}
                 >
                   <div className="flex justify-between items-start mb-2">
                     <div className="flex items-center gap-2">
                       <Badge variant={selectedOrder?.id === order.id ? 'default' : 'secondary'} className="rounded-md">
                         Table {order.tableNumber}
                       </Badge>
                       <span className="text-xs font-mono text-muted-foreground">{order.orderNumber}</span>
                     </div>
                     <Badge variant="outline" className={`text-[10px] ${order.status === 'READY' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                       {order.status}
                     </Badge>
                   </div>
                   <div className="flex justify-between items-end">
                     <div>
                       <p className="font-semibold text-gray-900">{order.customerName}</p>
                       <p className="text-xs text-muted-foreground">{order.items.length} Items</p>
                     </div>
                     <p className="font-bold text-lg">₹{order.totalAmount}</p>
                   </div>
                 </motion.div>
               ))}
               {filteredOrders.length === 0 && (
                 <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                   <Receipt className="h-10 w-10 mb-2 opacity-20" />
                   <p>No orders found.</p>
                 </div>
               )}
             </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel: Bill Summary & Payment */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <Card className="flex-1 flex flex-col border-none shadow-md overflow-hidden bg-white">
          {selectedOrder ? (
            <>
              <CardHeader className="border-b pb-4">
                <div className="flex justify-between items-center">
                   <div>
                     <CardTitle>Bill Summary</CardTitle>
                     <CardDescription>Order {selectedOrder.orderNumber} • Table {selectedOrder.tableNumber}</CardDescription>
                   </div>
                   <div className="text-right">
                     <p className="text-sm text-muted-foreground">Customer</p>
                     <p className="font-medium">{selectedOrder.customerName}</p>
                   </div>
                </div>
              </CardHeader>
              
              <div className="flex-1 grid md:grid-cols-2 divide-x">
                {/* Item List */}
                <div className="p-0 flex flex-col h-full bg-gray-50/30">
                  <ScrollArea className="flex-1 p-6">
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-start text-sm">
                          <div className="flex gap-3">
                            <span className="bg-gray-100 h-6 w-6 rounded flex items-center justify-center text-xs font-bold text-gray-600">
                              {item.quantity}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-muted-foreground">₹{item.price} each</p>
                            </div>
                          </div>
                          <p className="font-semibold">₹{item.price * item.quantity}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Totals & Payment */}
                <div className="p-6 flex flex-col bg-white">
                  <div className="space-y-4 flex-1">
                    {/* Controls */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Tax (GST %)</Label>
                        <div className="relative">
                           <Input 
                             type="number" 
                             value={taxPercent} 
                             onChange={(e) => setTaxPercent(Number(e.target.value))}
                             className="h-9 pr-8 text-right font-mono"
                           />
                           <span className="absolute right-3 top-2 text-xs text-muted-foreground">%</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Discount</Label>
                        <div className="flex gap-2">
                           <Select value={discountType} onValueChange={(v: any) => setDiscountType(v)}>
                             <SelectTrigger className="h-9 w-[70px]">
                               <SelectValue />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="percent">%</SelectItem>
                               <SelectItem value="flat">₹</SelectItem>
                             </SelectContent>
                           </Select>
                           <Input 
                             type="number" 
                             value={discountValue} 
                             onChange={(e) => setDiscountValue(Number(e.target.value))}
                             className="h-9 text-right font-mono flex-1"
                           />
                        </div>
                      </div>
                    </div>

                    <Separator className="my-2" />

                    {/* Breakdown */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span>
                        <span>₹{totals.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Tax ({taxPercent}%)</span>
                        <span>+ ₹{totals.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>Discount</span>
                        <span>- ₹{totals.discount.toFixed(2)}</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">Total Payable</span>
                        <span className="font-bold text-2xl text-primary">₹{totals.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="mt-8 space-y-4">
                    <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Payment Method</Label>
                    <RadioGroup value={paymentMode} onValueChange={(v: any) => setPaymentMode(v)} className="grid grid-cols-2 gap-3">
                       {['Cash', 'Card', 'UPI', 'Wallet'].map((mode) => (
                         <Label
                           key={mode}
                           className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all ${paymentMode === mode ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-gray-200'}`}
                         >
                           <RadioGroupItem value={mode} className="sr-only" />
                           {mode === 'Cash' && <Banknote className="h-5 w-5 mb-1 text-gray-700" />}
                           {mode === 'Card' && <CreditCard className="h-5 w-5 mb-1 text-gray-700" />}
                           {mode === 'UPI' && <Smartphone className="h-5 w-5 mb-1 text-gray-700" />}
                           {mode === 'Wallet' && <Wallet className="h-5 w-5 mb-1 text-gray-700" />}
                           <span className="text-xs font-medium">{mode}</span>
                         </Label>
                       ))}
                    </RadioGroup>

                    <Button className="w-full h-12 text-base shadow-lg shadow-primary/20 mt-4" onClick={handlePayment}>
                      Confirm Payment
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center bg-gray-50/50">
               <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                 <ArrowRight className="h-6 w-6 text-gray-400" />
               </div>
               <h3 className="text-lg font-semibold text-gray-900">No Order Selected</h3>
               <p className="max-w-xs mt-1 text-sm">Select a ready order from the list on the left to generate a bill.</p>
             </div>
          )}
        </Card>
      </div>

      {/* Invoice Preview Modal */}
      {generatedInvoice && (
        <InvoicePreviewModal 
          open={previewOpen} 
          onOpenChange={setPreviewOpen} 
          invoice={generatedInvoice} 
        />
      )}
    </div>
  );
}

function InvoicesTab({ invoices }: { invoices: Invoice[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredInvoices = invoices.filter(inv => 
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle>Invoice History</CardTitle>
            <CardDescription>View and manage all generated invoices.</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                 placeholder="Search Invoices..." 
                 className="pl-9 w-[250px]" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
            <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead>Invoice ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Order Ref</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map(invoice => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono font-medium">{invoice.invoiceNumber}</TableCell>
                  <TableCell className="text-muted-foreground">{format(new Date(invoice.date), 'dd MMM yyyy')}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{invoice.orderId}</TableCell>
                  <TableCell><Badge variant="outline" className="text-xs">{invoice.paymentMode}</Badge></TableCell>
                  <TableCell className="text-right font-bold">₹{invoice.grandTotal.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={
                      invoice.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                      invoice.status === 'Refunded' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setPreviewInvoice(invoice)}>
                          <FileText className="mr-2 h-4 w-4" /> View Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success("Downloading PDF...")}>
                          <Download className="mr-2 h-4 w-4" /> Download PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success("Sent to Printer")}>
                          <Printer className="mr-2 h-4 w-4" /> Print
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {previewInvoice && (
        <InvoicePreviewModal 
          open={!!previewInvoice} 
          onOpenChange={(v) => !v && setPreviewInvoice(null)} 
          invoice={previewInvoice} 
        />
      )}
    </div>
  );
}

function RefundsTab({ invoices, refunds, onRefundProcessed }: { invoices: Invoice[], refunds: Refund[], onRefundProcessed: (r: Refund) => void }) {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [refundType, setRefundType] = useState<'Full' | 'Partial'>('Full');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  const handleProcessRefund = () => {
    if (!selectedInvoice || !amount || !reason) {
      toast.error("Please complete the refund form.");
      return;
    }
    
    const refund: Refund = {
      id: `ref_${Date.now()}`,
      invoiceId: selectedInvoice.id,
      invoiceNumber: selectedInvoice.invoiceNumber,
      amount: Number(amount),
      type: refundType,
      reason,
      date: new Date().toISOString()
    };
    
    onRefundProcessed(refund);
    toast.success("Refund processed successfully.");
    
    // Reset
    setSelectedInvoice(null);
    setAmount('');
    setReason('');
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-200px)] min-h-[600px]">
      {/* Left: Process Refund */}
      <div className="lg:col-span-4">
        <Card className="h-full border-none shadow-md">
          <CardHeader>
            <CardTitle>Process Refund</CardTitle>
            <CardDescription>Issue full or partial refunds for invoices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Select Invoice</Label>
              <Select onValueChange={(val) => {
                const inv = invoices.find(i => i.id === val);
                setSelectedInvoice(inv || null);
                if (inv && refundType === 'Full') setAmount(inv.grandTotal.toString());
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Search Invoice..." />
                </SelectTrigger>
                <SelectContent>
                   {invoices.filter(i => i.status === 'Paid').map(inv => (
                     <SelectItem key={inv.id} value={inv.id}>{inv.invoiceNumber} - ₹{inv.grandTotal}</SelectItem>
                   ))}
                </SelectContent>
              </Select>
            </div>

            {selectedInvoice && (
              <div className="space-y-6 animate-in slide-in-from-top-2">
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800 border border-blue-100">
                   <p className="font-semibold">{selectedInvoice.customerName}</p>
                   <p>Date: {format(new Date(selectedInvoice.date), 'dd MMM yyyy')}</p>
                   <p>Total Paid: ₹{selectedInvoice.grandTotal}</p>
                </div>

                <div className="space-y-2">
                  <Label>Refund Type</Label>
                  <RadioGroup value={refundType} onValueChange={(v: any) => {
                    setRefundType(v);
                    if (v === 'Full' && selectedInvoice) setAmount(selectedInvoice.grandTotal.toString());
                    else setAmount('');
                  }} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Full" id="r-full" />
                      <Label htmlFor="r-full">Full Refund</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Partial" id="r-partial" />
                      <Label htmlFor="r-partial">Partial</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Refund Amount (₹)</Label>
                  <Input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    disabled={refundType === 'Full'}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Reason for Refund</Label>
                  <Input 
                    placeholder="e.g. Wrong item served" 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>

                <Button className="w-full" variant="destructive" onClick={handleProcessRefund}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Process Refund
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right: History */}
      <div className="lg:col-span-8">
        <Card className="h-full border-none shadow-md flex flex-col">
          <CardHeader>
             <CardTitle>Refund History</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0">
             <Table>
               <TableHeader>
                 <TableRow className="bg-gray-50 hover:bg-gray-50">
                   <TableHead>Date</TableHead>
                   <TableHead>Invoice ID</TableHead>
                   <TableHead>Reason</TableHead>
                   <TableHead>Type</TableHead>
                   <TableHead className="text-right">Amount</TableHead>
                 </TableRow>
               </TableHeader>
               <TableBody>
                 {refunds.map(refund => (
                   <TableRow key={refund.id}>
                     <TableCell>{format(new Date(refund.date), 'dd MMM, HH:mm')}</TableCell>
                     <TableCell className="font-mono">{refund.invoiceNumber}</TableCell>
                     <TableCell>{refund.reason}</TableCell>
                     <TableCell><Badge variant="outline">{refund.type}</Badge></TableCell>
                     <TableCell className="text-right text-red-600 font-medium">- ₹{refund.amount}</TableCell>
                   </TableRow>
                 ))}
                 {refunds.length === 0 && (
                   <TableRow>
                     <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                       <History className="h-10 w-10 mx-auto mb-2 opacity-20" />
                       No refunds processed yet.
                     </TableCell>
                   </TableRow>
                 )}
               </TableBody>
             </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Invoice Preview Modal ---

function InvoicePreviewModal({ open, onOpenChange, invoice }: { open: boolean, onOpenChange: (v: boolean) => void, invoice: Invoice }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white">
        <div className="p-6 bg-white">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold uppercase tracking-widest text-gray-900">Restaurant Name</h2>
            <p className="text-xs text-muted-foreground">123, Food Street, Gourmet City</p>
            <p className="text-xs text-muted-foreground">GSTIN: 29ABCDE1234F1Z5</p>
          </div>

          <div className="border-b border-dashed pb-4 mb-4 text-xs space-y-1">
            <div className="flex justify-between">
              <span>Invoice No:</span>
              <span className="font-mono">{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{format(new Date(invoice.date), 'dd/MM/yyyy HH:mm')}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{invoice.customerName}</span>
            </div>
          </div>

          <div className="space-y-2 mb-4">
             {invoice.items.map((item, i) => (
               <div key={i} className="flex justify-between text-sm">
                 <div className="flex gap-2">
                   <span>{item.quantity} x</span>
                   <span>{item.name}</span>
                 </div>
                 <span>₹{item.price * item.quantity}</span>
               </div>
             ))}
          </div>

          <div className="border-t border-dashed pt-4 space-y-1 text-sm">
            <div className="flex justify-between">
               <span>Subtotal</span>
               <span>₹{invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
               <span>Tax</span>
               <span>₹{invoice.taxAmount.toFixed(2)}</span>
            </div>
            {invoice.discountAmount > 0 && (
              <div className="flex justify-between text-xs">
                 <span>Discount</span>
                 <span>-₹{invoice.discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
               <span>Total Paid</span>
               <span>₹{invoice.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-muted-foreground">
             <p>Payment Mode: {invoice.paymentMode}</p>
             <p className="mt-2">Thank you for dining with us!</p>
          </div>
        </div>
        <div className="bg-gray-50 p-4 flex gap-3 border-t">
          <Button className="flex-1" variant="outline" onClick={() => toast.info("Printing Invoice...")}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button className="flex-1" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
