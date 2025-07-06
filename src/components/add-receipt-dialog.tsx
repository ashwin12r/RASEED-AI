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
import { Loader2, Upload, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { categorizeReceipt, CategorizeReceiptOutput } from "@/ai/flows/dynamic-categorization"
import { detectFraud, FraudDetectionOutput } from "@/ai/flows/fraud-detection"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type AnalysisResult = {
    category: CategorizeReceiptOutput,
    fraud: FraudDetectionOutput
}

export function AddReceiptDialog({ trigger }: { trigger: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setAnalysisResult(null);
    if (selectedFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
    } else {
        setFilePreview(null);
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
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
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async (e) => {
            const receiptDataUri = e.target?.result as string;
            
            // Run analyses in parallel
            const [categoryResult, fraudResult] = await Promise.all([
                categorizeReceipt({ receiptDataUri }),
                detectFraud({ receiptDataUri })
            ]);

            setAnalysisResult({ category: categoryResult, fraud: fraudResult });
            
            toast({
                title: "Analysis Complete",
                description: "The receipt has been successfully analyzed.",
            });
        };
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
    setAnalysisResult(null);
    setIsLoading(false);
    setIsOpen(false);
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
            Upload a photo of your receipt for categorization and fraud analysis.
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
                    <Input id="receipt-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isLoading} />
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
              <Alert variant={analysisResult.fraud.isFraudulent ? "destructive" : "default"}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Fraud Detection</AlertTitle>
                <AlertDescription>
                  {analysisResult.fraud.isFraudulent ? "Potential fraud detected." : "Looks legitimate."}
                  <p className="text-xs">{analysisResult.fraud.fraudExplanation}</p>
                  <p className="text-xs mt-1">Confidence: {(analysisResult.fraud.confidenceScore * 100).toFixed(0)}%</p>
                </AlertDescription>
              </Alert>

               <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Dynamic Categorization</AlertTitle>
                <AlertDescription>
                  <p>Vendor: <span className="font-semibold">{analysisResult.category.vendor}</span></p>
                  <p>Category: <span className="font-semibold">{analysisResult.category.category}</span></p>
                  <p>Total: <span className="font-semibold">₹{analysisResult.category.totalAmount.toFixed(2)}</span></p>
                </AlertDescription>
              </Alert>
            </div>
          )}

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={resetDialog} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleAnalyze} disabled={!file || isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
            Upload & Analyze
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
