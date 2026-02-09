import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { FileText, Download, RefreshCcw, Search, Calendar, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface AuditLog {
  id: string;
  user: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ipAddress: string;
  device: string;
  status: 'success' | 'failed' | 'warning';
}

const STORAGE_KEY = 'rms_audit_logs';

export function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [userFilter, setUserFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load audit logs from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const logs = JSON.parse(stored);
      setAuditLogs(logs);
      setFilteredLogs(logs);
    } else {
      // Initialize with sample audit logs
      const defaultLogs: AuditLog[] = [
        {
          id: '1',
          user: 'admin@movicloud.com',
          action: 'Created New Menu Item',
          module: 'Menu Management',
          details: 'Added "Butter Chicken Masala" to menu with price ₹350',
          timestamp: '2026-01-29 14:30:25',
          ipAddress: '192.168.1.100',
          device: 'Chrome on Windows',
          status: 'success',
        },
        {
          id: '2',
          user: 'john.manager@movicloud.com',
          action: 'Updated Order Status',
          module: 'Order Management',
          details: 'Changed order #ORD-1234 status to "Completed"',
          timestamp: '2026-01-29 14:15:10',
          ipAddress: '192.168.1.105',
          device: 'Safari on iPad',
          status: 'success',
        },
        {
          id: '3',
          user: 'mike.cashier@movicloud.com',
          action: 'Generated Invoice',
          module: 'Billing & Payments',
          details: 'Invoice INV-2026-0089 for ₹1,450 (Payment: UPI)',
          timestamp: '2026-01-29 13:45:55',
          ipAddress: '192.168.1.110',
          device: 'Chrome on Android',
          status: 'success',
        },
        {
          id: '4',
          user: 'admin@movicloud.com',
          action: 'Updated Staff Role',
          module: 'Staff Management',
          details: 'Changed role for John Manager from Waiter to Manager',
          timestamp: '2026-01-29 12:20:30',
          ipAddress: '192.168.1.100',
          device: 'Chrome on Windows',
          status: 'success',
        },
        {
          id: '5',
          user: 'john.manager@movicloud.com',
          action: 'Stock Adjustment',
          module: 'Inventory Management',
          details: 'Added 50kg Basmati Rice to inventory',
          timestamp: '2026-01-29 11:00:15',
          ipAddress: '192.168.1.105',
          device: 'Safari on iPad',
          status: 'success',
        },
        {
          id: '6',
          user: 'sarah.chef@movicloud.com',
          action: 'Order Status Update Failed',
          module: 'Kitchen Display',
          details: 'Attempted to mark order #ORD-1230 as completed but item was already completed',
          timestamp: '2026-01-29 10:30:00',
          ipAddress: '192.168.1.115',
          device: 'Chrome on Android',
          status: 'failed',
        },
        {
          id: '7',
          user: 'admin@movicloud.com',
          action: 'System Configuration Updated',
          module: 'Settings',
          details: 'Changed GST rate from 5% to 5%',
          timestamp: '2026-01-29 09:15:20',
          ipAddress: '192.168.1.100',
          device: 'Chrome on Windows',
          status: 'success',
        },
        {
          id: '8',
          user: 'lisa.waiter@movicloud.com',
          action: 'Table Assignment',
          module: 'Table Management',
          details: 'Assigned Table #12 to customer group of 4',
          timestamp: '2026-01-28 20:45:30',
          ipAddress: '192.168.1.120',
          device: 'Safari on iPhone',
          status: 'success',
        },
        {
          id: '9',
          user: 'mike.cashier@movicloud.com',
          action: 'Payment Processing',
          module: 'Billing & Payments',
          details: 'Processed card payment of ₹2,340 (Card ending in 4532)',
          timestamp: '2026-01-28 19:30:15',
          ipAddress: '192.168.1.110',
          device: 'Chrome on Android',
          status: 'success',
        },
        {
          id: '10',
          user: 'admin@movicloud.com',
          action: 'Backup Created',
          module: 'Settings',
          details: 'Manual backup initiated - Size: 256 MB',
          timestamp: '2026-01-28 15:00:00',
          ipAddress: '192.168.1.100',
          device: 'Chrome on Windows',
          status: 'success',
        },
      ];
      setAuditLogs(defaultLogs);
      setFilteredLogs(defaultLogs);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultLogs));
    }
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...auditLogs];

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(log => log.user.includes(userFilter));
    }

    // Module filter
    if (moduleFilter !== 'all') {
      filtered = filtered.filter(log => log.module === moduleFilter);
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(log => {
        const logDate = new Date(log.timestamp);
        const diffDays = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (timeFilter === 'today') return diffDays === 0;
        if (timeFilter === 'week') return diffDays <= 7;
        if (timeFilter === 'month') return diffDays <= 30;
        return true;
      });
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [userFilter, moduleFilter, timeFilter, searchQuery, auditLogs]);

  const handleExportLogs = () => {
    toast.success('Exporting audit logs...');
    // In a real app, this would generate a CSV/PDF file
  };

  const handleRefresh = () => {
    toast.success('Audit logs refreshed');
    // In a real app, this would fetch fresh data from the API
  };

  const getStatusColor = (status: AuditLog['status']) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Audit Logs</CardTitle>
                <CardDescription>System activity and user action tracking</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportLogs}>
                <Download className="h-4 w-4 mr-2" />
                Export Logs
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <Card className="border-dashed">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Filters</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter by User</label>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                      <SelectItem value="chef">Chef</SelectItem>
                      <SelectItem value="waiter">Waiter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter by Module</label>
                  <Select value={moduleFilter} onValueChange={setModuleFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modules</SelectItem>
                      <SelectItem value="Menu Management">Menu Management</SelectItem>
                      <SelectItem value="Order Management">Order Management</SelectItem>
                      <SelectItem value="Billing & Payments">Billing & Payments</SelectItem>
                      <SelectItem value="Inventory Management">Inventory Management</SelectItem>
                      <SelectItem value="Kitchen Display">Kitchen Display</SelectItem>
                      <SelectItem value="Table Management">Table Management</SelectItem>
                      <SelectItem value="Staff Management">Staff Management</SelectItem>
                      <SelectItem value="Settings">Settings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Range</label>
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search logs..."
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Summary */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredLogs.length}</span> of{' '}
              <span className="font-semibold text-foreground">{auditLogs.length}</span> audit logs
            </p>
          </div>

          {/* Logs Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Status</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Device</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No audit logs found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map(log => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{log.user}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.module}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate" title={log.details}>
                          {log.details}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{log.timestamp}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.ipAddress}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.device}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
