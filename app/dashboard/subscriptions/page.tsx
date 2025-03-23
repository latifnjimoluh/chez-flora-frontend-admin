"use client"

import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Plus, Eye, Check, Trash2 } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import subscriptionService, { type SubscriptionType, type SubscriptionFeature } from "@/services/subscriptionService"

const frequencyOptions = [
  { value: "hebdomadaire", label: "Hebdomadaire" },
  { value: "bihebdomadaire", label: "Bi-hebdomadaire" },
  { value: "mensuel", label: "Mensuel" },
  { value: "bimestriel", label: "Bimestriel" },
  { value: "trimestriel", label: "Trimestriel" },
  { value: "semestriel", label: "Semestriel" },
  { value: "annuel", label: "Annuel" },
]

export default function SubscriptionTypesPage() {
  const [subscriptionTypes, setSubscriptionTypes] = useState<SubscriptionType[]>([])
  const [features, setFeatures] = useState<SubscriptionFeature[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewFeaturesDialogOpen, setIsViewFeaturesDialogOpen] = useState(false)
  const [isEditFeaturesDialogOpen, setIsEditFeaturesDialogOpen] = useState(false)
  const [currentSubscriptionType, setCurrentSubscriptionType] = useState<SubscriptionType | null>(null)
  const [newSubscriptionType, setNewSubscriptionType] = useState<Partial<SubscriptionType>>({
    nom: "",
    description: "",
    prix: 0,
    frequence: "mensuel",
    duree_engagement: 1,
    image_url: null,
    est_populaire: false,
    est_actif: true,
  })
  const [newFeature, setNewFeature] = useState<string>("")
  const [currentFeatures, setCurrentFeatures] = useState<SubscriptionFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchSubscriptionTypes()
  }, [])

  const fetchSubscriptionTypes = async () => {
    try {
      setLoading(true)
      setError(null)
      const types = await subscriptionService.getAllSubscriptionTypes()
      setSubscriptionTypes(types)

      // Fetch features for each subscription type
      const allFeatures: SubscriptionFeature[] = []
      for (const type of types) {
        if (type.id) {
          const typeFeatures = await subscriptionService.getFeaturesByTypeId(type.id)
          allFeatures.push(...typeFeatures)

          // Add features to the subscription type
          type.caracteristiques = typeFeatures
        }
      }
      setFeatures(allFeatures)
    } catch (err: any) {
      setError(err.message || "Failed to fetch subscription types")
      toast({
        title: "Error",
        description: err.message || "Failed to fetch subscription types",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubscriptionType = async () => {
    try {
      const newType = await subscriptionService.createSubscriptionType(newSubscriptionType as SubscriptionType)

      setSubscriptionTypes([...subscriptionTypes, newType])
      setNewSubscriptionType({
        nom: "",
        description: "",
        prix: 0,
        frequence: "mensuel",
        duree_engagement: 1,
        image_url: null,
        est_populaire: false,
        est_actif: true,
      })
      setIsAddDialogOpen(false)

      toast({
        title: "Subscription type added",
        description: `"${newType.nom}" has been added successfully.`,
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to add subscription type",
        variant: "destructive",
      })
    }
  }

  const handleEditSubscriptionType = async () => {
    if (!currentSubscriptionType || !currentSubscriptionType.id) return

    try {
      const updatedType = await subscriptionService.updateSubscriptionType(
        currentSubscriptionType.id,
        currentSubscriptionType,
      )

      setSubscriptionTypes(
        subscriptionTypes.map((type) => (type.id === currentSubscriptionType.id ? updatedType : type)),
      )
      setIsEditDialogOpen(false)

      toast({
        title: "Subscription type updated",
        description: `"${currentSubscriptionType.nom}" has been updated successfully.`,
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update subscription type",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSubscriptionType = async () => {
    if (!currentSubscriptionType || !currentSubscriptionType.id) return

    try {
      await subscriptionService.deleteSubscriptionType(currentSubscriptionType.id)

      setSubscriptionTypes(subscriptionTypes.filter((type) => type.id !== currentSubscriptionType.id))
      // Also remove associated features
      setFeatures(features.filter((feature) => feature.type_abonnement_id !== currentSubscriptionType.id))
      setIsDeleteDialogOpen(false)

      toast({
        title: "Subscription type deleted",
        description: `"${currentSubscriptionType.nom}" has been deleted successfully.`,
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to delete subscription type",
        variant: "destructive",
      })
    }
  }

  const togglePopular = async (id: number) => {
    try {
      const subscriptionType = subscriptionTypes.find((t) => t.id === id)
      if (!subscriptionType) return

      const isPopular = !subscriptionType.est_populaire

      // If setting a new type as popular, first unset any current popular one
      if (isPopular) {
        const currentPopular = subscriptionTypes.find((t) => t.est_populaire && t.id !== id)
        if (currentPopular && currentPopular.id) {
          await subscriptionService.toggleSubscriptionTypePopular(currentPopular.id, false)
        }
      }

      const updatedType = await subscriptionService.toggleSubscriptionTypePopular(id, isPopular)

      setSubscriptionTypes(
        subscriptionTypes.map((type) => {
          if (type.id === id) {
            return updatedType
          } else if (isPopular && type.est_populaire) {
            // If setting a new type as popular, unset the current popular one
            return { ...type, est_populaire: false }
          }
          return type
        }),
      )

      toast({
        title: isPopular ? "Marked as popular" : "No longer popular",
        description: `"${subscriptionType.nom}" has been ${isPopular ? "set as" : "removed from"} the popular subscription.`,
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update popular status",
        variant: "destructive",
      })
    }
  }

  const toggleActive = async (id: number) => {
    try {
      const subscriptionType = subscriptionTypes.find((t) => t.id === id)
      if (!subscriptionType) return

      const isActive = !subscriptionType.est_actif
      const updatedType = await subscriptionService.toggleSubscriptionTypeStatus(id, isActive)

      setSubscriptionTypes(subscriptionTypes.map((type) => (type.id === id ? updatedType : type)))

      toast({
        title: isActive ? "Activated" : "Deactivated",
        description: `"${subscriptionType.nom}" has been ${isActive ? "activated" : "deactivated"}.`,
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to update active status",
        variant: "destructive",
      })
    }
  }

  const handleAddFeature = async () => {
    if (!currentSubscriptionType || !currentSubscriptionType.id || !newFeature.trim()) return

    try {
      const feature: Partial<SubscriptionFeature> = {
        type_abonnement_id: currentSubscriptionType.id,
        description: newFeature,
      }

      const addedFeature = await subscriptionService.addFeature(feature as SubscriptionFeature)

      setFeatures([...features, addedFeature])

      // Update the current features list for the UI
      setCurrentFeatures([...currentFeatures, addedFeature])

      // Also update the subscription type's features
      const updatedSubscriptionType = {
        ...currentSubscriptionType,
        caracteristiques: [...(currentSubscriptionType.caracteristiques || []), addedFeature],
      }

      setSubscriptionTypes(
        subscriptionTypes.map((type) => (type.id === currentSubscriptionType.id ? updatedSubscriptionType : type)),
      )

      setCurrentSubscriptionType(updatedSubscriptionType)
      setNewFeature("")

      toast({
        title: "Feature added",
        description: "The feature has been added successfully.",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to add feature",
        variant: "destructive",
      })
    }
  }

  const handleRemoveFeature = async (featureId: number) => {
    if (!currentSubscriptionType || !currentSubscriptionType.id) return

    try {
      await subscriptionService.deleteFeature(featureId)

      // Remove from features list
      setFeatures(features.filter((f) => f.id !== featureId))

      // Remove from current features list
      setCurrentFeatures(currentFeatures.filter((f) => f.id !== featureId))

      // Update the subscription type's features
      const updatedSubscriptionType = {
        ...currentSubscriptionType,
        caracteristiques: (currentSubscriptionType.caracteristiques || []).filter((f) => f.id !== featureId),
      }

      setSubscriptionTypes(
        subscriptionTypes.map((type) => (type.id === currentSubscriptionType.id ? updatedSubscriptionType : type)),
      )

      setCurrentSubscriptionType(updatedSubscriptionType)

      toast({
        title: "Feature removed",
        description: "The feature has been removed successfully.",
      })
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to remove feature",
        variant: "destructive",
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XAF",
    }).format(price)
  }

  const columns: ColumnDef<SubscriptionType>[] = [
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
      accessorKey: "nom",
      header: "Name",
      cell: ({ row }) => {
        const name = row.getValue("nom") as string
        const isPopular = row.original.est_populaire
        return (
          <div className="flex items-center space-x-2">
            <span className="font-medium">{name}</span>
            {isPopular && <Badge className="bg-amber-100 text-amber-800">Popular</Badge>}
          </div>
        )
      },
    },
    {
      accessorKey: "prix",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const price = Number.parseFloat(row.getValue("prix"))
        return <div>{formatPrice(price)}</div>
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
      accessorKey: "duree_engagement",
      header: "Commitment",
      cell: ({ row }) => {
        const months = Number.parseInt(row.getValue("duree_engagement"))
        return (
          <div>
            {months} {months === 1 ? "month" : "months"}
          </div>
        )
      },
    },
    {
      id: "features",
      header: "Features",
      cell: ({ row }) => {
        const subscriptionType = row.original
        const featureCount = subscriptionType.caracteristiques?.length || 0

        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentSubscriptionType(subscriptionType)
              setCurrentFeatures(subscriptionType.caracteristiques || [])
              setIsViewFeaturesDialogOpen(true)
            }}
          >
            <Eye className="mr-2 h-4 w-4" />
            View ({featureCount})
          </Button>
        )
      },
    },
    {
      accessorKey: "est_actif",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("est_actif") as boolean
        return <Badge variant={isActive ? "default" : "outline"}>{isActive ? "Active" : "Inactive"}</Badge>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const subscriptionType = row.original

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
                  setCurrentSubscriptionType(subscriptionType)
                  setIsEditDialogOpen(true)
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentSubscriptionType(subscriptionType)
                  setCurrentFeatures(subscriptionType.caracteristiques || [])
                  setIsEditFeaturesDialogOpen(true)
                }}
              >
                Edit Features
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => togglePopular(subscriptionType.id || 0)}>
                {subscriptionType.est_populaire ? "Remove Popular Badge" : "Mark as Popular"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleActive(subscriptionType.id || 0)}>
                {subscriptionType.est_actif ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentSubscriptionType(subscriptionType)
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={fetchSubscriptionTypes}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Types</h1>
          <p className="text-muted-foreground">Manage subscription plans and features</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subscription Type
        </Button>
      </div>

      <DataTable columns={columns} data={subscriptionTypes} searchColumn="nom" searchPlaceholder="Search by name..." />

      {/* Add Subscription Type Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Subscription Type</DialogTitle>
            <DialogDescription>Create a new subscription plan. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="nom">Name</Label>
              <Input
                id="nom"
                value={newSubscriptionType.nom}
                onChange={(e) => setNewSubscriptionType({ ...newSubscriptionType, nom: e.target.value })}
                placeholder="e.g. 'Abonnement Floral Mensuel'"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newSubscriptionType.description}
                onChange={(e) => setNewSubscriptionType({ ...newSubscriptionType, description: e.target.value })}
                placeholder="Brief description of the subscription"
                className="min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prix">Price (XAF)</Label>
                <Input
                  id="prix"
                  type="number"
                  step="0.01"
                  value={newSubscriptionType.prix}
                  onChange={(e) =>
                    setNewSubscriptionType({ ...newSubscriptionType, prix: Number.parseFloat(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="frequence">Frequency</Label>
                <Select
                  value={newSubscriptionType.frequence}
                  onValueChange={(value) => setNewSubscriptionType({ ...newSubscriptionType, frequence: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duree_engagement">Commitment Period (months)</Label>
                <Input
                  id="duree_engagement"
                  type="number"
                  min="1"
                  value={newSubscriptionType.duree_engagement}
                  onChange={(e) =>
                    setNewSubscriptionType({
                      ...newSubscriptionType,
                      duree_engagement: Number.parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={newSubscriptionType.image_url || ""}
                  onChange={(e) => setNewSubscriptionType({ ...newSubscriptionType, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="est_populaire"
                checked={newSubscriptionType.est_populaire}
                onCheckedChange={(checked) =>
                  setNewSubscriptionType({ ...newSubscriptionType, est_populaire: checked as boolean })
                }
              />
              <Label htmlFor="est_populaire">Mark as Popular</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="est_actif"
                checked={newSubscriptionType.est_actif}
                onCheckedChange={(checked) =>
                  setNewSubscriptionType({ ...newSubscriptionType, est_actif: checked as boolean })
                }
              />
              <Label htmlFor="est_actif">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubscriptionType}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Subscription Type Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Subscription Type</DialogTitle>
            <DialogDescription>Update subscription plan information. Click save when you're done.</DialogDescription>
          </DialogHeader>
          {currentSubscriptionType && (
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="edit_nom">Name</Label>
                <Input
                  id="edit_nom"
                  value={currentSubscriptionType.nom}
                  onChange={(e) => setCurrentSubscriptionType({ ...currentSubscriptionType, nom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  value={currentSubscriptionType.description}
                  onChange={(e) =>
                    setCurrentSubscriptionType({ ...currentSubscriptionType, description: e.target.value })
                  }
                  className="min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_prix">Price (XAF)</Label>
                  <Input
                    id="edit_prix"
                    type="number"
                    step="0.01"
                    value={currentSubscriptionType.prix}
                    onChange={(e) =>
                      setCurrentSubscriptionType({
                        ...currentSubscriptionType,
                        prix: Number.parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_frequence">Frequency</Label>
                  <Select
                    value={currentSubscriptionType.frequence}
                    onValueChange={(value) =>
                      setCurrentSubscriptionType({ ...currentSubscriptionType, frequence: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_duree_engagement">Commitment Period (months)</Label>
                  <Input
                    id="edit_duree_engagement"
                    type="number"
                    min="1"
                    value={currentSubscriptionType.duree_engagement}
                    onChange={(e) =>
                      setCurrentSubscriptionType({
                        ...currentSubscriptionType,
                        duree_engagement: Number.parseInt(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_image_url">Image URL</Label>
                  <Input
                    id="edit_image_url"
                    value={currentSubscriptionType.image_url || ""}
                    onChange={(e) =>
                      setCurrentSubscriptionType({ ...currentSubscriptionType, image_url: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_est_populaire"
                  checked={currentSubscriptionType.est_populaire}
                  onCheckedChange={(checked) =>
                    setCurrentSubscriptionType({ ...currentSubscriptionType, est_populaire: checked as boolean })
                  }
                />
                <Label htmlFor="edit_est_populaire">Mark as Popular</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_est_actif"
                  checked={currentSubscriptionType.est_actif}
                  onCheckedChange={(checked) =>
                    setCurrentSubscriptionType({ ...currentSubscriptionType, est_actif: checked as boolean })
                  }
                />
                <Label htmlFor="edit_est_actif">Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubscriptionType}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Features Dialog */}
      <Dialog open={isViewFeaturesDialogOpen} onOpenChange={setIsViewFeaturesDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Subscription Features</DialogTitle>
            <DialogDescription>Features for {currentSubscriptionType?.nom}</DialogDescription>
          </DialogHeader>
          {currentSubscriptionType && (
            <div className="py-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {currentFeatures.length > 0 ? (
                      currentFeatures.map((feature) => (
                        <li key={feature.id} className="flex items-center">
                          <Check className="mr-2 h-4 w-4 text-green-500" />
                          {feature.description}
                        </li>
                      ))
                    ) : (
                      <li className="text-muted-foreground">No features defined yet.</li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                setIsViewFeaturesDialogOpen(false)
                setIsEditFeaturesDialogOpen(true)
              }}
            >
              Edit Features
            </Button>
            <Button variant="outline" onClick={() => setIsViewFeaturesDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Features Dialog */}
      <Dialog open={isEditFeaturesDialogOpen} onOpenChange={setIsEditFeaturesDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Subscription Features</DialogTitle>
            <DialogDescription>Manage features for {currentSubscriptionType?.nom}</DialogDescription>
          </DialogHeader>
          {currentSubscriptionType && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="new_feature">Add New Feature</Label>
                <div className="flex space-x-2">
                  <Input
                    id="new_feature"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    placeholder="e.g. 'Livraison gratuite à domicile'"
                    className="flex-1"
                  />
                  <Button onClick={handleAddFeature}>Add</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Current Features</Label>
                <Card>
                  <CardContent className="p-4">
                    {currentFeatures.length > 0 ? (
                      <ul className="space-y-2">
                        {currentFeatures.map((feature) => (
                          <li key={feature.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Check className="mr-2 h-4 w-4 text-green-500" />
                              {feature.description}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFeature(feature.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">No features defined yet.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditFeaturesDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Subscription Type Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Subscription Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscription type? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentSubscriptionType && (
            <div className="py-4">
              <p>You are about to delete the following subscription type:</p>
              <p className="mt-2 font-medium">{currentSubscriptionType.nom}</p>
              <p className="mt-2 text-sm text-muted-foreground">This will also delete all associated features.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubscriptionType}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

