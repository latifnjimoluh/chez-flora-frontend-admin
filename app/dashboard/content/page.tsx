"use client"

import { useState } from "react"
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

type SiteContent = {
  id: number
  content_key: string
  content_value: string
  created_at: string
  updated_at: string
}

const initialContents: SiteContent[] = [
  {
    id: 12,
    content_key: "about_text",
    content_value:
      "ChezFlora est née d'une passion pour la beauté naturelle des fleurs et d'un désir de partager cette élégance avec le monde. Nous créons des compositions florales uniques qui apportent joie et sérénité dans votre quotidien.",
    created_at: "2025-03-20 04:43:11",
    updated_at: "2025-03-20 04:43:11",
  },
  {
    id: 11,
    content_key: "hero_title",
    content_value: "Offrez un peu de nature et d'élégance avec ChezFlora",
    created_at: "2025-03-20 04:43:11",
    updated_at: "2025-03-20 04:43:11",
  },
  {
    id: 10,
    content_key: "hero_background_url",
    content_value: "/placeholder.svg?height=600&width=1920",
    created_at: "2025-03-20 04:43:11",
    updated_at: "2025-03-20 04:43:11",
  },
  {
    id: 8,
    content_key: "site_description",
    content_value:
      "Votre fleuriste artisanal, spécialisé dans les compositions florales élégantes et naturelles pour tous vos moments de vie.",
    created_at: "2025-03-20 04:43:11",
    updated_at: "2025-03-20 04:43:11",
  },
  {
    id: 9,
    content_key: "logo_url",
    content_value: "/placeholder.svg?height=50&width=150",
    created_at: "2025-03-20 04:43:11",
    updated_at: "2025-03-20 04:43:11",
  },
  {
    id: 13,
    content_key: "feature_delivery_title",
    content_value: "Livraison rapide",
    created_at: "2025-03-20 04:43:11",
    updated_at: "2025-03-20 04:43:11",
  },
  {
    id: 14,
    content_key: "feature_delivery_text",
    content_value: "Vos fleurs livrées en parfait état, dans les meilleurs délais",
    created_at: "2025-03-20 04:43:11",
    updated_at: "2025-03-20 04:43:11",
  },
  {
    id: 15,
    content_key: "feature_personalization_title",
    content_value: "Personnalisation",
    created_at: "2025-03-20 04:43:11",
    updated_at: "2025-03-20 04:43:11",
  },
  {
    id: 16,
    content_key: "feature_personalization_text",
    content_value: "Des bouquets sur mesure, adaptés à vos goûts et occasions",
    created_at: "2025-03-20 04:43:11",
    updated_at: "2025-03-20 04:43:11",
  },
  {
    id: 17,
    content_key: "feature_decoration_title",
    content_value: "Décoration florale",
    created_at: "2025-03-20 04:43:11",
    updated_at: "2025-03-20 04:43:11",
  },
  {
    id: 18,
    content_key: "feature_decoration_text",
    content_value: "Des créations uniques pour sublimer vos espaces et événements",
    created_at: "2025-03-20 04:43:11",
    updated_at: "2025-03-20 04:43:11",
  },
]

export default function ContentPage() {
  const [contents, setContents] = useState<SiteContent[]>(initialContents)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentContent, setCurrentContent] = useState<SiteContent | null>(null)
  const { toast } = useToast()

  const handleEditContent = () => {
    if (!currentContent) return

    const now = new Date().toISOString().replace("T", " ").substring(0, 19)
    const updatedContent = {
      ...currentContent,
      updated_at: now,
    }

    setContents(contents.map((content) => (content.id === currentContent.id ? updatedContent : content)))
    setIsEditDialogOpen(false)

    toast({
      title: "Content updated",
      description: `${currentContent.content_key} has been updated successfully.`,
    })
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
              {currentContent.content_key.includes("_url") ? (
                <div className="space-y-2">
                  <Label htmlFor="content_value">URL</Label>
                  <Input
                    id="content_value"
                    value={currentContent.content_value}
                    onChange={(e) => setCurrentContent({ ...currentContent, content_value: e.target.value })}
                  />
                  {currentContent.content_value && (
                    <div className="mt-2">
                      <p className="text-sm font-medium mb-1">Preview:</p>
                      <img
                        src={currentContent.content_value || "/placeholder.svg"}
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

