
'use client'
import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useReminders } from "@/hooks/use-reminders"
import { DatePicker } from "@/components/ui/date-picker"
import { Timestamp } from "firebase/firestore"

export function AddReminderDialog({ trigger }: { trigger: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [productName, setProductName] = useState("")
  const [purchaseDate, setPurchaseDate] = useState<Date>()
  const [returnByDate, setReturnByDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { addReminder } = useReminders()

  const resetDialog = () => {
    setProductName("")
    setPurchaseDate(undefined)
    setReturnByDate(undefined)
    setIsLoading(false)
    setIsOpen(false)
  }

  const handleSave = async () => {
    if (!productName || !purchaseDate || !returnByDate) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields to save the reminder.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);

    try {
      await addReminder({ 
        productName,
        purchaseDate: Timestamp.fromDate(purchaseDate),
        returnByDate: Timestamp.fromDate(returnByDate),
       });
      
      toast({
        title: "Reminder Saved",
        description: "The reminder has been successfully saved.",
      });
      resetDialog();
    } catch (error) {
      console.error("Save failed:", error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your reminder. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) resetDialog();
      setIsOpen(open);
    }}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Reminder</DialogTitle>
          <DialogDescription>
            Manually enter the details for a return reminder.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="product-name">Product Name</Label>
            <Input id="product-name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Blue T-shirt" disabled={isLoading} />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="purchase-date">Purchase Date</Label>
            <DatePicker date={purchaseDate} onDateChange={setPurchaseDate} placeholder="Select purchase date" />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="return-by-date">Return By Date</Label>
            <DatePicker date={returnByDate} onDateChange={setReturnByDate} placeholder="Select return by date" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={resetDialog} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
