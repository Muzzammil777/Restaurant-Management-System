import React from 'react';
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/app/components/ui/select";
import { 
  Search, 
  FileDown, 
  Plus, 
  Pencil, 
  Calendar as CalendarIcon,
  Clock,
  UserX,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { motion } from "motion/react";
import { ImageWithFallback } from "../figma/ImageWithFallback";

const mockAttendance = [
  { 
    id: 1, 
    name: 'James Wilson', 
    role: 'Head Chef', 
    shift: 'Morning', 
    clockIn: '07:55 AM', 
    clockInStatus: 'EARLY',
    clockOut: '04:05 PM', 
    hours: '8', 
    pay: '₹14,000.00', 
    payRate: '₹1,750/hr',
    status: 'PRESENT',
    image: 'https://images.unsplash.com/photo-1595436222774-4b1cd819aada?w=100&h=100&fit=crop'
  },
  { 
    id: 2, 
    name: 'Sarah Jenkins', 
    role: 'Waitress', 
    shift: 'Morning', 
    clockIn: '08:15 AM', 
    clockInStatus: '15M LATE',
    clockOut: '04:00 PM', 
    hours: '7.75', 
    pay: '₹9,765.00', 
    payRate: '₹1,260/hr',
    status: 'LATE',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
  },
  { 
    id: 3, 
    name: 'Michael Chen', 
    role: 'Sous Chef', 
    shift: 'Morning', 
    clockIn: '--:--', 
    clockInStatus: '',
    clockOut: '--:--', 
    hours: '0', 
    pay: '₹0.00', 
    payRate: '₹1,540/hr',
    status: 'ABSENT',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
  },
];

export function StaffAttendance() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#2D2D2D]">Attendance Tracking</h2>
          <p className="text-muted-foreground">Real-time staff monitoring and shift verification.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2 bg-white border-gray-200 shadow-sm">
            <CalendarIcon className="h-4 w-4 text-[#8B5A2B]" />
            Export
          </Button>
          <Button className="gap-2 bg-[#1A1A1A] hover:bg-black text-white px-6">
            <Plus className="h-4 w-4" />
            Manual Entry
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Active On-Site</p>
                <div className="text-4xl font-bold text-[#2D2D2D]">42/46</div>
              </div>
              <Badge className="bg-green-50 text-green-600 border-none font-bold text-[10px]">+5.2%</Badge>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <motion.div 
                className="bg-green-500 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '91.3%' }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Late Today</p>
                <div className="text-4xl font-bold text-[#2D2D2D]">3</div>
                <p className="text-xs text-muted-foreground mt-2">Pending review: <span className="font-semibold text-gray-700">1</span></p>
              </div>
              <div className="bg-orange-50 text-orange-600 rounded-full h-8 w-8 flex items-center justify-center font-bold text-xs">-2</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Absences</p>
                <div className="text-4xl font-bold text-[#2D2D2D]">1</div>
                <p className="text-xs text-muted-foreground mt-2">Unexcused this week: <span className="font-semibold text-gray-700">2</span></p>
              </div>
              <div className="text-red-600 font-bold text-xl">1</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white rounded-2xl">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="bg-[#FDFCFB] border border-gray-100 px-3 py-2 rounded-xl flex items-center gap-2 text-sm text-gray-600">
                <span className="font-medium">24-10-2024</span>
                <CalendarIcon className="h-4 w-4 text-gray-400" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px] bg-[#FDFCFB] border-none rounded-xl text-sm font-medium">
                  <SelectValue placeholder="All Departments" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by name..." 
                className="pl-10 bg-[#FDFCFB] border-none rounded-xl"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FDFCFB]">
                <tr className="text-left text-gray-400 uppercase tracking-wider text-[11px] font-bold border-b border-gray-100">
                  <th className="px-6 py-4">Staff Member</th>
                  <th className="px-6 py-4">Shift</th>
                  <th className="px-6 py-4">Clock In</th>
                  <th className="px-6 py-4">Clock Out</th>
                  <th className="px-6 py-4">Hours</th>
                  <th className="px-6 py-4">Pay</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-100 shadow-sm">
                          <ImageWithFallback src={record.image} alt={record.name} className="h-full w-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{record.name}</div>
                          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{record.role}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-medium">{record.shift}</td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-gray-800">{record.clockIn}</div>
                        {record.clockInStatus && (
                          <div className={`text-[9px] font-bold uppercase tracking-tighter ${record.clockInStatus === 'EARLY' ? 'text-green-500' : 'text-orange-500'}`}>
                            {record.clockInStatus}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium">{record.clockOut}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="bg-white border border-gray-200 px-3 py-1 rounded-md font-bold text-gray-800 w-14 text-center">
                          {record.hours}
                        </div>
                        <span className="text-gray-400 text-xs font-medium">hrs</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-green-600">{record.pay}</div>
                        <div className="text-[10px] font-bold text-gray-400">{record.payRate}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={`border-none font-bold text-[10px] px-3 py-1 ${
                        record.status === 'PRESENT' ? 'bg-green-50 text-green-600' : 
                        record.status === 'LATE' ? 'bg-orange-50 text-orange-600' : 
                        'bg-red-50 text-red-600'
                      }`}>
                        {record.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-[#8B5A2B] hover:bg-[#8B5A2B]/10">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
