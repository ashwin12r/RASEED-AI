
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
import { Loader2, Upload, Sparkles, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { categorizeReceipt, CategorizeReceiptOutput } from "@/ai/flows/dynamic-categorization"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useReceipts } from "@/hooks/use-receipts"
import { trackWarranty } from "@/ai/flows/warranty-tracker"
import { setReturnReminder } from "@/ai/flows/return-reminder"
import { useWarranties } from "@/hooks/use-warranties"
import { useReminders } from "@/hooks/use-reminders"
import { Timestamp } from "firebase/firestore"

export function AddReceiptDialog({ trigger }: { trigger: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [receiptDataUri, setReceiptDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CategorizeReceiptOutput | null>(null);
  const { toast } = useToast();
  const { addReceipt } = useReceipts();
  const { addWarranty } = useWarranties();
  const { addReminder } = useReminders();


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setAnalysisResult(null);
    if (selectedFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUri = reader.result as string;
            setFilePreview(dataUri);
            setReceiptDataUri(dataUri);
        };
        reader.readAsDataURL(selectedFile);
    } else {
        setFilePreview(null);
        setReceiptDataUri(null);
    }
  }

  const handleAnalyze = async () => {
    if (!file || !receiptDataUri) {
      toast({
        title: "No file selected",
        description: "Please select a receipt image to analyze.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setAnalysisResult(null);

    try {
        const categoryResult = await categorizeReceipt({ receiptDataUri });
        setAnalysisResult(categoryResult);
        
        toast({
            title: "Analysis Complete",
            description: "The receipt has been successfully analyzed.",
        });
    } catch (error) {
        console.error("Analysis failed:", error);
        toast({
            title: "Analysis Failed",
            description: "There was an error analyzing your receipt. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
  }
  
  const resetDialog = () => {
    setFile(null);
    setFilePreview(null);
    setReceiptDataUri(null);
    setAnalysisResult(null);
    setIsLoading(false);
    setIsSaving(false);
    setIsOpen(false);
  }

  const handleSave = async () => {
    if (!analysisResult || !receiptDataUri) {
        toast({
            title: "No analysis data",
            description: "Please analyze the receipt first.",
            variant: "destructive"
        });
        return;
    }
    
    setIsSaving(true);
    await addReceipt({ ...analysisResult, receiptDataUri });
    
    toast({
        title: "Receipt Saved",
        description: "Scanning for warranties and reminders in the background...",
    });
    
    resetDialog(); // Close dialog immediately for better UX

    // Run background scans for warranties and reminders
    try {
        const [warrantyResult, reminderResult] = await Promise.all([
            trackWarranty({ receiptDataUri }),
            setReturnReminder({ receiptDataUri })
        ]);

        let warrantiesFound = 0;
        if (warrantyResult?.items?.length > 0) {
            warrantiesFound = warrantyResult.items.length;
            for (const item of warrantyResult.items) {
                await addWarranty({
                    productName: item.productName,
                    purchaseDate: Timestamp.fromDate(new Date(item.purchaseDate)),
                    warrantyEndDate: Timestamp.fromDate(new Date(item.warrantyEndDate)),
                });
            }
        }

        let remindersFound = 0;
        if (reminderResult?.reminders?.length > 0) {
            remindersFound = reminderResult.reminders.length;
            for (const item of reminderResult.reminders) {
                await addReminder({
                    productName: item.productName,
                    purchaseDate: Timestamp.fromDate(new Date(item.purchaseDate)),
                    returnByDate: Timestamp.fromDate(new Date(item.returnByDate)),
                });
            }
        }

        if (warrantiesFound > 0 || remindersFound > 0) {
            toast({
                title: "Scan Complete",
                description: `Found ${warrantiesFound} warranty/ies and ${remindersFound} reminder(s). They've been added to your lists.`,
            });
        }
    } catch (error) {
        console.error("Failed to scan for warranties/reminders:", error);
        toast({
            title: "Background Scan Failed",
            description: "Could not automatically find warranties or reminders for this receipt.",
            variant: "destructive"
        });
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
          <DialogTitle>Add New Receipt</DialogTitle>
          <DialogDescription>
            Upload a photo of your receipt for categorization.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="receipt-file">Receipt Media</Label>
            <div className="flex items-center justify-center w-full">
                <label htmlFor="receipt-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted transition-colors hover:bg-muted/80 hover:border-primary data-[preview=true]:h-auto">
                   {filePreview ? (
                     <img src={filePreview} alt="Receipt preview" className="max-h-64 w-auto object-contain rounded-lg p-2" />
                   ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, etc.</p>
                    </div>
                   )}
                    <Input id="receipt-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isLoading || isSaving} />
                </label>
            </div>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Analyzing... This may take a moment.</span>
            </div>
          )}

          {analysisResult && (
            <div className="space-y-4">
               <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Dynamic Categorization</AlertTitle>
                <AlertDescription>
                  <p>Vendor: <span className="font-semibold">{analysisResult.vendor}</span></p>
                  <p>Category: <span className="font-semibold capitalize">{analysisResult.category}</span></p>
                  <p>Total: <span className="font-semibold">₹{analysisResult.totalAmount.toFixed(2)}</span></p>
                </AlertDescription>
              </Alert>
            </div>
          )}

        </div>
        <DialogFooter>
          {analysisResult ? (
            <>
              <Button variant="outline" onClick={() => setAnalysisResult(null)} disabled={isSaving}>Analyze Again</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                 {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Save Receipt
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={resetDialog} disabled={isLoading}>Cancel</Button>
              <Button onClick={handleAnalyze} disabled={!file || isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Analyze Receipt
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
