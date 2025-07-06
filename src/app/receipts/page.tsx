
'use client'
import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Wallet, Trash2, PlusCircle, Volume2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { AddReceiptDialog } from "@/components/add-receipt-dialog"
import { textToSpeech } from "@/ai/flows/text-to-speech"
import { useToast } from "@/hooks/use-toast"
import { useReceipts, Receipt } from "@/hooks/use-receipts"

export default function ReceiptsPage() {
  const { receipts, deleteReceipt } = useReceipts()
  const [isReading, setIsReading] = React.useState<string | null>(null)
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

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
      const textToRead = `Receipt from ${receipt.vendor} on ${new Date(receipt.date).toLocaleDateString()}. Total amount is ${receipt.total.toFixed(2)} rupees. The category is ${receipt.category}. It contains ${receipt.items} items.`;
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
              {receipts.length > 0 ? receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">{receipt.vendor}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{receipt.category}</Badge>
                  </TableCell>
                  <TableCell>{new Date(receipt.date).toLocaleDateString()}</TableCell>
                  <TableCell>{receipt.items}</TableCell>
                  <TableCell className="text-right font-medium">₹{receipt.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                         <DropdownMenuItem onClick={() => handleReadAloud(receipt)} disabled={isReading !== null && isReading !== receipt.id}>
                            <Volume2 className="mr-2 h-4 w-4" />
                            {isReading === receipt.id ? 'Stop' : 'Read Aloud'}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
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
