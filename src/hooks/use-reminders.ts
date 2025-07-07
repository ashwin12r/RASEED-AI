
'use client'
import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useAuth } from './use-auth';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp } from 'firebase/firestore';

export interface Reminder {
  id: string;
  productName: string;
  purchaseDate: Timestamp;
  returnByDate: Timestamp;
}

interface RemindersContextType {
  reminders: Reminder[];
  addReminder: (newReminderData: Omit<Reminder, 'id'>) => Promise<void>;
  deleteReminder: (id: string) => Promise<void>;
  isLoading: boolean;
}

const RemindersContext = createContext<RemindersContextType | undefined>(undefined);

export const RemindersProvider = ({ children }: { children: ReactNode }) => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchReminders = async () => {
      if (user) {
        setIsLoading(true);
        try {
          const remindersCol = collection(db, 'users', user.uid, 'reminders');
          const q = query(remindersCol, orderBy('returnByDate', 'asc'));
          const reminderSnapshot = await getDocs(q);
          const remindersList = reminderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Reminder));
          setReminders(remindersList);
        } catch (error) {
          console.error("Error fetching reminders from Firestore:", error);
        } finally {
          setIsLoading(false);
        }
      } else if (!authLoading) {
        setReminders([]);
        setIsLoading(false);
      }
    };

    fetchReminders();
  }, [user, authLoading]);

  const addReminder = async (newReminderData: Omit<Reminder, 'id'>) => {
    if (!user) {
      console.error("No user logged in to add reminder.");
      return;
    }
    try {
      const remindersCol = collection(db, 'users', user.uid, 'reminders');
      const docRef = await addDoc(remindersCol, newReminderData);
      setReminders(prev => [...prev, { id: docRef.id, ...newReminderData }].sort((a,b) => a.returnByDate.toMillis() - b.returnByDate.toMillis()));
    } catch (error) {
      console.error("Error adding reminder document: ", error);
      throw error;
    }
  };

  const deleteReminder = async (id: string) => {
    if (!user) {
      console.error("No user logged in to delete reminder.");
      return;
    }
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'reminders', id));
      setReminders(prev => prev.filter(reminder => reminder.id !== id));
    } catch (error) {
      console.error("Error deleting reminder document: ", error);
      throw error;
    }
  };
  
  const value = { reminders, addReminder, deleteReminder, isLoading };

  return React.createElement(RemindersContext.Provider, { value: value }, children);
};

export const useReminders = () => {
  const context = useContext(RemindersContext);
  if (context === undefined) {
    throw new Error('useReminders must be used within a RemindersProvider');
  }
  return context;
};
