
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/shared/logo';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getPatient, getUserRole } from '@/lib/firestore-service';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
        toast({ title: 'Error', description: 'Please enter both email and password.', variant: 'destructive' });
        return;
    }
    setLoading(true);
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const role = await getUserRole(user.uid);

        if (role === 'patient') {
            const patient = await getPatient(user.uid);
            if (!patient?.phone) {
                toast({ title: 'Login Successful', description: 'Redirecting to dashboard...' });
                router.push('/patient/dashboard');
                return;
            }
            router.push(`/login/verify-otp?uid=${user.uid}`);

        } else if (role === 'doctor') {
            router.push('/doctor/dashboard');
        } else if (role === 'admin') {
            router.push('/admin/dashboard');
        } else {
            toast({ title: 'Login Failed', description: 'User role not found. Please contact support.', variant: 'destructive' });
            await auth.signOut();
        }

    } catch (error: any) {
        let errorMessage = 'An unexpected error occurred. Please try again.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            errorMessage = 'Invalid email or password. Please check your credentials.';
        }
        toast({ title: 'Login Failed', description: errorMessage, variant: 'destructive' });
    } finally {
        setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="items-center text-center">
            <Logo className="mb-4" />
            <CardTitle className="text-3xl font-bold">Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <Button onClick={handleLogin} disabled={loading} className="w-full">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
            </Button>
            
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium text-primary underline underline-offset-4 hover:text-primary/80">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
