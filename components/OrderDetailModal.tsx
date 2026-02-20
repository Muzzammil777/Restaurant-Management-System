
import React from 'react';
import { Order, Station } from '../types';
import { X, CheckCircle2, Play, Target } from 'lucide-react';

interface OrderDetailModalProps {
  order: Order;
  activeStation: Station;
  onClose: () => void;
  onCompleteItem: (orderId: string, itemId: string) => void;
  onUpdateStatus: (id: string, status: any) => void;
  onStartStationItems?: (orderId: string, station: Station) => void;
  onFinishStationItems?: (orderId: string, station: Station) => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ 
  order, 
  activeStation, 
  onClose, 
  onCompleteItem, 
  onUpdateStatus,
  onStartStationItems,
  onFinishStationItems
}) => {
  const isSeniorChef = activeStation === 'ALL';
  
  // Get station-specific items
  const stationItems = isSeniorChef 
    ? order.items 
    : order.items.filter(i => i.station === activeStation);
  
  // Station status tracking
  const stationPending = stationItems.filter(i => i.status === 'PENDING').length;
  const stationPreparing = stationItems.filter(i => i.status === 'PREPARING').length;
  const stationCompleted = stationItems.filter(i => i.status === 'COMPLETED').length;
  const allStationPending = stationItems.length > 0 && stationPending === stationItems.length;
  const allStationCompleted = stationItems.length > 0 && stationCompleted === stationItems.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl border border-gray-200">
        <div className="p-10 pb-8 flex justify-between items-start border-b border-gray-100 bg-gray-50/50">
          <div>
            <div className="flex items-center space-x-6">
              <h2 className="text-6xl font-black text-black tracking-tighter leading-none">{order.id}</h2>
              <span className={`px-4 py-1.5 rounded-xl text-[12px] font-black uppercase tracking-[0.2em] bg-black text-white`}>
                {order.tableNumber}
              </span>
            </div>
            <p className="text-gray-400 mt-5 font-black text-[10px] uppercase tracking-[0.3em]">
              Precision Flow • Active Section: {activeStation}
            </p>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-all">
            <X size={32} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-4 custom-scrollbar">
          {order.items.map((item) => {
            const isMyStation = activeStation === 'ALL' || item.station === activeStation;
            return (
              <div 
                key={item.id} 
                className={`p-8 rounded-[2rem] border transition-all ${
                  item.status === 'COMPLETED' 
                    ? 'bg-gray-50 border-gray-100 opacity-60' 
                    : item.status === 'PREPARING'
                      ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500 shadow-lg'
                      : isMyStation 
                        ? 'bg-white border-black ring-1 ring-black shadow-lg' 
                        : 'bg-white border-gray-100 opacity-40'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center space-x-8">
                      <span className="text-4xl font-black text-black tabular-nums">{item.quantity}×</span>
                      <div className="flex flex-col">
                        <h4 className={`text-3xl font-black tracking-tight ${item.status === 'COMPLETED' ? 'text-gray-300 line-through' : 'text-black'}`}>
                          {item.name}
                        </h4>
                        <div className="flex items-center space-x-3 mt-2">
                           <Target size={12} className={isMyStation ? "text-black" : "text-gray-300"} />
                           <span className={`text-[10px] font-black uppercase tracking-widest ${isMyStation ? 'text-black' : 'text-gray-300'}`}>
                             {item.station} UNIT
                           </span>
                           {item.status === 'PREPARING' && (
                             <span className="text-[9px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                               Cooking
                             </span>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-10">
                    {item.status === 'COMPLETED' ? (
                      <div className="flex items-center text-emerald-500 font-black space-x-3 text-[14px] uppercase tracking-widest bg-emerald-50 px-6 py-4 rounded-2xl">
                        <CheckCircle2 size={22} />
                        <span>Completed</span>
                      </div>
                    ) : item.status === 'PREPARING' ? (
                      <button 
                        onClick={() => isMyStation && onCompleteItem(order.id, item.id)}
                        disabled={!isMyStation}
                        className={`px-10 py-5 rounded-2xl font-black text-[13px] shadow-md transition-all flex items-center space-x-3 uppercase tracking-[0.15em]
                          ${isMyStation 
                            ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105' 
                            : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                      >
                        <CheckCircle2 size={20} />
                        <span>Finish</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => isMyStation && onCompleteItem(order.id, item.id)}
                        disabled={!isMyStation}
                        className={`px-10 py-5 rounded-2xl font-black text-[13px] shadow-md transition-all flex items-center space-x-3 uppercase tracking-[0.15em]
                          ${isMyStation 
                            ? 'bg-black text-white hover:scale-105' 
                            : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
                      >
                        <CheckCircle2 size={20} />
                        <span>{isMyStation ? 'Ready' : 'External'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="p-10 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          {/* Station-level bulk actions */}
          <div className="flex items-center space-x-4">
            {!isSeniorChef && stationItems.length > 0 && (
              <>
                {allStationPending && (
                  <button 
                    onClick={() => onStartStationItems?.(order.id, activeStation)}
                    className="px-8 py-4 bg-black text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center space-x-3"
                  >
                    <Play size={18} fill="currentColor" />
                    <span>Start All My Items</span>
                  </button>
                )}
                {!allStationPending && !allStationCompleted && (
                  <button 
                    onClick={() => onFinishStationItems?.(order.id, activeStation)}
                    className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[12px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center space-x-3"
                  >
                    <CheckCircle2 size={18} />
                    <span>Finish All My Items</span>
                  </button>
                )}
                {allStationCompleted && (
                  <div className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-[12px] uppercase tracking-widest flex items-center space-x-3">
                    <CheckCircle2 size={18} />
                    <span>All My Items Done</span>
                  </div>
                )}
              </>
            )}
          </div>
          
          <button onClick={onClose} className="px-12 py-5 bg-white text-black border-2 border-black rounded-2xl font-black text-[14px] uppercase tracking-widest hover:bg-gray-50 transition-all">
            Dismiss Detail
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;