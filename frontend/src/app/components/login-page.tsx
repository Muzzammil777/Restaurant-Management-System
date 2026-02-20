import { useState } from 'react';
import { useAuth, UserRole } from '@/utils/auth-context';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { UtensilsCrossed, LogIn, Eye, EyeOff, ChefHat, UserCog, CreditCard, Truck, Users, Shield, Lock } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  admin: <Shield className="h-5 w-5" />,
  manager: <UserCog className="h-5 w-5" />,
  chef: <ChefHat className="h-5 w-5" />,
  waiter: <Users className="h-5 w-5" />,
  cashier: <CreditCard className="h-5 w-5" />,
  delivery: <Truck className="h-5 w-5" />,
  staff: <Users className="h-5 w-5" />,
};

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Login successful!');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-login-module flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <style>{`
          @keyframes float1 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.15; }
            33% { transform: translate(40px, -40px) rotate(120deg); opacity: 0.25; }
            66% { transform: translate(-30px, 30px) rotate(240deg); opacity: 0.15; }
          }
          @keyframes float2 {
            0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.12; }
            25% { transform: translate(-50px, 50px) rotate(90deg); opacity: 0.2; }
            75% { transform: translate(50px, -50px) rotate(270deg); opacity: 0.12; }
          }
          @keyframes float3 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
            50% { transform: translate(30px, -50px) scale(1.1); opacity: 0.18; }
          }
          @keyframes pulse-glow {
            0%, 100% { filter: drop-shadow(0 0 5px rgba(139, 90, 43, 0.3)); }
            50% { filter: drop-shadow(0 0 15px rgba(139, 90, 43, 0.5)); }
          }
          .float-element-1 { animation: float1 12s ease-in-out infinite; }
          .float-element-2 { animation: float2 15s ease-in-out infinite; }
          .float-element-3 { animation: float3 10s ease-in-out infinite; }
          .glow { animation: pulse-glow 3s ease-in-out infinite; }
        `}</style>
        
        {/* Floating Food Icons */}
        <div className="absolute top-20 left-12 w-16 h-16 float-element-1 glow">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="0.5" opacity="0.6"/>
            <path d="M12 2 L14 8 L20 8 L15.5 12 L17 18 L12 14 L7 18 L8.5 12 L4 8 L10 8 Z" fill="white" opacity="0.4"/>
          </svg>
        </div>

        {/* Floating Utensils */}
        <div className="absolute top-40 right-20 w-14 h-14 float-element-2 glow">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 20 L8 12 L8 2 M16 20 L14 12 L14 2 M11 20 L10 10 L10 2" stroke="white" strokeWidth="0.8" opacity="0.5" strokeLinecap="round"/>
            <circle cx="5" cy="20" r="1.5" fill="white" opacity="0.4"/>
            <circle cx="15" cy="20" r="1.5" fill="white" opacity="0.4"/>
            <circle cx="11" cy="20" r="1.5" fill="white" opacity="0.4"/>
          </svg>
        </div>

        {/* Floating Plate */}
        <div className="absolute bottom-32 left-20 w-16 h-16 float-element-3 glow">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="0.8" opacity="0.5"/>
            <circle cx="12" cy="12" r="7" stroke="white" strokeWidth="0.5" opacity="0.3"/>
            <circle cx="12" cy="12" r="4" fill="white" opacity="0.2"/>
            <path d="M12 5 Q 15 12 12 19 Q 9 12 12 5" fill="white" opacity="0.15"/>
          </svg>
        </div>

        {/* Floating Chef Hat */}
        <div className="absolute bottom-20 right-32 w-14 h-14 float-element-1 glow" style={{ animationDelay: '2s' }}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5 16 L5 12 Q5 10 7 9 L17 9 Q 19 10 19 12 L19 16 Z" stroke="white" strokeWidth="0.8" opacity="0.5"/>
            <rect x="5" y="16" width="14" height="2" fill="white" opacity="0.3"/>
            <path d="M12 2 Q 14 6 12 9" stroke="white" strokeWidth="0.8" opacity="0.4" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Floating Bowl */}
        <div className="absolute top-1/2 right-24 w-16 h-16 float-element-2 glow" style={{ animationDelay: '4s' }}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 10 Q 4 18 12 18 Q 20 18 20 10 Z" stroke="white" strokeWidth="0.8" opacity="0.5" fill="none"/>
            <path d="M6 10 L18 10" stroke="white" strokeWidth="0.6" opacity="0.3"/>
            <circle cx="12" cy="13" r="2" fill="white" opacity="0.2"/>
          </svg>
        </div>

        {/* Animated gradient orb */}
        <div className="absolute top-1/3 left-1/3 w-32 h-32 bg-gradient-to-br from-orange-300 to-amber-400 rounded-full mix-blend-multiply filter blur-3xl opacity-5 float-element-3" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-40 h-40 bg-gradient-to-br from-amber-200 to-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5 float-element-2" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Login Form */}
        <Card className="shadow-xl border-0 bg-gradient-to-br from-[#E8D5C4] via-[#D4B896] to-[#C9A876]">
          <CardHeader className="space-y-4 pb-6 text-center text-[#2D2D2D]">
            <div className="flex justify-center">
              <div className="p-4 bg-primary rounded-2xl">
                <UtensilsCrossed className="h-10 w-10 text-primary-foreground" />
              </div>
            </div>
            <div>
              <CardTitle className="text-2xl text-[#2D2D2D]">Restaurant Management</CardTitle>
              <CardDescription className="mt-2 text-[#4B4B4B]">Sign in with your staff credentials</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#2D2D2D]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#2D2D2D]">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
                    autoComplete="current-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-11 w-11"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    Sign In
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#C9A876]">
              <div className="flex items-center justify-center gap-2 text-sm text-[#4B4B4B] mb-4">
                <Lock className="h-4 w-4" />
                <span>Role-based access control</span>
              </div>
              <div className="flex justify-center gap-4 flex-wrap">
                {(['admin', 'manager', 'chef', 'waiter', 'cashier', 'delivery'] as UserRole[]).map((role) => (
                  <div key={role} className="flex flex-col items-center gap-1 text-[#4B4B4B]">
                    <div className="p-2 rounded-lg bg-[#B89968] bg-opacity-40">
                      {ROLE_ICONS[role]}
                    </div>
                    <span className="text-xs capitalize">{role}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-[#4B4B4B]">
              <p>Contact admin if you don't have an account</p>
              <p className="mt-2 text-xs">Powered by Movicloud Labs</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
