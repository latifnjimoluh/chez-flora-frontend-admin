"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Users, ShoppingBag, Package, Tag, Settings, LogOut, Menu, X, User, UserCog, Flower, MessageCircle, Calendar, FileText, Star, Edit, Palette } from 'lucide-react'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { removeAuthToken } from "@/services/adminApi"

interface NavItemProps {
  href: string
  icon: React.ElementType
  title: string
  isActive?: boolean
}

function NavItem({ href, icon: Icon, title, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all hover:bg-green-100 hover:text-green-900",
        isActive ? "bg-green-100 text-green-900" : "text-gray-500",
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{title}</span>
    </Link>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { toast } = useToast()
  const router = useRouter()

  const handleLogout = () => {
    removeAuthToken()
    if (typeof window !== "undefined") {
      localStorage.removeItem("role")
    }
    
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès",
    })
    router.push("/login")
  }

  const routes = [
    {
      href: "/dashboard",
      icon: BarChart3,
      title: "Dashboard",
    },
    {
      href: "/dashboard/users",
      icon: Users,
      title: "All Users",
    },
    {
      href: "/dashboard/clients",
      icon: User,
      title: "Clients",
    },
    {
      href: "/dashboard/admins",
      icon: UserCog,
      title: "Admins",
    },
    {
      href: "/dashboard/products",
      icon: Package,
      title: "Products",
    },
    {
      href: "/dashboard/services",
      icon: Palette,
      title: "Services",
    },
    {
      href: "/dashboard/categories",
      icon: Tag,
      title: "Categories",
    },
    {
      href: "/dashboard/orders",
      icon: ShoppingBag,
      title: "Orders",
    },
    {
      href: "/dashboard/reservations",
      icon: Calendar,
      title: "Reservations",
    },
    {
      href: "/dashboard/discussions",
      icon: MessageCircle,
      title: "Quote Discussions",
    },
    {
      href: "/dashboard/testimonials",
      icon: Star,
      title: "Testimonials",
    },
    {
      href: "/dashboard/blog",
      icon: FileText,
      title: "Blog",
    },
    {
      href: "/dashboard/content",
      icon: Edit,
      title: "Site Content",
    },
    {
      href: "/dashboard/settings",
      icon: Settings,
      title: "Settings",
    },
  ]

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 sm:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0">
            <div className="flex items-center border-b px-4 py-3">
              <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                <Flower className="h-6 w-6 text-green-600" />
                <span>Chez Flora Admin</span>
              </Link>
              <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
                <span className="sr-only">Close navigation menu</span>
              </Button>
            </div>
            <ScrollArea className="flex-1 px-2 py-4">
              <nav className="flex flex-col gap-1">
                {routes.map((route) => (
                  <NavItem
                    key={route.href}
                    href={route.href}
                    icon={route.icon}
                    title={route.title}
                    isActive={pathname === route.href}
                  />
                ))}
              </nav>
            </ScrollArea>
            <div className="border-t p-4">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Flower className="h-6 w-6 text-green-600" />
          <span className="hidden md:inline-block">Chez Flora Admin</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="sm" className="hidden md:flex" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 shrink-0 border-r bg-white md:block">
          <ScrollArea className="py-4 h-[calc(100vh-4rem)]">
            <nav className="flex flex-col gap-1 px-2">
              {routes.map((route) => (
                <NavItem
                  key={route.href}
                  href={route.href}
                  icon={route.icon}
                  title={route.title}
                  isActive={pathname === route.href}
                />
              ))}
            </nav>
          </ScrollArea>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
