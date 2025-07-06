
'use client'

import { useState, useEffect } from 'react';

export interface Receipt {
  id: string;
  vendor: string;
  date: string;
  total: number;
  category: string;
  items: number;
  receiptDataUri: string;
}

const isBrowser = typeof window !== 'undefined';

const defaultReceipts: Receipt[] = [];


export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    if (!isBrowser) return;
    try {
      const item = window.localStorage.getItem('receipts');
      if (item) {
        setReceipts(JSON.parse(item));
      } else {
        setReceipts(defaultReceipts);
      }
    } catch (error) {
      console.error(error);
      setReceipts(defaultReceipts);
    }
  }, []);

  useEffect(() => {
    if (!isBrowser) return;
    try {
        if (receipts.length === 0 && window.localStorage.getItem('receipts')) {
             window.localStorage.removeItem('receipts');
        } else if (receipts.length > 0) {
            window.localStorage.setItem('receipts', JSON.stringify(receipts));
        }
    } catch (error) {
      console.error(error);
    }
  }, [receipts]);

  const addReceipt = (newReceiptData: { vendor: string; category: string; totalAmount: number; items: string[], receiptDataUri: string }) => {
    const newReceipt: Receipt = {
      id: `R${Date.now()}`,
      vendor: newReceiptData.vendor,
      date: new Date().toISOString().split('T')[0],
      total: newReceiptData.totalAmount,
      category: newReceiptData.category,
      items: newReceiptData.items.length,
      receiptDataUri: newReceiptData.receiptDataUri,
    };
    setReceipts(prevReceipts => [newReceipt, ...prevReceipts]);
  };

  const deleteReceipt = (id: string) => {
    setReceipts(prevReceipts => {
        const updatedReceipts = prevReceipts.filter(receipt => receipt.id !== id);
        if (updatedReceipts.length === 0) {
            window.localStorage.removeItem('receipts');
        }
        return updatedReceipts;
    });
  };

  return { receipts, addReceipt, deleteReceipt };
}
