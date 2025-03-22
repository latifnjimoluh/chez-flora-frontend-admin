"use client"

import { useState, useEffect } from "react"
import { getAllAdmins, createUser, updateUser, deleteUser, toggleUserStatus } from "@/services/adminApi"
import AdminsPage from "@/components/admin/admins-page"
import { useToast } from "@/hooks/use-toast"

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    setIsLoading(true)
    try {
      const data = await getAllAdmins()
      setAdmins(data)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de récupérer les administrateurs",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddAdmin = async (userData: any) => {
    try {
      // Assurer que le rôle est admin ou superadmin
      if (userData.role !== "admin" && userData.role !== "superadmin") {
        userData.role = "admin"
      }

      await createUser(userData)
      toast({
        title: "Succès",
        description: "Administrateur ajouté avec succès",
      })
      fetchAdmins()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter l'administrateur",
        variant: "destructive",
      })
    }
  }

  const handleUpdateAdmin = async (id: number, userData: any) => {
    try {
      await updateUser(id, userData)
      toast({
        title: "Succès",
        description: "Administrateur mis à jour avec succès",
      })
      fetchAdmins()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour l'administrateur",
        variant: "destructive",
      })
    }
  }

  const handleDeleteAdmin = async (id: number) => {
    try {
      await deleteUser(id)
      toast({
        title: "Succès",
        description: "Administrateur supprimé avec succès",
      })
      fetchAdmins()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'administrateur",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (id: number, status: "verification" | "active" | "blocked" | "deleted") => {
    try {
      await toggleUserStatus(id, status)
      toast({
        title: "Succès",
        description: `Statut de l'administrateur changé en ${status}`,
      })
      fetchAdmins()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de changer le statut de l'administrateur",
        variant: "destructive",
      })
    }
  }

  return (
    <AdminsPage
      initialAdmins={admins}
      isLoading={isLoading}
      onAddAdmin={handleAddAdmin}
      onUpdateAdmin={handleUpdateAdmin}
      onDeleteAdmin={handleDeleteAdmin}
      onToggleStatus={handleToggleStatus}
    />
  )
}

