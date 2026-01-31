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
import { Plus, UserPlus, ChefHat, Users as UsersIcon, DollarSign, Trash2, Mail, Phone } from 'lucide-react';
import { projectId, publicAnonKey } from '@/utils/supabase/info';
import { toast } from 'sonner';

interface Staff {
  id: string;
  name: string;
  role: 'chef' | 'waiter' | 'cashier' | 'manager';
  phone?: string;
  email?: string;
  shift?: string;
  createdAt: string;
}

export function StaffManagement() {
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: 'waiter' as Staff['role'],
    phone: '',
    email: '',
    shift: 'morning',
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d0ba2a2/staff`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      if (result.success) {
        setStaffMembers(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch staff');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch staff. Please check your connection.');
      setStaffMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d0ba2a2/staff`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success('Staff member added successfully!');
        fetchStaff();
        setDialogOpen(false);
        setFormData({
          name: '',
          role: 'waiter',
          phone: '',
          email: '',
          shift: 'morning',
        });
      }
    } catch (error) {
      console.error('Error adding staff:', error);
      toast.error('Failed to add staff member');
    }
  };

  const handleDeleteClick = (staff: Staff) => {
    setStaffToDelete(staff);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!staffToDelete) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-3d0ba2a2/staff/${staffToDelete.id.replace('staff:', '')}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        toast.success('Staff member removed successfully!');
        fetchStaff();
        setDeleteDialogOpen(false);
        setStaffToDelete(null);
      } else {
        throw new Error(result.error || 'Failed to delete staff');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast.error('Failed to remove staff member');
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
        return <UserPlus className="h-4 w-4" />;
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
    }
  };

  const groupedStaff = staffMembers.reduce((acc, member) => {
    if (!acc[member.role]) {
      acc[member.role] = [];
    }
    acc[member.role].push(member);
    return acc;
  }, {} as Record<string, Staff[]>);

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
          <p className="text-muted-foreground">Manage your restaurant team members</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-lg shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Staff Member
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Staff Member</DialogTitle>
              <DialogDescription>Add a new team member to your restaurant.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select value={formData.role} onValueChange={(value: Staff['role']) => setFormData({ ...formData, role: value })}>
                    <SelectTrigger className="rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chef">Chef</SelectItem>
                      <SelectItem value="waiter">Waiter</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shift">Shift</Label>
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
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="rounded-lg"
                />
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-lg">
                  Cancel
                </Button>
                <Button type="submit" className="rounded-lg">Add Staff</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Staff Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <ChefHat className="h-4 w-4 text-orange-600" />
              Chefs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{groupedStaff.chef?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <UsersIcon className="h-4 w-4 text-blue-600" />
              Waiters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{groupedStaff.waiter?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <DollarSign className="h-4 w-4 text-emerald-600" />
              Cashiers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{groupedStaff.cashier?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <UserPlus className="h-4 w-4 text-purple-600" />
              Managers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{groupedStaff.manager?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Staff List */}
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
            <Card key={member.id} className="border-border/50 shadow-sm hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{member.name}</CardTitle>
                    {member.shift && (
                      <CardDescription className="mt-1">
                        {member.shift.charAt(0).toUpperCase() + member.shift.slice(1)} Shift
                      </CardDescription>
                    )}
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
                {member.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="break-all">{member.email}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="text-xs text-muted-foreground">
                    Joined {new Date(member.createdAt).toLocaleDateString()}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteClick(member)}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 rounded-lg"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Remove
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
