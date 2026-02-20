import { useState, useEffect } from 'react';
import { AdminDashboard } from '@/app/components/admin-dashboard';
import { MenuManagement } from '@/app/components/menu-management';
import { OrderManagement } from '@/app/components/order-management';
import { MochaKDS } from '@/app/components/mocha-kds';
import { TableManagement } from '@/app/components/table-management';
import { InventoryManagement } from '@/app/components/inventory-management';
import { StaffManagement } from '@/app/components/staff-management';
import { BillingPayment } from '@/app/components/billing-payment';
import { SecuritySettings } from '@/app/components/security-settings';
// import { DeliveryManagement } from '@/app/components/delivery-management'; // Hidden for now
import { OffersLoyalty } from '@/app/components/offers-loyalty';
import { ReportsAnalytics } from '@/app/components/reports-analytics';
import { NotificationManagement } from '@/app/components/notification-management';
import { WelcomeBanner } from '@/app/components/welcome-banner';
import { LoginPage } from '@/app/components/login-page';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Toaster } from '@/app/components/ui/sonner';
import { SystemConfigProvider, useSystemConfig } from '@/utils/system-config-context';
import { AuthProvider, useAuth, DEFAULT_TAB } from '@/utils/auth-context';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  ShoppingCart, 
  ChefHat, 
  Users,
  Package,
  UserCog,
  Bell,
  Settings,
  User,
  Shield,
  FileText,
  Database,
  Wrench,
  LogOut,
  CreditCard,
  Truck,
  Tag,
  BarChart3,
  BellRing,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";

import { AdminChatBox } from '@/app/components/AdminChatBox';

