"use client"

import { useState, useEffect } from "react"
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
import newsletterService, { type NewsletterSubscriber } from "@/services/newsletterService"

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentSubscriber, setCurrentSubscriber] = useState<NewsletterSubscriber | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    setIsLoading(true)
    try {
      const data = await newsletterService.getAllSubscribers()
      setSubscribers(data)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch subscribers",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSubscriber = async () => {
    if (!currentSubscriber || !currentSubscriber.id) return

    try {
      await newsletterService.deleteSubscriber(currentSubscriber.id)

      setSubscribers(subscribers.filter((subscriber) => subscriber.id !== currentSubscriber.id))
      setIsDeleteDialogOpen(false)

      toast({
        title: "Subscriber deleted",
        description: `${currentSubscriber.email} has been removed from the newsletter list.`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete subscriber",
        variant: "destructive",
      })
    }
  }

  const toggleStatus = async (id: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "unsubscribed" : "active"
      await newsletterService.updateSubscriberStatus(id, newStatus as "active" | "unsubscribed")

      setSubscribers(
        subscribers.map((subscriber) =>
          subscriber.id === id ? { ...subscriber, status: newStatus as "active" | "unsubscribed" } : subscriber,
        ),
      )

      const subscriber = subscribers.find((s) => s.id === id)
      if (subscriber) {
        toast({
          title: currentStatus === "active" ? "Subscriber unsubscribed" : "Subscriber activated",
          description: `${subscriber.email} has been ${currentStatus === "active" ? "unsubscribed" : "reactivated"}.`,
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update subscriber status",
        variant: "destructive",
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

  const columns: ColumnDef<NewsletterSubscriber>[] = [
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
        return <div>{date ? format(new Date(date), "PPP") : "-"}</div>
      },
    },
    {
      accessorKey: "updated_at",
      header: "Last Updated",
      cell: ({ row }) => {
        const date = row.getValue("updated_at") as string
        return <div>{date ? format(new Date(date), "PPP") : "-"}</div>
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
              <DropdownMenuItem onClick={() => toggleStatus(subscriber.id!, subscriber.status)}>
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

      <DataTable
        columns={columns}
        data={subscribers}
        searchColumn="email"
        searchPlaceholder="Search by email..."
        isLoading={isLoading}
      />

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

