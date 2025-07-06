
'use client'

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';

export interface Receipt {
  id: string;
  vendor: string;
  date: string;
  total: number;
  category: string;
  items: number;
  receiptDataUri: string;
}

interface ReceiptsContextType {
  receipts: Receipt[];
  addReceipt: (newReceiptData: { vendor: string; category: string; totalAmount: number; items: string[], receiptDataUri: string }) => void;
  deleteReceipt: (id: string) => void;
  isLoading: boolean;
}

const ReceiptsContext = createContext<ReceiptsContextType | undefined>(undefined);

const isBrowser = typeof window !== 'undefined';

export const ReceiptsProvider = ({ children }: { children: ReactNode }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load receipts from localStorage on initial mount
  useEffect(() => {
    if (!isBrowser) return;
    try {
      const item = window.localStorage.getItem('receipts');
      if (item) {
        setReceipts(JSON.parse(item));
      }
    } catch (error) {
      console.error("Failed to parse receipts from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  // Save receipts to localStorage whenever they change
  useEffect(() => {
    if (!isBrowser || isLoading) return;
    try {
        window.localStorage.setItem('receipts', JSON.stringify(receipts));
    } catch (error) {
      console.error("Failed to save receipts to localStorage", error);
    }
  }, [receipts, isLoading]);

  const addReceipt = (newReceiptData: { vendor: string; category: string; totalAmount: number; items: string[], receiptDataUri: string }) => {
    const newReceipt: Receipt = {
      id: `R${Date.now()}`,
      vendor: newReceiptData.vendor,
      date: new Date().toISOString(),
      total: newReceiptData.totalAmount,
      category: newReceiptData.category,
      items: newReceiptData.items.length,
      receiptDataUri: newReceiptData.receiptDataUri,
    };
    setReceipts(prevReceipts => [newReceipt, ...prevReceipts]);
  };

  const deleteReceipt = (id: string) => {
    setReceipts(prevReceipts => prevReceipts.filter(receipt => receipt.id !== id));
  };
  
  const value = { receipts, addReceipt, deleteReceipt, isLoading };

  return React.createElement(ReceiptsContext.Provider, { value: value }, children);
};

export const useReceipts = () => {
  const context = useContext(ReceiptsContext);
  if (context === undefined) {
    throw new Error('useReceipts must be used within a ReceiptsProvider');
  }
  return context;
};
