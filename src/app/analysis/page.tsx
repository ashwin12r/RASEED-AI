
'use client'
import React, { useState, useRef, useEffect, FormEvent } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Wallet, Mic, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useReceipts } from "@/hooks/use-receipts"
import { analyzeSpending } from "@/ai/flows/spending-analysis"
import { generateShoppingListPass } from "@/ai/flows/generate-shopping-list-pass"
import { useToast } from "@/hooks/use-toast"
import { textToSpeech } from "@/ai/flows/text-to-speech"

interface Message {
  id: number;
  text: React.ReactNode;
  sender: 'user' | 'bot';
  walletJwt?: string;
  shoppingListItems?: string[];
  shoppingListStore?: string;
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
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  
  const { receipts } = useReceipts()
  const { toast } = useToast()
  
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Browser not supported",
        description: "Voice recognition is not supported by your browser.",
        variant: "destructive"
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const speechToText = event.results[0][0].transcript;
      handleSend(null, speechToText); // Pass the transcribed text to handleSend
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      if (event.error !== 'no-speech') {
        toast({ title: "Voice Error", description: "Something went wrong with voice recognition.", variant: "destructive"})
      }
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    }

    recognitionRef.current = recognition;
  }, [toast]);

  useEffect(() => {
    if (scrollViewportRef.current) {
        scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [messages]);

  const handleToggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else if (!isLoading && !isSpeaking) {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async (e: FormEvent | null, voiceQuery?: string) => {
    e?.preventDefault();
    const query = voiceQuery || input;

    if (query.trim() === "" || isLoading) return
    
    const userMessage: Message = { id: Date.now(), text: query, sender: 'user' }
    setMessages(prev => [...prev, userMessage])
    
    setInput("")
    setIsLoading(true)

    const handleAiResponse = async () => {
      try {
        let botResponse: Message;
        let textForSpeech = "";

        if (query.toLowerCase().includes('shopping list')) {
          const result = await generateShoppingListPass({ query });
          textForSpeech = "Here is the shopping list you requested. You can add it to your Google Wallet.";
          botResponse = {
            id: Date.now() + 1,
            text: textForSpeech,
            sender: 'bot',
            walletJwt: result.jwt,
            shoppingListItems: result.items,
            shoppingListStore: result.store
          };
        } else {
          if (receipts.length === 0) {
            textForSpeech = "I don't have any receipt data to analyze. Please add some receipts first.";
            botResponse = {
              id: Date.now() + 1,
              text: textForSpeech,
              sender: 'bot'
            };
          } else {
            const result = await analyzeSpending({ query, receiptData: JSON.stringify(receipts) });
            textForSpeech = result.summary || "I'm not sure how to answer that.";
            if (result.savingsSuggestions) textForSpeech += ` ${result.savingsSuggestions}`;
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

        if (voiceQuery) {
          setIsSpeaking(true);
          const ttsResponse = await textToSpeech(textForSpeech);
          if (ttsResponse.media && audioRef.current) {
            audioRef.current.src = ttsResponse.media;
            audioRef.current.play();
            audioRef.current.onended = () => setIsSpeaking(false);
          } else {
            setIsSpeaking(false);
            throw new Error("No audio media returned from the service.");
          }
        }
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
                  {message.walletJwt && message.shoppingListItems && (
                    <Card className="mt-4 bg-background">
                      <CardHeader>
                        <CardTitle className="text-base">Shopping List for {message.shoppingListStore}</CardTitle>
                        <CardDescription>Generated for you</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="list-disc list-inside text-sm text-muted-foreground">
                            {message.shoppingListItems.map(item => <li key={item}>{item}</li>)}
                        </ul>
                        <Button asChild variant="outline" className="w-full mt-4">
                            <a href={`https://pay.google.com/gp/v/save/${message.walletJwt}`} target="_blank" rel="noopener noreferrer">
                                <Wallet className="mr-2 h-4 w-4" />
                                Add to Google Wallet
                            </a>
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
        <form onSubmit={(e) => handleSend(e, undefined)}>
          <div className="relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening..." : "Ask about your spending..."}
              className="pr-24"
              disabled={isLoading || isListening}
              aria-label="Chat input"
            />
            <Button type="button" size="icon" className="absolute right-12 top-1/2 -translate-y-1/2 h-8 w-8" disabled={isLoading || isSpeaking} onClick={handleToggleListening} aria-label="Use microphone">
                {isListening ? <Volume2 className="h-4 w-4 text-destructive animate-pulse" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button type="submit" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8" disabled={isLoading || isListening || isSpeaking} aria-label="Send message">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
      <audio ref={audioRef} className="hidden" />
    </div>
  )
}
