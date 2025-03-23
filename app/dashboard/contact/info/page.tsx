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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Phone, Mail, Clock } from "lucide-react"
import { contactInfoService, type ContactInfo } from "@/services/contactInfoService"

const infoTypes = [
  { value: "address", label: "Address", icon: "MapPin" },
  { value: "phone", label: "Phone", icon: "Phone" },
  { value: "email", label: "Email", icon: "Mail" },
  { value: "hours", label: "Business Hours", icon: "Clock" },
  { value: "social", label: "Social Media", icon: null },
  { value: "custom", label: "Custom", icon: null },
]

const iconOptions = [
  { value: "MapPin", label: "Map Pin" },
  { value: "Phone", label: "Phone" },
  { value: "Mail", label: "Mail" },
  { value: "Clock", label: "Clock" },
  { value: "Globe", label: "Globe" },
  { value: "Facebook", label: "Facebook" },
  { value: "Instagram", label: "Instagram" },
  { value: "Twitter", label: "Twitter" },
  { value: "Linkedin", label: "LinkedIn" },
]

export default function ContactInfoPage() {
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentInfo, setCurrentInfo] = useState<ContactInfo | null>(null)
  const [newInfo, setNewInfo] = useState<Partial<ContactInfo>>({
    type: "address",
    value: "",
    icon: "MapPin",
    display_order: 0,
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchContactInfo()
  }, [])

  const fetchContactInfo = async () => {
    try {
      setLoading(true)
      const response = await contactInfoService.getAllContactInfo()
      if (response.success) {
        setContactInfo(response.data as ContactInfo[])
      } else {
        throw new Error(response.message || "Failed to fetch contact info")
      }
    } catch (error) {
      console.error("Error fetching contact info:", error)
      toast({
        title: "Error",
        description: "Failed to load contact information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddInfo = async () => {
    try {
      setSubmitting(true)
      const response = await contactInfoService.createContactInfo(newInfo)

      if (response.success) {
        await fetchContactInfo()
        setIsAddDialogOpen(false)
        setNewInfo({
          type: "address",
          value: "",
          icon: "MapPin",
          display_order: 0,
        })

        toast({
          title: "Contact info added",
          description: `${response.data.type.charAt(0).toUpperCase() + response.data.type.slice(1)} information has been added successfully.`,
        })
      } else {
        throw new Error(response.message || "Failed to add contact info")
      }
    } catch (error) {
      console.error("Error adding contact info:", error)
      toast({
        title: "Error",
        description: "Failed to add contact information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }

    setTimeout(() => {
      window.location.reload()
    }, 2000)
    
  }

  const handleEditInfo = async () => {
    if (!currentInfo) return
  
    try {
      setSubmitting(true)
  
      const { type, value, icon, display_order } = currentInfo
      const response = await contactInfoService.updateContactInfo(currentInfo.id, {
        type,
        value,
        icon,
        display_order,
      })
  
      if (!response || response.success === false) {
        throw new Error(response.message || "Échec de l'opération")
      }
      
    } catch (error) {
      console.error("Error updating contact info:", error)
      toast({
        title: "Error",
        description: "Failed to update contact information. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
    setTimeout(() => {
      window.location.reload()
    }, 2000)
    
  }
  

  const handleDeleteInfo = async () => {
    if (!currentInfo) return

    try {
      setSubmitting(true)
      const response = await contactInfoService.deleteContactInfo(currentInfo.id)

      if (!response || response.success === false) {
        throw new Error(response.message || "Échec de l'opération")
      }
      
    } catch (error) {
      console.error("Error deleting contact info:", error)
      toast({
        title: "Error",
        description: "Failed to delete contact information. Please try again.",
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
      const response = await contactInfoService.updateDisplayOrder(id, direction)

      if (response.success) {
        await fetchContactInfo()

        toast({
          title: "Order updated",
          description: `Contact info moved ${direction}.`,
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

  const renderIcon = (iconName: string | null) => {
    if (!iconName) return null

    switch (iconName) {
      case "MapPin":
        return <MapPin className="h-4 w-4" />
      case "Phone":
        return <Phone className="h-4 w-4" />
      case "Mail":
        return <Mail className="h-4 w-4" />
      case "Clock":
        return <Clock className="h-4 w-4" />
      default:
        return null
    }
  }

  const columns: ColumnDef<ContactInfo>[] = [
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
                disabled={order === contactInfo.length}
              >
                <ArrowDown className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.getValue("type") as string
        return <div className="font-medium capitalize">{type}</div>
      },
    },
    {
      accessorKey: "value",
      header: "Value",
      cell: ({ row }) => {
        const value = row.getValue("value") as string
        return <div className="max-w-md whitespace-pre-wrap">{value}</div>
      },
    },
    {
      accessorKey: "icon",
      header: "Icon",
      cell: ({ row }) => {
        const icon = row.getValue("icon") as string
        return (
          <div className="flex items-center">
            {renderIcon(icon)}
            {icon && <span className="ml-2">{icon}</span>}
            {!icon && <span className="text-muted-foreground">None</span>}
          </div>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const info = row.original

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
                  setCurrentInfo(info)
                  setIsEditDialogOpen(true)
                }}
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentInfo(info)
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
          <h1 className="text-3xl font-bold">Contact Information</h1>
          <p className="text-muted-foreground">Manage business contact information</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Contact Info
        </Button>
      </div>

      <DataTable columns={columns} data={contactInfo} searchColumn="value" searchPlaceholder="Search by value..." />

      {/* Add Contact Info Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Contact Information</DialogTitle>
            <DialogDescription>Add new business contact information. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Information Type</Label>
              <Select
                value={newInfo.type}
                onValueChange={(value) => {
                  const selectedType = infoTypes.find((t) => t.value === value)
                  setNewInfo({
                    ...newInfo,
                    type: value,
                    icon: selectedType?.icon || null,
                  })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {infoTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              {newInfo.type === "hours" ? (
                <Textarea
                  id="value"
                  value={newInfo.value}
                  onChange={(e) => setNewInfo({ ...newInfo, value: e.target.value })}
                  placeholder={`Lundi - Vendredi: 9h00 - 19h00\nSamedi: 10h00 - 18h00\nDimanche: Fermé`}
                  className="min-h-[100px]"
                />
              ) : newInfo.type === "address" ? (
                <Textarea
                  id="value"
                  value={newInfo.value}
                  onChange={(e) => setNewInfo({ ...newInfo, value: e.target.value })}
                  placeholder="123 Rue des Fleurs\n75001 Paris, France"
                  className="min-h-[80px]"
                />
              ) : (
                <Input
                  id="value"
                  value={newInfo.value}
                  onChange={(e) => setNewInfo({ ...newInfo, value: e.target.value })}
                  placeholder={
                    newInfo.type === "phone" ? "01 23 45 67 89" : newInfo.type === "email" ? "contact@example.com" : ""
                  }
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Select
                value={newInfo.icon || "none"}
                onValueChange={(value) => setNewInfo({ ...newInfo, icon: value === "none" ? null : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {iconOptions.map((icon) => (
                    <SelectItem key={icon.value} value={icon.value}>
                      <div className="flex items-center">
                        {renderIcon(icon.value)}
                        <span className="ml-2">{icon.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={newInfo.display_order || contactInfo.length + 1}
                onChange={(e) => setNewInfo({ ...newInfo, display_order: Number.parseInt(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleAddInfo} disabled={submitting}>
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

      {/* Edit Contact Info Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Contact Information</DialogTitle>
            <DialogDescription>Update business contact information. Click save when you're done.</DialogDescription>
          </DialogHeader>
          {currentInfo && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_type">Information Type</Label>
                <Select
                  value={currentInfo.type}
                  onValueChange={(value) => {
                    const selectedType = infoTypes.find((t) => t.value === value)
                    setCurrentInfo({
                      ...currentInfo,
                      type: value,
                      icon: selectedType?.icon || null,
                    })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {infoTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_value">Value</Label>
                {currentInfo.type === "hours" || currentInfo.type === "address" ? (
                  <Textarea
                    id="edit_value"
                    value={currentInfo.value}
                    onChange={(e) => setCurrentInfo({ ...currentInfo, value: e.target.value })}
                    className="min-h-[100px]"
                  />
                ) : (
                  <Input
                    id="edit_value"
                    value={currentInfo.value}
                    onChange={(e) => setCurrentInfo({ ...currentInfo, value: e.target.value })}
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_icon">Icon</Label>
                <Select
                  value={currentInfo.icon || "none"}
                  onValueChange={(value) => setCurrentInfo({ ...currentInfo, icon: value === "none" ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select icon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon.value} value={icon.value}>
                        <div className="flex items-center">
                          {renderIcon(icon.value)}
                          <span className="ml-2">{icon.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_display_order">Display Order</Label>
                <Input
                  id="edit_display_order"
                  type="number"
                  value={currentInfo.display_order}
                  onChange={(e) => setCurrentInfo({ ...currentInfo, display_order: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleEditInfo} disabled={submitting}>
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

      {/* Delete Contact Info Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Contact Information</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact information? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentInfo && (
            <div className="py-4">
              <p>You are about to delete the following contact information:</p>
              <p className="mt-2 font-medium capitalize">
                {currentInfo.type}: {currentInfo.value.split("\n")[0]}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteInfo} disabled={submitting}>
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

