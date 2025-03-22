"use client"

import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, MessageCircle, Check, Loader2 } from "lucide-react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { format } from "date-fns"
import { getAllDiscussions, getDiscussionById, respondToDiscussion, type Discussion } from "@/services/discussionApi"

export default function DiscussionsPage() {
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isRespondDialogOpen, setIsRespondDialogOpen] = useState(false)
  const [currentDiscussion, setCurrentDiscussion] = useState<Discussion | null>(null)
  const [adminResponse, setAdminResponse] = useState<string>("")
  const [actionLoading, setActionLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDiscussions()
  }, [])

  const fetchDiscussions = async () => {
    setIsLoading(true)
    try {
      const data = await getAllDiscussions()
      setDiscussions(data)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de récupérer les discussions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDiscussionDetails = async (id: number) => {
    try {
      const data = await getDiscussionById(id)
      setCurrentDiscussion(data)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de récupérer les détails de la discussion",
        variant: "destructive",
      })
    }
  }

  const handleRespond = async () => {
    if (!currentDiscussion || !adminResponse) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un prix de réponse",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)
    try {
      await respondToDiscussion(currentDiscussion.id, Number.parseFloat(adminResponse))

      toast({
        title: "Succès",
        description: `Votre proposition de prix de ${formatPrice(Number.parseFloat(adminResponse))} a été envoyée au client.`,
      })

      fetchDiscussions()
      setIsRespondDialogOpen(false)
      setAdminResponse("")
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer la réponse",
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return format(new Date(dateString), "PPP")
  }

  const columns: ColumnDef<Discussion>[] = [
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
      accessorKey: "prix_propose",
      header: "Prix proposé",
      cell: ({ row }) => {
        const price = Number.parseFloat(row.getValue("prix_propose"))
        return <div>{formatPrice(price)}</div>
      },
    },
    {
      accessorKey: "reponse_admin",
      header: "Réponse admin",
      cell: ({ row }) => {
        const price = row.getValue("reponse_admin") as number | null
        return <div>{price ? formatPrice(price) : "-"}</div>
      },
    },
    {
      accessorKey: "date_evenement",
      header: "Date d'événement",
      cell: ({ row }) => {
        const date = row.getValue("date_evenement") as string | null
        return <div>{formatDate(date)}</div>
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
              status === "réponse_client"
                ? "bg-yellow-100 text-yellow-800"
                : status === "réponse_admin"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-green-100 text-green-800"
            }`}
          >
            {status === "réponse_client"
              ? "En attente de réponse"
              : status === "réponse_admin"
                ? "Réponse envoyée"
                : "Finalisé"}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const discussion = row.original

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
                  fetchDiscussionDetails(discussion.id)
                  setIsViewDialogOpen(true)
                }}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Voir les détails
              </DropdownMenuItem>
              {discussion.statut === "réponse_client" && (
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentDiscussion(discussion)
                    setIsRespondDialogOpen(true)
                  }}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Répondre
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Discussions de devis</h1>
        <p className="text-muted-foreground">Gérer les demandes de devis et les discussions avec les clients</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={discussions}
          searchColumn="client_name"
          searchPlaceholder="Rechercher par nom de client..."
        />
      )}

      {/* Voir les détails de la discussion */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Détails de la discussion</DialogTitle>
            <DialogDescription>Discussion #{currentDiscussion?.id}</DialogDescription>
          </DialogHeader>
          {currentDiscussion && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations client</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <div className="font-medium">Nom</div>
                      <div>{currentDiscussion.client_name}</div>
                    </div>
                    <div>
                      <div className="font-medium">ID Client</div>
                      <div>{currentDiscussion.client_id}</div>
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
                      <div>{currentDiscussion.service_name}</div>
                    </div>
                    <div>
                      <div className="font-medium">ID Service</div>
                      <div>{currentDiscussion.service_id.substring(0, 8)}...</div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Détails du devis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium">Prix proposé par le client</div>
                      <div className="text-lg font-bold">{formatPrice(currentDiscussion.prix_propose)}</div>
                    </div>
                    <div>
                      <div className="font-medium">Réponse de l'administrateur</div>
                      <div className="text-lg font-bold">
                        {currentDiscussion.reponse_admin ? (
                          formatPrice(currentDiscussion.reponse_admin)
                        ) : (
                          <span className="text-yellow-600">En attente de réponse</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium">Date d'événement</div>
                      <div>{formatDate(currentDiscussion.date_evenement)}</div>
                    </div>
                    <div>
                      <div className="font-medium">Type de lieu</div>
                      <div
                        className={`rounded-full px-2 py-1 text-xs inline-block text-center ${
                          currentDiscussion.lieu === "intérieur"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {currentDiscussion.lieu}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium">Adresse</div>
                    <div>{currentDiscussion.adresse || "-"}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium">Dimension</div>
                      <div>{currentDiscussion.dimension}</div>
                    </div>
                    <div>
                      <div className="font-medium">Nombre de personnes</div>
                      <div>{currentDiscussion.nb_personnes}</div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <div className="font-medium">Détails</div>
                    <div className="mt-1 text-sm">{currentDiscussion.details || "-"}</div>
                  </div>

                  <div>
                    <div className="font-medium">Message du client</div>
                    <div className="mt-1 text-sm">{currentDiscussion.message_client || "-"}</div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Créé le</div>
                  <div>{new Date(currentDiscussion.date_creation).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Statut</div>
                  <div
                    className={`rounded-full px-2 py-1 text-xs inline-block text-center ${
                      currentDiscussion.statut === "réponse_client"
                        ? "bg-yellow-100 text-yellow-800"
                        : currentDiscussion.statut === "réponse_admin"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {currentDiscussion.statut === "réponse_client"
                      ? "En attente de réponse"
                      : currentDiscussion.statut === "réponse_admin"
                        ? "Réponse envoyée"
                        : "Finalisé"}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {currentDiscussion && currentDiscussion.statut === "réponse_client" && (
              <Button
                onClick={() => {
                  setIsViewDialogOpen(false)
                  setIsRespondDialogOpen(true)
                }}
              >
                Répondre au devis
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Répondre au devis */}
      <Dialog open={isRespondDialogOpen} onOpenChange={setIsRespondDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Répondre à la demande de devis</DialogTitle>
            <DialogDescription>Proposez votre prix pour cette demande de service.</DialogDescription>
          </DialogHeader>
          {currentDiscussion && (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <div className="font-medium">Client</div>
                <div>{currentDiscussion.client_name}</div>
              </div>

              <div className="space-y-2">
                <div className="font-medium">Service</div>
                <div>{currentDiscussion.service_name}</div>
              </div>

              <div className="space-y-2">
                <div className="font-medium">Prix proposé par le client</div>
                <div className="text-lg font-bold">{formatPrice(currentDiscussion.prix_propose)}</div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="admin_response">Votre prix (XAF)</Label>
                <Input
                  id="admin_response"
                  type="number"
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  placeholder="Entrez votre prix"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRespondDialogOpen(false)} disabled={actionLoading}>
              Annuler
            </Button>
            <Button onClick={handleRespond} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                "Envoyer la réponse"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

