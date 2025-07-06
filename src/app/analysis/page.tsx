
'use client'
import React, { useState, useRef, useEffect, FormEvent } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { useReceipts } from "@/hooks/use-receipts"
import { analyzeSpending } from "@/ai/flows/spending-analysis"
import { generateShoppingListPass } from "@/ai/flows/generate-shopping-list-pass"
import { useToast } from "@/hooks/use-toast"

interface Message {
  id: number;
  text: React.ReactNode;
  sender: 'user' | 'bot';
  passDetails?: string;
}

export default function AnalysisPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Welcome! Ask me anything about your spending. For example: 'How much did I spend on dining out last week?' or 'Create a shopping list for pasta night.'",
      sender: 'bot'
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { receipts } = useReceipts()
  const { toast } = useToast()
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollViewportRef.current) {
        scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: FormEvent) => {
    e.preventDefault()
    if (input.trim() === "" || isLoading) return
    
    const userMessage: Message = { id: Date.now(), text: input, sender: 'user' }
    setMessages(prev => [...prev, userMessage])
    
    const currentInput = input;
    setInput("")
    setIsLoading(true)

    const handleAiResponse = async () => {
      try {
        let botResponse: Message;
        if (currentInput.toLowerCase().includes('shopping list')) {
          const result = await generateShoppingListPass({ query: currentInput });
          botResponse = {
            id: Date.now() + 1,
            text: "Here is the shopping list you requested. You can add it to your Google Wallet.",
            sender: 'bot',
            passDetails: result.passDetails,
          };
        } else {
          if (receipts.length === 0) {
            botResponse = {
              id: Date.now() + 1,
              text: "I don't have any receipt data to analyze. Please add some receipts first.",
              sender: 'bot'
            };
          } else {
            const result = await analyzeSpending({ query: currentInput, receiptData: JSON.stringify(receipts) });
            botResponse = {
              id: Date.now() + 1,
              text: (
                <>
                  <p>{result.summary}</p>
                  {result.savingsSuggestions && <p className="mt-2">{result.savingsSuggestions}</p>}
                </>
              ),
              sender: 'bot'
            };
          }
        }
        setMessages(prev => [...prev, botResponse]);
      } catch (error) {
        console.error("AI response error:", error);
        toast({
          title: "Error",
          description: "Sorry, I had trouble processing that request. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false);
      }
    }
    handleAiResponse();
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold md:text-3xl">Spending Analysis</h1>
        <p className="text-muted-foreground">Ask AI about your spending habits.</p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full" viewportRef={scrollViewportRef}>
          <div className="space-y-6 p-4">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex items-start gap-4", message.sender === 'user' ? "justify-end" : "")}>
                {message.sender === 'bot' && (
                  <Avatar>
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <div className={cn(
                  "max-w-xl p-4 rounded-lg shadow-sm", 
                  message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card'
                )}>
                  <div className="text-sm prose dark:prose-invert prose-p:my-0">{message.text}</div>
                  {message.passDetails && (
                    <Card className="mt-4 bg-background">
                      <CardHeader>
                        <CardTitle className="text-base">Shopping List</CardTitle>
                        <CardDescription>Generated for you</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {message.passDetails.split(',').map(item => item.trim()).filter(Boolean).map(item => <li key={item}>{item}</li>)}
                        </ul>
                        <Button variant="outline" className="w-full mt-4">
                            <Wallet className="mr-2 h-4 w-4" />
                            Add to Google Wallet
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
                {message.sender === 'user' && (
                  <Avatar>
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <div className="max-w-md p-4 rounded-lg bg-card">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-foreground animate-pulse [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 rounded-full bg-foreground animate-pulse [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 rounded-full bg-foreground animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="p-4 border-t bg-background">
        <form onSubmit={handleSend}>
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your spending..."
              className="pr-12"
              disabled={isLoading}
              aria-label="Chat input"
            />
            <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={isLoading} aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
