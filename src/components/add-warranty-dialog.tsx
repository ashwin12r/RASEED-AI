
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
import { useWarranties } from "@/hooks/use-warranties"
import { DatePicker } from "@/components/ui/date-picker"
import { Timestamp } from "firebase/firestore"
import { trackWarranty, WarrantyTrackerOutput } from "@/ai/flows/warranty-tracker"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"

export function AddWarrantyDialog({ trigger }: { trigger: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  
  // Form fields state
  const [productName, setProductName] = useState("")
  const [purchaseDate, setPurchaseDate] = useState<Date>()
  const [warrantyEndDate, setWarrantyEndDate] = useState<Date>()
  
  // File and AI state
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [dataUri, setDataUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<WarrantyTrackerOutput['items'][0] | null>(null);
  const [isLoading, setIsLoading] = useState(false)

  const { toast } = useToast()
  const { addWarranty } = useWarranties()

  const resetDialog = () => {
    setProductName("")
    setPurchaseDate(undefined)
    setWarrantyEndDate(undefined)
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
        const result = await trackWarranty({ receiptDataUri: dataUri });
        if (result.items && result.items.length > 0) {
          const firstItem = result.items[0];
          setAnalysisResult(firstItem);
          setProductName(firstItem.productName);
          setPurchaseDate(new Date(firstItem.purchaseDate));
          setWarrantyEndDate(new Date(firstItem.warrantyEndDate));
          toast({
              title: "Analysis Complete",
              description: "The form has been pre-filled with the extracted data.",
          });
        } else {
          toast({
            title: "Analysis Complete",
            description: "Could not find any warranty information. Please fill out the form manually.",
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
            Upload a warranty card or receipt to auto-fill, or enter details manually.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="warranty-file">Warranty Media (Optional)</Label>
            <div className="flex items-center justify-center w-full">
                <label htmlFor="warranty-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted transition-colors hover:bg-muted/80 hover:border-primary data-[preview=true]:h-auto">
                   {filePreview ? (
                     <img src={filePreview} alt="Warranty preview" className="max-h-64 w-auto object-contain rounded-lg p-2" />
                   ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span></p>
                    </div>
                   )}
                    <Input id="warranty-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isLoading || isAnalyzing} />
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
            <Input id="product-name" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Sony Headphones" disabled={isLoading || isAnalyzing} />
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
          <Button variant="outline" onClick={resetDialog} disabled={isLoading || isAnalyzing}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading || isAnalyzing || !productName || !purchaseDate || !warrantyEndDate}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Warranty
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
