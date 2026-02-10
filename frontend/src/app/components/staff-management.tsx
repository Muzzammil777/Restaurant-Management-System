import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { 
  Tabs, 
  TabsContent, 
} from '@/app/components/ui/tabs';
import { 
  Search, 
  LayoutDashboard,
  Users,
  CalendarCheck,
  Clock,
  FileBarChart,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { cn } from '@/app/components/ui/utils';

// Import sub-components
import { StaffOverview } from "./staff/StaffOverview";
import { StaffList } from "./staff/StaffList";
import { StaffAttendance } from "./staff/StaffAttendance";
import { StaffShiftTimings } from "./staff/StaffShiftTimings";
import { StaffReports } from "./staff/StaffReports";

export function StaffManagement() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, description: 'Staff overview' },
    { id: 'staff', label: 'Staff', icon: Users, description: 'Employee records' },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck, description: 'Daily tracking' },
    { id: 'shift-timings', label: 'Shift Timings', icon: Clock, description: 'Schedule management' },
    { id: 'reports', label: 'Reports', icon: FileBarChart, description: 'Analytics & insights' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col">
      {/* Module Header Bar */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30">
        <div className="relative w-full md:w-[400px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B5A2B]" />
          <Input 
            placeholder="Search employee records or schedules..." 
            className="pl-10 bg-gray-50 border-none rounded-xl h-10 text-sm focus-visible:ring-1 focus-visible:ring-[#8B5A2B]"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800 leading-none">Alex Morgan</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight mt-1">System Admin</p>
          </div>
          <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" />
            <AvatarFallback className="bg-[#8B5A2B] text-white font-bold">AM</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="flex-1 container mx-auto px-6 py-4">
        {/* Custom Tab Navigation - matching Inventory style */}
        <div className="w-full overflow-x-auto pb-6">
          <nav className="flex gap-3 min-w-max p-1">
            {tabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg transition-colors text-left min-w-[180px]',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border hover:bg-muted shadow-sm'
                  )}
                >
                  <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', isActive ? '' : 'text-muted-foreground')} />
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium', isActive ? '' : '')}>
                      {item.label}
                    </p>
                    <p className={cn('text-xs mt-0.5', isActive ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

          <TabsContent value="overview" className="mt-0 focus-visible:outline-none">
            <StaffOverview />
          </TabsContent>

          <TabsContent value="staff" className="mt-0 focus-visible:outline-none">
            <StaffList />
          </TabsContent>

          <TabsContent value="attendance" className="mt-0 focus-visible:outline-none">
            <StaffAttendance />
          </TabsContent>

          <TabsContent value="shift-timings" className="mt-0 focus-visible:outline-none">
            <StaffShiftTimings />
          </TabsContent>

          <TabsContent value="reports" className="mt-0 focus-visible:outline-none">
            <StaffReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
