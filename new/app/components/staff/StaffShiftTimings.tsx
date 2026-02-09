import React from 'react';
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Clock, TrendingUp, Info } from 'lucide-react';

const mockRoster = [
  { 
    id: 1, 
    name: 'Jonathan Doe', 
    role: 'HEAD CHEF', 
    rate: '₹4,460/h', 
    baseRate: '₹4,460.00/h',
    otMultiplier: '1.5x',
    startTime: '08:00 AM',
    endTime: '06:00 PM',
    adjustment: '0',
    totalHours: '10.0',
    otPay: '₹13,380.00'
  },
  { 
    id: 2, 
    name: 'Maria Garcia', 
    role: 'LEAD SERVER', 
    rate: '₹1,680/h', 
    baseRate: '₹1,680.00/h',
    otMultiplier: '1.5x',
    startTime: '10:00 AM',
    endTime: '06:00 PM',
    adjustment: '2',
    totalHours: '10.0',
    otPay: '₹5,040.00'
  },
  { 
    id: 3, 
    name: 'Michael Chen', 
    role: 'SOUS CHEF', 
    rate: '₹2,835/h', 
    baseRate: '₹2,835.00/h',
    otMultiplier: '1.5x',
    startTime: '02:00 PM',
    endTime: '11:00 PM',
    adjustment: '0',
    totalHours: '9.0',
    otPay: '₹4,252.50'
  },
  { 
    id: 4, 
    name: 'Sarah Wilson', 
    role: 'JUNIOR SERVER', 
    rate: '₹1,470/h', 
    baseRate: '₹1,470.00/h',
    otMultiplier: '1.5x',
    startTime: '04:00 PM',
    endTime: '12:00 AM',
    adjustment: '0',
    totalHours: '8.0',
    otPay: '₹0.00 Extra'
  },
];

export function StaffShiftTimings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#2D2D2D]">Shift Timings & Allocation</h2>
          <p className="text-muted-foreground">Manage mandatory shifts and customize financial rates per employee.</p>
        </div>
        <div className="bg-[#1A1A1A] text-white rounded-xl p-1 flex items-center shadow-lg">
          <div className="bg-[#8B5A2B] px-3 py-2 rounded-lg text-center flex flex-col justify-center">
            <span className="text-[10px] font-bold tracking-tighter leading-none">RATE</span>
          </div>
          <div className="px-4 py-2 flex flex-col items-start leading-tight">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Global Mode</span>
            <span className="text-sm font-semibold">Standard View</span>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FDFCFB]/50">
                <tr className="text-left text-gray-400 uppercase tracking-wider text-[11px] font-bold border-b border-gray-100">
                  <th className="px-6 py-4 w-12 text-center">
                    <Checkbox className="rounded" />
                  </th>
                  <th className="px-6 py-4">Employee & Rates</th>
                  <th className="px-6 py-4">Financials</th>
                  <th className="px-6 py-4">Shift Allocation</th>
                  <th className="px-6 py-4">Admin Adjustment</th>
                  <th className="px-6 py-4 text-right">Payroll Impact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockRoster.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-6 text-center">
                      <Checkbox className="rounded" />
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-semibold text-xs border border-white shadow-sm">
                          {item.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-bold text-gray-800">{item.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.role}</span>
                            <Badge className="bg-orange-50 text-orange-600 border-none font-bold text-[9px] px-2 py-0">RATE: {item.rate}</Badge>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div>
                        <div className="font-bold text-gray-800">Base: {item.baseRate}</div>
                        <div className="text-[10px] font-bold text-gray-400">OT Multiplier: {item.otMultiplier}</div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg flex items-center gap-2 font-bold text-gray-700 w-32 justify-between">
                          <span>{item.startTime}</span>
                          <Clock className="h-3 w-3 text-gray-400" />
                        </div>
                        <span className="text-gray-300">→</span>
                        <div className="bg-white border border-gray-200 px-3 py-2 rounded-lg flex items-center gap-2 font-bold text-gray-700 w-32 justify-between">
                          <span>{item.endTime}</span>
                          <Clock className="h-3 w-3 text-gray-400" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-2">
                        <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg font-bold text-gray-800 w-16 text-center">
                          {item.adjustment}
                        </div>
                        <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Hours</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <div>
                        <div className="font-bold text-[#8B5A2B] text-base">{item.totalHours} Total Hours</div>
                        <div className={`text-xs font-bold ${item.otPay.includes('Extra') ? 'text-gray-300' : 'text-green-600'}`}>
                          {item.otPay.includes('Extra') ? item.otPay : `+ ${item.otPay} OT Pay`}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#FDFCFB]/30">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-400" />
              <p className="text-xs text-muted-foreground font-medium">Auto-calculation engine active based on mandatory shifts.</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="text-gray-400 font-bold uppercase tracking-widest text-[11px] px-6">Modify Financial Rates</Button>
              <Button className="bg-[#1A1A1A] hover:bg-black text-white px-8 py-6 rounded-xl font-bold uppercase tracking-widest text-[11px]">Publish Roster</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
