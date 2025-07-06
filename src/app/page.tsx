
'use client'
import React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle } from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { AddReceiptDialog } from "@/components/add-receipt-dialog"
import { Progress } from "@/components/ui/progress"
import { useReceipts } from "@/hooks/use-receipts"

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--primary))",
  },
}

export default function DashboardPage() {
  const { receipts } = useReceipts();

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlySpending = receipts
    .filter(r => {
        const receiptDate = new Date(r.date);
        return receiptDate.getMonth() === currentMonth && receiptDate.getFullYear() === currentYear;
    })
    .reduce((sum, r) => sum + r.total, 0);

  const categorySpending = receipts
    .filter(r => {
        const receiptDate = new Date(r.date);
        return receiptDate.getMonth() === currentMonth && receiptDate.getFullYear() === currentYear;
    })
    .reduce((acc, r) => {
        if (!acc[r.category]) {
            acc[r.category] = 0;
        }
        acc[r.category] += r.total;
        return acc;
    }, {} as Record<string, number>);

  const topCategoryEntry = Object.entries(categorySpending).sort(([, a], [, b]) => b - a)[0];
  const topCategoryName = topCategoryEntry ? topCategoryEntry[0] : 'None';
  const topCategoryAmount = topCategoryEntry ? topCategoryEntry[1] : 0;

  const recentTransactions = receipts.slice(0, 5).map(r => ({
    vendor: r.vendor,
    date: r.date,
    amount: r.total,
    category: r.category,
  }));
  
  const chartData = React.useMemo(() => {
    const data: { month: string; total: number }[] = [];
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return {
        name: d.toLocaleString('default', { month: 'long' }),
        year: d.getFullYear(),
        month: d.getMonth(),
      };
    }).reverse();

    months.forEach(m => {
        const total = receipts
            .filter(r => {
                const receiptDate = new Date(r.date);
                return receiptDate.getMonth() === m.month && receiptDate.getFullYear() === m.year;
            })
            .reduce((sum, r) => sum + r.total, 0);
        
        data.push({ month: m.name, total: Math.round(total) });
    });
    
    return data;
  }, [receipts]);


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold md:text-3xl">Dashboard</h1>
        <AddReceiptDialog 
          trigger={
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Receipt
            </Button>
          }
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Spending (This Month)</CardTitle>
            <CardDescription>Your total expenditure for the current month.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">₹{monthlySpending.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Category (This Month)</CardTitle>
            <CardDescription>Your highest spending category.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
               <Badge variant="outline" className="text-sm py-1 px-3 capitalize">{topCategoryName}</Badge>
               <p className="text-3xl font-bold">₹{topCategoryAmount.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Savings Goal</CardTitle>
            <CardDescription>Your progress towards this month's goal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
                <p className="text-2xl font-bold">₹0 / ₹41,500</p>
                <p className="text-lg font-medium">0%</p>
            </div>
            <Progress value={0} aria-label="Savings goal progress" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Spending Overview</CardTitle>
            <CardDescription>Your spending over the last 6 months.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] pl-2">
            <ChartContainer config={chartConfig} className="w-full h-full">
              <BarChart data={chartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(value) => `₹${value}`}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="total" fill="var(--color-total)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
           <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest 5 transactions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.length > 0 ? recentTransactions.map((tx) => (
                  <TableRow key={tx.vendor + tx.date}>
                    <TableCell>
                      <div className="font-medium">{tx.vendor}</div>
                      <div className="text-sm text-muted-foreground capitalize">{tx.category}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">₹{tx.amount.toFixed(2)}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">No transactions yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
