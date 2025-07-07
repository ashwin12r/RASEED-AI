
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
          description: "Firebase is not configured. Please add your credentials.",
          variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      // onAuthStateChanged will handle setting the user and loading state
      toast({ title: "Successfully signed in!" });
    } catch (error: any) {
      console.error("Error signing in: ", error);

      // If the error is due to a closed popup and we're on a non-local domain,
      // it's likely an authorization issue.
      if (error.code === 'auth/popup-closed-by-user' && typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        toast({
          title: "Sign-In Misconfigured",
          description: "Your live URL must be added to the 'Authorized domains' list in your Firebase Authentication settings to allow sign-in.",
          variant: "destructive",
          duration: 10000,
        });
      }
      // Don't show a generic "Sign in failed" toast for user-cancelled flows.
      else if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        toast({ title: "Sign in failed", description: error.message || "Could not sign in.", variant: "destructive" });
      }

      setLoading(false); // set loading false on error because onAuthStateChanged won't fire.
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
