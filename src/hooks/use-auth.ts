
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
    // If firebase is not configured, auth will be null.
    if (!auth) {
      setLoading(false);
      return;
    }
    // This listener handles user session state across page loads.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Check for redirect result after page load
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // This means a sign-in was just completed.
          // onAuthStateChanged will handle setting the user state, but we can show a success toast here.
          toast({ title: "Successfully signed in!" });
          router.push('/');
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
      // This will redirect the user to the Google sign-in page.
      // The rest of the logic is handled in the useEffect hook after redirect.
      await signInWithRedirect(auth, googleProvider);
    } catch (error: any) {
        console.error("Error starting redirect sign in: ", error);
        toast({ title: "Sign in failed", description: error.message || "Could not start the sign-in process.", variant: "destructive" });
        setLoading(false); // Only set loading to false if redirect itself fails
    }
  };

  const signOut = async () => {
    if (!auth) return; // Don't do anything if not configured.

    setLoading(true);
    try {
      await firebaseSignOut(auth);
      router.push('/login');
      toast({ title: "Signed out." });
    } catch (error: any)      {
      console.error("Error signing out: ", error);
      toast({ title: "Sign out failed", description: error.message || "Could not sign out.", variant: "destructive" });
    } finally {
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
