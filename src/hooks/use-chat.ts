
'use client'

import React, { useState, createContext, useContext, ReactNode } from 'react';

// Re-exporting this to be used in the analysis page
export interface Message {
  id: number;
  text: React.ReactNode;
  sender: 'user' | 'bot';
  walletJwt?: string;
  shoppingListItems?: string[];
  shoppingListStore?: string;
}

interface ChatContextType {
  messages: Message[];
  addMessage: (message: Omit<Message, 'id'>) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const initialMessage: Message = {
  id: 1,
  text: "Welcome! Ask me anything about your spending. For example: 'How much did I spend on dining out last week?' or 'Create a shopping list for pasta night.'",
  sender: 'bot'
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [isLoading, setIsLoading] = useState(false);

  const addMessage = (message: Omit<Message, 'id'>) => {
    // Generate a unique ID for the new message
    const newMessage = { ...message, id: Date.now() + Math.random() };
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  const value = {
    messages,
    addMessage,
    isLoading,
    setIsLoading,
  };

  return React.createElement(ChatContext.Provider, { value }, children);
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
