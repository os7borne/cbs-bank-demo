'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Landmark, Loader2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

// Demo mode flag - matches server-side
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const demoAccounts = [
    { label: 'Admin', email: 'admin@indiabank.demo', password: 'admin123', color: 'bg-blue-100 hover:bg-blue-200 text-blue-800' },
    { label: 'Teller', email: 'teller@indiabank.demo', password: 'teller123', color: 'bg-green-100 hover:bg-green-200 text-green-800' },
    { label: 'Customer Service', email: 'cs@indiabank.demo', password: 'cs123', color: 'bg-purple-100 hover:bg-purple-200 text-purple-800' },
    { label: 'Operations', email: 'ops@indiabank.demo', password: 'ops123', color: 'bg-amber-100 hover:bg-amber-200 text-amber-800' },
    { label: 'Credit Officer', email: 'credit@indiabank.demo', password: 'credit123', color: 'bg-pink-100 hover:bg-pink-200 text-pink-800' },
    { label: 'Finance', email: 'finance@indiabank.demo', password: 'finance123', color: 'bg-cyan-100 hover:bg-cyan-200 text-cyan-800' },
  ];

  const fillCredentials = (email: string, password: string) => {
    setFormData({ email, password });
    toast.success('Credentials filled', {
      description: `Ready to sign in as ${email.split('@')[0]}`
    });
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Demo mode - simple POST with credentials
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      toast.success('Login successful', {
        description: `Welcome back, ${data.user.firstName}!`,
      });

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <Landmark className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">India Bank Demo</CardTitle>
          <CardDescription>
            Enterprise Core Banking System
            {isDemoMode && (
              <span className="block text-xs text-amber-600 mt-1">
                (Demo Mode - Hardcoded Credentials)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 text-center">
          <p className="text-sm text-muted-foreground">Quick Login (Demo Mode)</p>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => fillCredentials(account.email, account.password)}
                className={`px-3 py-2 rounded-md text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ${account.color}`}
              >
                <User className="h-3 w-3" />
                {account.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Click a role to auto-fill credentials</p>
        </CardFooter>
      </Card>
    </div>
  );
}
