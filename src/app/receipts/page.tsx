'use client'
import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Wallet, Trash2, PlusCircle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { AddReceiptDialog } from "@/components/add-receipt-dialog"

export default function ReceiptsPage() {
  const receipts = [
    { id: "R001", vendor: "Grocery Mart", date: "2024-06-23", total: 75.42, category: "Groceries", items: 12 },
    { id: "R002", vendor: "The Coffee House", date: "2024-06-22", total: 12.80, category: "Dining", items: 3 },
    { id: "R003", vendor: "Tech Store", date: "2024-06-21", total: 499.99, category: "Electronics", items: 1 },
    { id: "R004", vendor: "Gas Station", date: "2024-06-20", total: 55.10, category: "Transport", items: 1 },
    { id: "R005", vendor: "Book Nook", date: "2024-06-19", total: 24.50, category: "Entertainment", items: 2 },
    { id: "R006", vendor: "Home Improvement", date: "2024-06-18", total: 153.21, category: "Home", items: 5 },
    { id: "R007", vendor: "Pharmacy", date: "2024-06-17", total: 33.95, category: "Health", items: 4 },
  ]

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
                  <TableCell className="text-right font-medium">${receipt.total.toFixed(2)}</TableCell>
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
    </div>
  )
}
