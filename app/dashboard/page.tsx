"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  Users,
  ShoppingBag,
  Package,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  MessageCircle,
  Mail,
  BookOpen,
  Star,
  TrendingUp,
  Activity,
  ChevronRight,
  FileText,
  HelpCircle,
} from "lucide-react"
import Link from "next/link"

// Import des services
import adminApi from "@/services/adminApi"
import orderApi, { type Order } from "@/services/orderApi"
import productApi from "@/services/productApi"
import { blogService } from "@/services/blogService"
import { testimonialService } from "@/services/testimonialService"
import reservationApi, { type Reservation } from "@/services/reservationApi"
import discussionApi, { type Discussion } from "@/services/discussionApi"
import subscriptionService, { type Subscription } from "@/services/subscriptionService"

// Types pour les statistiques
interface DashboardStats {
  users: { total: number; change: number }
  products: { total: number; change: number }
  orders: { total: number; change: number }
  revenue: { total: number; change: number }
  subscriptions: { total: number; change: number }
  reservations: { total: number; change: number }
  messages: { total: number; change: number }
  testimonials: { total: number; change: number }
  blogs: { total: number; change: number }
  discussions: { total: number; change: number }
}

// Types pour les données récentes
interface RecentData {
  orders: Order[]
  users: any[]
  products: any[]
  reservations: Reservation[]
  discussions: Discussion[]
  subscriptions: Subscription[]
  testimonials: any[]
  blogs: any[]
}

