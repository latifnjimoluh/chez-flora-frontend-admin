"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Plus, Heart, Image } from "lucide-react"
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

const initialBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Comment prendre soin de vos orchidées",
    slug: "soin-orchidees",
    excerpt: "Découvrez nos conseils d'experts pour garder vos orchidées en pleine santé toute l'année.",
    content:
      "<p>Les orchidées sont parmi les plantes d'intérieur les plus populaires, mais elles ont la réputation d'être difficiles à entretenir. Pourtant, avec quelques connaissances de base et une attention régulière, vous pouvez profiter de ces magnifiques fleurs pendant de nombreuses années.</p>\r\n  \r\n  <h2>Choisir le bon emplacement</h2>\r\n  <p>Les orchidées apprécient la lumière vive mais indirecte. Une fenêtre orientée à l'est ou à l'ouest est idéale. Évitez l'exposition directe au soleil, qui peut brûler les feuilles, mais aussi les endroits trop sombres, qui empêcheront la floraison.</p>\r\n  \r\n  <h2>L'arrosage : la clé du succès</h2>\r\n  <p>L'erreur la plus courante avec les orchidées est l'excès d'arrosage. La plupart des orchidées d'intérieur sont épiphytes, ce qui signifie qu'elles poussent naturellement sur les arbres et non dans le sol. Leurs racines ont besoin d'air et peuvent pourrir si elles restent constamment humides.</p>\r\n  \r\n  <h2>La nutrition adaptée</h2>\r\n  <p>Utilisez un engrais spécifique pour orchidées, dilué à la moitié de la dose recommandée. Fertilisez votre orchidée toutes les deux semaines pendant la période de croissance (printemps et été) et une fois par mois le reste de l'année.</p>\r\n  \r\n  <h2>Rempotage et substrat</h2>\r\n  <p>Les orchidées doivent être rempotées tous les 2 à 3 ans, idéalement après la floraison. Utilisez un substrat spécial pour orchidées, composé d'écorce de pin, de charbon de bois et de mousse de sphaigne.</p>",
    image: "/placeholder.svg?height=600&width=1200",
    date: "2023-05-12",
    author: "Nexus",
    category: "Conseils d'entretien",
    tags: ["Orchidées", "Plantes d'intérieur", "Entretien"],
    likes: 43,
    readTime: "5 min",
    created_at: "2025-03-18 13:58:58",
    updated_at: "2025-03-18 14:29:02",
  },
  {
    id: 2,
    title: "Les tendances florales de la saison",
    slug: "tendances-florales",
    excerpt: "Quelles sont les fleurs et les compositions qui font sensation cette saison ? Notre guide complet.",
    content:
      "<p>Chaque saison apporte son lot de nouveautés dans le monde floral. Découvrez les tendances qui font sensation ce printemps-été et comment les intégrer dans votre intérieur ou vos événements.</p>\r\n  \r\n  <h2>Le retour des fleurs séchées</h2>\r\n  <p>Après plusieurs années en arrière-plan, les fleurs séchées font un retour remarqué. Loin des compositions poussiéreuses d'autrefois, les nouvelles tendances mettent en avant des arrangements modernes et épurés, souvent teints dans des couleurs pastel ou naturelles.</p>\r\n  \r\n  <h2>Les compositions monochromes</h2>\r\n  <p>Les bouquets d'une seule couleur, mais dans différentes nuances et avec diverses variétés de fleurs, sont très tendance. Ces compositions élégantes et sophistiquées apportent une touche de cohérence et de sérénité à n'importe quel espace.</p>\r\n  \r\n  <h2>L'influence japonaise</h2>\r\n  <p>L'art floral japonais, notamment l'ikebana, influence fortement les compositions actuelles. On observe une recherche d'équilibre, de simplicité et d'asymétrie qui met en valeur chaque fleur individuellement.</p>",
    image: "/placeholder.svg?height=600&width=1200",
    date: "2023-04-28",
    author: "Nexus2",
    category: "Tendances",
    tags: ["Tendances", "Saison", "Compositions"],
    likes: 36,
    readTime: "4 min",
    created_at: "2025-03-18 13:58:58",
    updated_at: "2025-03-18 14:31:07",
  },
  {
    id: 3,
    title: "Créer un jardin d'intérieur durable",
    slug: "jardin-interieur-durable",
    excerpt: "Nos astuces pour aménager un espace vert chez vous, même avec peu de place et de lumière.",
    content:
      "<p>Vous rêvez d'un coin de verdure chez vous mais vous manquez d'espace ou de lumière ? Découvrez comment créer un jardin d'intérieur durable qui s'adapte à toutes les contraintes.</p>\r\n  \r\n  <h2>Choisir les bonnes plantes</h2>\r\n  <p>La première étape consiste à sélectionner des plantes adaptées à votre environnement. Pour les espaces peu lumineux, optez pour des variétés comme le pothos, la langue de belle-mère ou le ZZ plant. Ces plantes sont robustes et nécessitent peu d'entretien.</p>\r\n  \r\n  <h2>Optimiser l'espace</h2>\r\n  <p>Utilisez les murs et le plafond pour installer des étagères, des supports suspendus ou des jardins verticaux. Ces solutions permettent de maximiser l'espace disponible sans encombrer vos surfaces de vie.</p>\r\n  \r\n  <h2>Système d'arrosage intelligent</h2>\r\n  <p>Pour un jardin vraiment durable, investissez dans un système d'arrosage automatique ou des pots auto-irrigants. Ces dispositifs garantissent que vos plantes reçoivent la bonne quantité d'eau, même pendant vos absences.</p>",
    image: "/placeholder.svg?height=600&width=1200",
    date: "2023-04-15",
    author: "Nexus3",
    category: "Jardinage",
    tags: ["Plantes d'intérieur", "Jardinage", "Développement durable"],
    likes: 28,
    readTime: "6 min",
    created_at: "2025-03-18 13:58:58",
    updated_at: "2025-03-22 08:05:14",
  },
]

