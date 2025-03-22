import axios from "axios"
import { getAuthToken } from "./adminApi"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Configuration de l'intercepteur pour ajouter le token à chaque requête
const orderApi = axios.create({
  baseURL: `${apiUrl}/api/admin/orders`,
})

// Ajouter un intercepteur pour inclure le token JWT dans les headers
orderApi.interceptors.request.use(
  (config) => {
    const token = getAuthToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Types
export type Order = {
  id_commande: string
  id_client: number
  adresse_livraison: string
  ville: string
  code_postal: string
  telephone: string
  email: string
  mode_livraison: "standard" | "express" | "aucune"
  mode_paiement: "card" | "paypal"
  message: string | null
  prix_total: number
  statut: "commandé" | "en attente de livraison" | "livré" | "annulé"
  date_commande: string
  date_annulation: string | null
  client_name?: string
  produits?: OrderDetail[]
}

export type OrderDetail = {
  id: number
  id_commande: string
  id_produit: string
  quantite: number
  prix_unitaire: number
  prix_total: number
  produit_nom?: string
  images?: string[]
}

// Récupérer toutes les commandes
export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const response = await orderApi.get("/")
    return response.data.data
  } catch (error: any) {
    console.error("Erreur lors de la récupération des commandes", error)
    throw error.response?.data || { message: "Impossible de récupérer les commandes." }
  }
}

// Récupérer une commande par son ID
export const getOrderById = async (id: string): Promise<Order> => {
  try {
    const response = await orderApi.get(`/${id}`)
    return response.data.data
  } catch (error: any) {
    console.error("Erreur lors de la récupération de la commande", error)
    throw error.response?.data || { message: "Impossible de récupérer la commande." }
  }
}

// Mettre à jour le statut d'une commande
export const updateOrderStatus = async (
  id: string,
  status: "commandé" | "en attente de livraison" | "livré" | "annulé"
): Promise<any> => {
  try {
    const response = await orderApi.patch(`/${id}/status`, { statut: status })
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du statut de la commande", error)
    throw error.response?.data || { message: "Impossible de mettre à jour le statut de la commande." }
  }
}

// Annuler une commande
export const cancelOrder = async (id: string): Promise<any> => {
  try {
    const response = await orderApi.delete(`/${id}`)
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de l'annulation de la commande", error)
    throw error.response?.data || { message: "Impossible d'annuler la commande." }
  }
}

export default {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
}
