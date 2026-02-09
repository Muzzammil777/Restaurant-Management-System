import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/app/components/ui/dialog';
import { Shield, Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: {
    dashboard: boolean;
    menu: boolean;
    orders: boolean;
    kitchen: boolean;
    tables: boolean;
    inventory: boolean;
    staff: boolean;
    billing: boolean;
    delivery: boolean;
    offers: boolean;
    reports: boolean;
    notifications: boolean;
    settings: boolean;
  };
}

const STORAGE_KEY = 'rms_roles';

const moduleNames = {
  dashboard: 'Dashboard',
  menu: 'Menu Management',
  orders: 'Order Management',
  kitchen: 'Kitchen Display',
  tables: 'Table Management',
  inventory: 'Inventory Management',
  staff: 'Staff Management',
  billing: 'Billing & Payments',
  delivery: 'Delivery Management',
  offers: 'Offers & Loyalty',
  reports: 'Reports & Analytics',
  notifications: 'Notifications',
  settings: 'Settings',
};

export function RoleBasedAccessControl() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
  });

  // Load roles from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setRoles(JSON.parse(stored));
    } else {
      // Initialize with default roles
      const defaultRoles: Role[] = [
        {
          id: '1',
          name: 'Admin',
          description: 'Full system access with all permissions',
          permissions: {
            dashboard: true,
            menu: true,
            orders: true,
            kitchen: true,
            tables: true,
            inventory: true,
            staff: true,
            billing: true,
            delivery: true,
            offers: true,
            reports: true,
            notifications: true,
            settings: true,
          },
        },
        {
          id: '2',
          name: 'Manager',
          description: 'Restaurant operations management with limited settings access',
          permissions: {
            dashboard: true,
            menu: true,
            orders: true,
            kitchen: true,
            tables: true,
            inventory: true,
            staff: true,
            billing: true,
            delivery: true,
            offers: true,
            reports: true,
            notifications: true,
            settings: false,
          },
        },
        {
          id: '3',
          name: 'Chef',
          description: 'Kitchen operations only',
          permissions: {
            dashboard: false,
            menu: true,
            orders: false,
            kitchen: true,
            tables: false,
            inventory: false,
            staff: false,
            billing: false,
            delivery: false,
            offers: false,
            reports: false,
            notifications: true,
            settings: false,
          },
        },
        {
          id: '4',
          name: 'Cashier',
          description: 'Billing and payment operations',
          permissions: {
            dashboard: false,
            menu: false,
            orders: true,
            kitchen: false,
            tables: true,
            inventory: false,
            staff: false,
            billing: true,
            delivery: false,
            offers: true,
            reports: false,
            notifications: true,
            settings: false,
          },
        },
        {
          id: '5',
          name: 'Waiter',
          description: 'Order taking and table management',
          permissions: {
            dashboard: false,
            menu: true,
            orders: true,
            kitchen: false,
            tables: true,
            inventory: false,
            staff: false,
            billing: false,
            delivery: false,
            offers: true,
            reports: false,
            notifications: true,
            settings: false,
          },
        },
      ];
      setRoles(defaultRoles);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultRoles));
    }
  }, []);

  // Save to localStorage whenever roles changes
  useEffect(() => {
    if (roles.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(roles));
    }
  }, [roles]);

  const updatePermission = (roleId: string, permission: keyof Role['permissions']) => {
    setRoles(prev => prev.map(role => {
      if (role.id === roleId) {
        // Prevent modifying Admin role
        if (role.name === 'Admin') {
          toast.error('Cannot modify Admin role permissions');
          return role;
        }
        return {
          ...role,
          permissions: {
            ...role.permissions,
            [permission]: !role.permissions[permission],
          },
        };
      }
      return role;
    }));
    toast.success('Permission updated successfully');
  };

  const handleAddRole = () => {
    if (!newRole.name || !newRole.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const role: Role = {
      id: Date.now().toString(),
      name: newRole.name,
      description: newRole.description,
      permissions: {
        dashboard: false,
        menu: false,
        orders: false,
        kitchen: false,
        tables: false,
        inventory: false,
        staff: false,
        billing: false,
        delivery: false,
        offers: false,
        reports: false,
        notifications: false,
        settings: false,
      },
    };

    setRoles(prev => [...prev, role]);
    toast.success(`Role "${newRole.name}" created successfully!`);
    setNewRole({ name: '', description: '' });
    setIsAddRoleOpen(false);
  };

  const handleEditRole = (role: Role) => {
    if (role.name === 'Admin') {
      toast.error('Cannot edit Admin role');
      return;
    }
    setEditingRole(role);
    setIsEditRoleOpen(true);
  };

  const handleUpdateRole = () => {
    if (!editingRole) return;

    setRoles(prev => prev.map(role => 
      role.id === editingRole.id ? editingRole : role
    ));
    toast.success('Role updated successfully');
    setIsEditRoleOpen(false);
    setEditingRole(null);
  };

  const deleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (role?.name === 'Admin') {
      toast.error('Cannot delete Admin role');
      return;
    }
    
    setRoles(prev => prev.filter(r => r.id !== roleId));
    toast.success('Role deleted successfully');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Role-Based Access Control</CardTitle>
                <CardDescription>Manage user roles and module access permissions</CardDescription>
              </div>
            </div>
            <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Define Custom Role</DialogTitle>
                  <DialogDescription>Establish role with granular permissions</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="role-name">Role Name</Label>
                    <Input
                      id="role-name"
                      value={newRole.name}
                      onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                      placeholder="e.g., Server, Supervisor, Delivery Partner"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role-description">Description</Label>
                    <Input
                      id="role-description"
                      value={newRole.description}
                      onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                      placeholder="Brief description of role responsibilities"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddRoleOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddRole}>Create Role</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {roles.map(role => (
              <Card key={role.id} className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        {role.name === 'Admin' && (
                          <Badge className="bg-purple-500">System Role</Badge>
                        )}
                      </div>
                      <CardDescription className="mt-1">{role.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEditRole(role)}
                        disabled={role.name === 'Admin'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteRole(role.id)}
                        disabled={role.name === 'Admin'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground mb-3">
                      Module Access Permissions
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(role.permissions).map(([key, value]) => (
                        <div 
                          key={key} 
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <Label 
                            htmlFor={`${role.id}-${key}`} 
                            className="cursor-pointer flex-1"
                          >
                            {moduleNames[key as keyof typeof moduleNames]}
                          </Label>
                          <Switch
                            id={`${role.id}-${key}`}
                            checked={value}
                            onCheckedChange={() => updatePermission(role.id, key as keyof Role['permissions'])}
                            disabled={role.name === 'Admin'}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update role name and description</DialogDescription>
          </DialogHeader>
          {editingRole && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role-name">Role Name</Label>
                <Input
                  id="edit-role-name"
                  value={editingRole.name}
                  onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                  placeholder="e.g., Server, Supervisor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-role-description">Description</Label>
                <Input
                  id="edit-role-description"
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({ ...editingRole, description: e.target.value })}
                  placeholder="Brief description of role"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditRoleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRole}>Update Role</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
