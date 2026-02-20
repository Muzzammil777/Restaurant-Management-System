
import React, { useState } from 'react';
import { Order, OrderStatus, OrderType, Station } from '../types';
import OrderCard from './OrderCard';
import TableView from './TableView';
import OrderDetailModal from './OrderDetailModal';
import RecallNumberPad from './RecallNumberPad';
import { Search, Utensils, Truck, ShoppingBag, LayoutGrid, Globe, Map as MapIcon } from 'lucide-react';

interface KDSBoardProps {
  orders: Order[];
  activeStation: Station;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  onTogglePriority: (id: string) => void;
  onCompleteItem: (orderId: string, itemId: string) => void;
  onNotify: (id: string) => void;
  onStartStationItems: (orderId: string, station: Station) => void;
  onFinishStationItems: (orderId: string, station: Station) => void;
}

const KDSBoard: React.FC<KDSBoardProps> = ({ orders, activeStation, onUpdateStatus, onTogglePriority, onCompleteItem, onNotify, onStartStationItems, onFinishStationItems }) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isRecallOpen, setIsRecallOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<OrderType | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'LIST' | 'TABLE'>('LIST');

  const statusColumns: { title: string; status: OrderStatus; color: string }[] = [
    { title: 'New Tickets', status: 'NEW', color: '#000000' },
    { title: 'In Production', status: 'COOKING', color: '#F59E0B' },
    { title: 'Fulfillment Ready', status: 'READY', color: '#10B981' },
  ];

  const typeSections: { id: OrderType; label: string; icon: any }[] = [
    { id: 'DINE_IN', label: 'Dine In', icon: <Utensils size={15} /> },
    { id: 'DELIVERY', label: 'Delivery', icon: <Truck size={15} /> },
    { id: 'PARCEL', label: 'Parcel', icon: <ShoppingBag size={15} /> },
  ];

  const isSeniorChef = activeStation === 'ALL';

  const filteredByStation = orders.filter(order => {
    if (isSeniorChef) return true;
    return order.items.some(item => item.station === activeStation);
  });

  const handleRecallSearch = (orderNum: string) => {
    const found = orders.find(o => o.id.includes(orderNum) || o.id.endsWith(orderNum));
    if (found) { setSelectedOrder(found); setIsRecallOpen(false); }
    else { alert(`Order #${orderNum} not found.`); }
  };

  const handleFilterChange = (filter: OrderType | 'ALL') => {
    setActiveFilter(filter);
    if (filter !== 'DINE_IN') setViewMode('LIST');
  };

  return (
    <div className="h-full flex flex-col bg-[#F9FAFB]">
      <div className="grid grid-cols-3 items-center px-10 py-5 bg-white border-b border-gray-200 shrink-0 z-10 h-[90px]">
        <div className="flex items-center space-x-4">
           <div className={`w-3 h-3 rounded-full status-pulse ${isSeniorChef ? 'bg-blue-500' : 'bg-black'}`} />
           <div className="flex flex-col">
             <span className="text-[14px] font-black text-black uppercase tracking-[0.2em] leading-tight">
               {isSeniorChef ? 'Global Monitor' : 'Unit Station'}
             </span>
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.25em]">
               {isSeniorChef ? 'Master Console' : activeStation}
             </span>
           </div>
        </div>

        <div className="flex justify-center items-center space-x-4">
          <div className="flex items-center bg-gray-100 p-1 rounded-full border border-gray-200 shadow-inner">
            <button onClick={() => handleFilterChange('ALL')} className={`flex items-center space-x-2 px-5 py-2.5 rounded-full transition-all duration-300 ${activeFilter === 'ALL' ? 'bg-white text-black font-black shadow-sm' : 'text-gray-400 font-bold'}`}>
              <LayoutGrid size={14} />
              <span className="text-[10px] uppercase tracking-[0.1em]">All</span>
            </button>
            {typeSections.map((type) => (
              <button key={type.id} onClick={() => handleFilterChange(type.id)} className={`flex items-center space-x-2 px-5 py-2.5 rounded-full transition-all duration-300 ${activeFilter === type.id ? 'bg-white text-black font-black shadow-sm' : 'text-gray-400 font-bold'}`}>
                {type.icon}
                <span className="text-[10px] uppercase tracking-[0.1em]">{type.label}</span>
              </button>
            ))}
          </div>

          <div className={`flex items-center bg-gray-100 p-1 rounded-full border border-gray-200 transition-all duration-500 ${activeFilter === 'DINE_IN' ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}`}>
            <button 
              onClick={() => setViewMode('LIST')} 
              className={`p-2.5 rounded-full transition-all ${viewMode === 'LIST' ? 'bg-black text-white' : 'text-gray-400'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setViewMode('TABLE')} 
              className={`p-2.5 rounded-full transition-all ${viewMode === 'TABLE' ? 'bg-black text-white' : 'text-gray-400'}`}
            >
              <MapIcon size={16} />
            </button>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button onClick={() => setIsRecallOpen(true)} className="flex items-center space-x-3 bg-white text-black hover:bg-black hover:text-white px-8 py-3 rounded-2xl text-[12px] font-black transition-all border-2 border-black tracking-widest uppercase">
            <Search size={16} strokeWidth={3} />
            <span>Recall</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-8">
        {activeFilter === 'DINE_IN' && viewMode === 'TABLE' ? (
          <TableView 
            orders={filteredByStation.filter(o => o.type === 'DINE_IN')} 
            activeStation={activeStation}
            onSelectOrder={setSelectedOrder}
          />
        ) : (
          <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-8 overflow-hidden">
            {statusColumns.map((col) => {
              const statusOrders = filteredByStation.filter(o => o.status === col.status && (activeFilter === 'ALL' || o.type === activeFilter));
              return (
                <div key={col.status} className="flex flex-col h-full overflow-hidden bg-gray-50 rounded-[2.5rem] border border-gray-100 shadow-inner">
                  <div className="px-8 py-6 flex items-center justify-between border-b border-gray-200 bg-white shrink-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-6 rounded-full" style={{ backgroundColor: col.color }} />
                      <h3 className="text-black font-black tracking-tight text-[16px] uppercase">{col.title}</h3>
                    </div>
                    <span className="bg-gray-100 text-black px-4 py-1.5 rounded-xl text-[14px] font-black tabular-nums border border-gray-200">{statusOrders.length}</span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {statusOrders.map(order => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        activeStation={activeStation}
                        onUpdateStatus={onUpdateStatus}
                        onTogglePriority={onTogglePriority}
                        onOpenDetail={setSelectedOrder}
                        onNotify={onNotify}
                        onStartStationItems={onStartStationItems}
                        onFinishStationItems={onFinishStationItems}
                      />
                    ))}
                    {statusOrders.length === 0 && (
                      <div className="h-full flex items-center justify-center text-gray-300 py-20">
                        <p className="font-bold tracking-[0.3em] uppercase text-[12px]">No Orders</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderDetailModal 
          order={selectedOrder} 
          activeStation={activeStation}
          onClose={() => setSelectedOrder(null)} 
          onCompleteItem={onCompleteItem}
          onUpdateStatus={onUpdateStatus}
          onStartStationItems={onStartStationItems}
          onFinishStationItems={onFinishStationItems}
        />
      )}

      {isRecallOpen && <RecallNumberPad onClose={() => setIsRecallOpen(false)} onSearch={handleRecallSearch} />}
    </div>
  );
};

export default KDSBoard;