
'use client'

import { useState, useEffect } from 'react';

export interface Receipt {
  id: string;
  vendor: string;
  date: string;
  total: number;
  category: string;
  items: number;
}

const isBrowser = typeof window !== 'undefined';

const defaultReceipts: Receipt[] = [
    { id: "R001", vendor: "Grocery Mart", date: "2024-06-23", total: 6259.86, category: "Groceries", items: 12 },
    { id: "R002", vendor: "The Coffee House", date: "2024-06-22", total: 1062.4, category: "Dining", items: 3 },
    { id: "R003", vendor: "Tech Store", date: "2024-06-21", total: 41499.17, category: "Electronics", items: 1 },
    { id: "R004", vendor: "Gas Station", date: "2024-06-20", total: 4573.3, category: "Transport", items: 1 },
    { id: "R005", vendor: "Book Nook", date: "2024-06-19", total: 2033.5, category: "Entertainment", items: 2 },
    { id: "R006", vendor: "Home Improvement", date: "2024-06-18", total: 12716.43, category: "Home", items: 5 },
    { id: "R007", vendor: "Pharmacy", date: "2024-06-17", total: 2817.85, category: "Health", items: 4 },
];


export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);

  useEffect(() => {
    if (!isBrowser) return;
    try {
      const item = window.localStorage.getItem('receipts');
      if (item) {
        setReceipts(JSON.parse(item));
      } else {
        // Load default receipts if local storage is empty
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
        if(receipts.length > 0){
            window.localStorage.setItem('receipts', JSON.stringify(receipts));
        }
    } catch (error) {
      console.error(error);
    }
  }, [receipts]);

  const addReceipt = (newReceiptData: { vendor: string; category: string; totalAmount: number; items: string[] }) => {
    const newReceipt: Receipt = {
      id: `R${Date.now()}`,
      vendor: newReceiptData.vendor,
      date: new Date().toISOString().split('T')[0],
      total: newReceiptData.totalAmount,
      category: newReceiptData.category,
      items: newReceiptData.items.length,
    };
    setReceipts(prevReceipts => [newReceipt, ...prevReceipts]);
  };

  const deleteReceipt = (id: string) => {
    setReceipts(prevReceipts => prevReceipts.filter(receipt => receipt.id !== id));
  };

  return { receipts, addReceipt, deleteReceipt };
}
