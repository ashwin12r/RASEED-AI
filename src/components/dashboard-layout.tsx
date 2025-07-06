'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Wallet, LayoutDashboard, ReceiptText, LineChart, Settings } from "lucide-react"
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarFooter, 
  SidebarTrigger, 
  SidebarInset 
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/receipts", label: "Receipts", icon: ReceiptText },
  { href: "/analysis", label: "Analysis", icon: LineChart },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg group-data-[collapsible=icon]:justify-center">
            <div className="p-1.5 bg-primary rounded-lg">
                <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-foreground group-data-[collapsible=icon]:hidden">Finance Tracker</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton isActive={pathname === item.href} tooltip={{children: item.label, side:"right"}}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-2 flex-col gap-2">
           <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/settings">
                <SidebarMenuButton isActive={pathname === "/settings"} tooltip={{children: "Settings", side: "right"}}>
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip={{children: "User Profile", side: "right"}}>
                    <Avatar className="size-7">
                        <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="person portrait" />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm">User Name</span>
                        <span className="text-xs text-muted-foreground">user@example.com</span>
                    </div>
                </SidebarMenuButton>
            </SidebarMenuItem>
           </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 md:hidden flex items-center justify-between p-2 border-b bg-background/80 backdrop-blur-sm">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                <div className="p-1.5 bg-primary rounded-lg">
                    <Wallet className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-foreground">Finance Tracker</span>
            </Link>
          <SidebarTrigger />
        </header>
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
