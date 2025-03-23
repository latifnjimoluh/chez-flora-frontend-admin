"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Users,
  ShoppingBag,
  Package,
  Tag,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  UserCog,
  Flower,
  MessageCircle,
  Calendar,
  FileText,
  Star,
  Edit,
  Palette,
  ChevronRight,
  ChevronDown,
  Mail,
  HelpCircle,
  BookOpen,
  PanelLeft,
  PanelRight,
  Info,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { removeAuthToken } from "@/services/adminApi"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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

interface NavGroupProps {
  title: string
  icon: React.ElementType
  children: React.ReactNode
  defaultOpen?: boolean
}

function NavGroup({ title, icon: Icon, children, defaultOpen = false }: NavGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const pathname = usePathname()

  // Ouvrir automatiquement le groupe si un de ses enfants est actif
  useEffect(() => {
    // Vérifier si le pathname actuel correspond à un des enfants
    const childLinks = Array.from(document.querySelectorAll(`[data-group="${title}"] a`))
    const hasActiveChild = childLinks.some((link) => link.getAttribute("href") === pathname)

    if (hasActiveChild) {
      setIsOpen(true)
    }
  }, [pathname, title])

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-green-50 hover:text-green-900">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          <span>{title}</span>
        </div>
        {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent data-group={title} className="pl-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pathname = usePathname()
  const { toast } = useToast()
  const router = useRouter()

  const handleLogout = () => {
    removeAuthToken()
    if (typeof window !== "undefined") {
      localStorage.removeItem("role")
      localStorage.removeItem("token")
    }

    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès",
    })
    router.push("/")
  }

  // Récupérer l'état de la sidebar du localStorage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebarCollapsed")
    if (savedState !== null) {
      setSidebarCollapsed(savedState === "true")
    }
  }, [])

  // Sauvegarder l'état de la sidebar dans le localStorage
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed
    setSidebarCollapsed(newState)
    localStorage.setItem("sidebarCollapsed", String(newState))
  }

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
                <NavItem href="/dashboard" icon={BarChart3} title="Dashboard" isActive={pathname === "/dashboard"} />

                <NavGroup
                  title="Utilisateurs"
                  icon={Users}
                  defaultOpen={
                    pathname.includes("/dashboard/users") ||
                    pathname.includes("/dashboard/clients") ||
                    pathname.includes("/dashboard/admins")
                  }
                >
                  <NavItem
                    href="/dashboard/users"
                    icon={Users}
                    title="Tous les utilisateurs"
                    isActive={pathname === "/dashboard/users"}
                  />
                  <NavItem
                    href="/dashboard/clients"
                    icon={User}
                    title="Clients"
                    isActive={pathname === "/dashboard/clients"}
                  />
                  <NavItem
                    href="/dashboard/admins"
                    icon={UserCog}
                    title="Administrateurs"
                    isActive={pathname === "/dashboard/admins"}
                  />
                </NavGroup>

                <NavGroup
                  title="Catalogue"
                  icon={Package}
                  defaultOpen={
                    pathname.includes("/dashboard/products") ||
                    pathname.includes("/dashboard/services") ||
                    pathname.includes("/dashboard/categories")
                  }
                >
                  <NavItem
                    href="/dashboard/products"
                    icon={Package}
                    title="Produits"
                    isActive={pathname === "/dashboard/products"}
                  />
                  <NavItem
                    href="/dashboard/services"
                    icon={Palette}
                    title="Services"
                    isActive={pathname === "/dashboard/services"}
                  />
                  <NavItem
                    href="/dashboard/categories"
                    icon={Tag}
                    title="Catégories"
                    isActive={pathname === "/dashboard/categories"}
                  />
                </NavGroup>

                <NavGroup
                  title="Commandes"
                  icon={ShoppingBag}
                  defaultOpen={
                    pathname.includes("/dashboard/orders") ||
                    pathname.includes("/dashboard/reservations") ||
                    pathname.includes("/dashboard/discussions")
                  }
                >
                  <NavItem
                    href="/dashboard/orders"
                    icon={ShoppingBag}
                    title="Commandes"
                    isActive={pathname === "/dashboard/orders"}
                  />
                  <NavItem
                    href="/dashboard/reservations"
                    icon={Calendar}
                    title="Réservations"
                    isActive={pathname === "/dashboard/reservations"}
                  />
                  <NavItem
                    href="/dashboard/discussions"
                    icon={MessageCircle}
                    title="Discussions devis"
                    isActive={pathname === "/dashboard/discussions"}
                  />
                </NavGroup>

                <NavGroup
                  title="Contenu"
                  icon={Edit}
                  defaultOpen={
                    pathname.includes("/dashboard/content") ||
                    pathname.includes("/dashboard/blog") ||
                    pathname.includes("/dashboard/blog/comments") ||
                    pathname.includes("/dashboard/testimonials")
                  }
                >
                  <NavItem
                    href="/dashboard/content"
                    icon={Edit}
                    title="Contenu du site"
                    isActive={pathname === "/dashboard/content"}
                  />
                  <NavItem
                    href="/dashboard/blog"
                    icon={FileText}
                    title="Blog"
                    isActive={pathname === "/dashboard/blog"}
                  />
                  <NavItem
                    href="/dashboard/blog/comments"
                    icon={FileText}
                    title="Comments"
                    isActive={pathname === "/dashboard/blog/comments"}
                  />
                  <NavItem
                    href="/dashboard/testimonials"
                    icon={Star}
                    title="Témoignages"
                    isActive={pathname === "/dashboard/testimonials"}
                  />
                </NavGroup>

                <NavGroup title="Contact" icon={Mail} defaultOpen={pathname.includes("/dashboard/contact")}>
                  <NavItem
                    href="/dashboard/contact/info"
                    icon={Info}
                    title="Informations"
                    isActive={pathname === "/dashboard/contact/info"}
                  />
                  <NavItem
                    href="/dashboard/contact/messages"
                    icon={Mail}
                    title="Messages"
                    isActive={pathname === "/dashboard/contact/messages"}
                  />
                  <NavItem
                    href="/dashboard/contact/subjects"
                    icon={Tag}
                    title="Sujets"
                    isActive={pathname === "/dashboard/contact/subjects"}
                  />
                </NavGroup>

                <NavGroup
                  title="Autres"
                  icon={HelpCircle}
                  defaultOpen={
                    pathname.includes("/dashboard/faqs") ||
                    pathname.includes("/dashboard/newsletter") ||
                    pathname.includes("/dashboard/subscriptions") ||
                    pathname.includes("/dashboard/subscription-types")
                  }
                >
                  <NavItem
                    href="/dashboard/faqs"
                    icon={HelpCircle}
                    title="FAQs"
                    isActive={pathname === "/dashboard/faqs"}
                  />
                  <NavItem
                    href="/dashboard/newsletter"
                    icon={Mail}
                    title="Newsletter"
                    isActive={pathname === "/dashboard/newsletter"}
                  />
                  <NavItem
                    href="/dashboard/subscriptions"
                    icon={BookOpen}
                    title="Abonnements"
                    isActive={pathname === "/dashboard/subscriptions"}
                  />
                  <NavItem
                    href="/dashboard/subscription-types"
                    icon={Tag}
                    title="Types d'abonnements"
                    isActive={pathname === "/dashboard/subscription-types"}
                  />
                </NavGroup>

                <NavItem
                  href="/dashboard/settings"
                  icon={Settings}
                  title="Paramètres"
                  isActive={pathname === "/dashboard/settings"}
                />
              </nav>
            </ScrollArea>
            <div className="border-t p-4">
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                Déconnexion
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
            Déconnexion
          </Button>
        </div>
      </header>
      <div className="flex flex-1">
        <aside
          className={cn(
            "hidden md:block border-r bg-white transition-all duration-300",
            sidebarCollapsed ? "w-16" : "w-64",
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex justify-end p-2">
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8">
                {sidebarCollapsed ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
              </Button>
            </div>
            <ScrollArea className="flex-1 py-2 h-[calc(100vh-4rem-48px)]">
              <nav className={cn("flex flex-col gap-1", sidebarCollapsed ? "px-1" : "px-2")}>
                {sidebarCollapsed ? (
                  // Version réduite - seulement les icônes
                  <>
                    <Link
                      href="/dashboard"
                      className={cn(
                        "flex justify-center rounded-lg p-2 text-sm transition-all hover:bg-green-100 hover:text-green-900",
                        pathname === "/dashboard" ? "bg-green-100 text-green-900" : "text-gray-500",
                      )}
                      title="Dashboard"
                    >
                      <BarChart3 className="h-5 w-5" />
                    </Link>

                    <div className="py-1">
                      <div
                        className="flex justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-green-100 hover:text-green-900"
                        title="Utilisateurs"
                      >
                        <Users className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="py-1">
                      <div
                        className="flex justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-green-100 hover:text-green-900"
                        title="Catalogue"
                      >
                        <Package className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="py-1">
                      <div
                        className="flex justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-green-100 hover:text-green-900"
                        title="Commandes"
                      >
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="py-1">
                      <div
                        className="flex justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-green-100 hover:text-green-900"
                        title="Contenu"
                      >
                        <Edit className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="py-1">
                      <div
                        className="flex justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-green-100 hover:text-green-900"
                        title="Contact"
                      >
                        <Mail className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="py-1">
                      <div
                        className="flex justify-center rounded-lg p-2 text-sm text-gray-500 hover:bg-green-100 hover:text-green-900"
                        title="Autres"
                      >
                        <HelpCircle className="h-5 w-5" />
                      </div>
                    </div>

                    <Link
                      href="/dashboard/settings"
                      className={cn(
                        "flex justify-center rounded-lg p-2 text-sm transition-all hover:bg-green-100 hover:text-green-900",
                        pathname === "/dashboard/settings" ? "bg-green-100 text-green-900" : "text-gray-500",
                      )}
                      title="Paramètres"
                    >
                      <Settings className="h-5 w-5" />
                    </Link>
                  </>
                ) : (
                  // Version complète avec texte et groupes
                  <>
                    <NavItem
                      href="/dashboard"
                      icon={BarChart3}
                      title="Dashboard"
                      isActive={pathname === "/dashboard"}
                    />

                    <NavGroup
                      title="Utilisateurs"
                      icon={Users}
                      defaultOpen={
                        pathname.includes("/dashboard/users") ||
                        pathname.includes("/dashboard/clients") ||
                        pathname.includes("/dashboard/admins")
                      }
                    >
                      <NavItem
                        href="/dashboard/users"
                        icon={Users}
                        title="Tous les utilisateurs"
                        isActive={pathname === "/dashboard/users"}
                      />
                      <NavItem
                        href="/dashboard/clients"
                        icon={User}
                        title="Clients"
                        isActive={pathname === "/dashboard/clients"}
                      />
                      <NavItem
                        href="/dashboard/admins"
                        icon={UserCog}
                        title="Administrateurs"
                        isActive={pathname === "/dashboard/admins"}
                      />
                    </NavGroup>

                    <NavGroup
                      title="Catalogue"
                      icon={Package}
                      defaultOpen={
                        pathname.includes("/dashboard/products") ||
                        pathname.includes("/dashboard/services") ||
                        pathname.includes("/dashboard/categories")
                      }
                    >
                      <NavItem
                        href="/dashboard/products"
                        icon={Package}
                        title="Produits"
                        isActive={pathname === "/dashboard/products"}
                      />
                      <NavItem
                        href="/dashboard/services"
                        icon={Palette}
                        title="Services"
                        isActive={pathname === "/dashboard/services"}
                      />
                      <NavItem
                        href="/dashboard/categories"
                        icon={Tag}
                        title="Catégories"
                        isActive={pathname === "/dashboard/categories"}
                      />
                    </NavGroup>

                    <NavGroup
                      title="Commandes"
                      icon={ShoppingBag}
                      defaultOpen={
                        pathname.includes("/dashboard/orders") ||
                        pathname.includes("/dashboard/reservations") ||
                        pathname.includes("/dashboard/discussions")
                      }
                    >
                      <NavItem
                        href="/dashboard/orders"
                        icon={ShoppingBag}
                        title="Commandes"
                        isActive={pathname === "/dashboard/orders"}
                      />
                      <NavItem
                        href="/dashboard/reservations"
                        icon={Calendar}
                        title="Réservations"
                        isActive={pathname === "/dashboard/reservations"}
                      />
                      <NavItem
                        href="/dashboard/discussions"
                        icon={MessageCircle}
                        title="Discussions devis"
                        isActive={pathname === "/dashboard/discussions"}
                      />
                    </NavGroup>

                    <NavGroup
                      title="Contenu"
                      icon={Edit}
                      defaultOpen={
                        pathname.includes("/dashboard/content") ||
                        pathname.includes("/dashboard/blog") ||
                        pathname.includes("/dashboard/testimonials")
                      }
                    >
                      <NavItem
                        href="/dashboard/content"
                        icon={Edit}
                        title="Contenu du site"
                        isActive={pathname === "/dashboard/content"}
                      />
                      <NavItem
                        href="/dashboard/blog"
                        icon={FileText}
                        title="Blog"
                        isActive={pathname === "/dashboard/blog"}
                      />
                      <NavItem
                        href="/dashboard/testimonials"
                        icon={Star}
                        title="Témoignages"
                        isActive={pathname === "/dashboard/testimonials"}
                      />
                    </NavGroup>

                    <NavGroup title="Contact" icon={Mail} defaultOpen={pathname.includes("/dashboard/contact")}>
                      <NavItem
                        href="/dashboard/contact/info"
                        icon={Info}
                        title="Informations"
                        isActive={pathname === "/dashboard/contact/info"}
                      />
                      <NavItem
                        href="/dashboard/contact/messages"
                        icon={Mail}
                        title="Messages"
                        isActive={pathname === "/dashboard/contact/messages"}
                      />
                      <NavItem
                        href="/dashboard/contact/subjects"
                        icon={Tag}
                        title="Sujets"
                        isActive={pathname === "/dashboard/contact/subjects"}
                      />
                    </NavGroup>

                    <NavGroup
                      title="Autres"
                      icon={HelpCircle}
                      defaultOpen={
                        pathname.includes("/dashboard/faqs") ||
                        pathname.includes("/dashboard/newsletter") ||
                        pathname.includes("/dashboard/subscriptions") ||
                        pathname.includes("/dashboard/subscription-types")
                      }
                    >
                      <NavItem
                        href="/dashboard/faqs"
                        icon={HelpCircle}
                        title="FAQs"
                        isActive={pathname === "/dashboard/faqs"}
                      />
                      <NavItem
                        href="/dashboard/newsletter"
                        icon={Mail}
                        title="Newsletter"
                        isActive={pathname === "/dashboard/newsletter"}
                      />
                      <NavItem
                        href="/dashboard/subscriptions"
                        icon={BookOpen}
                        title="Abonnements"
                        isActive={pathname === "/dashboard/subscriptions"}
                      />
                      <NavItem
                        href="/dashboard/subscriptions/types"
                        icon={Tag}
                        title="Types d'abonnements"
                        isActive={pathname === "/dashboard/subscriptions/types"}
                      />
                    </NavGroup>

                    <NavItem
                      href="/dashboard/settings"
                      icon={Settings}
                      title="Paramètres"
                      isActive={pathname === "/dashboard/settings"}
                    />
                  </>
                )}
              </nav>
            </ScrollArea>
          </div>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

