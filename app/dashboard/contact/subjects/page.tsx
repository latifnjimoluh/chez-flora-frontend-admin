"use client"

import { useState } from "react"
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

type ContactSubject = {
  id: number
  value: string
  label: string
  display_order: number
  created_at: string
  updated_at: string
}

const initialSubjects: ContactSubject[] = [
  {
    id: 1,
    value: "information",
    label: "Demande d'information",
    display_order: 1,
    created_at: "2025-03-18 02:29:03",
    updated_at: "2025-03-18 02:29:03",
  },
  {
    id: 2,
    value: "commande",
    label: "Question sur une commande",
    display_order: 2,
    created_at: "2025-03-18 02:29:03",
    updated_at: "2025-03-18 02:29:03",
  },
  {
    id: 3,
    value: "service",
    label: "Réservation de service",
    display_order: 3,
    created_at: "2025-03-18 02:29:03",
    updated_at: "2025-03-18 02:29:03",
  },
  {
    id: 4,
    value: "reclamation",
    label: "Réclamation",
    display_order: 4,
    created_at: "2025-03-18 02:29:03",
    updated_at: "2025-03-18 02:29:03",
  },
  {
    id: 5,
    value: "autre",
    label: "Autre",
    display_order: 5,
    created_at: "2025-03-18 02:29:03",
    updated_at: "2025-03-18 02:29:03",
  },
]

export default function ContactSubjectsPage() {
  const [subjects, setSubjects] = useState<ContactSubject[]>(initialSubjects)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentSubject, setCurrentSubject] = useState<ContactSubject | null>(null)
  const [newSubject, setNewSubject] = useState<Partial<ContactSubject>>({
    value: "",
    label: "",
    display_order: 0,
  })
  const { toast } = useToast()

  const handleAddSubject = () => {
    const id = Math.max(...subjects.map((subject) => subject.id)) + 1
    const now = new Date().toISOString().replace("T", " ").substring(0, 19)

    const subject: ContactSubject = {
      id,
      value: newSubject.value || "",
      label: newSubject.label || "",
      display_order: newSubject.display_order || subjects.length + 1,
      created_at: now,
      updated_at: now,
    }

    setSubjects([...subjects, subject])
    setNewSubject({
      value: "",
      label: "",
      display_order: 0,
    })
    setIsAddDialogOpen(false)

    toast({
      title: "Subject added",
      description: `"${subject.label}" has been added successfully.`,
    })
  }

  const handleEditSubject = () => {
    if (!currentSubject) return

    const now = new Date().toISOString().replace("T", " ").substring(0, 19)
    const updatedSubject = {
      ...currentSubject,
      updated_at: now,
    }

    setSubjects(subjects.map((subject) => (subject.id === currentSubject.id ? updatedSubject : subject)))
    setIsEditDialogOpen(false)

    toast({
      title: "Subject updated",
      description: `"${currentSubject.label}" has been updated successfully.`,
    })
  }

  const handleDeleteSubject = () => {
    if (!currentSubject) return

    setSubjects(subjects.filter((subject) => subject.id !== currentSubject.id))
    setIsDeleteDialogOpen(false)

    toast({
      title: "Subject deleted",
      description: `"${currentSubject.label}" has been deleted successfully.`,
    })
  }

  const moveOrder = (id: number, direction: "up" | "down") => {
    const subjectIndex = subjects.findIndex((subject) => subject.id === id)
    if (subjectIndex === -1) return

    const newSubjects = [...subjects]

    if (direction === "up" && subjectIndex > 0) {
      // Swap with the previous item
      const temp = newSubjects[subjectIndex].display_order
      newSubjects[subjectIndex].display_order = newSubjects[subjectIndex - 1].display_order
      newSubjects[subjectIndex - 1].display_order = temp

      // Also swap the items in the array for immediate visual feedback
      ;[newSubjects[subjectIndex], newSubjects[subjectIndex - 1]] = [
        newSubjects[subjectIndex - 1],
        newSubjects[subjectIndex],
      ]
    } else if (direction === "down" && subjectIndex < newSubjects.length - 1) {
      // Swap with the next item
      const temp = newSubjects[subjectIndex].display_order
      newSubjects[subjectIndex].display_order = newSubjects[subjectIndex + 1].display_order
      newSubjects[subjectIndex + 1].display_order = temp

      // Also swap the items in the array for immediate visual feedback
      ;[newSubjects[subjectIndex], newSubjects[subjectIndex + 1]] = [
        newSubjects[subjectIndex + 1],
        newSubjects[subjectIndex],
      ]
    }

    setSubjects(newSubjects)

    toast({
      title: "Order updated",
      description: `Subject moved ${direction}.`,
    })
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
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSubject}>Save</Button>
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubject}>Save Changes</Button>
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
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSubject}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

