
'use client'
import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BellRing, Info, Loader2 } from "lucide-react"
import { useReceipts } from "@/hooks/use-receipts"
import { setReturnReminder } from "@/ai/flows/return-reminder"
import { useToast } from "@/hooks/use-toast"
import { differenceInCalendarDays } from 'date-fns'

interface ReminderItem {
    id: string;
    productName: string;
    purchaseDate: string;
    returnByDate: string;
    daysLeft: number;
}

export default function RemindersPage() {
    const [reminders, setReminders] = useState<ReminderItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { receipts } = useReceipts();
    const { toast } = useToast();

    useEffect(() => {
        const fetchReminders = async () => {
            if (receipts.length === 0) {
                setIsLoading(false);
                setReminders([]);
                return;
            }

            setIsLoading(true);
            try {
                const allRemindersPromises = receipts.map(receipt => 
                    setReturnReminder({ receiptDataUri: receipt.receiptDataUri })
                );
                
                const results = await Promise.allSettled(allRemindersPromises);

                const newReminders: ReminderItem[] = [];
                results.forEach((result, index) => {
                    if (result.status === 'fulfilled' && result.value.reminders) {
                        result.value.reminders.forEach(reminder => {
                            try {
                                const returnDate = new Date(reminder.returnByDate);
                                const today = new Date();
                                const daysLeft = differenceInCalendarDays(returnDate, today);
                                
                                newReminders.push({
                                    id: `${receipts[index].id}-${reminder.productName}`,
                                    productName: reminder.productName,
                                    purchaseDate: new Date(reminder.purchaseDate).toLocaleDateString(),
                                    returnByDate: returnDate.toLocaleDateString(),
                                    daysLeft: daysLeft >= 0 ? daysLeft : 0,
                                });
                            } catch(e) {
                                console.error('Could not parse date from reminder', e);
                            }
                        });
                    } else if (result.status === 'rejected') {
                        console.error("Failed to fetch reminder for a receipt:", result.reason);
                    }
                });

                setReminders(newReminders.sort((a, b) => a.daysLeft - b.daysLeft));

            } catch (error) {
                console.error("Error fetching reminders:", error);
                toast({
                    title: "Error",
                    description: "Could not fetch return reminders.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        // This check is to avoid running on initial empty receipts from SSR
        if (receipts.length > 0 || localStorage.getItem('receipts') === null) {
          fetchReminders();
        }
    }, [receipts, toast]);


  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4">
        <BellRing className="h-8 w-8 text-primary" />
        <div>
            <h1 className="text-2xl font-bold md:text-3xl">Return & Refund Reminders</h1>
            <p className="text-muted-foreground">Never miss a return window again.</p>
        </div>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>How it works</AlertTitle>
        <AlertDescription>
          We automatically scan your receipts for return policies and create reminders for you. You'll get a notification before a return window closes.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Return Deadlines</CardTitle>
          <CardDescription>Items you can still return based on your receipts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Return By</TableHead>
                <TableHead className="text-right">Days Left</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span>Scanning receipts for reminders...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : reminders.length > 0 ? (
                reminders.map((item) => (
                  <TableRow key={item.id} className={item.daysLeft <= 5 ? "bg-destructive/10" : ""}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.purchaseDate}</TableCell>
                    <TableCell>{item.returnByDate}</TableCell>
                    <TableCell className="text-right font-bold">{item.daysLeft}</TableCell>
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">No upcoming return reminders found. Add receipts to get started.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
