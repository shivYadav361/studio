
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/shared/logo';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getPatient } from '@/lib/firestore-service';
import { auth, generateRecaptcha } from '@/lib/firebase';
import { signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";

function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const uid = searchParams.get('uid');

  useEffect(() => {
    const sendOtp = async () => {
      if (!uid) {
        toast({ title: 'Error', description: 'No user identifier found.', variant: 'destructive' });
        router.push('/login');
        return;
      }
      try {
        const patient = await getPatient(uid);
        if (!patient || !patient.phone) {
          toast({ title: 'Error', description: 'Could not find a phone number for this account.', variant: 'destructive' });
          router.push('/login');
          return;
        }

        const recaptcha = generateRecaptcha();
        if (recaptcha) {
            const confirmation = await signInWithPhoneNumber(auth, patient.phone, recaptcha);
            setConfirmationResult(confirmation);
            toast({ title: 'OTP Sent', description: `An OTP has been sent to ${patient.phone}.` });
        } else {
             toast({ title: 'Error', description: 'Could not initialize reCAPTCHA.', variant: 'destructive' });
        }
      } catch (error: any) {
        console.error("OTP Send Error:", error);
        toast({ title: 'OTP Error', description: `Failed to send OTP. ${error.message}`, variant: 'destructive' });
      } finally {
        setSendingOtp(false);
      }
    };
    sendOtp();
  }, [uid, router, toast]);

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast({ title: 'Error', description: 'Please enter a valid 6-digit OTP.', variant: 'destructive' });
      return;
    }
    if (!confirmationResult) {
        toast({ title: 'Error', description: 'Could not verify OTP. Please try logging in again.', variant: 'destructive' });
        return;
    }

    setLoading(true);
    try {
        await confirmationResult.confirm(otp);
        toast({ title: 'Login Successful!', description: 'You are now logged in.' });
        router.push('/patient/dashboard');
    } catch (error: any) {
        let errorMessage = "Failed to verify OTP. Please try again.";
        if (error.code === 'auth/invalid-verification-code') {
            errorMessage = "The OTP you entered is invalid. Please check the code and try again.";
        }
        toast({ title: 'Verification Failed', description: errorMessage, variant: 'destructive' });
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
            <CardTitle className="text-2xl font-bold">Verify Your Identity</CardTitle>
            <CardDescription>
                {sendingOtp ? "Sending OTP to your registered phone number..." : "An OTP has been sent to your phone. Please enter it below."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="otp">One-Time Password (OTP)</Label>
              <Input 
                id="otp" 
                type="text" 
                placeholder="123456" 
                required 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading || sendingOtp}
                maxLength={6}
              />
            </div>
            
            <Button onClick={handleVerifyOtp} disabled={loading || sendingOtp} className="w-full">
              {(loading || sendingOtp) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Verify & Login'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


export default function VerifyOtpPageWrapper() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyOtpPage />
        </Suspense>
    )
}
