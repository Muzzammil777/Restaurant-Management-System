import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { FileDown, Calendar as CalendarIcon, Info, CheckCircle2 } from 'lucide-react';

const expenditureData = [
  { name: 'Kitchen', regular: 12000, overtime: 3000 },
  { name: 'Service', regular: 8000, overtime: 1200 },
  { name: 'Cleaning', regular: 3500, overtime: 200 },
  { name: 'Bar', regular: 5500, overtime: 1500 },
];

const payrollSplitData = [
  { name: 'Regular Salary', value: 86.7, color: '#1A1A1A' },
  { name: 'Mandatory Overtime', value: 13.3, color: '#8B5A2B' },
];

export function StaffReports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#2D2D2D]">Financial & Labor Reports</h2>
          <p className="text-muted-foreground">Detailed analysis of labor distribution and mandatory overtime expenditures.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-white border-gray-100 rounded-xl shadow-sm">
            <CalendarIcon className="h-4 w-4 text-[#8B5A2B]" />
            Monthly View
          </Button>
          <Button className="bg-[#1A1A1A] hover:bg-black text-white px-6 rounded-xl">
            Download Payroll CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-bold text-gray-800">Overtime Expenditure by Department</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expenditureData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9CA3AF', fontSize: 12}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9CA3AF', fontSize: 12}}
                  />
                  <Tooltip 
                    cursor={{fill: '#FDFCFB'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                  />
                  <Bar dataKey="regular" stackId="a" fill="#E5DDD3" radius={[0, 0, 0, 0]} barSize={80} name="REGULAR SALARY" />
                  <Bar dataKey="overtime" stackId="a" fill="#8B5A2B" radius={[4, 4, 0, 0]} barSize={80} name="MANDATORY OVERTIME" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-6 mt-6 ml-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-[#E5DDD3]" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Regular Salary</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-sm bg-[#8B5A2B]" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mandatory Overtime</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-2xl flex flex-col items-center justify-center p-6">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">Payroll Split</p>
          <div className="relative h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={payrollSplitData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {payrollSplitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-[#1A1A1A]">13.3%</span>
              <span className="text-[10px] font-bold text-[#8B5A2B] uppercase tracking-tighter">OT to Total Ratio</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl bg-[#1A1A1A] text-white rounded-2xl">
          <CardContent className="p-8">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Total Overtime Paid</p>
            <div className="text-4xl font-bold mb-6">₹4,55,000.00</div>
            <div className="bg-white/5 p-4 rounded-xl border border-white/10">
              <p className="text-xs text-gray-400">Calculated from 124 Excess Hours</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardContent className="p-8">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Avg OT Per Employee</p>
            <div className="text-4xl font-bold text-[#2D2D2D] mb-4">4.2h</div>
            <p className="text-sm text-muted-foreground">Weekly allocation average</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardContent className="p-8">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Policy Violations</p>
            <div className="text-4xl font-bold text-red-600 mb-6">0</div>
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <p className="text-xs font-bold">All shifts allocated within legal limits</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