function AppContent() {
  const { config, refreshConfig } = useSystemConfig();
  const { user, isAuthenticated, logout, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    // Get saved user to determine default tab
    const savedUser = localStorage.getItem('rms_current_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        return DEFAULT_TAB[userData.role as keyof typeof DEFAULT_TAB] || 'dashboard';
      } catch {
        return 'dashboard';
      }
    }
    return 'dashboard';
  });
  const [notificationCount, setNotificationCount] = useState(3); // Mock notification count
  const [triggerStockManagement, setTriggerStockManagement] = useState(false);

  // Update active tab when user changes
  useEffect(() => {
    if (user) {
      const defaultTab = DEFAULT_TAB[user.role];
      if (defaultTab && !hasPermission(activeTab)) {
        setActiveTab(defaultTab);
      }
    }
  }, [user]);

  // Listen for stock management navigation event from Kitchen
  useEffect(() => {
    const handleStockManagementRequest = () => {
      setActiveTab('inventory');
      setTriggerStockManagement(true);
      // Reset trigger after a short delay to allow re-triggering
      setTimeout(() => setTriggerStockManagement(false), 100);
    };

    const handleNewNotification = () => {
      setNotificationCount(prev => prev + 1);
    };

    window.addEventListener('navigate:stock-management' as any, handleStockManagementRequest);
    window.addEventListener('new-admin-notification' as any, handleNewNotification);
    
    return () => {
      window.removeEventListener('navigate:stock-management' as any, handleStockManagementRequest);
      window.removeEventListener('new-admin-notification' as any, handleNewNotification);
    };
  }, []);

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" />
        <LoginPage />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="border-b bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-xl">
                <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight" style={{ color: '#000000' }}>{config.restaurantName}</h1>
                <p className="text-xs text-muted-foreground">Powered by Movicloud Labs</p>
              </div>
            </div>
            
            {/* Right side: Notifications, Settings, Profile */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" style={{ color: '#000000' }} />
                {notificationCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {notificationCount}
                  </Badge>
                )}
              </Button>

              {/* Settings Dropdown - only show for users with settings permission */}
              {hasPermission('settings') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings className="h-5 w-5" style={{ color: '#000000' }} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Settings & Configuration</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                      <Shield className="mr-2 h-4 w-4" />
                      Security & Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                      <Users className="mr-2 h-4 w-4" />
                      Role & Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                      <FileText className="mr-2 h-4 w-4" />
                      Audit Logs
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                      <Database className="mr-2 h-4 w-4" />
                      Backup & Recovery
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                      <Wrench className="mr-2 h-4 w-4" />
                    System Configuration
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              )}

              {/* Profile Avatar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage src="" alt={user?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">Role: {user?.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  {hasPermission('settings') && (
                    <DropdownMenuItem onClick={() => setActiveTab('settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Preferences
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => hasPermission(value) && setActiveTab(value)} className="container mx-auto">
        <div className="border-b bg-white sticky top-[73px] z-40">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 bg-transparent border-0 rounded-none">
            {hasPermission('dashboard') && (
              <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
            )}
            {hasPermission('menu') && (
              <TabsTrigger value="menu" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4">
                <UtensilsCrossed className="h-4 w-4" />
                Menu Management
              </TabsTrigger>
            )}
            {hasPermission('orders') && (
              <TabsTrigger value="orders" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4">
                <ShoppingCart className="h-4 w-4" />
                Orders
              </TabsTrigger>
            )}
            {hasPermission('kitchen') && (
              <TabsTrigger value="kitchen" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4">
                <ChefHat className="h-4 w-4" />
                Kitchen
              </TabsTrigger>
            )}
            {hasPermission('tables') && (
              <TabsTrigger value="tables" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4">
                <Users className="h-4 w-4" />
                Tables
              </TabsTrigger>
            )}
            {hasPermission('inventory') && (
              <TabsTrigger value="inventory" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4">
                <Package className="h-4 w-4" />
                Inventory
              </TabsTrigger>
            )}
            {hasPermission('staff') && (
              <TabsTrigger value="staff" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4">
                <UserCog className="h-4 w-4" />
                Staff
              </TabsTrigger>
            )}
            {hasPermission('billing') && (
              <TabsTrigger value="billing" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4">
                <CreditCard className="h-4 w-4" />
                Billing
              </TabsTrigger>
            )}
            {/* Delivery tab hidden for now
            {hasPermission('delivery') && (
              <TabsTrigger value="delivery" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4">
                <Truck className="h-4 w-4" />
                Delivery
              </TabsTrigger>
            )}
            */}
            {hasPermission('offers') && (
              <TabsTrigger value="offers" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4">
                <Tag className="h-4 w-4" />
                Offers & Loyalty
              </TabsTrigger>
            )}
            {hasPermission('reports') && (
              <TabsTrigger value="reports" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4">
                <BarChart3 className="h-4 w-4" />
                Reports
              </TabsTrigger>
            )}
            {hasPermission('notifications') && (
              <TabsTrigger value="notifications" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4">
                <BellRing className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            )}
            {hasPermission('settings') && (
              <TabsTrigger value="settings" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4">
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <div className="py-6">
          <WelcomeBanner />
        </div>

        <TabsContent value="dashboard" className="mt-0">
          <AdminDashboard />
        </TabsContent>

        <TabsContent value="menu" className="mt-0">
          <MenuManagement />
        </TabsContent>

        <TabsContent value="orders" className="mt-0">
          <OrderManagement />
        </TabsContent>

        <TabsContent value="kitchen" className="mt-0">
          <MochaKDS />
        </TabsContent>

        <TabsContent value="tables" className="mt-0">
          <TableManagement />
        </TabsContent>

        <TabsContent value="inventory" className="mt-0">
          <InventoryManagement triggerStockManagement={triggerStockManagement} />
        </TabsContent>

        <TabsContent value="staff" className="mt-0">
          <StaffManagement />
        </TabsContent>

        <TabsContent value="billing" className="mt-0">
          <BillingPayment />
        </TabsContent>

        {/* Delivery content hidden for now
        <TabsContent value="delivery" className="mt-0">
          <DeliveryManagement />
        </TabsContent>
        */}

        <TabsContent value="offers" className="mt-0">
          <OffersLoyalty />
        </TabsContent>

        <TabsContent value="reports" className="mt-0">
          <ReportsAnalytics />
        </TabsContent>

        <TabsContent value="notifications" className="mt-0">
          <NotificationManagement />
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <SecuritySettings />
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <footer className="border-t mt-12 py-8 bg-white">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">{config.restaurantName} • Movicloud Labs</p>
          <p className="text-xs text-muted-foreground mt-2"></p>
        </div>
      </footer>
      <AdminChatBox />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SystemConfigProvider>
        <AppContent />
      </SystemConfigProvider>
    </AuthProvider>
  );
}
