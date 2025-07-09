
'use client'

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, ReceiptText, LineChart, Settings, ShieldCheck, BellRing, LogOut, Loader2 } from "lucide-react"
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarFooter, 
  SidebarInset,
  useSidebar
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import React from "react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { isFirebaseConfigured } from "@/lib/firebase"
import { FirebaseConfigError } from "./firebase-config-error"
import { WalletLogoIcon } from "./wallet-logo-icon"

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/receipts", label: "Receipts", icon: ReceiptText },
  { href: "/analysis", label: "Analysis", icon: LineChart },
  { href: "/warranty", label: "Warranty", icon: ShieldCheck },
  { href: "/reminders", label: "Reminders", icon: BellRing },
]

function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { toggleSidebar, state: sidebarState } = useSidebar();

  const handleHeaderClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // On desktop, if the sidebar is collapsed, clicking the logo should expand it
    // instead of navigating. If it's already open, it will navigate to home as a normal link.
    if (sidebarState === 'collapsed') {
      e.preventDefault();
      toggleSidebar();
    }
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-4">
          <Link href="/" onClick={handleHeaderClick} className="flex items-center gap-2.5 font-bold text-lg group-data-[collapsible=icon]:justify-center">
            <div className="p-1.5 bg-primary rounded-lg">
                <WalletLogoIcon className="h-8 w-auto" />
            </div>
            <span className="text-foreground group-data-[collapsible=icon]:hidden">Raseed AI</span>
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
        <header className="sticky top-0 z-10 md:hidden flex items-center p-2 border-b bg-background/80 backdrop-blur-sm">
            <button onClick={toggleSidebar} className="flex items-center gap-2 font-bold text-lg p-2 -ml-2 rounded-md hover:bg-accent focus:outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring">
                <div className="p-1.5 bg-primary rounded-lg">
                    <WalletLogoIcon className="h-8 w-auto" />
                </div>
                <span className="text-foreground">Raseed AI</span>
            </button>
        </header>
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading } = useAuth()
  
  if (!isFirebaseConfigured) {
    return <FirebaseConfigError />
  }

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

  if (!user && pathname === '/login') {
    return <>{children}</>
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <AppLayout>{children}</AppLayout>
    </SidebarProvider>
  )
}
