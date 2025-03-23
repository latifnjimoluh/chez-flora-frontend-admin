"use client"

import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Edit } from "lucide-react"
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
import { siteContentService } from "@/services/siteContentService"


type SiteContent = {
  id: number
  content_key: string
  content_value: string
  created_at: string
  updated_at: string
}

export default function ContentPage() {
  const [contents, setContents] = useState<SiteContent[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentContent, setCurrentContent] = useState<SiteContent | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchContents()
  }, [])
  
  const fetchContents = async () => {
    const data = await siteContentService.getAllContent()
  
    if (data.success && Array.isArray(data.data)) {
      setContents(data.data) // ✅ Affiche bien la liste
    } else {
      toast({
        title: "Erreur",
        description: data.message || "Impossible de charger le contenu du site",
        variant: "destructive",
      })
    }
  }
  
  

  const handleEditContent = async () => {
    if (!currentContent) return
  
    const isImage = currentContent.content_key.includes("_url")
  
    const payload: any = {}

    if (
      (currentContent.content_key.includes("_url") || currentContent.content_key.includes("_image")) &&
      (currentContent as any).file instanceof File
    ) {
      payload.file = (currentContent as any).file
    } else {
      payload.content_value = currentContent.content_value
    }

    const result = await siteContentService.updateContent(currentContent.content_key, payload)

      
    if (result.success === false) {
      toast({
        title: "Erreur",
        description: result.message || "La mise à jour a échoué",
        variant: "destructive",
      })
      return
    }
  
    toast({
      title: "Contenu mis à jour",
      description: `${currentContent.content_key} a été mis à jour.`,
    })
  
    setIsEditDialogOpen(false)
    fetchContents()
  }
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPP")
  }

  const columns: ColumnDef<SiteContent>[] = [
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
      accessorKey: "content_key",
      header: "Key",
    },
    {
      accessorKey: "content_value",
      header: "Value",
      cell: ({ row }) => {
        const value = row.getValue("content_value") as string
        return <div className="max-w-xs truncate">{value}</div>
      },
    },
    {
      accessorKey: "updated_at",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Last Updated
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("updated_at") as string
        return <div>{formatDate(date)}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const content = row.original

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
                  setCurrentContent(content)
                  setIsEditDialogOpen(true)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
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
        <h1 className="text-3xl font-bold">Site Content</h1>
        <p className="text-muted-foreground">Manage dynamic content for your website</p>
      </div>

      <DataTable
        columns={columns}
        data={contents}
        searchColumn="content_key"
        searchPlaceholder="Search by content key..."
      />

      {/* Edit Content Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>Update site content. Click save when you're done.</DialogDescription>
          </DialogHeader>
          {currentContent && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="content_key">Content Key</Label>
                <Input id="content_key" value={currentContent.content_key} disabled className="bg-muted" />
              </div>
              {currentContent.content_key.includes("_url") || currentContent.content_key.includes("_image") ? (
                <div className="space-y-2">
                  <Label htmlFor="file">Fichier image</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setCurrentContent({ ...currentContent, file, content_value: URL.createObjectURL(file) });
                    }}
                  />
                  {currentContent.content_value && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Aperçu :</p>
                      <img
                        src={currentContent.content_value}
                        alt="Preview"
                        className="max-h-[200px] rounded-md border"
                      />
                    </div>
                  )}
                </div>
              ) : (

                <div className="space-y-2">
                  <Label htmlFor="content_value">Content</Label>
                  <Textarea
                    id="content_value"
                    value={currentContent.content_value}
                    onChange={(e) => setCurrentContent({ ...currentContent, content_value: e.target.value })}
                    className="min-h-[100px]"
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditContent}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

