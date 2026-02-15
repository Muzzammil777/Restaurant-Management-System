import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { FileText, Download, RefreshCcw, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { auditApi } from '@/utils/api';

interface AuditLog {
  _id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId?: string;
  userName?: string;
  details?: Record<string, unknown>;
  status?: string;
  ip?: string;
  timestamp: string;
}

export function AuditLogs() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<{ total: number; actions: string[]; resources: string[] }>({
    total: 0,
    actions: [],
    resources: [],
  });

  // Load audit logs from backend API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [logsData, actionsData, resourcesData] = await Promise.all([
          auditApi.list({ limit: 500 }).catch(() => ({ data: [], total: 0 })),
          auditApi.getActions().catch(() => []),
          auditApi.getResources().catch(() => []),
        ]);
        
        const logs = logsData.data || [];
        setAuditLogs(logs);
        setFilteredLogs(logs);
        setStats({
          total: logsData.total || logs.length,
          actions: actionsData || [],
          resources: resourcesData || [],
        });
      } catch (error) {
        console.error('Failed to load audit logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...auditLogs];

    // User filter
    if (userFilter !== 'all') {
      filtered = filtered.filter(log => 
        log.userName?.toLowerCase().includes(userFilter.toLowerCase()) ||
        log.userId?.includes(userFilter)
      );
    }

    // Module/Resource filter
    if (moduleFilter !== 'all') {
      filtered = filtered.filter(log => log.resource === moduleFilter);
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
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(log => 
        log.action?.toLowerCase().includes(query) ||
        log.resource?.toLowerCase().includes(query) ||
        log.userName?.toLowerCase().includes(query) ||
        JSON.stringify(log.details)?.toLowerCase().includes(query)
      );
    }

    setFilteredLogs(filtered);
  }, [userFilter, moduleFilter, timeFilter, searchQuery, auditLogs]);

  const handleExportLogs = async () => {
    try {
      const data = await auditApi.export({ format: 'json', limit: 1000 });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Audit logs exported successfully');
    } catch (error) {
      console.error('Failed to export logs:', error);
      toast.error('Failed to export logs');
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const logsData = await auditApi.list({ limit: 500 }).catch(() => ({ data: [], total: 0 }));
      setAuditLogs(logsData.data || []);
      setFilteredLogs(logsData.data || []);
      toast.success('Audit logs refreshed');
    } catch (error) {
      console.error('Failed to refresh logs:', error);
      toast.error('Failed to refresh logs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  const formatAction = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-settings-module min-h-screen space-y-6 p-6">
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
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                <RefreshCcw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
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
                <Search className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base">Filters</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Filter by User</label>
                  <Select value={userFilter} onValueChange={setUserFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Users" />
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
                      <SelectValue placeholder="All Modules" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Modules</SelectItem>
                      {stats.resources.map(resource => (
                        <SelectItem key={resource} value={resource}>
                          {resource.charAt(0).toUpperCase() + resource.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Range</label>
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Time" />
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
              <span className="font-semibold text-foreground">{stats.total}</span> audit logs
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
                  filteredLogs.map(log => (
                    <TableRow key={log._id}>
                      <TableCell>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status || 'success'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{log.userName || log.userId || 'System'}</TableCell>
                      <TableCell>{formatAction(log.action)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.resource || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate text-sm">
                          {log.details ? JSON.stringify(log.details) : log.resourceId || '-'}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}
                      </TableCell>
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
