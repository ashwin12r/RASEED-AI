
'use client'

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithRedirect, getRedirectResult, signOut as firebaseSignOut } from 'firebase/auth';
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

    // onAuthStateChanged is the single source of truth for the user's login state.
    // It will fire after getRedirectResult() completes and the auth state is finalized.
    // This is the only place we should set loading to false.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // We still need to process the redirect result to get credentials or handle errors.
    // This doesn't need to be tied to the loading state directly, as onAuthStateChanged
    // will handle the final state change.
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // A sign-in was just completed. onAuthStateChanged will set the user and loading state.
          // We can show a success toast here.
          toast({ title: "Successfully signed in!" });
        }
      })
      .catch((error) => {
        console.error("Error processing redirect result:", error);
        // Don't show a toast for user-cancelled flows.
        if (error.code !== 'auth/cancelled-popup-request') {
            toast({
                title: "Sign in failed",
                description: "There was an issue completing your sign-in. Please try again.",
                variant: "destructive"
            });
        }
      });
      
    return () => unsubscribe();
  }, [toast]);

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
      // This will redirect the user. The `useEffect` hook will handle the result.
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
        console.error("Error starting redirect sign in: ", error);
        toast({ title: "Sign in failed", description: error.message || "Could not start the sign-in process.", variant: "destructive" });
        setLoading(false); // Only set loading to false if the redirect itself fails to start
    }
  };

  const signOut = async () => {
    if (!auth) return;

    setLoading(true);
    try {
      await firebaseSignOut(auth);
      // onAuthStateChanged will fire with user=null, and the DashboardLayout will handle the redirect.
      // We can also push here for a faster UX.
      router.push('/login');
      toast({ title: "Signed out." });
    } catch (error: any)      {
      console.error("Error signing out: ", error);
      toast({ title: "Sign out failed", description: error.message || "Could not sign out.", variant: "destructive" });
      setLoading(false);
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
