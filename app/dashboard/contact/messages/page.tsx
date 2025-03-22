"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Eye, Mail, Check, Archive } from "lucide-react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

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

const initialMessages: ContactMessage[] = [
  {
    id: 1,
    name: "Latif",
    email: "latifnjimoluh@gmail.com",
    phone: "658509963",
    subject: "service",
    message: "jiuty",
    status: "new",
    created_at: "2025-03-18 02:40:02",
    updated_at: "2025-03-18 02:40:02",
  },
  {
    id: 2,
    name: "Sophie Martin",
    email: "sophie.martin@example.com",
    phone: "0123456789",
    subject: "information",
    message:
      "Bonjour, j'aimerais savoir si vous proposez des livraisons le dimanche. Merci d'avance pour votre réponse.",
    status: "read",
    created_at: "2025-03-17 14:22:15",
    updated_at: "2025-03-17 15:30:45",
  },
  {
    id: 3,
    name: "Thomas Dubois",
    email: "thomas.dubois@example.com",
    phone: "0687654321",
    subject: "commande",
    message:
      "Bonjour, je n'ai toujours pas reçu ma commande #12345 passée il y a 3 jours. Pouvez-vous me donner des informations sur sa livraison ?",
    status: "replied",
    created_at: "2025-03-16 09:15:30",
    updated_at: "2025-03-16 11:45:22",
  },
  {
    id: 4,
    name: "Marie Leroy",
    email: "marie.leroy@example.com",
    phone: null,
    subject: "reclamation",
    message:
      "Bonjour, j'ai reçu mon bouquet aujourd'hui mais plusieurs fleurs étaient abîmées. J'aimerais un remboursement ou un remplacement. Merci.",
    status: "archived",
    created_at: "2025-03-15 16:40:10",
    updated_at: "2025-03-15 18:20:05",
  },
]

const subjectLabels: Record<string, string> = {
  information: "Demande d'information",
  commande: "Question sur une commande",
  service: "Réservation de service",
  reclamation: "Réclamation",
  autre: "Autre",
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>(initialMessages)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false)
  const [currentMessage, setCurrentMessage] = useState<ContactMessage | null>(null)
  const [replyText, setReplyText] = useState("")
  const { toast } = useToast()

  const updateMessageStatus = (id: number, status: "new" | "read" | "replied" | "archived") => {
    const now = new Date().toISOString().replace("T", " ").substring(0, 19)

    setMessages(messages.map((message) => (message.id === id ? { ...message, status, updated_at: now } : message)))

    const statusMessages = {
      new: "marked as new",
      read: "marked as read",
      replied: "marked as replied",
      archived: "archived",
    }

    toast({
      title: "Status updated",
      description: `Message has been ${statusMessages[status]}.`,
    })
  }

  const handleSendReply = () => {
    if (!currentMessage || !replyText.trim()) return

    updateMessageStatus(currentMessage.id, "replied")
    setIsReplyDialogOpen(false)
    setReplyText("")

    toast({
      title: "Reply sent",
      description: `Your reply to ${currentMessage.name} has been sent.`,
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "read":
        return "bg-green-100 text-green-800"
      case "replied":
        return "bg-purple-100 text-purple-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSubjectColor = (subject: string) => {
    switch (subject) {
      case "information":
        return "bg-blue-100 text-blue-800"
      case "commande":
        return "bg-green-100 text-green-800"
      case "service":
        return "bg-purple-100 text-purple-800"
      case "reclamation":
        return "bg-red-100 text-red-800"
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
        return <Badge className={getSubjectColor(subject)}>{subjectLabels[subject] || subject}</Badge>
      },
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => {
        const message = row.getValue("message") as string
        return <div className="max-w-xs truncate">{message}</div>
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return <Badge className={getStatusColor(status)}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
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
                    updateMessageStatus(message.id, "read")
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
                  if (message.status === "new") {
                    updateMessageStatus(message.id, "read")
                  }
                }}
              >
                <Mail className="mr-2 h-4 w-4" />
                Reply
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {message.status !== "read" && (
                <DropdownMenuItem onClick={() => updateMessageStatus(message.id, "read")}>
                  <Check className="mr-2 h-4 w-4" />
                  Mark as Read
                </DropdownMenuItem>
              )}
              {message.status !== "archived" && (
                <DropdownMenuItem onClick={() => updateMessageStatus(message.id, "archived")}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
              )}
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
        <p className="text-muted-foreground">Manage customer contact messages</p>
      </div>

      <div className="flex items-center space-x-4 bg-muted/50 p-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-100 text-blue-800">New</Badge>
          <span className="text-sm font-medium">{messages.filter((m) => m.status === "new").length}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-100 text-green-800">Read</Badge>
          <span className="text-sm font-medium">{messages.filter((m) => m.status === "read").length}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-purple-100 text-purple-800">Replied</Badge>
          <span className="text-sm font-medium">{messages.filter((m) => m.status === "replied").length}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-gray-100 text-gray-800">Archived</Badge>
          <span className="text-sm font-medium">{messages.filter((m) => m.status === "archived").length}</span>
        </div>
      </div>

      <DataTable columns={columns} data={messages} searchColumn="email" searchPlaceholder="Search by email..." />

      {/* View Message Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Message Details</DialogTitle>
            <DialogDescription>Message from {currentMessage?.name}</DialogDescription>
          </DialogHeader>
          {currentMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">From</Label>
                  <div className="font-medium">{currentMessage.name}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <div>{format(new Date(currentMessage.created_at), "PPP p")}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <div className="font-medium">{currentMessage.email}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <div>{currentMessage.phone || "Not provided"}</div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Subject</Label>
                <div>
                  <Badge className={getSubjectColor(currentMessage.subject)}>
                    {subjectLabels[currentMessage.subject] || currentMessage.subject}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Message</Label>
                <Card className="mt-1">
                  <CardContent className="p-4">
                    <p className="whitespace-pre-wrap">{currentMessage.message}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div>
                    <Badge className={getStatusColor(currentMessage.status)}>
                      {currentMessage.status.charAt(0).toUpperCase() + currentMessage.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsViewDialogOpen(false)
                      setIsReplyDialogOpen(true)
                    }}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Reply
                  </Button>
                  <Button variant="outline" onClick={() => updateMessageStatus(currentMessage.id, "archived")}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </Button>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Reply to Message</DialogTitle>
            <DialogDescription>Send a reply to {currentMessage?.name}</DialogDescription>
          </DialogHeader>
          {currentMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="to">To</Label>
                  <Input id="to" value={currentMessage.email} disabled />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={`Re: ${subjectLabels[currentMessage.subject] || currentMessage.subject}`}
                    disabled
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="original-message">Original Message</Label>
                <Card className="mt-1">
                  <CardContent className="p-4 text-sm text-muted-foreground">
                    <p className="whitespace-pre-wrap">{currentMessage.message}</p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea
                  id="reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply here..."
                  className="min-h-[150px]"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendReply}>Send Reply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

