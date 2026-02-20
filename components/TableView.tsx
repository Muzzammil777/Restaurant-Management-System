
import React from 'react';
import { Order, Station } from '../types';
import { Utensils, Clock, Users, CheckCircle2, Loader2, Target } from 'lucide-react';

interface TableViewProps {
  orders: Order[];
  activeStation: Station;
  onSelectOrder: (order: Order) => void;
}

const TableView: React.FC<TableViewProps> = ({ orders, activeStation, onSelectOrder }) => {
  const tableNumbers = Array.from({ length: 12 }, (_, i) => `T-${(i + 1).toString().padStart(2, '0')}`);

  const getTableStatus = (tableNum: string) => {
    const order = orders.find(o => o.tableNumber === tableNum && o.type === 'DINE_IN');
    if (!order) return { state: 'EMPTY', order: null };
    
    const allItemsDone = order.items.every(item => item.status === 'COMPLETED');
    return { 
      state: allItemsDone ? 'EATING' : 'WAITING', 
      order 
    };
  };

  const stats = {
    waiting: orders.filter(o => o.type === 'DINE_IN' && !o.items.every(i => i.status === 'COMPLETED')).length,
    eating: orders.filter(o => o.type === 'DINE_IN' && o.items.every(i => i.status === 'COMPLETED')).length,
    available: tableNumbers.length - orders.filter(o => o.type === 'DINE_IN').length
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto custom-scrollbar">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 w-full shrink-0">
        <div className="bg-white p-6 rounded-[2rem] border border-gray-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-5">
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center">
              <Loader2 size={24} className="animate-spin" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">In Prep</p>
              <h4 className="text-2xl font-black text-black">{stats.waiting} Tables</h4>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Served</p>
              <h4 className="text-2xl font-black text-black">{stats.eating} Tables</h4>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-gray-200 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-5">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Available</p>
              <h4 className="text-2xl font-black text-black">{stats.available} Free</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 pb-20 w-full">
        {tableNumbers.map((tableNum) => {
          const { state, order } = getTableStatus(tableNum);
          const isWaiting = state === 'WAITING';
          const isEating = state === 'EATING';
          
          return (
            <button
              key={tableNum}
              disabled={state === 'EMPTY'}
              onClick={() => order && onSelectOrder(order)}
              className={`group relative h-52 rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col items-center justify-center overflow-hidden
                ${isWaiting ? 'bg-white border-black shadow-xl hover:scale-[1.02]' : 
                  isEating ? 'bg-emerald-50 border-emerald-500/20 border-emerald-500 shadow-md hover:scale-[1.02]' : 
                  'bg-gray-50 border-gray-100 opacity-40 hover:opacity-100 hover:bg-white'}`}
            >
              <div className="z-10 flex flex-col items-center text-center px-4">
                <span className={`text-[9px] font-black uppercase tracking-[0.4em] mb-2 ${isWaiting ? 'text-black' : isEating ? 'text-emerald-500' : 'text-gray-400'}`}>
                  {state}
                </span>
                <h3 className="text-5xl font-black text-black tracking-tighter mb-3">{tableNum}</h3>
                
                {order && (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1.5 rounded-full mb-3">
                      <Clock size={12} className={isWaiting ? 'text-black' : 'text-emerald-500'} />
                      <span className="text-[12px] font-black font-mono text-black">
                        {Math.floor((Date.now() - order.createdAt) / 60000)}m
                      </span>
                    </div>
                  </div>
                )}
                
                {!order && (
                  <Utensils size={28} className="text-gray-200" />
                )}
              </div>

              {order && (
                <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-100 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${isEating ? 'bg-emerald-500' : 'bg-black'}`}
                    style={{ width: `${(order.items.filter(i => i.status === 'COMPLETED').length / order.items.length) * 100}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TableView;