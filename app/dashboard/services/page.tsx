"use client"

import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus, Image, Loader2 } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { 
  getAllServices, 
  createService, 
  updateService, 
  deleteService, 
  updateServiceAvailability, 
  updateServiceFeatured 
} from "@/services/serviceApi"

type Service = {
  id_service: string
  nom: string
  description: string
  categorie: "Mariage" | "Entreprise" | "Espaces commerciaux" | "Jardins"
  images: string[]
  tarification: string
  disponibilite: boolean
  date_ajout: string
  date_modification: string
  mis_en_avant: boolean
  dimension: string
  nb_personnes: number
  lieu: "intérieur" | "extérieur"
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewImagesDialogOpen, setIsViewImagesDialogOpen] = useState(false)
  const [currentService, setCurrentService] = useState<Service | null>(null)
  const [newService, setNewService] = useState<Partial<Service>>({
    nom: "",
    description: "",
    categorie: "Mariage",
    images: [],
    tarification: "",
    disponibilite: true,
    mis_en_avant: false,
    dimension: "",
    nb_personnes: 0,
    lieu: "intérieur",
  })
  const [actionLoading, setActionLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    setIsLoading(true)
    try {
      const response = await getAllServices()
      console.log("✅ Produits récupérés :", response)

      setServices(response.data || [])

            
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de récupérer les services",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddService = async () => {
    if (!newService.nom || !newService.categorie) {
      toast({
        title: "Erreur",
        description: "Le nom et la catégorie du service sont requis",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)
    try {
      await createService({
        nom: newService.nom,
        description: newService.description || "",
        categorie: newService.categorie as "Mariage" | "Entreprise" | "Espaces commerciaux" | "Jardins",
        images: newService.images || [],
        tarification: newService.tarification || "",
        disponibilite: newService.disponibilite !== undefined ? newService.disponibilite : true,
        dimension: newService.dimension || "",
        nb_personnes: newService.nb_personnes || 0,
        lieu: newService.lieu as "intérieur" | "extérieur" || "intérieur",
        mis_en_avant: newService.mis_en_avant || false,
      })

      toast({
        title: "Succès",
        description: "Service ajouté avec succès",
      })

      fetchServices()
      setIsAddDialogOpen(false)
      setNewService({
        nom: "",
        description: "",
        categorie: "Mariage",
        images: [],
        tarification: "",
        disponibilite: true,
        mis_en_avant: false,
        dimension: "",
        nb_personnes: 0,
        lieu: "intérieur",
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le service",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditService = async () => {
    if (!currentService) return

    setActionLoading(true)
    try {
      await updateService(currentService.id_service, {
        nom: currentService.nom,
        description: currentService.description,
        categorie: currentService.categorie,
        images: currentService.images,
        tarification: currentService.tarification,
        disponibilite: currentService.disponibilite,
        dimension: currentService.dimension,
        nb_personnes: currentService.nb_personnes,
        lieu: currentService.lieu,
        mis_en_avant: currentService.mis_en_avant,
      })

      toast({
        title: "Succès",
        description: "Service mis à jour avec succès",
      })

      fetchServices()
      setIsEditDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le service",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteService = async () => {
    if (!currentService) return

    setActionLoading(true)
    try {
      await deleteService(currentService.id_service)

      toast({
        title: "Succès",
        description: "Service supprimé avec succès",
      })

      fetchServices()
      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le service",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const columns: ColumnDef<Service>[] = [
    {
      accessorKey: "id_service",
      header: "ID",
      cell: ({ row }) => {
        const id = row.getValue("id_service") as string
        return <div className="font-medium">{id.substring(0, 8)}...</div>
      },
    },
    {
      accessorKey: "nom",
      header: "Nom",
    },
    {
      accessorKey: "categorie",
      header: "Catégorie",
      cell: ({ row }) => {
        const category = row.getValue("categorie") as string
        return (
          <div
            className={`rounded-full px-2 py-1 text-xs inline-block text-center ${
              category === "Mariage"
                ? "bg-pink-100 text-pink-800"
                : category === "Entreprise"
                  ? "bg-blue-100 text-blue-800"
                  : category === "Espaces commerciaux"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-green-100 text-green-800"
            }`}
          >
            {category}
          </div>
        )
      },
    },
    {
      accessorKey: "tarification",
      header: "Tarification",
    },
    {
      accessorKey: "disponibilite",
      header: "Disponibilité",
      cell: ({ row }) => {
        const available = row.getValue("disponibilite") as boolean
        return (
          <div
            className={`rounded-full px-2 py-1 text-xs inline-block text-center ${
              available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {available ? "Disponible" : "Indisponible"}
          </div>
        )
      },
    },
    {
      accessorKey: "lieu",
      header: "Lieu",
      cell: ({ row }) => {
        const location = row.getValue("lieu") as string
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
      accessorKey: "mis_en_avant",
      header: "Mis en avant",
      cell: ({ row }) => {
        const featured = row.getValue("mis_en_avant") as boolean
        return (
          <div
            className={`rounded-full px-2 py-1 text-xs inline-block text-center ${
              featured ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {featured ? "Oui" : "Non"}
          </div>
        )
      },
    },
    {
      accessorKey: "images",
      header: "Images",
      cell: ({ row }) => {
        const images = row.getValue("images") as string[]
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentService(row.original)
              setIsViewImagesDialogOpen(true)
            }}
          >
            <Image className="mr-2 h-4 w-4" />
            Voir ({images.length})
          </Button>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const service = row.original

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
                  setCurrentService(service)
                  setIsEditDialogOpen(true)
                }}
              >
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentService(service)
                  setIsDeleteDialogOpen(true)
                }}
                className="text-red-600"
              >
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">Gérer vos offres de services</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un service
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={services}
          searchColumn="nom"
          searchPlaceholder="Rechercher par nom de service..."
        />
      )}

      {/* Ajouter un service */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau service</DialogTitle>
            <DialogDescription>
              Créer une nouvelle offre de service. Cliquez sur enregistrer lorsque vous avez terminé.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du service</Label>
              <Input
                id="nom"
                value={newService.nom}
                onChange={(e) => setNewService({ ...newService, nom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newService.description}
                onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categorie">Catégorie</Label>
                <Select
                  value={newService.categorie}
                  onValueChange={(value) => setNewService({ ...newService, categorie: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mariage">Mariage</SelectItem>
                    <SelectItem value="Entreprise">Entreprise</SelectItem>
                    <SelectItem value="Espaces commerciaux">Espaces commerciaux</SelectItem>
                    <SelectItem value="Jardins">Jardins</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tarification">Tarification</Label>
                <Input
                  id="tarification"
                  value={newService.tarification}
                  onChange={(e) => setNewService({ ...newService, tarification: e.target.value })}
                  placeholder="ex: 'À partir de 150,000 XAF' ou 'Sur devis'"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dimension">Dimension</Label>
                <Input
                  id="dimension"
                  value={newService.dimension}
                  onChange={(e) => setNewService({ ...newService, dimension: e.target.value })}
                  placeholder="ex: 'Grande salle' ou '50m²'"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nb_personnes">Nombre de personnes</Label>
                <Input
                  id="nb_personnes"
                  type="number"
                  value={newService.nb_personnes}
                  onChange={(e) => setNewService({ ...newService, nb_personnes: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lieu">Lieu</Label>
              <Select
                value={newService.lieu}
                onValueChange={(value) => setNewService({ ...newService, lieu: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un lieu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intérieur">Intérieur</SelectItem>
                  <SelectItem value="extérieur">Extérieur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="disponibilite"
                checked={newService.disponibilite}
                onCheckedChange={(checked) => setNewService({ ...newService, disponibilite: checked as boolean })}
              />
              <Label htmlFor="disponibilite">Disponible</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mis_en_avant"
                checked={newService.mis_en_avant}
                onCheckedChange={(checked) => setNewService({ ...newService, mis_en_avant: checked as boolean })}
              />
              <Label htmlFor="mis_en_avant">Service mis en avant</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="images">Images (URLs, séparées par des virgules)</Label>
              <Textarea
                id="images"
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                value={newService.images?.join(", ") || ""}
                onChange={(e) =>
                  setNewService({ ...newService, images: e.target.value.split(",").map((url) => url.trim()) })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={actionLoading}>
              Annuler
            </Button>
            <Button onClick={handleAddService} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modifier un service */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier le service</DialogTitle>
            <DialogDescription>
              Mettre à jour les informations du service. Cliquez sur enregistrer lorsque vous avez terminé.
            </DialogDescription>
          </DialogHeader>
          {currentService && (
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="edit_nom">Nom du service</Label>
                <Input
                  id="edit_nom"
                  value={currentService.nom}
                  onChange={(e) => setCurrentService({ ...currentService, nom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  value={currentService.description}
                  onChange={(e) => setCurrentService({ ...currentService, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_categorie">Catégorie</Label>
                  <Select
                    value={currentService.categorie}
                    onValueChange={(value) => setCurrentService({ ...currentService, categorie: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mariage">Mariage</SelectItem>
                      <SelectItem value="Entreprise">Entreprise</SelectItem>
                      <SelectItem value="Espaces commerciaux">Espaces commerciaux</SelectItem>
                      <SelectItem value="Jardins">Jardins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_tarification">Tarification</Label>
                  <Input
                    id="edit_tarification"
                    value={currentService.tarification}
                    onChange={(e) => setCurrentService({ ...currentService, tarification: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_dimension">Dimension</Label>
                  <Input
                    id="edit_dimension"
                    value={currentService.dimension}
                    onChange={(e) => setCurrentService({ ...currentService, dimension: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_nb_personnes">Nombre de personnes</Label>
                  <Input
                    id="edit_nb_personnes"
                    type="number"
                    value={currentService.nb_personnes}
                    onChange={(e) =>
                      setCurrentService({ ...currentService, nb_personnes: Number.parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_lieu">Lieu</Label>
                <Select
                  value={currentService.lieu}
                  onValueChange={(value) => setCurrentService({ ...currentService, lieu: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un lieu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intérieur">Intérieur</SelectItem>
                    <SelectItem value="extérieur">Extérieur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_disponibilite"
                  checked={currentService.disponibilite}
                  onCheckedChange={(checked) =>
                    setCurrentService({ ...currentService, disponibilite: checked as boolean })
                  }
                />
                <Label htmlFor="edit_disponibilite">Disponible</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_mis_en_avant"
                  checked={currentService.mis_en_avant}
                  onCheckedChange={(checked) =>
                    setCurrentService({ ...currentService, mis_en_avant: checked as boolean })
                  }
                />
                <Label htmlFor="edit_mis_en_avant">Service mis en avant</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_images">Images (URLs, séparées par des virgules)</Label>
                <Textarea
                  id="edit_images"
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  value={currentService.images.join(", ")}
                  onChange={(e) =>
                    setCurrentService({ ...currentService, images: e.target.value.split(",").map((url) => url.trim()) })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={actionLoading}>
              Annuler
            </Button>
            <Button onClick={handleEditService} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supprimer un service */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer le service</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce service ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          {currentService && (
            <div className="py-4">
              <p>
                Vous êtes sur le point de supprimer le service : <strong>{currentService.nom}</strong> (ID:{" "}
                {currentService.id_service.substring(0, 8)}...)
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={actionLoading}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteService} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Voir les images */}
      <Dialog open={isViewImagesDialogOpen} onOpenChange={setIsViewImagesDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Images du service</DialogTitle>
            <DialogDescription>
              {currentService?.nom} - {currentService?.images.length} images
            </DialogDescription>
          </DialogHeader>
          {currentService && (
            <div className="grid grid-cols-2 gap-4 py-4">
              {currentService.images.map((image, index) => (
                <div key={index} className="overflow-hidden rounded-md border">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${currentService.nom} - Image ${index + 1}`}
                    className="h-48 w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewImagesDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
