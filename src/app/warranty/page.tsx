
'use client'
import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Loader2 } from "lucide-react"
import { useReceipts } from "@/hooks/use-receipts"
import { trackWarranty } from "@/ai/flows/warranty-tracker"
import { useToast } from "@/hooks/use-toast"
import { differenceInCalendarDays, isAfter } from "date-fns"

interface WarrantyItem {
  id: string;
  productName: string;
  purchaseDate: string;
  warrantyEndDate: string;
  status: "Active" | "Expiring Soon" | "Expired";
}


export default function WarrantyPage() {
    const [warranties, setWarranties] = useState<WarrantyItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { receipts } = useReceipts();
    const { toast } = useToast();

    useEffect(() => {
        const fetchWarranties = async () => {
            if (receipts.length === 0) {
                setIsLoading(false);
                setWarranties([]);
                return;
            }

            setIsLoading(true);
            try {
                const allWarrantiesPromises = receipts.map(receipt =>
                    trackWarranty({ receiptDataUri: receipt.receiptDataUri })
                );

                const results = await Promise.allSettled(allWarrantiesPromises);
                
                const newWarranties: WarrantyItem[] = [];
                results.forEach((result, index) => {
                    if (result.status === 'fulfilled' && result.value.items) {
                        result.value.items.forEach(item => {
                            try {
                                const today = new Date();
                                const endDate = new Date(item.warrantyEndDate);
                                let status: WarrantyItem["status"] = "Active";

                                if (isAfter(today, endDate)) {
                                    status = "Expired";
                                } else if (differenceInCalendarDays(endDate, today) <= 30) {
                                    status = "Expiring Soon";
                                }

                                newWarranties.push({
                                    id: `${receipts[index].id}-${item.productName}`,
                                    productName: item.productName,
                                    purchaseDate: new Date(item.purchaseDate).toLocaleDateString(),
                                    warrantyEndDate: endDate.toLocaleDateString(),
                                    status,
                                });
                            } catch(e) {
                                console.error('Could not parse date from warranty', e);
                            }
                        });
                    } else if (result.status === 'rejected') {
                         console.error("Failed to fetch warranty for a receipt:", result.reason);
                    }
                });

                setWarranties(newWarranties);

            } catch (error) {
                 console.error("Error fetching warranties:", error);
                 toast({
                    title: "Error",
                    description: "Could not fetch warranty information.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (receipts.length > 0 || localStorage.getItem('receipts') === null) {
          fetchWarranties();
        }
    }, [receipts, toast]);


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
              {isLoading ? (
                  <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            <span>Scanning receipts for warranties...</span>
                          </div>
                      </TableCell>
                  </TableRow>
              ) : warranties.length > 0 ? (
                warranties.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.productName}</TableCell>
                    <TableCell>{item.purchaseDate}</TableCell>
                    <TableCell>{item.warrantyEndDate}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getStatusVariant(item.status) as any}>{item.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                 <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">No warranties found. Add receipts to get started.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
