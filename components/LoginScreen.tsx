
import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, 
  BookOpen,
  Delete,
  Maximize,
  Minimize,
  ChefHat,
  ChevronDown,
  User,
  Crown,
  Flame,
  Soup,
  IceCream,
  Timer,
  LayoutGrid,
  ShieldCheck,
  Activity,
  BarChart3,
  Lock,
  Zap
} from 'lucide-react';
import { ChefProfile, Station } from '../types';

interface LoginScreenProps {
  onLogin: (chef: ChefProfile, pin: string) => void;
}

const CHEFS: ChefProfile[] = [
  { id: 'c1', name: 'Chef 1', role: 'Head Chef', station: 'ALL', initials: 'HC' },
  { id: 'c2', name: 'Chef 2', role: 'Sous Chef', station: 'ALL', initials: 'SC' },
  { id: 'c3', name: 'Chef 3', role: 'Station Chef', station: 'FRY', initials: 'FR' },
  { id: 'c4', name: 'Chef 4', role: 'Station Chef', station: 'CURRY', initials: 'CR' },
  { id: 'c5', name: 'Chef 5', role: 'Station Chef', station: 'RICE', initials: 'RC' },
  { id: 'c6', name: 'Chef 6', role: 'Station Chef', station: 'STARTER', initials: 'ST' },
  { id: 'c7', name: 'Chef 7', role: 'Station Chef', station: 'DESSERT', initials: 'DS' },
  { id: 'c8', name: 'Chef 8', role: 'Station Chef', station: 'GRILL', initials: 'GR' },
  { id: 'c9', name: 'Chef 9', role: 'Prep Chef', station: 'PREP', initials: 'PR' },
  { id: 'c10', name: 'Chef 10', role: 'Junior Chef', station: 'FRY', initials: 'JR' },
];

const MODULES = [
  { id: 'FRY', name: 'Fry Station', items: 'Deep-fry, Saute, Tempura', icon: <Flame size={14} />, color: '#EF4444' },
  { id: 'CURRY', name: 'Curry Station', items: 'Gravies, Curries, Sauces', icon: <Soup size={14} />, color: '#F59E0B' },
  { id: 'RICE', name: 'Rice Station', items: 'Biryani, Pulao, Fried Rice', icon: <LayoutGrid size={14} />, color: '#10B981' },
  { id: 'STARTER', name: 'Prep Station', items: 'Salads, Cold Items, Plating', icon: <Zap size={14} />, color: '#3B82F6' },
  { id: 'GRILL', name: 'Grill Station', items: 'Tandoor, BBQ, Grills', icon: <Flame size={14} />, color: '#DC2626' },
  { id: 'DESSERT', name: 'Dessert Station', items: 'Sweets, Beverages, Desserts', icon: <IceCream size={14} />, color: '#8B5CF6' },
];

