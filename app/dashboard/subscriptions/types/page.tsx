"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Plus, UserCheck, UserX, UserMinus } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import subscriptionService, { type Subscription, type SubscriptionType } from "@/services/subscriptionService"

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [subscriptionTypes, setSubscriptionTypes] = useState<SubscriptionType[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [newSubscription, setNewSubscription] = useState<Partial<Subscription>>({
    id_client: 0,
    type_abonnement: "",
    frequence: "mensuel",
    adresse_livraison: "",
    disponibilites: "",
    statut: "abonné",
  })
  const [newStatus, setNewStatus] = useState<"abonné" | "résilié" | "suspendu">("abonné")
  const [clients, setClients] = useState<{ id: number; first_name: string; last_name: string; email: string }[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch subscriptions
        const subscriptionsData = await subscriptionService.getAllSubscriptions()
        setSubscriptions(subscriptionsData)

        // Fetch subscription types for the dropdown
        const typesData = await subscriptionService.getAllSubscriptionTypes()
        setSubscriptionTypes(typesData)

        // Fetch clients for the dropdown (assuming you have a userService or similar)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load subscriptions. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const handleAddSubscription = async () => {
    try {
      if (!newSubscription.id_client || !newSubscription.type_abonnement || !newSubscription.frequence) {
        toast({
          title: "Missing information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }

      const createdSubscription = await subscriptionService.createSubscription(newSubscription as Subscription)

      setSubscriptions([...subscriptions, createdSubscription])
      setNewSubscription({
        id_client: 0,
        type_abonnement: "",
        frequence: "mensuel",
        adresse_livraison: "",
        disponibilites: "",
        statut: "abonné",
      })
      setIsAddDialogOpen(false)

      toast({
        title: "Subscription added",
        description: "The subscription has been added successfully.",
      })
    } catch (error) {
      console.error("Error adding subscription:", error)
      toast({
        title: "Error",
        description: "Failed to add subscription. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditSubscription = async () => {
    if (!currentSubscription) return

    try {
      const updatedSubscription = await subscriptionService.updateSubscription(
        currentSubscription.id_abonnement!,
        currentSubscription,
      )

      setSubscriptions(
        subscriptions.map((sub) =>
          sub.id_abonnement === currentSubscription.id_abonnement ? updatedSubscription : sub,
        ),
      )
      setIsEditDialogOpen(false)

      toast({
        title: "Subscription updated",
        description: "The subscription has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating subscription:", error)
      toast({
        title: "Error",
        description: "Failed to update subscription. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSubscription = async () => {
    if (!currentSubscription) return

    try {
      await subscriptionService.deleteSubscription(currentSubscription.id_abonnement!)

      setSubscriptions(subscriptions.filter((sub) => sub.id_abonnement !== currentSubscription.id_abonnement))
      setIsDeleteDialogOpen(false)

      toast({
        title: "Subscription deleted",
        description: "The subscription has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting subscription:", error)
      toast({
        title: "Error",
        description: "Failed to delete subscription. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateStatus = async () => {
    if (!currentSubscription) return

    try {
      const updatedSubscription = await subscriptionService.updateSubscriptionStatus(
        currentSubscription.id_abonnement!,
        newStatus,
      )

      setSubscriptions(
        subscriptions.map((sub) =>
          sub.id_abonnement === currentSubscription.id_abonnement ? updatedSubscription : sub,
        ),
      )
      setIsStatusDialogOpen(false)

      toast({
        title: "Status updated",
        description: `The subscription status has been updated to "${newStatus}".`,
      })
    } catch (error) {
      console.error("Error updating subscription status:", error)
      toast({
        title: "Error",
        description: "Failed to update subscription status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "abonné":
        return "default"
      case "résilié":
        return "destructive"
      case "suspendu":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "abonné":
        return <UserCheck className="mr-2 h-4 w-4" />
      case "résilié":
        return <UserX className="mr-2 h-4 w-4" />
      case "suspendu":
        return <UserMinus className="mr-2 h-4 w-4" />
      default:
        return null
    }
  }

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: fr })
    } catch (error) {
      return dateString
    }
  }

  const getClientName = (clientId: number) => {
    const client = clients.find((c) => c.id === clientId)
    return client ? `${client.first_name} ${client.last_name}` : `Client #${clientId}`
  }

  const getSubscriptionTypeName = (typeId: string) => {
    const type = subscriptionTypes.find((t) => t.nom === typeId)
    return type ? type.nom : typeId
  }

  const columns: ColumnDef<Subscription>[] = [
    {
      accessorKey: "id_abonnement",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("id_abonnement")}</div>,
    },
    {
      accessorKey: "id_client",
      header: "Client",
      cell: ({ row }) => {
        const clientId = row.getValue("id_client") as number
        const client = row.original.client

        return (
          <div>
            {client ? (
              <div>
                <div className="font-medium">
                  {client.first_name} {client.last_name}
                </div>
                <div className="text-sm text-muted-foreground">{client.email}</div>
              </div>
            ) : (
              getClientName(clientId)
            )}
          </div>
        )
      },
    },
    {
      accessorKey: "type_abonnement",
      header: "Subscription Type",
      cell: ({ row }) => {
        const type = row.getValue("type_abonnement") as string
        return <div>{getSubscriptionTypeName(type)}</div>
      },
    },
    {
      accessorKey: "frequence",
      header: "Frequency",
      cell: ({ row }) => {
        const frequency = row.getValue("frequence") as string
        return <div className="capitalize">{frequency}</div>
      },
    },
    {
      accessorKey: "date_souscription",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Subscription Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => formatDate(row.original.date_souscription),
    },
    {
      accessorKey: "date_echeance",
      header: "Expiry Date",
      cell: ({ row }) => formatDate(row.original.date_echeance),
    },
    {
      accessorKey: "statut",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("statut") as string
        return (
          <Badge variant={getStatusBadgeVariant(status) as any} className="flex items-center">
            {getStatusIcon(status)}
            <span className="capitalize">{status}</span>
          </Badge>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const subscription = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setCurrentSubscription(subscription)
                  setIsEditDialogOpen(true)
                }}
              >
                Edit Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentSubscription(subscription)
                  setNewStatus(subscription.statut as "abonné" | "résilié" | "suspendu")
                  setIsStatusDialogOpen(true)
                }}
              >
                Change Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setCurrentSubscription(subscription)
                  setIsDeleteDialogOpen(true)
                }}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscriptions</h1>
          <p className="text-muted-foreground">Manage customer subscriptions</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subscription
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Subscriptions</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <DataTable
            columns={columns}
            data={subscriptions}
            searchColumn="id_client"
            searchPlaceholder="Search by client ID..."
          />
        </TabsContent>
        <TabsContent value="active">
          <DataTable
            columns={columns}
            data={subscriptions.filter((sub) => sub.statut === "abonné")}
            searchColumn="id_client"
            searchPlaceholder="Search by client ID..."
          />
        </TabsContent>
        <TabsContent value="suspended">
          <DataTable
            columns={columns}
            data={subscriptions.filter((sub) => sub.statut === "suspendu")}
            searchColumn="id_client"
            searchPlaceholder="Search by client ID..."
          />
        </TabsContent>
        <TabsContent value="cancelled">
          <DataTable
            columns={columns}
            data={subscriptions.filter((sub) => sub.statut === "résilié")}
            searchColumn="id_client"
            searchPlaceholder="Search by client ID..."
          />
        </TabsContent>
      </Tabs>

      {/* Add Subscription Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Subscription</DialogTitle>
            <DialogDescription>Create a new subscription for a client. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="id_client">Client</Label>
              <Select
                value={newSubscription.id_client?.toString() || ""}
                onValueChange={(value) => setNewSubscription({ ...newSubscription, id_client: Number.parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.first_name} {client.last_name} ({client.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type_abonnement">Subscription Type</Label>
              <Select
                value={newSubscription.type_abonnement || ""}
                onValueChange={(value) => setNewSubscription({ ...newSubscription, type_abonnement: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subscription type" />
                </SelectTrigger>
                <SelectContent>
                  {subscriptionTypes.map((type) => (
                    <SelectItem key={type.id} value={type.nom}>
                      {type.nom} -{" "}
                      {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF" }).format(type.prix)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequence">Frequency</Label>
              <Select
                value={newSubscription.frequence || "mensuel"}
                onValueChange={(value) => setNewSubscription({ ...newSubscription, frequence: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                  <SelectItem value="bihebdomadaire">Bi-hebdomadaire</SelectItem>
                  <SelectItem value="mensuel">Mensuel</SelectItem>
                  <SelectItem value="bimestriel">Bimestriel</SelectItem>
                  <SelectItem value="trimestriel">Trimestriel</SelectItem>
                  <SelectItem value="semestriel">Semestriel</SelectItem>
                  <SelectItem value="annuel">Annuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adresse_livraison">Delivery Address</Label>
              <Textarea
                id="adresse_livraison"
                value={newSubscription.adresse_livraison || ""}
                onChange={(e) => setNewSubscription({ ...newSubscription, adresse_livraison: e.target.value })}
                placeholder="Enter delivery address"
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disponibilites">Availability</Label>
              <Textarea
                id="disponibilites"
                value={newSubscription.disponibilites || ""}
                onChange={(e) => setNewSubscription({ ...newSubscription, disponibilites: e.target.value })}
                placeholder="Enter availability information"
                className="min-h-[80px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dates_ateliers">Workshop Dates</Label>
              <Input
                id="dates_ateliers"
                value={newSubscription.dates_ateliers || ""}
                onChange={(e) => setNewSubscription({ ...newSubscription, dates_ateliers: e.target.value })}
                placeholder="Enter workshop dates if applicable"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="statut">Status</Label>
              <Select
                value={newSubscription.statut || "abonné"}
                onValueChange={(value) =>
                  setNewSubscription({
                    ...newSubscription,
                    statut: value as "abonné" | "résilié" | "suspendu",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="abonné">Abonné</SelectItem>
                  <SelectItem value="suspendu">Suspendu</SelectItem>
                  <SelectItem value="résilié">Résilié</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubscription}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subscription Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>Update subscription details. Click save when you're done.</DialogDescription>
          </DialogHeader>
          {currentSubscription && (
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="edit_id_client">Client</Label>
                <Select
                  value={currentSubscription.id_client?.toString() || ""}
                  onValueChange={(value) =>
                    setCurrentSubscription({
                      ...currentSubscription,
                      id_client: Number.parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.first_name} {client.last_name} ({client.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_type_abonnement">Subscription Type</Label>
                <Select
                  value={currentSubscription.type_abonnement || ""}
                  onValueChange={(value) =>
                    setCurrentSubscription({
                      ...currentSubscription,
                      type_abonnement: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subscription type" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscriptionTypes.map((type) => (
                      <SelectItem key={type.id} value={type.nom}>
                        {type.nom} -{" "}
                        {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XAF" }).format(type.prix)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_frequence">Frequency</Label>
                <Select
                  value={currentSubscription.frequence || "mensuel"}
                  onValueChange={(value) =>
                    setCurrentSubscription({
                      ...currentSubscription,
                      frequence: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                    <SelectItem value="bihebdomadaire">Bi-hebdomadaire</SelectItem>
                    <SelectItem value="mensuel">Mensuel</SelectItem>
                    <SelectItem value="bimestriel">Bimestriel</SelectItem>
                    <SelectItem value="trimestriel">Trimestriel</SelectItem>
                    <SelectItem value="semestriel">Semestriel</SelectItem>
                    <SelectItem value="annuel">Annuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_adresse_livraison">Delivery Address</Label>
                <Textarea
                  id="edit_adresse_livraison"
                  value={currentSubscription.adresse_livraison || ""}
                  onChange={(e) =>
                    setCurrentSubscription({
                      ...currentSubscription,
                      adresse_livraison: e.target.value,
                    })
                  }
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_disponibilites">Availability</Label>
                <Textarea
                  id="edit_disponibilites"
                  value={currentSubscription.disponibilites || ""}
                  onChange={(e) =>
                    setCurrentSubscription({
                      ...currentSubscription,
                      disponibilites: e.target.value,
                    })
                  }
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_dates_ateliers">Workshop Dates</Label>
                <Input
                  id="edit_dates_ateliers"
                  value={currentSubscription.dates_ateliers || ""}
                  onChange={(e) =>
                    setCurrentSubscription({
                      ...currentSubscription,
                      dates_ateliers: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubscription}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Subscription Status</DialogTitle>
            <DialogDescription>Update the status of this subscription.</DialogDescription>
          </DialogHeader>
          {currentSubscription && (
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Current Status:</p>
                  <Badge
                    variant={getStatusBadgeVariant(currentSubscription.statut) as any}
                    className="flex items-center w-fit"
                  >
                    {getStatusIcon(currentSubscription.statut)}
                    <span className="capitalize">{currentSubscription.statut}</span>
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new_status">New Status</Label>
                  <Select
                    value={newStatus}
                    onValueChange={(value) => setNewStatus(value as "abonné" | "résilié" | "suspendu")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abonné">Abonné</SelectItem>
                      <SelectItem value="suspendu">Suspendu</SelectItem>
                      <SelectItem value="résilié">Résilié</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Subscription Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscription? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentSubscription && (
            <div className="py-4">
              <p>You are about to delete the following subscription:</p>
              <div className="mt-2 p-3 bg-muted rounded-md">
                <p>
                  <span className="font-medium">Client:</span>{" "}
                  {currentSubscription.client
                    ? `${currentSubscription.client.first_name} ${currentSubscription.client.last_name}`
                    : getClientName(currentSubscription.id_client)}
                </p>
                <p>
                  <span className="font-medium">Subscription Type:</span>{" "}
                  {getSubscriptionTypeName(currentSubscription.type_abonnement)}
                </p>
                <p>
                  <span className="font-medium">Status:</span> {currentSubscription.statut}
                </p>
                <p>
                  <span className="font-medium">Start Date:</span> {formatDate(currentSubscription.date_souscription)}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubscription}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

