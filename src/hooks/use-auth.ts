
'use client'

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!auth) {
        setLoading(false);
        return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (!auth || !googleProvider) {
      toast({
          title: "Configuration Error",
          description: "Firebase is not configured. Please check your credentials.",
          variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle setting the user and redirecting.
      toast({ title: "Successfully signed in!" });
    } catch (error: any) {
      console.error("Error signing in: ", error);
      // Don't show a toast for user-cancelled popups.
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        toast({ title: "Sign in failed", description: "Could not sign in with Google. Please try again.", variant: "destructive" });
      }
      // Set loading to false on error, as onAuthStateChanged might not fire.
      setLoading(false);
    }
  };

  const signOut = async () => {
    if (!auth) return;

    try {
      await firebaseSignOut(auth);
      router.push('/login');
      toast({ title: "Signed out." });
    } catch (error: any)      {
      console.error("Error signing out: ", error);
      toast({ title: "Sign out failed", description: error.message || "Could not sign out.", variant: "destructive" });
    }
  };

  const value = { user, loading, signInWithGoogle, signOut };

  return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
