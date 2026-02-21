import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { ScrollArea } from '@/app/components/ui/scroll-area';
import { cn } from '@/app/components/ui/utils';
import { LoadingTables } from '@/app/components/ui/loading-spinner';
import {
  Users, Clock, Utensils, Sparkles, CheckCircle, UserPlus,
  AlertCircle, ChefHat, Timer, MapPin, Calendar, X, Coffee, DollarSign,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';
import { tablesApi } from '@/utils/api';
import { staffApi } from '@/utils/api';
import { ordersApi } from '@/utils/api';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type TableStatus = 'Available' | 'Reserved' | 'Occupied' | 'Eating' | 'Cleaning';
type Location = 'VIP' | 'Main Hall' | 'AC Hall';

// ============================================================================
// TABLE CARD COMPONENT
// ============================================================================

interface TableCardProps {
  table: any;
  onClick: () => void;
  waiters: any[];
  onAssignWaiter: (tableId: string, waiterId: string, waiterName: string) => void;
  onCheckout: (tableId: string) => void;
}

function TableCard({ table, onClick, waiters, onAssignWaiter, onCheckout }: TableCardProps) {
  const [cleaningTimeLeft, setCleaningTimeLeft] = useState<number>(0);
  const [isPulsing, setIsPulsing] = useState(false);

  // Cleaning timer countdown
  useEffect(() => {
    if (table.status === 'Cleaning' && table.cleaningEndTime) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((table.cleaningEndTime! - Date.now()) / 1000));
        setCleaningTimeLeft(remaining);
        
        if (remaining === 0) {
          // Auto-reset to Available after timer ends - emit event for parent to handle
          window.dispatchEvent(new CustomEvent('table:reset-status', { 
            detail: { tableId: table.id } 
          }));
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [table.status, table.cleaningEndTime, table.id]);

  // Pulsating effect for "Order Ready"
  useEffect(() => {
    if (table.kitchenStatus === 'Ready') {
      const interval = setInterval(() => {
        setIsPulsing(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setIsPulsing(false);
    }
  }, [table.kitchenStatus]);

  const getStatusColor = () => {
    switch (table.status) {
      case 'Available': return 'bg-green-500';
      case 'Reserved': return 'bg-amber-500';
      case 'Occupied': return 'bg-blue-500';
      case 'Eating': return 'bg-purple-500';
      case 'Cleaning': return 'bg-gray-400';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = () => {
    switch (table.status) {
      case 'Available': return <CheckCircle className="w-4 h-4" />;
      case 'Reserved': return <Calendar className="w-4 h-4" />;
      case 'Occupied': return <Users className="w-4 h-4" />;
      case 'Eating': return <Utensils className="w-4 h-4" />;
      case 'Cleaning': return <Sparkles className="w-4 h-4" />;
      default: return null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get available waiters (not assigned or assigned to this table)
  const availableWaiters = waiters.filter(w => 
    !w.assignedTableId || w.assignedTableId === table.id
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative"
    >
      <Card
        className={cn(
          "cursor-pointer transition-all duration-200 hover:shadow-lg border-2",
          isPulsing && "animate-pulse border-amber-500 shadow-xl"
        )}
        onClick={onClick}
      >
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("w-3 h-3 rounded-full", getStatusColor())} />
              <h3 className="font-bold text-lg">{table.displayNumber}</h3>
            </div>
            <Badge variant="outline" className="gap-1">
              {getStatusIcon()}
              {table.status}
            </Badge>
          </div>

          {/* Capacity & Location */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              <span>{table.capacity} seats</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="text-xs">{table.location}</span>
            </div>
          </div>

          {/* Kitchen Status Badge */}
          {table.kitchenStatus === 'Ready' && table.status === 'Eating' && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-amber-100 border border-amber-500 rounded-lg p-2 flex items-center justify-center gap-2"
            >
              <ChefHat className="w-4 h-4 text-amber-700" />
              <span className="font-bold text-amber-700 text-sm">Order Ready!</span>
            </motion.div>
          )}

          {/* Waiter Assignment */}
          {table.status === 'Occupied' && !table.waiterName && (
            <Select
              onValueChange={(value) => {
                const [waiterId, waiterName] = value.split('|');
                onAssignWaiter(table.id, waiterId, waiterName);
              }}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Assign Waiter" />
              </SelectTrigger>
              <SelectContent>
                {availableWaiters.map((waiter) => (
                  <SelectItem key={waiter.id} value={`${waiter.id}|${waiter.name}`}>
                    {waiter.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {table.waiterName && (
            <div className="flex items-center gap-2 text-sm">
              <UserPlus className="w-3 h-3 text-gray-500" />
              <span className="text-gray-700">{table.waiterName}</span>
            </div>
          )}

          {/* Guest Count */}
          {table.guestCount > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Users className="w-3 h-3 text-gray-500" />
              <span className="text-gray-700">{table.guestCount} guests</span>
            </div>
          )}

          {/* Cleaning Timer */}
          {table.status === 'Cleaning' && (
            <div className="bg-gray-100 rounded-lg p-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Cleaning</span>
              </div>
              <span className="font-mono text-sm font-bold text-gray-800">
                {formatTime(cleaningTimeLeft)}
              </span>
            </div>
          )}

          {/* Checkout Button */}
          {table.status === 'Eating' && (
            <Button
              size="sm"
              className="w-full bg-[#8B5A2B] hover:bg-[#6B4520] text-white"
              onClick={(e) => {
                e.stopPropagation();
                onCheckout(table.id);
              }}
            >
              <DollarSign className="w-4 h-4 mr-1" />
              Checkout
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// RESERVATION CARD COMPONENT (Brown & White Theme)
// ============================================================================

interface ReservationCardProps {
  table: any;
  onCancel: (tableId: string) => void;
}

function ReservationCard({ table, onCancel }: ReservationCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-white border-2 border-stone-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          {/* Table Number */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-stone-800 text-white rounded-lg flex items-center justify-center font-bold text-lg">
              {table.displayNumber}
            </div>
            <div>
              <p className="text-sm text-stone-500">Table • {table.capacity} Seats</p>
              <p className="text-xs text-stone-400">{table.location}</p>
            </div>
          </div>

          {/* Time Slot */}
          {table.reservationSlot && (
            <div className="flex items-center gap-2 text-amber-900">
              <Clock className="w-4 h-4" />
              <span className="font-medium text-sm">{table.reservationSlot}</span>
            </div>
          )}

          {/* Guest Count */}
          <div className="flex items-center gap-2 text-stone-700">
            <Users className="w-4 h-4" />
            <span className="text-sm">{table.guestCount} Guests</span>
          </div>

          {/* Status */}
          <div className="inline-block">
            <span className="text-xs font-medium text-stone-800 bg-stone-100 px-3 py-1 rounded-full border border-stone-300">
              {table.reservationStatus}
            </span>
          </div>
        </div>

        {/* Cancel Button */}
        <Button
          variant="outline"
          size="sm"
          className="border-stone-300 text-stone-700 hover:bg-stone-100 hover:text-stone-900"
          onClick={() => onCancel(table.id)}
        >
          <X className="w-4 h-4 mr-1" />
          Cancel
        </Button>
      </div>
    </motion.div>
  );
}

// ============================================================================
// WALK-IN MODAL COMPONENT
// ============================================================================

interface WalkInModalProps {
  open: boolean;
  onClose: () => void;
  tables: any[];
  onSelectTable: (tableId: string) => void;
  guestCount: number;
}

function WalkInModal({ open, onClose, tables, onSelectTable, guestCount }: WalkInModalProps) {
  // Filter tables by capacity
  const eligibleTables = tables.filter(
    t => t.status === 'Available' && t.capacity >= guestCount
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Table for Walk-In</DialogTitle>
          <DialogDescription>
            {guestCount} guests • Showing tables with capacity ≥ {guestCount}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-96">
          <div className="grid grid-cols-3 gap-3 p-2">
            {eligibleTables.length === 0 ? (
              <div className="col-span-3 text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No available tables for {guestCount} guests</p>
              </div>
            ) : (
              eligibleTables.map((table) => (
                <Card
                  key={table.id}
                  className="cursor-pointer hover:border-[#8B5A2B] hover:shadow-lg transition-all"
                  onClick={() => {
                    onSelectTable(table.id);
                    onClose();
                  }}
                >
                  <CardContent className="p-4 text-center">
                    <h3 className="font-bold text-xl mb-1">{table.displayNumber}</h3>
                    <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                      <Users className="w-3 h-3" />
                      <span>{table.capacity} seats</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{table.location}</p>
                    <p className="text-xs text-gray-400">{table.segment}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function TableManagementComprehensive() {
  const [tables, setTables] = useState<any[]>([]);
  const [waiters, setWaiters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location | 'All'>('All');
  const [walkInModalOpen, setWalkInModalOpen] = useState(false);
  const [walkInGuestCount, setWalkInGuestCount] = useState(2);
  const [activeTab, setActiveTab] = useState('floor');
  
  // Add Table Dialog State
  const [addTableDialogOpen, setAddTableDialogOpen] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  const [newTableLocation, setNewTableLocation] = useState<Location>('Main Hall');
  const [newTableSegment, setNewTableSegment] = useState('Front');
  const [creatingTable, setCreatingTable] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [tablesRes, staffRes] = await Promise.all([
        tablesApi.list(),
        staffApi.list({ role: 'Waiter' })
      ]);
      
      // Transform tables data to match component expectations
      const tablesData = Array.isArray(tablesRes) ? tablesRes : (tablesRes.data || []);
      const transformedTables = tablesData.map((t: any) => ({
        id: t._id || t.id,
        displayNumber: t.tableNumber || t.displayNumber,
        number: t.tableNumber || t.number,
        capacity: t.capacity,
        location: t.location,
        status: t.status || 'Available',
        guestCount: t.currentGuests || 0,
        currentOrderId: t.currentOrderId,
        waiterId: t.assignedWaiterId,
        waiterName: t.assignedWaiterName,
        kitchenStatus: t.kitchenStatus,
        cleaningEndTime: t.cleaningEndTime,
        reservationSlot: t.reservation?.timeSlot,
        reservationStatus: t.reservation?.status,
        reservationType: t.reservation?.type
      }));
      setTables(transformedTables);
      
      // Transform waiters data
      const staffData = Array.isArray(staffRes) ? staffRes : ((staffRes as any).data || []);
      const transformedWaiters = staffData.map((s: any) => ({
        id: s._id || s.id,
        name: s.name,
        assignedTableId: s.assignedTableId
      }));
      setWaiters(transformedWaiters);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignWaiter = async (tableId: string, waiterId: string, waiterName: string) => {
    try {
      await tablesApi.update(tableId, {
        assignedWaiterId: waiterId,
        assignedWaiterName: waiterName
      });
      
      toast.success(`${waiterName} assigned to table`);
      fetchData();
    } catch (error) {
      toast.error('Failed to assign waiter');
    }
  };

  const handleCheckout = async (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return;

    try {
      // Update order to bill_requested
      if (table.currentOrderId) {
        await ordersApi.updateStatus(table.currentOrderId, 'bill_requested');
      }

      toast.success('Checkout initiated - Bill requested');
      fetchData();
    } catch (error) {
      toast.error('Failed to initiate checkout');
    }
  };

  const handleWalkIn = async () => {
    setWalkInModalOpen(true);
  };

  const handleSelectTableForWalkIn = async (tableId: string) => {
    try {
      await tablesApi.updateStatus(tableId, 'Occupied', walkInGuestCount);

      toast.success('Table marked as Occupied');
      fetchData();
    } catch (error) {
      toast.error('Failed to assign table');
    }
  };

  const handleCancelReservation = async (tableId: string) => {
    try {
      await tablesApi.updateStatus(tableId, 'Available');

      toast.success('Reservation cancelled');
      fetchData();
    } catch (error) {
      toast.error('Failed to cancel reservation');
    }
  };

  // Handle creating a new table
  const handleCreateTable = async () => {
    if (!newTableName.trim()) {
      toast.error('Please enter a table name');
      return;
    }
    
    setCreatingTable(true);
    try {
      const tableData = {
        name: newTableName,
        displayNumber: newTableName,
        capacity: newTableCapacity,
        location: newTableLocation,
        segment: newTableSegment,
        status: 'available',
        reservationType: 'None',
        guestCount: 0
      };
      
      await tablesApi.create(tableData);
      
      toast.success(`Table ${newTableName} created successfully`);
      setAddTableDialogOpen(false);
      // Reset form
      setNewTableName('');
      setNewTableCapacity(4);
      setNewTableLocation('Main Hall');
      setNewTableSegment('Front');
      fetchData();
    } catch (error) {
      console.error('Error creating table:', error);
      toast.error('Failed to create table');
    } finally {
      setCreatingTable(false);
    }
  };

  const filteredTables = selectedLocation === 'All'
    ? tables
    : tables.filter(t => t.location === selectedLocation);

  const reservationTables = tables.filter(
    t => t.reservationStatus && !['Cancelled', 'Expired'].includes(t.reservationStatus)
  );

  const groupedTables: Record<string, any[]> = filteredTables.reduce((acc: Record<string, any[]>, table) => {
    const location = table.location || 'Other';
    if (!acc[location as Location]) {
      acc[location as Location] = [];
    }
    acc[location as Location].push(table);
    return acc;
  }, {} as Record<string, any[]>);

  if (loading) {
    return <LoadingTables />;
  }

  return (
    <div className="space-y-6" style={{ backgroundColor: '#FDFCFB' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage restaurant floor</p>
        </div>
        <div className="flex gap-3">
          <Button
            className="bg-[#8B5A2B] hover:bg-[#6B4520] text-white"
            onClick={() => setAddTableDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </Button>
          <Button
            className="bg-[#8B5A2B] hover:bg-[#6B4520] text-white"
            onClick={handleWalkIn}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Walk-In Entry
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white">
          <TabsTrigger value="floor">Floor Plan</TabsTrigger>
          <TabsTrigger value="reservations">Reservations</TabsTrigger>
        </TabsList>

        {/* Floor Plan Tab */}
        <TabsContent value="floor" className="space-y-6">
          {/* Location Filter */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium">Filter by Location:</Label>
              <div className="flex gap-2">
                {(['All', 'VIP', 'Main Hall', 'AC Hall'] as const).map((loc) => (
                  <Button
                    key={loc}
                    variant={selectedLocation === loc ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLocation(loc)}
                    className={cn(
                      selectedLocation === loc && 'bg-[#8B5A2B] text-white hover:bg-[#6B4520]'
                    )}
                  >
                    {loc}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Tables Grid */}
          {Object.entries(groupedTables).map(([location, locationTables]) => (
            <div key={location} className="space-y-3">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#8B5A2B]" />
                {location}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                <AnimatePresence>
                  {locationTables.map((table) => (
                    <TableCard
                      key={table.id}
                      table={table}
                      onClick={() => {}}
                      waiters={waiters}
                      onAssignWaiter={handleAssignWaiter}
                      onCheckout={handleCheckout}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Reservations Tab */}
        <TabsContent value="reservations" className="space-y-4">
          <div className="bg-stone-50 rounded-lg p-6 border border-stone-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-amber-900">Reservation Log</h2>
                <p className="text-stone-600 text-sm mt-1">Upcoming and active bookings</p>
              </div>
              <Badge variant="outline" className="text-stone-800 border-stone-400">
                {reservationTables.length} Active
              </Badge>
            </div>

            <div className="space-y-3">
              {reservationTables.length === 0 ? (
                <div className="text-center py-12 text-stone-500">
                  <Calendar className="w-16 h-16 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No reservations</p>
                  <p className="text-sm text-stone-400 mt-1">All tables are available</p>
                </div>
              ) : (
                <AnimatePresence>
                  {reservationTables.map((table) => (
                    <ReservationCard
                      key={table.id}
                      table={table}
                      onCancel={handleCancelReservation}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Table Dialog */}
      <Dialog open={addTableDialogOpen} onOpenChange={setAddTableDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
            <DialogDescription>
              Create a new table for the restaurant floor
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Table Name */}
            <div className="space-y-2">
              <Label htmlFor="tableName">Table Name / Number</Label>
              <Input
                id="tableName"
                placeholder="e.g., T1, A1, V1"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
              />
            </div>
            
            {/* Capacity */}
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (seats)</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                max={20}
                value={newTableCapacity}
                onChange={(e) => setNewTableCapacity(Number(e.target.value))}
              />
            </div>
            
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Select
                value={newTableLocation}
                onValueChange={(value) => setNewTableLocation(value as Location)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VIP">VIP</SelectItem>
                  <SelectItem value="Main Hall">Main Hall</SelectItem>
                  <SelectItem value="AC Hall">AC Hall</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Segment */}
            <div className="space-y-2">
              <Label htmlFor="segment">Segment</Label>
              <Select
                value={newTableSegment}
                onValueChange={(value) => setNewTableSegment(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Front">Front</SelectItem>
                  <SelectItem value="Middle">Middle</SelectItem>
                  <SelectItem value="Back">Back</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddTableDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateTable}
              disabled={creatingTable || !newTableName.trim()}
              className="bg-[#8B5A2B] hover:bg-[#6B4520] text-white"
            >
              {creatingTable ? 'Creating...' : 'Create Table'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Walk-In Modal */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <Label className="text-sm font-medium">Guest Count:</Label>
          <Input
            type="number"
            min={1}
            max={10}
            value={walkInGuestCount}
            onChange={(e) => setWalkInGuestCount(Number(e.target.value))}
            className="w-24"
          />
        </div>
      </div>

      <WalkInModal
        open={walkInModalOpen}
        onClose={() => setWalkInModalOpen(false)}
        tables={tables}
        onSelectTable={handleSelectTableForWalkIn}
        guestCount={walkInGuestCount}
      />
    </div>
  );
}
