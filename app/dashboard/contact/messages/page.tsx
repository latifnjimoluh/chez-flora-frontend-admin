"use client"

import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, Reply } from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { contactMessageService } from "@/services/contactMessageService"

type ContactMessage = {
  id: number
  name: string
  email: string
  phone: string | null
  subject: string
  message: string
  status: "new" | "read" | "replied" | "archived"
  created_at: string
  updated_at: string
}

const subjectLabels: Record<string, string> = {
  information: "Demande d'information",
  commande: "Question sur une commande",
  service: "Réservation de service",
  reclamation: "Réclamation",
  autre: "Autre",
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentMessage, setCurrentMessage] = useState<ContactMessage | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    setIsLoading(true)
    try {
      const response = await contactMessageService.getAllMessages()
      if (response.success) {
        setMessages(response.data)
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch messages",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching messages",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (message: ContactMessage, status: "new" | "read" | "replied" | "archived") => {
    try {
      const response = await contactMessageService.updateMessageStatus(message.id, status)

      if (response.success) {
        setMessages(
          messages.map((msg) =>
            msg.id === message.id ? { ...msg, status, updated_at: new Date().toISOString() } : msg,
          ),
        )

        toast({
          title: "Status updated",
          description: `Message status has been updated to ${status}.`,
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update message status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating status",
        variant: "destructive",
      })
    }
  }

  const handleReply = async () => {
    if (!currentMessage || !replyContent.trim()) return

    try {
      const response = await contactMessageService.replyToMessage(currentMessage.id, replyContent)

      if (response.success) {
        // Update the message status to replied
        setMessages(
          messages.map((msg) =>
            msg.id === currentMessage.id ? { ...msg, status: "replied", updated_at: new Date().toISOString() } : msg,
          ),
        )

        setReplyContent("")
        setIsReplyDialogOpen(false)

        toast({
          title: "Reply sent",
          description: `Your reply has been sent to ${currentMessage.name}.`,
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to send reply",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while sending reply",
        variant: "destructive",
      })
    }
  }

  const handleDeleteMessage = async () => {
    if (!currentMessage) return

    try {
      const response = await contactMessageService.deleteMessage(currentMessage.id)

      if (response.success) {
        setMessages(messages.filter((msg) => msg.id !== currentMessage.id))
        setIsDeleteDialogOpen(false)

        toast({
          title: "Message deleted",
          description: "The message has been deleted successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete message",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting message",
        variant: "destructive",
      })
    }
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "read":
        return "bg-yellow-100 text-yellow-800"
      case "replied":
        return "bg-green-100 text-green-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const columns: ColumnDef<ContactMessage>[] = [
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
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => {
        const subject = row.getValue("subject") as string
        return <div>{subjectLabels[subject] || subject}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <div className={`rounded-full px-2 py-1 text-xs inline-block text-center ${getStatusBadgeClass(status)}`}>
            {status}
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Received
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const message = row.original

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
                  setCurrentMessage(message)
                  setIsViewDialogOpen(true)
                  if (message.status === "new") {
                    handleUpdateStatus(message, "read")
                  }
                }}
              >
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentMessage(message)
                  setIsReplyDialogOpen(true)
                }}
              >
                <Reply className="mr-2 h-4 w-4" />
                Reply
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {message.status !== "archived" && (
                <DropdownMenuItem onClick={() => handleUpdateStatus(message, "archived")}>Archive</DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  setCurrentMessage(message)
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
      <div>
        <h1 className="text-3xl font-bold">Contact Messages</h1>
        <p className="text-muted-foreground">Manage messages from the contact form</p>
      </div>

      <DataTable
        columns={columns}
        data={messages}
        searchColumn="email"
        searchPlaceholder="Search by email..."
        isLoading={isLoading}
      />

      {/* View Message Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>
              Message from {currentMessage?.name} ({currentMessage?.email})
            </DialogDescription>
          </DialogHeader>
          {currentMessage && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium">Name</div>
                      <div>{currentMessage.name}</div>
                    </div>
                    <div>
                      <div className="font-medium">Email</div>
                      <div>{currentMessage.email}</div>
                    </div>
                  </div>
                  {currentMessage.phone && (
                    <div>
                      <div className="font-medium">Phone</div>
                      <div>{currentMessage.phone}</div>
                    </div>
                  )}
                  <div>
                    <div className="font-medium">Subject</div>
                    <div>{subjectLabels[currentMessage.subject] || currentMessage.subject}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="whitespace-pre-wrap">{currentMessage.message}</div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Received</div>
                  <div>{new Date(currentMessage.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div
                    className={`rounded-full px-2 py-1 text-xs inline-block text-center ${getStatusBadgeClass(
                      currentMessage.status,
                    )}`}
                  >
                    {currentMessage.status}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false)
                setIsReplyDialogOpen(true)
              }}
            >
              <Reply className="mr-2 h-4 w-4" />
              Reply
            </Button>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
            <DialogDescription>
              Send a reply to {currentMessage?.name} ({currentMessage?.email})
            </DialogDescription>
          </DialogHeader>
          {currentMessage && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Original Message</Label>
                <div className="rounded-md border p-3 text-sm bg-muted/50">
                  <div className="font-medium">
                    Subject: {subjectLabels[currentMessage.subject] || currentMessage.subject}
                  </div>
                  <Separator className="my-2" />
                  <div className="whitespace-pre-wrap">{currentMessage.message}</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea
                  id="reply"
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[150px]"
                  placeholder="Type your reply here..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReply}>Send Reply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Message Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Message</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentMessage && (
            <div className="py-4">
              <p>
                You are about to delete a message from: <strong>{currentMessage.name}</strong>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Subject: {subjectLabels[currentMessage.subject] || currentMessage.subject}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMessage}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

