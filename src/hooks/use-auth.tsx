
'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

async function getUserProfile(uid: string): Promise<User | null> {
    // Check patients collection
    let userDoc = await getDoc(doc(db, 'patients', uid));
    if (userDoc.exists()) {
        return { uid, ...userDoc.data(), role: 'patient' } as User;
    }
    // Check doctors collection
    userDoc = await getDoc(doc(db, 'doctors', uid));
    if (userDoc.exists()) {
        return { uid, ...userDoc.data(), role: 'doctor' } as User;
    }
    // Check admins collection
    userDoc = await getDoc(doc(db, 'admins', uid));
    if (userDoc.exists()) {
        return { uid, ...userDoc.data(), role: 'admin' } as User;
    }
    return null;
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userProfile = await getUserProfile(firebaseUser.uid);
        setUser(userProfile);
      } else {
        setUser(null);
        if (!['/login', '/signup'].includes(pathname)) {
            router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, pathname]);

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;
