
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  BarChart,
  Home,
  Landmark,
  Leaf,
  Package,
  ShoppingCart,
  Store,
  Truck,
  Users,
  Wallet,
  BookOpen,
  HeartHandshake,
  User,
  QrCode,
  MessageSquare,
  Milestone,
  PlusCircle,
} from "lucide-react"

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { Logo } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Separator } from "../ui/separator"
import { useAuth } from "@/contexts/auth-context"

const navConfig = {
    farmer: [
        { name: "Dashboard", href: "/farmer", icon: Home },
        { name: "My Products", href: "/farmer/products", icon: Leaf },
        { name: "Orders", href: "/farmer/orders", icon: Package },
        { name: "Payments", href: "/farmer/payments", icon: Wallet },
        { name: "Market Prices", href: "/farmer/market", icon: BarChart },
        { name: "Finances", href: "/farmer/finances", icon: Landmark },
        { name: "Govt. Schemes", href: "/farmer/schemes", icon: BookOpen },
        { name: "Profile", href: "/farmer/profile", icon: User },
    ],
    distributor: [
        { name: "Dashboard", href: "/distributor", icon: Home },
        { name: "New Order", href: "/distributor/new-order", icon: PlusCircle },
        { name: "Orders", href: "/distributor", icon: Truck }, // Changed to point to main dashboard for now
        { name: "Negotiations", href: "/distributor/negotiate?orderId=ORD001", icon: MessageSquare },
        { name: "Inventory", href: "/distributor", icon: Package }, // Changed to point to main dashboard for now
    ],
    retailer: [
        { name: "Dashboard", href: "/retailer", icon: Home },
        { name: "Source Products", href: "/retailer", icon: ShoppingCart },
        { name: "Trace Journey", href: "/journey?productId=PROD001", icon: Milestone },
        { name: "Transactions", href: "/retailer", icon: Wallet },
    ],
    consumer: [
        { name: "Dashboard", href: "/consumer", icon: Home },
        { name: "Scan Product", href: "/consumer", icon: QrCode },
        { name: "My Purchases", href: "/consumer", icon: ShoppingCart }, // Placeholder
        { name: "Favorite Farmers", href: "/consumer", icon: HeartHandshake }, // Placeholder
    ]
};


export function SidebarNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  
  const getNavItems = () => {
    const role = user?.role;
    if (role && navConfig[role]) {
      return navConfig[role];
    }
    // Fallback for when user role is not yet available or invalid
    if (pathname.startsWith("/farmer")) return navConfig.farmer
    if (pathname.startsWith("/distributor")) return navConfig.distributor
    if (pathname.startsWith("/retailer")) return navConfig.retailer
    if (pathname.startsWith("/consumer")) return navConfig.consumer
    if (pathname.startsWith("/journey")) return navConfig.retailer
    return [];
  }

  const navItems = getNavItems()

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="h-10 w-10 p-1">
                <Link href="/">
                    <Logo className="h-8 w-8 text-primary" />
                </Link>
            </Button>
            <span className="text-lg font-semibold font-headline">FarmSamridhi</span>
        </div>
      </SidebarHeader>
      <Separator />
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <SidebarMenuItem key={item.name}>
                 <Link href={item.href} className="w-full">
                    <SidebarMenuButton
                        isActive={pathname === item.href}
                        tooltip={item.name}
                    >
                        <Icon />
                        <span>{item.name}</span>
                    </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarContent className="!flex-grow-0">
        <Separator />
        <SidebarMenu>
          <SidebarMenuItem>
            <a href="mailto:support@farmsamridhi.com?subject=Support Request" className="w-full">
                <SidebarMenuButton tooltip="Support">
                <Users />
                <span>Support</span>
                </SidebarMenuButton>
            </a>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </>
  )
}
