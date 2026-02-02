import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { FileText, Download, RefreshCcw, Search, Calendar, Filter, Trash2 } from 'lucide-react';
import { auditApi } from '@/utils/api';
import { toast } from 'sonner';

interface AuditLog {
  _id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId?: string;
  userName?: string;
  details?: any;
  ip?: string;
  device?: string;
  status: 'success' | 'failed' | 'warning';
  createdAt: string;
}

export function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [actions, setActions] = useState<string[]>([]);
  const [resources, setResources] = useState<string[]>([]);
  
  const [actionFilter, setActionFilter] = useState('all');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load audit logs from backend
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [logsResult, statsResult, actionsResult, resourcesResult] = await Promise.all([
        auditApi.list({ limit: 500 }),
        auditApi.getStats(),
        auditApi.getActions(),
        auditApi.getResources(),
      ]);
      
      setAuditLogs(logsResult.data || []);
      setFilteredLogs(logsResult.data || []);
      setTotalLogs(logsResult.total || 0);
      setStats(statsResult);
      setActions(actionsResult || []);
      setResources(resourcesResult || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to fetch audit logs');
      // Fall back to empty data
      setAuditLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let filtered = [...auditLogs];

    // Action filter
    if (actionFilter !== 'all') {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Resource filter
    if (resourceFilter !== 'all') {
      filtered = filtered.filter(log => log.resource === resourceFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(log => {
        const logDate = new Date(log.createdAt);
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
        log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.resource?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(log.details)?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [actionFilter, resourceFilter, statusFilter, timeFilter, searchQuery, auditLogs]);

  const handleExportLogs = async () => {
    try {
      toast.success('Preparing export...');
      const result = await auditApi.export({ limit: 10000 });
      
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported ${result.count} audit logs`);
    } catch (error) {
      console.error('Error exporting logs:', error);
      toast.error('Failed to export logs');
    }
  };

  const handleRefresh = async () => {
    await fetchData();
    toast.success('Audit logs refreshed');
  };

  const handleCleanup = async () => {
    if (!confirm('Are you sure you want to delete logs older than 90 days?')) return;
    
    try {
      const result = await auditApi.cleanup(90);
      toast.success(`Deleted ${result.deleted_count} old logs`);
      await fetchData();
    } catch (error) {
      console.error('Error cleaning up logs:', error);
      toast.error('Failed to cleanup old logs');
    }
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total || 0}</div>
            <p className="text-xs text-muted-foreground">Total Logs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.today || 0}</div>
            <p className="text-xs text-muted-foreground">Today's Activity</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.byStatus?.success || 0}</div>
            <p className="text-xs text-muted-foreground">Successful</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.byStatus?.failed || 0}</div>
            <p className="text-xs text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>

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
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={handleCleanup}>
                <Trash2 className="h-4 w-4 mr-2" />
                Cleanup
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
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Action</label>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      {actions.map(action => (
                        <SelectItem key={action} value={action}>{action}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Resource</label>
                  <Select value={resourceFilter} onValueChange={setResourceFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Resources</SelectItem>
                      {resources.map(resource => (
                        <SelectItem key={resource} value={resource}>{resource}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
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
                  <TableHead>Resource</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No audit logs found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.slice(0, 100).map(log => (
                    <TableRow key={log._id}>
                      <TableCell>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{log.userName || '-'}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.resource || '-'}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate text-sm" title={JSON.stringify(log.details)}>
                          {log.details ? JSON.stringify(log.details).slice(0, 50) : '-'}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{formatDate(log.createdAt)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.ip || '-'}</TableCell>
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
