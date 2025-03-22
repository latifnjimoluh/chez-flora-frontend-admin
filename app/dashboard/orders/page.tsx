"use client"

import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, Loader2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/data-table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { getAllOrders, getOrderById, updateOrderStatus, cancelOrder, type Order, type OrderDetail } from "@/services/orderApi"

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditStatusDialogOpen, setIsEditStatusDialogOpen] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [orderDetails, setOrderDetails] = useState<OrderDetail[]>([])
  const [actionLoading, setActionLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setIsLoading(true)
    try {
      const data = await getAllOrders()
  
      console.log("📦 Données reçues des commandes :", data)
  
      setOrders(data)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de récupérer les commandes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const data = await getOrderById(orderId)
      setCurrentOrder(data)
      setOrderDetails(data.produits || [])
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de récupérer les détails de la commande",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async () => {
    if (!currentOrder) return;

    setActionLoading(true)
    try {
      await updateOrderStatus(currentOrder.id_commande, currentOrder.statut)

      toast({
        title: "Succès",
        description: `Statut de la commande mis à jour avec succès en "${currentOrder.statut}"`,
      })

      fetchOrders()
      setIsEditStatusDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le statut de la commande",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "id_commande",
      header: "ID Commande",
      cell: ({ row }) => {
        const id = row.getValue("id_commande") as string
        return <div className="font-medium">{id.substring(0, 8)}...</div>
      },
    },
    {
      accessorKey: "client_name",
      header: "Client",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "prix_total",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const amount = Number.parseFloat(row.getValue("prix_total"))
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(amount)
        return <div className="font-medium">{formatted}</div>
      },
    },
    {
      accessorKey: "mode_livraison",
      header: "Livraison",
      cell: ({ row }) => {
        const mode = row.getValue("mode_livraison") as string
        return (
          <div
            className={`rounded-full px-2 py-1 text-xs inline-block text-center ${
              mode === "express"
                ? "bg-blue-100 text-blue-800"
                : mode === "standard"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
            }`}
          >
            {mode}
          </div>
        )
      },
    },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue("statut") as string
        return (
          <div
            className={`rounded-full px-2 py-1 text-xs inline-block text-center ${
              status === "commandé"
                ? "bg-blue-100 text-blue-800"
                : status === "en attente de livraison"
                  ? "bg-yellow-100 text-yellow-800"
                  : status === "livré"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
            }`}
          >
            {status}
          </div>
        )
      },
    },
    {
      accessorKey: "date_commande",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const order = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  fetchOrderDetails(order.id_commande)
                  setIsViewDialogOpen(true)
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentOrder(order)
                  setIsEditStatusDialogOpen(true)
                }}
              >
                Mettre à jour le statut
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Commandes</h1>
        <p className="text-muted-foreground">Gérer les commandes clients</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          searchColumn="email"
          searchPlaceholder="Rechercher par email..."
        />
      )}

      {/* Voir les détails de la commande */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
            <DialogDescription>ID de commande: {currentOrder?.id_commande}</DialogDescription>
          </DialogHeader>
          {currentOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations client</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <div className="font-medium">Nom</div>
                      <div>{currentOrder.client_name}</div>
                    </div>
                    <div>
                      <div className="font-medium">Email</div>
                      <div>{currentOrder.email}</div>
                    </div>
                    <div>
                      <div className="font-medium">Téléphone</div>
                      <div>{currentOrder.telephone}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations de livraison</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <div className="font-medium">Adresse</div>
                      <div>{currentOrder.adresse_livraison}</div>
                    </div>
                    <div>
                      <div className="font-medium">Ville</div>
                      <div>{currentOrder.ville}</div>
                    </div>
                    <div>
                      <div className="font-medium">Code postal</div>
                      <div>{currentOrder.code_postal}</div>
                    </div>
                    <div>
                      <div className="font-medium">Mode de livraison</div>
                      <div className="capitalize">{currentOrder.mode_livraison}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Articles commandés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderDetails.map((detail) => (
                      <div key={detail.id} className="flex items-center justify-between border-b pb-2">
                        <div className="space-y-1">
                          <div className="font-medium">
                            {detail.produit_nom || `ID Produit: ${detail.id_produit.substring(0, 8)}...`}
                          </div>
                          <div className="text-sm text-muted-foreground">Quantité: {detail.quantite}</div>
                        </div>
                        <div className="text-right">
                          <div>
                            {new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: "EUR",
                            }).format(detail.prix_unitaire)}{" "}
                            l'unité
                          </div>
                          <div className="font-bold">
                            {new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: "EUR",
                            }).format(detail.prix_total)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 space-y-2">
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Livraison</div>
                      <div>
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(currentOrder.prix_livraison)}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold">Total</div>
                      <div className="text-lg font-bold">
                        {new Intl.NumberFormat("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        }).format(currentOrder.prix_total)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Date de commande</div>
                  <div>{new Date(currentOrder.date_commande).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Mode de paiement</div>
                  <div className="capitalize">{currentOrder.mode_paiement}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Statut</div>
                  <div
                    className={`rounded-full px-2 py-1 text-xs inline-block text-center ${
                      currentOrder.statut === "commandé"
                        ? "bg-blue-100 text-blue-800"
                        : currentOrder.statut === "en attente de livraison"
                          ? "bg-yellow-100 text-yellow-800"
                          : currentOrder.statut === "livré"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentOrder.statut}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modifier le statut de la commande */}
      <Dialog open={isEditStatusDialogOpen} onOpenChange={setIsEditStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mettre à jour le statut de la commande</DialogTitle>
            <DialogDescription>
              Modifier le statut de la commande {currentOrder?.id_commande?.substring(0, 8)}...
            </DialogDescription>
          </DialogHeader>
          {currentOrder && (
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Statut actuel</label>
                  <div
                    className={`mt-1 rounded-full px-2 py-1 text-xs inline-block text-center ${
                      currentOrder.statut === "commandé"
                        ? "bg-blue-100 text-blue-800"
                        : currentOrder.statut === "en attente de livraison"
                          ? "bg-yellow-100 text-yellow-800"
                          : currentOrder.statut === "livré"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentOrder.statut}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nouveau statut</label>
                  <Select
                    value={currentOrder.statut}
                    onValueChange={(value) => setCurrentOrder({ ...currentOrder, statut: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commandé">Commandé</SelectItem>
                      <SelectItem value="en attente de livraison">En attente de livraison</SelectItem>
                      <SelectItem value="livré">Livré</SelectItem>
                      <SelectItem value="annulé">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditStatusDialogOpen(false)} disabled={actionLoading}>
              Annuler
            </Button>
            <Button onClick={handleUpdateStatus} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                "Mettre à jour le statut"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
