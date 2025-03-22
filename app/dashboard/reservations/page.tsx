"use client"

import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, Loader2 } from "lucide-react"
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
import { format } from "date-fns"
import {
  getAllReservations,
  getReservationById,
  updateReservationStatus,
  type Reservation,
} from "@/services/reservationApi"

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditStatusDialogOpen, setIsEditStatusDialogOpen] = useState(false)
  const [currentReservation, setCurrentReservation] = useState<Reservation | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchReservations()
  }, [])

  const fetchReservations = async () => {
    setIsLoading(true)
    try {
      const data = await getAllReservations()
      setReservations(data)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de récupérer les réservations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReservationDetails = async (id: number) => {
    try {
      const data = await getReservationById(id)
      setCurrentReservation(data)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de récupérer les détails de la réservation",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async () => {
    if (!currentReservation) return

    setActionLoading(true)
    try {
      await updateReservationStatus(currentReservation.id, currentReservation.statut)

      toast({
        title: "Succès",
        description: `Statut de la réservation mis à jour avec succès en "${currentReservation.statut}"`,
      })

      fetchReservations()
      setIsEditStatusDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le statut de la réservation",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP")
  }

  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: "id",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "client_name",
      header: "Client",
    },
    {
      accessorKey: "service_name",
      header: "Service",
    },
    {
      accessorKey: "prix",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Prix
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const price = Number.parseFloat(row.getValue("prix"))
        return <div className="font-medium">{formatPrice(price)}</div>
      },
    },
    {
      accessorKey: "date_evenement",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date d'événement
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("date_evenement") as string
        return <div>{formatDate(date)}</div>
      },
    },
    {
      accessorKey: "lieu",
      header: "Lieu",
      cell: ({ row }) => {
        const location = row.getValue("lieu") as string
        if (!location) return <div>-</div>
        return (
          <div
            className={`rounded-full px-2 py-1 text-xs inline-block text-center ${
              location === "intérieur" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
            }`}
          >
            {location}
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
              status === "réservé"
                ? "bg-green-100 text-green-800"
                : status === "en attente"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {status}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const reservation = row.original

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
                  fetchReservationDetails(reservation.id)
                  setIsViewDialogOpen(true)
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentReservation(reservation)
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
        <h1 className="text-3xl font-bold">Réservations</h1>
        <p className="text-muted-foreground">Gérer les réservations de services</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={reservations}
          searchColumn="client_name"
          searchPlaceholder="Rechercher par nom de client..."
        />
      )}

      {/* Voir les détails de la réservation */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Détails de la réservation</DialogTitle>
            <DialogDescription>Réservation #{currentReservation?.id}</DialogDescription>
          </DialogHeader>
          {currentReservation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations client</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <div className="font-medium">Nom</div>
                      <div>{currentReservation.client_name}</div>
                    </div>
                    <div>
                      <div className="font-medium">ID Client</div>
                      <div>{currentReservation.client_id}</div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations service</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <div className="font-medium">Service</div>
                      <div>{currentReservation.service_name}</div>
                    </div>
                    <div>
                      <div className="font-medium">ID Service</div>
                      <div>{currentReservation.service_id.substring(0, 8)}...</div>
                    </div>
                    <div>
                      <div className="font-medium">Prix</div>
                      <div className="font-bold">{formatPrice(currentReservation.prix)}</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Détails de l'événement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium">Date d'événement</div>
                      <div>{formatDate(currentReservation.date_evenement)}</div>
                    </div>
                    <div>
                      <div className="font-medium">Type de lieu</div>
                      <div
                        className={`rounded-full px-2 py-1 text-xs inline-block text-center ${
                          currentReservation.lieu === "intérieur"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {currentReservation.lieu || "-"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium">Adresse</div>
                    <div>{currentReservation.adresse || "-"}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium">Dimension</div>
                      <div>{currentReservation.dimension || "-"}</div>
                    </div>
                    <div>
                      <div className="font-medium">Nombre de personnes</div>
                      <div>{currentReservation.nb_personnes || "-"}</div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="font-medium">Détails</div>
                    <div className="mt-1 text-sm">{currentReservation.details || "-"}</div>
                  </div>

                  <div>
                    <div className="font-medium">Message du client</div>
                    <div className="mt-1 text-sm">{currentReservation.message_client || "-"}</div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Date de réservation</div>
                  <div>{new Date(currentReservation.date_reservation).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">ID Discussion</div>
                  <div>#{currentReservation.discussion_id}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Statut</div>
                  <div
                    className={`rounded-full px-2 py-1 text-xs inline-block text-center ${
                      currentReservation.statut === "réservé"
                        ? "bg-green-100 text-green-800"
                        : currentReservation.statut === "en attente"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentReservation.statut}
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

      {/* Modifier le statut de la réservation */}
      <Dialog open={isEditStatusDialogOpen} onOpenChange={setIsEditStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mettre à jour le statut de la réservation</DialogTitle>
            <DialogDescription>Modifier le statut de la réservation #{currentReservation?.id}</DialogDescription>
          </DialogHeader>
          {currentReservation && (
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Statut actuel</label>
                  <div
                    className={`mt-1 rounded-full px-2 py-1 text-xs inline-block text-center ${
                      currentReservation.statut === "réservé"
                        ? "bg-green-100 text-green-800"
                        : currentReservation.statut === "en attente"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentReservation.statut}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nouveau statut</label>
                  <Select
                    value={currentReservation.statut}
                    onValueChange={(value) => setCurrentReservation({ ...currentReservation, statut: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="réservé">Réservé</SelectItem>
                      <SelectItem value="en attente">En attente</SelectItem>
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

