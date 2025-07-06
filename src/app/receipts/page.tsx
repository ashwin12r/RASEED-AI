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

const receipts = [
  { id: "R001", vendor: "Grocery Mart", date: "2024-06-23", total: 6259.86, category: "Groceries", items: 12 },
  { id: "R002", vendor: "The Coffee House", date: "2024-06-22", total: 1062.4, category: "Dining", items: 3 },
  { id: "R003", vendor: "Tech Store", date: "2024-06-21", total: 41499.17, category: "Electronics", items: 1 },
  { id: "R004", vendor: "Gas Station", date: "2024-06-20", total: 4573.3, category: "Transport", items: 1 },
  { id: "R005", vendor: "Book Nook", date: "2024-06-19", total: 2033.5, category: "Entertainment", items: 2 },
  { id: "R006", vendor: "Home Improvement", date: "2024-06-18", total: 12716.43, category: "Home", items: 5 },
  { id: "R007", vendor: "Pharmacy", date: "2024-06-17", total: 2817.85, category: "Health", items: 4 },
]

export default function ReceiptsPage() {
  const [isReading, setIsReading] = React.useState<string | null>(null)
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const handleReadAloud = async (receipt: (typeof receipts)[0]) => {
    if (isReading) return;
    setIsReading(receipt.id);
    try {
      const textToRead = `Receipt from ${receipt.vendor} on ${receipt.date}. Total amount is ${receipt.total.toFixed(2)} rupees. The category is ${receipt.category}. It contains ${receipt.items} items.`;
      const response = await textToSpeech(textToRead);
      if (response.media && audioRef.current) {
        audioRef.current.src = response.media;
        audioRef.current.play();
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
    } finally {
      setIsReading(null);
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
              {receipts.map((receipt) => (
                <TableRow key={receipt.id}>
                  <TableCell className="font-medium">{receipt.vendor}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{receipt.category}</Badge>
                  </TableCell>
                  <TableCell>{receipt.date}</TableCell>
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
                         <DropdownMenuItem onClick={() => handleReadAloud(receipt)} disabled={isReading === receipt.id}>
                          {isReading === receipt.id ? (
                            'Reading...'
                          ) : (
                            <>
                              <Volume2 className="mr-2 h-4 w-4" />
                              Read Aloud
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Wallet className="mr-2 h-4 w-4" />
                          Add to Wallet
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive hover:!text-destructive-foreground">
                          <Trash2 className="mr-2 h-4 w-4" />
                           Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <audio ref={audioRef} className="hidden" />
    </div>
  )
}
