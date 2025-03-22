"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Plus, Star, Image, Upload } from "lucide-react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import { testimonialService } from "@/services/testimonialService"

type Testimonial = {
  id: number
  name: string
  text: string
  rating: number
  image: string | null
  is_featured: boolean
  created_at: string
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewImageDialogOpen, setIsViewImageDialogOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState<Testimonial | null>(null)
  const [newTestimonial, setNewTestimonial] = useState<Partial<Testimonial>>({
    name: "",
    text: "",
    rating: 5,
    image: null,
    is_featured: false,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [editPreviewUrl, setEditPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      setLoading(true)
      const response = await testimonialService.getAllTestimonials()
      if (response.success) {
        setTestimonials(response.data)
      } else {
        throw new Error(response.message || "Failed to fetch testimonials")
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      toast({
        title: "Error",
        description: "Failed to load testimonials. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0] || null

    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (isEdit) {
          setEditSelectedFile(file)
          setEditPreviewUrl(reader.result as string)
        } else {
          setSelectedFile(file)
          setPreviewUrl(reader.result as string)
        }
      }
      reader.readAsDataURL(file)
    } else {
      if (isEdit) {
        setEditSelectedFile(null)
        setEditPreviewUrl(null)
      } else {
        setSelectedFile(null)
        setPreviewUrl(null)
      }
    }
  }

  const handleAddTestimonial = async () => {
    try {
      setSubmitting(true)

      const testimonialData = {
        ...newTestimonial,
        image: selectedFile || undefined,
      }

      const response = await testimonialService.createTestimonial(testimonialData)

      if (response.success) {
        await fetchTestimonials()
        setIsAddDialogOpen(false)
        setNewTestimonial({
          name: "",
          text: "",
          rating: 5,
          image: null,
          is_featured: false,
        })
        setSelectedFile(null)
        setPreviewUrl(null)

        toast({
          title: "Testimonial added",
          description: `Testimonial from ${response.data.name} has been added successfully.`,
        })
      } else {
        throw new Error(response.message || "Failed to add testimonial")
      }
    } catch (error) {
      console.error("Error adding testimonial:", error)
      toast({
        title: "Error",
        description: "Failed to add testimonial. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditTestimonial = async () => {
    if (!currentTestimonial) return

    try {
      setSubmitting(true)

      const testimonialData = {
        ...currentTestimonial,
        image: editSelectedFile || undefined,
      }

      const response = await testimonialService.updateTestimonial(currentTestimonial.id, testimonialData)

      if (response.success) {
        await fetchTestimonials()
        setIsEditDialogOpen(false)
        setEditSelectedFile(null)
        setEditPreviewUrl(null)

        toast({
          title: "Testimonial updated",
          description: `Testimonial from ${currentTestimonial.name} has been updated successfully.`,
        })
      } else {
        throw new Error(response.message || "Failed to update testimonial")
      }
    } catch (error) {
      console.error("Error updating testimonial:", error)
      toast({
        title: "Error",
        description: "Failed to update testimonial. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTestimonial = async () => {
    if (!currentTestimonial) return

    try {
      setSubmitting(true)

      const response = await testimonialService.deleteTestimonial(currentTestimonial.id)

      if (response.success) {
        await fetchTestimonials()
        setIsDeleteDialogOpen(false)

        toast({
          title: "Testimonial deleted",
          description: `Testimonial has been deleted successfully.`,
        })
      } else {
        throw new Error(response.message || "Failed to delete testimonial")
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error)
      toast({
        title: "Error",
        description: "Failed to delete testimonial. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const toggleFeatured = async (id: number, isFeatured: boolean) => {
    try {
      const response = await testimonialService.toggleFeatured(id, !isFeatured)

      if (response.success) {
        await fetchTestimonials()

        toast({
          title: isFeatured ? "Removed from featured" : "Added to featured",
          description: `Testimonial has been ${isFeatured ? "removed from" : "added to"} featured testimonials.`,
        })
      } else {
        throw new Error(response.message || "Failed to update featured status")
      }
    } catch (error) {
      console.error("Error toggling featured status:", error)
      toast({
        title: "Error",
        description: "Failed to update featured status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const renderStars = (rating: number) => {
    return Array(rating)
      .fill(0)
      .map((_, i) => <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
  }

  const columns: ColumnDef<Testimonial>[] = [
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
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "text",
      header: "Testimonial",
      cell: ({ row }) => {
        const text = row.getValue("text") as string
        return <div className="max-w-xs truncate">{text}</div>
      },
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => {
        const rating = row.getValue("rating") as number
        return <div className="flex">{renderStars(rating)}</div>
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
              setCurrentTestimonial(row.original)
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
      accessorKey: "is_featured",
      header: "Featured",
      cell: ({ row }) => {
        const isFeatured = row.getValue("is_featured") as boolean
        return (
          <div
            className={`rounded-full px-2 py-1 text-xs inline-block text-center ${
              isFeatured ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-800"
            }`}
          >
            {isFeatured ? "Featured" : "Not Featured"}
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string
        return <div>{format(new Date(date), "PPP")}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const testimonial = row.original

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
                  setCurrentTestimonial(testimonial)
                  setEditPreviewUrl(testimonial.image)
                  setIsEditDialogOpen(true)
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFeatured(testimonial.id, testimonial.is_featured)}>
                {testimonial.is_featured ? "Remove from Featured" : "Add to Featured"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentTestimonial(testimonial)
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
          <h1 className="text-3xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground">Manage customer testimonials</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Testimonial
        </Button>
      </div>

      <DataTable columns={columns} data={testimonials} searchColumn="name" searchPlaceholder="Search by name..." />

      {/* Add Testimonial Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Testimonial</DialogTitle>
            <DialogDescription>Add a new customer testimonial. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name</Label>
              <Input
                id="name"
                value={newTestimonial.name}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="text">Testimonial Text</Label>
              <Textarea
                id="text"
                value={newTestimonial.text}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, text: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (1-5)</Label>
              <Input
                id="rating"
                type="number"
                min="1"
                max="5"
                value={newTestimonial.rating}
                onChange={(e) => setNewTestimonial({ ...newTestimonial, rating: Number.parseInt(e.target.value) })}
              />
              <div className="flex mt-1">{renderStars(newTestimonial.rating || 5)}</div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Image</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => handleFileChange(e)}
                />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Image
                </Button>
                {selectedFile && <span className="text-sm text-muted-foreground">{selectedFile.name}</span>}
              </div>
              {previewUrl && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Preview:</p>
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="max-h-[200px] rounded-md border"
                  />
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_featured"
                checked={newTestimonial.is_featured}
                onCheckedChange={(checked) => setNewTestimonial({ ...newTestimonial, is_featured: checked as boolean })}
              />
              <Label htmlFor="is_featured">Featured Testimonial</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleAddTestimonial} disabled={submitting}>
              {submitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Testimonial Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Testimonial</DialogTitle>
            <DialogDescription>Update testimonial information. Click save when you're done.</DialogDescription>
          </DialogHeader>
          {currentTestimonial && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Customer Name</Label>
                <Input
                  id="edit_name"
                  value={currentTestimonial.name}
                  onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_text">Testimonial Text</Label>
                <Textarea
                  id="edit_text"
                  value={currentTestimonial.text}
                  onChange={(e) => setCurrentTestimonial({ ...currentTestimonial, text: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_rating">Rating (1-5)</Label>
                <Input
                  id="edit_rating"
                  type="number"
                  min="1"
                  max="5"
                  value={currentTestimonial.rating}
                  onChange={(e) =>
                    setCurrentTestimonial({ ...currentTestimonial, rating: Number.parseInt(e.target.value) })
                  }
                />
                <div className="flex mt-1">{renderStars(currentTestimonial.rating)}</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_image">Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="edit_image"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={editFileInputRef}
                    onChange={(e) => handleFileChange(e, true)}
                  />
                  <Button type="button" variant="outline" onClick={() => editFileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    Change Image
                  </Button>
                  {editSelectedFile && <span className="text-sm text-muted-foreground">{editSelectedFile.name}</span>}
                </div>
                {(editPreviewUrl || currentTestimonial.image) && (
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Preview:</p>
                    <img
                      src={editPreviewUrl || currentTestimonial.image || "/placeholder.svg"}
                      alt="Preview"
                      className="max-h-[200px] rounded-md border"
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_is_featured"
                  checked={currentTestimonial.is_featured}
                  onCheckedChange={(checked) =>
                    setCurrentTestimonial({ ...currentTestimonial, is_featured: checked as boolean })
                  }
                />
                <Label htmlFor="edit_is_featured">Featured Testimonial</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleEditTestimonial} disabled={submitting}>
              {submitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Testimonial Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Testimonial</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this testimonial? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentTestimonial && (
            <div className="py-4">
              <p>
                You are about to delete testimonial from: <strong>{currentTestimonial.name}</strong>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">"{currentTestimonial.text.substring(0, 100)}..."</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTestimonial} disabled={submitting}>
              {submitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Image Dialog */}
      <Dialog open={isViewImageDialogOpen} onOpenChange={setIsViewImageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Testimonial Image</DialogTitle>
            <DialogDescription>{currentTestimonial?.name}'s testimonial image</DialogDescription>
          </DialogHeader>
          {currentTestimonial && currentTestimonial.image && (
            <div className="py-4 flex justify-center">
              <img
                src={currentTestimonial.image || "/placeholder.svg"}
                alt={`${currentTestimonial.name}'s testimonial`}
                className="max-h-[300px] rounded-md"
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

