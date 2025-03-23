"use client"

import { useState, useEffect } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus, ArrowUp, ArrowDown } from "lucide-react"
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
import { useToast } from "@/hooks/use-toast"
import { contactSubjectService } from "@/services/contactSubjectService"

interface ContactSubject {
  id: number
  value: string
  label: string
  display_order: number
  created_at: string
  updated_at: string
}

export default function ContactSubjectsPage() {
  const [subjects, setSubjects] = useState<ContactSubject[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentSubject, setCurrentSubject] = useState<ContactSubject | null>(null)
  const [newSubject, setNewSubject] = useState<Partial<ContactSubject>>({
    value: "",
    label: "",
    display_order: 0,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const response = await contactSubjectService.getAllSubjects()
      if (response.success) {
        setSubjects(response.data)
      } else {
        throw new Error(response.message || "Failed to fetch subjects")
      }
    } catch (error) {
      console.error("Error fetching subjects:", error)
      toast({
        title: "Error",
        description: "Failed to load contact subjects. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddSubject = async () => {
    try {
      setSubmitting(true)
      const response = await contactSubjectService.createSubject(newSubject)

      if (response.success) {
        await fetchSubjects()
        setIsAddDialogOpen(false)
        setNewSubject({
          value: "",
          label: "",
          display_order: 0,
        })

        toast({
          title: "Subject added",
          description: `"${response.data.label}" has been added successfully.`,
        })
      } else {
        throw new Error(response.message || "Failed to add subject")
      }
    } catch (error) {
      console.error("Error adding subject:", error)
      toast({
        title: "Error",
        description: "Failed to add contact subject. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditSubject = async () => {
    if (!currentSubject) return

    try {
      setSubmitting(true)
      const response = await contactSubjectService.updateSubject(currentSubject.id, currentSubject)

      if (!response || response.success === false) {
        throw new Error(response.message || "Échec de l'opération")
      }
    } catch (error) {
      console.error("Error updating subject:", error)
      toast({
        title: "Error",
        description: "Failed to update contact subject. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
    setTimeout(() => {
      window.location.reload()
    }, 2000)
    
  }

  const handleDeleteSubject = async () => {
    if (!currentSubject) return

    try {
      setSubmitting(true)
      const response = await contactSubjectService.deleteSubject(currentSubject.id)

      if (!response || response.success === false) {
        throw new Error(response.message || "Échec de l'opération")
      }
    } catch (error) {
      console.error("Error deleting subject:", error)
      toast({
        title: "Error",
        description: "Failed to delete contact subject. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
    setTimeout(() => {
      window.location.reload()
    }, 2000)
    
  }

  const moveOrder = async (id: number, direction: "up" | "down") => {
    try {
      // Get the current subject and the one to swap with
      const currentIndex = subjects.findIndex((subject) => subject.id === id)
      if (currentIndex === -1) return

      const newSubjects = [...subjects]
      let targetIndex: number

      if (direction === "up" && currentIndex > 0) {
        targetIndex = currentIndex - 1
      } else if (direction === "down" && currentIndex < newSubjects.length - 1) {
        targetIndex = currentIndex + 1
      } else {
        return // Can't move further in this direction
      }

      // Prepare the orders to update
      const ordersToUpdate = [
        { id: newSubjects[currentIndex].id, display_order: newSubjects[targetIndex].display_order },
        { id: newSubjects[targetIndex].id, display_order: newSubjects[currentIndex].display_order },
      ]

      const response = await contactSubjectService.reorderSubjects(ordersToUpdate)

      if (response.success) {
        await fetchSubjects()

        toast({
          title: "Order updated",
          description: `Subject moved ${direction}.`,
        })
      } else {
        throw new Error(response.message || "Failed to update display order")
      }
    } catch (error) {
      console.error("Error updating display order:", error)
      toast({
        title: "Error",
        description: "Failed to update display order. Please try again.",
        variant: "destructive",
      })
    }
  }

  const columns: ColumnDef<ContactSubject>[] = [
    {
      accessorKey: "display_order",
      header: "Order",
      cell: ({ row }) => {
        const order = Number.parseInt(row.getValue("display_order"))
        const id = row.original.id

        return (
          <div className="flex items-center space-x-2">
            <span>{order}</span>
            <div className="flex flex-col">
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => moveOrder(id, "up")}
                disabled={order === 1}
              >
                <ArrowUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => moveOrder(id, "down")}
                disabled={order === subjects.length}
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "label",
      header: "Label",
      cell: ({ row }) => {
        const label = row.getValue("label") as string
        return <div className="font-medium">{label}</div>
      },
    },
    {
      accessorKey: "value",
      header: "Value",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const subject = row.original

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
                  setCurrentSubject(subject)
                  setIsEditDialogOpen(true)
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentSubject(subject)
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
          <h1 className="text-3xl font-bold">Contact Subjects</h1>
          <p className="text-muted-foreground">Manage contact form subjects</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subject
        </Button>
      </div>

      <DataTable columns={columns} data={subjects} searchColumn="label" searchPlaceholder="Search by label..." />

      {/* Add Subject Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Subject</DialogTitle>
            <DialogDescription>Create a new contact form subject. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label (displayed to users)</Label>
              <Input
                id="label"
                value={newSubject.label}
                onChange={(e) => setNewSubject({ ...newSubject, label: e.target.value })}
                placeholder="e.g. 'Demande d'information'"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value (used in code)</Label>
              <Input
                id="value"
                value={newSubject.value}
                onChange={(e) =>
                  setNewSubject({ ...newSubject, value: e.target.value.toLowerCase().replace(/\s+/g, "_") })
                }
                placeholder="e.g. 'information'"
              />
              <p className="text-xs text-muted-foreground">
                This will be automatically converted to lowercase with underscores.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={newSubject.display_order || subjects.length + 1}
                onChange={(e) => setNewSubject({ ...newSubject, display_order: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleAddSubject} disabled={submitting}>
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

      {/* Edit Subject Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>Update subject information. Click save when you're done.</DialogDescription>
          </DialogHeader>
          {currentSubject && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_label">Label (displayed to users)</Label>
                <Input
                  id="edit_label"
                  value={currentSubject.label}
                  onChange={(e) => setCurrentSubject({ ...currentSubject, label: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_value">Value (used in code)</Label>
                <Input
                  id="edit_value"
                  value={currentSubject.value}
                  onChange={(e) =>
                    setCurrentSubject({ ...currentSubject, value: e.target.value.toLowerCase().replace(/\s+/g, "_") })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  This will be automatically converted to lowercase with underscores.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_display_order">Display Order</Label>
                <Input
                  id="edit_display_order"
                  type="number"
                  value={currentSubject.display_order}
                  onChange={(e) =>
                    setCurrentSubject({ ...currentSubject, display_order: Number.parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleEditSubject} disabled={submitting}>
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

      {/* Delete Subject Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subject? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentSubject && (
            <div className="py-4">
              <p>You are about to delete the following subject:</p>
              <p className="mt-2 font-medium">{currentSubject.label}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubject} disabled={submitting}>
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
    </div>
  )
}

