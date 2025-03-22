"use client"

import { useState, useEffect } from "react"
import { getAllClients, createUser, updateUser, deleteUser, toggleUserStatus } from "@/services/adminApi"
import ClientsPage from "@/components/admin/clients-page"
import { useToast } from "@/hooks/use-toast"

export default function AdminClientsPage() {
  const [clients, setClients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    setIsLoading(true)
    try {
      const data = await getAllClients()
      setClients(data)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de récupérer les clients",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddClient = async (userData: any) => {
    try {
      // Assurer que le rôle est client
      const clientData = { ...userData, role: "client" }
      await createUser(clientData)
      toast({
        title: "Succès",
        description: "Client ajouté avec succès",
      })
      fetchClients()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'ajouter le client",
        variant: "destructive",
      })
    }
  }

  const handleUpdateClient = async (id: number, userData: any) => {
    try {
      await updateUser(id, userData)
      toast({
        title: "Succès",
        description: "Client mis à jour avec succès",
      })
      fetchClients()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le client",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClient = async (id: number) => {
    try {
      await deleteUser(id)
      toast({
        title: "Succès",
        description: "Client supprimé avec succès",
      })
      fetchClients()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le client",
        variant: "destructive",
      })
    }
  }

  const handleToggleStatus = async (id: number, status: "verification" | "active" | "blocked" | "deleted") => {
    try {
      await toggleUserStatus(id, status)
      toast({
        title: "Succès",
        description: `Statut du client changé en ${status}`,
      })
      fetchClients()
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de changer le statut du client",
        variant: "destructive",
      })
    }
  }

  return (
    <ClientsPage
      initialClients={clients}
      isLoading={isLoading}
      onAddClient={handleAddClient}
      onUpdateClient={handleUpdateClient}
      onDeleteClient={handleDeleteClient}
      onToggleStatus={handleToggleStatus}
    />
  )
}

