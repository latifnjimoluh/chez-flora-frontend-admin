"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Mail, Download } from "lucide-react"
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

type Subscriber = {
  id: number
  email: string
  status: "active" | "unsubscribed"
  created_at: string
  updated_at: string
}

const initialSubscribers: Subscriber[] = [
  {
    id: 1,
    email: "latifnjimoluh@gmail.com",
    status: "active",
    created_at: "2025-03-18 15:32:41",
    updated_at: "2025-03-18 15:32:41",
  },
  {
    id: 2,
    email: "sophie.martin@example.com",
    status: "active",
    created_at: "2025-03-10 09:15:22",
    updated_at: "2025-03-10 09:15:22",
  },
  {
    id: 3,
    email: "thomas.dubois@example.com",
    status: "active",
    created_at: "2025-03-11 14:22:05",
    updated_at: "2025-03-11 14:22:05",
  },
  {
    id: 4,
    email: "marie.leroy@example.com",
    status: "unsubscribed",
    created_at: "2025-03-05 11:45:30",
    updated_at: "2025-03-15 16:30:12",
  },
  {
    id: 5,
    email: "jean.dupont@example.com",
    status: "active",
    created_at: "2025-03-12 08:10:45",
    updated_at: "2025-03-12 08:10:45",
  },
]

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>(initialSubscribers)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentSubscriber, setCurrentSubscriber] = useState<Subscriber | null>(null)
  const { toast } = useToast()

  const handleDeleteSubscriber = () => {
    if (!currentSubscriber) return

    setSubscribers(subscribers.filter((subscriber) => subscriber.id !== currentSubscriber.id))
    setIsDeleteDialogOpen(false)

    toast({
      title: "Subscriber deleted",
      description: `${currentSubscriber.email} has been removed from the newsletter list.`,
    })
  }

  const toggleStatus = (id: number) => {
    setSubscribers(
      subscribers.map((subscriber) =>
        subscriber.id === id
          ? {
              ...subscriber,
              status: subscriber.status === "active" ? "unsubscribed" : "active",
              updated_at: new Date().toISOString().replace("T", " ").substring(0, 19),
            }
          : subscriber,
      ),
    )

    const subscriber = subscribers.find((s) => s.id === id)
    if (subscriber) {
      toast({
        title: subscriber.status === "active" ? "Subscriber unsubscribed" : "Subscriber activated",
        description: `${subscriber.email} has been ${subscriber.status === "active" ? "unsubscribed" : "reactivated"}.`,
      })
    }
  }

  const exportSubscribers = () => {
    // Filter only active subscribers
    const activeSubscribers = subscribers.filter((sub) => sub.status === "active")

    // Create CSV content
    const csvContent = [
      "id,email,status,created_at,updated_at",
      ...activeSubscribers.map(
        (sub) => `${sub.id},"${sub.email}",${sub.status},"${sub.created_at}","${sub.updated_at}"`,
      ),
    ].join("\n")

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `newsletter_subscribers_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Export successful",
      description: `${activeSubscribers.length} active subscribers exported to CSV.`,
    })
  }

  const columns: ColumnDef<Subscriber>[] = [
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
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <Badge variant={status === "active" ? "default" : "outline"}>
            {status === "active" ? "Active" : "Unsubscribed"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Subscribed On
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = row.getValue("created_at") as string
        return <div>{format(new Date(date), "PPP")}</div>
      },
    },
    {
      accessorKey: "updated_at",
      header: "Last Updated",
      cell: ({ row }) => {
        const date = row.getValue("updated_at") as string
        return <div>{format(new Date(date), "PPP")}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const subscriber = row.original

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
              <DropdownMenuItem onClick={() => toggleStatus(subscriber.id)}>
                {subscriber.status === "active" ? "Unsubscribe" : "Reactivate"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentSubscriber(subscriber)
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
          <h1 className="text-3xl font-bold">Newsletter Subscribers</h1>
          <p className="text-muted-foreground">Manage newsletter subscribers</p>
        </div>
        <Button onClick={exportSubscribers}>
          <Download className="mr-2 h-4 w-4" />
          Export Subscribers
        </Button>
      </div>

      <div className="flex items-center space-x-2 bg-muted/50 p-4 rounded-lg">
        <Mail className="h-5 w-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Total subscribers: <strong>{subscribers.filter((s) => s.status === "active").length} active</strong> /{" "}
          {subscribers.length} total
        </p>
      </div>

      <DataTable columns={columns} data={subscribers} searchColumn="email" searchPlaceholder="Search by email..." />

      {/* Delete Subscriber Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Subscriber</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subscriber? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentSubscriber && (
            <div className="py-4">
              <p>You are about to delete the following subscriber:</p>
              <p className="mt-2 font-medium">{currentSubscriber.email}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubscriber}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

