import { useState } from 'react';
import { useAuth, SAMPLE_USERS, UserRole } from '@/utils/auth-context';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Badge } from '@/app/components/ui/badge';
import { Separator } from '@/app/components/ui/separator';
import { UtensilsCrossed, LogIn, Eye, EyeOff, ChefHat, UserCog, CreditCard, Truck, Users, Shield } from 'lucide-react';
import { toast } from 'sonner';

const ROLE_ICONS: Record<UserRole, React.ReactNode> = {
  admin: <Shield className="h-4 w-4" />,
  manager: <UserCog className="h-4 w-4" />,
  chef: <ChefHat className="h-4 w-4" />,
  waiter: <Users className="h-4 w-4" />,
  cashier: <CreditCard className="h-4 w-4" />,
  delivery: <Truck className="h-4 w-4" />,
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-purple-100 text-purple-700 border-purple-200',
  manager: 'bg-blue-100 text-blue-700 border-blue-200',
  chef: 'bg-orange-100 text-orange-700 border-orange-200',
  waiter: 'bg-green-100 text-green-700 border-green-200',
  cashier: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  delivery: 'bg-cyan-100 text-cyan-700 border-cyan-200',
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

  const handleQuickLogin = async (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
    setError('');
    setLoading(true);

    try {
      const result = await login(userEmail, userPassword);
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
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8">
        {/* Login Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary rounded-xl">
                <UtensilsCrossed className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl">Restaurant Management</CardTitle>
                <CardDescription>Sign in to access your dashboard</CardDescription>
              </div>
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 pr-10"
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

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Powered by Movicloud Labs</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Login Cards */}
        <div className="space-y-4">
          <div className="text-center md:text-left">
            <h2 className="text-xl font-semibold text-foreground">Demo Accounts</h2>
            <p className="text-sm text-muted-foreground">Click any role to quick login</p>
          </div>

          <div className="grid gap-3">
            {SAMPLE_USERS.map((user) => (
              <Card
                key={user.id}
                className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group"
                onClick={() => handleQuickLogin(user.email, user.password)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${ROLE_COLORS[user.role]}`}>
                        {ROLE_ICONS[user.role]}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize text-xs">
                        {user.role}
                      </Badge>
                      <LogIn className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Separator className="my-4" />

          <Card className="bg-muted/50 border-dashed">
            <CardContent className="p-4">
              <h3 className="font-medium text-sm mb-2">Credentials Reference</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><span className="font-mono bg-muted px-1 rounded">admin@restaurant.com</span> / <span className="font-mono bg-muted px-1 rounded">admin123</span></p>
                <p><span className="font-mono bg-muted px-1 rounded">manager@restaurant.com</span> / <span className="font-mono bg-muted px-1 rounded">manager123</span></p>
                <p><span className="font-mono bg-muted px-1 rounded">chef@restaurant.com</span> / <span className="font-mono bg-muted px-1 rounded">chef123</span></p>
                <p><span className="font-mono bg-muted px-1 rounded">waiter@restaurant.com</span> / <span className="font-mono bg-muted px-1 rounded">waiter123</span></p>
                <p><span className="font-mono bg-muted px-1 rounded">cashier@restaurant.com</span> / <span className="font-mono bg-muted px-1 rounded">cashier123</span></p>
                <p><span className="font-mono bg-muted px-1 rounded">delivery@restaurant.com</span> / <span className="font-mono bg-muted px-1 rounded">delivery123</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
