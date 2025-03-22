"use client"

import { useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Plus, Loader2 } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type User = {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  role: "admin" | "superadmin"
  status: "verification" | "active" | "blocked" | "deleted"
  created_at: string
}

interface AdminsPageProps {
  initialAdmins: User[]
  isLoading: boolean
  onAddAdmin: (userData: any) => Promise<void>
  onUpdateAdmin: (id: number, userData: any) => Promise<void>
  onDeleteAdmin: (id: number) => Promise<void>
  onToggleStatus: (id: number, status: "verification" | "active" | "blocked" | "deleted") => Promise<void>
}

export default function AdminsPage({
  initialAdmins,
  isLoading,
  onAddAdmin,
  onUpdateAdmin,
  onDeleteAdmin,
  onToggleStatus,
}: AdminsPageProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [currentAdmin, setCurrentAdmin] = useState<User | null>(null)
  const [newAdmin, setNewAdmin] = useState<Partial<User>>({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "admin",
    status: "verification",
  })
  const [newStatus, setNewStatus] = useState<"verification" | "active" | "blocked" | "deleted">("active")
  const [actionLoading, setActionLoading] = useState(false)

  const handleAddAdmin = async () => {
    if (!newAdmin.first_name || !newAdmin.last_name || !newAdmin.email || !newAdmin.phone) {
      return
    }

    setActionLoading(true)
    try {
      await onAddAdmin({
        ...newAdmin,
        password: newAdmin.password || "password123", // Mot de passe par défaut
      })
      setIsAddDialogOpen(false)
      setNewAdmin({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "admin",
        status: "verification",
        password: "",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleEditAdmin = async () => {
    if (!currentAdmin) return

    setActionLoading(true)
    try {
      await onUpdateAdmin(currentAdmin.id, {
        first_name: currentAdmin.first_name,
        last_name: currentAdmin.last_name,
        email: currentAdmin.email,
        phone: currentAdmin.phone,
        role: currentAdmin.role,
        status: currentAdmin.status,
      })
      setIsEditDialogOpen(false)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteAdmin = async () => {
    if (!currentAdmin) return

    setActionLoading(true)
    try {
      await onDeleteAdmin(currentAdmin.id)
      setIsDeleteDialogOpen(false)
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!currentAdmin) return

    setActionLoading(true)
    try {
      await onToggleStatus(currentAdmin.id, newStatus)
      setIsStatusDialogOpen(false)
    } finally {
      setActionLoading(false)
    }
  }

  const columns: ColumnDef<User>[] = [
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
      accessorKey: "first_name",
      header: "Prénom",
    },
    {
      accessorKey: "last_name",
      header: "Nom",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Téléphone",
    },
    {
      accessorKey: "role",
      header: "Rôle",
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return (
          <div
            className={`rounded-full px-2 py-1 text-xs inline-block text-center ${
              role === "superadmin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
            }`}
          >
            {role}
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.getValue("status") as string
        return (
          <div
            className={`rounded-full px-2 py-1 text-xs inline-block text-center ${
              status === "active"
                ? "bg-green-100 text-green-800"
                : status === "verification"
                  ? "bg-yellow-100 text-yellow-800"
                  : status === "blocked"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
            }`}
          >
            {status}
          </div>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date de création
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const admin = row.original
        const isSuperAdmin = admin.role === "superadmin"

        // Vérifier si l'utilisateur actuel est un superadmin
        const currentUserRole = typeof window !== "undefined" ? localStorage.getItem("role") : null
        const canEdit = currentUserRole === "superadmin" || !isSuperAdmin

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Ouvrir le menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setCurrentAdmin(admin)
                  setIsEditDialogOpen(true)
                }}
                disabled={!canEdit}
              >
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentAdmin(admin)
                  setNewStatus(admin.status)
                  setIsStatusDialogOpen(true)
                }}
                disabled={!canEdit}
              >
                Changer le statut
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setCurrentAdmin(admin)
                  setIsDeleteDialogOpen(true)
                }}
                className="text-red-600"
                disabled={!canEdit}
              >
                Supprimer
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
          <h1 className="text-3xl font-bold">Administrateurs</h1>
          <p className="text-muted-foreground">Gérer les comptes administrateurs</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un administrateur
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={initialAdmins}
          searchColumn="email"
          searchPlaceholder="Rechercher par email..."
        />
      )}

      {/* Ajouter un administrateur */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel administrateur</DialogTitle>
            <DialogDescription>
              Créer un nouveau compte administrateur. Cliquez sur enregistrer lorsque vous avez terminé.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom</Label>
                <Input
                  id="first_name"
                  value={newAdmin.first_name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom</Label>
                <Input
                  id="last_name"
                  value={newAdmin.last_name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newAdmin.email}
                onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={newAdmin.phone}
                onChange={(e) => setNewAdmin({ ...newAdmin, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={newAdmin.password}
                onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                placeholder="Laisser vide pour mot de passe par défaut"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select
                  value={newAdmin.role}
                  onValueChange={(value) => setNewAdmin({ ...newAdmin, role: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="superadmin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={newAdmin.status}
                  onValueChange={(value) => setNewAdmin({ ...newAdmin, status: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verification">Vérification</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="blocked">Bloqué</SelectItem>
                    <SelectItem value="deleted">Supprimé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={actionLoading}>
              Annuler
            </Button>
            <Button onClick={handleAddAdmin} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modifier un administrateur */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier l'administrateur</DialogTitle>
            <DialogDescription>
              Mettre à jour les informations de l'administrateur. Cliquez sur enregistrer lorsque vous avez terminé.
            </DialogDescription>
          </DialogHeader>
          {currentAdmin && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_first_name">Prénom</Label>
                  <Input
                    id="edit_first_name"
                    value={currentAdmin.first_name}
                    onChange={(e) => setCurrentAdmin({ ...currentAdmin, first_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_last_name">Nom</Label>
                  <Input
                    id="edit_last_name"
                    value={currentAdmin.last_name}
                    onChange={(e) => setCurrentAdmin({ ...currentAdmin, last_name: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={currentAdmin.email}
                  onChange={(e) => setCurrentAdmin({ ...currentAdmin, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_phone">Téléphone</Label>
                <Input
                  id="edit_phone"
                  value={currentAdmin.phone}
                  onChange={(e) => setCurrentAdmin({ ...currentAdmin, phone: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_role">Rôle</Label>
                  <Select
                    value={currentAdmin.role}
                    onValueChange={(value) => setCurrentAdmin({ ...currentAdmin, role: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="superadmin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_status">Statut</Label>
                  <Select
                    value={currentAdmin.status}
                    onValueChange={(value) => setCurrentAdmin({ ...currentAdmin, status: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="verification">Vérification</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="blocked">Bloqué</SelectItem>
                      <SelectItem value="deleted">Supprimé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={actionLoading}>
              Annuler
            </Button>
            <Button onClick={handleEditAdmin} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Changer le statut */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Changer le statut</DialogTitle>
            <DialogDescription>Modifier le statut de l'administrateur.</DialogDescription>
          </DialogHeader>
          {currentAdmin && (
            <div className="py-4">
              <div className="space-y-2">
                <Label htmlFor="status">Nouveau statut</Label>
                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="verification">Vérification</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="blocked">Bloqué</SelectItem>
                    <SelectItem value="deleted">Supprimé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)} disabled={actionLoading}>
              Annuler
            </Button>
            <Button onClick={handleToggleStatus} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                "Enregistrer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supprimer un administrateur */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Supprimer l'administrateur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet administrateur ? Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          {currentAdmin && (
            <div className="py-4">
              <p>
                Vous êtes sur le point de supprimer l'administrateur :{" "}
                <strong>
                  {currentAdmin.first_name} {currentAdmin.last_name}
                </strong>{" "}
                ({currentAdmin.email})
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={actionLoading}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteAdmin} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

