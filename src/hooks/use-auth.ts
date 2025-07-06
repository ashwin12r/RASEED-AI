
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
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      router.push('/');
      toast({ title: "Successfully signed in!" });
    } catch (error: any) {
       if (error.code === 'auth/popup-closed-by-user') {
          toast({
              title: "Sign-in cancelled",
              description: "The sign-in window was closed. Please check if your browser is blocking pop-ups and try again.",
              variant: "destructive"
          });
      } else {
        console.error("Error signing in with Google: ", error);
        toast({ title: "Sign in failed", description: error.message || "Could not sign in with Google.", variant: "destructive" });
      }
    } finally {
        setLoading(false);
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
