import { useState, useEffect } from 'react';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from '@/app/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/app/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { 
  Plus, UserPlus, ChefHat, Users as UsersIcon, DollarSign, Trash2, Mail, Phone, 
  Calendar, Clock, TrendingUp, Edit, Power, PowerOff, Eye
} from 'lucide-react';
import { staffApi, shiftsApi, attendanceApi, performanceApi } from '@/utils/api';
import { toast } from 'sonner';

interface Staff {
  _id: string;
  name: string;
  email: string;
  role: 'chef' | 'waiter' | 'cashier' | 'manager' | 'admin' | 'staff';
  phone?: string;
  shift?: string;
  department?: string;
  salary?: number;
  active: boolean;
  createdAt?: string;
  hireDate?: string;
}

interface Shift {
  _id: string;
  staffId: string;
  staffName: string;
  shiftType: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

interface Attendance {
  _id: string;
  staffId: string;
  staffName: string;
  date: string;
  status: string;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
}

interface PerformanceLog {
  _id: string;
  staffId: string;
  staffName: string;
  metric: string;
  value: number;
  period?: string;
  notes?: string;
  createdAt: string;
}

export function StaffManagement() {
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [performanceLogs, setPerformanceLogs] = useState<PerformanceLog[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('staff');
  
  // Staff Dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  
  // Shift Dialog
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  
  // Attendance Dialog
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  
  // Performance Dialog
  const [performanceDialogOpen, setPerformanceDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'waiter' as Staff['role'],
    phone: '',
    shift: 'morning',
    department: '',
    salary: 0,
  });

  const [shiftFormData, setShiftFormData] = useState({
    staffId: '',
    shiftType: 'morning',
    date: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '17:00',
    notes: '',
  });

  const [attendanceFormData, setAttendanceFormData] = useState({
    staffId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    checkIn: '09:00',
    checkOut: '17:00',
    hoursWorked: 8,
    notes: '',
  });

  const [performanceFormData, setPerformanceFormData] = useState({
    staffId: '',
    metric: 'orders_served',
    value: 0,
    period: 'daily',
    notes: '',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStaff(),
        fetchStats(),
        fetchShifts(),
        fetchAttendance(),
        fetchPerformance(),
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const data = await staffApi.list();
      setStaffMembers(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to fetch staff. Please check your connection.');
      setStaffMembers([]);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await staffApi.getStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchShifts = async () => {
    try {
      const data = await shiftsApi.list();
      setShifts(data);
    } catch (error) {
      console.error('Error fetching shifts:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      const data = await attendanceApi.list();
      setAttendance(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const fetchPerformance = async () => {
    try {
      const data = await performanceApi.list();
      setPerformanceLogs(data);
    } catch (error) {
      console.error('Error fetching performance:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingStaff) {
        // Update existing staff
        await staffApi.update(editingStaff._id, {
          name: formData.name,
          role: formData.role,
          phone: formData.phone,
          shift: formData.shift,
          department: formData.department,
          salary: formData.salary,
          ...(formData.password && { password: formData.password }),
        });
        toast.success('Staff member updated successfully!');
      } else {
        // Create new staff
        await staffApi.create({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          phone: formData.phone,
          shift: formData.shift,
          department: formData.department,
          salary: formData.salary,
        });
        toast.success('Staff member added successfully!');
      }
      
      await fetchAllData();
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving staff:', error);
      toast.error(error.message || 'Failed to save staff member');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'waiter',
      phone: '',
      shift: 'morning',
      department: '',
      salary: 0,
    });
    setEditingStaff(null);
  };

  const handleEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({
      name: staff.name,
      email: staff.email,
      password: '',
      role: staff.role,
      phone: staff.phone || '',
      shift: staff.shift || 'morning',
      department: staff.department || '',
      salary: staff.salary || 0,
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (staff: Staff) => {
    setStaffToDelete(staff);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!staffToDelete) return;

    try {
      await staffApi.delete(staffToDelete._id);
      toast.success('Staff member removed successfully!');
      await fetchAllData();
      setDeleteDialogOpen(false);
      setStaffToDelete(null);
    } catch (error: any) {
      console.error('Error deleting staff:', error);
      toast.error(error.message || 'Failed to remove staff member');
    }
  };

  const handleToggleActive = async (staff: Staff) => {
    try {
      if (staff.active) {
        await staffApi.deactivate(staff._id);
        toast.success(`${staff.name} has been deactivated`);
      } else {
        await staffApi.activate(staff._id);
        toast.success(`${staff.name} has been activated`);
      }
      await fetchAllData();
    } catch (error: any) {
      console.error('Error toggling staff status:', error);
      toast.error(error.message || 'Failed to update staff status');
    }
  };

  const handleShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await shiftsApi.create(shiftFormData);
      toast.success('Shift assigned successfully!');
      await fetchShifts();
      setShiftDialogOpen(false);
      setShiftFormData({
        staffId: '',
        shiftType: 'morning',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '17:00',
        notes: '',
      });
    } catch (error: any) {
      console.error('Error creating shift:', error);
      toast.error(error.message || 'Failed to assign shift');
    }
  };

  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await attendanceApi.record(attendanceFormData);
      toast.success('Attendance recorded successfully!');
      await fetchAttendance();
      setAttendanceDialogOpen(false);
      setAttendanceFormData({
        staffId: '',
        date: new Date().toISOString().split('T')[0],
        status: 'present',
        checkIn: '09:00',
        checkOut: '17:00',
        hoursWorked: 8,
        notes: '',
      });
    } catch (error: any) {
      console.error('Error recording attendance:', error);
      toast.error(error.message || 'Failed to record attendance');
    }
  };

  const handlePerformanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await performanceApi.log(performanceFormData);
      toast.success('Performance logged successfully!');
      await fetchPerformance();
      setPerformanceDialogOpen(false);
      setPerformanceFormData({
        staffId: '',
        metric: 'orders_served',
        value: 0,
        period: 'daily',
        notes: '',
      });
    } catch (error: any) {
      console.error('Error logging performance:', error);
      toast.error(error.message || 'Failed to log performance');
    }
  };

  const getRoleIcon = (role: Staff['role']) => {
    switch (role) {
      case 'chef':
        return <ChefHat className="h-4 w-4" />;
      case 'waiter':
        return <UsersIcon className="h-4 w-4" />;
      case 'cashier':
        return <DollarSign className="h-4 w-4" />;
      case 'manager':
      case 'admin':
        return <UserPlus className="h-4 w-4" />;
      default:
        return <UsersIcon className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: Staff['role']) => {
    switch (role) {
      case 'chef':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'waiter':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cashier':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'manager':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'admin':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-500';
      case 'absent':
        return 'bg-red-500';
      case 'late':
        return 'bg-yellow-500';
      case 'half_day':
        return 'bg-orange-500';
      case 'leave':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading staff...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Staff Management</h1>
          <p className="text-muted-foreground">Manage your restaurant team, shifts, attendance & performance</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="rounded-lg shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</DialogTitle>
              <DialogDescription>
                {editingStaff ? 'Update staff member details.' : 'Add a new team member to your restaurant.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter full name"
                    className="rounded-lg"
                    required
                  />
                </div>
                {!editingStaff && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        className="rounded-lg"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Min 8 characters"
                        className="rounded-lg"
                        required
                        minLength={8}
                      />
                    </div>
                  </>
                )}
                {editingStaff && (
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min 8 characters"
                      className="rounded-lg"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={formData.role} onValueChange={(value: Staff['role']) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="chef">Chef</SelectItem>
                      <SelectItem value="waiter">Waiter</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift">Default Shift</Label>
                  <Select value={formData.shift} onValueChange={(value) => setFormData({ ...formData, shift: value })}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning</SelectItem>
                      <SelectItem value="afternoon">Afternoon</SelectItem>
                      <SelectItem value="evening">Evening</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 XXXXX XXXXX"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g., Kitchen, Service"
                    className="rounded-lg"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="salary">Monthly Salary (₹)</Label>
                  <Input
                    id="salary"
                    type="number"
                    value={formData.salary || ''}
                    onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
                    placeholder="Enter salary"
                    className="rounded-lg"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} className="rounded-lg">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-lg">
                  {editingStaff ? 'Update Staff' : 'Add Staff'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <UsersIcon className="h-4 w-4 text-blue-600" />
              Total Staff
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{stats.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.active || 0} active, {stats.inactive || 0} inactive
            </p>
          </CardContent>
        </Card>
        {['chef', 'waiter', 'cashier', 'manager'].map((role) => (
          <Card key={role} className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                {getRoleIcon(role as Staff['role'])}
                {role.charAt(0).toUpperCase() + role.slice(1)}s
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{stats.byRole?.[role] || 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 max-w-xl">
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Staff List Tab */}
        <TabsContent value="staff" className="mt-6">
          {staffMembers.length === 0 ? (
            <Card className="border-border/50 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <UsersIcon className="h-16 w-16 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Staff Members</h3>
                <p className="text-muted-foreground text-center max-w-sm">
                  Get started by adding your first team member to the system.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {staffMembers.map((member) => (
                <Card key={member._id} className={`border-border/50 shadow-sm hover:shadow-md transition-all ${!member.active ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          {member.name}
                          {!member.active && (
                            <Badge variant="secondary" className="text-xs">Inactive</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">{member.email}</CardDescription>
                      </div>
                      <Badge className={`${getRoleColor(member.role)} border`}>
                        <span className="flex items-center gap-1">
                          {getRoleIcon(member.role)}
                          {member.role}
                        </span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {member.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{member.phone}</span>
                      </div>
                    )}
                    {member.shift && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{member.shift.charAt(0).toUpperCase() + member.shift.slice(1)} Shift</span>
                      </div>
                    )}
                    {member.department && (
                      <div className="flex items-center gap-2 text-sm">
                        <UsersIcon className="h-4 w-4 text-muted-foreground" />
                        <span>{member.department}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t gap-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={member.active}
                          onCheckedChange={() => handleToggleActive(member)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {member.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(member)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(member)}
                          className="text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Shifts Tab */}
        <TabsContent value="shifts" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Shift Assignments</h3>
            <Dialog open={shiftDialogOpen} onOpenChange={setShiftDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Shift
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign Shift</DialogTitle>
                  <DialogDescription>Assign a shift to a staff member</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleShiftSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Staff Member *</Label>
                    <Select value={shiftFormData.staffId} onValueChange={(v) => setShiftFormData({...shiftFormData, staffId: v})}>
                      <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                      <SelectContent>
                        {staffMembers.filter(s => s.active).map(s => (
                          <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date *</Label>
                      <Input type="date" value={shiftFormData.date} onChange={(e) => setShiftFormData({...shiftFormData, date: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Shift Type *</Label>
                      <Select value={shiftFormData.shiftType} onValueChange={(v) => setShiftFormData({...shiftFormData, shiftType: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="morning">Morning</SelectItem>
                          <SelectItem value="afternoon">Afternoon</SelectItem>
                          <SelectItem value="evening">Evening</SelectItem>
                          <SelectItem value="night">Night</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Start Time *</Label>
                      <Input type="time" value={shiftFormData.startTime} onChange={(e) => setShiftFormData({...shiftFormData, startTime: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time *</Label>
                      <Input type="time" value={shiftFormData.endTime} onChange={(e) => setShiftFormData({...shiftFormData, endTime: e.target.value})} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input value={shiftFormData.notes} onChange={(e) => setShiftFormData({...shiftFormData, notes: e.target.value})} placeholder="Optional notes" />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShiftDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Assign Shift</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Shift</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shifts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No shifts assigned yet
                    </TableCell>
                  </TableRow>
                ) : (
                  shifts.map(shift => (
                    <TableRow key={shift._id}>
                      <TableCell className="font-medium">{shift.staffName}</TableCell>
                      <TableCell>{shift.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{shift.shiftType}</Badge>
                      </TableCell>
                      <TableCell>{shift.startTime} - {shift.endTime}</TableCell>
                      <TableCell className="text-muted-foreground">{shift.notes || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Attendance Records</h3>
            <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Attendance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record Attendance</DialogTitle>
                  <DialogDescription>Record attendance for a staff member</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAttendanceSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Staff Member *</Label>
                    <Select value={attendanceFormData.staffId} onValueChange={(v) => setAttendanceFormData({...attendanceFormData, staffId: v})}>
                      <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                      <SelectContent>
                        {staffMembers.filter(s => s.active).map(s => (
                          <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date *</Label>
                      <Input type="date" value={attendanceFormData.date} onChange={(e) => setAttendanceFormData({...attendanceFormData, date: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Status *</Label>
                      <Select value={attendanceFormData.status} onValueChange={(v) => setAttendanceFormData({...attendanceFormData, status: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="present">Present</SelectItem>
                          <SelectItem value="absent">Absent</SelectItem>
                          <SelectItem value="late">Late</SelectItem>
                          <SelectItem value="half_day">Half Day</SelectItem>
                          <SelectItem value="leave">Leave</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Check In</Label>
                      <Input type="time" value={attendanceFormData.checkIn} onChange={(e) => setAttendanceFormData({...attendanceFormData, checkIn: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Check Out</Label>
                      <Input type="time" value={attendanceFormData.checkOut} onChange={(e) => setAttendanceFormData({...attendanceFormData, checkOut: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Hours Worked</Label>
                    <Input type="number" step="0.5" value={attendanceFormData.hoursWorked} onChange={(e) => setAttendanceFormData({...attendanceFormData, hoursWorked: parseFloat(e.target.value)})} />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setAttendanceDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Record Attendance</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Hours</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No attendance records yet
                    </TableCell>
                  </TableRow>
                ) : (
                  attendance.map(record => (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">{record.staffName}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                      </TableCell>
                      <TableCell>{record.checkIn || '-'}</TableCell>
                      <TableCell>{record.checkOut || '-'}</TableCell>
                      <TableCell>{record.hoursWorked || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Performance Logs</h3>
            <Dialog open={performanceDialogOpen} onOpenChange={setPerformanceDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Log Performance
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log Performance</DialogTitle>
                  <DialogDescription>Record a performance metric for a staff member</DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePerformanceSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Staff Member *</Label>
                    <Select value={performanceFormData.staffId} onValueChange={(v) => setPerformanceFormData({...performanceFormData, staffId: v})}>
                      <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                      <SelectContent>
                        {staffMembers.filter(s => s.active).map(s => (
                          <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Metric *</Label>
                      <Select value={performanceFormData.metric} onValueChange={(v) => setPerformanceFormData({...performanceFormData, metric: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="orders_served">Orders Served</SelectItem>
                          <SelectItem value="tables_handled">Tables Handled</SelectItem>
                          <SelectItem value="customer_rating">Customer Rating</SelectItem>
                          <SelectItem value="attendance_score">Attendance Score</SelectItem>
                          <SelectItem value="sales_amount">Sales Amount</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Value *</Label>
                      <Input type="number" step="0.1" value={performanceFormData.value} onChange={(e) => setPerformanceFormData({...performanceFormData, value: parseFloat(e.target.value)})} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Period</Label>
                    <Select value={performanceFormData.period} onValueChange={(v) => setPerformanceFormData({...performanceFormData, period: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input value={performanceFormData.notes} onChange={(e) => setPerformanceFormData({...performanceFormData, notes: e.target.value})} placeholder="Optional notes" />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setPerformanceDialogOpen(false)}>Cancel</Button>
                    <Button type="submit">Log Performance</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performanceLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No performance logs yet
                    </TableCell>
                  </TableRow>
                ) : (
                  performanceLogs.map(log => (
                    <TableRow key={log._id}>
                      <TableCell className="font-medium">{log.staffName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.metric.replace(/_/g, ' ')}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{log.value}</TableCell>
                      <TableCell>{log.period || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">{log.notes || '-'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {log.createdAt ? new Date(log.createdAt).toLocaleDateString() : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove <strong>{staffToDelete?.name}</strong> from the staff list? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90 rounded-lg"
            >
              Remove Staff
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
