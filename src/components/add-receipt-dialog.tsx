'use client'
import React, { useState, useRef, useEffect } from "react"
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
import { Loader2, Upload, Sparkles, Check, FileText, Video, Camera } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { categorizeReceipt, ReceiptDetails } from "@/ai/flows/dynamic-categorization"
import { Alert, AlertDescription, AlertTitle, AlertIcon } from "@/components/ui/alert"
import { useReceipts } from "@/hooks/use-receipts"
import { trackWarranty } from "@/ai/flows/warranty-tracker"
import { setReturnReminder } from "@/ai/flows/return-reminder"
import { useWarranties } from "@/hooks/use-warranties"
import { useReminders } from "@/hooks/use-reminders"
import { Timestamp } from "firebase/firestore"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AddReceiptDialog({ trigger }: { trigger: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = useState("upload");

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"image" | "video" | "pdf" | null>(null);
  
  // Camera state
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(true);

  // General state
  const [mediaDataUri, setMediaDataUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ReceiptDetails[] | null>(null);
  
  const { toast } = useToast();
  const { addReceipt } = useReceipts();
  const { addWarranty } = useWarranties();
  const { addReminder } = useReminders();

  const resetDialog = () => {
    setFile(null);
    setFilePreview(null);
    setFileType(null);
    setMediaDataUri(null);
    setAnalysisResult(null);
    setIsLoading(false);
    setIsSaving(false);
    setIsOpen(false);
    setActiveTab("upload");
  }

  // Camera Permission Effect
  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };
    
    if (isOpen && activeTab === 'camera') {
      getCameraPermission();
    }

    return () => {
      // Stop camera stream when dialog closes or tab changes
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [isOpen, activeTab]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;
    setFile(selectedFile);
    setAnalysisResult(null);
    if (selectedFile) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUri = reader.result as string;
            setMediaDataUri(dataUri);

            if (selectedFile.type.startsWith('image/')) {
                setFileType('image');
                setFilePreview(dataUri);
            } else if (selectedFile.type.startsWith('video/')) {
                setFileType('video');
                // For video, we don't set filePreview to the data URI to avoid performance issues.
                // We'll create an object URL for the preview instead.
                setFilePreview(URL.createObjectURL(selectedFile));
            } else if (selectedFile.type === 'application/pdf') {
                setFileType('pdf');
                setFilePreview(null);
            }
        };
        reader.readAsDataURL(selectedFile);
    } else {
        setFilePreview(null);
        setFileType(null);
        setMediaDataUri(null);
    }
  }

  const handleAnalyze = async (dataUriToAnalyze: string) => {
    if (!dataUriToAnalyze) {
      toast({
        title: "No media selected",
        description: "Please select a file or capture from camera.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setAnalysisResult(null);

    try {
        const result = await categorizeReceipt({ mediaDataUri: dataUriToAnalyze });
        if (result.receipts && result.receipts.length > 0) {
            setAnalysisResult(result.receipts);
            toast({
                title: "Analysis Complete",
                description: `Found ${result.receipts.length} receipt(s).`,
            });
        } else {
            toast({
                title: "Analysis Complete",
                description: "No receipts could be found in the provided media.",
            });
        }
    } catch (error) {
        console.error("Analysis failed:", error);
        toast({
            title: "Analysis Failed",
            description: "There was an error analyzing your media. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsLoading(false);
    }
  }
  
  const handleCaptureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUri = canvas.toDataURL('image/jpeg');
    setMediaDataUri(dataUri);
    handleAnalyze(dataUri);
  };

  const handleSave = async () => {
    if (!analysisResult || analysisResult.length === 0 || !mediaDataUri) {
        toast({
            title: "No analysis data",
            description: "Please analyze a receipt first.",
            variant: "destructive"
        });
        return;
    }
    
    setIsSaving(true);

    try {
        const savePromises = analysisResult.map(receipt => addReceipt({ ...receipt, receiptDataUri: mediaDataUri }));
        await Promise.all(savePromises);
        
        toast({
            title: "Receipts Saved",
            description: `Successfully saved ${analysisResult.length} receipt(s). Scanning for warranties and reminders...`,
        });
        
        resetDialog(); // Close dialog immediately for better UX

        // Run background scans for warranties and reminders
        const [warrantyResult, reminderResult] = await Promise.all([
            trackWarranty({ receiptDataUri: mediaDataUri }),
            setReturnReminder({ receiptDataUri: mediaDataUri })
        ]);

        let warrantiesFound = 0;
        if (warrantyResult?.items?.length > 0) {
            warrantiesFound = warrantyResult.items.length;
            const warrantyPromises = warrantyResult.items.map(item => addWarranty({
                productName: item.productName,
                purchaseDate: Timestamp.fromDate(new Date(item.purchaseDate)),
                warrantyEndDate: Timestamp.fromDate(new Date(item.warrantyEndDate)),
            }));
            await Promise.all(warrantyPromises);
        }

        let remindersFound = 0;
        if (reminderResult?.reminders?.length > 0) {
            remindersFound = reminderResult.reminders.length;
            const reminderPromises = reminderResult.reminders.map(item => addReminder({
                productName: item.productName,
                purchaseDate: Timestamp.fromDate(new Date(item.purchaseDate)),
                returnByDate: Timestamp.fromDate(new Date(item.returnByDate)),
            }));
            await Promise.all(reminderPromises);
        }

        if (warrantiesFound > 0 || remindersFound > 0) {
            toast({
                title: "Scan Complete",
                description: `Found ${warrantiesFound} warranty/ies and ${remindersFound} reminder(s).`,
            });
        }
    } catch(err) {
        console.error("Save or background scan failed:", err);
        toast({
            title: "Save Failed",
            description: "There was an error saving your receipts or scanning for extras.",
            variant: "destructive"
        });
    } finally {
        setIsSaving(false);
    }
  }

  const renderFilePreview = () => {
    if (!file) {
      return (
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-muted-foreground">Image, Video, or PDF</p>
        </div>
      )
    }
    switch (fileType) {
        case 'image':
            return <img src={filePreview!} alt="Receipt preview" className="max-h-64 w-auto object-contain rounded-lg p-2" />;
        case 'video':
            return <video src={filePreview!} controls className="max-h-64 w-auto object-contain rounded-lg p-2" />;
        case 'pdf':
            return (
                <div className="flex flex-col items-center justify-center p-4">
                    <FileText className="w-16 h-16 mb-4 text-muted-foreground" />
                    <p className="font-semibold">{file.name}</p>
                </div>
            )
        default:
            return null;
    }
  };

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
            Upload a file or use your camera to analyze receipts.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" /> Upload File
            </TabsTrigger>
            <TabsTrigger value="camera">
              <Camera className="mr-2 h-4 w-4" /> Live Camera
            </TabsTrigger>
          </TabsList>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <TabsContent value="upload">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="receipt-file">Receipt Media</Label>
                <div className="flex items-center justify-center w-full">
                    <label htmlFor="receipt-file" className="flex flex-col items-center justify-center w-full min-h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted transition-colors hover:bg-muted/80 hover:border-primary">
                        {renderFilePreview()}
                        <Input id="receipt-file" type="file" className="hidden" accept="image/*,video/*,application/pdf" onChange={handleFileChange} disabled={isLoading || isSaving} />
                    </label>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="camera">
              <div className="space-y-4">
                <div className="w-full aspect-video bg-black rounded-lg overflow-hidden flex items-center justify-center">
                  <video ref={videoRef} className="w-full aspect-video rounded-md" autoPlay muted playsInline />
                </div>
                {!hasCameraPermission && (
                  <Alert variant="destructive">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                      Please allow camera access to use this feature.
                    </AlertDescription>
                  </Alert>
                )}
                <Button onClick={handleCaptureAndAnalyze} className="w-full" disabled={isLoading || isSaving || !hasCameraPermission}>
                    <Camera className="mr-2 h-4 w-4" />
                    Capture & Analyze
                </Button>
              </div>
            </TabsContent>
            
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>Analyzing... This may take a moment.</span>
              </div>
            )}

            {analysisResult && (
              <div className="space-y-2">
                {analysisResult.map((receipt, index) => (
                  <Alert key={index}>
                    <Sparkles className="h-4 w-4" />
                    <AlertTitle>Receipt {index + 1}: {receipt.vendor}</AlertTitle>
                    <AlertDescription>
                      <p>Category: <span className="font-semibold capitalize">{receipt.category}</span></p>
                      <p>Total: <span className="font-semibold">₹{receipt.totalAmount.toFixed(2)}</span></p>
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </div>
        </Tabs>
        <DialogFooter>
          {analysisResult ? (
            <>
              <Button variant="outline" onClick={() => setAnalysisResult(null)} disabled={isSaving}>Analyze Again</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                 {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Save {analysisResult.length} Receipt(s)
              </Button>
            </>
          ) : activeTab === 'upload' ? (
              <Button onClick={() => handleAnalyze(mediaDataUri!)} disabled={!file || isLoading || isSaving}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Analyze File
              </Button>
          ) : (
            // The Capture & Analyze button is already inside the tab content for camera
            <Button variant="outline" onClick={resetDialog} disabled={isLoading || isSaving}>Cancel</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
