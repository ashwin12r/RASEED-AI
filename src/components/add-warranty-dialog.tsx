
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
import { useWarranties } from "@/hooks/use-warranties"
import { DatePicker } from "@/components/ui/date-picker"
import { Timestamp } from "firebase/firestore"

export function AddWarrantyDialog({ trigger }: { trigger: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [productName, setProductName] = useState("")
  const [purchaseDate, setPurchaseDate] = useState<Date>()
  const [warrantyEndDate, setWarrantyEndDate] = useState<Date>()
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { addWarranty } = useWarranties()

  const resetDialog = () => {
    setProductName("")
    setPurchaseDate(undefined)
    setWarrantyEndDate(undefined)
    setIsLoading(false)
    setIsOpen(false)
  }

  const handleSave = async () => {
    if (!productName || !purchaseDate || !warrantyEndDate) {
      toast({
        title: "Missing Information",
        description: "Please fill out all fields to save the warranty.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);

    try {
      await addWarranty({ 
        productName,
        purchaseDate: Timestamp.fromDate(purchaseDate),
        warrantyEndDate: Timestamp.fromDate(warrantyEndDate),
       });
      
      toast({
        title: "Warranty Saved",
        description: "The warranty has been successfully saved.",
      });
      resetDialog();
    } catch (error) {
      console.error("Save failed:", error);
      toast({
        title: "Save Failed",
        description: "There was an error saving your warranty. Please try again.",
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
          <DialogTitle>Add New Warranty</DialogTitle>
          <DialogDescription>
            Manually enter the details for a product warranty.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="product-name">Product Name</Label>
            <Input id="product-name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Sony Headphones" disabled={isLoading} />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="purchase-date">Purchase Date</Label>
            <DatePicker date={purchaseDate} onDateChange={setPurchaseDate} placeholder="Select purchase date" />
          </div>
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="warranty-end-date">Warranty End Date</Label>
            <DatePicker date={warrantyEndDate} onDateChange={setWarrantyEndDate} placeholder="Select warranty end date" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={resetDialog} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Warranty
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
