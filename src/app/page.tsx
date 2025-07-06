'use client'
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

const chartData = [
  { month: "January", total: 203350 },
  { month: "February", total: 177122 },
  { month: "March", total: 239870 },
  { month: "April", total: 211069 },
  { month: "May", total: 258960 },
  { month: "June", total: 194635 },
];

const chartConfig = {
  total: {
    label: "Total",
    color: "hsl(var(--primary))",
  },
}

const recentTransactions = [
  { vendor: "Grocery Mart", date: "2024-06-23", amount: 6259.86, category: "Groceries" },
  { vendor: "The Coffee House", date: "2024-06-22", amount: 1062.4, category: "Dining" },
  { vendor: "Tech Store", date: "2024-06-21", amount: 41499.17, category: "Electronics" },
  { vendor: "Gas Station", date: "2024-06-20", amount: 4573.3, category: "Transport" },
  { vendor: "Book Nook", date: "2024-06-19", amount: 2033.5, category: "Entertainment" },
]

export default function DashboardPage() {
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
            <CardTitle>Total Spending (Month)</CardTitle>
            <CardDescription>Your total expenditure for June.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">₹194,690.61</p>
            <p className="text-xs text-muted-foreground mt-1">+5.2% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Top Category</CardTitle>
            <CardDescription>Your highest spending category in June.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
               <Badge variant="outline" className="text-sm py-1 px-3">Groceries</Badge>
               <p className="text-3xl font-bold">₹73,879.96</p>
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
                <p className="text-2xl font-bold">₹37,350 / ₹41,500</p>
                <p className="text-lg font-medium">90%</p>
            </div>
            <Progress value={90} aria-label="Savings goal progress" />
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
                {recentTransactions.map((tx) => (
                  <TableRow key={tx.vendor}>
                    <TableCell>
                      <div className="font-medium">{tx.vendor}</div>
                      <div className="text-sm text-muted-foreground">{tx.category}</div>
                    </TableCell>
                    <TableCell className="text-right font-medium">₹{tx.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