// Composant pour les graphiques simples
const SimpleBarChart = ({
  data,
  labels,
  title,
  color = "bg-primary",
}: {
  data: number[]
  labels: string[]
  title: string
  color?: string
}) => {
  const maxValue = Math.max(...data)

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
      <div className="grid grid-cols-7 gap-2">
        {data.map((value, index) => (
          <div key={index} className="space-y-1">
            <div className="h-24 flex items-end">
              <div className={`w-full ${color} rounded-sm`} style={{ height: `${(value / maxValue) * 100}%` }}></div>
            </div>
            <div className="text-xs text-center text-muted-foreground">{labels[index]}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Composant pour les statistiques
const StatCard = ({
  title,
  value,
  icon: Icon,
  change,
  period,
  link,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  change: { value: number; positive: boolean }
  period: string
  link?: string
}) => {
  const content = (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground flex items-center">
          <span className={`${change.positive ? "text-green-500" : "text-red-500"} flex items-center mr-1`}>
            {change.positive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
            {Math.abs(change.value)}%
          </span>
          {period}
        </p>
      </CardContent>
    </Card>
  )

  if (link) {
    return <Link href={link}>{content}</Link>
  }

  return content
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    users: { total: 0, change: 0 },
    products: { total: 0, change: 0 },
    orders: { total: 0, change: 0 },
    revenue: { total: 0, change: 0 },
    subscriptions: { total: 0, change: 0 },
    reservations: { total: 0, change: 0 },
    messages: { total: 0, change: 0 },
    testimonials: { total: 0, change: 0 },
    blogs: { total: 0, change: 0 },
    discussions: { total: 0, change: 0 },
  })
  const [recentData, setRecentData] = useState<RecentData>({
    orders: [],
    users: [],
    products: [],
    reservations: [],
    discussions: [],
    subscriptions: [],
    testimonials: [],
    blogs: [],
  })
  const { toast } = useToast()

  // Données pour les graphiques
  const salesData = [15000, 22000, 18000, 25000, 30000, 28000, 35000]
  const visitsData = [120, 150, 180, 220, 200, 250, 300]
  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Récupération des données utilisateurs
        let usersData = []
        try {
          usersData = await adminApi.getAllUsers()
          setStats((prev) => ({
            ...prev,
            users: { total: usersData.length, change: 20 },
          }))
          setRecentData((prev) => ({
            ...prev,
            users: usersData.slice(0, 5),
          }))
        } catch (error) {
          console.error("Erreur lors de la récupération des utilisateurs:", error)
        }

        // Récupération des produits
        try {
          const productsResponse = await productApi.getAllProducts()
          const products = productsResponse?.data || []
        
          setStats((prev) => ({
            ...prev,
            products: { total: products.length, change: 5 },
          }))
        
          setRecentData((prev) => ({
            ...prev,
            products: products.slice(0, 5),
          }))
        } catch (error) {
          console.error("Erreur lors de la récupération des produits:", error)
        }
        

        // Récupération des commandes
        try {
          const ordersData = await orderApi.getAllOrders()
          let totalRevenue = 0
          ordersData.forEach((order) => {
            totalRevenue += order.prix_total
          })

          setStats((prev) => ({
            ...prev,
            orders: { total: ordersData.length, change: -10 },
            revenue: { total: totalRevenue, change: 15 },
          }))

          setRecentData((prev) => ({
            ...prev,
            orders: ordersData.slice(0, 5),
          }))
        } catch (error) {
          console.error("Erreur lors de la récupération des commandes:", error)
        }

        // Récupération des abonnements
        try {
          const subscriptionsData = await subscriptionService.getAllSubscriptions()
          setStats((prev) => ({
            ...prev,
            subscriptions: { total: subscriptionsData.length, change: 25 },
          }))
          setRecentData((prev) => ({
            ...prev,
            subscriptions: subscriptionsData.slice(0, 5),
          }))
        } catch (error) {
          console.error("Erreur lors de la récupération des abonnements:", error)
        }

        // Récupération des réservations
        try {
          const reservationsData = await reservationApi.getAllReservations()
          setStats((prev) => ({
            ...prev,
            reservations: { total: reservationsData.length, change: 8 },
          }))
          setRecentData((prev) => ({
            ...prev,
            reservations: reservationsData.slice(0, 5),
          }))
        } catch (error) {
          console.error("Erreur lors de la récupération des réservations:", error)
        }

        // Récupération des discussions
        try {
          const discussionsData = await discussionApi.getAllDiscussions()
          setStats((prev) => ({
            ...prev,
            discussions: { total: discussionsData.length, change: 12 },
          }))
          setRecentData((prev) => ({
            ...prev,
            discussions: discussionsData.slice(0, 5),
          }))
        } catch (error) {
          console.error("Erreur lors de la récupération des discussions:", error)
        }

        // Récupération des témoignages
        try {
          const testimonialsData = await testimonialService.getAllTestimonials()
          if (testimonialsData.success && testimonialsData.data) {
            setStats((prev) => ({
              ...prev,
              testimonials: { total: testimonialsData.data.length, change: 12 },
            }))
            setRecentData((prev) => ({
              ...prev,
              testimonials: testimonialsData.data.slice(0, 5),
            }))
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des témoignages:", error)
        }

        // Récupération des articles de blog
        try {
          const blogsData = await blogService.getAllPosts()
          if (blogsData.success && blogsData.data) {
            setStats((prev) => ({
              ...prev,
              blogs: { total: blogsData.data.length, change: 8 },
            }))
            setRecentData((prev) => ({
              ...prev,
              blogs: blogsData.data.slice(0, 5),
            }))
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des articles de blog:", error)
        }

        // Simuler les messages (pas de service spécifique)
        setStats((prev) => ({
          ...prev,
          messages: { total: 45, change: -5 },
        }))
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du tableau de bord. Veuillez réessayer.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  // Formater les nombres
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fr-FR").format(num)
  }

  // Formater la monnaie
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF", maximumFractionDigits: 0 }).format(
      amount,
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tableau de bord</h1>
        <p className="text-muted-foreground">Bienvenue sur votre tableau de bord d'administration</p>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="sales">Ventes</TabsTrigger>
          <TabsTrigger value="customers">Clients</TabsTrigger>
          <TabsTrigger value="content">Contenu</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Utilisateurs"
              value={formatNumber(stats.users.total)}
              icon={Users}
              change={{ value: stats.users.change, positive: stats.users.change > 0 }}
              period="depuis le mois dernier"
              link="/dashboard/users"
            />

            <StatCard
              title="Total Produits"
              value={formatNumber(stats.products.total)}
              icon={Package}
              change={{ value: stats.products.change, positive: stats.products.change > 0 }}
              period="depuis le mois dernier"
              link="/dashboard/products"
            />

            <StatCard
              title="Total Commandes"
              value={formatNumber(stats.orders.total)}
              icon={ShoppingBag}
              change={{ value: stats.orders.change, positive: stats.orders.change > 0 }}
              period="depuis le mois dernier"
              link="/dashboard/orders"
            />

            <StatCard
              title="Chiffre d'Affaires"
              value={formatCurrency(stats.revenue.total)}
              icon={DollarSign}
              change={{ value: stats.revenue.change, positive: stats.revenue.change > 0 }}
              period="depuis le mois dernier"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Abonnements"
              value={formatNumber(stats.subscriptions.total)}
              icon={BookOpen}
              change={{ value: stats.subscriptions.change, positive: stats.subscriptions.change > 0 }}
              period="depuis le mois dernier"
              link="/dashboard/subscriptions"
            />

            <StatCard
              title="Réservations"
              value={formatNumber(stats.reservations.total)}
              icon={Calendar}
              change={{ value: stats.reservations.change, positive: stats.reservations.change > 0 }}
              period="depuis le mois dernier"
              link="/dashboard/reservations"
            />

            <StatCard
              title="Messages"
              value={formatNumber(stats.messages.total)}
              icon={Mail}
              change={{ value: stats.messages.change, positive: stats.messages.change > 0 }}
              period="depuis le mois dernier"
              link="/dashboard/contact/messages"
            />

            <StatCard
              title="Témoignages"
              value={formatNumber(stats.testimonials.total)}
              icon={Star}
              change={{ value: stats.testimonials.change, positive: stats.testimonials.change > 0 }}
              period="depuis le mois dernier"
              link="/dashboard/testimonials"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Ventes Hebdomadaires</CardTitle>
                <CardDescription>Évolution des ventes sur les 7 derniers jours</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={salesData} labels={weekDays} title="Ventes (XAF)" color="bg-green-500" />
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/orders">
                  <Button variant="outline" className="w-full">
                    Voir toutes les commandes
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Visites du Site</CardTitle>
                <CardDescription>Nombre de visites sur les 7 derniers jours</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleBarChart data={visitsData} labels={weekDays} title="Nombre de visites" color="bg-blue-500" />
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Voir les statistiques détaillées
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Commandes Récentes</CardTitle>
                <CardDescription>Les dernières commandes passées sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentData.orders.length > 0 ? (
                    recentData.orders.map((order) => (
                      <div key={order.id_commande} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{order.client_name || `Client #${order.id_client}`}</p>
                          <p className="text-xs text-muted-foreground">{order.id_commande.substring(0, 8)}...</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{formatCurrency(order.prix_total)}</div>
                          <div className="rounded-full px-2 py-1 text-xs bg-yellow-100 text-yellow-800">
                            {order.statut}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">Aucune commande récente</div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/orders">
                  <Button variant="outline" className="w-full">
                    Voir toutes les commandes
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Utilisateurs Récents</CardTitle>
                <CardDescription>Les derniers utilisateurs inscrits sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentData.users.length > 0 ? (
                    recentData.users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`rounded-full px-2 py-1 text-xs ${
                              user.role === "superadmin"
                                ? "bg-purple-100 text-purple-800"
                                : user.role === "admin"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.role}
                          </div>
                          <div className="rounded-full px-2 py-1 text-xs bg-green-100 text-green-800">
                            {user.status}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">Aucun utilisateur récent</div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/users">
                  <Button variant="outline" className="w-full">
                    Voir tous les utilisateurs
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Ventes Aujourd'hui"
              value={formatCurrency(12500)}
              icon={DollarSign}
              change={{ value: 8, positive: true }}
              period="par rapport à hier"
            />

            <StatCard
              title="Commandes Aujourd'hui"
              value="5"
              icon={ShoppingBag}
              change={{ value: 15, positive: true }}
              period="par rapport à hier"
            />

            <StatCard
              title="Panier Moyen"
              value={formatCurrency(2500)}
              icon={ShoppingBag}
              change={{ value: 3, positive: true }}
              period="par rapport à hier"
            />

            <StatCard
              title="Taux de Conversion"
              value="3.2%"
              icon={TrendingUp}
              change={{ value: 0.5, positive: true }}
              period="par rapport à hier"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Commandes Récentes</CardTitle>
                <CardDescription>Les dernières commandes passées sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentData.orders.length > 0 ? (
                    recentData.orders.map((order) => (
                      <div key={order.id_commande} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{order.client_name || `Client #${order.id_client}`}</p>
                          <p className="text-xs text-muted-foreground">{order.id_commande.substring(0, 8)}...</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{formatCurrency(order.prix_total)}</div>
                          <div className="rounded-full px-2 py-1 text-xs bg-yellow-100 text-yellow-800">
                            {order.statut}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">Aucune commande récente</div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/orders">
                  <Button variant="outline" className="w-full">
                    Voir toutes les commandes
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Réservations Récentes</CardTitle>
                <CardDescription>Les dernières réservations de services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentData.reservations.length > 0 ? (
                    recentData.reservations.map((reservation) => (
                      <div key={reservation.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {reservation.client_name || `Client #${reservation.client_id}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {reservation.service_name || `Service #${reservation.service_id}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">
                            {new Date(reservation.date_evenement).toLocaleDateString("fr-FR")}
                          </div>
                          <div
                            className={`rounded-full px-2 py-1 text-xs ${
                              reservation.statut === "réservé"
                                ? "bg-green-100 text-green-800"
                                : reservation.statut === "en attente"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {reservation.statut}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">Aucune réservation récente</div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/reservations">
                  <Button variant="outline" className="w-full">
                    Voir toutes les réservations
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Discussions de Devis</CardTitle>
                <CardDescription>Les dernières discussions de devis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentData.discussions.length > 0 ? (
                    recentData.discussions.map((discussion) => (
                      <div key={discussion.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {discussion.client_name || `Client #${discussion.client_id}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {discussion.service_name || `Service #${discussion.service_id}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium">{formatCurrency(discussion.prix_propose)}</div>
                          <div
                            className={`rounded-full px-2 py-1 text-xs ${
                              discussion.statut === "finalisé"
                                ? "bg-green-100 text-green-800"
                                : discussion.statut === "réponse_admin"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {discussion.statut}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">Aucune discussion récente</div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/discussions">
                  <Button variant="outline" className="w-full">
                    Voir toutes les discussions
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Abonnements Récents</CardTitle>
                <CardDescription>Les derniers abonnements souscrits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentData.subscriptions.length > 0 ? (
                    recentData.subscriptions.map((subscription) => (
                      <div key={subscription.id_abonnement} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {subscription.client
                              ? `${subscription.client.first_name} ${subscription.client.last_name}`
                              : `Client #${subscription.id_client}`}
                          </p>
                          <p className="text-xs text-muted-foreground">{subscription.type_abonnement}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">{subscription.frequence}</div>
                          <div
                            className={`rounded-full px-2 py-1 text-xs ${
                              subscription.statut === "abonné"
                                ? "bg-green-100 text-green-800"
                                : subscription.statut === "suspendu"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {subscription.statut}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">Aucun abonnement récent</div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/subscriptions">
                  <Button variant="outline" className="w-full">
                    Voir tous les abonnements
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Nouveaux Clients"
              value="12"
              icon={Users}
              change={{ value: 20, positive: true }}
              period="ce mois-ci"
            />

            <StatCard
              title="Clients Actifs"
              value="85"
              icon={Activity}
              change={{ value: 5, positive: true }}
              period="par rapport au mois dernier"
            />

            <StatCard
              title="Abonnés"
              value={formatNumber(stats.subscriptions.total)}
              icon={BookOpen}
              change={{ value: stats.subscriptions.change, positive: true }}
              period="par rapport au mois dernier"
            />

            <StatCard
              title="Taux de Fidélisation"
              value="78%"
              icon={Users}
              change={{ value: 3, positive: true }}
              period="par rapport au mois dernier"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Utilisateurs Récents</CardTitle>
                <CardDescription>Les derniers utilisateurs inscrits sur la plateforme</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentData.users.length > 0 ? (
                    recentData.users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div
                            className={`rounded-full px-2 py-1 text-xs ${
                              user.role === "superadmin"
                                ? "bg-purple-100 text-purple-800"
                                : user.role === "admin"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                            }`}
                          >
                            {user.role}
                          </div>
                          <div className="rounded-full px-2 py-1 text-xs bg-green-100 text-green-800">
                            {user.status}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">Aucun utilisateur récent</div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/users">
                  <Button variant="outline" className="w-full">
                    Voir tous les utilisateurs
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Abonnements Actifs</CardTitle>
                <CardDescription>Répartition des abonnements par type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "Bouquet Mensuel", count: 15, percentage: 45 },
                    { type: "Plante Trimestrielle", count: 8, percentage: 25 },
                    { type: "Atelier Semestriel", count: 5, percentage: 15 },
                    { type: "Premium Annuel", count: 4, percentage: 15 },
                  ].map((subscription, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{subscription.type}</span>
                        <span className="text-sm text-muted-foreground">{subscription.count} abonnés</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{ width: `${subscription.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/subscriptions">
                  <Button variant="outline" className="w-full">
                    Voir tous les abonnements
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Dernières Réservations</CardTitle>
              <CardDescription>Les dernières réservations de services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentData.reservations.length > 0 ? (
                  recentData.reservations.map((reservation) => (
                    <div key={reservation.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          {reservation.client_name || `Client #${reservation.client_id}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {reservation.service_name || `Service #${reservation.service_id}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground">
                          {new Date(reservation.date_evenement).toLocaleDateString("fr-FR")}
                        </div>
                        <div
                          className={`rounded-full px-2 py-1 text-xs ${
                            reservation.statut === "réservé"
                              ? "bg-green-100 text-green-800"
                              : reservation.statut === "en attente"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {reservation.statut}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground py-4">Aucune réservation récente</div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard/reservations">
                <Button variant="outline" className="w-full">
                  Voir toutes les réservations
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Articles de Blog"
              value={formatNumber(stats.blogs.total)}
              icon={FileText}
              change={{ value: 8, positive: true }}
              period="ce mois-ci"
              link="/dashboard/blog"
            />

            <StatCard
              title="Témoignages"
              value={formatNumber(stats.testimonials.total)}
              icon={Star}
              change={{ value: 12, positive: true }}
              period="ce mois-ci"
              link="/dashboard/testimonials"
            />

            <StatCard
              title="Messages"
              value={formatNumber(stats.messages.total)}
              icon={MessageCircle}
              change={{ value: 5, positive: false }}
              period="ce mois-ci"
              link="/dashboard/contact/messages"
            />

            <StatCard
              title="FAQs"
              value="18"
              icon={HelpCircle}
              change={{ value: 2, positive: true }}
              period="ce mois-ci"
              link="/dashboard/faqs"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Articles Récents</CardTitle>
                <CardDescription>Les derniers articles publiés sur le blog</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentData.blogs.length > 0 ? (
                    recentData.blogs.map((blog, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{blog.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Publié le {new Date(blog.created_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                        <div className="text-sm text-muted-foreground">{blog.views || 0} vues</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">Aucun article récent</div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/blog">
                  <Button variant="outline" className="w-full">
                    Voir tous les articles
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Derniers Témoignages</CardTitle>
                <CardDescription>Les derniers témoignages clients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentData.testimonials.length > 0 ? (
                    recentData.testimonials.map((testimonial, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{testimonial.name}</p>
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">"{testimonial.text}"</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-4">Aucun témoignage récent</div>
                  )}
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/dashboard/testimonials">
                  <Button variant="outline" className="w-full">
                    Voir tous les témoignages
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Messages Récents</CardTitle>
              <CardDescription>Les derniers messages de contact reçus</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: "Sophie Leclerc",
                    email: "sophie.leclerc@example.com",
                    subject: "Demande de devis",
                    date: "22/03/2025",
                    status: "non lu",
                  },
                  {
                    name: "Jean Martin",
                    email: "jean.martin@example.com",
                    subject: "Question sur un produit",
                    date: "21/03/2025",
                    status: "non lu",
                  },
                  {
                    name: "Marie Dupont",
                    email: "marie.dupont@example.com",
                    subject: "Problème de livraison",
                    date: "20/03/2025",
                    status: "lu",
                  },
                  {
                    name: "Pierre Dubois",
                    email: "pierre.dubois@example.com",
                    subject: "Demande de partenariat",
                    date: "19/03/2025",
                    status: "répondu",
                  },
                  {
                    name: "Nexus1 nexus",
                    email: "latifnjimoluh@gmail.com",
                    subject: "Suggestion d'amélioration",
                    date: "18/03/2025",
                    status: "répondu",
                  },
                ].map((message, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{message.name}</p>
                      <p className="text-xs text-muted-foreground">{message.subject}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-muted-foreground">{message.date}</div>
                      <div
                        className={`rounded-full px-2 py-1 text-xs ${
                          message.status === "non lu"
                            ? "bg-red-100 text-red-800"
                            : message.status === "lu"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {message.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Link href="/dashboard/contact/messages">
                <Button variant="outline" className="w-full">
                  Voir tous les messages
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

