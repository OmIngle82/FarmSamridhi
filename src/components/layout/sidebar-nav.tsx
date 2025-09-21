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
        { name: "Farmers", href: "/distributor/farmers", icon: Users },
        { name: "Orders", href: "/distributor/orders", icon: Truck },
        { name: "Inventory", href: "/distributor/inventory", icon: Package },
        { name: "Transactions", href: "/distributor/transactions", icon: Wallet },
    ],
    retailer: [
        { name: "Dashboard", href: "/retailer", icon: Home },
        { name: "Source Products", href: "/retailer/products", icon: ShoppingCart },
        { name: "My Inventory", href: "/retailer/inventory", icon: Store },
        { name: "Transactions", href: "/retailer/transactions", icon: Wallet },
    ],
    consumer: [
        { name: "Dashboard", href: "/consumer", icon: Home },
        { name: "Track Product", href: "/consumer/track", icon: Package },
        { name: "My Purchases", href: "/consumer/purchases", icon: ShoppingCart },
        { name: "Favorite Farmers", href: "/consumer/farmers", icon: HeartHandshake },
    ]
};


export function SidebarNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  
  const getNavItems = () => {
    const role = user?.role || "farmer";
    // Below logic is to determine the navigation items based on the start of the path
    // This is useful if a user somehow lands on a page for another role.
    if (pathname.startsWith("/farmer")) return navConfig.farmer
    if (pathname.startsWith("/distributor")) return navConfig.distributor
    if (pathname.startsWith("/retailer")) return navConfig.retailer
    if (pathname.startsWith("/consumer")) return navConfig.consumer
    return navConfig[role] || [];
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
    </>
  )
}
