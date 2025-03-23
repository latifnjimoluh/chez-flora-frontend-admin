"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Plus, Image, Loader2, Upload, X } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { getAllProducts, createProduct, updateProduct, deleteProduct } from "@/services/productApi"
import { getAllCategories } from "@/services/categoryApi"
import { uploadMultipleImagesToCloudinary } from "@/services/cloudinaryService"
import { uploadMultipleImagesByType } from "@/services/cloudinaryService";

type Product = {
  id_produit: string
  nom: string
  description: string
  categorie: string
  images: string[]
  prix: number
  stock: number
  dimensions: string | null
  poids: number | null
  options_personnalisation: string | null
  etat: "Disponible" | "Indisponible"
  date_ajout: string
  date_modification: string
  mis_en_avant: boolean
  statut: "Disponible" | "Rupture de stock" | "Deleted"
}

type Category = {
  id: number
  nom: string
  description: string | null
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewImagesDialogOpen, setIsViewImagesDialogOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    nom: "",
    description: "",
    categorie: "",
    images: [],
    prix: 0,
    stock: 0,
    dimensions: "",
    poids: 0,
    options_personnalisation: "",
    etat: "Disponible",
    mis_en_avant: false,
    statut: "Disponible",
  })
  const [actionLoading, setActionLoading] = useState(false)
  const { toast } = useToast()

  // Références pour les input file
  const addImageInputRef = useRef<HTMLInputElement>(null)
  const editImageInputRef = useRef<HTMLInputElement>(null)

  // États pour les images sélectionnées
  const [selectedAddImages, setSelectedAddImages] = useState<File[]>([])
  const [selectedEditImages, setSelectedEditImages] = useState<File[]>([])
  const [previewAddImages, setPreviewAddImages] = useState<string[]>([])
  const [previewEditImages, setPreviewEditImages] = useState<string[]>([])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    setIsLoading(true)
    try {
      const response = await getAllProducts()
      console.log("✅ Produits récupérés :", response)

      setProducts(response.data || [])
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de récupérer les produits",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories()
      setCategories(data)

      // Si c'est le premier chargement, définir la catégorie par défaut
      if (newProduct.categorie === "" && data.length > 0) {
        setNewProduct((prev) => ({ ...prev, categorie: data[0].nom }))
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de récupérer les catégories",
        variant: "destructive",
      })
    }
  }

  const handleAddImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    setSelectedAddImages((prev) => [...prev, ...newFiles])

    // Générer des aperçus pour les nouvelles images
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
    setPreviewAddImages((prev) => [...prev, ...newPreviews])
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles = Array.from(files)
    setSelectedEditImages((prev) => [...prev, ...newFiles])

    // Générer des aperçus pour les nouvelles images
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file))
    setPreviewEditImages((prev) => [...prev, ...newPreviews])
  }

  const removeAddImage = (index: number) => {
    setSelectedAddImages((prev) => prev.filter((_, i) => i !== index))

    // Libérer l'URL de l'aperçu
    URL.revokeObjectURL(previewAddImages[index])
    setPreviewAddImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeEditImage = (index: number) => {
    setSelectedEditImages((prev) => prev.filter((_, i) => i !== index))

    // Libérer l'URL de l'aperçu
    URL.revokeObjectURL(previewEditImages[index])
    setPreviewEditImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    if (!currentProduct) return

    const updatedImages = [...currentProduct.images]
    updatedImages.splice(index, 1)
    setCurrentProduct({ ...currentProduct, images: updatedImages })
  }

  const handleAddProduct = async () => {
    if (!newProduct.nom || !newProduct.categorie) {
      toast({
        title: "Erreur",
        description: "Le nom et la catégorie du produit sont requis",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)
    try {
      // Upload des images sélectionnées vers Cloudinary
      let imageUrls: string[] = []
      if (selectedAddImages.length > 0) {

        imageUrls = await uploadMultipleImagesByType(selectedAddImages, "produit");
        
      }

      await createProduct({
        nom: newProduct.nom,
        description: newProduct.description || "",
        categorie: newProduct.categorie,
        images: imageUrls,
        prix: newProduct.prix || 0,
        stock: newProduct.stock || 0,
        dimensions: newProduct.dimensions || null,
        poids: newProduct.poids || null,
        options_personnalisation: newProduct.options_personnalisation || null,
        etat: newProduct.etat || "Disponible",
        mis_en_avant: newProduct.mis_en_avant || false,
        statut: newProduct.statut || "Disponible",
      })

      toast({
        title: "Succès",
        description: "Produit ajouté avec succès",
      })

      fetchProducts()
      setIsAddDialogOpen(false)
      setNewProduct({
        nom: "",
        description: "",
        categorie: categories.length > 0 ? categories[0].nom : "",
        images: [],
        prix: 0,
        stock: 0,
        dimensions: "",
        poids: 0,
        options_personnalisation: "",
        etat: "Disponible",
        mis_en_avant: false,
        statut: "Disponible",
      })

      // Réinitialiser les images
      setSelectedAddImages([])
      // Libérer les URLs des aperçus
      previewAddImages.forEach((url) => URL.revokeObjectURL(url))
      setPreviewAddImages([])
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le produit",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditProduct = async () => {
    if (!currentProduct) return

    setActionLoading(true)
    try {
      // Upload des nouvelles images sélectionnées vers Cloudinary
      let newImageUrls: string[] = []
      if (selectedEditImages.length > 0) {
        newImageUrls  = await uploadMultipleImagesByType(selectedAddImages, "produit");
      }

      // Combiner les images existantes avec les nouvelles
      const allImages = [...currentProduct.images, ...newImageUrls]

      await updateProduct(currentProduct.id_produit, {
        nom: currentProduct.nom,
        description: currentProduct.description,
        categorie: currentProduct.categorie,
        images: allImages,
        prix: currentProduct.prix,
        stock: currentProduct.stock,
        dimensions: currentProduct.dimensions,
        poids: currentProduct.poids,
        options_personnalisation: currentProduct.options_personnalisation,
        etat: currentProduct.etat,
        mis_en_avant: currentProduct.mis_en_avant,
        statut: currentProduct.statut,
      })

      toast({
        title: "Succès",
        description: "Produit mis à jour avec succès",
      })

      fetchProducts()
      setIsEditDialogOpen(false)

      // Réinitialiser les images
      setSelectedEditImages([])
      // Libérer les URLs des aperçus
      previewEditImages.forEach((url) => URL.revokeObjectURL(url))
      setPreviewEditImages([])
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le produit",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!currentProduct) return

    setActionLoading(true)
    try {
      await deleteProduct(currentProduct.id_produit)

      toast({
        title: "Succès",
        description: "Produit supprimé avec succès",
      })

      fetchProducts()
      setIsDeleteDialogOpen(false)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le produit",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const columns: ColumnDef<Product>[] = [
    {
      accessorKey: "id_produit",
      header: "ID",
      cell: ({ row }) => {
        const id = row.getValue("id_produit") as string
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
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "EUR",
        }).format(price)
        return <div>{formatted}</div>
      },
    },
    {
      accessorKey: "stock",
      header: "Stock",
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
              setCurrentProduct(row.original)
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
      accessorKey: "etat",
      header: "État",
      cell: ({ row }) => {
        const etat = row.getValue("etat") as string
        return (
          <div
            className={`rounded-full px-2 py-1 text-xs inline-block text-center ${
              etat === "Disponible" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {etat}
          </div>
        )
      },
    },
    {
      accessorKey: "statut",
      header: "Statut",
      cell: ({ row }) => {
        const statut = row.getValue("statut") as string
        return (
          <div
            className={`rounded-full px-2 py-1 text-xs inline-block text-center ${
              statut === "Disponible"
                ? "bg-green-100 text-green-800"
                : statut === "Rupture de stock"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
            }`}
          >
            {statut}
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
              featured ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {featured ? "Oui" : "Non"}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original

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
                  setCurrentProduct(product)
                  setIsEditDialogOpen(true)
                  // Réinitialiser les images d'édition
                  setSelectedEditImages([])
                  setPreviewEditImages([])
                }}
              >
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentProduct(product)
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
          <h1 className="text-3xl font-bold">Produits</h1>
          <p className="text-muted-foreground">Gérer votre catalogue de produits</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un produit
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={products}
          searchColumn="nom"
          searchPlaceholder="Rechercher par nom de produit..."
        />
      )}

      {/* Ajouter un produit */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau produit</DialogTitle>
            <DialogDescription>
              Créer un nouveau produit. Cliquez sur enregistrer lorsque vous avez terminé.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du produit</Label>
              <Input
                id="nom"
                value={newProduct.nom}
                onChange={(e) => setNewProduct({ ...newProduct, nom: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categorie">Catégorie</Label>
                <Select
                  value={newProduct.categorie}
                  onValueChange={(value) => setNewProduct({ ...newProduct, categorie: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.nom}>
                        {category.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prix">Prix (XAF)</Label>
                <Input
                  id="prix"
                  type="number"
                  value={newProduct.prix}
                  onChange={(e) => setNewProduct({ ...newProduct, prix: Number.parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dimensions">Dimensions</Label>
                <Input
                  id="dimensions"
                  value={newProduct.dimensions}
                  onChange={(e) => setNewProduct({ ...newProduct, dimensions: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="poids">Poids (kg)</Label>
                <Input
                  id="poids"
                  type="number"
                  step="0.01"
                  value={newProduct.poids}
                  onChange={(e) => setNewProduct({ ...newProduct, poids: Number.parseFloat(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="options_personnalisation">Options de personnalisation</Label>
                <Input
                  id="options_personnalisation"
                  value={newProduct.options_personnalisation}
                  onChange={(e) => setNewProduct({ ...newProduct, options_personnalisation: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="etat">État</Label>
                <Select
                  value={newProduct.etat}
                  onValueChange={(value) => setNewProduct({ ...newProduct, etat: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un état" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Disponible">Disponible</SelectItem>
                    <SelectItem value="Indisponible">Indisponible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="statut">Statut</Label>
                <Select
                  value={newProduct.statut}
                  onValueChange={(value) => setNewProduct({ ...newProduct, statut: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Disponible">Disponible</SelectItem>
                    <SelectItem value="Rupture de stock">Rupture de stock</SelectItem>
                    <SelectItem value="Deleted">Supprimé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mis_en_avant"
                checked={newProduct.mis_en_avant}
                onCheckedChange={(checked) => setNewProduct({ ...newProduct, mis_en_avant: checked as boolean })}
              />
              <Label htmlFor="mis_en_avant">Produit mis en avant</Label>
            </div>

            {/* Upload d'images */}
            <div className="space-y-2">
              <Label htmlFor="images">Images</Label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => addImageInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Cliquez pour sélectionner des images</p>
                <p className="text-xs text-gray-400">JPG, PNG, GIF jusqu'à 5MB</p>
                <input
                  type="file"
                  ref={addImageInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleAddImageChange}
                />
              </div>

              {/* Aperçu des images sélectionnées */}
              {previewAddImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {previewAddImages.map((preview, index) => (
                    <div key={index} className="relative rounded-md overflow-hidden h-24">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt={`Aperçu ${index}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeAddImage(index)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={actionLoading}>
              Annuler
            </Button>
            <Button onClick={handleAddProduct} disabled={actionLoading}>
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

      {/* Modifier un produit */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
            <DialogDescription>
              Mettre à jour les informations du produit. Cliquez sur enregistrer lorsque vous avez terminé.
            </DialogDescription>
          </DialogHeader>
          {currentProduct && (
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="edit_nom">Nom du produit</Label>
                <Input
                  id="edit_nom"
                  value={currentProduct.nom}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, nom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description</Label>
                <Textarea
                  id="edit_description"
                  value={currentProduct.description}
                  onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_categorie">Catégorie</Label>
                  <Select
                    value={currentProduct.categorie}
                    onValueChange={(value) => setCurrentProduct({ ...currentProduct, categorie: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.nom}>
                          {category.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_prix">Prix (XAF)</Label>
                  <Input
                    id="edit_prix"
                    type="number"
                    value={currentProduct.prix}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, prix: Number.parseFloat(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_stock">Stock</Label>
                  <Input
                    id="edit_stock"
                    type="number"
                    value={currentProduct.stock}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, stock: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_dimensions">Dimensions</Label>
                  <Input
                    id="edit_dimensions"
                    value={currentProduct.dimensions || ""}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, dimensions: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_poids">Poids (kg)</Label>
                  <Input
                    id="edit_poids"
                    type="number"
                    step="0.01"
                    value={currentProduct.poids || 0}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, poids: Number.parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_options_personnalisation">Options de personnalisation</Label>
                  <Input
                    id="edit_options_personnalisation"
                    value={currentProduct.options_personnalisation || ""}
                    onChange={(e) => setCurrentProduct({ ...currentProduct, options_personnalisation: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_etat">État</Label>
                  <Select
                    value={currentProduct.etat}
                    onValueChange={(value) => setCurrentProduct({ ...currentProduct, etat: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un état" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Disponible">Disponible</SelectItem>
                      <SelectItem value="Indisponible">Indisponible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_statut">Statut</Label>
                  <Select
                    value={currentProduct.statut}
                    onValueChange={(value) => setCurrentProduct({ ...currentProduct, statut: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Disponible">Disponible</SelectItem>
                      <SelectItem value="Rupture de stock">Rupture de stock</SelectItem>
                      <SelectItem value="Deleted">Supprimé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_mis_en_avant"
                  checked={currentProduct.mis_en_avant}
                  onCheckedChange={(checked) =>
                    setCurrentProduct({ ...currentProduct, mis_en_avant: checked as boolean })
                  }
                />
                <Label htmlFor="edit_mis_en_avant">Produit mis en avant</Label>
              </div>

              {/* Images existantes */}
              <div className="space-y-2">
                <Label>Images existantes</Label>
                {currentProduct.images.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {currentProduct.images.map((image, index) => (
                      <div key={index} className="relative rounded-md overflow-hidden h-24">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Image ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          onClick={() => removeExistingImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucune image existante</p>
                )}
              </div>

              {/* Ajouter de nouvelles images */}
              <div className="space-y-2">
                <Label htmlFor="edit_images">Ajouter de nouvelles images</Label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => editImageInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Cliquez pour sélectionner des images</p>
                  <p className="text-xs text-gray-400">JPG, PNG, GIF jusqu'à 5MB</p>
                  <input
                    type="file"
                    ref={editImageInputRef}
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleEditImageChange}
                  />
                </div>

                {/* Aperçu des nouvelles images */}
                {previewEditImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {previewEditImages.map((preview, index) => (
                      <div key={index} className="relative rounded-md overflow-hidden h-24">
                        <img
                          src={preview || "/placeholder.svg"}
                          alt={`Aperçu ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeEditImage(index)
                          }}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={actionLoading}>
              Annuler
            </Button>
            <Button onClick={handleEditProduct} disabled={actionLoading}>
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

      {/* Supprimer un produit */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer le produit</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          {currentProduct && (
            <div className="py-4">
              <p>
                Vous êtes sur le point de supprimer le produit : <strong>{currentProduct.nom}</strong> (ID:{" "}
                {currentProduct.id_produit.substring(0, 8)}...)
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={actionLoading}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct} disabled={actionLoading}>
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
            <DialogTitle>Images du produit</DialogTitle>
            <DialogDescription>
              {currentProduct?.nom} - {currentProduct?.images.length} images
            </DialogDescription>
          </DialogHeader>
          {currentProduct && (
            <div className="grid grid-cols-2 gap-4 py-4">
              {currentProduct.images.map((image, index) => (
                <div key={index} className="overflow-hidden rounded-md border">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`${currentProduct.nom} - Image ${index + 1}`}
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

