
'use client'
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';

export interface Warranty {
  id: string;
  productName: string;
  purchaseDate: Timestamp;
  warrantyEndDate: Timestamp;
}

interface WarrantiesContextType {
  warranties: Warranty[];
  addWarranty: (newWarrantyData: Omit<Warranty, 'id'>) => Promise<void>;
  deleteWarranty: (id: string) => Promise<void>;
  isLoading: boolean;
}

const WarrantiesContext = createContext<WarrantiesContextType | undefined>(undefined);

export const WarrantiesProvider = ({ children }: { children: ReactNode }) => {
  const [warranties, setWarranties] = useState<Warranty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchWarranties = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const warrantiesCol = collection(db, 'users', user.uid, 'warranties');
          const q = query(warrantiesCol, orderBy('warrantyEndDate', 'asc'));
          const warrantySnapshot = await getDocs(q);
          const warrantiesList = warrantySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Warranty));
          setWarranties(warrantiesList);
        } catch (error) {
          console.error("Error fetching warranties from Firestore:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (!authLoading) {
        setWarranties([]);
        setIsLoading(false);
      }
    };

    fetchWarranties();
  }, [user, authLoading]);

  const addWarranty = async (newWarrantyData: Omit<Warranty, 'id'>) => {
    if (!user) {
      console.error("No user logged in to add warranty.");
      return;
    }
    try {
      const warrantiesCol = collection(db, 'users', user.uid, 'warranties');
      const docRef = await addDoc(warrantiesCol, newWarrantyData);
      setWarranties(prev => [...prev, { id: docRef.id, ...newWarrantyData }].sort((a, b) => a.warrantyEndDate.toMillis() - b.warrantyEndDate.toMillis()));
    } catch (error) {
      console.error("Error adding warranty document: ", error);
      throw error;
    }
  };

  const deleteWarranty = async (id: string) => {
    if (!user) {
      console.error("No user logged in to delete warranty.");
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'warranties', id));
      setWarranties(prev => prev.filter(warranty => warranty.id !== id));
    } catch (error) {
      console.error("Error deleting warranty document: ", error);
      throw error;
    }
  };
  
  const value = { warranties, addWarranty, deleteWarranty, isLoading };

  return React.createElement(WarrantiesContext.Provider, { value: value }, children);
};

export const useWarranties = () => {
  const context = useContext(WarrantiesContext);
  if (context === undefined) {
    throw new Error('useWarranties must be used within a WarrantiesProvider');
  }
  return context;
};
