"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, Heart, Trash2 } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"

type Comment = {
  id: number
  post_id: number
  user_id: number
  content: string
  likes: number
  created_at: string
  updated_at: string
  post_title?: string
  user_name?: string
}

const initialComments: Comment[] = [
  {
    id: 1,
    post_id: 1,
    user_id: 27,
    content: "test",
    likes: 0,
    created_at: "2025-03-18 15:29:24",
    updated_at: "2025-03-18 14:29:24",
    post_title: "Comment prendre soin de vos orchidées",
    user_name: "Nexus1 nexus",
  },
  {
    id: 2,
    post_id: 3,
    user_id: 27,
    content: "sdsf",
    likes: 1,
    created_at: "2025-03-18 15:38:11",
    updated_at: "2025-03-18 14:38:15",
    post_title: "Créer un jardin d'intérieur durable",
    user_name: "Nexus1 nexus",
  },
  {
    id: 3,
    post_id: 3,
    user_id: 27,
    content: "cetaitcool\n",
    likes: 1,
    created_at: "2025-03-18 15:40:42",
    updated_at: "2025-03-18 14:40:44",
    post_title: "Créer un jardin d'intérieur durable",
    user_name: "Nexus1 nexus",
  },
  {
    id: 4,
    post_id: 1,
    user_id: 27,
    content: "yo\n",
    likes: 0,
    created_at: "2025-03-18 16:12:10",
    updated_at: "2025-03-18 15:12:10",
    post_title: "Comment prendre soin de vos orchidées",
    user_name: "Nexus1 nexus",
  },
  {
    id: 5,
    post_id: 1,
    user_id: 27,
    content: "yo\n",
    likes: 0,
    created_at: "2025-03-18 16:12:18",
    updated_at: "2025-03-18 15:12:18",
    post_title: "Comment prendre soin de vos orchidées",
    user_name: "Nexus1 nexus",
  },
  {
    id: 6,
    post_id: 1,
    user_id: 27,
    content: "yess",
    likes: 0,
    created_at: "2025-03-18 16:15:42",
    updated_at: "2025-03-18 15:15:42",
    post_title: "Comment prendre soin de vos orchidées",
    user_name: "Nexus1 nexus",
  },
  {
    id: 7,
    post_id: 1,
    user_id: 27,
    content: "yp",
    likes: 0,
    created_at: "2025-03-18 16:18:03",
    updated_at: "2025-03-18 15:18:03",
    post_title: "Comment prendre soin de vos orchidées",
    user_name: "Nexus1 nexus",
  },
  {
    id: 8,
    post_id: 3,
    user_id: 27,
    content: "test",
    likes: 0,
    created_at: "2025-03-20 04:50:28",
    updated_at: "2025-03-20 03:50:39",
    post_title: "Créer un jardin d'intérieur durable",
    user_name: "Nexus1 nexus",
  },
]

export default function BlogCommentsPage() {
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentComment, setCurrentComment] = useState<Comment | null>(null)
  const { toast } = useToast()

  const handleDeleteComment = () => {
    if (!currentComment) return

    setComments(comments.filter((comment) => comment.id !== currentComment.id))
    setIsDeleteDialogOpen(false)

    toast({
      title: "Comment deleted",
      description: "The comment has been deleted successfully.",
    })
  }

  const columns: ColumnDef<Comment>[] = [
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
      accessorKey: "user_name",
      header: "User",
    },
    {
      accessorKey: "post_title",
      header: "Post",
      cell: ({ row }) => {
        const title = row.getValue("post_title") as string
        return <div className="max-w-xs truncate">{title}</div>
      },
    },
    {
      accessorKey: "content",
      header: "Comment",
      cell: ({ row }) => {
        const content = row.getValue("content") as string
        return <div className="max-w-xs truncate">{content}</div>
      },
    },
    {
      accessorKey: "likes",
      header: "Likes",
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
        const comment = row.original

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
                  setCurrentComment(comment)
                  setIsViewDialogOpen(true)
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentComment(comment)
                  setIsDeleteDialogOpen(true)
                }}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
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
      <div>
        <h1 className="text-3xl font-bold">Blog Comments</h1>
        <p className="text-muted-foreground">Manage comments on blog posts</p>
      </div>

      <div className="flex items-center space-x-4 bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-100 text-blue-800">Total</Badge>
          <span className="text-sm font-medium">{comments.length}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Heart className="h-4 w-4 text-red-500" />
          <span className="text-sm font-medium">
            {comments.reduce((sum, comment) => sum + comment.likes, 0)} total likes
          </span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={comments}
        searchColumn="content"
        searchPlaceholder="Search by comment content..."
      />

      {/* View Comment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Comment Details</DialogTitle>
            <DialogDescription>Comment by {currentComment?.user_name}</DialogDescription>
          </DialogHeader>
          {currentComment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">User</p>
                  <p className="font-medium">{currentComment.user_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p>{format(new Date(currentComment.created_at), "PPP p")}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Post</p>
                <p className="font-medium">{currentComment.post_title}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Comment</p>
                <Card>
                  <CardContent className="p-4">
                    <p className="whitespace-pre-wrap">{currentComment.content}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex items-center space-x-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>{currentComment.likes} likes</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setIsViewDialogOpen(false)
                setIsDeleteDialogOpen(true)
              }}
            >
              Delete Comment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Comment Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Comment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentComment && (
            <div className="py-4">
              <p>You are about to delete the following comment:</p>
              <p className="mt-2 text-sm text-muted-foreground">
                "{currentComment.content.substring(0, 100)}
                {currentComment.content.length > 100 ? "..." : ""}"
              </p>
              <p className="mt-2 text-sm">
                By <span className="font-medium">{currentComment.user_name}</span> on post{" "}
                <span className="font-medium">{currentComment.post_title}</span>
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteComment}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

