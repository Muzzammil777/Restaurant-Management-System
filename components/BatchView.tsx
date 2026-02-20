
import React, { useMemo } from 'react';
import { Order, Station } from '../types';
import { ChefHat, CheckCircle2, Play, Target, Layers } from 'lucide-react';

interface BatchViewProps {
  orders: Order[];
  activeStation: Station;
  onCompleteItem: (orderId: string, itemId: string) => void;
  onStartStationItems?: (orderId: string, station: Station) => void;
  onFinishStationItems?: (orderId: string, station: Station) => void;
}

const BatchView: React.FC<BatchViewProps> = ({ orders, activeStation, onCompleteItem, onStartStationItems, onFinishStationItems }) => {
  const isSeniorChef = activeStation === 'ALL';

  const batchedItems = useMemo(() => {
    const map = new Map<string, { 
      name: string; 
      total: number; 
      pendingCount: number;
      preparingCount: number;
      completedCount: number;
      instances: { orderId: string; itemId: string; status: string }[]; 
      station: Station 
    }>();
    
    orders.forEach(order => {
      if (order.status === 'NEW' || order.status === 'COOKING') {
        order.items.forEach(item => {
          const isRelevant = isSeniorChef || item.station === activeStation;
          if (isRelevant) {
            const key = isSeniorChef ? `${item.name}-${item.station}` : item.name;
            const existing = map.get(key) || { 
              name: item.name, 
              total: 0, 
              pendingCount: 0,
              preparingCount: 0,
              completedCount: 0,
              instances: [], 
              station: item.station 
            };
            existing.total += item.quantity;
            if (item.status === 'PENDING') existing.pendingCount += item.quantity;
            if (item.status === 'PREPARING') existing.preparingCount += item.quantity;
            if (item.status === 'COMPLETED') existing.completedCount += item.quantity;
            existing.instances.push({ orderId: order.id, itemId: item.id, status: item.status });
            map.set(key, existing);
          }
        });
      }
    });

    return Array.from(map.values())
      .filter(b => b.pendingCount > 0 || b.preparingCount > 0) // Only show items that need work
      .sort((a, b) => b.total - a.total);
  }, [orders, activeStation, isSeniorChef]);

  const handleStartBatch = (instances: { orderId: string; itemId: string; status: string }[], station: Station) => {
    // Start all pending items in this batch
    const pendingInstances = instances.filter(i => i.status === 'PENDING');
    const uniqueOrderIds = [...new Set(pendingInstances.map(i => i.orderId))];
    uniqueOrderIds.forEach(orderId => {
      onStartStationItems?.(orderId, station);
    });
  };

  const handleFinishBatch = (instances: { orderId: string; itemId: string; status: string }[], station: Station) => {
    // Finish all non-completed items in this batch
    const activeInstances = instances.filter(i => i.status !== 'COMPLETED');
    const uniqueOrderIds = [...new Set(activeInstances.map(i => i.orderId))];
    uniqueOrderIds.forEach(orderId => {
      onFinishStationItems?.(orderId, station);
    });
  };

  return (
    <div className="h-full p-8 overflow-y-auto custom-scrollbar bg-[#F9FAFB]">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-10 border-b border-gray-200 pb-6">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl bg-black text-white`}>
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-black tracking-tight uppercase">
                Aggregated Streams
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <Target size={10} className="text-gray-400" />
                <p className="text-gray-400 font-black uppercase tracking-[0.15em] text-[9px]">
                  Batch Production Optimization • {activeStation} UNIT
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {batchedItems.map((batch, idx) => {
            const allPending = batch.pendingCount === batch.total - batch.completedCount;
            const allPreparing = batch.preparingCount > 0 && batch.pendingCount === 0;
            
            return (
              <div 
                key={idx} 
                className={`bg-white p-5 rounded-2xl flex items-center justify-between border border-gray-200 hover:border-black transition-all shadow-sm group`}
              >
                <div className="flex items-center space-x-6">
                  <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center text-black border border-gray-100 shadow-inner group-hover:bg-black group-hover:text-white transition-all">
                     <span className="text-2xl font-black tabular-nums">{batch.total - batch.completedCount}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-black text-black tracking-tight leading-tight uppercase">{batch.name}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-wider">
                        {batch.instances.length} Tickets
                      </p>
                      {isSeniorChef && (
                        <span className="text-[8px] font-black bg-gray-100 px-2 py-0.5 rounded uppercase tracking-wider">
                          {batch.station}
                        </span>
                      )}
                      {batch.preparingCount > 0 && (
                        <span className="text-[8px] font-black bg-amber-100 text-amber-600 px-2 py-0.5 rounded uppercase tracking-wider animate-pulse">
                          {batch.preparingCount} Cooking
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Station Chef: START button when items are pending */}
                  {!isSeniorChef && allPending && (
                    <button 
                      onClick={() => handleStartBatch(batch.instances, batch.station)}
                      className="px-6 py-3 bg-black text-white rounded-xl font-black text-[10px] hover:bg-gray-800 transition-all flex items-center space-x-2.5 uppercase tracking-widest shadow-md"
                    >
                      <Play size={14} fill="currentColor" />
                      <span>Start Batch</span>
                    </button>
                  )}
                  
                  {/* Station Chef: FINISH button when items are preparing */}
                  {!isSeniorChef && (allPreparing || (!allPending && batch.preparingCount > 0)) && (
                    <button 
                      onClick={() => handleFinishBatch(batch.instances, batch.station)}
                      className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] hover:bg-emerald-600 transition-all flex items-center space-x-2.5 uppercase tracking-widest shadow-md"
                    >
                      <CheckCircle2 size={14} strokeWidth={3} />
                      <span>Batch Done</span>
                    </button>
                  )}
                  
                  {/* Senior Chef: Direct complete button */}
                  {isSeniorChef && (
                    <button 
                      onClick={() => handleFinishBatch(batch.instances, batch.station)}
                      className="px-6 py-3 bg-black text-white rounded-xl font-black text-[10px] hover:bg-gray-800 transition-all flex items-center space-x-2.5 uppercase tracking-widest shadow-md"
                    >
                      <CheckCircle2 size={14} strokeWidth={3} />
                      <span>Batch Done</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {batchedItems.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-gray-200">
              <ChefHat size={48} className="mb-4 opacity-20" />
              <p className="text-xs font-black uppercase tracking-widest">Queue Clear</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchView;