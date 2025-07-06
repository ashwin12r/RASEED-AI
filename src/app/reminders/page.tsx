'use client'
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BellRing, Info } from "lucide-react"

const reminderItems = [
  { id: "REM001", productName: "Formal Shirt", purchaseDate: "2024-06-23", returnByDate: "2024-07-07", daysLeft: 12 },
  { id: "REM002", productName: "Running Shoes", purchaseDate: "2024-06-15", returnByDate: "2024-06-29", daysLeft: 4 },
  { id: "REM003", productName: "Decorative Vase", purchaseDate: "2024-06-20", returnByDate: "2024-07-04", daysLeft: 9 },
  { id: "REM004", productName: "External Hard Drive", purchaseDate: "2024-06-25", returnByDate: "2024-07-09", daysLeft: 14 },
]

export default function RemindersPage() {
  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4">
        <BellRing className="h-8 w-8 text-primary" />
        <div>
            <h1 className="text-2xl font-bold md:text-3xl">Return & Refund Reminders</h1>
            <p className="text-muted-foreground">Never miss a return window again.</p>
        </div>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>How it works</AlertTitle>
        <AlertDescription>
          We automatically scan your receipts for return policies and create reminders for you. You'll get a notification before a return window closes.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Return Deadlines</CardTitle>
          <CardDescription>Items you can still return based on your receipts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Return By</TableHead>
                <TableHead className="text-right">Days Left</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reminderItems.map((item) => (
                <TableRow key={item.id} className={item.daysLeft <= 5 ? "bg-destructive/10" : ""}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell>{item.purchaseDate}</TableCell>
                  <TableCell>{item.returnByDate}</TableCell>
                  <TableCell className="text-right font-bold">{item.daysLeft}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