export default function BlogPage() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(initialBlogPosts)
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
  const { toast } = useToast()

  const handleAddPost = () => {
    const id = Math.max(...blogPosts.map((post) => post.id)) + 1
    const now = new Date().toISOString().replace("T", " ").substring(0, 19)
    const today = new Date().toISOString().split("T")[0]
    const slug =
      newPost.title
        ?.toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-") || ""

    const post: BlogPost = {
      id,
      title: newPost.title || "",
      slug,
      excerpt: newPost.excerpt || null,
      content: newPost.content || "",
      image: newPost.image,
      date: today,
      author: newPost.author || "",
      category: newPost.category || "",
      tags: newPost.tags || [],
      likes: 0,
      readTime: newPost.readTime || "5 min",
      created_at: now,
      updated_at: now,
    }

    setBlogPosts([...blogPosts, post])
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
    setIsAddDialogOpen(false)

    toast({
      title: "Blog post added",
      description: `"${post.title}" has been added successfully.`,
    })
  }

  const handleEditPost = () => {
    if (!currentPost) return

    const now = new Date().toISOString().replace("T", " ").substring(0, 19)
    const updatedPost = {
      ...currentPost,
      updated_at: now,
    }

    setBlogPosts(blogPosts.map((post) => (post.id === currentPost.id ? updatedPost : post)))
    setIsEditDialogOpen(false)

    toast({
      title: "Blog post updated",
      description: `"${currentPost.title}" has been updated successfully.`,
    })
  }

  const handleDeletePost = () => {
    if (!currentPost) return

    setBlogPosts(blogPosts.filter((post) => post.id !== currentPost.id))
    setIsDeleteDialogOpen(false)

    toast({
      title: "Blog post deleted",
      description: `"${currentPost.title}" has been deleted successfully.`,
    })
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
      header: "Title",
    },
    {
      accessorKey: "author",
      header: "Author",
    },
    {
      accessorKey: "category",
      header: "Category",
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
        if (!image) return <div>No image</div>
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
            View
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
                <span className="sr-only">Open menu</span>
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
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentPost(post)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your blog content</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Post
        </Button>
      </div>

      <DataTable columns={columns} data={blogPosts} searchColumn="title" searchPlaceholder="Search by title..." />

      {/* Add Blog Post Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Add New Blog Post</DialogTitle>
            <DialogDescription>Create a new blog post. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={newPost.excerpt || ""}
                onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                placeholder="A brief summary of the post"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content (HTML)</Label>
              <Textarea
                id="content"
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="min-h-[200px] font-mono text-sm"
                placeholder="<p>Your content here...</p>"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={newPost.author}
                  onChange={(e) => setNewPost({ ...newPost, author: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={newPost.category}
                  onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={newPost.tags?.join(", ") || ""}
                  onChange={(e) => setNewPost({ ...newPost, tags: e.target.value.split(",").map((tag) => tag.trim()) })}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="readTime">Read Time</Label>
                <Input
                  id="readTime"
                  value={newPost.readTime}
                  onChange={(e) => setNewPost({ ...newPost, readTime: e.target.value })}
                  placeholder="5 min"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Featured Image URL</Label>
              <Input
                id="image"
                value={newPost.image || ""}
                onChange={(e) => setNewPost({ ...newPost, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPost}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Blog Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>Update blog post information. Click save when you're done.</DialogDescription>
          </DialogHeader>
          {currentPost && (
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              <div className="space-y-2">
                <Label htmlFor="edit_title">Title</Label>
                <Input
                  id="edit_title"
                  value={currentPost.title}
                  onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_excerpt">Excerpt</Label>
                <Textarea
                  id="edit_excerpt"
                  value={currentPost.excerpt || ""}
                  onChange={(e) => setCurrentPost({ ...currentPost, excerpt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_content">Content (HTML)</Label>
                <Textarea
                  id="edit_content"
                  value={currentPost.content}
                  onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_author">Author</Label>
                  <Input
                    id="edit_author"
                    value={currentPost.author}
                    onChange={(e) => setCurrentPost({ ...currentPost, author: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_category">Category</Label>
                  <Input
                    id="edit_category"
                    value={currentPost.category}
                    onChange={(e) => setCurrentPost({ ...currentPost, category: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_tags">Tags (comma separated)</Label>
                  <Input
                    id="edit_tags"
                    value={currentPost.tags.join(", ")}
                    onChange={(e) =>
                      setCurrentPost({ ...currentPost, tags: e.target.value.split(",").map((tag) => tag.trim()) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_readTime">Read Time</Label>
                  <Input
                    id="edit_readTime"
                    value={currentPost.readTime}
                    onChange={(e) => setCurrentPost({ ...currentPost, readTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_image">Featured Image URL</Label>
                <Input
                  id="edit_image"
                  value={currentPost.image || ""}
                  onChange={(e) => setCurrentPost({ ...currentPost, image: e.target.value })}
                />
                {currentPost.image && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Preview:</p>
                    <img
                      src={currentPost.image || "/placeholder.svg"}
                      alt="Preview"
                      className="max-h-[200px] rounded-md border"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPost}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Blog Post Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentPost && (
            <div className="py-4">
              <p>
                You are about to delete: <strong>{currentPost.title}</strong>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                This post has {currentPost.likes} likes and was published on {formatDate(currentPost.date)}.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePost}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Image Dialog */}
      <Dialog open={isViewImageDialogOpen} onOpenChange={setIsViewImageDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Featured Image</DialogTitle>
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
            <Button onClick={() => setIsViewImageDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

