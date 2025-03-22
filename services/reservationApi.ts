import axios from "axios"
import { getAuthToken } from "./adminApi"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

// Configuration de l'intercepteur pour ajouter le token à chaque requête
const reservationApi = axios.create({
  baseURL: `${apiUrl}/api/admin/reservations`,
})

// Ajouter un intercepteur pour inclure le token JWT dans les headers
reservationApi.interceptors.request.use(
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
export type Reservation = {
  id: number
  discussion_id: number
  client_id: number
  service_id: string
  prix: number
  dimension: string | null
  nb_personnes: number | null
  lieu: "intérieur" | "extérieur" | null
  statut: "réservé" | "annulé" | "en attente"
  date_evenement: string
  adresse: string | null
  details: string | null
  message_client: string | null
  date_reservation: string
  client_name?: string
  service_name?: string
}

// Récupérer toutes les réservations
export const getAllReservations = async (): Promise<Reservation[]> => {
  try {
    const response = await reservationApi.get("/")
    return response.data.data
  } catch (error: any) {
    console.error("Erreur lors de la récupération des réservations", error)
    throw error.response?.data || { message: "Impossible de récupérer les réservations." }
  }
}

// Récupérer une réservation par son ID
export const getReservationById = async (id: number): Promise<Reservation> => {
  try {
    const response = await reservationApi.get(`/${id}`)
    return response.data.data
  } catch (error: any) {
    console.error("Erreur lors de la récupération de la réservation", error)
    throw error.response?.data || { message: "Impossible de récupérer la réservation." }
  }
}

// Mettre à jour le statut d'une réservation
export const updateReservationStatus = async (
  id: number,
  status: "réservé" | "annulé" | "en attente"
): Promise<any> => {
  try {
    const response = await reservationApi.patch(`/${id}/status`, { statut: status })
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la mise à jour du statut de la réservation", error)
    throw error.response?.data || { message: "Impossible de mettre à jour le statut de la réservation." }
  }
}

// Supprimer une réservation
export const deleteReservation = async (id: number): Promise<any> => {
  try {
    const response = await reservationApi.delete(`/${id}`)
    return response.data
  } catch (error: any) {
    console.error("Erreur lors de la suppression de la réservation", error)
    throw error.response?.data || { message: "Impossible de supprimer la réservation." }
  }
}

export default {
  getAllReservations,
  getReservationById,
  updateReservationStatus,
  deleteReservation
}
