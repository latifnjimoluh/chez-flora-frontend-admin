"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Plus, Heart, Image, Loader2, Upload, X } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { blogService } from "@/services/blogService"
import { uploadImageByType } from "@/services/cloudinaryService"

type BlogPost = {
  id: number
  title: string
  slug: string
  excerpt: string | null
  content: string
  image: string | null
  date: string
  author: string
  category: string
  tags: string[]
  likes: number
  readTime: string
  created_at: string
  updated_at: string
}

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewImageDialogOpen, setIsViewImageDialogOpen] = useState(false)
  const [currentPost, setCurrentPost] = useState<BlogPost | null>(null)
  const [newPost, setNewPost] = useState<Partial<BlogPost>>({
    title: "",
    excerpt: "",
    content: "",
    image: null,
    author: "",
    category: "",
    tags: [],
    readTime: "5 min",
  })
  const [actionLoading, setActionLoading] = useState(false)
  const { toast } = useToast()

  // Références pour les input file
  const addImageInputRef = useRef<HTMLInputElement>(null)
  const editImageInputRef = useRef<HTMLInputElement>(null)

  // États pour les images sélectionnées
  const [selectedAddImage, setSelectedAddImage] = useState<File | null>(null)
  const [selectedEditImage, setSelectedEditImage] = useState<File | null>(null)
  const [previewAddImage, setPreviewAddImage] = useState<string | null>(null)
  const [previewEditImage, setPreviewEditImage] = useState<string | null>(null)

  useEffect(() => {
    fetchBlogPosts()
  }, [])

  const fetchBlogPosts = async () => {
    setIsLoading(true)
    try {
      const response = await blogService.getAllPosts()
      setBlogPosts(response.data || [])
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de récupérer les articles de blog",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setSelectedAddImage(file)

    // Générer un aperçu pour l'image
    const preview = URL.createObjectURL(file)
    setPreviewAddImage(preview)
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setSelectedEditImage(file)

    // Générer un aperçu pour l'image
    const preview = URL.createObjectURL(file)
    setPreviewEditImage(preview)
  }

  const removeAddImage = () => {
    if (previewAddImage) {
      URL.revokeObjectURL(previewAddImage)
    }
    setSelectedAddImage(null)
    setPreviewAddImage(null)
  }

  const removeEditImage = () => {
    if (previewEditImage) {
      URL.revokeObjectURL(previewEditImage)
    }
    setSelectedEditImage(null)
    setPreviewEditImage(null)
  }

  const handleAddPost = async () => {
    if (!newPost.title || !newPost.content) {
      toast({
        title: "Erreur",
        description: "Le titre et le contenu de l'article sont requis",
        variant: "destructive",
      })
      return
    }

    setActionLoading(true)
    try {
      // Préparer les données de l'article
      const postData: any = {
        title: newPost.title,
        excerpt: newPost.excerpt || "",
        content: newPost.content,
        author: newPost.author || "Admin",
        category: newPost.category || "Non catégorisé",
        tags: newPost.tags || [],
        readTime: newPost.readTime || "5 min",
      }

      // Upload de l'image si elle existe
      if (selectedAddImage) {
        const imageUrl = await uploadImageByType(selectedAddImage, "blog")
        postData.image = imageUrl
      }

      const response = await blogService.createPost(postData)

      if (response.success) {
        toast({
          title: "Succès",
          description: "Article ajouté avec succès",
        })

        fetchBlogPosts()
        setIsAddDialogOpen(false)
        setNewPost({
          title: "",
          excerpt: "",
          content: "",
          image: null,
          author: "",
          category: "",
          tags: [],
          readTime: "5 min",
        })

        // Réinitialiser l'image
        if (previewAddImage) {
          URL.revokeObjectURL(previewAddImage)
        }
        setSelectedAddImage(null)
        setPreviewAddImage(null)
      } else {
        throw new Error(response.message || "Erreur lors de la création de l'article")
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter l'article",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditPost = async () => {
    if (!currentPost) return

    setActionLoading(true)
    try {
      // Préparer les données de l'article
      const postData: any = {
        title: currentPost.title,
        excerpt: currentPost.excerpt || "",
        content: currentPost.content,
        author: currentPost.author,
        category: currentPost.category,
        tags: currentPost.tags,
        readTime: currentPost.readTime,
      }

      // Upload de la nouvelle image si elle existe
      if (selectedEditImage) {
        const imageUrl = await uploadImageByType(selectedEditImage, "blog")
        postData.image = imageUrl
      }

      const response = await blogService.updatePost(currentPost.id, postData)

      if (response.success) {
        toast({
          title: "Succès",
          description: "Article mis à jour avec succès",
        })

        fetchBlogPosts()
        setIsEditDialogOpen(false)

        // Réinitialiser l'image
        if (previewEditImage) {
          URL.revokeObjectURL(previewEditImage)
        }
        setSelectedEditImage(null)
        setPreviewEditImage(null)
      } else {
        throw new Error(response.message || "Erreur lors de la mise à jour de l'article")
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'article",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeletePost = async () => {
    if (!currentPost) return

    setActionLoading(true)
    try {
      const response = await blogService.deletePost(currentPost.id)

      if (response.success) {
        toast({
          title: "Succès",
          description: "Article supprimé avec succès",
        })

        fetchBlogPosts()
        setIsDeleteDialogOpen(false)
      } else {
        throw new Error(response.message || "Erreur lors de la suppression de l'article")
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'article",
        variant: "destructive",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP")
  }

  const columns: ColumnDef<BlogPost>[] = [
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
      accessorKey: "title",
      header: "Titre",
    },
    {
      accessorKey: "author",
      header: "Auteur",
    },
    {
      accessorKey: "category",
      header: "Catégorie",
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("date") as string
        return <div>{formatDate(date)}</div>
      },
    },
    {
      accessorKey: "likes",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Likes
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const likes = row.getValue("likes") as number
        return (
          <div className="flex items-center">
            <Heart className="mr-1 h-4 w-4 text-red-500" />
            {likes}
          </div>
        )
      },
    },
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => {
        const image = row.getValue("image") as string | null
        if (!image) return <div>Aucune image</div>
        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCurrentPost(row.original)
              setIsViewImageDialogOpen(true)
            }}
          >
            <Image className="mr-2 h-4 w-4" />
            Voir
          </Button>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const post = row.original

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
                  setCurrentPost(post)
                  setIsEditDialogOpen(true)
                  // Réinitialiser l'image d'édition
                  setSelectedEditImage(null)
                  setPreviewEditImage(null)
                }}
              >
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentPost(post)
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
          <h1 className="text-3xl font-bold">Articles de Blog</h1>
          <p className="text-muted-foreground">Gérer le contenu de votre blog</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un article
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={blogPosts}
          searchColumn="title"
          searchPlaceholder="Rechercher par titre..."
        />
      )}

      {/* Ajouter un article */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel article</DialogTitle>
            <DialogDescription>
              Créer un nouvel article de blog. Cliquez sur enregistrer lorsque vous avez terminé.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Extrait</Label>
              <Textarea
                id="excerpt"
                value={newPost.excerpt || ""}
                onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                placeholder="Un bref résumé de l'article"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Contenu (HTML)</Label>
              <Textarea
                id="content"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="min-h-[200px] font-mono text-sm"
                placeholder="<p>Votre contenu ici...</p>"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Auteur</Label>
                <Input
                  id="author"
                  value={newPost.author}
                  onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                <Input
                  id="tags"
                  value={newPost.tags?.join(", ") || ""}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value.split(",").map((tag) => tag.trim()) })}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="readTime">Temps de lecture</Label>
                <Input
                  id="readTime"
                  value={newPost.readTime}
                  onChange={(e) => setNewPost({ ...newPost, readTime: e.target.value })}
                  placeholder="5 min"
                />
              </div>
            </div>

            {/* Upload d'image */}
            <div className="space-y-2">
              <Label htmlFor="image">Image à la une</Label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => addImageInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Cliquez pour sélectionner une image</p>
                <p className="text-xs text-gray-400">JPG, PNG, GIF jusqu'à 5MB</p>
                <input
                  type="file"
                  ref={addImageInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAddImageChange}
                />
              </div>

              {/* Aperçu de l'image sélectionnée */}
              {previewAddImage && (
                <div className="relative rounded-md overflow-hidden h-48 mt-2">
                  <img
                    src={previewAddImage || "/placeholder.svg"}
                    alt="Aperçu"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeAddImage()
                    }}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={actionLoading}>
              Annuler
            </Button>
            <Button onClick={handleAddPost} disabled={actionLoading}>
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

      {/* Modifier un article */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Modifier l'article</DialogTitle>
            <DialogDescription>
              Mettre à jour les informations de l'article. Cliquez sur enregistrer lorsque vous avez terminé.
            </DialogDescription>
          </DialogHeader>
          {currentPost && (
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="edit_title">Titre</Label>
                <Input
                  id="edit_title"
                  value={currentPost.title}
                  onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_excerpt">Extrait</Label>
                <Textarea
                  id="edit_excerpt"
                  value={currentPost.excerpt || ""}
                  onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_content">Contenu (HTML)</Label>
                <Textarea
                  id="edit_content"
                  value={currentPost.content}
                  onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_author">Auteur</Label>
                  <Input
                    id="edit_author"
                    value={currentPost.author}
                    onChange={(e) => setCurrentPost({ ...currentPost, author: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_category">Catégorie</Label>
                  <Input
                    id="edit_category"
                    value={currentPost.category}
                    onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_tags">Tags (séparés par des virgules)</Label>
                  <Input
                    id="edit_tags"
                    value={currentPost.tags.join(", ")}
                    onChange={(e) =>
                      setCurrentPost({ ...currentPost, tags: e.target.value.split(",").map((tag) => tag.trim()) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_readTime">Temps de lecture</Label>
                  <Input
                    id="edit_readTime"
                    value={currentPost.readTime}
                    onChange={(e) => setCurrentPost({ ...currentPost, readTime: e.target.value })}
                  />
                </div>
              </div>

              {/* Image existante */}
              <div className="space-y-2">
                <Label>Image existante</Label>
                {currentPost.image ? (
                  <div className="relative rounded-md overflow-hidden h-48">
                    <img
                      src={currentPost.image || "/placeholder.svg"}
                      alt="Image existante"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Aucune image existante</p>
                )}
              </div>

              {/* Upload d'une nouvelle image */}
              <div className="space-y-2">
                <Label htmlFor="edit_image">Remplacer l'image</Label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => editImageInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Cliquez pour sélectionner une nouvelle image</p>
                  <p className="text-xs text-gray-400">JPG, PNG, GIF jusqu'à 5MB</p>
                  <input
                    type="file"
                    ref={editImageInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleEditImageChange}
                  />
                </div>

                {/* Aperçu de la nouvelle image */}
                {previewEditImage && (
                  <div className="relative rounded-md overflow-hidden h-48 mt-2">
                    <img
                      src={previewEditImage || "/placeholder.svg"}
                      alt="Aperçu"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeEditImage()
                      }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={actionLoading}>
              Annuler
            </Button>
            <Button onClick={handleEditPost} disabled={actionLoading}>
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

      {/* Supprimer un article */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer l'article</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet article ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          {currentPost && (
            <div className="py-4">
              <p>
                Vous êtes sur le point de supprimer : <strong>{currentPost.title}</strong>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Cet article a {currentPost.likes} likes et a été publié le {formatDate(currentPost.date)}.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={actionLoading}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeletePost} disabled={actionLoading}>
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

      {/* Voir l'image */}
      <Dialog open={isViewImageDialogOpen} onOpenChange={setIsViewImageDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Image à la une</DialogTitle>
            <DialogDescription>{currentPost?.title}</DialogDescription>
          </DialogHeader>
          {currentPost && currentPost.image && (
            <div className="py-4 flex justify-center">
              <img
                src={currentPost.image || "/placeholder.svg"}
                alt={currentPost.title}
                className="max-h-[400px] rounded-md"
              />
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewImageDialogOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