const StationIcon = ({ station, size = 16 }: { station: Station; size?: number }) => {
  switch (station) {
    case 'ALL': return <Crown size={size} />;
    case 'FRY': return <Flame size={size} />;
    case 'CURRY': return <Soup size={size} />;
    case 'RICE': return <LayoutGrid size={size} />;
    case 'STARTER': return <Zap size={size} />;
    case 'DESSERT': return <IceCream size={size} />;
    case 'PREP': return <Timer size={size} />;
    case 'GRILL': return <Flame size={size} />;
    default: return <User size={size} />;
  }
};

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [selectedChef, setSelectedChef] = useState<ChefProfile | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [pin, setPin] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      clearInterval(timer);
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePress = (num: string) => { if (pin.length < 4) setPin(prev => prev + num); };
  const handleBackspace = () => { setPin(prev => prev.slice(0, -1)); };
  const handleClear = () => { setPin(''); };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans selection:bg-gray-100">
      <header className="px-10 h-20 flex justify-between items-center shrink-0 border-b border-gray-100 bg-white z-20">
        <div className="flex items-center space-x-3">
          <div className="bg-black p-2 rounded-lg text-white">
            <ChefHat size={22} strokeWidth={3} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter uppercase leading-none">MochaKDS <span className="text-gray-400 font-medium">Enterprise</span></h1>
            <p className="text-[9px] text-gray-400 font-black tracking-[0.25em] mt-1 uppercase">Production Terminal</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-8">
          <div className="text-right">
            <div className="text-lg font-black tracking-tight uppercase">
              {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
            </div>
            <div className="text-[9px] text-gray-400 font-bold tracking-[0.15em] uppercase">
              {currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()}
            </div>
          </div>
          <div className="flex items-center space-x-1 border-l border-gray-100 pl-8">
            <button onClick={() => !document.fullscreenElement ? document.documentElement.requestFullscreen() : document.exitFullscreen()} className="p-2.5 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-black">
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
            <button className="p-2.5 hover:bg-gray-50 rounded-xl transition-all text-gray-400 hover:text-black">
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-12 bg-[#F9FAFB]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-20 items-center max-w-[1100px] w-full">
          
          <div className="space-y-12">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="h-0.5 w-10 bg-black" />
                <span className="text-[10px] font-black tracking-[0.4em] text-black uppercase">System Authorization</span>
              </div>
              <h2 className="text-6xl font-black tracking-tighter leading-[0.95] text-black">
                Precision <br /> Kitchen Ops
              </h2>
              <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-md">
                Secure enterprise-grade access control for multi-station kitchen coordination and real-time fulfillment tracking.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-12 gap-y-6 border-l-2 border-gray-200 pl-8">
              {MODULES.map((mod) => (
                <div key={mod.id} className="group cursor-default">
                  <div className="flex items-center space-x-4 mb-1">
                    <div className="p-1.5 rounded-lg bg-gray-100 text-gray-400 group-hover:text-black transition-colors">
                      {mod.icon}
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-black">{mod.name}</span>
                  </div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest pl-10">
                    {mod.items}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <div className="bg-white p-10 rounded-[2.5rem] border border-gray-200 w-full max-w-[420px] shadow-2xl relative">
              <div className="relative mb-10" ref={dropdownRef}>
                <div className="flex items-center justify-center space-x-2 mb-6">
                  <Lock size={12} className="text-gray-400" />
                  <p className="text-[10px] text-gray-400 font-black tracking-[0.25em] uppercase">User Identity</p>
                </div>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full h-16 px-6 rounded-2xl flex items-center justify-between border-2 transition-all duration-300 ${
                    isDropdownOpen ? 'bg-white border-black' : 'bg-gray-50 border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${selectedChef ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'}`}>
                      {selectedChef ? <StationIcon station={selectedChef.station} size={20} /> : <User size={20} />}
                    </div>
                    <span className={`text-[14px] font-black tracking-widest uppercase ${!selectedChef ? 'text-gray-300' : 'text-black'}`}>
                      {selectedChef ? selectedChef.name : 'Select ID'}
                    </span>
                  </div>
                  <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-3 p-3 bg-white border border-gray-100 rounded-2xl z-50 shadow-2xl max-h-[340px] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 gap-1">
                      {CHEFS.map((chef) => (
                        <button
                          key={chef.id}
                          onClick={() => { setSelectedChef(chef); setIsDropdownOpen(false); setPin(''); }}
                          className={`flex items-center justify-between p-3.5 rounded-xl transition-all ${selectedChef?.id === chef.id ? 'bg-black text-white' : 'hover:bg-gray-50'}`}
                        >
                          <div className="flex items-center space-x-4">
                            <StationIcon station={chef.station} size={16} />
                            <div className="text-left">
                              <span className="text-[12px] font-bold uppercase tracking-widest block">{chef.name}</span>
                              <span className={`text-[9px] font-black uppercase opacity-60`}>
                                {chef.role}
                              </span>
                            </div>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded ${selectedChef?.id === chef.id ? 'bg-white/20' : 'bg-gray-100'}`}>{chef.station}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-center space-x-5 mb-10">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${pin.length > i ? 'bg-black border-black scale-125' : 'bg-transparent border-gray-200'}`} />
                ))}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-10">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                  <button key={num} onClick={() => handlePress(num)} className="aspect-[1.5/1] flex items-center justify-center text-2xl font-black rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all text-black active:scale-95">{num}</button>
                ))}
                <button onClick={handleClear} className="aspect-[1.5/1] flex items-center justify-center text-[10px] font-black rounded-2xl text-red-500 hover:bg-red-50 uppercase tracking-widest transition-all">Clear</button>
                <button onClick={() => handlePress('0')} className="aspect-[1.5/1] flex items-center justify-center text-2xl font-black rounded-2xl bg-gray-50 hover:bg-gray-100 text-black active:scale-95">0</button>
                <button onClick={handleBackspace} className="aspect-[1.5/1] flex items-center justify-center rounded-2xl bg-gray-50 hover:bg-gray-100 text-black active:scale-95"><Delete size={20} /></button>
              </div>

              <button 
                onClick={() => selectedChef && onLogin(selectedChef, pin)}
                disabled={pin.length < 4 || !selectedChef}
                className={`w-full py-5 rounded-2xl font-black text-sm tracking-[0.2em] uppercase transition-all ${(pin.length >= 4 && selectedChef) ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
              >
                Access Unit
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-10 h-14 flex justify-between items-center bg-white border-t border-gray-100 text-[8px] font-black tracking-[0.3em] text-gray-400 uppercase">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Encrypted Tunnel Active</span>
          </div>
          <span>v4.3.2 Production</span>
        </div>
        <span>Station ID: TERMINAL-A1</span>
      </footer>
    </div>
  );
};

export default LoginScreen;