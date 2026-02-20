
import React from 'react';
import { Order, Station } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Clock, AlertTriangle, CheckCircle, Target, Activity } from 'lucide-react';

interface StatsViewProps {
  orders: Order[];
  activeStation?: Station;
}

const StatsView: React.FC<StatsViewProps> = ({ orders, activeStation = 'ALL' }) => {
  // Calculate real stats from orders
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'READY' || o.status === 'DELIVERED').length;
  const inProgressOrders = orders.filter(o => o.status === 'COOKING').length;
  const delayedOrders = orders.filter(o => (Date.now() - o.createdAt) > 600000 && o.status !== 'READY').length;
  
  // Calculate station-specific stats
  const stationItems = orders.flatMap(o => o.items).filter(i => 
    activeStation === 'ALL' || i.station === activeStation
  );
  const completedItems = stationItems.filter(i => i.status === 'COMPLETED').length;
  const efficiencyRate = stationItems.length > 0 
    ? Math.round((completedItems / stationItems.length) * 100) 
    : 100;

  // Mock hourly data (in real app, this would come from backend)
  const hourlyData = [
    { time: '08:00', orders: 12 },
    { time: '09:00', orders: 18 },
    { time: '10:00', orders: 25 },
    { time: '11:00', orders: 40 },
    { time: '12:00', orders: 65 },
    { time: '13:00', orders: 58 },
    { time: '14:00', orders: 30 },
  ];

  // Calculate dish popularity from current orders
  const dishCounts = new Map<string, number>();
  orders.forEach(o => {
    o.items.forEach(item => {
      if (activeStation === 'ALL' || item.station === activeStation) {
        dishCounts.set(item.name, (dishCounts.get(item.name) || 0) + item.quantity);
      }
    });
  });
  const dishData = Array.from(dishCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const cards = [
    { label: 'Avg. Prep Time', value: '8.4 min', icon: <Clock size={20} />, color: '#F59E0B' },
    { label: 'Total Orders', value: totalOrders.toString(), icon: <TrendingUp size={20} />, color: '#10B981' },
    { label: 'Delayed Today', value: delayedOrders.toString(), icon: <AlertTriangle size={20} />, color: '#EF4444' },
    { label: 'Efficiency Rate', value: `${efficiencyRate}%`, icon: <CheckCircle size={20} />, color: '#3B82F6' },
  ];

  return (
    <div className="h-full p-8 overflow-y-auto bg-[#F9FAFB] custom-scrollbar">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-xl bg-black text-white">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-black tracking-tight uppercase">
                Performance Analytics
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <Target size={10} className="text-gray-400" />
                <p className="text-gray-400 font-black uppercase tracking-[0.15em] text-[9px]">
                  Real-time Metrics • {activeStation} UNIT
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                  {card.icon}
                </div>
                <span className="text-gray-400 text-[9px] font-black uppercase tracking-[0.15em]">{card.label}</span>
              </div>
              <p className="text-4xl font-black text-black">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Volume Chart */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
            <h3 className="text-sm font-black text-black mb-6 uppercase tracking-widest">Order Volume (Hourly)</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#000000" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#000000" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="time" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '16px', color: '#000000', fontWeight: 'bold' }}
                    itemStyle={{ color: '#000000' }}
                  />
                  <Area type="monotone" dataKey="orders" stroke="#000000" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Popular Dishes Chart */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm">
            <h3 className="text-sm font-black text-black mb-6 uppercase tracking-widest">Most Prepared Dishes</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dishData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={11} width={120} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{ fill: '#F3F4F6' }}
                    contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '16px', color: '#000000', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={32}>
                    {dishData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#000000' : '#E5E7EB'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-black p-8 rounded-[2rem] text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">New Orders</span>
              <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
            </div>
            <p className="text-5xl font-black">{orders.filter(o => o.status === 'NEW').length}</p>
          </div>
          <div className="bg-amber-500 p-8 rounded-[2rem] text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-100">In Progress</span>
              <Clock size={16} className="text-amber-100" />
            </div>
            <p className="text-5xl font-black">{inProgressOrders}</p>
          </div>
          <div className="bg-emerald-500 p-8 rounded-[2rem] text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-100">Ready</span>
              <CheckCircle size={16} className="text-emerald-100" />
            </div>
            <p className="text-5xl font-black">{completedOrders}</p>
          </div>
        </div>

        {/* Efficiency Insight */}
        <div className="bg-gradient-to-r from-black to-gray-800 p-8 rounded-[2rem] text-white flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="bg-white/10 p-4 rounded-2xl">
              <TrendingUp size={32} />
            </div>
            <div>
              <h4 className="text-2xl font-black">Kitchen Performance Summary</h4>
              <p className="font-medium text-gray-300 mt-1">
                {efficiencyRate >= 90 ? 'Excellent workflow - all stations operating efficiently.' : 
                 efficiencyRate >= 70 ? 'Good performance - minor delays detected.' :
                 'Attention needed - significant delays in production.'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-6xl font-black">{efficiencyRate}%</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">Efficiency</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsView;
