'use client'
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck } from "lucide-react"

const warrantyItems = [
  { id: "W001", productName: "Smart TV 55-inch", purchaseDate: "2024-06-21", warrantyEndDate: "2025-06-21", status: "Active" },
  { id: "W002", productName: "Wireless Headphones", purchaseDate: "2023-11-15", warrantyEndDate: "2024-11-15", status: "Active" },
  { id: "W003", productName: "Laptop Pro", purchaseDate: "2023-01-10", warrantyEndDate: "2025-01-10", status: "Active" },
  { id: "W004", productName: "Microwave Oven", purchaseDate: "2022-08-01", warrantyEndDate: "2024-08-01", status: "Expiring Soon" },
  { id: "W005", productName: "Gaming Mouse", purchaseDate: "2023-05-20", warrantyEndDate: "2024-05-20", status: "Expired" },
]

export default function WarrantyPage() {
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default"
      case "Expiring Soon":
        return "secondary"
      case "Expired":
        return "destructive"
      default:
        return "outline"
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <ShieldCheck className="h-8 w-8 text-primary" />
        <div>
            <h1 className="text-2xl font-bold md:text-3xl">Warranty Tracker</h1>
            <p className="text-muted-foreground">Automatically track warranties from your receipts.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Tracked Warranties</CardTitle>
          <CardDescription>Here are the warranties we've found on your receipts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Purchase Date</TableHead>
                <TableHead>Warranty Ends</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warrantyItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.productName}</TableCell>
                  <TableCell>{item.purchaseDate}</TableCell>
                  <TableCell>{item.warrantyEndDate}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={getStatusVariant(item.status) as any}>{item.status}</Badge>
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
