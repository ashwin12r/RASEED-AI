
'use client'
import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck, Loader2, MoreHorizontal, Trash2, PlusCircle, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { useWarranties } from "@/hooks/use-warranties"
import { useToast } from "@/hooks/use-toast"
import { differenceInCalendarDays, isAfter } from "date-fns"
import { AddWarrantyDialog } from "@/components/add-warranty-dialog"
import { generateWarrantyPass } from "@/ai/flows/generate-warranty-pass"

interface ProcessedWarrantyItem {
  id: string;
  productName: string;
  purchaseDate: string;
  warrantyEndDate: string;
  status: "Active" | "Expiring Soon" | "Expired";
}

export default function WarrantyPage() {
    const { warranties, isLoading, deleteWarranty } = useWarranties();
    const { toast } = useToast();
    const [isWalletLoading, setIsWalletLoading] = React.useState<string | null>(null);

    const processedWarranties = React.useMemo((): ProcessedWarrantyItem[] => {
        return warranties.map(item => {
            const today = new Date();
            const endDate = item.warrantyEndDate.toDate();
            let status: ProcessedWarrantyItem["status"] = "Active";

            if (isAfter(today, endDate)) {
                status = "Expired";
            } else if (differenceInCalendarDays(endDate, today) <= 30) {
                status = "Expiring Soon";
            }

            return {
                id: item.id,
                productName: item.productName,
                purchaseDate: item.purchaseDate.toDate().toLocaleDateString(),
                warrantyEndDate: endDate.toLocaleDateString(),
                status,
            };
        });
    }, [warranties]);
    
    const handleDelete = async (id: string) => {
      try {
        await deleteWarranty(id);
        toast({
          title: "Warranty Deleted",
          description: "The warranty has been successfully removed.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not delete the warranty.",
          variant: "destructive",
        });
      }
    };
    
    const handleAddToWallet = async (warrantyId: string) => {
        setIsWalletLoading(warrantyId);
        const originalWarranty = warranties.find(w => w.id === warrantyId);

        if (!originalWarranty) {
            toast({ title: "Error", description: "Could not find warranty details.", variant: "destructive" });
            setIsWalletLoading(null);
            return;
        }

        try {
            const { jwt } = await generateWarrantyPass({
                productName: originalWarranty.productName,
                purchaseDate: originalWarranty.purchaseDate.toDate().toISOString(),
                warrantyEndDate: originalWarranty.warrantyEndDate.toDate().toISOString(),
            });
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
    };


    const getStatusVariant = (status: string) => {
      switch (status) {
        case "Active": return "default";
        case "Expiring Soon": return "secondary";
        case "Expired": return "destructive";
        default: return "outline";
      }
    };

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <ShieldCheck className="h-8 w-8 text-primary" />
                <div>
                    <h1 className="text-2xl font-bold md:text-3xl">Warranty Tracker</h1>
                    <p className="text-muted-foreground">Manually track warranties for your products.</p>
                </div>
            </div>
            <AddWarrantyDialog trigger={
              <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Warranty</Button>
            } />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Tracked Warranties</CardTitle>
            <CardDescription>Here are the warranties you are tracking.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead>Warranty Ends</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right"><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                              <span>Loading warranties...</span>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : processedWarranties.length > 0 ? (
                  processedWarranties.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.purchaseDate}</TableCell>
                      <TableCell>{item.warrantyEndDate}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(item.status) as any}>{item.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                               {isWalletLoading === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAddToWallet(item.id)} disabled={isWalletLoading !== null}>
                                <Wallet className="mr-2 h-4 w-4" />
                                Add to Wallet
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive-foreground focus:bg-destructive" onClick={() => handleDelete(item.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                               Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                   <TableRow>
                      <TableCell colSpan={5} className="text-center h-24">No warranties found. Add one to get started.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    )
}
