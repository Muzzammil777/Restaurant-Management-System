import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/app/components/ui/dialog';
import { Lock, User, Mail, Shield, Check, X, Edit, Plus, Trash2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  createdAt: string;
}

const STORAGE_KEY = 'rms_user_accounts';

export function AccountAuthentication() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'Waiter',
    password: '',
  });

  // Load user accounts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setUserAccounts(JSON.parse(stored));
    } else {
      // Initialize with default users
      const defaultUsers: UserAccount[] = [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@movicloud.com',
          role: 'Admin',
          status: 'active',
          lastLogin: '2026-01-29 09:30:00',
          createdAt: '2026-01-01 00:00:00',
        },
        {
          id: '2',
          name: 'John Manager',
          email: 'john.manager@movicloud.com',
          role: 'Manager',
          status: 'active',
          lastLogin: '2026-01-29 08:15:00',
          createdAt: '2026-01-05 00:00:00',
        },
        {
          id: '3',
          name: 'Sarah Chef',
          email: 'sarah.chef@movicloud.com',
          role: 'Chef',
          status: 'active',
          lastLogin: '2026-01-28 22:45:00',
          createdAt: '2026-01-10 00:00:00',
        },
        {
          id: '4',
          name: 'Mike Cashier',
          email: 'mike.cashier@movicloud.com',
          role: 'Cashier',
          status: 'active',
          lastLogin: '2026-01-29 07:00:00',
          createdAt: '2026-01-12 00:00:00',
        },
        {
          id: '5',
          name: 'Lisa Waiter',
          email: 'lisa.waiter@movicloud.com',
          role: 'Waiter',
          status: 'inactive',
          lastLogin: '2026-01-20 18:30:00',
          createdAt: '2026-01-15 00:00:00',
        },
      ];
      setUserAccounts(defaultUsers);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers));
    }
  }, []);

  // Save to localStorage whenever userAccounts changes
  useEffect(() => {
    if (userAccounts.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userAccounts));
    }
  }, [userAccounts]);

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    // Simulate password change (in real app, this would call an API)
    toast.success('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const toggleUserStatus = (userId: string) => {
    setUserAccounts(prev => prev.map(user => {
      if (user.id === userId) {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        toast.success(`User ${user.name} is now ${newStatus}`);
        return { ...user, status: newStatus };
      }
      return user;
    }));
  };

  const handleAddUser = () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (newUser.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    const user: UserAccount = {
      id: Date.now().toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: 'active',
      lastLogin: 'Never',
      createdAt: new Date().toLocaleString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
    };

    setUserAccounts(prev => [...prev, user]);
    toast.success(`User ${newUser.name} added successfully!`);
    setNewUser({ name: '', email: '', role: 'Waiter', password: '' });
    setIsAddUserOpen(false);
  };

  const deleteUser = (userId: string) => {
    const user = userAccounts.find(u => u.id === userId);
    if (user?.role === 'Admin') {
      toast.error('Cannot delete admin user');
      return;
    }
    
    setUserAccounts(prev => prev.filter(u => u.id !== userId));
    toast.success('User deleted successfully');
  };

  return (
    <div className="space-y-6">
      {/* Change Password Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your account password for enhanced security</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
              />
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium">Password Requirements:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Minimum 8 characters long</li>
                <li>Include uppercase and lowercase letters</li>
                <li>Include at least one number</li>
                <li>Include at least one special character</li>
              </ul>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleChangePassword}>
              <Lock className="h-4 w-4 mr-2" />
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Account Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>User Accounts</CardTitle>
                <CardDescription>Activate, deactivate, and manage user accounts</CardDescription>
              </div>
            </div>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>Create a new user account with role assignment</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-name">Full Name</Label>
                    <Input
                      id="user-name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-email">Email Address</Label>
                    <Input
                      id="user-email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-role">Role</Label>
                    <select
                      id="user-role"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Chef">Chef</option>
                      <option value="Cashier">Cashier</option>
                      <option value="Waiter">Waiter</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-password">Password</Label>
                    <Input
                      id="user-password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Minimum 8 characters"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser}>Add User</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userAccounts.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={user.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                      {user.status === 'active' ? (
                        <><Check className="h-3 w-3 mr-1" /> Active</>
                      ) : (
                        <><X className="h-3 w-3 mr-1" /> Inactive</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {user.lastLogin}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleUserStatus(user.id)}
                        disabled={user.role === 'Admin'}
                      >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteUser(user.id)}
                        disabled={user.role === 'Admin'}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
