
'use client'
import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Wallet, Trash2, PlusCircle, Volume2, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { AddReceiptDialog } from "@/components/add-receipt-dialog"
import { textToSpeech } from "@/ai/flows/text-to-speech"
import { generateWalletPass } from "@/ai/flows/generate-wallet-pass"
import { useToast } from "@/hooks/use-toast"
import { useReceipts, Receipt } from "@/hooks/use-receipts"
import { extractItemsFromReceipt } from "@/ai/flows/extract-items-from-receipt"

export default function ReceiptsPage() {
  const { receipts, deleteReceipt, updateReceipt, isLoading } = useReceipts()
  const [isReading, setIsReading] = React.useState<string | null>(null)
  const [isWalletLoading, setIsWalletLoading] = React.useState<string | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const sortedReceipts = React.useMemo(() => {
    return [...receipts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [receipts]);

  const handleReadAloud = async (receipt: Receipt) => {
    if (isReading === receipt.id) {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsReading(null);
        return;
    };
    setIsReading(receipt.id);
    try {
      const textToRead = `Receipt from ${receipt.vendor} on ${new Date(receipt.date).toLocaleDateString()}. Total amount is ${receipt.total.toFixed(2)} rupees. The category is ${receipt.category}. It contains ${Array.isArray(receipt.items) ? receipt.items.length : 0} items.`;
      const response = await textToSpeech(textToRead);
      if (response.media && audioRef.current) {
        audioRef.current.src = response.media;
        audioRef.current.play();
        audioRef.current.onended = () => setIsReading(null);
      } else {
        throw new Error("No audio media returned from the service.");
      }
    } catch (error) {
      console.error("Failed to read receipt aloud:", error);
      toast({
        title: "Error",
        description: "Could not play audio for the receipt.",
        variant: "destructive"
      })
      setIsReading(null);
    }
  }

  const handleDelete = (id: string) => {
    deleteReceipt(id);
    toast({
        title: "Receipt Deleted",
        description: "The receipt has been removed.",
    });
  }

  const handleAddToWallet = async (receipt: Receipt) => {
    setIsWalletLoading(receipt.id);
    let receiptToAdd = { ...receipt }; // Work with a mutable copy

    try {
      // Check if items are malformed
      if (!Array.isArray(receiptToAdd.items)) {
        toast({
          title: "Fixing Receipt Data",
          description: "Item list is incomplete. Automatically fetching details...",
        });
        
        // Call the new flow to get the correct item list
        const result = await extractItemsFromReceipt({ receiptDataUri: receiptToAdd.receiptDataUri });
        
        if (result.items && result.items.length > 0) {
          // Update the receipt object and save the correction to the database
          receiptToAdd.items = result.items;
          await updateReceipt(receiptToAdd.id, { items: result.items });
          toast({
            title: "Data Fixed",
            description: "Successfully updated the item list.",
          });
        } else {
          // If the fix fails, fallback to an empty list to prevent a crash
          receiptToAdd.items = [];
          toast({
            title: "Could Not Fix Data",
            description: "Unable to extract items. Proceeding with an empty list.",
            variant: "destructive"
          });
        }
      }

      // Proceed with generating the wallet pass using the (potentially corrected) receipt
      const { jwt } = await generateWalletPass(receiptToAdd);
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
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Receipts</h1>
        <AddReceiptDialog 
          trigger={
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Receipt
            </Button>
          }
        />
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex justify-center items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span>Loading receipts...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : sortedReceipts.length > 0 ? sortedReceipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">{receipt.vendor}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{receipt.category}</Badge>
                  </TableCell>
                  <TableCell>{new Date(receipt.date).toLocaleDateString()}</TableCell>
                  <TableCell>{Array.isArray(receipt.items) ? receipt.items.length : 0}</TableCell>
                  <TableCell className="text-right font-medium">₹{receipt.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                           {isWalletLoading === receipt.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleReadAloud(receipt)} disabled={isReading !== null && isReading !== receipt.id}>
                            <Volume2 className="mr-2 h-4 w-4" />
                            {isReading === receipt.id ? 'Stop' : 'Read Aloud'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddToWallet(receipt)} disabled={isWalletLoading !== null}>
                          <Wallet className="mr-2 h-4 w-4" />
                          Add to Wallet
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive" onClick={() => handleDelete(receipt.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                           Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24">No receipts found. Add one to get started!</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <audio ref={audioRef} className="hidden" onEnded={() => setIsReading(null)} />
    </div>
  )
}
