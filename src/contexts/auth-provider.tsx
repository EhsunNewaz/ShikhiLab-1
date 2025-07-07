
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, onSnapshot, type DocumentData, serverTimestamp, type Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: () => void; // For mock mode
  logout: () => void;
}

// A mock user for development purposes when Firebase is not configured.
const MOCK_USER: UserProfile = {
  uid: 'mock-user-fatima',
  email: 'fatima@example.com',
  name: 'Fatima Ahmed',
  city: 'Dhaka',
  ieltsGoalBand: 7.5,
  role: 'student',
  progress: {
    diagnosticTestScore: 8,
  },
  mockTestHistory: [
    {
      testId: 'mock-1',
      score: 32,
      total: 40,
      completedAt: { toDate: () => new Date('2024-05-10T10:00:00Z') } as unknown as Timestamp
    }
  ],
  createdAt: serverTimestamp(),
};


export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // If Firebase isn't configured, we check session storage for mock user.
    if (!auth?.onAuthStateChanged) {
      console.log("Firebase not configured, using mock user for development.");
      const mockUserSession = sessionStorage.getItem('mockUser');
      if (mockUserSession) {
          setUser(JSON.parse(mockUserSession));
      }
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const unsubSnapshot = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            setUser(docSnap.data() as UserProfile);
          } else {
            setUser(null);
          }
          setLoading(false);
        });
        return () => unsubSnapshot();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = () => {
    if (!auth?.onAuthStateChanged) {
        sessionStorage.setItem('mockUser', JSON.stringify(MOCK_USER));
        setUser(MOCK_USER);
    }
  }

  const logout = async () => {
    if (!auth?.onAuthStateChanged) {
        sessionStorage.removeItem('mockUser');
        setUser(null);
        router.push('/auth');
        return;
    }
    if (auth?.signOut) {
      await signOut(auth);
      router.push('/auth');
    }
  };

  const value = { user, loading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
