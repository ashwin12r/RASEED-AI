
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
    // This listener handles user session state across page loads.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // This handles the result of a redirect sign-in operation.
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          // User has just signed in via redirect.
          router.push('/');
          toast({ title: "Successfully signed in!" });
        }
      })
      .catch((error) => {
        // We can ignore the popup-closed-by-user error as it's not a true error in this flow.
        if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
          console.error("Error signing in with redirect: ", error);
          toast({ title: "Sign in failed", description: error.message || "Could not sign in with Google.", variant: "destructive" });
        }
      });
      
    return () => unsubscribe();
  }, [router, toast]);


  const signInWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithRedirect(auth, googleProvider);
      // The user will be redirected from this point. The result is handled by getRedirectResult.
    } catch (error: any) {
      console.error("Error starting sign in with redirect: ", error);
      toast({ title: "Sign in failed", description: "Could not start the sign-in process.", variant: "destructive" });
      setLoading(false);
    }
  };

  const signOut = async () => {
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
