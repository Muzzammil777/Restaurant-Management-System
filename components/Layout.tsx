
import React, { useState, useEffect } from 'react';
import { LayoutDashboard, LogOut, Clock, ChefHat, Maximize, Minimize, UserCircle, Shield, Target, Activity } from 'lucide-react';
import { Station } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'board' | 'batch' | 'stats';
  onTabChange: (tab: 'board' | 'batch' | 'stats') => void;
  onLogout: () => void;
  username: string;
  role: string;
  station: Station;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onLogout, username, role, station }) => {
  const [time, setTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => {
      clearInterval(timer);
      document.removeEventListener('fullscreenchange', handleFsChange);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen w-screen bg-white overflow-hidden">
      <header className="h-20 bg-black flex items-center justify-between px-8 shrink-0 z-30 shadow-lg text-white">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2.5">
            <ChefHat size={22} className="text-white" strokeWidth={3} />
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black tracking-tighter uppercase">MochaKDS</span>
              <span className="text-[7px] font-black text-gray-500 tracking-[0.4em] uppercase">Enterprise</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-5 border-l border-white/10 pl-8">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white border border-white/10">
              <UserCircle size={24} />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-black tracking-wide uppercase leading-tight mb-1">{username}</span>
              <div className="flex items-center space-x-2">
                <span className="text-[8px] font-black bg-white/20 px-1.5 py-0.5 rounded border border-white/10 uppercase tracking-wider">{role}</span>
                <div className="flex items-center space-x-1">
                  <Target size={8} className="text-emerald-400" />
                  <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.15em]">{station} UNIT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
          {[
            { id: 'board', label: 'Orders', icon: <LayoutDashboard size={14} /> },
            { id: 'batch', label: 'Batches', icon: <Shield size={14} /> },
            { id: 'stats', label: 'Analytics', icon: <Activity size={14} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id as any)}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-white text-black font-black shadow-lg' 
                  : 'text-gray-400 hover:text-white font-bold'
              }`}
            >
              {item.icon}
              <span className="text-[10px] uppercase tracking-widest">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex items-center space-x-5">
          <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-xl">
            <Clock size={16} className="text-emerald-400" />
            <span className="text-base font-black font-mono tracking-tight">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </span>
          </div>
          <div className="flex items-center space-x-1 border-l border-white/10 pl-5">
            <button onClick={() => !document.fullscreenElement ? document.documentElement.requestFullscreen() : document.exitFullscreen()} className="p-2 rounded-lg text-gray-400 hover:text-white transition-all">
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
            <button onClick={onLogout} className="p-2 rounded-lg text-gray-400 hover:text-red-400 transition-all">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-hidden relative bg-[#F9FAFB]">{children}</main>
    </div>
  );
};

export default Layout;