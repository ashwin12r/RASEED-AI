
'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Wallet, LayoutDashboard, ReceiptText, LineChart, Settings, ShieldCheck, BellRing, LogOut, Loader2 } from "lucide-react"
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
import { useAuth } from "@/hooks/use-auth"
import React from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/receipts", label: "Receipts", icon: ReceiptText },
  { href: "/analysis", label: "Analysis", icon: LineChart },
  { href: "/warranty", label: "Warranty", icon: ShieldCheck },
  { href: "/reminders", label: "Reminders", icon: BellRing },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, signOut } = useAuth()

  React.useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login')
    }
  }, [user, loading, pathname, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin" />
      </div>
    );
  }

  if (!user && pathname !== '/login') {
      // Still loading or redirecting
      return null;
  }
  
  if (!user && pathname === '/login') {
    return <>{children}</>
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg group-data-[collapsible=icon]:justify-center">
            <div className="p-1.5 bg-primary rounded-lg">
                <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-foreground group-data-[collapsible=icon]:hidden">Project Raseed</span>
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
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                         <SidebarMenuButton tooltip={{children: "User Profile", side: "right"}}>
                            <Avatar className="size-7">
                                <AvatarImage src={user?.photoURL || "https://placehold.co/40x40.png"} alt={user?.displayName || "User"} data-ai-hint="person portrait" />
                                <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-left">
                                <span className="font-semibold text-sm">{user?.displayName}</span>
                                <span className="text-xs text-muted-foreground">{user?.email}</span>
                            </div>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start">
                        <DropdownMenuItem onClick={signOut}>
                            <LogOut className="mr-2"/>
                            Sign Out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
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
                <span className="text-foreground">Project Raseed</span>
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
