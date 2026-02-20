
import React, { useEffect, useState } from 'react';
import { Order, OrderStatus, Station } from '../types';
import { Clock, AlertTriangle, Play, CheckCircle2, Flame, Utensils, Truck, ShoppingBag, Target } from 'lucide-react';

interface OrderCardProps {
  order: Order;
  activeStation: Station;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onTogglePriority: (id: string) => void;
  onOpenDetail: (order: Order) => void;
  onNotify?: (id: string) => void;
  onStartStationItems?: (orderId: string, station: Station) => void;
  onFinishStationItems?: (orderId: string, station: Station) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  activeStation, 
  onUpdateStatus, 
  onTogglePriority, 
  onOpenDetail, 
  onNotify,
  onStartStationItems,
  onFinishStationItems 
}) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = order.createdAt;
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const isDelayed = elapsed > 600;
  const isSeniorChef = activeStation === 'ALL';

  const typeIcons = {
    DINE_IN: <Utensils size={12} />,
    DELIVERY: <Truck size={12} />,
    PARCEL: <ShoppingBag size={12} />
  };

  const relevantItems = isSeniorChef 
    ? order.items 
    : order.items.filter(i => i.station === activeStation);

  const otherItemsCount = order.items.length - relevantItems.length;

  // Station-level status tracking
  const stationItemsPending = relevantItems.filter(i => i.status === 'PENDING').length;
  const stationItemsPreparing = relevantItems.filter(i => i.status === 'PREPARING').length;
  const stationItemsCompleted = relevantItems.filter(i => i.status === 'COMPLETED').length;
  const allStationItemsCompleted = relevantItems.length > 0 && stationItemsCompleted === relevantItems.length;
  const allStationItemsPending = relevantItems.length > 0 && stationItemsPending === relevantItems.length;
  const someStationItemsPreparing = stationItemsPreparing > 0 || (stationItemsCompleted > 0 && stationItemsPending > 0);

  return (
    <div 
      className={`relative bg-white rounded-3xl overflow-hidden shadow-sm transition-all border border-gray-100 flex flex-col cursor-pointer hover:shadow-xl hover:border-black/10
      ${order.priority ? 'border-red-500 ring-2 ring-red-50' : ''}`}
      onClick={() => onOpenDetail(order)}
    >
      <div 
        className="absolute left-0 top-0 bottom-0 w-2"
        style={{ backgroundColor: order.status === 'READY' ? '#10B981' : order.status === 'COOKING' ? '#F59E0B' : '#000000' }}
      />

      <div className="p-6 pl-8 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
               <span className="text-xl font-black text-black tracking-tighter leading-none">{order.id}</span>
               {order.priority && <AlertTriangle size={14} className="text-red-500" fill="currentColor" />}
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${order.type === 'DINE_IN' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>
                {typeIcons[order.type]}
                <span className="font-black text-xs">{order.tableNumber}</span>
              </div>
            </div>
          </div>
          
          <div className={`flex items-center space-x-1.5 font-mono text-base font-black ${isDelayed ? 'text-red-500' : 'text-gray-900'}`}>
            <Clock size={16} />
            <span>{formatTime(elapsed)}</span>
          </div>
        </div>

        <div className="space-y-3 my-4">
          {relevantItems.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex justify-between items-start">
                <span className="flex-1 mr-2 text-gray-900 text-[15px] font-bold leading-tight">
                  <span className="text-gray-400 font-black mr-2">{item.quantity}x</span> 
                  {item.name}
                </span>
                {item.status === 'COMPLETED' ? (
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5" />
                ) : (
                  <div className="w-4 h-4 rounded border border-gray-200 mt-0.5" />
                )}
              </div>
              {isSeniorChef && (
                <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.2em] mt-1">
                  {item.station}
                </span>
              )}
            </div>
          ))}
          
          {!isSeniorChef && otherItemsCount > 0 && (
            <div className="flex items-center space-x-2 mt-4 pt-3 border-t border-gray-50 text-gray-300">
              <Target size={12} />
              <span className="text-[9px] font-black uppercase tracking-[0.1em]">+{otherItemsCount} EXTERNALS</span>
            </div>
          )}
        </div>

        <div className="flex space-x-2 mt-4">
          {/* Station Chef: START their items (all their items are pending) */}
          {!isSeniorChef && allStationItemsPending && (
            <button 
              onClick={(e) => { e.stopPropagation(); onStartStationItems?.(order.id, activeStation); }}
              className="flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-black text-white font-black text-[11px] hover:bg-gray-800 transition-all uppercase tracking-widest shadow-md"
            >
              <Play size={14} fill="currentColor" />
              <span>START</span>
            </button>
          )}
          
          {/* Station Chef: FINISH their items (some are preparing, none pending) */}
          {!isSeniorChef && !allStationItemsPending && !allStationItemsCompleted && (
            <button 
              onClick={(e) => { e.stopPropagation(); onFinishStationItems?.(order.id, activeStation); }}
              className="flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-emerald-500 text-white font-black text-[11px] hover:bg-emerald-600 transition-all uppercase tracking-widest shadow-md"
            >
              <CheckCircle2 size={14} />
              <span>FINISH</span>
            </button>
          )}
          
          {/* Station Chef: Shows DONE badge when their items are completed */}
          {!isSeniorChef && allStationItemsCompleted && order.status !== 'READY' && (
            <div className="flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-gray-100 text-gray-500 font-black text-[11px] uppercase tracking-widest">
              <CheckCircle2 size={14} />
              <span>DONE</span>
            </div>
          )}

          {/* Senior Chef: Original order-level controls */}
          {isSeniorChef && order.status === 'NEW' && (
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateStatus(order.id, 'COOKING'); }}
              className="flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-black text-white font-black text-[11px] hover:bg-gray-800 transition-all uppercase tracking-widest shadow-md"
            >
              <Play size={14} fill="currentColor" />
              <span>START</span>
            </button>
          )}
          {isSeniorChef && order.status === 'COOKING' && (
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateStatus(order.id, 'READY'); }}
              className="flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-emerald-500 text-white font-black text-[11px] hover:bg-emerald-600 transition-all uppercase tracking-widest shadow-md"
            >
              <CheckCircle2 size={14} />
              <span>FINISH</span>
            </button>
          )}
          
          {/* DELIVER button - only for Senior Chef or PREP station when order is READY */}
          {order.status === 'READY' && (isSeniorChef || activeStation === 'PREP') && (
            <button 
              onClick={(e) => { e.stopPropagation(); onNotify?.(order.id); }}
              className="flex-1 flex items-center justify-center space-x-2 py-3.5 rounded-2xl bg-black text-white font-black text-[11px] hover:bg-gray-800 transition-all uppercase tracking-widest shadow-md"
            >
              <Flame size={14} />
              <span>DELIVER</span>
            </button>
          )}
          
          <button 
            onClick={(e) => { e.stopPropagation(); onTogglePriority(order.id); }}
            className={`p-3.5 rounded-2xl border transition-all ${order.priority ? 'bg-red-500 text-white border-red-500' : 'bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100'}`}
          >
            <AlertTriangle size={16} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderCard;