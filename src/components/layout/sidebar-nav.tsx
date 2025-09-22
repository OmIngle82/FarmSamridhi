
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
  HeartPulse,
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
import { useI18n } from "@/contexts/i18n-context"


const navConfig = {
    farmer: [
        { key: "dashboard", href: "/farmer", icon: Home },
        { key: "myProducts", href: "/farmer/products", icon: Leaf },
        { key: "orders", href: "/farmer/orders", icon: Package },
        { key: "payments", href: "/farmer/payments", icon: Wallet },
        { key: "marketPrices", href: "/farmer/market", icon: BarChart },
        { key: "finances", href: "/farmer/finances", icon: Landmark },
        { key: "cropHealth", href: "/farmer/crop-health", icon: HeartPulse },
        { key: "govtSchemes", href: "/farmer/schemes", icon: BookOpen },
        { key: "profile", href: "/farmer/profile", icon: User },
    ],
    distributor: [
        { key: "dashboard", href: "/distributor", icon: Home },
        { key: "newOrder", href: "/distributor/new-order", icon: PlusCircle },
        { key: "orders", href: "/distributor", icon: Truck },
        { key: "negotiations", href: "/distributor/negotiate?orderId=ORD001", icon: MessageSquare },
        { key: "inventory", href: "/distributor", icon: Package },
    ],
    retailer: [
        { key: "dashboard", href: "/retailer", icon: Home },
        { key: "sourceProducts", href: "/retailer", icon: ShoppingCart },
        { key: "traceJourney", href: "/journey?productId=PROD001", icon: Milestone },
        { key: "transactions", href: "/retailer", icon: Wallet },
    ],
    consumer: [
        { key: "dashboard", href: "/consumer", icon: Home },
        { key: "scanProduct", href: "/consumer", icon: QrCode },
        { key: "myPurchases", href: "/consumer/purchases", icon: ShoppingCart },
        { key: "favoriteFarmers", href: "/consumer/farmers", icon: HeartHandshake },
    ]
};


export function SidebarNav() {
  const pathname = usePathname()
  const { user } = useAuth()
  const { t } = useI18n();
  
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
            const name = t(item.key as any);
            return (
              <SidebarMenuItem key={item.key}>
                 <Link href={item.href} className="w-full">
                    <SidebarMenuButton
                        isActive={pathname === item.href}
                        tooltip={name}
                    >
                        <Icon />
                        <span>{name}</span>
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
                <SidebarMenuButton tooltip={t('support')}>
                <Users />
                <span>{t('support')}</span>
                </SidebarMenuButton>
            </a>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
    </>
  )
}
