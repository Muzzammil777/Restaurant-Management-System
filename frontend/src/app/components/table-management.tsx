import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/app/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { 
  Plus, Edit, Trash2, Users, UtensilsCrossed, CheckCircle, Clock
} from 'lucide-react';
import { toast } from 'sonner';

// Types
type TableStatus = 'available' | 'occupied' | 'reserved';

interface TableData {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  location: string;
}

// Initial mock tables
const initialMockTables: TableData[] = [
  { id: 't1', name: 'T-01', capacity: 2, status: 'available', location: 'Main Hall' },
  { id: 't2', name: 'T-02', capacity: 4, status: 'available', location: 'Main Hall' },
  { id: 't3', name: 'T-03', capacity: 4, status: 'occupied', location: 'Main Hall' },
  { id: 't4', name: 'T-04', capacity: 6, status: 'available', location: 'Private Room' },
  { id: 't5', name: 'T-05', capacity: 2, status: 'reserved', location: 'Window Side' },
  { id: 't6', name: 'T-06', capacity: 4, status: 'available', location: 'Main Hall' },
  { id: 't7', name: 'T-07', capacity: 8, status: 'available', location: 'Private Room' },
  { id: 't8', name: 'T-08', capacity: 2, status: 'occupied', location: 'Window Side' },
];

export function TableManagement() {
  const [tables, setTables] = useState<TableData[]>(initialMockTables);
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    status: 'available' as TableStatus,
    location: '',
  });

  // Get statistics
  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
  };

  // Filter tables
  const filteredTables = filterStatus === 'all' 
    ? tables 
    : tables.filter(t => t.status === filterStatus);

  // Handle add table
  const handleAddTable = () => {
    if (!formData.name || !formData.capacity || !formData.location) {
      toast.error('Please fill all fields');
      return;
    }

    const newTable: TableData = {
      id: `t${Date.now()}`,
      name: formData.name,
      capacity: parseInt(formData.capacity),
      status: formData.status,
      location: formData.location,
    };

    setTables([...tables, newTable]);
    toast.success('Table added successfully');
    setIsAddDialogOpen(false);
    resetForm();
  };

  // Handle edit table
  const handleEditTable = () => {
    if (!selectedTable || !formData.name || !formData.capacity || !formData.location) {
      toast.error('Please fill all fields');
      return;
    }

    setTables(tables.map(table => 
      table.id === selectedTable.id 
        ? {
            ...table,
            name: formData.name,
            capacity: parseInt(formData.capacity),
            status: formData.status,
            location: formData.location,
          }
        : table
    ));

    toast.success('Table updated successfully');
    setIsEditDialogOpen(false);
    resetForm();
    setSelectedTable(null);
  };

  // Handle delete table
  const handleDeleteTable = (tableId: string) => {
    setTables(tables.filter(table => table.id !== tableId));
    toast.success('Table deleted successfully');
  };

  // Open edit dialog
  const openEditDialog = (table: TableData) => {
    setSelectedTable(table);
    setFormData({
      name: table.name,
      capacity: table.capacity.toString(),
      status: table.status,
      location: table.location,
    });
    setIsEditDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      capacity: '',
      status: 'available',
      location: '',
    });
  };

  // Get status badge variant
  const getStatusBadge = (status: TableStatus) => {
    switch (status) {
      case 'available':
        return <Badge className="bg-green-500 hover:bg-green-600">Available</Badge>;
      case 'occupied':
        return <Badge className="bg-red-500 hover:bg-red-600">Occupied</Badge>;
      case 'reserved':
        return <Badge className="bg-orange-500 hover:bg-orange-600">Reserved</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Table Management</h1>
              <p className="text-gray-600 mt-1">Manage restaurant tables and seating arrangements</p>
            </div>
            <Button 
              onClick={() => {
                resetForm();
                setIsAddDialogOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Table
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="container mx-auto px-6 py-6">
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card className="bg-white shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                Total Tables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 shadow-md border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Available
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.available}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100 shadow-md border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-700 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Occupied
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.occupied}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 shadow-md border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-700 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Reserved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{stats.reserved}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tables List */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tables List</CardTitle>
                <CardDescription>View and manage all restaurant tables</CardDescription>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tables</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTables.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No tables found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTables.map((table) => (
                    <TableRow key={table.id}>
                      <TableCell className="font-medium">{table.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          {table.capacity}
                        </div>
                      </TableCell>
                      <TableCell>{table.location}</TableCell>
                      <TableCell>{getStatusBadge(table.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(table)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTable(table.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
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
      </div>

      {/* Add Table Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
            <DialogDescription>Create a new table for your restaurant</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Table Name</Label>
              <Input
                id="name"
                placeholder="e.g., T-01"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="e.g., 4"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Main Hall"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value as TableStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTable}>Add Table</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Table Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Table</DialogTitle>
            <DialogDescription>Update table information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Table Name</Label>
              <Input
                id="edit-name"
                placeholder="e.g., T-01"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-capacity">Capacity</Label>
              <Input
                id="edit-capacity"
                type="number"
                placeholder="e.g., 4"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                placeholder="e.g., Main Hall"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value as TableStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTable}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
