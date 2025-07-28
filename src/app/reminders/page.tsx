
'use client'
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BellRing, Info, Loader2, MoreHorizontal, Trash2, PlusCircle, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useReminders } from "@/hooks/use-reminders"
import { useToast } from "@/hooks/use-toast"
import { differenceInCalendarDays } from 'date-fns'
import { AddReminderDialog } from "@/components/add-reminder-dialog"
import { generateReminderPass } from "@/ai/flows/generate-reminder-pass"

interface ReminderItem {
    id: string;
    productName: string;
    purchaseDate: string;
    returnByDate: string;
    daysLeft: number;
}

export default function RemindersPage() {
    const { reminders, isLoading, deleteReminder } = useReminders();
    const { toast } = useToast();
    const [isWalletLoading, setIsWalletLoading] = React.useState<string | null>(null);

    const processedReminders = React.useMemo((): ReminderItem[] => {
      return reminders.map(reminder => {
        const returnDate = reminder.returnByDate.toDate();
        const today = new Date();
        const daysLeft = differenceInCalendarDays(returnDate, today);
        
        return {
            id: reminder.id,
            productName: reminder.productName,
            purchaseDate: reminder.purchaseDate.toDate().toLocaleDateString(),
            returnByDate: returnDate.toLocaleDateString(),
            daysLeft: daysLeft >= 0 ? daysLeft : 0,
        };
      }).sort((a, b) => a.daysLeft - b.daysLeft);
    }, [reminders]);

    const handleDelete = async (id: string) => {
      try {
        await deleteReminder(id);
        toast({
          title: "Reminder Deleted",
          description: "The reminder has been successfully removed.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not delete the reminder.",
          variant: "destructive",
        });
      }
    };
    
    const handleAddToWallet = async (reminderId: string) => {
        setIsWalletLoading(reminderId);
        const originalReminder = reminders.find(r => r.id === reminderId);

        if (!originalReminder) {
            toast({ title: "Error", description: "Could not find reminder details.", variant: "destructive" });
            setIsWalletLoading(null);
            return;
        }

        try {
            const { jwt } = await generateReminderPass({
                id: originalReminder.id,
                productName: originalReminder.productName,
                purchaseDate: originalReminder.purchaseDate.toDate().toISOString(),
                returnByDate: originalReminder.returnByDate.toDate().toISOString(),
            });
            window.open(`https://pay.google.com/gp/v/save/${jwt}`, '_blank');
            toast({
                title: "Redirecting to Google Wallet",
                description: "Please follow the instructions in the new tab to save your pass.",
            });
        } catch(error) {
            console.error("Failed to generate wallet pass:", error);
            toast({
                title: "Error",
                description: "Could not generate Google Wallet pass. Please ensure your credentials are set up correctly.",
                variant: "destructive"
            });
        } finally {
            setIsWalletLoading(null);
        }
    };

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <BellRing className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold md:text-3xl">Return & Refund Reminders</h1>
                    <p className="text-muted-foreground">Never miss a return window again.</p>
                </div>
            </div>
            <AddReminderDialog trigger={
              <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Reminder</Button>
            } />
        </div>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>How it works</AlertTitle>
          <AlertDescription>
            You can add reminders manually for products you want to keep track of for returns.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Return Deadlines</CardTitle>
            <CardDescription>Items you can still return.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Return By</TableHead>
                  <TableHead>Days Left</TableHead>
                  <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                          <span>Loading reminders...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : processedReminders.length > 0 ? (
                  processedReminders.map((item) => (
                    <TableRow key={item.id} className={item.daysLeft <= 5 ? "bg-destructive/10" : ""}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.purchaseDate}</TableCell>
                      <TableCell>{item.returnByDate}</TableCell>
                      <TableCell className="font-bold">{item.daysLeft}</TableCell>
                      <TableCell className="text-right">
                         <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                              {isWalletLoading === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAddToWallet(item.id)} disabled={isWalletLoading !== null}>
                                <Wallet className="mr-2 h-4 w-4" />
                                Add to Wallet
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                               Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                   <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">No upcoming return reminders found. Add one to get started.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
}
