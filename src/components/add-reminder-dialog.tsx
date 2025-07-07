
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
import { Loader2, Save, Upload, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useReminders } from "@/hooks/use-reminders"
import { DatePicker } from "@/components/ui/date-picker"
import { Timestamp } from "firebase/firestore"
import { setReturnReminder, ReturnReminderOutput } from "@/ai/flows/return-reminder"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"

export function AddReminderDialog({ trigger }: { trigger: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  // Form fields state
  const [productName, setProductName] = useState("")
  const [purchaseDate, setPurchaseDate] = useState<Date>()
  const [returnByDate, setReturnByDate] = useState<Date>()

  // File and AI state
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ReturnReminderOutput['reminders'][0] | null>(null);
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()
  const { addReminder } = useReminders()

  const resetDialog = () => {
    setProductName("")
    setPurchaseDate(undefined)
    setReturnByDate(undefined)
    setFile(null)
    setFilePreview(null)
    setDataUri(null)
    setIsAnalyzing(false)
    setAnalysisResult(null)
    setIsLoading(false)
    setIsOpen(false)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setAnalysisResult(null); // Clear previous results
    if (selectedFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUri = reader.result as string;
            setFilePreview(dataUri);
            setDataUri(dataUri);
        };
        reader.readAsDataURL(selectedFile);
    } else {
        setFilePreview(null);
        setDataUri(null);
    }
  }

  const handleAnalyze = async () => {
    if (!file || !dataUri) {
      toast({
        title: "No file selected",
        description: "Please select an image to analyze.",
        variant: "destructive"
      });
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
        const result = await setReturnReminder({ receiptDataUri: dataUri });
        if (result.reminders && result.reminders.length > 0) {
          const firstItem = result.reminders[0];
          setAnalysisResult(firstItem);
          setProductName(firstItem.productName);
          setPurchaseDate(new Date(firstItem.purchaseDate));
          setReturnByDate(new Date(firstItem.returnByDate));
          toast({
              title: "Analysis Complete",
              description: "The form has been pre-filled with the extracted data.",
          });
        } else {
          toast({
            title: "Analysis Complete",
            description: "Could not find any return information. Please fill out the form manually.",
          });
        }
    } catch (error) {
        console.error("Analysis failed:", error);
        toast({
            title: "Analysis Failed",
            description: "There was an error analyzing your document. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsAnalyzing(false);
    }
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
            Upload a receipt to auto-fill, or enter details manually.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
           <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="reminder-file">Receipt Media (Optional)</Label>
            <div className="flex items-center justify-center w-full">
                <label htmlFor="reminder-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted transition-colors hover:bg-muted/80 hover:border-primary data-[preview=true]:h-auto">
                   {filePreview ? (
                     <img src={filePreview} alt="Reminder preview" className="max-h-64 w-auto object-contain rounded-lg p-2" />
                   ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                    </div>
                   )}
                    <Input id="reminder-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isLoading || isAnalyzing} />
                </label>
            </div>
             {file && (
              <Button onClick={handleAnalyze} variant="outline" size="sm" className="mt-2" disabled={isAnalyzing}>
                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Analyze Image
              </Button>
            )}
          </div>
          
          {isAnalyzing && (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin h-5 w-5" />
                <span>Analyzing...</span>
            </div>
          )}

          {analysisResult && (
             <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertTitle>Analysis Result</AlertTitle>
              <AlertDescription>
                <p>Product: <span className="font-semibold">{analysisResult.productName}</span></p>
                <p>Please verify the dates below.</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="product-name">Product Name</Label>
            <Input id="product-name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Blue T-shirt" disabled={isLoading || isAnalyzing} />
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
          <Button variant="outline" onClick={resetDialog} disabled={isLoading || isAnalyzing}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading || isAnalyzing || !productName || !purchaseDate || !returnByDate}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Reminder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
