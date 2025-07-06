
'use client'

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';

export interface Receipt {
  id: string;
  vendor: string;
  date: string;
  total: number;
  category: string;
  items: string[];
  receiptDataUri: string;
}

interface ReceiptsContextType {
  receipts: Receipt[];
  addReceipt: (newReceiptData: { vendor: string; category: string; totalAmount: number; items: string[], receiptDataUri: string }) => Promise<void>;
  updateReceipt: (id: string, updatedData: Partial<Receipt>) => Promise<void>;
  deleteReceipt: (id: string) => Promise<void>;
  isLoading: boolean;
}

const ReceiptsContext = createContext<ReceiptsContextType | undefined>(undefined);

export const ReceiptsProvider = ({ children }: { children: ReactNode }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchReceipts = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const receiptsCol = collection(db, 'users', user.uid, 'receipts');
          const q = query(receiptsCol, orderBy('date', 'desc'));
          const receiptSnapshot = await getDocs(q);
          const receiptsList = receiptSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Receipt));
          setReceipts(receiptsList);
        } catch (error) {
          console.error("Error fetching receipts from Firestore:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (!authLoading) {
        // If there's no user and auth is not loading, clear receipts
        setReceipts([]);
        setIsLoading(false);
      }
    };

    fetchReceipts();
  }, [user, authLoading]);

  const addReceipt = async (newReceiptData: { vendor: string; category: string; totalAmount: number; items: string[], receiptDataUri: string }) => {
    if (!user) {
      console.error("No user logged in to add receipt.");
      return;
    }
    const receiptToAdd = {
      vendor: newReceiptData.vendor,
      date: new Date().toISOString(),
      total: newReceiptData.totalAmount,
      category: newReceiptData.category,
      items: newReceiptData.items,
      receiptDataUri: newReceiptData.receiptDataUri,
    };

    try {
      const receiptsCol = collection(db, 'users', user.uid, 'receipts');
      const docRef = await addDoc(receiptsCol, receiptToAdd);
      setReceipts(prevReceipts => [{ id: docRef.id, ...receiptToAdd, date: receiptToAdd.date }, ...prevReceipts] as Receipt[]);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  };

  const updateReceipt = async (id: string, updatedData: Partial<Receipt>) => {
    if (!user) {
      console.error("No user logged in to update receipt.");
      return;
    }
    try {
      const receiptDoc = doc(db, 'users', user.uid, 'receipts', id);
      await updateDoc(receiptDoc, updatedData);
      setReceipts(prevReceipts => 
        prevReceipts.map(r => r.id === id ? { ...r, ...updatedData } : r)
      );
    } catch (error) {
      console.error("Error updating document:", error);
    }
  };

  const deleteReceipt = async (id: string) => {
    if (!user) {
      console.error("No user logged in to delete receipt.");
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'receipts', id));
      setReceipts(prevReceipts => prevReceipts.filter(receipt => receipt.id !== id));
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };
  
  const value = { receipts, addReceipt, updateReceipt, deleteReceipt, isLoading };

  return React.createElement(ReceiptsContext.Provider, { value: value }, children);
};

export const useReceipts = () => {
  const context = useContext(ReceiptsContext);
  if (context === undefined) {
    throw new Error('useReceipts must be used within a ReceiptsProvider');
  }
  return context;
};
