'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, onSnapshot, type DocumentData, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
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
  createdAt: serverTimestamp(),
};


export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase isn't configured, use a mock user for development.
    if (!auth?.onAuthStateChanged) {
      console.log("Firebase not configured, using mock user for development.");
      setUser(MOCK_USER);
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

  const logout = async () => {
    // If Firebase isn't configured, just clear the mock user state
    if (!auth?.onAuthStateChanged) {
        setUser(null);
        return;
    }
    // Otherwise, sign out from Firebase
    if (auth?.signOut) {
      await signOut(auth);
    }
  };

  const value = { user, loading, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
