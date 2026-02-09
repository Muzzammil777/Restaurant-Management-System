import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/components/ui/utils";
import {
  ChefHat,
  Flame,
  UtensilsCrossed,
  Soup,
  Coffee,
  Salad,
  Crown,
  Delete,
  LogIn,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type StationType = "FRY" | "CURRY" | "RICE" | "PREP" | "GRILL" | "DESSERT" | "HEAD_CHEF";

interface Station {
  id: StationType;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  isHeadChef?: boolean;
}

const STATIONS: Station[] = [
  {
    id: "FRY",
    name: "Fry Station",
    icon: <Flame className="h-8 w-8" />,
    color: "#FF6B35",
    description: "Deep-fry, sauté, tempura"
  },
  {
    id: "CURRY",
    name: "Curry Station",
    icon: <Soup className="h-8 w-8" />,
    color: "#D4A574",
    description: "Gravies, curries, sauces"
  },
  {
    id: "RICE",
    name: "Rice Station",
    icon: <UtensilsCrossed className="h-8 w-8" />,
    color: "#8B7355",
    description: "Biryani, pulao, fried rice"
  },
  {
    id: "PREP",
    name: "Prep Station",
    icon: <Salad className="h-8 w-8" />,
    color: "#4CAF50",
    description: "Salads, cold items, plating"
  },
  {
    id: "GRILL",
    name: "Grill Station",
    icon: <ChefHat className="h-8 w-8" />,
    color: "#E63946",
    description: "Tandoor, BBQ, grills"
  },
  {
    id: "DESSERT",
    name: "Dessert Station",
    icon: <Coffee className="h-8 w-8" />,
    color: "#F4A261",
    description: "Sweets, beverages, desserts"
  },
  {
    id: "HEAD_CHEF",
    name: "Head Chef (Master View)",
    icon: <Crown className="h-8 w-8" />,
    color: "#8B5A2B",
    description: "Global oversight across all stations",
    isHeadChef: true
  }
];

// Mock authentication - In production, this would verify against backend
const MOCK_PINS: Record<StationType, string> = {
  FRY: "1234",
  CURRY: "2345",
  RICE: "3456",
  PREP: "4567",
  GRILL: "5678",
  DESSERT: "6789",
  HEAD_CHEF: "9999"
};

interface KDSTerminalLoginProps {
  onLogin: (station: StationType) => void;
}

export function KDSTerminalLogin({ onLogin }: KDSTerminalLoginProps) {
  const [selectedStation, setSelectedStation] = useState<StationType | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num);
      setError("");
    }
  };

  const handleClear = () => {
    setPin("");
    setError("");
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError("");
  };

  const handleLogin = () => {
    if (!selectedStation) {
      setError("Please select a station");
      return;
    }

    if (pin.length !== 4) {
      setError("Please enter 4-digit PIN");
      return;
    }

    setIsAuthenticating(true);

    // Simulate authentication delay
    setTimeout(() => {
      if (pin === MOCK_PINS[selectedStation]) {
        const station = STATIONS.find(s => s.id === selectedStation);
        toast.success(`Logged in to ${station?.name}`, {
          description: `Welcome, Chef! Your terminal is ready.`
        });
        onLogin(selectedStation);
      } else {
        setError("Invalid PIN. Please try again.");
        setPin("");
        toast.error("Authentication Failed", {
          description: "Incorrect PIN entered."
        });
      }
      setIsAuthenticating(false);
    }, 800);
  };

  const handleStationSelect = (stationId: StationType) => {
    setSelectedStation(stationId);
    setPin("");
    setError("");
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: "linear-gradient(135deg, #2A1A05 0%, #4A2F10 100%)" }}
    >
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(139, 90, 43, 0.3); }
          50% { box-shadow: 0 0 40px rgba(139, 90, 43, 0.6); }
        }
        .station-card-active {
          animation: pulse-glow 2s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 1000px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>

      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-4 bg-[#8B5A2B] rounded-2xl mb-4 shadow-2xl">
            <ChefHat className="h-16 w-16 text-white" />
          </div>
          <h1 
            className="text-5xl font-bold text-white mb-3" 
            style={{ fontFamily: 'Poppins, sans-serif', textShadow: '0 4px 12px rgba(0,0,0,0.3)' }}
          >
            MochaKDS Enterprise
          </h1>
          <p 
            className="text-xl text-white/80" 
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Kitchen Display System • Terminal Login
          </p>
          <div className="mt-4 inline-block px-6 py-2 bg-white/10 rounded-full backdrop-blur-sm">
            <p className="text-sm text-white/90" style={{ fontFamily: 'Inter, sans-serif' }}>
              High-Performance Production Management Suite
            </p>
          </div>
        </div>

        {/* Main Login Card */}
        <Card className="bg-white border-none shadow-2xl overflow-hidden">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              
              {/* Left: Station Selection */}
              <div className="p-8 bg-gradient-to-br from-[#FDFCFB] to-[#F5F3F0] border-r">
                <div className="mb-6">
                  <h2 
                    className="text-2xl font-bold text-[#2D2D2D] mb-2" 
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Select Your Station
                  </h2>
                  <p 
                    className="text-sm text-[#6B6B6B]" 
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Choose your kitchen terminal to begin production
                  </p>
                </div>

                <div className="space-y-3">
                  {STATIONS.map((station) => (
                    <button
                      key={station.id}
                      onClick={() => handleStationSelect(station.id)}
                      className={cn(
                        "w-full p-4 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden",
                        selectedStation === station.id
                          ? "border-[#8B5A2B] bg-white shadow-lg station-card-active"
                          : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                      )}
                    >
                      {selectedStation === station.id && (
                        <div className="absolute inset-0 shimmer pointer-events-none" />
                      )}
                      
                      <div className="flex items-center gap-4 relative z-10">
                        <div 
                          className="p-3 rounded-lg flex-shrink-0"
                          style={{ 
                            backgroundColor: selectedStation === station.id ? station.color : `${station.color}20`,
                            color: selectedStation === station.id ? "white" : station.color
                          }}
                        >
                          {station.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 
                              className="font-bold text-base text-[#2D2D2D]" 
                              style={{ fontFamily: 'Poppins, sans-serif' }}
                            >
                              {station.name}
                            </h3>
                            {station.isHeadChef && (
                              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-xs">
                                SENIOR
                              </Badge>
                            )}
                          </div>
                          <p 
                            className="text-xs text-[#6B6B6B]" 
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          >
                            {station.description}
                          </p>
                        </div>

                        {selectedStation === station.id && (
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 rounded-full bg-[#8B5A2B] flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right: PIN Entry */}
              <div className="p-8 bg-white">
                <div className="mb-6">
                  <h2 
                    className="text-2xl font-bold text-[#2D2D2D] mb-2" 
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Enter Security PIN
                  </h2>
                  <p 
                    className="text-sm text-[#6B6B6B]" 
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Authenticate with your 4-digit terminal code
                  </p>
                </div>

                {/* PIN Display */}
                <div className="mb-8">
                  <div className="flex items-center justify-center gap-4 mb-2">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-16 h-16 rounded-xl border-2 flex items-center justify-center transition-all duration-200",
                          pin.length > i
                            ? "border-[#8B5A2B] bg-[#8B5A2B] shadow-lg"
                            : "border-gray-300 bg-gray-50"
                        )}
                      >
                        {pin.length > i ? (
                          <div className="w-4 h-4 rounded-full bg-white" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {error && (
                    <div className="flex items-center justify-center gap-2 text-red-600 text-sm mt-3">
                      <AlertCircle className="h-4 w-4" />
                      <span style={{ fontFamily: 'Inter, sans-serif' }}>{error}</span>
                    </div>
                  )}
                </div>

                {/* Numpad */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                    <Button
                      key={num}
                      onClick={() => handleNumberClick(num)}
                      disabled={isAuthenticating}
                      className="h-16 text-2xl font-bold bg-gray-100 hover:bg-gray-200 text-[#2D2D2D] border-2 border-gray-300 hover:border-[#8B5A2B] rounded-xl transition-all duration-200"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      {num}
                    </Button>
                  ))}
                  
                  <Button
                    onClick={handleClear}
                    disabled={isAuthenticating}
                    className="h-16 bg-gray-100 hover:bg-gray-200 text-[#6B6B6B] border-2 border-gray-300 rounded-xl"
                  >
                    <Delete className="h-5 w-5" />
                  </Button>
                  
                  <Button
                    onClick={() => handleNumberClick("0")}
                    disabled={isAuthenticating}
                    className="h-16 text-2xl font-bold bg-gray-100 hover:bg-gray-200 text-[#2D2D2D] border-2 border-gray-300 hover:border-[#8B5A2B] rounded-xl"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    0
                  </Button>
                  
                  <Button
                    onClick={handleBackspace}
                    disabled={isAuthenticating}
                    className="h-16 bg-gray-100 hover:bg-gray-200 text-[#6B6B6B] border-2 border-gray-300 rounded-xl"
                  >
                    ←
                  </Button>
                </div>

                {/* Login Button */}
                <Button
                  onClick={handleLogin}
                  disabled={!selectedStation || pin.length !== 4 || isAuthenticating}
                  className="w-full h-14 bg-[#8B5A2B] hover:bg-[#6D421E] text-white text-lg font-semibold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  {isAuthenticating ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <LogIn className="h-5 w-5" />
                      Access Terminal
                    </span>
                  )}
                </Button>

                {/* Helper Text */}
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-900 font-medium mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    🔐 Demo Credentials (For Testing)
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-blue-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div>FRY: 1234</div>
                    <div>CURRY: 2345</div>
                    <div>RICE: 3456</div>
                    <div>PREP: 4567</div>
                    <div>GRILL: 5678</div>
                    <div>DESSERT: 6789</div>
                    <div className="col-span-2 font-semibold text-amber-700">HEAD CHEF: 9999</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            Movicloud Labs • Secure Terminal Authentication System
          </p>
          <p className="text-white/40 text-xs mt-2" style={{ fontFamily: 'Inter, sans-serif' }}>
            Optimized for high-heat, high-speed kitchen environments
          </p>
        </div>
      </div>
    </div>
  );
}
