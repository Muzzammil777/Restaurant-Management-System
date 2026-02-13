import React, { useState, useEffect } from 'react';
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
  Download, 
  Plus, 
  Pencil, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { staffApi } from '@/utils/api';

const mockStaff = [
  { id: '#ST-001', name: 'Alex Johnson', role: 'CHEF', shift: 'Morning (08:00 - 16:00)', status: 'Active', initials: 'AJ' },
  { id: '#ST-002', name: 'Maria Garcia', role: 'WAITER', shift: 'Morning (08:00 - 16:00)', status: 'Active', initials: 'MG' },
  { id: '#ST-003', name: 'James Smith', role: 'CASHIER', shift: 'Evening (16:00 - 00:00)', status: 'Off-duty', initials: 'JS' },
  { id: '#ST-004', name: 'Linda Chen', role: 'CHEF', shift: 'Evening (16:00 - 00:00)', status: 'Active', initials: 'LC' },
];

interface StaffMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  shift: string;
  department?: string;
  salary?: number;
  active: boolean;
  hireDate?: string;
}

export function StaffList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStaff();
  }, [roleFilter, shiftFilter]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: { role?: string; active?: boolean; shift?: string } = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (shiftFilter !== 'all') params.shift = shiftFilter;
      
      const data = await staffApi.list(params);
      setStaff(data || []);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  };

  const filteredStaff = staff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getShiftLabel = (shift: string) => {
    const shifts: Record<string, string> = {
      'morning': 'Morning (08:00 - 16:00)',
      'evening': 'Evening (16:00 - 00:00)',
      'night': 'Night (00:00 - 08:00)'
    };
    return shifts[shift] || shift;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-[#2D2D2D]">Staff Management</h2>
          <p className="text-muted-foreground">Manage and monitor your restaurant team members and schedules.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2 bg-white border-gray-200">
            <FileDown className="h-4 w-4" />
            Export as PDF
          </Button>
          <Button variant="outline" className="gap-2 bg-white border-gray-200">
            <Download className="h-4 w-4" />
            Export Records
          </Button>
          <Button className="gap-2 bg-[#1A1A1A] hover:bg-black text-white px-6">
            <Plus className="h-4 w-4" />
            Add New Member
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden bg-white rounded-2xl">
        <CardContent className="p-0">
          <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search staff by name, role, or ID..." 
                className="pl-10 bg-[#FDFCFB] border-none rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Role:</span>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[120px] bg-transparent border-none font-semibold text-gray-700">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="chef">Chef</SelectItem>
                    <SelectItem value="waiter">Waiter</SelectItem>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Shift:</span>
                <Select value={shiftFilter} onValueChange={setShiftFilter}>
                  <SelectTrigger className="w-[120px] bg-transparent border-none font-semibold text-gray-700">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="evening">Evening</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#FDFCFB]">
                <tr className="text-left text-gray-400 uppercase tracking-wider text-[11px] font-bold border-b border-gray-100">
                  <th className="px-6 py-4">Staff ID</th>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Shift</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Loading staff data...</span>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                      No staff members found
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((member) => (
                    <tr key={member._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-gray-400 font-medium">#{member._id.slice(-6).toUpperCase()}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-semibold text-xs border border-white shadow-sm">
                            {getInitials(member.name)}
                          </div>
                          <span className="font-semibold text-gray-800">{member.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="bg-gray-50 text-gray-400 border-none font-bold text-[10px] py-1 px-3">
                          {member.role?.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{getShiftLabel(member.shift)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${member.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className={member.active ? 'text-green-600 font-medium' : 'text-gray-400 font-medium'}>
                            {member.active ? 'Active' : 'Off-duty'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-[#8B5A2B] hover:bg-[#8B5A2B]/10">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:bg-gray-100">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {loading ? 'Loading...' : `Showing 1 to ${filteredStaff.length} of ${staff.length} results`}
            </span>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 rounded-lg bg-[#1A1A1A] text-white border-none p-0">1</Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg text-gray-400 p-0">2</Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg text-gray-400 p-0">3</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-gray-400">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
