import { useState, useEffect } from "react";
import { TableStoreProvider } from "@/app/contexts/table-store";
import { AdminDashboard } from "@/app/components/admin-dashboard";
import { MenuManagement } from "@/app/components/menu-management";
import { OrderManagement } from "@/app/components/order-management";
import { TableManagementEnhanced } from "@/app/components/table-management-enhanced";
import { CustomerView } from "@/app/components/customer-view";
import { CustomerManagement } from "@/app/components/customer-management";
import { InventoryManagement } from "@/app/components/inventory-management";
import { StaffManagement } from "@/app/components/staff-management";
import { BillingModule } from "@/app/components/billing";
import { SecuritySettings } from "@/app/components/security-settings";
import { DeliveryManagement } from "@/app/components/delivery-management";
import { OffersLoyalty } from "@/app/components/offers-loyalty";
import { ReportsAnalytics } from "@/app/components/reports-analytics";
import { NotificationManagement } from "@/app/components/notification-management";
import { IntegratedOrderView } from "@/app/components/integrated-order-view";
import { NotificationPanel } from "@/app/components/notification-panel";

// Import comprehensive modules
import { TableManagementComprehensive } from "@/app/components/table-management-comprehensive";
import { TableManagement } from "@/app/components/table-management-new";
import { OrderManagementComprehensive } from "@/app/components/order-management-comprehensive";
import { BillingPaymentComprehensive } from "@/app/components/billing-payment-comprehensive";
import { MochaKDS } from "@/app/components/mocha-kds";

import { Button } from "@/app/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { Toaster } from "@/app/components/ui/sonner";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingCart,
  ChefHat,
  Users,
  Menu as MenuIcon,
  Package,
  UserCog,
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";

import { AdminChatBox } from "@/app/components/AdminChatBox";

export default function App() {
  const [activeTab, setActiveTab] = useState("customer");
  const [triggerStockManagement, setTriggerStockManagement] =
    useState(false);

  useEffect(() => {
    const handleStockManagementRequest = () => {
      setActiveTab("inventory");
      setTriggerStockManagement(true);
      setTimeout(() => setTriggerStockManagement(false), 100);
    };

    window.addEventListener(
      "navigate:stock-management" as any,
      handleStockManagementRequest,
    );

    return () => {
      window.removeEventListener(
        "navigate:stock-management" as any,
        handleStockManagementRequest,
      );
    };
  }, []);

  return (
    <TableStoreProvider>
      <div className="min-h-screen bg-background">
        <Toaster position="top-right" offset="80px" />

        {/* Header */}
        <header className="border-b bg-white shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-xl">
                  <UtensilsCrossed className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1
                    className="text-xl font-semibold tracking-tight"
                    style={{ color: "#000000" }}
                  >
                    Restaurant Management System
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Movicloud Labs
                  </p>
                </div>
              </div>

              {/* Right side: Notifications, Settings, Profile */}
              <div className="flex items-center gap-3">
                {/* Notifications */}
                <NotificationPanel onNavigate={setActiveTab} />

                {/* Settings Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Settings
                        className="h-5 w-5"
                        style={{ color: "#000000" }}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56"
                  >
                    <DropdownMenuLabel>
                      Settings & Configuration
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setActiveTab("settings")}
                    >
                      <Shield className="mr-2 h-4 w-4" />
                      Security & Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveTab("settings")}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Role & Permissions
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveTab("settings")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Audit Logs
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveTab("settings")}
                    >
                      <Database className="mr-2 h-4 w-4" />
                      Backup & Recovery
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveTab("settings")}
                    >
                      <Wrench className="mr-2 h-4 w-4" />
                      System Configuration
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile Avatar */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                    >
                      <Avatar>
                        <AvatarImage src="" alt="Admin" />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          AD
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-56"
                  >
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">
                          Admin User
                        </p>
                        <p className="text-xs text-muted-foreground">
                          admin@movicloud.com
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setActiveTab("settings")}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Preferences
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">
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
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="container mx-auto"
        >
          <div className="border-b bg-white sticky top-[73px] z-40">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 bg-transparent border-0 rounded-none">
              <TabsTrigger
                value="customer"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4"
              >
                <MenuIcon className="h-4 w-4" />
                Customer Menu
              </TabsTrigger>
              <TabsTrigger
                value="dashboard"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="customers"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4"
              >
                <Users className="h-4 w-4" />
                Customers
              </TabsTrigger>
              <TabsTrigger
                value="menu"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4"
              >
                <UtensilsCrossed className="h-4 w-4" />
                Menu Management
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4"
              >
                <ShoppingCart className="h-4 w-4" />
                Orders
              </TabsTrigger>
              <TabsTrigger
                value="kitchen"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4"
              >
                <ChefHat className="h-4 w-4" />
                Kitchen
              </TabsTrigger>
              <TabsTrigger
                value="tables"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4"
              >
                <Users className="h-4 w-4" />
                Tables
              </TabsTrigger>
              <TabsTrigger
                value="inventory"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4"
              >
                <Package className="h-4 w-4" />
                Inventory
              </TabsTrigger>
              <TabsTrigger
                value="staff"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4"
              >
                <UserCog className="h-4 w-4" />
                Staff
              </TabsTrigger>
              <TabsTrigger
                value="billing"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4"
              >
                <CreditCard className="h-4 w-4" />
                Billing
              </TabsTrigger>
              <TabsTrigger
                value="delivery"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4"
              >
                <Truck className="h-4 w-4" />
                Delivery
              </TabsTrigger>
              <TabsTrigger
                value="offers"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4"
              >
                <Tag className="h-4 w-4" />
                Offers & Loyalty
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4"
              >
                <BarChart3 className="h-4 w-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4"
              >
                <BellRing className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg px-4"
              >
                <Settings className="h-4 w-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="customer" className="mt-0">
            <CustomerView />
          </TabsContent>

          <TabsContent value="dashboard" className="mt-0">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="customers" className="mt-0">
            <CustomerManagement />
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
            <InventoryManagement
              triggerStockManagement={triggerStockManagement}
            />
          </TabsContent>

          <TabsContent value="staff" className="mt-0">
            <StaffManagement />
          </TabsContent>

          <TabsContent value="billing" className="mt-0">
            <div className="p-6">
              <BillingPaymentComprehensive />
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="mt-0">
            <DeliveryManagement />
          </TabsContent>

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
            <p className="text-sm text-muted-foreground">
              Restaurant Management System • Movicloud Labs
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Powered by RMS TEAM 2
            </p>
          </div>
        </footer>
        <AdminChatBox />
      </div>
    </TableStoreProvider>
  );
}