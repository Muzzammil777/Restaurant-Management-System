import { useState } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/app/components/ui/tabs';
import { 
  Search, 
  ChevronDown,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";

// Import sub-components
import { StaffOverview } from "./staff/StaffOverview";
import { StaffList } from "./staff/StaffList";
import { StaffAttendance } from "./staff/StaffAttendance";
import { StaffShiftTimings } from "./staff/StaffShiftTimings";
import { StaffReports } from "./staff/StaffReports";

export function StaffManagement() {
  const [activeTab, setActiveTab] = useState('overview');

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

      <div className="flex-1 container mx-auto px-6 py-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-100 mb-6 bg-[#FDFCFB] sticky top-[73px] z-20 pt-2">
            <TabsList className="bg-transparent h-auto p-0 flex justify-start gap-8 overflow-x-auto no-scrollbar">
              <TabsTrigger 
                value="overview" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#8B5A2B] data-[state=active]:bg-transparent px-0 pb-3 text-sm font-bold text-gray-400 data-[state=active]:text-gray-800 transition-all uppercase tracking-tight"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="staff" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#8B5A2B] data-[state=active]:bg-transparent px-0 pb-3 text-sm font-bold text-gray-400 data-[state=active]:text-gray-800 transition-all uppercase tracking-tight"
              >
                Staff
              </TabsTrigger>
              <TabsTrigger 
                value="attendance" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#8B5A2B] data-[state=active]:bg-transparent px-0 pb-3 text-sm font-bold text-gray-400 data-[state=active]:text-gray-800 transition-all uppercase tracking-tight"
              >
                Attendance
              </TabsTrigger>
              <TabsTrigger 
                value="shift-timings" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#8B5A2B] data-[state=active]:bg-transparent px-0 pb-3 text-sm font-bold text-gray-400 data-[state=active]:text-gray-800 transition-all uppercase tracking-tight"
              >
                Shift Timings
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#8B5A2B] data-[state=active]:bg-transparent px-0 pb-3 text-sm font-bold text-gray-400 data-[state=active]:text-gray-800 transition-all uppercase tracking-tight"
              >
                Reports
              </TabsTrigger>
            </TabsList>
          </div>

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
