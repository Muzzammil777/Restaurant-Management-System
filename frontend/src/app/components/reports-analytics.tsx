import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Badge } from '@/app/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from '@/app/components/ui/utils';
import {
  TrendingUp,
  TrendingDown,
  IndianRupee,
  ShoppingBag,
  Users,
  Trophy,
  Clock,
  Calendar,
  Download,
  Star,
  Loader2,
} from 'lucide-react';
import { analyticsApi } from '@/utils/api';

const CATEGORY_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatHour(h: number): string {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

export function ReportsAnalytics() {
  const [activeTab, setActiveTab] = useState('sales');
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [weeklyData, setWeeklyData] = useState<any>(null);
  const [dailyData, setDailyData] = useState<any>(null);
  const [staffPerformance, setStaffPerformance] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, weeklyRes, dailyRes, staffRes] = await Promise.allSettled([
        analyticsApi.get(),
        analyticsApi.getWeekly(),
        analyticsApi.getDaily(),
        analyticsApi.getStaffPerformance(),
      ]);
      if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value);
      if (weeklyRes.status === 'fulfilled') setWeeklyData(weeklyRes.value);
      if (dailyRes.status === 'fulfilled') setDailyData(dailyRes.value);
      if (staffRes.status === 'fulfilled') setStaffPerformance(staffRes.value ?? []);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sales chart data from weekly daily breakdown
  const salesData = (weeklyData?.daily ?? []).map((d: any) => {
    const date = new Date(d.date);
    return { name: DAY_NAMES[date.getDay()], sales: d.revenue ?? 0, orders: d.orders ?? 0 };
  });

  // Popular items from weekly top items (with revenue + trend from backend)
  const popularItems = (weeklyData?.topItems ?? []).map((item: any) => ({
    name: item.name,
    orders: item.count ?? 0,
    revenue: item.revenue ?? 0,
    trend: item.trend ?? 0,
  }));
  const maxOrders = popularItems.reduce((m: number, i: any) => Math.max(m, i.orders), 1);

  // Peak hours from daily hourly breakdown
  const peakHoursData = (() => {
    if (!dailyData?.hourly?.length) return [];
    const hourMap: Record<number, number> = {};
    dailyData.hourly.forEach((h: any) => { hourMap[h.hour] = h.orders; });
    return Array.from({ length: 16 }, (_, i) => {
      const hour = i + 7;
      return { hour: formatHour(hour), orders: hourMap[hour] ?? 0 };
    });
  })();
  const peakHour = peakHoursData.reduce(
    (best: any, cur: any) => (cur.orders > (best?.orders ?? 0) ? cur : best),
    null
  );

  // Summary stats
  const stats = analytics?.data ?? {};
  const totalRevenue = stats.totalRevenue ?? 0;
  const totalOrders = stats.totalOrders ?? 0;
  const avgOrderValue = stats.avgOrderValue ?? 0;
  const totalCustomers = stats.totalCustomers ?? 0;

  // Category pie chart
  const categoryData = (stats.categoryDistribution ?? [])
    .slice(0, 6)
    .map((c: any, i: number) => ({ ...c, color: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }));

  // Order type quick status
  const orderTypes = stats.orderTypes ?? {};
  const dineIn = orderTypes['dine-in'] ?? orderTypes['dinein'] ?? 0;
  const takeaway = orderTypes['takeaway'] ?? orderTypes['pickup'] ?? 0;
  const delivery = orderTypes['delivery'] ?? 0;

  if (loading) {
    return (
      <div className="bg-analytics-module min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white">
          <Loader2 className="h-10 w-10 animate-spin" />
          <p className="text-sm">Loading analyticsâ€¦</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-analytics-module min-h-screen px-4 md:px-6 py-6 space-y-6">
      <div className="module-container flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-white drop-shadow-lg">Reports & Analytics</h2>
          <p className="text-sm text-gray-200 mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40 !bg-white !text-gray-700 border border-white/90 hover:!bg-white shadow-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="!bg-white !text-gray-700 border border-white/90 hover:!bg-white shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="w-full overflow-x-auto pb-4">
        <nav className="flex gap-3 min-w-max p-1">
          {[
            { id: 'sales', label: 'Sales', icon: TrendingUp, description: 'Revenue & orders' },
            { id: 'items', label: 'Popular Items', icon: ShoppingBag, description: 'Top performing dishes' },
            { id: 'peak', label: 'Peak Hours', icon: Clock, description: 'Busy time analysis' },
            { id: 'staff', label: 'Staff', icon: Users, description: 'Employee performance' },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg transition-colors text-left min-w-[220px]',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border hover:bg-muted shadow-sm'
                )}
              >
                <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', isActive ? '' : 'text-muted-foreground')} />
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', isActive ? '' : '')}>{item.label}</p>
                  <p className={cn('text-xs mt-0.5', isActive ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                    {item.description}
                  </p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* Sales Reports Tab */}
        <TabsContent value="sales" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">â‚¹{totalRevenue.toLocaleString('en-IN')}</div>
                <p className="text-xs text-muted-foreground mt-1">All completed orders</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalOrders.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.activeOrders ?? 0} active now
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">â‚¹{Math.round(avgOrderValue).toLocaleString('en-IN')}</div>
                <p className="text-xs text-muted-foreground mt-1">Per completed order</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCustomers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground mt-1">Registered customers</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>
                Daily sales and order count â€” {weeklyData?.startDate ?? ''} to {weeklyData?.endDate ?? ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {salesData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                  No sales data for this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip formatter={(val: any, name: string) => name === 'Sales (â‚¹)' ? `â‚¹${val.toLocaleString('en-IN')}` : val} />
                    <Line yAxisId="left" type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} name="Sales (â‚¹)" />
                    <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} name="Orders" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Order distribution across menu categories</CardDescription>
              </CardHeader>
              <CardContent>
                {categoryData.length === 0 ? (
                  <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
                    No category data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${entry.name} (${entry.value})`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {categoryData.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Order Type Breakdown</CardTitle>
                <CardDescription>Distribution by order type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Dine-in Orders</span>
                  </div>
                  <span className="font-semibold">
                    {dineIn > 0 ? `${dineIn} (${totalOrders > 0 ? Math.round((dineIn / totalOrders) * 100) : 0}%)` : 'â€”'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Takeaway Orders</span>
                  </div>
                  <span className="font-semibold">
                    {takeaway > 0 ? `${takeaway} (${totalOrders > 0 ? Math.round((takeaway / totalOrders) * 100) : 0}%)` : 'â€”'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Delivery Orders</span>
                  </div>
                  <span className="font-semibold">
                    {delivery > 0 ? `${delivery} (${totalOrders > 0 ? Math.round((delivery / totalOrders) * 100) : 0}%)` : 'â€”'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Table Occupancy</span>
                  </div>
                  <span className="font-semibold">{stats.tableOccupancy ?? 0}%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Popular Items Tab */}
        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Items</CardTitle>
              <CardDescription>Most popular dishes â€” {weeklyData?.startDate ?? ''} to {weeklyData?.endDate ?? ''}</CardDescription>
            </CardHeader>
            <CardContent>
              {popularItems.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">No item data available for this period</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Item Name</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Trend</TableHead>
                      <TableHead className="text-right">Performance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {popularItems.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          {index < 3 ? (
                            <Trophy className={`h-5 w-5 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-700'}`} />
                          ) : (
                            <span className="text-muted-foreground">{index + 1}</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell>{item.orders}</TableCell>
                        <TableCell>{item.revenue > 0 ? `â‚¹${item.revenue.toLocaleString('en-IN')}` : 'â€”'}</TableCell>
                        <TableCell>
                          {item.trend !== 0 ? (
                            item.trend > 0 ? (
                              <Badge className="bg-green-500">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                {item.trend}%
                              </Badge>
                            ) : (
                              <Badge className="bg-red-500">
                                <TrendingDown className="h-3 w-3 mr-1" />
                                {Math.abs(item.trend)}%
                              </Badge>
                            )
                          ) : (
                            <span className="text-xs text-muted-foreground">â€”</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${(item.orders / maxOrders) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-muted-foreground w-10 text-right">
                              {Math.round((item.orders / maxOrders) * 100)}%
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {popularItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Items Chart</CardTitle>
                <CardDescription>Visual comparison of order volumes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={popularItems}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#3b82f6" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Peak Hours Tab */}
        <TabsContent value="peak" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Peak Hours Analysis</CardTitle>
              <CardDescription>Order distribution throughout today</CardDescription>
            </CardHeader>
            <CardContent>
              {peakHoursData.length === 0 ? (
                <div className="h-[350px] flex items-center justify-center text-muted-foreground text-sm">
                  No hourly data available for today
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={peakHoursData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#8b5cf6" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Peak Hour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {peakHour ? peakHour.hour : 'â€”'}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {peakHour ? `${peakHour.orders} orders during this hour` : 'No data yet'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {dailyData?.orders ?? 0}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  â‚¹{(dailyData?.revenue ?? 0).toLocaleString('en-IN')} revenue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Completed Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {dailyData?.completed ?? 0}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  of {dailyData?.orders ?? 0} total orders
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Staff Performance Tab */}
        <TabsContent value="staff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Staff Performance Ranking</CardTitle>
              <CardDescription>Employee performance metrics and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              {staffPerformance.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                  No performance data recorded yet. Log staff performance from the Staff module.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Orders Handled</TableHead>
                      <TableHead>Avg. Service Time</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffPerformance.map((staff: any, index: number) => (
                      <TableRow key={staff.id}>
                        <TableCell>
                          {index < 3 ? (
                            <Trophy className={`h-5 w-5 ${index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : 'text-amber-700'}`} />
                          ) : (
                            <span className="text-muted-foreground">{index + 1}</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{staff.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{staff.role}</Badge>
                        </TableCell>
                        <TableCell>{staff.orders_handled ?? 0}</TableCell>
                        <TableCell>{staff.avg_service_time ?? 'â€”'}</TableCell>
                        <TableCell>
                          {staff.rating ? (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{staff.rating}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">â€”</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {staff.attendance && staff.attendance !== 'â€”' ? (
                            <Badge className={staff.attendance === '100%' ? 'bg-green-500' : 'bg-blue-500'}>
                              {staff.attendance}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">â€”</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {staff.performance_score != null ? (
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500"
                                  style={{ width: `${staff.performance_score}%` }}
                                />
                              </div>
                              <span className="font-semibold w-8 text-right">{staff.performance_score}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">â€”</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
