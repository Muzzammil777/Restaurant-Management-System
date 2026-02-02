import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/app/components/ui/dialog';
import { Shield, Plus, Edit, Trash2, Check, X, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { rolesApi } from '@/utils/api';

interface Role {
  _id: string;
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

const defaultPermissions = {
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
};

export function RoleBasedAccessControl() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
  });

  // Load roles from backend
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await rolesApi.getAll();
      // Ensure permissions object exists for each role
      const rolesWithPermissions = (data || []).map((role: any) => ({
        ...role,
        permissions: role.permissions || defaultPermissions,
      }));
      setRoles(rolesWithPermissions);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const updatePermission = async (roleId: string, permission: keyof Role['permissions']) => {
    const role = roles.find(r => r._id === roleId);
    if (!role) return;

    if (role.name.toLowerCase() === 'admin') {
      toast.error('Cannot modify Admin role permissions');
      return;
    }

    const updatedPermissions = {
      ...role.permissions,
      [permission]: !role.permissions[permission],
    };

    try {
      await rolesApi.update(roleId, { 
        name: role.name,
        description: role.description,
        permissions: updatedPermissions 
      });
      setRoles(prev => prev.map(r => 
        r._id === roleId ? { ...r, permissions: updatedPermissions } : r
      ));
      toast.success('Permission updated successfully');
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Failed to update permission');
    }
  };

  const handleAddRole = async () => {
    if (!newRole.name || !newRole.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await rolesApi.create({
        name: newRole.name,
        description: newRole.description,
        permissions: defaultPermissions,
      });
      toast.success(`Role "${newRole.name}" created successfully!`);
      setNewRole({ name: '', description: '' });
      setIsAddRoleOpen(false);
      await fetchRoles();
    } catch (error: any) {
      console.error('Error creating role:', error);
      toast.error(error.message || 'Failed to create role');
    }
  };

  const handleEditRole = (role: Role) => {
    if (role.name.toLowerCase() === 'admin') {
      toast.error('Cannot edit Admin role');
      return;
    }
    setEditingRole(role);
    setIsEditRoleOpen(true);
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;

    try {
      await rolesApi.update(editingRole._id, {
        name: editingRole.name,
        description: editingRole.description,
        permissions: editingRole.permissions,
      });
      toast.success('Role updated successfully');
      setIsEditRoleOpen(false);
      setEditingRole(null);
      await fetchRoles();
    } catch (error) {
      console.error('Error updating role:', error);
      toast.error('Failed to update role');
    }
  };

  const deleteRole = async (role: Role) => {
    if (role.name.toLowerCase() === 'admin') {
      toast.error('Cannot delete Admin role');
      return;
    }

    if (!confirm(`Are you sure you want to delete role "${role.name}"?`)) return;
    
    try {
      await rolesApi.delete(role._id);
      toast.success('Role deleted successfully');
      await fetchRoles();
    } catch (error) {
      console.error('Error deleting role:', error);
      toast.error('Failed to delete role');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading roles...</p>
        </div>
      </div>
    );
  }

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
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchRoles}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Role</DialogTitle>
                    <DialogDescription>Define a new role with custom permissions</DialogDescription>
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
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {roles.map(role => (
              <Card key={role._id} className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg capitalize">{role.name}</CardTitle>
                        {role.name.toLowerCase() === 'admin' && (
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
                        disabled={role.name.toLowerCase() === 'admin'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteRole(role)}
                        disabled={role.name.toLowerCase() === 'admin'}
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
                            htmlFor={`${role._id}-${key}`} 
                            className="cursor-pointer flex-1"
                          >
                            {moduleNames[key as keyof typeof moduleNames]}
                          </Label>
                          <Switch
                            id={`${role._id}-${key}`}
                            checked={value}
                            onCheckedChange={() => updatePermission(role._id, key as keyof Role['permissions'])}
                            disabled={role.name.toLowerCase() === 'admin'}
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
